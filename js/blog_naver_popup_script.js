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

window.onload = function() {
    console.log("onload" + Date())
}