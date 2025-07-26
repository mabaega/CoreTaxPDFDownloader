browser.browserAction.onClicked.addListener((tab) => {
  const scripts = [
    "libs/sweetalert2.all.min.js",
    "libs/qrcode.min.js",
    "content.js"
  ];

  scripts.forEach((file) => {
    browser.tabs.executeScript(tab.id, { file });
  });
});
