//Done
document.querySelector('.btn-done')
  .addEventListener('click', function(event) {
    chrome.browserAction.setBadgeText({
      text: ''
    });
    chrome.runtime.reload();
    window.close();
  });
