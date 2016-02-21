var Store =  require('./store');
var options = Store.Load();

function displaySites() {
  chrome.storage.local.get('OPTIONS', function(opts){
    console.log(opts);
    options = opts.options;
  });
  var innerTable = '';
  if (!options.sites || Object.keys(options.sites).length == 0) {
    innerTable = '<tr><td colspan="2">Please add your sites.</td></tr>';
  } else {
    for(var k in options.sites) {
      var site = options.sites[k];
      innerTable += sideRow(site.img, site.url);
    }
  }
  document.getElementById('sites-tbody').innerHTML = innerTable;
}

var sideRow = function(previewUrl, siteUrl) {
  return [
    '<tr>',
      '<td>',
        '<div class="preview">',
          '<img src="',
          previewUrl,
          '" />',
        '</div>',
      '</td>',
      '<td>',
        siteUrl,
      '</td>',
      '<td class="td-without-border">',
        '<button class="cancel-btn" type="button">X</button>',
      '</td>',
    '</tr>'
  ].join('');
}

displaySites();
