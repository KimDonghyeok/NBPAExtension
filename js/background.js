/*

/!**
 * 팝업에서 search_naver_popup 요소를 보여주고 blog_naver_popup 요소를 숨김
let showSearchNaverPopup = () => {
    let tagSearchNaver = document.getElementsByClassName('search_naver_popup').item(0)
    let tagBlogNaver = document.getElementsByClassName('blog_naver_popup').item(0)

    tagSearchNaver.style.display = 'block'
    tagBlogNaver.style.display = 'none'
}

/!**
 * 팝업에서 blog_naver_popup  요소를 보여주고 search_naver_popup 요소를 숨김
 *!/
let showBlogNaverPopup = () => {
    let tagSearchNaver = document.querySelector('.search_naver_popup')
    let tagBlogNaver = document.querySelector('.blog_naver_popup')

    tagSearchNaver.setAttribute('style', 'display: none')
    tagBlogNaver.setAttribute('style', 'display: block')
}*!/
*/

// 매치되는 URL 에 따라 showSearchNaverPopup 함수를 실행하는 rule 정의
let showSearchNaverPopupRule = {
    conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'search.naver.com'}
    })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};

// 매치되는 URL 에 따라 showBlogNaverPopup 함수를 실행하는 rule 정의
let showBlogNaverPopupRule = {
    conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'blog.naver.com'}
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
}

chrome.runtime.onInstalled.addListener(function () {

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([showSearchNaverPopupRule]);
        chrome.declarativeContent.onPageChanged.addRules([showBlogNaverPopupRule]);
    });
});