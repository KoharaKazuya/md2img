#!/usr/bin/env node

const md2img = require('../lib/index');
const yargs = require('yargs');

const args = yargs.argv._;

// コマンドの使い方を表示
function showUsage() {
  console.error('TODO');
  process.exit();
}

// コマンドライン引数が 2 つ以上だった場合、中断
if (args.length > 1) {
  showUsage();
}

// コマンドライン引数が渡されていない場合、デフォルトとして README.md を引数とする
let sourceFile;
if (args.length === 1) {
  [sourceFile] = args;
} else {
  sourceFile = 'README.md';
}

md2img(sourceFile, (contents) => {
  process.stdout.write(contents);
});
