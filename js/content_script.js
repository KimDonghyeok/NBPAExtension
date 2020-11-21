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
let is_script_loaded = false
let search_result_list

let arr_xearch_url = []
let arr_view_url = []
let arr_blog_url = []

let arr_url_obj = []
let json_url_data

let arr_received_data = []

// 분석정보 변수
let blog_info
let analyzed_info
let multimedia_ratios
let tags
let hyperlinks
let keywords

/* ------------------------------ 이벤트처리기 ------------------------------ */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.message === "TABCODE") {

            if (message.code === SEARCH_XEARCH_CODE || message.code === SEARCH_VIEW_CODE || message.code === SEARCH_BLOG_CODE) {
                getBlogElementsList(message.code)
                createAnalyzeInfoContainer(message.code, search_result_list)
                convertArrToJsonArr(message.code)
                showTable(message.code)

                chrome.runtime.sendMessage({message: "URLDATA", data: json_url_data})
            }

            else if (message.code === BLOG_NAVER_CODE) {
                console.log(message.code)
            }
        } else if (message.message === "ANALYZEINFO") {
            arr_received_data = message.data
            destructureData(arr_received_data)
        }
    }
)

/* ------------------------------ 함수정의 ------------------------------ */
let getBlogElementsList = (code) => {
    switch (code) {
        case SEARCH_XEARCH_CODE:
            search_result_list = document.querySelector("._au_view_collection ._list_base").getElementsByTagName('li')
            break
        case SEARCH_VIEW_CODE:
            search_result_list = document.querySelector("._au_view_tab ._list_base").getElementsByTagName('li')
            break
        case SEARCH_BLOG_CODE:
            search_result_list = document.querySelector("._au_view_tab  .lst_total").getElementsByTagName('li')
            break
        default:
            break
    }
}

// list 의 한 요소를 받아서 내부의 a 태그의 href 값을 통해 블로그 URL 인지 판별
let isBlogSectionElement = (element) => {
    let currentElementUrl = element.querySelector('.total_tit').href

    return BLOG_NAVER_REGEXP.test(currentElementUrl)
}

let getBlogUrlList = (code, element) => {
    // 현재 페이지 코드와 한개의 html 요소를 인자로 받아 해당 요소의 url 을 코드에 따라 해당 배열에 push
    let currentElementUrl = element.querySelector('.total_tit').href

    switch (code) {
        case SEARCH_XEARCH_CODE:
            arr_xearch_url.push(currentElementUrl)
            break
        case SEARCH_VIEW_CODE:
            arr_view_url.push(currentElementUrl)
            break
        case SEARCH_BLOG_CODE:
            arr_blog_url.push(currentElementUrl)
            break
        default:
            break
    }
}

let createAnalyzeInfoContainer = (code, list) => {
    let list_length = list.length

    let current_node
    for (let i = 0; i < list_length; i++) {
        current_node = list.item(i)

        if (isBlogSectionElement(current_node)) {

            getBlogUrlList(code, current_node)

            let analyze_info_container = document.createElement("div")

            let blog_info = document.createElement("div")
            let analyzed_info = document.createElement("div")
            let multimedia_ratios = document.createElement("div")
            let tags = document.createElement("div")
            let hyperlinks = document.createElement("div")
            let keywords = document.createElement("div")

            analyze_info_container.classList.add('_analyze-info-container')

            blog_info.classList.add('_blog-info')
            analyzed_info.classList.add('_analyzed-info')
            multimedia_ratios.classList.add('_multimedia-ratios')
            tags.classList.add('_tags')
            hyperlinks.classList.add('_hyperlinks')
            keywords.classList.add('_keywords')

            analyze_info_container.appendChild(blog_info)
            analyze_info_container.appendChild(analyzed_info)
            analyze_info_container.appendChild(multimedia_ratios)
            analyze_info_container.appendChild(tags)
            analyze_info_container.appendChild(hyperlinks)
            analyze_info_container.appendChild(keywords)

            current_node.prepend(analyze_info_container)
        }
    }
}

let convertUrlToUrlObj = (arr) => {
    if (Array.isArray(arr)) {
        arr.forEach(url => {
            let tmp_obj = {}
            tmp_obj.url = url
            arr_url_obj.push(tmp_obj)
        })
    }
}

let convertArrToJsonArr = (code) => {
    // 인자로 넘어온 배열 -> url 프로퍼티를 가진 객체로 변환 -> JSON 형식으로 변환하여 변수에 저장

    // 현재 페이지의 코드에 해당하는 url 배열을 JSON 변환
    switch (code) {
        case SEARCH_XEARCH_CODE:
            convertUrlToUrlObj(arr_xearch_url)
            json_url_data = JSON.stringify(arr_url_obj)
            break
        case SEARCH_VIEW_CODE:
            convertUrlToUrlObj(arr_view_url)
            json_url_data = JSON.stringify(arr_url_obj)
            break
        case SEARCH_BLOG_CODE:
            convertUrlToUrlObj(arr_blog_url)
            json_url_data = JSON.stringify(arr_url_obj)
            break
        default:
            break
    }
}


let showTable = (code) => {
    // url 배열 확인용 함수

    switch (code) {
        case SEARCH_XEARCH_CODE:
            console.table(arr_xearch_url)
            break
        case SEARCH_VIEW_CODE:
            console.table(arr_view_url)
            break
        case SEARCH_BLOG_CODE:
            console.table(arr_blog_url)
            break
        default:
            break
    }
    console.table(arr_url_obj)
    console.log(JSON.parse(json_url_data), null, 2)
}

let destructureData = (arr) => {
    // 백그라운드 스크립트로부터 받은 분석정보를 역직렬화하여 각 변수에 저장

    arr.forEach((element, index) => {

        blog_info = JSON.parse(element.blog_info)[0]

        if (element.analyzed_info)
            analyzed_info = JSON.parse(element.analyzed_info)[0]

        if (element.multimedia_ratios)
            multimedia_ratios = JSON.parse(element.multimedia_ratios)

        tags = JSON.parse(element.tags)
        hyperlinks = JSON.parse(element.hyperlinks)
        if (element.keywords)
            keywords = JSON.parse(element.keywords)

        console.log(`
blog_info: ${blog_info}
analyzed_info: ${analyzed_info}
multimedia_ratios: ${multimedia_ratios}
tags: ${tags}
hyperlinks: ${hyperlinks}
keywords: ${keywords}
        `)
    })
}

let setAnalyzedinfo = () => {
    let blog_info_container = document.getElementsByClassName('_blog-info')
    let analyzed_info_container = document.getElementsByClassName('_analyzed-info')
    let multimedia_ratios_container = document.getElementsByClassName('_multimedia-ratios')
    let tags_container = document.getElementsByClassName('_tags')
    let hyperlinks_container = document.getElementsByClassName('_hyperlinks')
    let keywords_container = document.getElementsByClassName('_keywords')
}
