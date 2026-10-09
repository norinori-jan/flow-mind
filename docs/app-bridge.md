# アプリ連携の型（quick-ref ⇄ flow-mind を、ほかのアプリに使い回すための記録）

作成日: 2026-10-09 ／ 元になったコード: flow-mind `index.html`（pollQuickRefSync / addNodeFromTransferItem / sendThoughtToQuickRef）
※ quick-ref 側のコードは今回確認できていません。送る側の書き方は、flow-mind が受け取る形から逆算して書いています。

## 1. 何が「財産」か

アプリごとに別々のデータを持ったまま、**1本の共通の郵便受け（sync-worker）を通して、決まった形のメモを渡し合う**仕組み。
quick-ref で書いたメモが flow-mind の考えの道筋になり、道筋の結論が quick-ref に戻って、また次のメモになる、という循環ができている。

```
quick-ref ──PUT /sync/quick-ref──▶ sync-worker(KV) ──GET──▶ flow-mind（ノード化）
quick-ref ◀──GET /sync/flow-mind-out── sync-worker(KV) ◀──PUT── flow-mind（決めたこと・次の一手）
```

## 2. 通信の決まり（sync-worker）

| 項目 | 内容 |
|---|---|
| 住所 | `<エンドポイント>/sync/<アプリ名>`（アプリ名は URL の最後の部分） |
| 認証 | `Authorization: Bearer <固定トークン>` |
| 書く | `PUT` で `{ data: { ... } }` を送る。KV に `{ timestamp, data }` で丸ごと保存される |
| 読む | `GET` で `{ data: { ... } }` が返る |
| 設定の置き場 | localStorage の `qr_sync_endpoint` / `qr_sync_token`（同じ origin の norinori-jan.github.io なので、アプリ間で共有される） |
| 注意 | トークンは使い回さない（Sheets用・CloudSync用・emotion-bridge用は別の値）。コードにも README にも書かない |

使っている郵便受けの名前:
- `quick-ref` … quick-ref のメモ一覧（`data.items[]`）
- `flow-mind` … flow-mind のグラフ全体（`data` がグラフの集まり。ノード単位の LWW マージ）
- `flow-mind-out` … flow-mind が quick-ref に返す考え（`data = { version: 1, thoughts: [...] }`、最新30件）

## 3. 渡すメモの形（quick-ref → flow-mind）

`data.items[]` の1件が持つもの（flow-mind が読んでいる項目）:

```
id            必須。重複取り込みを防ぐ鍵
title, body   本文は HTML でよい（受け取り側で文字に直す）
tags[]        'AI作成' 'まとまり' '用語' 'スライス' は特別扱い（下の規則）
sensitive     true なら取り込まない
origin.app    'flow-mind' なら取り込まない（循環防止）
ai.flowMind   { sentAt, refs[] }  利用者が「flow-mind へ」を押した印
ai.slice      { refs[] }          表のスライス用
```

受け取り側が作るノード（共通の取り込み口 `addNodeFromTransferItem`）:
`label(20字) / memo / tags / sourceApp / qrItemId / kind / cluster / triageStatus: 'inbox'`
取り込み直後は必ず未処理（inbox）で、利用者が確認して初めて「取り込み完了」になる。

## 4. 必ず守る規則（事故を防ぐ）

1. **重複防止**: 取り込んだ `item.id` を `flow_mind_imported_quickref_ids` に記憶し、2回目は無視する。
2. **機密は渡さない**: `sensitive` のメモは取り込まず、「見たことにして」記憶する。AI にも渡さない。
3. **循環防止**: `origin.app === 'flow-mind'` のものは取り込まない。返すときは必ず `origin.app` を付ける。
4. **AIが作ったものは、利用者が押したときだけ**: 自動では入れない。押されていないものは記憶せず見送る（あとで押されたら入る）。
   - 例外: タグ `違和感` が付いたメモ（quick-ref の ⚠️違和感 ボタン）は、自動で取り込む。flow-mind では「役割＝違和感・状態＝まだ・電荷80%」の未解決ノードになり、道筋ビューの起点になる（2026-10-09 追加）。
5. **HTML は DOMParser で文字にする**: タグを読み込んだり実行したりしない。
6. **画面に出すときは必ずエスケープ**: `escHtml()`（過去に抜けて直した）。
7. **同期は「pull → 編集 → push」を1セット**: 古いローカルから作業を続けると機能が消える事故が2回あった。

## 5. 新しいアプリをつなぐ手順（チェックリスト）

- [ ] 送る側: メモを `{ id, title, body, tags, sensitive }` の形にして、自分の名前の郵便受けへ `PUT`
- [ ] 受ける側: 起動時・画面に戻ったとき・60秒ごとに `GET`（`auto` のときは利用者が押したものだけ）
- [ ] 取り込み口は1つにする（`addNodeFromTransferItem` の形）。直接ノードを作らない
- [ ] 重複防止の記憶キーを、アプリごとに別名で作る
- [ ] 返す道があるなら、`<アプリ名>-out` の郵便受けと `origin.app` を付ける
- [ ] 機密は渡さない。暗号化したものは暗号化したまま扱う（`shared-core` の crypto-core）
- [ ] 実機で「保存→相手に出る→相手で操作→戻る」を1周確認する

## 6. 今わかっている弱点（将来の宿題）

- **sync-worker のソースが GitHub に無い**（過去の確認時点）。壊れたら再現できない。リポジトリ化が最優先。
- 郵便受けは「全体を丸ごと保存」なので、データが大きいアプリ（flow-mind）では 500 エラーのおそれがある。
- 固定トークン方式なので、端末を失くしたらトークンの作り直しが必要。
- quick-ref の関連スコアが 100% を超える不具合（847% など）が未解決。
- 同一ブラウザ内の `localStorage` 直結（emotion-bridge のローカル連携）と、端末をまたぐ sync-worker は**別の仕組み**。混ぜない。

## 7. 次に共通部品にするなら（案）

`shared-core` に `app-bridge.v1.js` を作り、次の3つだけを共通化する。
- `bridgePut(app, data)` / `bridgeGet(app)`（認証・エラー処理つき）
- `shouldImport(item, importedSet)`（規則 1〜4 をまとめて判定）
- `stripHtml(html)`（規則 5）
