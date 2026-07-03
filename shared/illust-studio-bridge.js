/**
 * illust-studio-bridge.js
 * illust-studio → flow-mind 連携ブリッジ
 *
 * 導入方法（illust-studio/index.html の </body> 直前に追加）:
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/illust-studio-bridge.js"></script>
 *
 * 機能:
 *   1. 描画セッション開始時に flow-mind の attractor を読んでメタデータとして記録
 *   2. セッション中 attractor が変化するたびに履歴を蓄積
 *   3. 保存時に attractor 履歴を作品メタデータに埋め込む
 *   4. ストロークの圧力・速度から感情帯域を推定（タッチイベント版）
 *   5. ギャラリーで作品の attractor を可視化
 */
(function() {
  'use strict';

  const ep = window.EmotionPhysics;
  if (!ep) { console.warn('[illust-studio-bridge] EmotionPhysics が読み込まれていません'); return; }

  // ── 描画セッション管理
  class DrawingSession {
    constructor() {
      this.startTime       = Date.now();
      this.attractorHistory = [];  // [{ attractor, band, timestamp }]
      this.strokeFeatures  = [];   // [{ pressure, speed, length }]
      this._pollTimer      = null;
    }

    /** セッション開始 — attractor のポーリングを開始 */
    start() {
      // 初期 attractor を記録
      this._recordAttractor();
      // 3秒ごとに attractor 変化を記録
      this._pollTimer = setInterval(() => this._recordAttractor(), 3000);
      console.log('[illust-studio-bridge] セッション開始:', this.startTime);
    }

    /** セッション終了 */
    stop() {
      if (this._pollTimer) clearInterval(this._pollTimer);
      this._pollTimer = null;
    }

    /** flow-mind の attractor を記録 */
    _recordAttractor() {
      const state = ep.readFlowMindAttractor();
      if (!state?.attractor) return;
      const last = this.attractorHistory[this.attractorHistory.length - 1];
      // 変化があった場合のみ記録（無変化ポーリングノイズを除去）
      if (!last || last.band !== state.attractor.band) {
        this.attractorHistory.push({
          attractor: state.attractor.label,
          band:      state.attractor.band,
          color:     state.attractor.color,
          timestamp: Date.now(),
        });
      }
    }

    /** ストローク情報を記録（pointerup 時に呼ぶ） */
    recordStroke({ pressure = 0.5, speed = 1.0, length = 50 }) {
      this.strokeFeatures.push({ pressure, speed, length, timestamp: Date.now() });
      if (this.strokeFeatures.length > 100) this.strokeFeatures.shift();
    }

    /** ストロークの特徴量から感情帯域を推定 */
    estimateBandFromStrokes() {
      if (!this.strokeFeatures.length) return null;
      const recent = this.strokeFeatures.slice(-20);
      const avgPressure = recent.reduce((a, s) => a + s.pressure, 0) / recent.length;
      const avgSpeed    = recent.reduce((a, s) => a + s.speed, 0)    / recent.length;
      const avgLength   = recent.reduce((a, s) => a + s.length, 0)   / recent.length;

      // 圧力・速度・ストローク長をそれぞれ 0-1 に正規化して声特徴量に準用
      return ep.bandFromVoiceFeatures({
        rms:   Math.min(1, avgPressure),
        pitch: avgSpeed * 400,   // 速いストローク = 高ピッチ相当
        tempo: Math.min(8, avgLength / 10),
      });
    }

    /** セッションの代表 attractor（最も長く続いたもの） */
    getDominantAttractor() {
      if (!this.attractorHistory.length) return null;
      const durations = {};
      for (let i = 0; i < this.attractorHistory.length; i++) {
        const entry = this.attractorHistory[i];
        const next  = this.attractorHistory[i + 1];
        const dur   = (next?.timestamp || Date.now()) - entry.timestamp;
        const key   = entry.band;
        durations[key] = (durations[key] || 0) + dur;
      }
      const topBand = Object.entries(durations).sort((a, b) => b[1] - a[1])[0][0];
      return this.attractorHistory.find(h => h.band === topBand) || null;
    }

    /** 保存用メタデータを生成 */
    buildMetadata() {
      const dominant      = this.getDominantAttractor();
      const strokeBandRes = this.estimateBandFromStrokes();
      return {
        sessionStart:      this.startTime,
        sessionEnd:        Date.now(),
        durationMs:        Date.now() - this.startTime,
        attractorHistory:  this.attractorHistory,
        dominantAttractor: dominant,
        strokeBand:        strokeBandRes?.band || null,
        strokeLabel:       strokeBandRes ? ep.BAND_STYLE[strokeBandRes.band]?.label : null,
      };
    }
  }

  // ── 作品保存フック（既存の保存処理の末尾に呼ぶ）
  function onIllustSaved(illust, session) {
    const meta = session.buildMetadata();
    illust._emotionMeta = meta;
    session.stop();

    // is_emotion_transfer に書き込む
    ep.writeTransfer('illust-studio', [{
      id:    illust.id || Date.now().toString(36),
      title: illust.title || '無題のイラスト',
      body:  `描画時間: ${Math.round(meta.durationMs / 1000)}秒 / ` +
             `主要attractor: ${meta.dominantAttractor?.attractor || '未検出'} / ` +
             `ストローク帯域: ${meta.strokeLabel || '未計算'}`,
      _emotionMeta: meta,
    }], {
      band:      meta.dominantAttractor?.band || null,
      attractor: meta.dominantAttractor?.attractor || null,
      timestamp: Date.now(),
    });

    console.log('[illust-studio-bridge] 作品メタデータ:', meta);
    return meta;
  }

  // ── 描画中の attractor オーバーレイ（Canvas右上に表示）
  function createDrawingOverlay() {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; top:calc(env(safe-area-inset-top)+60px); right:12px;
      z-index:100; display:flex; flex-direction:column; align-items:flex-end; gap:6px;
      pointer-events:none;
    `;

    // flow-mind attractor
    const fmEl = document.createElement('div');
    fmEl.style.cssText = `
      font-size:11px; font-weight:700; padding:5px 12px; border-radius:100px;
      border:1px solid rgba(255,255,255,0.14); background:rgba(13,15,20,0.85);
      backdrop-filter:blur(8px); color:#6B7280;
    `;
    el.appendChild(fmEl);

    // ストローク帯域
    const strokeEl = document.createElement('div');
    strokeEl.style.cssText = fmEl.style.cssText;
    strokeEl.textContent = '✏️ ストローク計測中…';
    el.appendChild(strokeEl);

    let currentSession = null;

    function setSession(session) { currentSession = session; }

    function updateFm() {
      const state = ep.readFlowMindAttractor();
      if (state?.attractor) {
        const s = ep.BAND_STYLE[state.attractor.band] || {};
        fmEl.style.color = s.color;
        fmEl.textContent = `⬡ ${state.attractor.label}`;
      } else {
        fmEl.style.color = '#6B7280';
        fmEl.textContent = '⬡ flow-mind: 未検出';
      }

      if (currentSession) {
        const res = currentSession.estimateBandFromStrokes();
        if (res) {
          const s = ep.BAND_STYLE[res.band];
          strokeEl.style.color = s.color;
          strokeEl.textContent = `✏️ ${s.label}`;
        }
      }
    }

    setInterval(updateFm, 1500);
    el.setSession = setSession;
    return el;
  }

  // ── ギャラリー: 作品の attractor バッジをレンダリング
  function renderAttractorBadge(emotionMeta) {
    if (!emotionMeta?.dominantAttractor) return '';
    const { attractor, band, color } = emotionMeta.dominantAttractor;
    return `<span style="
      display:inline-flex; align-items:center; gap:4px;
      font-size:10px; font-weight:700; border-radius:100px;
      padding:2px 8px; border:1px solid ${color}55;
      color:${color}; background:${color}12;
    "><span style="width:5px;height:5px;border-radius:50%;background:${color};"></span>${attractor}</span>`;
  }

  // ── attractor 履歴タイムライン HTML（作品詳細に表示）
  function renderAttractorTimeline(emotionMeta) {
    if (!emotionMeta?.attractorHistory?.length) return '<div style="color:#6B7280;font-size:12px;">attractor履歴なし</div>';
    const items = emotionMeta.attractorHistory.map((h, i) => {
      const next = emotionMeta.attractorHistory[i + 1];
      const dur  = Math.round(((next?.timestamp || emotionMeta.sessionEnd) - h.timestamp) / 1000);
      const s    = ep.BAND_STYLE[h.band];
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0;"></span>
        <span style="font-size:12px;font-weight:700;color:${s.color};">${h.attractor}</span>
        <span style="font-size:11px;color:#6B7280;">${dur}秒</span>
        <span style="font-size:11px;color:#6B7280;margin-left:auto;">${new Date(h.timestamp).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
      </div>`;
    });
    return `<div style="font-size:11px;color:#6B7280;margin-bottom:6px;font-weight:700;letter-spacing:.04em;">ATTRACTOR 履歴</div>${items.join('')}`;
  }

  window.IllustStudioBridge = {
    DrawingSession,
    onIllustSaved,
    createDrawingOverlay,
    renderAttractorBadge,
    renderAttractorTimeline,
  };

  console.log('[illust-studio-bridge] loaded');
})();

