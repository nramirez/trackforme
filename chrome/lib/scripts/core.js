/**
 * TrackForMe.
 */

var TrackForMe = function() {
  this.tracking = false;
}

TrackForMe.prototype.init = function() {
  var self = this;
  chrome.browserAction.onClicked.addListener(function() {
    //Fired when a browser action icon is clicked.
    //This event will not fire if the browser action has a popup.
    //self.showPopup();
    self.tracking = !self.tracking;
    self.setIcon(self.tracking ? 'active' : 'default');
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

module.exports = TrackForMe;
