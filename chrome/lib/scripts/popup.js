import BackStore from './core/background-store';

let config = {};
let currentTracking = {};
BackStore.Load(function(response) {
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
        //TODO: this is not what we want, this disables the whole stuff,
        //and we won't be able to display the infor for the user in options.
        //we need to manually reload the extension.
        //Create a separate issue for this
        //chrome.runtime.reload();
      });
    }
  });

document.getElementById('btn-options')
  .addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.extension.getURL('/views/options.html')
    });
  });
