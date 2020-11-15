console.log("execute background script")

const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const SEARCH_NEXEARCH_REGEXP = new RegExp(/\?where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\?where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\&where\=blog/)

chrome.tabs.onUpdated.addListener(tabId => {
    chrome.tabs.get(tabId, tab => {
        chrome.tabs.sendMessage(tab.id, {url: tab.url})
        console.log(tab.url)
    })
})