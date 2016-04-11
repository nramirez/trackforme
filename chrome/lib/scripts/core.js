/**
 * TrackForMe.
 */
class TrackForMe {
    init() {
        let self = this;
        chrome.browserAction.onClicked.addListener(function() {
            self.showPopup();
            self.setIcon('active');
            self.initForeground();
        });
    }

    showPopup() {
        chrome.browserAction.setPopup({
            popup: '/views/popup.html'
        });
    }

    reload() {
        this.setIcon('default');
        this.removePopup();
    }

    removePopup() {
        chrome.browserAction.setPopup({
            popup: ''
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
