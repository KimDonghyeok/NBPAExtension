console.log("execute content script")


// 통합검색결과에서 View 섹션의 리스트를 가져옴
let viewSection = document.getElementsByClassName('_au_view_collection').item(0)
let viewList = viewSection.getElementsByClassName('_list_base').item(0)

console.log(viewList)
console.log(typeof (viewList))
console.log(viewList.childElementCount)

//viewList 의 노드를 받아서 내부의 a 태그의 href 값을 통해 블로그 URL 인지 판별
let isBlogSection = (element) => {
    const REG_EXP = new RegExp(/^https:\/\/blog\.naver\.com/)

    let currentNodeUrl = element.childNodes[1].childNodes[1].href

    return REG_EXP.test(currentNodeUrl);
}

// 통합검색결과에서 가져온 viewList 하위의 블로그 게시물 상단에 분석정보 컨테이너를 생성
let createAnalyzeInfoContainer = (list) => {

    for (let i = 1; i <= list.childElementCount; i++) {

        if(isBlogSection(list.childNodes[i])) {
            let info_container = document.createElement("li")
            let analyze_info = document.createElement("div")

            let analyze_content = document.createTextNode("분석정보입니다.")

            analyze_info.appendChild(analyze_content)
            info_container.appendChild(analyze_info)

            list.insertBefore(info_container, list.childNodes[i])
        }
    }
}

// createAnalyzeInfoContainer(viewList)