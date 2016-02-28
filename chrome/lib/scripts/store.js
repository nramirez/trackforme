module.exports = {
  Load: function() {
    var options = localStorage['TRACKFORME'];
    return !options ? this.Save({}) : JSON.parse(options);
  },
  Save: function(options) {
    localStorage['TRACKFORME'] = JSON.stringify(options);
    return options;
  }
}
