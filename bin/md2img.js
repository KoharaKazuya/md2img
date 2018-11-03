#!/usr/bin/env node

const md2img = require('../lib/index');
const yargs = require('yargs');

const argv = yargs
  .alias('h', 'help')
  .usage('$0 [md]', 'Convert markdown file into image', yargs => {
    yargs.positional('md', {
      describe: 'a markdown file',
      type: 'string'
    });
  }).argv;

// コマンドライン引数が渡されていない場合、デフォルトとして README.md を引数とする
const sourceFile = argv.md || 'README.md';
md2img(sourceFile, contents => {
  process.stdout.write(contents);
});
