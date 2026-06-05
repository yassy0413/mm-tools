# mm tools

指定のワールドに所属するグラバトグループのギルドを、戦力降順で16x3のテーブルで表示します。

これはグラバトの戦力帯グループ分けの指標となります。

ギルドのセルをクリックすると、そのギルドに所属していて戦力ランキングにエントリーしているメンバーの戦闘力リストが表示されます。

# GitHub Pages 用の追加設定

## vite.config.cs

base: '/{repository-name}/',
build: {
outDir: 'docs',
},

## package.json

"homepage": "https://yassy0413.github.io/{repository-name}/",
を追加
