console.log("execute content script")

/* ------------------------------ 상수정의 ------------------------------ */
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const BLOG_NAVER_ME_REGEXP = new RegExp(/blog\.me/)

const BLOG_NAVER_CODE = "_blog_naver"
const SEARCH_XEARCH_CODE = "_search_xearch"
const SEARCH_VIEW_CODE = "_search_view_all"
const SEARCH_BLOG_CODE = "_search_view_blog"

/* ------------------------------ 변수정의 ------------------------------ */
let search_result_list

let arr_blog_element = []

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
            addPreviewButtonListener()
            addKeywordButtonFakeListener()
            addSampleButtonFakeListener()
            showTable(message.code)

            chrome.runtime.sendMessage({
                message: "URLDATA",
                data: json_url_data
            })
        } else if (message.code === BLOG_NAVER_CODE) {
            console.log(message.code)

            let current_url = message.url

            multimedia_folding(current_url)
            
            // 스토리지에서 폴드 체크상태 확인 후 이미지 자동접기
            sync_blog_popup_checkbox(current_url)
        }
    } else if (message.message === "ANALYZEINFO") {
        arr_received_data = message.data
        deserializeData(arr_received_data)
        setAnalyzedInfo_SearchNaver()
        setAnalyzeInfoEvent()
        changeBackgorundColor()
    } else if (message.message === "ALLHIDE") {
        let checkbox_id = message.checkbox_id
        let checkbox_status = message.status
        let url = message.url
        
        hideAllMultimediaByType(checkbox_id, checkbox_status, url)
        console.log("blog popup message is received!")
    } else if (message.message === "CHANGESLIDER") {
        // let slider_id = message.slider_id
        // let slider_value = message.slider_value

        console.log("search popup message is received!")
        changeBackgorundColor()
    }
})

let addPreviewButtonListener = () => {
    arr_url_obj.forEach((element, index) => {
        let post_preview_buttons = document.getElementsByClassName("_post-preview")
        let current_post_preview_button = post_preview_buttons.item(index)
        current_post_preview_button.addEventListener("click", () => {
            showPostPreview(element["url"])
        })
    });
}

let addKeywordButtonFakeListener = () => {
    arr_url_obj.forEach((element, index) => {
        let additionalInfo_preview_buttons = document.getElementsByClassName("_additionalInfo-preview")
        let current_additionalInfo_preview_button = additionalInfo_preview_buttons.item(index)
        current_additionalInfo_preview_button.addEventListener("click", additionalInfoButtonFakeEvent)
    })
}

// 로렘 확률 버튼에 FAKE 리스너 추가
let addSampleButtonFakeListener = () => {
    arr_url_obj.forEach((element, index) => {
        let sample_buttons = document.getElementsByClassName("_lorem-percentage-container")
        let current_sample_button = sample_buttons.item(index)
        current_sample_button.addEventListener("click", sampleButtonFakeEvent)
    })
}

let additionalInfoButtonFakeEvent = () => {
    alert('아직 부가정보가 존재하지 않습니다!')
}

let sampleButtonFakeEvent = () => {
    alert('아직 분석정보가 존재하지 않습니다!')
}

/* ------------------------------------------------------------------------------------------ 체크박스 동기화 기능 ------------------------------------------------------------------------------------------ */

// checked/unchecked를 불리언으로 변환, undefined면 defaultValue 반환
let checkToBoolean = (check, defaultValue) => {
    if (check === undefined) {
        return defaultValue
    }
    return check === "checked"
}

let sync_blog_popup_checkbox = (url) => {
    chrome.storage.local.get("all_image_close", function (obj) {
        boolean = checkToBoolean(obj.all_image_close, false)
        hideAllMultimediaByType("all-image-close", boolean, url)
    })
    chrome.storage.local.get("all_video_close", function (obj) {
        boolean = checkToBoolean(obj.all_video_close, false)
        hideAllMultimediaByType("all-video-close", boolean, url)
    })
    chrome.storage.local.get("all_imoticon_close", function (obj) {
        boolean = checkToBoolean(obj.all_imoticon_close, false)
        hideAllMultimediaByType("all-imoticon-close", boolean, url)
    })
}

/* ------------------------------ 멀티미디어 접기 ------------------------------ */
let getLogNo = (url) => {
    // log_no 추출 함수

    url = normalizePostViewUrl(url)
    
    let splitSrc = url.split('/');

    let log_no = splitSrc[4]
    return log_no
}


/* ------------------------------ 멀티미디어 접기 ------------------------------ */
let multimedia_folding = (url) => {
    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let log_No = getLogNo(url);
    let identifier = 'post-view' + log_No;

    let check_iframe = document.getElementById('mainFrame')

    let getbody
    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;
        getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    }
    else{
        getbody = document.getElementById(identifier);
    }
    
    let getmaincontainer = getbody.getElementsByClassName('se-main-container');
    //이미지 접기


    let getimgsrcold = getbody.getElementsByTagName('img');
    if (getmaincontainer.length != 0) {
        let getimgsrcnew = getmaincontainer[0].getElementsByTagName('img');
        if (getimgsrcnew.length != 0) {
            for (let i = 0; i < getimgsrcnew.length; i++) {
                //let src = getimgsrcnew[i].getAttribute('src').toString();
                let src = getimgsrcnew[i].outerHTML
                //블랭크 gif인 경우 넘기기
                if (src.indexOf('https://ssl.pstatic.net') != -1) {
                    continue;
                }
                //섬네일의 경우 넘기기
                else if (src.indexOf('http://blogpfthumb.phinf.naver.net/') != -1) {
                    continue;
                }
                else if (src.indexOf('dthumb') != -1) {
                    continue;
                }
                else if (src.indexOf('data:image') != -1) {
                    //접기용 버튼 추가.
                    continue;
                }
                else if (src.indexOf('storep') != -1) {
                    //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
                    btnInput(getimgsrcnew[i]);
                    continue;
                }
                else if (src.indexOf('sticker') != -1) {
                    btnInput(getimgsrcnew[i]);
                    continue;
                }
                else if (src.indexOf('postfiles') != -1) {
                    //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                    btnInput(getimgsrcnew[i]);
                    continue;
                }
                else if (src.indexOf('blogfiles') != -1) {
                    //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                    btnInput(getimgsrcnew[i]);
                    continue;
                }
                else {
                    continue;
                }

            }
        }
    }
    else {
        for (let i = 0; i < getimgsrcold.length; i++) {
            //let src = getimgsrcold[i].getAttribute('src').toString();
            let src = getimgsrcold[i].outerHTML
            let x = 1;
            //블랭크 gif인 경우 넘기기
            if (src.indexOf('https://ssl.pstatic.net') != -1) {
                continue;
            }
            //섬네일의 경우 넘기기
            else if (src.indexOf('http://blogpfthumb.phinf.naver.net/') != -1) {
                continue;
            }
            else if (src.indexOf('http://dthumb') != -1) {
                continue;
            }
            else if (src.indexOf('data:image') != -1) {
                //접기용 버튼 추가.
                continue;
            }
            else if (src.indexOf('storep') != -1) {
                //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
                btnInput(getimgsrcold[i]);
                continue;
            }
            else if (src.indexOf('sticker') != -1) {
                btnInput(getimgsrcold[i]);
                continue;
            }
            else if (src.indexOf('postfiles') != -1) {
                //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                btnInput(getimgsrcold[i]);
                continue;
            }
            else if (src.indexOf('blogfiles') != -1) {
                //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                btnInput(getimgsrcold[i]);
                continue;
            }
            else {
                continue;
            }

        }
    }

    //옛날 버전에서 네이버 비디오 접기.
    let getVidSrc = getbody.getElementsByClassName('u_rmcplayer');
    let getViddiv = getbody.getElementsByClassName('se-main-container');
    let getiframe = getbody.getElementsByTagName('iframe')
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
    if (getiframe.length != 0) {
        let getVidifram = getiframe[0]
        console.log(getiframe[0])
        if (getVidifram.outerHTML.indexOf("youtube") != -1) {
            btnInputVid(getVidifram.parentNode)
        }
    }
}
/*-----------------------------버튼추가----------------------------------*/
let btnInput = (s) => {
    //버튼 추가
    //1.a태그가 아닌 경우 부모노드에 자식노드 div를 만든다.
    //2.div안에 자식 노드로 버튼 추가를 원하는 img객체를 넣는다.
    //3.img객체 밑에 버튼을 추가한다.
    //4.a태그인 경우 부모노드의 부모노드에 자식노드 div를 만든다. 그래야 a태그의 클릭 효과를 받지 않는다.
    //5.2번,3번 과정과 동일.

    let setinput = document.createElement('input');
    setinput.setAttribute("value", "버튼 클릭 시 숨기기");
    setinput.setAttribute("type", "button");
    setinput.style.display = "block";
    if (s.parentNode.nodeName === 'A') {
        console.log(s.parentNode.nodeName);
        if (s.parentNode.getAttribute("before")) {
            s.parentNode.parentNode.parentNode.insertBefore(setinput, s.parentNode.parentNode);

        }
        s.parentNode.parentNode.insertBefore(setinput, s.parentNode);
    }
    else {
        s.parentNode.insertBefore(setinput, s);
    }
    setinput.addEventListener('click', function () { OnOff(s); });
}
/*-------------------------------------------------------------------------*/
/*-----------------------------비디오에 버튼추가----------------------------------*/
let btnInputVid = (s) => {
    //버튼 추가
    //1.a태그가 아닌 경우 부모노드에 자식노드 div를 만든다.
    //2.div안에 자식 노드로 버튼 추가를 원하는 img객체를 넣는다.
    //3.img객체 밑에 버튼을 추가한다.
    //4.a태그인 경우 부모노드의 부모노드에 자식노드 div를 만든다. 그래야 a태그의 클릭 효과를 받지 않는다.
    //5.2번,3번 과정과 동일.

    let setinput = document.createElement('input');
    setinput.setAttribute("value", "버튼 클릭 시 숨기기");
    setinput.setAttribute("type", "button");
    setinput.style.display = "block";
    setinput.addEventListener('click', function () { OnOff(s); });
    s.parentNode.insertBefore(setinput, s);
}
/*-------------------------------------------------------------------------*/
/*---------------------------버튼 동작: 버튼 클릭시 이미지 숨기기----------------------------------------------*/
let OnOff = (element) => {
    if (element.style.display != 'none') {
        element.style.display = 'none';
    }
    else {
        element.style.display = 'block';
    }
}
/*--------------------------------------------------------------------------------------------------------*/

/*--------------------------이미지 싹다 잡는 코드----------------------------------------------------------*/
let fold_all_image = (boolean, url) => {
    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let log_No = getLogNo(url);
    let identifier = 'post-view' + log_No;

    let check_iframe = document.getElementById('mainFrame')

    let getbody
    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;
        getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    }
    else{
        getbody = document.getElementById(identifier);
    }

    let getmaincontainer = getbody.getElementsByClassName('se-main-container');

    let getimgsrcold = getbody.getElementsByTagName('img');
    if (getmaincontainer.length != 0) {
        let getimgsrcnew = getmaincontainer[0].getElementsByTagName('img');
        if (getimgsrcnew.length != 0) {
            for (let i = 0; i < getimgsrcnew.length; i++) {
                let src = getimgsrcnew[i].outerHTML

                //let src = getimgsrcnew[i].getAttribute('src').toString();
                //블랭크 gif인 경우 넘기기
                if (src.indexOf('postfiles') != -1) {
                    //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                    if (boolean) {
                        getimgsrcnew[i].style.display = "none"
                        continue
                    }
                    else {
                        //false인 경우 모두 펼치기
                        getimgsrcnew[i].style.display = "block"
                        continue
                    } continue;
                }
                else if (src.indexOf('blogfiles') != -1) {
                    //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                    if (boolean) {
                        getimgsrcnew[i].style.display = "none"
                        continue
                    }
                    else {
                        //false인 경우 모두 펼치기
                        getimgsrcnew[i].style.display = "block"
                        continue
                    }
                }
                else {
                    continue;
                }
            }
        }
    }
    else {
        for (let i = 0; i < getimgsrcold.length; i++) {
            let src = getimgsrcold[i].outerHTML
            //let src = getimgsrcold[i].getAttribute('src').toString();
            //블랭크 gif인 경우 넘기기
            if (src.indexOf('postfiles') != -1) {
                //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                if (boolean) {
                    getimgsrcold[i].style.display = "none"
                    continue
                }
                else {
                    //false인 경우 모두 펼치기
                    getimgsrcold[i].style.display = "block"
                    continue
                } continue;
            }
            else if (src.indexOf('blogfiles') != -1) {
                //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                if (boolean) {
                    getimgsrcold[i].style.display = "none"
                    continue
                }
                else {
                    //false인 경우 모두 펼치기
                    getimgsrcold[i].style.display = "block"
                    continue
                } continue;
            }
            else {
                continue;
            }

        }
    }
}
/*--------------------------------------------------------------------------------------------------------*/

/*--------------------------이모티콘 싹다 잡는 코드--------------------------------------------------------*/
let fold_all_imoticon = (boolean, url) => {
    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let log_No = getLogNo(url);
    let identifier = 'post-view' + log_No;

    let check_iframe = document.getElementById('mainFrame')

    let getbody
    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;
        getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    }
    else{
        getbody = document.getElementById(identifier);
    }

    let getmaincontainer = getbody.getElementsByClassName('se-main-container');
    let getimgsrcold = getbody.getElementsByTagName('img');
    if (getmaincontainer.length != 0) {
        let getimgsrcnew = getmaincontainer[0].getElementsByTagName('img');
        if (getimgsrcnew.length != 0) {
            for (let i = 0; i < getimgsrcnew.length; i++) {

                let src = getimgsrcnew[i].outerHTML

                //let src = getimgsrcnew[i].getAttribute('src').toString();
                let x = 1;
                //블랭크 gif인 경우 넘기기
                if (src.indexOf('storep') != -1) {
                    //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
                    if (boolean) {
                        getimgsrcnew[i].style.display = "none"
                        continue
                    }
                    else {
                        //false인 경우 모두 펼치기
                        getimgsrcnew[i].style.display = "block"
                        continue
                    }
                }
                else if (src.indexOf('sticker') != -1) {
                    if (boolean) {
                        getimgsrcnew[i].style.display = "none"
                        continue
                    }
                    else {
                        //false인 경우 모두 펼치기
                        getimgsrcnew[i].style.display = "block"
                        continue
                    }
                }
                else {
                    continue;
                }
            }
        }
    }
    else {
        for (let i = 0; i < getimgsrcold.length; i++) {
            let src = getimgsrcold[i].outerHTML

            // let src = getimgsrcold[i].getAttribute('src').toString();
            let x = 1;
            //블랭크 gif인 경우 넘기기
            if (src.indexOf('storep') != -1) {
                //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
                if (boolean) {
                    getimgsrcold[i].style.display = "none"
                    continue
                }
                else {
                    //false인 경우 모두 펼치기
                    getimgsrcold[i].style.display = "block"
                    continue
                }
            }
            else if (src.indexOf('sticker') != -1) {
                if (boolean) {
                    getimgsrcold[i].style.display = "none"
                    continue
                }
                else {
                    //false인 경우 모두 펼치기
                    getimgsrcold[i].style.display = "block"
                    continue
                }
            }
            else {
                continue;
            }

        }
    }
}
/*--------------------------------------------------------------------------------------------------------*/

/*--------------------------비디오 싹다 잡는 코드----------------------------------------------------------*/
let fold_all_video = (boolean, url) => {
    //모든 이미지 접기 체크박스 체크되었는가?
    //iframe인 블로그가 존재하여 체크가 필요하다.
    let log_No = getLogNo(url);
    let identifier = 'post-view' + log_No;

    let check_iframe = document.getElementById('mainFrame')

    let getbody
    if (check_iframe != null) {
        document = document.getElementById('mainFrame').contentWindow.document;
        getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    }
    else{
        getbody = document.getElementById(identifier);
    }

    //옛날 버전에서 네이버 비디오 접기.
    let getVidSrc = getbody.getElementsByClassName('u_rmcplayer');
    let getViddiv = getbody.getElementsByClassName('se-main-container');
    if (getVidSrc.length != 0) {

        for (let i = 0; i < getVidSrc.length; i++) {
            if (boolean) {
                getVidSrc[i].style.display = 'none'
                continue
            }
            else {
                getVidSrc[i].style.display = 'block'
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
            }
            else {
                findYouVid[i].style.display = 'block'
                continue
            }
        }
        for (let i = 0; i < findNavVid.length; i++) {
            if (boolean) {
                findNavVid[i].style.display = 'none'
                continue
            }
            else {
                findNavVid[i].style.display = 'block'
                continue
            }
        }
    }

    let getiframe = getbody.getElementsByTagName('iframe')
    if (getiframe != undefined){
        if (getiframe.length != 0) {
            let getVidifram = getiframe[0]
            console.log(getiframe[0])
            if (getVidifram.outerHTML.indexOf("youtube") != -1) {
                if (boolean) {
                    getVidifram[i].style.display = 'none'
    
                }
                else {
                    getVidifram[i].style.display = 'block'
    
                }
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
                    width: 600,
                    title: "NBPA PreViewer"
                });
            $dialog.dialog('open');
            let elem = document.getElementsByClassName("ui-dialog")[0]
            elem.style.zIndex = "400000"
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
    // blog.me/

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

    let currentElementUrl = url

    if (BLOG_NAVER_ME_REGEXP.test(currentElementUrl)) {
        currentElementUrl = normalizePostViewUrl(url)
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
            arr_blog_element.push(current_node)
            getBlogUrlList(code, current_node_url)

            // 각 분석정보 컨테이너가 들어가는 div
            let analyze_info_container = document.createElement("div")

            let upper_container = document.createElement("div")
            let lower_container = document.createElement("div")

            upper_container.classList.add("_upper-container")
            lower_container.classList.add("_lower-container")

            // [로렘확률 (샘플텍스트 1,2 ,3)] [이미지 비율] [이모티콘 비율] [영상 비율] [게시글 미리보기 버튼] [부가정보 보기 버튼 (키워드, 해시태그, 하이퍼링크)]
            let button_post_preview = document.createElement("button")
            let button_additionalInfo_preview = document.createElement("button")
            let lorem_percentage = document.createElement("button")
            let multimedia_image_ratio = document.createElement("div")
            let multimedia_imoticon_ratio = document.createElement("div")
            let multimedia_video_ratio = document.createElement("div")

            // 각 요소에 클래스 속성 추가
            button_post_preview.classList.add('_button')
            button_post_preview.classList.add('_post-preview')
            button_additionalInfo_preview.classList.add('_button')
            button_additionalInfo_preview.classList.add('_additionalInfo-preview')

            analyze_info_container.classList.add('_analyze-info-container')
            lorem_percentage.classList.add('_lorem-percentage-container')
            multimedia_image_ratio.classList.add('_multimedia-image-ratio-container')
            multimedia_imoticon_ratio.classList.add('_multimedia-imoticon-ratio-container')
            multimedia_video_ratio.classList.add('_multimedia-video-ratio-container')

            // 버튼에 type 속성 추가
            lorem_percentage.setAttribute("type", "button")
            button_post_preview.setAttribute("type", "button")
            button_additionalInfo_preview.setAttribute("type", "button")

            // 버튼 내부에 텍스트 추가
            lorem_percentage.textContent = "불러오는 중"
            button_post_preview.textContent = "게시글 미리보기"
            button_additionalInfo_preview.textContent = "부가정보 보기"

            upper_container.appendChild(button_post_preview)
            upper_container.appendChild(button_additionalInfo_preview)

            lower_container.appendChild(lorem_percentage)
            lower_container.appendChild(multimedia_image_ratio)
            lower_container.appendChild(multimedia_imoticon_ratio)
            lower_container.appendChild(multimedia_video_ratio)

            analyze_info_container.appendChild(upper_container)
            analyze_info_container.appendChild(lower_container)

            // 타이틀 바로 위에 추가
            let total_sub = current_node.getElementsByClassName("total_sub")[0]
            total_sub.append(analyze_info_container)
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

        console.log({
            single_blog_info
        })

        if (element.analyzed_info) {
            let single_analyzed_info = JSON.parse(element.analyzed_info)[0]
            analyzed_info.push(single_analyzed_info)

            console.log({
                single_analyzed_info
            })
        }

        if (element.multimedia_ratios) {
            let single_multimedia_ratios = JSON.parse(element.multimedia_ratios)
            multimedia_ratios.push(single_multimedia_ratios)

            console.log({
                single_multimedia_ratios
            })
        }

        let single_tags = JSON.parse(element.tags)
        tags.push(single_tags)
        console.log({
            single_tags
        })

        let single_hyperlinks = JSON.parse(element.hyperlinks)
        hyperlinks.push(single_hyperlinks)
        console.log({
            single_hyperlinks
        })

        if (element.keywords) {
            let single_keywords = JSON.parse(element.keywords)
            keywords.push(single_keywords)

            console.log({
                single_keywords
            })
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
    let lorem_info_containers = document.getElementsByClassName('_lorem-percentage-container')
    let multimedia_image_ratio_container = document.getElementsByClassName('_multimedia-image-ratio-container')
    let multimedia_imoticon_ratio_container = document.getElementsByClassName('_multimedia-imoticon-ratio-container')
    let multimedia_video_ratio_container = document.getElementsByClassName('_multimedia-video-ratio-container')

    let length = arr_url_obj.length

    for (let i = 0; i < length; i++) {
        /* ---------- 분석정보 배열에서 로렘 확률 정보를 추출하여 출력 ----------*/
        if (analyzed_info[i] != undefined && Object.keys(analyzed_info[i]).length !== 0) {
            // 현재 객체가 비어있지 않을때 정보 출력 작업
            let current_analyzed_info = analyzed_info[i]['fields']
            let current_blog_info = current_analyzed_info['blog_info']
            let current_lorem_info_value = current_analyzed_info['lorem_percentage']

            let lorem_info_text
            if (current_lorem_info_value != -1){
                let current_lorem_percentage = (current_lorem_info_value * 100).toFixed(1)
                lorem_info_text = "로렘확률: " + current_lorem_percentage + "%"
            }
            else{
                lorem_info_text = "분석불가"
            }
            

            // 추출한 정보를 컨테이너 내부 텍스트로 할당
            lorem_info_containers.item(i).textContent = lorem_info_text

            // 로렘 버튼 색깔 변경
            lorem_info_containers.item(i).style.backgroundColor = "#f15c5c"

            // 로렘 버튼 보이게
            lorem_info_containers.item(i).style.display = "block"
            let current_multimedia_ratios
            if(multimedia_ratios != undefined){
                for (j = 0 ; j < multimedia_ratios.length ; j++){
                    if(multimedia_ratios[j].length > 0){
                        let blog_info = multimedia_ratios[j][0]['fields']['blog_info']
                        if (current_blog_info === blog_info){
                            current_multimedia_ratios = multimedia_ratios[j]
                            break
                        }
                    }
                    
                }
            }

            if (current_multimedia_ratios != undefined) {
                
                for (let j = 0; j < current_multimedia_ratios.length; j++) {
    
                    let current_single_multimedia_ratio = current_multimedia_ratios[j]['fields']
                    let current_single_multimedia_type = current_single_multimedia_ratio['ratio_type']
    
                    if (current_single_multimedia_type <= 3) {
                        let current_single_multimedia_ratio_value = current_single_multimedia_ratio['ratio']
                        let current_single_multimedia_ratio_percentage = (current_single_multimedia_ratio_value * 100).toFixed(1)
                        let current_multimedia_ratio_text = getMultimediaType(current_single_multimedia_type) + ": " + current_single_multimedia_ratio_percentage + "%"
    
                        // 추출한 정보를 정보타입네 따라 컨테이너 내부 텍스트로 할당
                        if (getMultimediaType(current_single_multimedia_type) === "이미지"){
                            multimedia_image_ratio_container.item(i).textContent = current_multimedia_ratio_text
                            multimedia_image_ratio_container.item(i).style.display = "block"
                        }
                        else if (getMultimediaType(current_single_multimedia_type) === "이모티콘"){
                            multimedia_imoticon_ratio_container.item(i).textContent = current_multimedia_ratio_text
                            multimedia_imoticon_ratio_container.item(i).style.display = "block"
                        }    
                        else if (getMultimediaType(current_single_multimedia_type) === "영상"){
                            multimedia_video_ratio_container.item(i).textContent = current_multimedia_ratio_text
                            multimedia_video_ratio_container.item(i).style.display = "block"
                        }
                    }
                }
            }
        } else {
            // 서버에서 아직 분석하는중이면
            lorem_info_containers.item(i).textContent = "분석하는 중"
        }
        
    }
}

let normalizePostViewUrl = (url) => {
    if (url.indexOf("m.blog.naver.com") != -1){
        url = url.replace("m.blog.naver.com", "blog.naver.com")
    }

    if (url.indexOf("logNo") == -1){
        return url
    }

    if (url.indexOf("blog.me") != -1){
        return convertBlogMeUrl(url)
    }

    let url_obj = new URL(url)

    console.log(url_obj)

    let url_search_param_obj = url_obj.searchParams

    console.log(url_search_param_obj)

    let url_blog_id = url_search_param_obj.get('blogId')
    let url_log_no = url_search_param_obj.get('logNo')

    console.log(url_blog_id)
    console.log(url_log_no)

    let normalize_url = "https://blog.naver.com/" + url_blog_id + "/" + url_log_no

    return normalize_url
}

// ------------------------------
let showSampleText = (index) => {
    let sample1, sample2, sample3 = ""

    sample1 = analyzed_info[index]['fields']['sample_1']
    sample2 = analyzed_info[index]['fields']['sample_2']
    sample3 = analyzed_info[index]['fields']['sample_3']

    if (sample1 === "" && sample2 === "" && sample3 === ""){
        sample1 = "분석 불가! 본문 텍스트가 없거나, 적당히 긴 문장이 존재하지 않는 것 같습니다."
    }


    let $dialog = $('<div></div>')
        .html('<p>' + sample1 + "<br>" + sample2 + "<br>" + sample3 + "<br>" + '</p>')
        .dialog({
            z_index: 100000,
            autoOpen: false,
            modal: true,
            height: 600,
            width: 600,
            title: "Analyzed Info Sample Viewer"
        });
    $dialog.dialog('open');
    // 로렘확률 컨테이너를 클릭하면 로렘확률에 대한 샘플 텍스트를 레이어팝업으로 보여주는 함수
    console.log("showSampleText")
}

let showPostPreview = (url) => {
    // 게시글 미리보기 버튼을 클릭하면 레이어팝업으로 게시글 모바일 버전의 페이지로 보여주는 함수
    let target_blog_url
    if (url.indexOf("PostView.nhn") != -1) {
        target_blog_url = normalizePostViewUrl(url)
    } else {
        target_blog_url = url
    }
    let splited_url = target_blog_url.split('//');
    let pure_url = splited_url[1];
    let new_url
    if (isBlogSectionElement(target_blog_url)) {
        new_url = "https://m." + pure_url;
    } else {
        new_url = target_blog_url
    }
    let $dialog = $('<div></div>')
        .html('<iframe style="border: 0px; " src="' + new_url + '" width="100%" height="100%"></iframe>')
        .dialog({
            autoOpen: false,
            modal: true,
            height: 600,
            width: 600,
            title: "NBPA PreViewer"
        });
    $dialog.dialog('open');
    let elem = document.getElementsByClassName("ui-dialog")[0]
    elem.style.zIndex = "400000"
}

let showPostAdditionalInfo = (index) => {
    // 게시글 부가정보 보기 버튼을 클릭하면 레이어 팝업으로 게시글 키워드(키워드 , 해시태그, 하이퍼 링크)를 보여주는 함수
    let table_string = "<table frame=void style=\"width:100%;table-layout:fixed;\"><tr><th>키워드</th><th>해시태그</th><th>외부링크</th></tr>"

    current_keywords = keywords[index]
    current_tags = tags[index]
    current_hyperlinks = hyperlinks[index]

    let max_line = 0
    if (current_keywords != undefined){
        if (max_line < current_keywords.length) {
            max_line = current_keywords.length
        }
    }
    
    if (current_tags != undefined){
        if (max_line < current_tags.length) {
            max_line = current_tags.length
        }
    }

    if (current_hyperlinks != undefined){
        if (max_line < current_hyperlinks.length) {
            max_line = current_hyperlinks.length
        }
    }

    if (current_keywords === undefined && current_tags === undefined && current_hyperlinks === undefined){
        alert("아직 분석이 되어있지 않습니다!")
        return
    }
    else if (max_line === 0){
        alert("분석정보가 없는 게시글입니다!")
        return
    }

    for (i = 0; i < max_line; i++) {

        table_string += "<tr style=\"border: 1px solid black\">"
        // 키워드 추가
        let keyword = ""
        if (current_keywords != undefined && current_keywords.length > i) {
            let keyword_org = current_keywords[i]["fields"]["word"]
            let keyword_word_only = keyword_org.split("/")[0]
            keyword = keyword_word_only
        }

        // 해시태그 추가
        let hashtag = ""
        if (current_tags != undefined && current_tags.length > i) {
            hashtag_org = current_tags[i]["fields"]["word"]
            hashtag = "#" + hashtag_org
        }

        // 하이퍼링크 추가
        let hyperlink = ""
        let short_hyperlink = ""
        if (current_hyperlinks != undefined && current_hyperlinks.length > i) {
            hyperlink = current_hyperlinks[i]["fields"]["word"]

            // http(s)://로 시작하는경우 ://이후의 주소만 취급함.
            if(hyperlink.indexOf("://") != -1){
                splited = hyperlink.split("://")
                if (splited.length >= 2){
                    hyperlink = splited[1]
                }
            }
            short_hyperlink = hyperlink.substring(0, 20) + "..."
            
        }
        if (keyword != "" || hashtag !== "" || hyperlink !== ""){
            table_string += "<td>" + keyword + "</td>"
            table_string += "<td> " + hashtag + "</td>"
            table_string += "<td><a href=\"" + hyperlink + "\" style=\"color: #0000FF;\" title=\"" + hyperlink +"\">" + short_hyperlink + "</a></td>"   
        }
        table_string += "</tr>"
    }

    table_string += "</table>"

    let $dialog = $('<div></div>')
        .html('<p>' + table_string + '</p>')
        .dialog({
            autoOpen: false,
            modal: true,
            height: 600,
            width: 600,
            title: "Additional Information Viewer"
        });
    $dialog.dialog('open');
    let elem = document.getElementsByClassName("ui-dialog")[0]
    elem.style.zIndex = "400000"

    console.log("showPostKeyword")
}

let setAnalyzeInfoEvent = () => {
    // 분석 정보 컨테이너의 로렘확률 컨테이너, 게시글 미리보기 버튼, 게시글 부가정보 보기 버튼에 대해 이벤트를 추가

    let lorem_info_container = document.getElementsByClassName('_lorem-percentage-container')
    let additionalInfo_preview_button = document.getElementsByClassName("_additionalInfo-preview")

    let length = arr_url_obj.length
    for (let i = 0; i < length; i++) {
        if (analyzed_info[i] != undefined && Object.keys(analyzed_info[i]).length !== 0) {
            // 현재 분석정보가 있을 때 페이크 이벤트 없애고 진짜 이벤트 등록함
            let current_lorem_info_container = lorem_info_container.item(i)
            current_lorem_info_container.removeEventListener("click", sampleButtonFakeEvent)
            current_lorem_info_container.addEventListener("click", () => {
                showSampleText(i)
            })

            // 부가정보 이벤트 등록
            // Fake EventListener를 삭제
            let current_additionalInfo_preview_button = additionalInfo_preview_button.item(i)
            current_additionalInfo_preview_button.removeEventListener("click", additionalInfoButtonFakeEvent)
            current_additionalInfo_preview_button.addEventListener("click", () => {
                showPostAdditionalInfo(i)
            })
        }
    }
}

// BLOG_NAVER 팝업에서 체크박스가 클릭되면 해당하는 멀티;미디어를 접는함수
let hideAllMultimediaByType = (checkbox_id, checkbox_status, url) => {
    switch (checkbox_id){
    case "all-image-close":
        fold_all_image(checkbox_status, url)
        break
    case "all-video-close":
        fold_all_video(checkbox_status, url)
        break
    case"all-imoticon-close":
        fold_all_imoticon(checkbox_status, url)
        break
    }
}

/* ------------------------- 슬라이더 동작 처리 ------------------------- */
let filter_check_dictionary = [false, false, false, false]
let filter_value_dictionary = [0, 0, 0, 0]

// 현재 슬라이더 값에 따라 블로그의 배경을 회색처리
let changeBackgroundByLoremPoss = (filter) => {
    let sliderValue
    if(!filter_check_dictionary[0]){
        return filter
    }
    else{
        sliderValue = filter_value_dictionary[0]
    }
    // 현재 페이지에서 성생된 로렘 확률 컨테이너를 탐색하여 저장
    let list_lorem_info_container = document.getElementsByClassName("_lorem-percentage-container")
    // 현재 페이지의 전체 분석 정보 컨테이너를 탐색하여 저장
    let list_analyze_info_container = document.getElementsByClassName("_analyze-info-container")

    // 현재 페이지에서 생성된 로렘 확률 컨테이너의 로렘확률 값을 저장하는 배열
    let arr_lorem_poss = []
    // 로렘 확률 값 저장
    if (list_lorem_info_container != undefined){
        for(let i = 0; i < list_lorem_info_container.length; i++) {
            let lorem_str = list_lorem_info_container.item(i).textContent
            if(lorem_str === ""){
                arr_lorem_poss.push(-1)
                continue
            }
            let lorem_str_frag = lorem_str.split(" ")
            let lorem_percentage = lorem_str_frag[1].split("%")
            let lorem_possiablity = parseFloat(lorem_percentage[0])
            arr_lorem_poss.push(lorem_possiablity)
        }
    
        for (let i = 0; i < list_lorem_info_container.length; i++) {
            if(arr_lorem_poss[i] != -1){
                if (arr_lorem_poss[i] >= sliderValue) {
                    filter[i] = true
                }
            }
            
        }
    }
    
    return filter
}

let changeBackgroundByImageRatio = (filter) => {
    let sliderValue
    if(!filter_check_dictionary[1]){
        return filter
    }
    else{
        sliderValue = filter_value_dictionary[1]
    }

    let list_multimedia_image_ratio = document.getElementsByClassName("_multimedia-image-ratio-container")

    // 현재 페이지의 생성된 이미지 비율 컨테이너에 이미지 비율 확률 값을 저장하는 배열
    let arr_image_ratio = []
    //이미지 비율값 저장
    if(list_multimedia_image_ratio != undefined){
        for(let i = 0; i < list_multimedia_image_ratio.length; i++) {
            let image_ratio_str = list_multimedia_image_ratio.item(i).textContent
            if(image_ratio_str ===""){
                arr_image_ratio.push(-1)
                continue
            }
            let image_ratio_str_frag = image_ratio_str.split(" ")
            let image_ratio_percentage = image_ratio_str_frag[1].split("%")
            let image_ratio = parseFloat(image_ratio_percentage[0])
            arr_image_ratio.push(image_ratio)
        }
    
        for (let i = 0; i < filter.length; i++) {
            if (list_multimedia_image_ratio.item(i).textContent === null){}
            else {
                if(arr_image_ratio[i] != -1) {
                    if(arr_image_ratio[i] >= sliderValue) {
                        filter[i] = true
                    }
                }
                
            }
        }
    }
    
    return filter
}

let changeBackgroundByImoticonRatio = ( filter) => {
    let sliderValue
    if(!filter_check_dictionary[2]){
        return filter
    }
    else{
        sliderValue = filter_value_dictionary[2]
    }

    let list_multimedia_imoticon_ratio = document.getElementsByClassName("_multimedia-imoticon-ratio-container")

    
    // 현재 페이지의 생성된 이모티콘비율 컨테이너에 이모티콘 비율 확률 값을 저장하는 배열
    let arr_imoticon_ratio = []
    //이모티콘 비율값 저장
    if(list_multimedia_imoticon_ratio != undefined){
        for(let i = 0; i < list_multimedia_imoticon_ratio.length; i++) {
            let imoticon_ratio_str = list_multimedia_imoticon_ratio.item(i).textContent
            if (imoticon_ratio_str === ""){
                arr_imoticon_ratio.push(-1)
                continue
            }
            let imoticon_ratio_str_frag = imoticon_ratio_str.split(" ")
            let imoticon_ratio_percentage = imoticon_ratio_str_frag[1].split("%")
            let imoticon_ratio = parseFloat(imoticon_ratio_percentage[0])
            arr_imoticon_ratio.push(imoticon_ratio)
        }
        
    
        for (let i = 0; i < filter.length; i++) {
            if (list_multimedia_imoticon_ratio.item(i).textContent === null){}
            else {
                if(arr_imoticon_ratio != -1){
                    if(arr_imoticon_ratio[i] >= sliderValue) {
                        filter[i] = true
                    }
                }
                
            }
        }
    }
    
    return filter
}

let changeBackgroundByVideoRatio = (filter) => {
    let sliderValue
    if(!filter_check_dictionary[3]){
        return filter
    }
    else{
        sliderValue = filter_value_dictionary[3]
    }
    let list_multimedia_video_ratio = document.getElementsByClassName("_multimedia-video-ratio-container")

    // 현재 페이지의 생성된 이미지 비율 컨테이너에 이미지 비율 확률 값을 저장하는 배열
    let arr_video_ratio = []
    //이미지 비율값 저장
    if(list_multimedia_video_ratio != undefined){
        for(let i = 0; i < list_multimedia_video_ratio.length; i++) {
            let video_ratio_str = list_multimedia_video_ratio.item(i).textContent
            if(video_ratio_str === ""){
                arr_video_ratio.push(-1)
                continue
            }
            let video_ratio_str_frag = video_ratio_str.split(" ")
            let video_ratio_percentage = video_ratio_str_frag[1].split("%")
            let video_ratio = parseFloat(video_ratio_percentage[0])
            arr_video_ratio.push(video_ratio)
        }

        for (let i = 0; i < filter.length; i++) {
            if (list_multimedia_video_ratio.item(i).textContent === null){}
            else {
                if(arr_video_ratio[i] != -1){
                    if(arr_video_ratio[i] >= sliderValue) {
                        filter[i] = true
                    }
                }
                
            }
        }
    }
    
    return filter
}

// SEARCH_NAVER 팝업에서 슬라이더 값이 변하면 블로그 배경 회색처리
let changeBackgorundColor = () => {
    if(arr_blog_element === undefined){
        return
    }

    getFilterCheck()
    getSliderValue()
}

let getFilterCheck = () =>{
    chrome.storage.local.get("lorem_poss_filter",function(obj){
        filter_check_dictionary[0] = checkToBoolean(obj.lorem_poss_filter, false)
    })
    chrome.storage.local.get("image_ratio_filter",function(obj){
        filter_check_dictionary[1] = checkToBoolean(obj.image_ratio_filter, false)
    })
    chrome.storage.local.get("imoticon_ratio_filter",function(obj){
        filter_check_dictionary[2] = checkToBoolean(obj.imoticon_ratio_filter, false)
    })
    chrome.storage.local.get("video_ratio_filter",function(obj){
        filter_check_dictionary[3] = checkToBoolean(obj.video_ratio_filter, false)
    })
}

let getSliderValue = () => {
    chrome.storage.local.get("lorem_poss_slider",function(obj){
        filter_value_dictionary[0] =  obj.lorem_poss_slider
    })
    chrome.storage.local.get("image_ratio_slider",function(obj){
        filter_value_dictionary[1] =  obj.image_ratio_slider
    })
    chrome.storage.local.get("imoticon_ratio_slider",function(obj){
        filter_value_dictionary[2] =  obj.imoticon_ratio_slider
        
    })
    chrome.storage.local.get("video_ratio_slider",function(obj){
        filter_value_dictionary[3] =  obj.video_ratio_slider
        // 필터 flase 로 초기화
        let filter = []
        for (let i = 0; i < arr_blog_element.length; i++) {
            filter.push(false)
        }

        fliter = changeBackgroundByLoremPoss(filter)
        fliter = changeBackgroundByImageRatio(filter)
        filter = changeBackgroundByImoticonRatio(filter)
        filter = changeBackgroundByVideoRatio(filter)

        for(i = 0 ; i < filter.length ; i++){
            let containers = document.getElementsByClassName('_analyze-info-container')
            let container = containers[i]
            let parentparentparent = container.parentNode.parentNode.parentNode
            if(filter[i]){
                // make container gray 
                parentparentparent.style.backgroundColor = "#CFCFCF"
            } else {
                // make container not gray
                parentparentparent.style.backgroundColor  = ""
            }
        }   
    })
    
}