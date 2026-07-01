/**
 * score-editor-bridge.js
 * score-editor → flow-mind 連携ブリッジ
 *
 * 導入方法（score-editor-v2/index.html の </body> 直前に追加）:
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/score-editor-bridge.js"></script>
 *
 * 機能:
 *   1. BPM・コード進行から感情帯域（attractor）を逆算
 *   2. 楽曲データを is_transfer に書き込み → flow-mind でノード化
 *   3. 編集中の BPM・コードが変わるたびにリアルタイムで attractor を更新
 *   4. flow-mind の現在 attractor から BPM・調性のサジェストを生成
 */
(function() {
  'use strict';

  const ep = window.EmotionPhysics;
  if (!ep) { console.warn('[score-editor-bridge] EmotionPhysics が読み込まれていません'); return; }

  // ── コード進行 → 感情帯域（楽曲全体の雰囲気を多数決で推定）
  function analyzeChordProgression(chords) {
    if (!chords || !chords.length) return null;
    const bandCounts = {};
    chords.forEach(chord => {
      const type = detectChordType(chord);
      const band = ep.bandFromChord(type);
      bandCounts[band] = (bandCounts[band] || 0) + 1;
    });
    return Object.entries(bandCounts).sort((a, b) => b[1] - a[1])[0][0];
  }

  /** コード名からコード種別を判定 */
  function detectChordType(chordName) {
    if (!chordName) return 'major';
    const name = chordName.toLowerCase();
    if (name.includes('dim'))             return 'dim';
    if (name.includes('aug'))             return 'aug';
    if (name.includes('sus'))             return 'sus';
    if (name.includes('7') && !name.includes('maj7')) return 'dom7';
    if (name.includes('m') && !name.includes('maj'))  return 'minor';
    return 'major';
  }

  // ── スコアデータ全体を解析
  function analyzeScore(scoreData) {
    const bpm        = scoreData.bpm || 120;
    const chords     = scoreData.chords || [];
    const chordBand  = analyzeChordProgression(chords);
    const topChordType = chords.length ? detectChordType(chords[0]) : 'major';
    const { band, style } = ep.bandFromMusicParams(bpm, topChordType);

    // コード分析との合成
    const finalBand = chordBand === band
      ? band
      : (['delta','theta','alpha','beta','gamma'].indexOf(chordBand) > ['delta','theta','alpha','beta','gamma'].indexOf(band)
          ? chordBand : band);

    return {
      bpm,
      estimatedBand:  finalBand,
      style:          ep.BAND_STYLE[finalBand],
      chordBand,
      bpmBand:        ep.bandFromBpm(bpm),
      chordProgression: chords.join(' → '),
    };
  }

  // ── flow-mind から attractor を読んで BPM・調性をサジェスト
  function suggestMusicParams() {
    const state = ep.readFlowMindAttractor();
    if (!state?.attractor) return null;

    const band = state.attractor.band;
    const suggestions = {
      gamma: { bpmRange: [160, 200], key: 'Am / Dm / Em（短調・鋭い）', mood: '怒り・集中・緊張感' },
      beta:  { bpmRange: [120, 160], key: 'G / D / A（明るめ短調可）', mood: '思考・躍動・推進力' },
      alpha: { bpmRange: [80, 120],  key: 'C / F / G（長調・安定）',   mood: 'リラックス・充実感' },
      theta: { bpmRange: [60, 80],   key: 'Dm / Fm / Gm（暗い短調）',  mood: '不安・内省・夢想' },
      delta: { bpmRange: [40, 60],   key: 'Am / Cm（最暗・静謐）',     mood: '深い情動・眠り・虚無' },
    };

    const s = suggestions[band];
    return s ? {
      attractor:    state.attractor.label,
      band,
      bpmSuggestion: `${s.bpmRange[0]}–${s.bpmRange[1]} BPM`,
      keySuggestion: s.key,
      mood:          s.mood,
    } : null;
  }

  // ── 楽曲データを flow-mind へ送る
  function sendScoreToFlowMind(scoreData) {
    const analysis = analyzeScore(scoreData);

    ep.writeTransfer('score-editor', [{
      id:    scoreData.id || Date.now().toString(36),
      title: scoreData.title || '無題の楽曲',
      body:  `BPM:${analysis.bpm} / ${analysis.chordProgression || 'コードなし'} / 推定帯域:${analysis.style.label}`,
      bpm:   analysis.bpm,
      _emotionMeta: {
        band:        analysis.estimatedBand,
        label:       analysis.style.label,
        color:       analysis.style.color,
        bpm:         analysis.bpm,
        chordBand:   analysis.chordBand,
        timestamp:   Date.now(),
      },
    }], {
      band:      analysis.estimatedBand,
      label:     analysis.style.label,
      timestamp: Date.now(),
    });

    console.log('[score-editor-bridge] スコア送信:', analysis);
    return analysis;
  }

  // ── リアルタイム attractor インジケーター
  // BPM が変わるたびに onBpmChanged(bpm, chordType) を呼ぶ
  function createRealtimeIndicator() {
    const el = document.createElement('div');
    el.style.cssText = `
      display:inline-flex; align-items:center; gap:8px;
      font-size:13px; font-weight:700; padding:6px 14px;
      border-radius:100px; border:1px solid rgba(255,255,255,0.14);
      background:rgba(30,35,46,0.9); backdrop-filter:blur(8px);
    `;
    el.textContent = '— 帯域未計算';

    el.update = (bpm, chordType = 'major') => {
      const { band, style } = ep.bandFromMusicParams(bpm, chordType);
      el.style.color = style.color;
      el.style.borderColor = style.color + '55';
      el.textContent = `${style.label}  ${bpm} BPM`;
    };

    return el;
  }

  // ── flow-mind attractor サジェストUI
  function createSuggestPanel() {
    const el = document.createElement('div');
    el.style.cssText = `
      padding:12px 14px; border-radius:12px;
      border:1px solid rgba(245,200,66,0.3); background:rgba(245,200,66,0.06);
      font-size:13px; line-height:1.7;
    `;

    el.refresh = () => {
      const s = suggestMusicParams();
      if (!s) { el.style.display = 'none'; return; }
      el.style.display = 'block';
      el.innerHTML =
        `<div style="font-weight:800;color:#F5C842;margin-bottom:6px;">⬡ flow-mind → ${s.attractor}</div>` +
        `<div style="color:#9CA3AF;">BPM: <b style="color:#E8EAF0">${s.bpmSuggestion}</b></div>` +
        `<div style="color:#9CA3AF;">調性: <b style="color:#E8EAF0">${s.keySuggestion}</b></div>` +
        `<div style="color:#9CA3AF;">雰囲気: ${s.mood}</div>`;
    };

    el.refresh();
    setInterval(el.refresh, 2000);
    return el;
  }

  window.ScoreEditorBridge = {
    analyzeScore,
    analyzeChordProgression,
    detectChordType,
    suggestMusicParams,
    sendScoreToFlowMind,
    createRealtimeIndicator,
    createSuggestPanel,
  };

  console.log('[score-editor-bridge] loaded');
})();

