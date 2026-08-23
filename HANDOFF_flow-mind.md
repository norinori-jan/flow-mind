# 引き継ぎメモ: flow-mind 開発状況（2026-08-23時点）

## このメモの位置づけ

このセッションでは、Claudeがコーディングエージェントに指示を出す形ではなく、**Claude自身が直接
index.html等を編集して実装**した。今後別のセッション・別のエージェントが作業を引き継ぐ場合は、
このメモと実際のファイルの中身を突き合わせて状況を把握すること。

---

## 完了した実装

### 1. manifest / Service Worker の分離修正
- 問題: `index.html`がquick-ref側の`manifest.json`・`sw.js`を誤って参照していた。
- 対応: `manifest.flow-mind.json`（flow-mind専用）を新規作成し、`index.html`の参照先を変更。
  `flow-mind-sw.js`（flow-mind専用Service Worker）を新規作成し、登録パスも合わせて修正。
- 追加対応: `flow-mind-sw.js`は当初「HTMLもキャッシュ優先」で作っていたため、index.html更新の
  たびにブラウザが古いキャッシュを返し続ける不具合が発覚。**v2で修正済み**：HTML(ナビゲーション
  リクエスト)は常にネットワーク優先、それ以外の静的ファイルはキャッシュ優先、という方式に変更。
  これにより以後は「Clear site data」を毎回する必要がなくなっているはず。

### 2. 初回起動時のオンボーディング追加
- localStorageキー`fm_onboarding_seen`が無いときのみ自動表示。3ステップ(＋追加/→接続/✎編集)。
- ヘッダーに「？」ボタンを追加し、いつでも再表示できる。
- 「ノード同士を接続すると自動でフローチャートのように整列する」という説明を明記
  (「フローチャートにならない」という当初の混乱への対応)。

### 3. Google Keep擬似同期（Google Drive経由・双方向）
- 新規ファイル `shared/drive-keep-sync.js`：Google Identity Services (GIS) のトークンクライアント
  方式で認可し、Drive上の`flow-mind-keep-sync`フォルダに1ノード＝1JSONファイルとして同期する。
  スコープは`drive.file`のみ(このアプリが作成したファイルにしか触れない)。
- OAuthクライアントID: `976527515292-e0kodj8bidtksuasiljj2fv64273q827.apps.googleusercontent.com`
  (同期シートの入力欄にデフォルト値として設定済み)
- ノード保存時・クイック記録時に自動push(800msデバウンス)、起動時+60秒間隔で自動pull。
- **既知の制約**: GISのトークンクライアント方式はリフレッシュトークンを持たないため、
  ページをリロードするたびに「🔑 連携を許可」を再度押す必要がある。バックエンドを持たない
  構成である以上、この制約は現状解消できない。
- **未解決の問題**: 「エラー 401: invalid_client / no registered origin」が発生中。
  Google Cloud Console側の当該クライアントIDに、テスト環境のオリジン(例: `http://127.0.0.1:5500`)を
  「承認済みJavaScript生成元」として追加する必要がある。この対応がユーザー側で完了しているか未確認。

### 4. UI改善（コピー機能・ラベル候補）
- ノード編集シートの「メモ」欄、クイック記録欄、AI分析結果に「📋 コピー」ボタンを追加。
- ノードのラベル入力(`#nLabel`)に、既存ノードのラベルを候補として出す`<datalist>`を追加。
- `env(safe-area-inset-*)`を使った全CSS(11箇所)にフォールバック値(`, 0px`)を追加。
  「⚡すぐ記録」ボタンがヘッダーと重なって見える不具合の防御的対応として実施。
  **ただし根本原因は未確定**。直っていなければ、該当ボタンを右クリック→検証で
  実際に適用されているCSSプロパティを確認する必要がある。

---

## 意思決定事項

- **Cloudflare Worker(CloudSync)とGoogle Keep(Drive経由)は両方残す方針。**
  一本化しない。Googleサービスのみに依存しない冗長性を意図的に確保する。
- flow-mindとquick-refは統合ではなく連携(emotion-bridge経由の一方向データ受け渡し)のみ。
  この方針は本セッション全体を通じて維持されている。

---

## 未対応・バックログ

### 優先度: 中
- **`SyncBridge.isConfigured is not a function`エラー**：`shared/sync-bridge.js`の実装が
  `index.html`側が期待するAPI(`isConfigured`等)と一致していない。実害はない
  (`init()`の最後で握りつぶされる形になっているため他の初期化処理をブロックしない)ため保留中だが、
  根本的にはsync-bridge.jsの実装を`index.html`側の期待に合わせて修正する必要がある。
- **Cloudflare Workerバックエンドが未実装**：`cloud-sync.js`が期待するAPI仕様
  (`PUT/GET {endpoint}/sync/{appName}`、Bearer token認証、KVストレージ想定)に対応する
  実際のWorkerコードがまだ書かれていない。これが無いと同期シートの「エンドポイントURL/トークン」欄は
  入力しても機能しない。必要になれば作成可能(仕様は把握済み)。

### 優先度: 低（対応しない方針で確定済み）
- 重みスライダーが5段階刻みのため、次の刻みまでドラッグしないと視覚的に動いて見えない
  (仕様通りの挙動であり、バグではない)。
- ノードカラー選択の反映が分かりにくい(実際は反映されているが、いつ適用されたか伝わりにくい)。

### 未着手（将来構想・今回は着手しない）
- Sticky Notes(Windows標準)連携
- Apple メモ連携(録音→Whisper文字起こし想定)
- quick-ref側のGoogle Keep連携(プロンプトB。`google_keep_drive_sync.md`に設計済みだが未実装。
  flow-mind側とは別ファイル・別モジュールとして実装する方針で設計済み)

---

## 次にやることの推奨順序

1. Google Cloud Consoleで承認済みJavaScript生成元に本番URL(またはテスト環境URL)を登録し、
   Google Keep連携のOAuthエラーを解消する
2. Google Keep連携の一連の動作(push/pull)を実機で最終確認する
3. `SyncBridge.isConfigured`エラーの根本対応(`sync-bridge.js`の実装確認・修正)
4. 必要になったタイミングでCloudflare Workerバックエンドを実装する
5. quick-ref側のGoogle Keep連携（プロンプトB）に着手するかどうかを判断する
