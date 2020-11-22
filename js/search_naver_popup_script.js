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

    if(checkbox.id === "lorem-poss-view"){
        chrome.storage.local.set({"lorem_poss_view": checked_string},function(){
            console.log("lorem_poss_view " + checked_string + " saved")
        })
    } else if(checkbox.id === 'image-ratio-view'){
        chrome.storage.local.set({"image_ratio_view": checked_string},function(){
            console.log("image_ratio_view " + checked_string + " saved")
        })
    }
    else if(checkbox.id === 'video-ratio-view'){
        chrome.storage.local.set({"video_ratio_view": checked_string},function(){
            console.log("video_ratio_view " + checked_string + " saved")
        })
    }
    else if(checkbox.id === 'imoticon-ratio-view'){
        chrome.storage.local.set({"imoticon_ratio_view": checked_string},function(){
            console.log("imoticon_ratio_view " + checked_string + " saved")
        })
    }
}

// 체크박스를 주면 스토리지에서 동기화
let syncCheckboxStatus = (checkbox) =>{
    if(checkbox.id === "lorem-poss-view"){
        chrome.storage.local.get("lorem_poss_view",function(obj){
            bool = checkToBoolean(obj.lorem_poss_view)
            checkbox.checked = bool
        })
    } 
    else if(checkbox.id === 'image-ratio-view'){
        chrome.storage.local.get("image_ratio_view",function(obj){
            bool = checkToBoolean(obj.image_ratio_view)
            checkbox.checked = bool
        })
    }
    else if(checkbox.id === 'video-ratio-view'){
        chrome.storage.local.get("video_ratio_view",function(obj){
            bool = checkToBoolean(obj.video_ratio_view)
            checkbox.checked = bool
        })
    }
    else if(checkbox.id === 'imoticon-ratio-view'){
        chrome.storage.local.get("imoticon_ratio_view",function(obj){
            bool = checkToBoolean(obj.imoticon_ratio_view)
            checkbox.checked = bool
        })
    }
    
}

// 체크박스를 주면 리스너에 등록함.
let addCheckboxListener = (checkbox) =>{
    checkbox.addEventListener("change", function(){
        saveCheckboxStatus(checkbox)
        
        if(checkbox.checked){
            // 확률이 보이게
        } else{
            // 확률이 안보이게
        }
    })
}