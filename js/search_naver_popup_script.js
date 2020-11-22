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

    // 보기설정 체크박스 리스너 등록
    checkbox_lorem_poss_view = document.getElementById("lorem-poss-view")
    addCheckboxListener(checkbox_lorem_poss_view)

    checkbox_image_ratio_view = document.getElementById("image-ratio-view")
    addCheckboxListener(checkbox_image_ratio_view)

    checkbox_video_ratio_view = document.getElementById("video-ratio-view")
    addCheckboxListener(checkbox_video_ratio_view)

    checkbox_imoticon_ratio_view = document.getElementById("imoticon-ratio-view")
    addCheckboxListener(checkbox_imoticon_ratio_view)

    // 필터설정 체크박스 리스너 등록
    checkbox_lorem_poss_filter = document.getElementById("lorem-poss-filter")
    addCheckboxListener(checkbox_lorem_poss_filter)

    checkbox_image_ratio_filter = document.getElementById("image-ratio-filter")
    addCheckboxListener(checkbox_image_ratio_filter)

    checkbox_video_ratio_filter = document.getElementById("video-ratio-filter")
    addCheckboxListener(checkbox_video_ratio_filter)

    checkbox_imoticon_ratio_filter = document.getElementById("imoticon-ratio-filter")
    addCheckboxListener(checkbox_imoticon_ratio_filter)

    // 필터 슬라이더 리스너 등록
    lorem_poss_slider = document.getElementById("lorem-poss-slider")
    addSliderListener(lorem_poss_slider)

    image_ratio_slider = document.getElementById("image-ratio-slider")
    addSliderListener(image_ratio_slider)

    video_ratio_slider = document.getElementById("video-ratio-slider")
    addSliderListener(video_ratio_slider)

    imoticon_ratio_slider = document.getElementById("imoticon-ratio-slider")
    addSliderListener(imoticon_ratio_slider)

    // 스토리지와 체크박스를 동기화
    syncCheckboxStatus(checkbox_lorem_poss_view)
    syncCheckboxStatus(checkbox_image_ratio_view)
    syncCheckboxStatus(checkbox_video_ratio_view)
    syncCheckboxStatus(checkbox_imoticon_ratio_view)
    syncCheckboxStatus(checkbox_lorem_poss_filter)
    syncCheckboxStatus(checkbox_image_ratio_filter)
    syncCheckboxStatus(checkbox_video_ratio_filter)
    syncCheckboxStatus(checkbox_imoticon_ratio_filter)

    // 스토리지와 슬라이더를 동기화
    syncSliderStatus(lorem_poss_slider)
    syncSliderStatus(image_ratio_slider)
    syncSliderStatus(video_ratio_slider)
    syncSliderStatus(imoticon_ratio_slider)
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
    checkbox.addEventListener("change", function(){
        // 변경된 값을 스토리지에 저장
        saveCheckboxStatus(checkbox)
        // 체크박스에 맞는 명령 실행
        checkboxMethodSelector(checkbox)
    })
}

let addSliderListener = (slider) =>{
    slider.addEventListener("change", function(){
        // 변경된 값을 스토리지에 저장
        saveSliderStatus(slider)
        // 슬라이더 값이 변경되었을 때 수행하는 명령 호출
        // sliderMethodSelector(slider))
    })
}

// checkbox의 id로 실행할 메소드를 실행
let checkboxMethodSelector = (checkbox) => {
    let checkboxId = checkbox.id
    let boolean = checkbox.checked

    switch(checkboxId){
        case "lorem-poss-view":
            // 로렘 확률 표시 함수 호출
            break
        case "image-ratio-view":
            // 이미지 비율 표시 함수 호출
            break
        case "video-ratio-view":
            // 영상 비율 표시 함수 호출
            break
        case "imoticon-ratio-view":
            // 이모티콘 비율 표시 함수 호출
            break
        case "lorem-poss-filter":
        case "image-ratio-filter":
        case "video-ratio-filter":
        case "imoticon-ratio-filter":
            // 필터 활성/비활성화 함수 호출
            sliderId = getSliderId(checkboxId)
            changeSliderStatus(sliderId, boolean)
            break
    }   
}

/* ------------------------- 로직 ------------------------- */

// 체크박스 ID를 주면 슬라이더 ID를 반환
let getSliderId = (checkboxId) =>{
    switch (checkboxId){
        case "lorem-poss-filter":
            return "lorem-poss-slider"
        case "image-ratio-filter":
            return "image-ratio-slider"
        case "video-ratio-filter":
            return "video-ratio-slider"
        case "imoticon-ratio-filter":
            return "imoticon-ratio-slider" 
    }
}

// 슬라이더 ID와 활성화여부를 받으면 슬라이더를 활성화/비활성화 함
let changeSliderStatus = (sliderId, enabled) =>{
    slider = document.getElementById(sliderId)
    if (slider != undefined){
        slider.disabled = !enabled
    }
}

/* ------------------------- 스토리지 관련 하드코딩 ------------------------- */

// 체크박스 스토리지 저장
let saveCheckboxStatus = (checkbox) =>{
    let checked_string = booleanToCheck(checkbox.checked, false)

    switch(checkbox.id){
        case "lorem-poss-view":
            chrome.storage.local.set({"lorem_poss_view": checked_string},function(){})
            break
        case "image-ratio-view":
            chrome.storage.local.set({"image_ratio_view": checked_string},function(){})
            break
        case "video-ratio-view":
            chrome.storage.local.set({"video_ratio_view": checked_string},function(){})
            break
        case "imoticon-ratio-view":
            chrome.storage.local.set({"imoticon_ratio_view": checked_string},function(){})
            break
        case "lorem-poss-filter":
            chrome.storage.local.set({"lorem_poss_filter": checked_string},function(){})
            break
        case "image-ratio-filter":
            chrome.storage.local.set({"image_ratio_filter": checked_string},function(){})
            break
        case "video-ratio-filter":
            chrome.storage.local.set({"video_ratio_filter": checked_string},function(){})
            break
        case "imoticon-ratio-filter":
            chrome.storage.local.set({"imoticon_ratio_filter": checked_string},function(){})
            break
    }
}

// 체크박스를 주면 스토리지에서 동기화
let syncCheckboxStatus = (checkbox) =>{
    switch(checkbox.id){
        case "lorem-poss-view":
            chrome.storage.local.get("lorem_poss_view",function(obj){
                checkbox.checked = checkToBoolean(obj.lorem_poss_view, true)
            })
            break
        case "image-ratio-view":
            chrome.storage.local.get("image_ratio_view",function(obj){
                checkbox.checked = checkToBoolean(obj.image_ratio_view, true)
            })
            break
        case "video-ratio-view":
            chrome.storage.local.get("video_ratio_view",function(obj){
                checkbox.checked = checkToBoolean(obj.video_ratio_view, true)
            })
            break
        case "imoticon-ratio-view":
            chrome.storage.local.get("imoticon_ratio_view",function(obj){
                checkbox.checked = checkToBoolean(obj.imoticon_ratio_view, true)
            })
            break
        case "lorem-poss-filter":
            chrome.storage.local.get("lorem_poss_filter",function(obj){
                checkbox.checked = checkToBoolean(obj.lorem_poss_filter, false)
                let sliderId = getSliderId(checkbox.id)
                changeSliderStatus(sliderId, checkbox.checked)
            })
            break
        case "image-ratio-filter":
            chrome.storage.local.get("image_ratio_filter",function(obj){
                checkbox.checked = checkToBoolean(obj.image_ratio_filter, false)
                let sliderId = getSliderId(checkbox.id)
                changeSliderStatus(sliderId, checkbox.checked)
            })
            break
        case "video-ratio-filter":
            chrome.storage.local.get("video_ratio_filter",function(obj){
                checkbox.checked = checkToBoolean(obj.video_ratio_filter, false)
                let sliderId = getSliderId(checkbox.id)
                changeSliderStatus(sliderId, checkbox.checked)
            })
            break
        case "imoticon-ratio-filter":
            chrome.storage.local.get("imoticon_ratio_filter",function(obj){
                checkbox.checked = checkToBoolean(obj.imoticon_ratio_filter, false)
                let sliderId = getSliderId(checkbox.id)
                changeSliderStatus(sliderId, checkbox.checked)
            })
            break
    }
}

// 슬라이더 상태 스토리지 저장
let saveSliderStatus = (slider) =>{
    let value_string = slider.value

    switch(slider.id){
        case "lorem-poss-slider":
            chrome.storage.local.set({"lorem_poss_slider": value_string},function(){})
            break
        case "image-ratio-slider":
            chrome.storage.local.set({"image_ratio_slider": value_string},function(){})
            break
        case "video-ratio-slider":
            chrome.storage.local.set({"video_ratio_slider": value_string},function(){})
            break
        case "imoticon-ratio-slider":
            chrome.storage.local.set({"imoticon_ratio_slider": value_string},function(){})
            break
    }
}

// 슬라이더를 주면 스토리지에서 동기화
let syncSliderStatus = (slider) =>{
    switch(slider.id){
        case "lorem-poss-slider":
            chrome.storage.local.get("lorem_poss_slider",function(obj){
                if (obj.lorem_poss_slider != undefined){
                    slider.value = obj.lorem_poss_slider
                }
            })
            break
        case "image-ratio-slider":
            chrome.storage.local.get("image_ratio_slider",function(obj){
                if (obj.image_ratio_slider != undefined){
                    slider.value = obj.image_ratio_slider
                }
            })
            break
        case "video-ratio-slider":
            chrome.storage.local.get("video_ratio_slider",function(obj){
                if (obj.video_ratio_slider != undefined){
                    slider.value = obj.video_ratio_slider
                }
            })
            break
        case "imoticon-ratio-slider":
            chrome.storage.local.get("imoticon_ratio_slider",function(obj){
                if (obj.imoticon_ratio_slider != undefined){
                    slider.value = obj.imoticon_ratio_slider
                }
            })
            break
    }
}