import Store from './store';

var config = Store.load();
var currentElements = config.currentTracking;

//Done
document.querySelector('.btn-done')
  .addEventListener('click', function(event) {
    console.log('the done', config);
      if (config && currentElements) {
        config.sites = config.sites ? Object.assign(config.sites, currentElements) : currentElements;

        Store.save(config);

        if (!config.email) {
          chrome.tabs.create({
            url: chrome.extension.getURL('/views/options.html')
          });
        } else {
          chrome.runtime.reload();
        }
      }
    });

document.getElementById('btn-options')
  .addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.extension.getURL('/views/options.html')
    });
  });
