/**
 * TrackForMe.
 */

var TrackForMe = function() {
  this.tracking = false;
}

TrackForMe.prototype.init = function() {
  var self = this;
  chrome.browserAction.onClicked.addListener(function() {
    self.showPopup();
    self.setIcon('active');
    self.initForeground();
  });
}

TrackForMe.prototype.showPopup = function() {
  chrome.browserAction.setPopup({
    popup: '/views/popup.html'
  });
};

TrackForMe.prototype.setIcon = function(type) {
  if (!type) return;

  return chrome.browserAction.setIcon({
    path: '/img/' + type + '-icon.png'
  });
};

TrackForMe.prototype.initForeground = function() {
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

module.exports = TrackForMe;
