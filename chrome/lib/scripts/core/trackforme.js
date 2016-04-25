/**
 * TrackForMe.
 */
class TrackForMe {
    constructor() {
        this._isTracking = false;
    }

    startTracking() {
        this._isTracking = true;
        this.setIcon('active');
        this.initForeground();
    }

    isTracking() {
        return this._isTracking;
    }

    showPopup() {
        chrome.browserAction.setPopup({
            popup: '/views/popup.html'
        });
    }

    reload() {
        this.setIcon('default');
        this.setBadge();
        this._isTracking = false;
    }

    setBadge(number) {
        chrome.browserAction.setBadgeText({
            text: '' + (number || '')
        });
    }

    setIcon(type) {
        if (!type) return;

        return chrome.browserAction.setIcon({
            path: '/img/' + type + '-icon.png'
        });
    }

    initForeground() {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {
                file: '/scripts/foreground.js'
            });
            chrome.tabs.insertCSS(tabs[0].id, {
                file: '/css/foreground.css'
            });
        });
    }
};

export default TrackForMe;
