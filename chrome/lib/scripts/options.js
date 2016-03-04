import Store from './store';

var config = Store.load();

function displaySites() {
  var innerTable = '';
  if (!config.sites || Object.keys(config.sites).length == 0) {
    innerTable = '<tr><td colspan="2">Please add your sites.</td></tr>';
  } else {
    for(var k in config.sites) {
      var site = config.sites[k];
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
