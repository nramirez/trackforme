var Store = require('./store');
var options = Store.Load();
var currentElements = options.currentTracking;

//Done
document.querySelector('.btn-done')
  .addEventListener('click', function(event) {
    if (options && currentElements) {
      options.sites = options.sites ? Object.assign(options.sites, currentElements) : currentElements;

      chrome.storage.local.set({
        'OPTIONS': options
      });

      console.log(options);

      if (!options.email)
        chrome.tabs.create({
          url: chrome.extension.getURL('/views/options.html')
        });

    } else {
      chrome.runtime.reload();
    }
  });

document.getElementById('btn-options')
  .addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.extension.getURL('/views/options.html')
    });
  });
