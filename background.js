chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.executeScript({ file: "app.js", allFrames: true })
})

var previewPostContextMenu = {
    "id": "previewPost",
    "title": "게시글 미리보기",
    "contexts": ["all"],
};

var previewKeyword

chrome.contextMenus.create(previewPostContextMenu)

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var req = {
        cmd: "previewPost"
    }; 
    chrome.tabs.sendMessage(tab.id, req);
});