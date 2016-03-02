module.exports = {
  Load() {
    var options = localStorage['TRACKFORME'];
    return !options ? this.Save({}) : JSON.parse(options);
  },
  Save(options) {
    localStorage['TRACKFORME'] = JSON.stringify(options);
    return options;
  }
}
