const marked = require('marked');
const fs = require('fs');
const puppeteer = require('puppeteer');
const fileUrl = require('file-url');

/**
 * HTML 文字列を受けとり、レンダリング後の画像を返す
 *
 * @param {String} path - Markdown ファイルのパス
 * @param {String} html - HTML 文字列
 * @param {Function} callback - 変換終了後、第一引数 contents に画像バイナリの Buffer を渡す関数
 */
function html2image(path, html, callback) {
  puppeteer
    .launch()
    .then(async browser => {
      const page = await browser.newPage();
      await page.goto(fileUrl(path));
      await page.setViewport({ width: 980, height: 550 });

      const baseStyle = fs.readFileSync(
        `${__dirname}/../assets/base.css`,
        'utf8'
      );
      const github = fs.readFileSync(
        require.resolve('github-markdown-css'),
        'utf8'
      );
      const style = `<style>${baseStyle}${github}</style>`;
      const body = `<div class="markdown-body">${html}</div>`;
      await page.setContent(style + body);

      const buf = await page.screenshot({ fullPage: true });

      browser.close();
      callback(buf);
    })
    .catch(err => console.error(err));
}

/**
 * 引数に与えられた Markdown ファイルをレンダリングし、
 * レンダリング後の画像を返す
 *
 * @param {String} path - Markdown ファイルのパス
 * @param {Function} callback - 変換終了後、第一引数 contents に画像バイナリの Buffer を渡す関数
 */
function md2img(path, callback) {
  const mdContents = fs.readFileSync(path, 'utf8');
  marked(mdContents, {}, (err, htmlContents) => {
    html2image(path, htmlContents, callback);
  });
}

module.exports = md2img;
