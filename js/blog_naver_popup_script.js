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
    
    // 피드백 제출 버튼 리스너 등록
    send_feedback = document.getElementById("send-feedback")
    send_feedback.addEventListener("click", function(){
        // 제출 시 페이지가 전환되는걸 막음
        event.preventDefault()
        // 피드백 타입 선택 체크, 본문 비어있는지 체크.
        
    })
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