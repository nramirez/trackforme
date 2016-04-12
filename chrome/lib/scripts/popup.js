import BackStore from './core/background-store';

let config = {};
let currentTracking = {};
BackStore.LoadUserSettings((response) => {
  config = response.config;
});

BackStore.LoadCurrentTracking((response) => {
  currentTracking = response.currentTracking;
  console.log(currentTracking);
});

document.querySelector('.btn-done')
  .addEventListener('click', (event) => {
    console.log('the done', config);
    if (currentTracking) {
      BackStore.PostTrackings(currentTracking, () => {
        chrome.tabs.create({
          url: chrome.extension.getURL('/views/options.html')
        });
      });
    }
  });

document.getElementById('btn-options')
  .addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.extension.getURL('/views/options.html')
    });
  });
