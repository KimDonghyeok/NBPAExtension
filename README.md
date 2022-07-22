NBPAExtension  
(Chrome Extension for Naver Blog Post Analyzer, NBPA)
===

## 개요

NBPAExtension은 네이버 블로그 게시글 분석기(NBPA)의  크롬 확장프로그램 레포지토리 입니다.

네이버 블로그 게시글 분석기(Naver Blog Post Analyzer, NBPA)는 2020년 2학기 금오공과대학교 컴퓨터소프트웨어공학과 전공설계 과목인 창의융합종합설계1의 일환으로 진행한 프로젝트입니다.

Naver Blog Post Analyzer (이하 NBPA)는 **KoGPT2**를 이용한 자연어 학습과 **셀레니움**을 통한 웹 크롤링으로 블로그 게시글을 분석하여 네이버 블로그 게시글에서 추출한 **주요 키워드**, **이미지**, **멀티미디어 비율** 등의 분석정보를 사용자에게 제공하여 검색한 키워드와 관련성을 판단할 수 있게 하는 크롬 확장 프로그램입니다.

또한 추가적인 기능으로 사용자에게 편의성을 제공합니다. 

## 서버 레포지토리
> #### https://github.com/dldhk97/Naver-Blog-Post-Analyzer  

## Tech Stack
- ![Generic badge](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white) Chrome Extension
- ![Generic badge](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
- ![Generic badge](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
- ![Generic badge](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
- ![Generic badge](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)

## 기능

- 사용자에게 블로그 게시글의 분석 정보 제공
  - 게시글 주요 키워드
  - 게시글 이미지 비율
  - 게시글 멀티미디어(동영상) 비율
  - 게시글 로렘확률 (조회수 증가를 위한 무작위 단어로 구성된 게시글일지의 확률)
- JQurey를 이용한 블로그 게시글 팝업 미리보기
- 네이버 블로그 게시글 내부에서 이미지, 동영상, 이모티콘 접기 기능

## 시연영상
> 현재 창의융합종합설계1 과목과 학기가 끝남에 따라 서버는 운영되고 있지 않습니다.  
> 하단 링크로 프로그램 시연영상을 확인 하실수 있습니다.

https://drive.google.com/file/d/1jaGSApiJ7NJflSI05yiAoG4fd4mAN_2b/view?usp=sharing

## 프로젝트를 하며 배운 경험
- 처음으로 팀프로젝트에서 주도적으로 프론트엔드 구조를 공부하고 적용했던 점
- 크롬 확장프로그램이라는 포맷으로 처음 프로젝트를 처음 시도해본 점
- 크롬확장프로그램 구조파악을 위해 공식문서를 참고하여 공부했던 점
- ajax를 통해 서버와 비동기 통신을 하며 유저에게 제공하는 데이터를 처리해본 점
