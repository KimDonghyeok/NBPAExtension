/*
//확장 프로그램이 설치됬을 떄 확장 프로그램에서 동작해야 하는 이벤트 리스너를 등록
chrome.runtime.onInstalled.addListener(function() {

    // onPageChanged => 페이지 URL 에 따라 규칙을 정의하고 규칙에 대한 함수를 정의
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{

            // conditions : PageStateMatcher => 현재 페이지(탭)의 URL 의 일치를 통한 조건을 설정
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'developer.chrome.com'},
            })
            ],
            // ShowPageAction => condition 에 따라 수행해야할 함수를 정의, ShowPageAction 은 확장프로그램 팝업의 표시를 제어
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});*/

