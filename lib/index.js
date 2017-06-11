var roaster = require('roaster');
var fs = require('fs');
var phantom = require('phantom');
var fileUrl = require('file-url');

/**
 * 引数に与えられた Markdown ファイルをレンダリングし、
 * レンダリング後の画像を返す
 *
 * @param {String} path - Markdown ファイルのパス
 * @param {Function} callback - 変換終了後、第一引数 contents に画像バイナリの Buffer を渡す関数
 */
function md2img(path, callback) {
  var mdContents = fs.readFileSync(path, 'utf8');
  roaster(mdContents, {}, function(err, htmlContents) {
    html2image(path, htmlContents, callback);
  });
}

/**
 * HTML 文字列を受けとり、レンダリング後の画像を返す
 *
 * @param {String} path - Markdown ファイルのパス
 * @param {String} html - HTML 文字列
 * @param {Function} callback - 変換終了後、第一引数 contents に画像バイナリの Buffer を渡す関数
 */
function html2image(path, html, callback) {
  var phInstance;
  var phPage;
  phantom.create(['--local-to-remote-url-access=true'])
    .then(function(instance) {
      phInstance = instance;
      return instance.createPage();
    })
    .then(function(page) {
      phPage = page;
      return phPage.open(fileUrl(path));
    })
    .then(function() {
      return phPage.property('viewportSize', { width: 980, height: 550 });
    })
    .then(function() {
      return phPage.property('url');
    })
    .then(function(url) {
      var baseStyle = fs.readFileSync(__dirname + '/../assets/base.css', 'utf8');
      var github = fs.readFileSync(require.resolve('github-markdown-css'), 'utf8');
      var style = '<style>' + baseStyle + github + '</style>';
      var body = '<div class="markdown-body">' + html + '</div>';

      return new Promise(function(resolve) {
        phPage.on('onLoadFinished', resolve);
        phPage.setContent(style + body, url);
      });
    })
    .then(function() {
      return phPage.renderBase64('PNG');
    })
    .then(function(imageBase64) {
      callback(new Buffer(imageBase64, 'base64'));
    })
    .catch(function(err) {
      console.error(err);
    })
    .then(function() {
      if (phPage) phPage.close();
      if (phInstance) phInstance.exit();
    });
}

module.exports = md2img;
