const SEARCH_NAVER_REGEXP = new RegExp(/^https:\/\/search\.naver\.com/)
const BLOG_NAVER_REGEXP = new RegExp(/^https:\/\/blog\.naver\.com/)
const BLOG_NAVER_ME_REGEXP = new RegExp(/blog\.me/)
const BLOG_NAVER_REGEXP_NOT_SECURE = new RegExp(/^http:\/\/blog\.naver\.com/)

const SEARCH_XEARCH_REGEXP = new RegExp(/\where\=nexearch/)
const SEARCH_VIEW_REGEXP = new RegExp(/\where\=view/)
const SEARCH_BLOG_REGEXP = new RegExp(/\where\=blog/)

const SEARCH_XEARCH_CODE = "_search_xearch"
const SEARCH_VIEW_CODE = "_search_view_all"
const SEARCH_BLOG_CODE = "_search_view_blog"
const BLOG_NAVER_CODE = "_blog_naver"

// const HOST_IP = "nbpa.ddns.net"
// const HOST_PORT = "33067"
const HOST_IP = "127.0.0.1"
const HOST_PORT = "8080"

const HOST_URL_HEAD = "http://" + HOST_IP + ":" + HOST_PORT + "/request/"

export {
    SEARCH_NAVER_REGEXP,
    BLOG_NAVER_REGEXP,
    BLOG_NAVER_ME_REGEXP,
    BLOG_NAVER_REGEXP_NOT_SECURE,
    SEARCH_XEARCH_REGEXP,
    SEARCH_VIEW_REGEXP,
    SEARCH_BLOG_REGEXP,
    SEARCH_XEARCH_CODE,
    SEARCH_VIEW_CODE,
    SEARCH_BLOG_CODE,
    BLOG_NAVER_CODE,
    HOST_URL_HEAD}