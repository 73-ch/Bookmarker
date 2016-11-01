# tab extension
### コーディング規約
- インデントはtab1

### 必要な機能
- ブックマーク
- グループ化
- レベル
	- 常時（勝手に消えない）
	- あとで見る（一回見たら消える）
	- ちょいちょい（プロジェクト用）
- コマンド
- windowごとupdate
	- project単位
- 管理画面



### todo
- icon

- popup
    - 選択できるようにする
    - 1~4のボタンで作成とレベルの表示・変更(label)
    - favicon title url folder project
    - 検索を小さく
    - projectのwindow丸ごと作成のボタン

-　bookmark管理画面
    - title・url・level・projectの変更

- user_settings
    - result_max
    - folders
    - result種類
    - commands
        - command + i
            ブックマークの削除

        popupの中
        - command + 1~4
            各レベルのブックマークの作成
            レベルの変更
            * 4はproject用だからどのprojectに登録するか選べるようにする必要あり
        - command + p
            search_barのnameのprojectを作成
        - 上下キーとtab
            検索結果を選ぶ
        - enter
            選ばれている検索結果を現在のタブで開く
        - shift + enter
            選ばれている検索結果を新しいのタブで開く

