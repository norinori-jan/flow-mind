# shared/emotion-physics — エコシステム統合ガイド

各アプリへのブリッジ導入方法と、データフローの全体像。

---

## ファイル構成

```
flow-mind/shared/
├── emotion-physics.js      # 共有コアモジュール（全アプリが参照）
├── quick-ref-bridge.js     # quick-ref 連携
├── vocal-lab-bridge.js     # vocal-lab-v3 連携
├── score-editor-bridge.js  # score-editor-v2 連携
└── illust-studio-bridge.js # illust-studio 連携
```

GitHub Pages URL（共通ベース）:
```
https://norinori-jan.github.io/flow-mind/shared/
```

---

## データフロー全体図

```
quick-ref ──────────────────────────────────────────┐
  テキストの感情キーワード → 帯域推定                  │
                                                      ▼
vocal-lab ───────────────────────────────────→  is_transfer  →  flow-mind
  RMS / ピッチ / テンポ → 帯域推定                              ↙ ↑
                                                      ↙         │
score-editor ─────────────────────────────→ is_transfer    fm_graphs
  BPM / コード進行 → attractor逆算              （emotionMeta付き）  │
                                                                │
illust-studio ──────────────────────────────────────────────────┘
  描画中の attractor 履歴 → 作品メタデータ保存
```

---

## 各アプリの導入方法

### quick-ref

```html
<!-- </body> 直前に追加 -->
<script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
<script src="https://norinori-jan.github.io/flow-mind/shared/quick-ref-bridge.js"></script>
```

**既存コードへの追記箇所:**

```js
// メモ保存処理の末尾に追加
function saveItem(item) {
  // ...既存の保存処理...

  // ブリッジ: 感情タグを付与して is_transfer に書き込む
  if (window.QuickRefBridge) {
    QuickRefBridge.onItemSaved(item);
  }
}

// メモカードの HTML に帯域チップを追加
function renderCard(item) {
  const chip = window.QuickRefBridge
    ? QuickRefBridge.renderEmotionChip(item._emotionMeta)
    : '';
  return `<div class="card">...${chip}</div>`;
}

// 設定・ヘッダーエリアに flow-mind attractor を表示
document.getElementById('header').appendChild(
  QuickRefBridge.createAttractorIndicator()
);
```

---

### vocal-lab-v3

```html
<!-- </body> 直前に追加 -->
<script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
<script src="https://norinori-jan.github.io/flow-mind/shared/vocal-lab-bridge.js"></script>
```

**既存コードへの追記箇所:**

```js
// 録音開始時（AudioContext, AnalyserNode が初期化済みの直後）
const bandIndicator = VocalLabBridge.createRealtimeBandIndicator(analyserNode);
document.getElementById('recordingControls').appendChild(bandIndicator);

// 録音停止・フレーズ保存時
async function savePhrase(phrase) {
  // ...既存の処理...

  // ブリッジ: 音声特徴量から帯域を推定して is_transfer に書き込む
  if (window.VocalLabBridge) {
    const features = {
      rms:   analyzerInstance.getRms(),
      pitch: analyzerInstance.getPitch(),
      tempo: 0, // 発話速度（省略可）
    };
    VocalLabBridge.onPhraseSaved(phrase, features);
    bandIndicator.stop(); // 録音終了でインジケーター停止
  }
}

// フレーズリストの各アイテムに帯域チップを表示
function renderPhraseItem(phrase) {
  const chip = window.VocalLabBridge
    ? VocalLabBridge.renderBandChip(phrase._emotionMeta)
    : '';
  return `<div class="phrase-item">${phrase.label}${chip}</div>`;
}
```

---

### score-editor-v2

```html
<!-- </body> 直前に追加 -->
<script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
<script src="https://norinori-jan.github.io/flow-mind/shared/score-editor-bridge.js"></script>
```

**既存コードへの追記箇所:**

```js
// BPM 変更時（既存の BPM 更新処理の末尾）
function onBpmChanged(newBpm) {
  bpm = newBpm;
  // ...既存処理...

  // ブリッジ: リアルタイム帯域インジケーターを更新
  if (window.bpmIndicator) {
    window.bpmIndicator.update(newBpm, currentChordType || 'major');
  }
}

// 初期化時にインジケーターとサジェストパネルを追加
const bpmIndicator = ScoreEditorBridge.createRealtimeIndicator();
document.getElementById('bpmControl').appendChild(bpmIndicator);
window.bpmIndicator = bpmIndicator;

const suggestPanel = ScoreEditorBridge.createSuggestPanel();
document.getElementById('sidebar').appendChild(suggestPanel);

// 保存・エクスポート時
function saveScore(scoreData) {
  // ...既存処理...
  if (window.ScoreEditorBridge) {
    ScoreEditorBridge.sendScoreToFlowMind(scoreData);
  }
}
```

---

### illust-studio

```html
<!-- </body> 直前に追加（draw/index.html と gallery/index.html 両方） -->
<script src="https://norinori-jan.github.io/flow-mind/shared/emotion-physics.js"></script>
<script src="https://norinori-jan.github.io/flow-mind/shared/illust-studio-bridge.js"></script>
```

**draw/index.html への追記:**

```js
// 描画開始時（既存の初期化処理の末尾）
const drawingSession = new IllustStudioBridge.DrawingSession();
drawingSession.start();

// オーバーレイを追加
const overlay = IllustStudioBridge.createDrawingOverlay();
overlay.setSession(drawingSession);
document.body.appendChild(overlay);

// ストローク終了時（pointerup の末尾）
canvas.addEventListener('pointerup', e => {
  // ...既存処理...
  drawingSession.recordStroke({
    pressure: e.pressure || 0.5,
    speed:    strokeSpeed,   // 既存のストローク速度計算があれば
    length:   strokeLength,  // 既存のストローク長計算があれば
  });
});

// 保存時
function saveIllust(illust) {
  // ...既存処理...
  if (window.IllustStudioBridge) {
    IllustStudioBridge.onIllustSaved(illust, drawingSession);
  }
}
```

**gallery/index.html への追記:**

```js
// ギャラリーアイテムのレンダリングに attractor バッジを追加
function renderGalleryItem(illust) {
  const badge = window.IllustStudioBridge
    ? IllustStudioBridge.renderAttractorBadge(illust._emotionMeta)
    : '';
  return `<div class="gallery-item">
    <img src="${illust.thumbnail}">
    <div class="gallery-meta">${illust.title}${badge}</div>
  </div>`;
}

// 作品詳細画面に attractor 履歴タイムラインを表示
function renderIllustDetail(illust) {
  const timeline = window.IllustStudioBridge
    ? IllustStudioBridge.renderAttractorTimeline(illust._emotionMeta)
    : '';
  return `<div class="detail">...${timeline}</div>`;
}
```

---

## is_transfer のデータ形式（拡張版）

ブリッジ導入後の `is_transfer` は以下の形式になります:

```json
{
  "source": "vocal-lab",
  "items": [
    {
      "id": "abc123",
      "title": "フレーズ1",
      "body": "帯域: γ波（怒り・集中）/ RMS:0.72 Pitch:280Hz",
      "_emotionMeta": {
        "band": "gamma",
        "label": "γ波（怒り・集中）",
        "color": "#FF5F5F",
        "features": { "rms": 0.72, "pitch": 280, "tempo": 6.2 },
        "timestamp": 1720000000000
      }
    }
  ],
  "emotionMeta": {
    "band": "gamma",
    "label": "γ波（怒り・集中）",
    "timestamp": 1720000000000
  },
  "timestamp": 1720000000000
}
```

flow-mind の `importFromTransfer()` はこの形式を自動で解釈し、ノード追加時に `_emotionMeta.color` をノードカラーとして使用します。

---

## flow-mind 側の対応（importFromTransfer の拡張）

flow-mind の `importFromTransfer()` に以下を追加すると、送信元の感情帯域をそのままノードカラーに反映できます:

```js
// flow-mind/index.html の importFromTransfer() 内
items.forEach((item, i) => {
  const meta = item._emotionMeta;
  // emotionMeta があればその色を使う、なければデフォルト
  const color = meta?.color || cols[i % cols.length];
  g.nodes[id] = {
    ...
    color,
    // 送信元の帯域情報を memo に自動付記
    memo: [
      item.body || '',
      meta ? `[${meta.label}]` : '',
    ].filter(Boolean).join(' '),
  };
});
```

