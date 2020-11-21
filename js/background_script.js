console.log("execute background script")

/**
 * 탭의 정보를 가져와야 하는 작업은 백그라운드 스크립트에서 처리
 * 콘텐츠 페이지의 정보를 출력하거나 콘텐츠 페이지의 정로를 얻어서 처리해야 하는 작업은 콘텐츠 스크립트에서 처리
 */

/* ------------------------------ 상수정의 ------------------------------ */
const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const BLOG_NAVER_REGEXP_NOT_SECURE = new RegExp(/^http:\/\/blog\.naver\.com/)
const SEARCH_XEARCH_REGEXP = new RegExp(/\where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\where\=blog/)

const SEARCH_XEARCH_CODE = "_search_xearch"
const SEARCH_VIEW_CODE = "_search_view_all"
const SEARCH_BLOG_CODE = "_search_view_blog"
const BLOG_NAVER_CODE = "_blog_naver"

// const HOST_IP = "nbpa.ddns.net"
// const HOST_PORT = "33067"

const HOST_IP = "127.0.0.1"
const HOST_PORT = "8080"

const HOST_URL_HEAD = "http://" + HOST_IP + ":" + HOST_PORT + "/request/"

/* ------------------------------ 변수정의 ------------------------------ */
let showSearchNaverPopupRule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'search.naver.com', schemes: ['https']}
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
}

let showBlogNaverPopupRule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'blog.naver.com', schemes: ['https']}
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
}

let showBlogNaverPopupRule_NotSecure = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'blog.naver.com', schemes: ['http']}
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
}

// 서버와 통신하기 위한 XMLHttpRequest 객체
let xhr = new XMLHttpRequest();

let json_data;
let arr_received_data = []

/* ------------------------------ 이벤트처리기 ------------------------------ */
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([showSearchNaverPopupRule, showBlogNaverPopupRule, showBlogNaverPopupRule_NotSecure]);
    })
})

chrome.pageAction.onClicked.addListener(tab => {

    let current_tab_id = tab.id
    let current_tab_url = tab.url
    let tab_code = getTabCode(current_tab_url)

    if (tab_code === SEARCH_XEARCH_CODE || tab_code === SEARCH_VIEW_CODE || tab_code === SEARCH_BLOG_CODE) {
        chrome.pageAction.setPopup({tabId: current_tab_id, popup: "search_naver_popup.html"})
    }
    if (tab_code === BLOG_NAVER_CODE) {
        chrome.pageAction.setPopup({tabId: current_tab_id, popup: "blog_naver_popup.html"})
    }

    console.log(tab_code)
})

chrome.webNavigation.onCompleted.addListener(details => {
    if (details.frameId === 0) {
        chrome.tabs.get(details.tabId, updateTab => {
            let updateTabUrl = updateTab.url
            let tabCode = getTabCode(updateTabUrl);

            console.log(`currentUrl: ${updateTabUrl}
tabCode: ${tabCode}`)

            if (tabCode === SEARCH_XEARCH_CODE || tabCode === SEARCH_VIEW_CODE || tabCode === SEARCH_BLOG_CODE) {
                chrome.tabs.sendMessage(details.tabId, {
                    message: "TABCODE",
                    code: tabCode,
                    url: updateTabUrl
                })
            }
            else if (tabCode === BLOG_NAVER_CODE) {

            }
        })
    }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "URLDATA") {
        let tabId = sender.tab.id

        json_data = message.data
        console.log(JSON.parse(json_data))

        // 콘텐츠 스크립트로부터 받은 URL 데이터를 서버로 전송 -> 서버로부터 분석정보를 수신하여 콘텐츠 스크립트로 전달
        getAnalyzedInfo(tabId, json_data)
    }
})


/* ------------------------------ 함수정의 ------------------------------ */
let getTabCode = (current_url) => {
    let code

    if (SEARCH_NAVER_REGEXP.test(current_url)) {
        if (SEARCH_XEARCH_REGEXP.test(current_url)) {
            code = SEARCH_XEARCH_CODE
            return code
        }
        else if (SEARCH_VIEW_REGEXP.test(current_url)) {
            code = SEARCH_VIEW_CODE
            return code
        }
        else if (SEARCH_BLOG_REGEXP.test(current_url)) {
            code = SEARCH_BLOG_CODE
            return code
        }
    }
    else if (BLOG_NAVER_REGEXP.test(current_url)) {
        code = BLOG_NAVER_CODE
        return code
    }
    else if (BLOG_NAVER_REGEXP_NOT_SECURE.test(current_url)) {
        code = BLOG_NAVER_CODE
        return code
    }
}

let getAnalyzedInfo = (tabId, json) => {
    // 백그라운드 스크립트에서 받은 JSON 을 서버로 전송 -> 서버로부터 분석정보를 받아와서 유효한 정보일경우 콘텐츠 스크립트로 전송

    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
            const received_arr = JSON.parse(xhr.response)

            let header;

            received_arr.forEach( (element, index) => {
                if (index === 0)
                    header = element
                else
                    arr_received_data.push(element)
            })

            if (header.success === "True") {
                // 헤더가 True 일 경우 콘텐츠 스크립트로 데이터 전송
                chrome.tabs.sendMessage(tabId, {
                    message: "ANALYZEINFO",
                    data: arr_received_data
                })
            }

        } else {
            console.error(xhr.responseText);
        }
    }

    let request_url = HOST_URL_HEAD + "user/analyzedinfo/get"

    xhr.open("POST", request_url)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    // Send JSON array
    xhr.send(json);
}