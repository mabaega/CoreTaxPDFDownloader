chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "libs/sweetalert2.all.min.js",
      "libs/qrcode.min.js",
      "content.js"
    ]
  });
});
