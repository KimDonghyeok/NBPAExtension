class BlogPopup {
    constructor() {
        this.popup_blog_naver = document.querySelector(".blog_naver_popup")
        this.popup_feedback = document.querySelector(".feedback")
    }

    get blog_naver_popup() {
        return this.popup_blog_naver
    }

    get feedback_popup() {
        return this.popup_feedback
    }
}

// 불리언을 checked/unchecked로 변환
let booleanToCheck =(b) => {
    return b ? "checked" : "unchecked"
}

// checked/unchecked를 불리언으로 변환
let checkToBoolean =(check) => {
    return check === "checked"
}

// 체크박스 스토리지 저장
let saveCheckboxStatus = (checkbox) =>{

    let checked_string = booleanToCheck(checkbox.checked)

    if(checkbox.id === "all-image-close"){
        chrome.storage.local.set({"all_image_checkbox": checked_string},function(){
            console.log("all_video_checkbox " + checked_string + " saved")
        })
    } else if(checkbox.id === 'all-video-close'){
        chrome.storage.local.set({"all_video_checkbox": checked_string},function(){
            console.log("all_video_checkbox " + checked_string + " saved")
        })
    }
    else if(checkbox.id === 'all-imoticon-close'){
        chrome.storage.local.set({"all_imoticon_checkbox": checked_string},function(){
            console.log("all_imoticon_checkbox " + checked_string + " saved")
        })
    }
    return 
}

// 체크박스를 주면 스토리지에서 동기화
let syncCheckboxStatus = (checkbox) =>{
    if(checkbox.id === "all-image-close"){
        chrome.storage.local.get("all_image_checkbox",function(obj){
            bool = checkToBoolean(obj.all_image_checkbox)
            checkbox.checked = bool
        })
    } 
    else if(checkbox.id === 'all-video-close'){
        chrome.storage.local.get("all_video_checkbox",function(obj){
            bool = checkToBoolean(obj.all_video_checkbox)
            checkbox.checked = bool
        })
    }
    else if(checkbox.id === 'all-imoticon-close'){
        chrome.storage.local.get("all_imoticon_checkbox",function(obj){
            bool = checkToBoolean(obj.all_imoticon_checkbox)
            checkbox.checked = bool
        })
    }
}

window.onload = function() {
    console.log("onload" + Date())

    // 체크박스 리스너 등록
    checkbox_all_image_close = document.getElementById("all-image-close")
    checkbox_all_image_close.addEventListener("change", function(){
        saveCheckboxStatus(checkbox_all_image_close)
    })

    checkbox_all_video_close = document.getElementById("all-video-close")
    checkbox_all_video_close.addEventListener("change", function(){
        saveCheckboxStatus(checkbox_all_video_close)
    })

    checkbox_all_imoticon_close = document.getElementById("all-imoticon-close")
    checkbox_all_imoticon_close.addEventListener("change", function(){
        saveCheckboxStatus(checkbox_all_imoticon_close)
    })

    syncCheckboxStatus(checkbox_all_image_close)
    syncCheckboxStatus(checkbox_all_video_close)
    syncCheckboxStatus(checkbox_all_imoticon_close)
}