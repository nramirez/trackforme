import BackStore from './core/background-store';

let config = {};
BackStore.LoadUserSettings((response) => {
    config = response.config;
});

BackStore.IsTracking((response) => {
    if (response.isTracking) {
        document.getElementById('isNotTrackingBody').classList.add('none');
        document.getElementById('isTrackingBody').classList.remove('none');
    }
});

document.getElementById('btn-done').addEventListener('click', () => submitTrackings());

document.getElementById('btn-cancel').addEventListener('click', () => {
    BackStore.Reload();
    window.close();
});

document.getElementById('btn-options')
    .addEventListener('click', () => {
        BackStore.Reload();
        chrome.tabs.create({
            url: chrome.extension.getURL('/views/options.html')
        });
    });

document.getElementById('btn-start').addEventListener('click', () => {
    BackStore.StartTracking();
    window.close();
});

const submitTrackings = () => {
    BackStore.LoadCurrentTracking(({currentTrackings}) => {
        let waitingForImages = currentTrackings.find(t => !t.img);

        if (!waitingForImages) {
            BackStore.PostTrackings(currentTrackings, () => {
                chrome.tabs.create({
                    url: chrome.extension.getURL('/views/options.html')
                });
            });
        } else {
            document.getElementById('btn-done').classList.add('btn-disabled');
            document.getElementById('savingTrackingMessage').classList.remove('none');
            setTimeout(submitTrackings, 1000);
        }
    });
}
