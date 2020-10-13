// function createPopup() {
//     var div = document.createElement("div")

//     div.setAttribute("class", "preview_post_wrapper")
//     document.getElementsByTagName("body")[0].appendChild(div)
// }

chrome.extension.onMessage.addListener(function (req, sender, sendResponse) {
    if (req.cmd !== "previewPost") {
        return;
    }

    var div = document.createElement("div")

    div.setAttribute("class", "preview_post_wrapper")
    document.getElementsByTagName("body")[0].appendChild(div)
})