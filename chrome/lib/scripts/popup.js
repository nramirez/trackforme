import BackStore from './core/background-store';

let config = {};
let currentTracking = {};
BackStore.LoadUserSettings(function(response) {
  config = response.config;
});

BackStore.LoadCurrentTracking(function(response) {
  currentTracking = response.currentTracking;
  console.log(currentTracking);
});

document.querySelector('.btn-done')
  .addEventListener('click', function(event) {
    console.log('the done', config);
    if (currentTracking) {
      BackStore.SaveTrack(currentTracking, () => {
        chrome.tabs.create({
          url: chrome.extension.getURL('/views/options.html')
        });
      });
    }
  });

document.getElementById('btn-options')
  .addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.extension.getURL('/views/options.html')
    });
  });
