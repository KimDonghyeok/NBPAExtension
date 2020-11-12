console.log("execute background script")

/*
chrome.tabs.onActivated.addListener(tab =>{
    chrome.tabs.get(tab.tabId, tabInfo => {
        if (/^https:\/\/www.google/.test(tabInfo.url)) {
            chrome.tabs.executeScript(null, {file: './js/content.js'}, () => console.log('script injected'))
        }
    })
})
*/

