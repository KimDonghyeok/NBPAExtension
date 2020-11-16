console.log("execute content script")

const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const SEARCH_XEARCH_REGEXP = new RegExp(/\where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\where\=blog/)

const BLOG_NAVER_ID = "_blog_naver"
const SEARCH_XEARCH_ID = "_search_xearch"
const SEARCH_VIEW_ID = "_search_view_all"
const SEARCH_BLOG_ID = "_search_view_blog"

let arr_request_url = new Array()
let arr_xearch_url = new Array()
let arr_view_url = new Array()
let arr_blog_url = new Array()

let current_url
let search_result_list
let identifier
let is_script_loaded = false

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (!is_script_loaded) {
            current_url = message.url
            identifier = findCurrentTabIdentity(current_url)
            console.log(current_url)
            console.log(identifier)

            if (identifier === SEARCH_XEARCH_ID || identifier === SEARCH_VIEW_ID || identifier === SEARCH_BLOG_ID) {
                chrome.runtime.sendMessage("showSearchNaverPopup", response => {
                    console.log(response)
                })
                getBlogElementsList(identifier)
                console.log(search_result_list)
                createAnalyzeInfoContainer(search_result_list)
            }

            if (identifier === SEARCH_BLOG_ID) {
                chrome.runtime.sendMessage("showBlogNaverPopup", response => {
                    console.log(response)
                })
            }
            is_script_loaded = true
        }
    }
)

let findCurrentTabIdentity = current_url => {
    let identifier

    if (SEARCH_NAVER_REGEXP.test(current_url)) {
        if (SEARCH_XEARCH_REGEXP.test(current_url)) {
            identifier = SEARCH_XEARCH_ID
            return identifier
        }
        if (SEARCH_VIEW_REGEXP.test(current_url)) {
            identifier = SEARCH_VIEW_ID
            return identifier
        }
        if (SEARCH_BLOG_REGEXP.test(current_url)) {
            identifier = SEARCH_BLOG_ID
            return identifier
        }
    }
    if (BLOG_NAVER_REGEXP.test(current_url)) {
        identifier = BLOG_NAVER_ID
        return identifier
    }
}

let getBlogElementsList = identifier => {
    switch (identifier) {
        case SEARCH_XEARCH_ID:
            search_result_list = document.querySelector("._au_view_collection ._list_base")
            break
        case SEARCH_VIEW_ID:
            search_result_list = document.querySelector("._au_view_tab ._list_base")
            break
        case SEARCH_BLOG_ID:
            search_result_list = document.querySelector("._au_view_tab  .lst_total")
            break
        default:
            break
    }
}

// list의 한 요소를 받아서 내부의 a 태그의 href 값을 통해 블로그 URL 인지 판별
let isBlogSection = element => {
    let currentElementUrl = element.querySelector('.api_txt_lines').href
    return BLOG_NAVER_REGEXP.test(currentElementUrl);
}

let createAnalyzeInfoContainer = list => {
    let list_length = list.childElementCount
    for (let i = 1; i <= list_length; i++) {
        if (isBlogSection(list.childNodes[i])) {
            let analyze_info_container = document.createElement("li")
            let analyze_info = document.createElement("div")

            let analyze_content = document.createTextNode("분석정보입니다.")

            analyze_info.appendChild(analyze_content)
            analyze_info_container.appendChild(analyze_info)

            list.childNodes[i].prepend(analyze_info_container)
        }
    }
}