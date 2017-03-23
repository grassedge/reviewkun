# reviewkun

### 構築

- [リポジトリ](https://github.com/hatz48/reviewkun) を clone
- コードをビルド
  - `npm install` して `npm run build`
- Gooleスプレッドシートの用意
  - 「どのチャンネルに」「何を」通知するかの情報を格納するスプレッドシートを用意します
  - [これ](https://docs.google.com/spreadsheets/d/1GDIBbMPDH_6786PrHZyCks3QxPgMSZ8HFQ4SzjJHlVc/edit?usp=sharing) をコピーする
- Google Apps Script にコードアップロード & プロパティ入力
  - Google Apps Script を作成して、ビルドしたコードをコピペ
  - ファイル->プロジェクトのプロパティ->スクリプトのプロパティで
    - SLACK_API_URL というキーで Slack API url を記入
    - spreadsheet_id というキーで上記のスプレッドシートの ID を記入
- web application として公開する
  - 公開->ウェブアプリケーションとして導入 からスクリプトを公開します
  - ここで取得できる url をあとで webhook に指定します

### 実際に動かす

- スプレッドシートにリポジトリと通知先チャンネルを記入
  - repository と channel の指定があれば動きます
  - label condition で指定した正規表現にマッチしたラベルがついたときに通知されます。デフォルトは `レビュー` です
- Github/Github Enterprise の webhook の設定
  - [https://github.com/{your}/{repository}/settings/hooks/new]
  - 上で取得したスクリプトの url を記入します
  - イベントは issue と pull request のみあればよさそうです
