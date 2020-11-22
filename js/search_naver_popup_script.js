class SearchPopup {
    constructor() {
        this.popup_search_naver = document.querySelector(".search_naver_popup")
    }

    get search_naver_popup() {
        return this.popup_search_naver
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

window.onload = function() {
    console.log("onload" + Date())
}