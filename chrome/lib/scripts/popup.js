import BackStore from './background-store';

let config = {};
BackStore.Load(function(response) {
  config = response.config;
});

document.querySelector('.btn-done')
  .addEventListener('click', function(event) {
    let tracking = config.currentTracking;
    console.log('the done', config);
    if (config && tracking) {
      config.sites = config.sites ? Object.assign(config.sites, tracking) : tracking;

      BackStore.Save(config);

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
