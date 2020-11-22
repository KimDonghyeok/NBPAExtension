console.log("execute content script")

/* ------------------------------ 상수정의 ------------------------------ */
import {
    SEARCH_NAVER_REGEXP,
    BLOG_NAVER_REGEXP,
    BLOG_NAVER_ME_REGEXP,
    BLOG_NAVER_REGEXP_NOT_SECURE,
    SEARCH_XEARCH_REGEXP,
    SEARCH_VIEW_REGEXP,
    SEARCH_BLOG_REGEXP,
    SEARCH_XEARCH_CODE,
    SEARCH_VIEW_CODE,
    SEARCH_BLOG_CODE,
    BLOG_NAVER_CODE,
    HOST_URL_HEAD} from "./constants";

/* ------------------------------ 변수정의 ------------------------------ */
let search_result_list

const arr_xearch_url = []
const arr_view_url = []
const arr_blog_url = []

const arr_url_obj = []
let json_url_data
let arr_received_data

// 분석정보 변수
const blog_info = []
const analyzed_info = []
const multimedia_ratios = []
const tags = []
const hyperlinks = []
const keywords = []

/* ------------------------------ 이벤트처리기 ------------------------------ */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "TABCODE") {

        if (message.code === SEARCH_XEARCH_CODE || message.code === SEARCH_VIEW_CODE || message.code === SEARCH_BLOG_CODE) {
            getBlogElementsList(message.code)
            createAnalyzeInfoContainer(message.code, search_result_list)
            convertArrToJsonArr(message.code)
            showTable(message.code)

            // let test_arr = []
            // test_arr.push('https://blog.naver.com/lanoe600/50124020305')
            // test_arr.push('https://blog.naver.com/iwolo8844ye/80127162828')
            // test_arr.push('https://blog.naver.com/vostino/70142180356')
            // test_arr.push('https://blog.naver.com/babyyej5/70145024358')
            // test_arr.push('https://blog.naver.com/gus2253/30155510721')
            //
            // convertUrlToUrlObj(test_arr)
            //
            // json_url_data = JSON.stringify(arr_url_obj)

            chrome.runtime.sendMessage({
                message: "URLDATA",
                data: json_url_data
            })
        } else if (message.code === BLOG_NAVER_CODE) {
            console.log(message.code)

            let current_url = message.url

            multimedia_folding()
            // TODO 블로그 내에서 서버로 단일 URL 보내서 분석 정보 받아오는 작업 구현
            //서버로 단일 URL 전송
            sendSingleBlogURL(current_url)
        }
    } else if (message.message === "ANALYZEINFO") {
        arr_received_data = message.data
        deserializeData(arr_received_data)
        setAnalyzedInfo_SearchNaver()
        setAnalyzeInfoEvent()
    }
    else if (message.message === "ALLIMAGEHIDE") {
        let checkbox_id = message.checkbox_id
        let checkbox_status = message.status
        let current_blog_url = message.url

        console.log("blog popup message is received!")
    }
})
/* ------------------------------------------------------------------------------------------ 멀티미디어 접기 기능 ------------------------------------------------------------------------------------------ */
let getLogNo = (document) => {
    // log_no 추출 함수

    let blogsrc = document.getAttribute('src');
    let blogstr = blogsrc.toString();
    let splitSrc = blogstr.split('&');

    for (let i = 0; i < splitSrc.length; i++) {
        console.log(splitSrc[i]);
        if (splitSrc[i].startsWith('logNo')) {
            console.log("이걸 잡아야함: ", splitSrc[i]);
            test = splitSrc[i].split("=");
            console.log(test[1]);
            return test[1];
        }


    }
}

let multimedia_folding = () => {
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let check_iframe = document.getElementById('mainFrame')

    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;

    }

    //let testdo = document.getElementsByTagName('div');

    //1.check_iframe을 실행.
    //2.getLogNo를 통해 logno 얻기
    //3.getelementbyid(logno)통해 하위 요소 잡기.
    //4.getelementsbytagnname으로 img 객체 잡아내기
    //log_no를 분리해 주는 작업
    let log_No = getLogNo(check_iframe);
    let identifier = 'post-view' + log_No;
    let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    let getimgsrc = getbody.getElementsByTagName('img');

    for (let i = 0; i < getimgsrc.length; i++) {
        let src = getimgsrc[i].getAttribute('src').toString();
        let x = 1;
        //블랭크 gif인 경우 넘기기
        if (src.indexOf('https://ssl.pstatic.net') != -1) {
            continue;
        }
        //섬네일의 경우 넘기기
        else if (src.indexOf('http://blogpfthumb.phinf.naver.net/') != -1) {
            continue;
        } else if (src.indexOf('data:image') != -1) {
            //접기용 버튼 추가.
            continue;
        } else if (src.indexOf('storep') != -1) {
            //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
            btnInput(getimgsrc[i]);
            continue;
        } else if (src.indexOf('sticker') != -1) {
            btnInput(getimgsrc[i]);
            continue;
        } else if (src.indexOf('postfiles') != -1) {
            //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
            btnInput(getimgsrc[i]);
            continue;
        } else if (src.indexOf('blogfiles') != -1) {
            //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
            btnInput(getimgsrc[i]);
            continue;
        } else {
            continue;
        }


    }
    //옛날 버전에서 네이버 비디오 접기.
    let getVidSrc = getbody.getElementsByClassName('u_rmcplayer');
    let getViddiv = getbody.getElementsByClassName('se-main-container');
    if (getVidSrc.length != 0) {

        for (let i = 0; i < getVidSrc.length; i++) {
            btnInputVid(getVidSrc[i]);
            //console.log(getVidSrc[i]);
        }
    }
    if (getViddiv.length != 0) {
        let findYouVid = getViddiv[0].getElementsByClassName('se-component se-oembed se-l-default');
        //let findNavVid = getViddiv[0].getElementsByClassName('se-component se-video se-l-default');
        let findNavVid = getViddiv[0].getElementsByClassName('se-video');

        for (let i = 0; i < findYouVid.length; i++) {
            btnInputVid(findYouVid[i]);
        }
        for (let i = 0; i < findNavVid.length; i++) {
            btnInputVid(findNavVid[i]);
        }
    }
}

let btnInput = (s) => {
    // 이미지에 버튼 추가

    //1.a태그가 아닌 경우 부모노드에 자식노드 div를 만든다.
    //2.div안에 자식 노드로 버튼 추가를 원하는 img객체를 넣는다.
    //3.img객체 밑에 버튼을 추가한다.
    //4.a태그인 경우 부모노드의 부모노드에 자식노드 div를 만든다. 그래야 a태그의 클릭 효과를 받지 않는다.
    //5.2번,3번 과정과 동일.

    let setinput = document.createElement('input');
    setinput.setAttribute("value", "버튼 클릭시 이미지접기");
    setinput.setAttribute("type", "button");
    setinput.style.display = "block";
    if (s.parentNode.nodeName === 'A') {
        console.log(s.parentNode.nodeName);
        s.parentNode.parentNode.insertBefore(setinput, s.parentNode);
    } else {
        s.parentNode.insertBefore(setinput, s);
    }
    setinput.addEventListener('click', function () {
        OnOff(s);
    });
}

let btnInputVid = (s) => {
    //영상에 버튼 추가

    //1.a태그가 아닌 경우 부모노드에 자식노드 div를 만든다.
    //2.div안에 자식 노드로 버튼 추가를 원하는 img객체를 넣는다.
    //3.img객체 밑에 버튼을 추가한다.
    //4.a태그인 경우 부모노드의 부모노드에 자식노드 div를 만든다. 그래야 a태그의 클릭 효과를 받지 않는다.
    //5.2번,3번 과정과 동일.

    let setinput = document.createElement('input');
    setinput.setAttribute("value", "버튼 클릭시 이미지접기");
    setinput.setAttribute("type", "button");
    setinput.style.display = "block";
    setinput.addEventListener('click', function () {
        OnOff(s);
    });
    s.parentNode.insertBefore(setinput, s);
}

let OnOff = (element) => {
    // 버튼클릭시 이미지 숨기기
    if (element.style.display != 'none') {
        element.style.display = 'none';
    } else {
        element.style.display = 'block';
    }
}

let getMediaplace = (element) => {
    // 페이지의 동영상 요소를 찾는 함수

    //getimgsrc[i]를 통해 넘겨 받은 객체를 분석한다.
    //유투브 뿐만아니라 네이버, 타 플랫폼의 플레이어를 검출해낼 방법은?어차피 영상 따로 잡아야함..
    //
    let getvidSrc = element.getElementsByTagName('div');
    for (let i = 0; i < getvidSrc.length; i++) {
        let test = getvidSrc[i].getAttribute('id').toString().indexOf('player');
        if (test == -1) {
            btnInput(element);
        }
    }
}

let fold_all_image = (boolean) => {
    // 이미지 전체를 가져와서 접는 함수

    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let check_iframe = document.getElementById('mainFrame')

    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;
    }


    //1.check_iframe을 실행.
    //2.getLogNo를 통해 logno 얻기
    //3.getelementbyid(logno)통해 하위 요소 잡기.
    //4.getelementsbytagnname으로 img 객체 잡아내기
    //log_no를 분리해 주는 작업
    let log_No = getLogNo(check_iframe);
    let identifier = 'post-view' + log_No;
    let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    let getimgsrc = getbody.getElementsByTagName('img');

    for (let i = 0; i < getimgsrc.length; i++) {
        let src = getimgsrc[i].getAttribute('src').toString();
        let x = 1;
        //블랭크 gif인 경우 넘기기
        if (src.indexOf('postfiles') != -1) {
            //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
            //btnInput(getimgsrc[i]);
            if (boolean) {
                //bool=true인 경우만
                getimgsrc[i].style.display = "none";
                continue
            } else {
                getimgsrc[i].style.display = "block";
                continue
            }
            continue;
        } else if (src.indexOf('blogfiles') != -1) {
            if (boolean) {
                //bool=true인 경우만
                getimgsrc[i].style.display = "none";
                continue
            } else {
                getimgsrc[i].style.display = "block";
                continue
            }
        } else {
            continue;
        }
    }
}

let fold_all_imoticon = (boolean) => {
    // 이모티콘 전체를 가져와서 접는 함수

    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let check_iframe = document.getElementById('mainFrame')

    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;

    }

    //let testdo = document.getElementsByTagName('div');

    //1.check_iframe을 실행.
    //2.getLogNo를 통해 logno 얻기
    //3.getelementbyid(logno)통해 하위 요소 잡기.
    //4.getelementsbytagnname으로 img 객체 잡아내기
    //log_no를 분리해 주는 작업
    let log_No = getLogNo(check_iframe);
    let identifier = 'post-view' + log_No;
    let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    let getimgsrc = getbody.getElementsByTagName('img');

    for (let i = 0; i < getimgsrc.length; i++) {
        let src = getimgsrc[i].getAttribute('src').toString();
        let x = 1;
        //블랭크 gif인 경우 넘기기
        if (src.indexOf('storep') != -1) {
            //true인 경우 접기
            if (boolean) {
                getimgsrc[i].style.display = "none"
                continue
            } else {
                //false인 경우 모두 펼치기
                getimgsrc[i].style.display = "block"
                continue
            }
        } else if (src.indexOf('sticker') != -1) {
            if (boolean) {
                getimgsrc[i].style.display = "none"
                continue
            } else {
                //false인 경우 모두 펼치기
                getimgsrc[i].style.display = "block"
                continue
            }
        } else {
            continue;
        }
    }
}

let fold_all_video = (boolean) => {
    // 영상 전체를 가져와서 접는 함수

    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let check_iframe = document.getElementById('mainFrame')

    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;

    }

    //let testdo = document.getElementsByTagName('div');

    //1.check_iframe을 실행.
    //2.getLogNo를 통해 logno 얻기
    //3.getelementbyid(logno)통해 하위 요소 잡기.
    //4.getelementsbytagnname으로 img 객체 잡아내기
    //log_no를 분리해 주는 작업
    let log_No = getLogNo(check_iframe);
    let identifier = 'post-view' + log_No;
    let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);

    //옛날 버전에서 네이버 비디오 접기.
    let getVidSrc = getbody.getElementsByClassName('u_rmcplayer');
    let getViddiv = getbody.getElementsByClassName('se-main-container');
    if (getVidSrc.length != 0) {

        for (let i = 0; i < getVidSrc.length; i++) {
            if (boolean) {
                findYouVid[i].style.display = 'none'
                continue
            } else {
                findYouVid[i].style.display = 'block'
                continue
            }
        }
    }
    if (getViddiv.length != 0) {
        let findYouVid = getViddiv[0].getElementsByClassName('se-component se-oembed se-l-default');
        //let findNavVid = getViddiv[0].getElementsByClassName('se-component se-video se-l-default');
        let findNavVid = getViddiv[0].getElementsByClassName('se-video');

        for (let i = 0; i < findYouVid.length; i++) {
            //btnInputVid(findYouVid[i]);
            if (boolean) {
                findYouVid[i].style.display = 'none'
                continue
            } else {
                findYouVid[i].style.display = 'block'
                continue
            }
        }
        for (let i = 0; i < findNavVid.length; i++) {
            if (boolean) {
                findNavVid[i].style.display = 'none'
                continue
            } else {
                findNavVid[i].style.display = 'block'
                continue
            }
        }
    }
}

/* ------------------------------ 미리보기 기능 ------------------------------ */
$(function () {
    window.oncontextmenu = function () {
        return false;
    };

    $('a.api_txt_lines.total_tit').mousedown(function (e) {
        let mouse = e.button
        if (mouse == 2) {
            e.preventDefault();
            let org_url = $(this).attr("href")
            let splited_url = org_url.split('//');
            let pure_url = splited_url[1];

            let new_url
            if (isBlogSectionElement(org_url)) {
                new_url = "https://m." + pure_url;
            } else {
                new_url = org_url
            }

            let $dialog = $('<div></div>')
                .html('<iframe style="border: 0px; " src="' + new_url + '" width="100%" height="100%"></iframe>')
                .dialog({
                    autoOpen: false,
                    modal: true,
                    height: 600,
                    width: 500,
                    title: "NBPA PreViewer"
                });
            $dialog.dialog('open');
        }
    });
});
/* ------------------------------------------------------------------------------------------ 함수정의 ------------------------------------------------------------------------------------------ */
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
    console.log(json_url_data)
    console.log(JSON.parse(json_url_data))
}

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
let isBlogSectionElement = (url) => {

    if (BLOG_NAVER_REGEXP.test(url) || BLOG_NAVER_ME_REGEXP.test(url))
        return true
    else
        return false
}

let convertBlogMeUrl = (url) => {
    // blog.me url 일 때 해당 url 을 일반화시켜 변환

    let url_obj = new URL(url)

    let url_host = url_obj.host
    let url_path = url_obj.pathname

    let url_host_frag = url_host.split(".")
    let url_path_frag = url_path.split("/")

    let blog_me_url_info = [url_host_frag[0], url_path_frag[1]]

    let normalize_url = "https://blog.naver.com/" + blog_me_url_info[0] + "/" + blog_me_url_info[1]

    return normalize_url
}

let getBlogUrlList = (code, url) => {
    // 현재 페이지 코드와 한개의 html 요소를 인자로 받아 해당 요소의 url 을 코드에 따라 해당 배열에 push
    // TODO https://pointnow.blog.me/222149996848 -> https://blog.naver.com/pointnow/222149996848 변환 작업 필요

    let currentElementUrl = url

    if (BLOG_NAVER_ME_REGEXP.test(currentElementUrl)) {
        currentElementUrl = convertBlogMeUrl(url)
    }

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
    let current_node_url

    for (let i = 0; i < list_length; i++) {

        current_node = list.item(i)
        current_node_url = current_node.querySelector('.total_tit').href

        if (isBlogSectionElement(current_node_url)) {
            getBlogUrlList(code, current_node_url)

            // 각 분석정보 컨테이너가 들어가는 div
            let analyze_info_container = document.createElement("div")

            // [로렘확률 (샘플텍스트 1,2 ,3)] [이미지 비율] [이모티콘 비율] [영상 비율] [게시글 미리보기 버튼] [키워드 미리보기 버튼 (키워드, 해시태그, 하이퍼링크)]
            let lorem_percentage = document.createElement("button")
            let multimedia_image_ratio = document.createElement("div")
            let multimedia_emoticon_ratio = document.createElement("div")
            let multimedia_video_ratio = document.createElement("div")
            let button_post_preview = document.createElement("button")
            let button_keyword_preview = document.createElement("button")

            // 각 요소에 클래스 속성 추가
            analyze_info_container.classList.add('_analyze-info-container')
            lorem_percentage.classList.add('_button')
            lorem_percentage.classList.add('_lorem-percentage-container')
            multimedia_image_ratio.classList.add('_multimedia-image-ratio-container')
            multimedia_emoticon_ratio.classList.add('_multimedia-emoticon-ratio-container')
            multimedia_video_ratio.classList.add('_multimedia-video-ratio-container')
            button_post_preview.classList.add('_button')
            button_post_preview.classList.add('_post-preview')
            button_keyword_preview.classList.add('_button')
            button_keyword_preview.classList.add('_keyword-preview')

            // 버튼에 type 속성 추가
            lorem_percentage.setAttribute("type", "button")
            button_post_preview.setAttribute("type", "button")
            button_keyword_preview.setAttribute("type", "button")

            // 버튼 내부에 텍스트 추가
            button_post_preview.textContent = "게시글 미리보기"
            button_keyword_preview.textContent = "키워드 정보 미리보기"

            analyze_info_container.appendChild(lorem_percentage)
            analyze_info_container.appendChild(multimedia_image_ratio)
            analyze_info_container.appendChild(multimedia_emoticon_ratio)
            analyze_info_container.appendChild(multimedia_video_ratio)
            analyze_info_container.appendChild(button_post_preview)
            analyze_info_container.appendChild(button_keyword_preview)

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

let deserializeData = (arr) => {
    // 백그라운드 스크립트로부터 받은 분석정보를 역직렬화하여 각 변수에 저장

    arr.forEach((element, index) => {
        let single_blog_info = JSON.parse(element.blog_info)[0]
        blog_info.push(single_blog_info)

        console.log({single_blog_info})

        if (element.analyzed_info) {
            let single_analyzed_info = JSON.parse(element.analyzed_info)[0]
            analyzed_info.push(single_analyzed_info)

            console.log({single_analyzed_info})
        }

        if (element.multimedia_ratios) {
            let single_multimedia_ratios = JSON.parse(element.multimedia_ratios)
            multimedia_ratios.push(single_multimedia_ratios)

            console.log({single_multimedia_ratios})
        }

        let single_tags = JSON.parse(element.tags)
        tags.push(single_tags)
        console.log({single_tags})

        let single_hyperlinks = JSON.parse(element.hyperlinks)
        hyperlinks.push(single_hyperlinks)
        console.log({single_hyperlinks})

        if (element.keywords) {
            let single_keywords = JSON.parse(element.keywords)
            keywords.push(single_keywords)

            console.log({single_keywords})
        }

        console.log("")
    })
}

let getMultimediaType = (id) => {
    let type

    switch (id) {
        case 1:
            type = "이미지"
            return type
        case 2:
            type = "이모티콘"
            return type
        case 3:
            type = "영상"
            return type
        case 4:
            type = "하이퍼링크"
            return type
        case 5:
            type = "텍스트"
            return type
        case 6:
            type = "빈칸"
            return type
        case 7:
            type = "기타"
            return type
        case 8:
            type = "알수없음"
            return type
        default:
            break
    }
}

let setAnalyzedInfo_SearchNaver = () => {
    let lorem_info_container = document.getElementsByClassName('_lorem-percentage-container')
    let multimedia_image_ratio_container = document.getElementsByClassName('_multimedia-image-ratio-container')
    let multimedia_emoticon_ratio_container = document.getElementsByClassName('_multimedia-emoticon-ratio-container')
    let multimedia_video_ratio_container = document.getElementsByClassName('_multimedia-video-ratio-container')

    let length = arr_url_obj.length

    for (let i = 0; i < length; i++) {

        /* ---------- 분석정보 배열에서 로렘 확률 정보를 추출하여 출력 ----------*/
        if (analyzed_info[i].constructor === Object && Object.keys(analyzed_info[i]).length !== 0) {
            // 현재 객체가 비어있지 않을때 정보 출력 작업
            let current_analyzed_info = analyzed_info[i]['fields']
            let current_lorem_info_value = current_analyzed_info['lorem_percentage'].toFixed(3)
            let lorem_info_text = "로렘확률: " + current_lorem_info_value

            // 추출한 정보를 컨테이너 내부 텍스트로 할당
            lorem_info_container.item(i).textContent = lorem_info_text

            // TODO 로렘확률 버튼 클릭 시 샘플 텍스트를 레이어 팝업으로 출력, 개별 함수로 작성
        }

        /* ---------- 멀티미디어 배열에서 멀티미디어 정보(이미지, 이모티콘, 영상 비율)를 추출하여 출력 ----------*/
        let current_multimedia_ratios = multimedia_ratios[i]

        if (Array.isArray(current_multimedia_ratios) && !current_multimedia_ratios.length) {
            // 현재 블로그에 해당하는 멀티미디어 배열이 비어있지않을때 정보 출력

            for (let j = 0; j < current_multimedia_ratios.length; j++) {

                let current_single_multimedia_ratio = current_multimedia_ratios[j]['fields']
                let current_single_multimedia_type = current_single_multimedia_ratio['ratio_type']

                if (current_single_multimedia_type <= 3) {
                    let current_single_multimedia_ratio_value = current_single_multimedia_ratio['ratio'].toFixed(3)
                    let current_multimedia_ratio_text = getMultimediaType(current_single_multimedia_type) + "비율: " + current_single_multimedia_ratio_value

                    // 추출한 정보를 정보타입네 따라 컨테이너 내부 텍스트로 할당
                    if (getMultimediaType(current_single_multimedia_type) === "이미지")
                        multimedia_image_ratio_container.item(i).textContent = current_multimedia_ratio_text
                    else if (getMultimediaType(current_single_multimedia_type) === "이모티콘")
                        multimedia_emoticon_ratio_container.item(i).textContent = current_multimedia_ratio_text
                    else if (getMultimediaType(current_single_multimedia_type) === "영상")
                        multimedia_video_ratio_container.item(i).textContent = current_multimedia_ratio_text
                }
            }
        }
    }
}

let normalizePostViewUrl = (url) => {
    // blog.me url 일 때 해당 url 을 일반화시켜 변환

    let url_obj = new URL(url)

    console.log(url_obj)

    let url_search_param_obj = url_obj.searchParams

    console.log(url_search_param_obj)

    let url_blog_id = url_search_param_obj.get('blogId')
    let url_log_no = url_search_param_obj.get('logNo')

    console.log(url_blog_id)
    console.log(url_log_no)

    let normalize_url = "https://blog.naver.com/" + url_blog_id + "?Redirect=Log&logNo=" + url_log_no

    return  normalize_url
}

let showSampleText = (index) => {
    // 로렘확률 컨테이너를 클릭하면 로렘확률에 대한 샘플 텍스트를 레이어팝업으로 보여주는 함수
    console.log("showSampleText")
}

let showPostPreview = (index) => {
    // 게시글 미리보기 버튼을 클릭하면 레이어팝업으로 게시글 모바일 버전의 페이지로 보여주는 함수
    console.log("showPostPreview")
    let target_blog_url = blog_info[index]['fields']['url']

}

let showPostKeyword = (index) => {
    // 게시글 키워드 보기 버튼을 클릭하면 레이어 팝업으로 게시글 키워드(키워드 , 해시태그, 하이퍼 링크)를 보여주는 함수
    console.log("showPostKeyword")
}

let setAnalyzeInfoEvent = () => {
    // 분석 정보 컨테이너의 로렘확률 컨테이너, 게시글 미리보기 버튼, 게시글 키워드 보기 버튼에 대해 이벤트를 추가

    let lorem_info_container = document.getElementsByClassName('_lorem-percentage-container')
    let post_preview_button = document.getElementsByClassName("_post-preview")
    let keyword_preview_button = document.getElementsByClassName("_keyword-preview")

    let length = arr_url_obj.length
    for (let i = 0; i < length; i++) {
        let current_lorem_info_container = lorem_info_container.item(i)
        let current_post_preview_button = post_preview_button.item(i)
        let current_keyword_preview_button = keyword_preview_button.item(i)

        current_lorem_info_container.addEventListener("click", () => {
            showSampleText(i)
        })
        current_post_preview_button.addEventListener("click", () => {
            showPostPreview(i)
        })
        current_keyword_preview_button.addEventListener("click", () => {
            showPostKeyword(i)
        })
    }
}