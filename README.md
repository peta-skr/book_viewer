# book_viewer

画像（jpg・png）が入ったフォルダを1冊の本として登録し、ページをめくって読むデスクトップアプリ。Electron・React・SQLite（better-sqlite3）で作った。

## できること

- フォルダ選択ダイアログで画像フォルダを選び、タイトルを付けてライブラリに登録する。タイトルの初期値はフォルダ名
- フォルダ内の `.jpg` `.jpeg` `.png` を、ファイル名の数字を数値として比べる順（`1.jpg` → `2.png` → `10.jpeg`）に並べ、先頭の画像を表紙にする
- 登録済みのフォルダをもう一度登録しようとすると、上書きの確認ダイアログを出す。上書きするとタイトル・表紙・ページ数を更新し、読書位置を先頭に戻す
- ライブラリは表紙のカードを並べて表示する。表紙の画像は、画面に入ったカードの分だけ読み込む
- タイトルの部分一致検索（大文字と小文字を区別しない）。`Ctrl+F` / `Cmd+F` で検索欄に移り、`Esc` で検索語を消す
- 並び替え（タイトルの昇順・降順、登録日の新しい順・古い順）
- カードのメニューから名前の変更と登録解除ができる。登録解除はDBから消すだけで、画像ファイルには触らない
- リーダー画面では、ボタン・`←` `→` キー・スライダーでページを移動し、`F` キーで全画面表示を切り替える
- 開いているページをDBに保存し、次に開いたときはそのページから表示する
- 登録・変更・削除の結果をトーストで通知する

## 動かし方

`package.json` の scripts から確認したコマンド。Node.jsのバージョン指定はmanifestに無い。

```sh
npm install
npm run rebuild   # better-sqlite3 を Electron 向けに再ビルドする（electron-rebuild）
npm run dev       # tsc -w（main プロセス）・Vite（:5173）・Electron をまとめて起動する
```

ライブラリのDBは、起動したディレクトリの `data/library.sqlite3` に作られる（`.gitignore` で除外済み）。

`npm test` は実行しないこと。今のテスト（`electron/importer.test.ts`）はアプリと同じ `data/library.sqlite3` を開き、テストの前に全件を削除するので、登録した本の一覧が消える。テスト用のDBを分けるまでは、別のディレクトリで試す。

## 構成

```
electron/
  main.ts          ウィンドウの生成と、ipcMain.handle による IPC の受け口
  preload.ts       contextBridge で API を window.mangata として公開する
  importer.ts      フォルダの走査と、本・ページの登録/取得/更新/削除
  db.ts            better-sqlite3 の接続と books / images テーブルの作成
  importer.test.ts vitest のテスト（現状は scanFolder の1件）
src/
  screens/         Library（一覧）と Reader（閲覧）の2画面。HashRouter で切り替える
  hooks/           一覧の取得、検索と並び替え、登録・名前変更・削除、全画面などのカスタムフック
  components/      本のカード、検索バー、並び替え、各種モーダル
  services/        window.mangata の呼び出しをまとめた mangataClient
types/book.ts      main とレンダラで共有する型
dist-electron/     electron/ を tsc でビルドした JS（package.json の main が指す）
```

## 設計・実装のポイント

- ファイルとDBに触る処理はmainプロセスに置き、レンダラにはpreloadの `contextBridge.exposeInMainWorld` で必要な関数だけを渡している。レンダラ側でも `window.mangata` を各所で直接呼ぶのをやめ、`services/mangataClient.ts` を通すようにした（9019e06）
- 画像の渡し方を途中で変えた。mainプロセスでbase64のdata URLを作って渡す方式から、バイト列（`Uint8Array`）をIPCで返し、レンダラで `Blob` からObjectURLを作る方式にした（11e28a5）。表紙のサムネイルも同じ方式にし、`IntersectionObserver` で画面に入ったカードだけ読み込むようにした（4b8997a）
- リーダーは表示中のページの前後1ページを先読みする。表示中のページから4ページ以上離れたページのObjectURLは `URL.revokeObjectURL` で解放する
- ページを続けて送ると、前のページの読み込みが後から終わって表示を上書きしたり、キャッシュの掃除が新しいページの分まで消したりする競合があった。読み込みごとに連番のrequestIdを振り、最新でない読み込みの結果は表示にも掃除にも使わないようにした（a1c5536）
- 読書位置の保存には300msのデバウンスをかけ、ページを連続で送っても毎回はDBに書かない（b0b0e5a）
- 登録処理はbetter-sqlite3の `transaction` でまとめている。`books.folder_path` をUNIQUEにし、`ON CONFLICT DO UPDATE` で同じフォルダの再登録を更新として扱う
- 約400行あったLibrary画面を、一覧の取得・表示（検索と並び替え）・登録・名前変更・削除のフックと、モーダルのコンポーネントに分けた（83eff7c）

## 学んだこと

- Electronのmain / preload / rendererの役割分担と、`ipcMain.handle` / `ipcRenderer.invoke` によるIPCの組み方
- 画像のバイト列をObjectURLで表示し、使い終わったら解放するというメモリの扱い方
- 非同期の読み込み結果が順不同で返ってくるときに、古い結果を捨てる書き方
- 大きくなった画面コンポーネントからカスタムフックへ状態と処理を移し、画面を表示に専念させる分け方
