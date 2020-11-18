console.log("execute content script")

/* ------------------------------ 상수정의 ------------------------------ */
const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const SEARCH_XEARCH_REGEXP = new RegExp(/\where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\where\=blog/)

const BLOG_NAVER_CODE = "_blog_naver"
const SEARCH_XEARCH_CODE = "_search_xearch"
const SEARCH_VIEW_CODE = "_search_view_all"
const SEARCH_BLOG_CODE = "_search_view_blog"

/* ------------------------------ 변수정의 ------------------------------ */
let arr_request_url = []
let arr_xearch_url = []
let arr_view_url = []
let arr_blog_url = []

let arr_xearch_index = []
let arr_view_index = []
let arr_blog_index = []

let search_result_list
let is_script_loaded = false

/* ------------------------------ 이벤트처리기 ------------------------------ */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

        if (!is_script_loaded) {

            if (message.message === "tabCode") {

                if (message.code === SEARCH_XEARCH_CODE || message.code === SEARCH_VIEW_CODE || message.code === SEARCH_BLOG_CODE) {
                    getBlogElementsList(message.code)
                    createAnalyzeInfoContainer(search_result_list)

                    console.log(message.code)
                    console.log(search_result_list)
                }

                if (message.code === BLOG_NAVER_CODE) {
                    console.log(message.code)

                }

                is_script_loaded = true
            }

        }
    }
)

/* ------------------------------ 함수정의 ------------------------------ */
let getBlogElementsList = code => {
    switch (code) {
        case SEARCH_XEARCH_CODE:
            search_result_list = document.querySelector("._au_view_collection ._list_base")
            break
        case SEARCH_VIEW_CODE:
            search_result_list = document.querySelector("._au_view_tab ._list_base")
            break
        case SEARCH_BLOG_CODE:
            search_result_list = document.querySelector("._au_view_tab  .lst_total")
            break
        default:
            break
    }
}

// list 의 한 요소를 받아서 내부의 a 태그의 href 값을 통해 블로그 URL 인지 판별
let isBlogSectionElement = (element) => {
    let currentElementUrl = element.querySelector('.api_txt_lines').href
    return BLOG_NAVER_REGEXP.test(currentElementUrl);
}

let getBlogUrlList = (element) => {
    let currentElementUrl = element.querySelector('.api_txt_lines').href


}

let createAnalyzeInfoContainer = list => {
    let list_length = list.childElementCount
    for (let i = 1; i <= list_length; i++) {
        if (isBlogSectionElement(list.childNodes[i])) {
            let analyze_info_container = document.createElement("li")
            let analyze_info = document.createElement("div")

            let analyze_content = document.createTextNode("분석정보입니다.")

            analyze_info.appendChild(analyze_content)
            analyze_info_container.appendChild(analyze_info)

            list.childNodes[i].prepend(analyze_info_container)
        }
    }
}