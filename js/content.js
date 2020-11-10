/*
// 네이버 검색 결과에서 블로그 섹션을 찾아낸 뒤 블로그 검색결과 리스트의 각 요소 위에 분석 내용을 삽입하기 위한 html 요소 생성
let blog_section = document.querySelector("._blogBase")
let blog_list = blog_section.querySelector(".type01")

let info_container = document.createElement("li")
let analyze_info = document.createElement("div")

info_container.setAttribute("class", "info_container")
analyze_info.setAttribute("class", "analyze_info")

let analyze_content = document.createTextNode("분석정보입니다.")

analyze_info.appendChild(analyze_content)
info_container.appendChild(analyze_info)

blog_list.insertBefore(analyze_info, blog_list.childNodes[0])
*/