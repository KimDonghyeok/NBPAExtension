console.log("execute content script")

const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const SEARCH_NEXEARCH_REGEXP = new RegExp(/\where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\where\=blog/)

let arr_request_url = new Array()
let arr_xearch_url = new Array()
let arr_view_url = new Array()
let arr_blog_url = new Array()

let current_url
let search_result_list

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        current_url = message.url
        getBlogElementsList(current_url)
        console.log(current_url)
        console.log(search_result_list)
        createAnalyzeInfoContainer(search_result_list)
    }
)

let findCrurentTabIdentity = current_url => {
    let identifier

    if (SEARCH_NAVER_REGEXP.test(current_url)) {
        if (SEARCH_NEXEARCH_REGEXP.test(current_url)) {
            identifier = "search_xearch"
            return identifier
        }
        if (SEARCH_VIEW_REGEXP.test(current_url)) {
            identifier = "search_view_all"
            return identifier
        }
        if (SEARCH_BLOG_REGEXP.test(current_url)) {
            identifier = "search_view_blog"
            return identifier
        }
    }
}

let getBlogElementsList = current_url => {
    let identifier = findCrurentTabIdentity(current_url)
    console.log(identifier)
    switch (identifier) {
        case "search_xearch":
            search_result_list = document.querySelector("._au_view_collection ._list_base")
            break
        case "search_view_all":
            search_result_list = document.querySelector("._au_view_tab ._list_base")
            break
        case "search_view_blog":
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

            analyze_info_container.setAttribute("class", "_analyze_info_container")
            analyze_info.setAttribute("class", "_analyze_info")

            analyze_info.appendChild(analyze_content)
            analyze_info_container.appendChild(analyze_info)

            list.childNodes[i].prepend(analyze_info_container)
        }
    }
}
