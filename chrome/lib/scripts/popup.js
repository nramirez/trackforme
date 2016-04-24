import BackStore from './core/background-store';

let config = {};
BackStore.LoadUserSettings((response) => {
    config = response.config;
});

document.getElementById('btn-done').addEventListener('click', event => submitTrackings());

document.getElementById('btn-options')
    .addEventListener('click', () => {
        chrome.tabs.create({
            url: chrome.extension.getURL('/views/options.html')
        });
    });

const submitTrackings = () => {
    BackStore.LoadCurrentTracking((response) => {
        var areAllImagesLoaded = Object.keys(response.currentTracking).find(key => !response.currentTracking[key].img);

        if (!areAllImagesLoaded) {
            if (response.currentTracking) {
                BackStore.PostTrackings(response.currentTracking, () => {
                    chrome.tabs.create({
                        url: chrome.extension.getURL('/views/options.html')
                    });
                });
            }
        } else {
            document.getElementById('btn-done').classList.add('btn-disabled');
            document.getElementById('savingTrackingMessage').classList.remove('none');
            setTimeout(submitTrackings, 1000);
        }
    });
}
