const HOST_IP = "nbpa.ddns.net"
const HOST_PORT = "33067"

// const HOST_IP = "127.0.0.1"
// const HOST_PORT = "8080"

const HOST_URL_HEAD = "http://" + HOST_IP + ":" + HOST_PORT + "/request/"

window.onload = function() {
    console.log("onload" + Date())

    // 체크박스 리스너 등록
    checkbox_all_image_close = document.getElementById("all-image-close")
    addCheckboxListener(checkbox_all_image_close)

    checkbox_all_video_close = document.getElementById("all-video-close")
    addCheckboxListener(checkbox_all_video_close)

    checkbox_all_imoticon_close = document.getElementById("all-imoticon-close")
    addCheckboxListener(checkbox_all_imoticon_close)

    // 스토리지와 체크박스를 동기화
    syncCheckboxStatus(checkbox_all_image_close)
    syncCheckboxStatus(checkbox_all_video_close)
    syncCheckboxStatus(checkbox_all_imoticon_close)
    
    // 피드백 제출 리스너 등록
    send_feedback = document.getElementById("send-feedback")
    addSendFeedbackListener(send_feedback)

    // 서버에게서 정보 받아오기
    getAnalyzedInfo()
}


/* ------------------------- 팝업 요소 상태 처리 함수 정의 ------------------------- */
// 불리언을 checked/unchecked로 변환, undefined면 defaultValue 반환
let booleanToCheck =(b, defaultValue) => {
    if (b === undefined){
        return defaultValue
    }
    return b ? "checked" : "unchecked"
}

// checked/unchecked를 불리언으로 변환, undefined면 defaultValue 반환
let checkToBoolean =(check, defaultValue) => {
    if (check === undefined){
        return defaultValue
    }
    return check === "checked"
}

// 체크박스를 주면 리스너에 등록함.
let addCheckboxListener = (checkbox) =>{
    // 체크박스의 상태가 변경되면 
    checkbox.addEventListener("change", function(){
        // 변경된 상태를 스토리지에 저장
        saveCheckboxStatus(checkbox)
        
        // 원하는 동작 처리 (ex, 이미지 모두 접기/ 비디오 모두 접기/ 이모티콘 모두 접기)
        checkboxMethodSelector(checkbox)
    })
}

// checkbox의 id로 실행할 메소드를 실행
let checkboxMethodSelector = (checkbox) => {
    let boolean = checkbox.checked
    switch(checkbox.id){
        case "all-image-close":
            // 이미지 숨기기 (boolean) 함수 호출바람.
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                let tabId = tabs[0].id

                chrome.tabs.sendMessage(tabId, {
                    message: "ALLIMAGEHIDE",
                    checkbox_id: checkbox.id,
                    status: boolean
                })
            })
            break
        case "all-video-close":
            // 영상 숨기기 (boolean) 함수 호출바람.
            break
        case "all-imoticon-close":
            // 이모티콘 (boolean) 함수 호출바람.
            break
    }
}


// 피드백 제출 버튼 리스너
let addSendFeedbackListener = (send_feedback) =>{
    send_feedback.addEventListener("click", function(){
        // 제출 시 페이지가 전환되는걸 막음
        event.preventDefault()

        // 피드백 타입 체크
        let feedback_type = getSelectedFeedbacktype()
        if (feedback_type == undefined){
            alert("피드백 유형을 선택해주세요")
            return
        }

        // 피드백 본문 비어있는지 체크.
        feedback_description = document.getElementById("feedback-description")
        let description
        if (feedback_description != undefined){
            description = feedback_description.value
            if (!description){
                alert("피드백 내용이 비어있습니다")
                return
            }
        }

        // 전송
        submitFeedback(feedback_type, description)
    })
}

// 선택된 피드백 타입을 반환
let getSelectedFeedbacktype = () =>{
    selected_feedback = document.getElementById("selected-feedback")
    if (selected_feedback != undefined){
        let options = selected_feedback.options

        for (i = 1 ; i < options.length; i++){
            if (options[i].selected == true){
                selected_option = options[i]
                return selected_option.value
            }
        }
    }
}

// 피드백 관련 선택/입력 초기화
let clearFeedback = () =>{
    selected_feedback = document.getElementById("selected-feedback")
    if (selected_feedback != undefined){
        let options = selected_feedback.options

        options[0].selected = true
        for (i = 1 ; i < options.length; i++){
            options[i].selected = false
        }
    }

    feedback_description = document.getElementById("feedback-description")
    if (feedback_description != undefined){
        feedback_description.value = ""
    }
}

// 피드백 전송 이후 서버의 응답 처리
let feedbackCallback = (xhr) => {
    if (xhr.status === 200 || xhr.status === 201) {
        const received_arr = JSON.parse(xhr.response)

        let header = received_arr[0]

        // 서버의 응답 표시
        alert(header.message)

        // 서버에서 피드백을 성공적으로 받았다면 피드백 타입과 본문이랑 비워줘야함
        if (header.success === "True") {
            clearFeedback()
        }

    } else {
        console.error(xhr.responseText);
    }
}

// 서버로 피드백 데이터 전송
let submitFeedback = (feedback_type, message) => {
    // 현재 페이지의 URL 추출
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let current_url  = tabs[0].url

        if (current_url == undefined){
            alert("[submitFeedback] current_url is undefined!")
            return
        }
        data = {}
        data['url'] = current_url
        data['feedback_type'] = feedback_type
        data['message'] = message
        
        // 서버와 통신하기 위한 XMLHttpRequest 객체
        let xhr = new XMLHttpRequest();

        // 콜백 함수 등록
        xhr.onload = function () {
            feedbackCallback(xhr)
        }

        // 전송
        let request_url = HOST_URL_HEAD + "user/feedback/send"

        xhr.open("POST", request_url)
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

        // Send JSON array
        json = JSON.stringify(data)
        xhr.send(json);
    })   
}

let getDivIdByRatioType = (ratio_type) => {
    switch(ratio_type){
        case 1:
            return "image_ratio"
        case 2:
            return "imoticon_ratio"
        case 3:
            return "video_ratio"
    }
}

let getRatioNameByRatioType = (ratio_type) => {
    switch(ratio_type){
        case 1:
            return "이미지 비율"
        case 2:
            return "이모티콘 비율"
        case 3:
            return "비디오 비율"
    }
}

// 서버로부터 분석정보 받아옴
let getAnalyzedInfoCallback = (xhr) =>{
    if (xhr.status === 200 || xhr.status === 201) {
        const received_arr = JSON.parse(xhr.response)

        let header = received_arr[0]

        // 분석정보 가져오는데 성공했다면
        if (header.success === "True") {
            let received_data = received_arr[1]

            // 각 정보를 알맞게 추출한다.
            if ("analyzed_info" in received_data){
                let analyzed_info = JSON.parse(received_data["analyzed_info"])[0]["fields"]
                let lorem_percentage_string = analyzed_info["lorem_percentage"].toFixed(3)
                // 로렘 확률 표시
                let lorem_percentage_div = document.getElementById("lorem_percentage")
                lorem_percentage_div.innerHTML = "로렘 확률 : " + lorem_percentage_string
            }

            if ("multimedia_ratios" in received_data){
                let multimedia_ratios = JSON.parse(received_data["multimedia_ratios"])
                multimedia_ratios.forEach(element => {
                    let multimedia_ratio = element["fields"]
                    let ratio_type = multimedia_ratio["ratio_type"]
                    let ratio_string = multimedia_ratio["ratio"].toFixed(3)

                    let div_id = getDivIdByRatioType(ratio_type)
                    let ratio_div = document.getElementById(div_id)
                    let ratio_type_name = getRatioNameByRatioType(ratio_type)
                    ratio_div.innerHTML = ratio_type_name + " : " + ratio_string
                });
            }
            
            console.log('success')
        } else{
            console.error(header.message)
        }

    } else {
        console.error(xhr.responseText);
    }
}

// 서버로 url 전송하고 관련 데이터 받아옴
let getAnalyzedInfo = () =>{
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let current_url  = tabs[0].url
        if (current_url == undefined){
            alert("[getAnalyzedInfo] current_url is undefined!")
            return
        }
        data = {}
        
        data['url'] = current_url

        // 서버와 통신하기 위한 XMLHttpRequest 객체
        let xhr = new XMLHttpRequest();

        // 콜백 함수 등록
        xhr.onload = function () {
            getAnalyzedInfoCallback(xhr)
        }

        // 전송
        let request_url = HOST_URL_HEAD + "user/analyzedinfo/get"

        xhr.open("POST", request_url)
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

        // Send JSON array
        all_data = [data, ]
        json = JSON.stringify(all_data)
        xhr.send(json);
    })
}

/* ------------------------- 로직 ------------------------- */


/* ------------------------- 스토리지 관련 하드코딩 ------------------------- */

// 체크박스 스토리지 저장
let saveCheckboxStatus = (checkbox) =>{

    let checked_string = booleanToCheck(checkbox.checked, false)

    switch(checkbox.id){
        case "all-image-close":
            chrome.storage.local.set({"all_image_close": checked_string},function(){})
            break
        case "all-video-close":
            chrome.storage.local.set({"all_video_close": checked_string},function(){})
            break
        case "all-imoticon-close":
            chrome.storage.local.set({"all_imoticon_close": checked_string},function(){})
            break
    }
}

// 체크박스를 주면 스토리지에서 동기화
let syncCheckboxStatus = (checkbox) =>{
    switch(checkbox.id){
        case "all-image-close":
            chrome.storage.local.get("all_image_close",function(obj){
                checkbox.checked = checkToBoolean(obj.all_image_close, false)
            })
            break
        case "all-video-close":
            chrome.storage.local.get("all_video_close",function(obj){
                checkbox.checked = checkToBoolean(obj.all_video_close, false)
            })
            break
        case "all-imoticon-close":
            chrome.storage.local.get("all_imoticon_close",function(obj){
                checkbox.checked = checkToBoolean(obj.all_imoticon_close, false)
            })
            break
    }
}