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
        let boolean = checkbox.checked

        if(boolean){
            console.log("do checked method")
        } else{
            console.log("do unchecked method")
        }
    })
}

// 체크박스 스토리지 저장
let saveCheckboxStatus = (checkbox) =>{

    let checked_string = booleanToCheck(checkbox.checked, false)

    if(checkbox.id === "all-image-close"){
        chrome.storage.local.set({"all_image_close": checked_string},function(){
            console.log("all_image_close " + checked_string + " saved")
        })
    } else if(checkbox.id === 'all-video-close'){
        chrome.storage.local.set({"all_video_close": checked_string},function(){
            console.log("all_video_close " + checked_string + " saved")
        })
    }
    else if(checkbox.id === 'all-imoticon-close'){
        chrome.storage.local.set({"all_imoticon_close": checked_string},function(){
            console.log("all_imoticon_close " + checked_string + " saved")
        })
    }
    return 
}

// 체크박스를 주면 스토리지에서 동기화
let syncCheckboxStatus = (checkbox) =>{
    if(checkbox.id === "all-image-close"){
        chrome.storage.local.get("all_image_close",function(obj){
            bool = checkToBoolean(obj.all_image_close, false)
            checkbox.checked = bool
        })
    } 
    else if(checkbox.id === 'all-video-close'){
        chrome.storage.local.get("all_video_close",function(obj){
            bool = checkToBoolean(obj.all_video_close, false)
            checkbox.checked = bool
        })
    }
    else if(checkbox.id === 'all-imoticon-close'){
        chrome.storage.local.get("all_imoticon_close",function(obj){
            bool = checkToBoolean(obj.all_imoticon_close, false)
            checkbox.checked = bool
        })
    }
}

