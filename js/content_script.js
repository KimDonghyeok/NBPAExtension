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
let search_result_list

let arr_xearch_url = []
let arr_view_url = []
let arr_blog_url = []

let arr_url_obj = []
let json_url_data

let arr_received_data = []

// 분석정보 변수
let blog_info = []
let analyzed_info = []
let multimedia_ratios = []
let tags = []
let hyperlinks = []
let keywords = []

/* ------------------------------ 이벤트처리기 ------------------------------ */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "TABCODE") {

        if (message.code === SEARCH_XEARCH_CODE || message.code === SEARCH_VIEW_CODE || message.code === SEARCH_BLOG_CODE) {
            // getBlogElementsList(message.code)
            // createAnalyzeInfoContainer(message.code, search_result_list)
            // convertArrToJsonArr(message.code)
            // showTable(message.code)

            let test_arr = []
            test_arr.push('https://blog.naver.com/lanoe600/50124020305')
            test_arr.push('https://blog.naver.com/iwolo8844ye/80127162828')
            test_arr.push('https://blog.naver.com/vostino/70142180356')
            test_arr.push('https://blog.naver.com/babyyej5/70145024358')
            test_arr.push('https://blog.naver.com/gus2253/30155510721')

            convertUrlToUrlObj(test_arr)
            json_url_data = JSON.stringify(arr_url_obj)

            chrome.runtime.sendMessage({
                message: "URLDATA",
                data: json_url_data
            })
        } else if (message.code === BLOG_NAVER_CODE) {
            console.log(message.code)
           // fold_all_image(true)
            multimedia_folding()
        }
    } else if (message.message === "ANALYZEINFO") {
        arr_received_data = message.data
        deserializeData(arr_received_data)
    }
})
/* ------------------------------ Folding ------------------------------ */
/*------------------------log_no 추출 함수------------------------------*/
let getLogNo = (document) => {
    let blogsrc = document.getAttribute('src');
    let blogstr = blogsrc.toString();
    let splitSrc = blogstr.split('&');

    for(let i =0; i<splitSrc.length;i++){
        console.log(splitSrc[i]);
        if(splitSrc[i].startsWith('logNo')){
            console.log("이걸 잡아야함: ",splitSrc[i]);
            test = splitSrc[i].split("=");
            console.log(test[1]);
            return test[1];
        }


    }
}

/* ------------------------------ 멀티미디어 접기 ------------------------------ */
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
    if(getiframe.length!=0){
        let getVidifram = getiframe[0]
                console.log(getiframe[0])
        if(getVidifram.outerHTML.indexOf("youtube")!=-1){
            btnInputVid(getVidifram.parentNode)
        }
    }
}
/*-----------------------------버튼추가----------------------------------*/
let btnInput =(s)=>{
    //버튼 추가
    //1.a태그가 아닌 경우 부모노드에 자식노드 div를 만든다.
    //2.div안에 자식 노드로 버튼 추가를 원하는 img객체를 넣는다.
    //3.img객체 밑에 버튼을 추가한다.
    //4.a태그인 경우 부모노드의 부모노드에 자식노드 div를 만든다. 그래야 a태그의 클릭 효과를 받지 않는다.
    //5.2번,3번 과정과 동일.

    let setinput = document.createElement('input');
    setinput.setAttribute("value","버튼 클릭시 이미지접기");
    setinput.setAttribute("type","button");
    setinput.style.display = "block";
    if(s.parentNode.nodeName ==='A'){
        console.log(s.parentNode.nodeName);
        if(s.parentNode.getAttribute("before")){
            s.parentNode.parentNode.parentNode.insertBefore(setinput,s.parentNode.parentNode);

        }
        s.parentNode.parentNode.insertBefore(setinput,s.parentNode);
    }
    else {
        s.parentNode.insertBefore(setinput,s);
    }
    setinput.addEventListener('click',function (){OnOff(s);});
}
/*-------------------------------------------------------------------------*/
/*-----------------------------비디오에 버튼추가----------------------------------*/
let btnInputVid =(s)=>{
    //버튼 추가
    //1.a태그가 아닌 경우 부모노드에 자식노드 div를 만든다.
    //2.div안에 자식 노드로 버튼 추가를 원하는 img객체를 넣는다.
    //3.img객체 밑에 버튼을 추가한다.
    //4.a태그인 경우 부모노드의 부모노드에 자식노드 div를 만든다. 그래야 a태그의 클릭 효과를 받지 않는다.
    //5.2번,3번 과정과 동일.

    let setinput = document.createElement('input');
    setinput.setAttribute("value","버튼 클릭시 이미지접기");
    setinput.setAttribute("type","button");
    setinput.style.display = "block";
    setinput.addEventListener('click',function (){OnOff(s);});
    s.parentNode.insertBefore(setinput,s);
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
let fold_all_image = (boolean) => {
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
    let log_No= getLogNo(check_iframe);
    let identifier = 'post-view' + log_No;
    let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
    let getmaincontainer = getbody.getElementsByClassName('se-main-container');
    
    let getimgsrcold =  getbody.getElementsByTagName('img');
    if(getmaincontainer.length !=0){
        let getimgsrcnew = getmaincontainer[0].getElementsByTagName('img');
        if (getimgsrcnew.length!=0){
            for (let i = 0; i < getimgsrcnew.length; i++) {
                let src = getimgsrcnew[i].outerHTML

                //let src = getimgsrcnew[i].getAttribute('src').toString();
                //블랭크 gif인 경우 넘기기
                if (src.indexOf('postfiles') != -1) {
                    //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                    if(boolean){
                        getimgsrcnew[i].style.display = "none"
                        continue
                    }
                    else{
                        //false인 경우 모두 펼치기
                        getimgsrcnew[i].style.display = "block"
                        continue
                    }                continue;
                }
                else if (src.indexOf('blogfiles') != -1) {
                    //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                    if(boolean){
                        getimgsrcnew[i].style.display = "none"
                        continue
                    }
                    else{
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
    else{
        for (let i = 0; i < getimgsrcold.length; i++) {
            let src = getimgsrcold[i].outerHTML
            //let src = getimgsrcold[i].getAttribute('src').toString();
            //블랭크 gif인 경우 넘기기
          if (src.indexOf('postfiles') != -1) {
                //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                if(boolean){
                    getimgsrcold[i].style.display = "none"
                    continue
                }
                else{
                    //false인 경우 모두 펼치기
                    getimgsrcold[i].style.display = "block"
                    continue
                }                         continue;
            }
            else if (src.indexOf('blogfiles') != -1) {
                //사진 접기용 버튼 추가. 버튼 추가와 동시에 사진 접기
                if(boolean){
                    getimgsrcold[i].style.display = "none"
                    continue
                }
                else{
                    //false인 경우 모두 펼치기
                    getimgsrcold[i].style.display = "block"
                    continue
                }                         continue;
            }
            else {
                continue;
            }

        }
    }
}
/*--------------------------------------------------------------------------------------------------------*/

/*--------------------------이모티콘 싹다 잡는 코드--------------------------------------------------------*/
let fold_all_imoticon = (boolean) => {
    //모든 이미지 접기 체크박스 체크되었는가?
  //iframe인 블로그가 존재하여 체크가 필요하다.
  let check_iframe = document.getElementById('mainFrame')

  if (check_iframe != null) {
      document = document.getElementById('mainFrame').contentWindow.document;

  }

  //let testdo = document.getElementsByTagName('div');
  let log_No= getLogNo(check_iframe);
  let identifier = 'post-view' + log_No;
  let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);
  
  let getmaincontainer = getbody.getElementsByClassName('se-main-container');
  let getimgsrcold =  getbody.getElementsByTagName('img');
  if(getmaincontainer.length!=0){
      
    let getimgsrcnew = getmaincontainer[0].getElementsByTagName('img');
}
  if(getimgsrcnew.length!=0){
      for (let i = 0; i < getimgsrcnew.length; i++) {
          
            let src = getimgsrcnew[i].outerHTML

          //let src = getimgsrcnew[i].getAttribute('src').toString();
          let x = 1;
          //블랭크 gif인 경우 넘기기
         if (src.indexOf('storep') != -1) {
              //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
              btnInput(getimgsrcnew[i]);
              if(boolean){
                getimgsrcnew[i].style.display = "none"
                continue
            }
            else{
                //false인 경우 모두 펼치기
                getimgsrcnew[i].style.display = "block"
                continue
            }
          }
          else if(src.indexOf('sticker') != -1){
            if(boolean){
                getimgsrcnew[i].style.display = "none"
                continue
            }
            else{
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
  else{
      for (let i = 0; i < getimgsrcold.length; i++) {
            let src = getimgsrcold[i].outerHTML

         // let src = getimgsrcold[i].getAttribute('src').toString();
          let x = 1;
          //블랭크 gif인 경우 넘기기
          if (src.indexOf('storep') != -1) {
              //이모티콘 접기용 버튼추가. 버튼 추가와 동시에 이모티콘 가리기.
              if(boolean){
                getimgsrcold[i].style.display = "none"
                continue
            }
            else{
                //false인 경우 모두 펼치기
                getimgsrcold[i].style.display = "block"
                continue
            }
          }
          else if(src.indexOf('sticker') != -1){
            if(boolean){
                getimgsrcold[i].style.display = "none"
                continue
            }
            else{
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
let fold_all_video = (boolean) => {
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
  let log_No= getLogNo(check_iframe);
  let identifier = 'post-view' + log_No;
  let getbody = document.getElementById('mainFrame').contentWindow.document.getElementById(identifier);

  //옛날 버전에서 네이버 비디오 접기.
  let getVidSrc = getbody.getElementsByClassName('u_rmcplayer');
  let getViddiv = getbody.getElementsByClassName('se-main-container');
  if(getVidSrc.length !=0){

      for (let i=0; i<getVidSrc.length;i++){
        if(boolean){
            findYouVid[i].style.display = 'none'
            continue
        }
        else{
            findYouVid[i].style.display = 'block'
            continue
        }
      }
  }
  if(getViddiv.length!=0) {
      let findYouVid = getViddiv[0].getElementsByClassName('se-component se-oembed se-l-default');
      //let findNavVid = getViddiv[0].getElementsByClassName('se-component se-video se-l-default');
      let findNavVid = getViddiv[0].getElementsByClassName('se-video');

      for(let i=0; i<findYouVid.length;i++){
          //btnInputVid(findYouVid[i]);
        if(boolean){
            findYouVid[i].style.display = 'none'
            continue
        }
        else{
            findYouVid[i].style.display = 'block'
            continue
        }
      }
      for (let i=0; i<findNavVid.length;i++){
        if(boolean){
            findNavVid[i].style.display = 'none'
            continue
        }
        else{
            findNavVid[i].style.display = 'block'
            continue
        }
      }
  }

  if(getiframe.length!=0){
    let getVidifram = getiframe[0]
            console.log(getiframe[0])
    if(getVidifram.outerHTML.indexOf("youtube")!=-1){
        if(boolean){
            getVidifram[i].style.display = 'none'
            continue
        }
        else{
            getVidifram[i].style.display = 'block'
            continue
        }
    }
}
}
/*--------------------------------------------------------------------------------------------------------*/


/* ------------------------------ PreView ------------------------------ */
$(function () {
    window.oncontextmenu = function () {
        return false;
    };

    $('a.api_txt_lines.total_tit').mousedown(function (e) {
        var mouse = e.button
        if (mouse == 2) {
            e.preventDefault();
            var page = $(this).attr("href")
            var x = page.split('//');
            var org_url = x[1];
            console.log(x[1]);
            var new_url = "https://m." + org_url;
            console.log(new_url);
            var $dialog = $('<div></div>')
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

            // let blog_info = document.createElement("div")
            let analyzed_info = document.createElement("div")
            let multimedia_ratios = document.createElement("div")
            // let tags = document.createElement("div")
            // let hyperlinks = document.createElement("div")
            // let keywords = document.createElement("div")

            analyze_info_container.classList.add('_analyze-info-container')

            // blog_info.classList.add('_blog-info')
            analyzed_info.classList.add('_analyzed-info')
            multimedia_ratios.classList.add('_multimedia-ratios')
            // tags.classList.add('_tags')
            // hyperlinks.classList.add('_hyperlinks')
            // keywords.classList.add('_keywords')

            // analyze_info_container.appendChild(blog_info)
            analyze_info_container.appendChild(analyzed_info)
            analyze_info_container.appendChild(multimedia_ratios)
            // analyze_info_container.appendChild(tags)
            // analyze_info_container.appendChild(hyperlinks)
            // analyze_info_container.appendChild(keywords)

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
    console.log(json_url_data)
    console.log(JSON.parse(json_url_data))
}

let deserializeData = (arr) => {
    // 백그라운드 스크립트로부터 받은 분석정보를 역직렬화하여 각 변수에 저장

    arr.forEach((element, index) => {
        // blog_info = JSON.parse(element.blog_info)[0]
        let single_blog_info = JSON.parse(element.blog_info)[0]
        blog_info.push(single_blog_info)
        console.log({
            single_blog_info
        })

        if (element.analyzed_info) {
            // analyzed_info = JSON.parse(element.analyzed_info)[0]
            let single_analyzed_info = JSON.parse(element.analyzed_info)[0]
            analyzed_info.push(single_analyzed_info)
            console.log({
                single_analyzed_info
            })
        }

        if (element.multimedia_ratios) {
            // multimedia_ratios = JSON.parse(element.multimedia_ratios)
            let single_multimedia_ratios = JSON.parse(element.multimedia_ratios)
            multimedia_ratios.push(single_multimedia_ratios)
            console.log({
                single_multimedia_ratios
            })
        }

        // tags = JSON.parse(element.tags)
        let single_tags = JSON.parse(element.tags)
        tags.push(single_tags)
        // hyperlinks = JSON.parse(element.hyperlinks)
        console.log({
            single_tags
        })

        let single_hyperlinks = JSON.parse(element.hyperlinks)
        hyperlinks.push(single_hyperlinks)
        console.log({
            single_hyperlinks
        })

        if (element.keywords) {
            // keywords = JSON.parse(element.keywords)
            let single_keywords = JSON.parse(element.keywords)
            keywords.push(single_keywords)

            console.log({
                single_keywords
            })
        }
    })

    // console.log("")
    // console.log(blog_info)
    // console.log(analyzed_info)
    // console.log(multimedia_ratios)
    // console.log(tags)
    // console.log(hyperlinks)
    // console.log(keywords)
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
            type = "비디오"
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

let setAnalyzedInfo = () => {
    let analyzed_info_container = document.getElementsByClassName('_analyzed-info')
    let multimedia_ratios_container = document.getElementsByClassName('_multimedia-ratios')

    let length = arr_url_obj.length

    for (let i = 0; i < length; i++) {
        let analyzed_info_value = analyzed_info[i]['lorem_percentage'].toFixed(3)
        let analyzed_info_text = "로렘확률: " + toString(analyzed_info_value)
        analyzed_info_container.item(i).innerHTML = analyzed_info_text

        for (let j = 0; j < multimedia_ratios[i].length; j++) {
            let type_id = multimedia_ratios[i]['ratio_type_id']
            let multimedia_ratios_value = multimedia_ratios[i]['ratio']
            let multimedia_ratios_text = getMultimediaType(type_id) + "비율: " + toString(multimedia_ratios_value)
        }
    }
}
