# 累積LDL-C シミュレーター

FH・非FHの累積LDL-Cを簡易推定し、治療開始・強化と現在値継続のシナリオを比較する静的Webアプリです。

## 実行

`index.html` をブラウザで開きます。HTML・JavaScriptのみで動作し、ビルドや依存パッケージの導入は不要です。入力値はブラウザ内で計算し、本アプリは保存・送信しません。

## GitHubへプッシュ

リポジトリ名の例：`ldl-exposure-simulator`

GitHubで空のリポジトリを作成後、このフォルダ内で実行します。`YOUR_ACCOUNT` は自分のGitHubアカウント名に置き換えてください。

```bash
git init
git add .
git commit -m "Initial version of cumulative LDL-C simulator"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/ldl-exposure-simulator.git
git push -u origin main
```

GitHub Desktopでは、このフォルダを追加してリポジトリを作成し、Publish repositoryからプッシュできます。

## GitHub Pagesで公開する場合

リポジトリの Settings → Pages で、Deploy from a branch → main → / (root) を選択して保存します。ソースのプッシュとWeb公開は別の操作です。

## 構成

- `index.html`：入力画面・スタイル・説明
- `app.js`：条件分岐・結果表示・SVGグラフ・CSV出力
- `model.js`：累積LDL-Cと閾値到達年齢の計算
- `.nojekyll`：GitHub Pages用

## 計算の位置づけ

研究・教育用の試作版です。出生から現在までのLDL-Cを入力情報から近似し、将来は設定した値が一定と仮定します。累積値と閾値到達年齢は心筋梗塞の発症年齢や安全な期間を予測しません。初期参考閾値10,000 mg/dL・年はシミュレーション用の任意の設定です。

FHは多田らの方法に基づく区分計算、非FHは年齢×現在LDL-C（eCLE）を用います。非FHで治療歴を補正する場合は拡張モデルです。

## 主要参考文献

- Tada H, et al. Circulation Journal. 2021;85:2073–2078. https://doi.org/10.1253/circj.CJ-21-0193
- Serikawa N, et al. International Journal of Cardiology. 2026;464:134781. https://doi.org/10.1016/j.ijcard.2026.134781

## このスナップショット

現在のWebアプリ（ソースコミット `18762acf2c162fa204209927c79bd4cba9127136`）のHTML・JavaScriptをそのまま収録しています。ホスティング固有の設定や認証情報は含みません。
