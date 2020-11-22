class SearchPopup {
    constructor() {
        this.popup_search_naver = document.querySelector(".search_naver_popup")
    }

    get search_naver_popup() {
        return this.popup_search_naver
    }
}

window.onload = function() {
    console.log("onload" + Date())

    // 체크박스 리스너 등록
    checkbox_lorem_poss_view = document.getElementById("lorem-poss-view")
    addCheckboxListener(checkbox_lorem_poss_view)

    checkbox_image_ratio_view = document.getElementById("image-ratio-view")
    addCheckboxListener(checkbox_image_ratio_view)

    checkbox_video_ratio_view = document.getElementById("video-ratio-view")
    addCheckboxListener(checkbox_video_ratio_view)

    checkbox_imoticon_ratio_view = document.getElementById("imoticon-ratio-view")
    addCheckboxListener(checkbox_imoticon_ratio_view)

    // 스토리지와 체크박스를 동기화
    syncCheckboxStatus(checkbox_lorem_poss_view)
    syncCheckboxStatus(checkbox_image_ratio_view)
    syncCheckboxStatus(checkbox_video_ratio_view)
    syncCheckboxStatus(checkbox_imoticon_ratio_view)
}


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
    checkbox.addEventListener("change", function(){
        // 변경된 값을 스토리지에 저장
        saveCheckboxStatus(checkbox)
        // 체크박스에 맞는 명령 실행
        checkboxMethodSelector(checkbox)
    })
}

// checkbox의 id로 실행할 메소드를 실행
let checkboxMethodSelector = (checkbox) => {
    let boolean = checkbox.checked
    if(checkbox.id === "lorem-poss-view"){
        // 로렘 확률 ON/OFF(boolean) 함수 호출바람.
    } else if(checkbox.id === "image-ratio-view"){
        // 이미지 비율 ON/OFF(boolean) 함수 호출바람.
    } else if(checkbox.id === "video-ratio-view"){
        // 영상 비율 ON/OFF(boolean) 함수 호출바람.
    } else if(checkbox.id === "imoticon-ratio-view"){
        // 이모티콘 비율 ON/OFF(boolean) 함수 호출바람.
    }
    
}

// ----------------- 스토리지 관련 하드코딩 ---------------------- //

// 체크박스 스토리지 저장
let saveCheckboxStatus = (checkbox) =>{

    let checked_string = booleanToCheck(checkbox.checked, false)

    if(checkbox.id === "lorem-poss-view"){
        chrome.storage.local.set({"lorem_poss_view": checked_string},function(){
            console.log("lorem_poss_view " + checked_string + " saved")
        })
    } else if(checkbox.id === "image-ratio-view"){
        chrome.storage.local.set({"image_ratio_view": checked_string},function(){
            console.log("image_ratio_view " + checked_string + " saved")
        })
    }
    else if(checkbox.id === "video-ratio-view"){
        chrome.storage.local.set({"video_ratio_view": checked_string},function(){
            console.log("video_ratio_view " + checked_string + " saved")
        })
    }
    else if(checkbox.id === "imoticon-ratio-view"){
        chrome.storage.local.set({"imoticon_ratio_view": checked_string},function(){
            console.log("imoticon_ratio_view " + checked_string + " saved")
        })
    }
}

// 체크박스를 주면 스토리지에서 동기화
let syncCheckboxStatus = (checkbox) =>{
    if(checkbox.id === "lorem-poss-view"){
        chrome.storage.local.get("lorem_poss_view",function(obj){
            bool = checkToBoolean(obj.lorem_poss_view, true)
            checkbox.checked = bool
        })
    } 
    else if(checkbox.id === "image-ratio-view"){
        chrome.storage.local.get("image_ratio_view",function(obj){
            bool = checkToBoolean(obj.image_ratio_view, true)
            checkbox.checked = bool
        })
    }
    else if(checkbox.id === "video-ratio-view"){
        chrome.storage.local.get("video_ratio_view",function(obj){
            bool = checkToBoolean(obj.video_ratio_view, true)
            checkbox.checked = bool
        })
    }
    else if(checkbox.id === "imoticon-ratio-view"){
        chrome.storage.local.get("imoticon_ratio_view",function(obj){
            bool = checkToBoolean(obj.imoticon_ratio_view, true)
            checkbox.checked = bool
        })
    }
    
}