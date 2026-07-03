/**
 * vocal-lab-bridge.js
 * vocal-lab → flow-mind 連携ブリッジ
 *
 * 導入方法（vocal-lab-v3/index.html の </body> 直前に追加）:
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/vocal-lab-bridge.js"></script>
 *
 * 機能:
 *   1. 録音フレーズの音声特徴量（RMS・ピッチ・テンポ）から感情帯域を推定
 *   2. 推定帯域を is_emotion_transfer に書き込み → flow-mind でノード化
 *   3. 録音中に flow-mind の attractor をリアルタイム表示
 *   4. フレーズリストに感情帯域チップを表示
 *
 * 変更履歴:
 *   1.1.0 - getPitch()の自己相関計算(O(n²))を毎フレーム(60fps)呼んでいたのを
 *           150msごとに間引くよう修正（iPhoneでの発熱・カクつき対策）
 */
(function() {
  'use strict';

  const ep = window.EmotionPhysics;
  if (!ep) { console.warn('[vocal-lab-bridge] EmotionPhysics が読み込まれていません'); return; }

  // ── 音声特徴量の解析
  // AudioContext の AnalyserNode から RMS・ピッチを取得する
  class VoiceAnalyzer {
    constructor(analyserNode) {
      this.analyser = analyserNode;
      this.sampleRate = analyserNode.context.sampleRate;
      this.bufferSize = analyserNode.fftSize;
      this.timeData = new Float32Array(this.bufferSize);
      this.freqData = new Float32Array(analyserNode.frequencyBinCount);
      this.onsetTimes = [];  // テンポ推定用の発声オンセット
      // ピッチ推定は重い(O(n²))ので間引く
      this._lastPitchCalcAt = 0;
      this._lastPitchValue = 0;
      this._pitchIntervalMs = 150;
    }

    /** RMS（音量）を計算 (0-1) */
    getRms() {
      this.analyser.getFloatTimeDomainData(this.timeData);
      const sum = this.timeData.reduce((acc, v) => acc + v * v, 0);
      return Math.sqrt(sum / this.timeData.length);
    }

    /** 基本ピッチを推定（自己相関法・簡易版）(Hz)
     *  150msに1回だけ計算し、それ以外は前回値を返す。 */
    getPitch() {
      const now = Date.now();
      if (now - this._lastPitchCalcAt < this._pitchIntervalMs) {
        return this._lastPitchValue;
      }
      this._lastPitchCalcAt = now;

      this.analyser.getFloatTimeDomainData(this.timeData);
      const buf = this.timeData;
      const SIZE = buf.length;
      let bestCorr = 0, bestLag = -1;
      for (let lag = 20; lag < SIZE / 2; lag++) {
        let corr = 0;
        for (let i = 0; i < SIZE - lag; i++) corr += buf[i] * buf[i + lag];
        if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
      }
      this._lastPitchValue = bestLag > 0 ? this.sampleRate / bestLag : 0;
      return this._lastPitchValue;
    }

    /** 発声オンセットを検出してテンポ推定 (音節/秒) */
    detectOnset(rms) {
      const now = Date.now();
      if (rms > 0.15) {  // 発声しきい値
        const last = this.onsetTimes[this.onsetTimes.length - 1] || 0;
        if (now - last > 100) {  // 100ms 以内の再検出は無視
          this.onsetTimes.push(now);
          if (this.onsetTimes.length > 16) this.onsetTimes.shift();
        }
      }
      if (this.onsetTimes.length < 2) return 0;
      const spans = [];
      for (let i = 1; i < this.onsetTimes.length; i++) {
        spans.push(this.onsetTimes[i] - this.onsetTimes[i-1]);
      }
      const avgMs = spans.reduce((a, b) => a + b, 0) / spans.length;
      return avgMs > 0 ? 1000 / avgMs : 0;
    }

    /** 全特徴量をまとめて取得 */
    getFeatures() {
      const rms   = this.getRms();
      const pitch = this.getPitch();
      const tempo = this.detectOnset(rms);
      return { rms, pitch, tempo };
    }
  }

  // ── フレーズ保存フック
  // vocal-lab の「フレーズ保存」処理の末尾にこの関数を呼ぶ
  function onPhraseSaved(phrase, features) {
    // features がない場合はデフォルト値で推定
    const f = features || { rms: 0.5, pitch: 200, tempo: 4 };
    const { band, style } = ep.bandFromVoiceFeatures(f);

    const emotionMeta = {
      band,
      label: style.label,
      color: style.color,
      features: f,
      timestamp: Date.now(),
    };

    phrase._emotionMeta = emotionMeta;

    // is_emotion_transfer に書き込む
    ep.writeTransfer('vocal-lab', [{
      id:    phrase.id || Date.now().toString(36),
      title: phrase.label || phrase.text || 'フレーズ',
      body:  `帯域: ${style.label} / RMS:${f.rms.toFixed(2)} Pitch:${Math.round(f.pitch)}Hz Tempo:${f.tempo.toFixed(1)}音節/s`,
      _emotionMeta: emotionMeta,
    }], emotionMeta);

    console.log('[vocal-lab-bridge] 感情帯域推定:', emotionMeta);
    return emotionMeta;
  }

  // ── リアルタイム感情帯域インジケーター（録音中に表示）
  function createRealtimeBandIndicator(analyserNode) {
    const analyzer = new VoiceAnalyzer(analyserNode);
    const el = document.createElement('div');
    el.style.cssText = `
      display:flex; align-items:center; gap:8px; padding:8px 14px;
      border-radius:100px; border:1px solid rgba(255,255,255,0.14);
      background:rgba(30,35,46,0.9); font-size:13px; font-weight:700;
      backdrop-filter:blur(10px);
    `;

    let running = true;
    function loop() {
      if (!running) return;
      const features = analyzer.getFeatures();
      if (features.rms > 0.05) {
        const { band, style } = ep.bandFromVoiceFeatures(features);
        el.style.color = style.color;
        el.style.borderColor = style.color + '55';
        el.textContent = style.label;
      } else {
        el.style.color = '#6B7280';
        el.textContent = '無音';
      }
      requestAnimationFrame(loop);
    }
    loop();

    el.stop = () => { running = false; };
    return el;
  }

  // ── 帯域チップ HTML（フレーズリストに埋め込む）
  function renderBandChip(emotionMeta) {
    if (!emotionMeta?.band) return '';
    const style = ep.BAND_STYLE[emotionMeta.band];
    return `<span style="
      font-size:10px; font-weight:700; border-radius:100px;
      padding:2px 8px; border:1px solid ${style.color}55;
      color:${style.color}; background:${style.color}12;
    ">${style.label}</span>`;
  }

  // ── flow-mind attractor 表示（録音セッション画面上部に配置）
  function createAttractorDisplay() {
    const el = document.createElement('div');
    el.style.cssText = `
      font-size:12px; font-weight:700; color:#6B7280; padding:4px 0;
    `;
    function update() {
      const state = ep.readFlowMindAttractor();
      if (state?.attractor) {
        const style = ep.BAND_STYLE[state.attractor.band] || {};
        el.style.color = style.color || '#fff';
        el.textContent = `⬡ flow-mind: ${state.attractor.label}`;
      } else {
        el.style.color = '#6B7280';
        el.textContent = '⬡ flow-mind: 未検出';
      }
    }
    update();
    setInterval(update, 1500);
    return el;
  }

  window.VocalLabBridge = {
    VoiceAnalyzer,
    onPhraseSaved,
    createRealtimeBandIndicator,
    renderBandChip,
    createAttractorDisplay,
  };

  console.log('[vocal-lab-bridge] loaded');
})();

