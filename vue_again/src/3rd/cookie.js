function setCookie(a, b, c) {
    var d, e = a + "=" + encodeURIComponent(b),
    f = c;
    f && f.expires && "session" !== f.expires && (d = new Date, f.expires instanceof Date ? d = f.expires: isNaN(f.expires) ? "hour" === f.expires ? d.setHours(d.getHours() + 1) : "day" === f.expires ? d.setDate(d.getDate() + 1) : "week" === f.expires ? d.setDate(d.getDate() + 7) : "year" === f.expires ? d.setFullYear(d.getFullYear() + 1) : "forever" === f.expires ? d.setFullYear(d.getFullYear() + 120) : d = f.expires: d.setTime(d.getTime() + f.expires), e += "; expires=" + d.toUTCString()),
    e += f && f.path ? "; path=" + f.path: "; path=/",
    e += f && f.domain ? "; domain=" + f.domain: ";",
    f && f.secure ? e += "; secure=" + f.secure: null,
    document.cookie = e
}

function getCookie(a) {
    for (var b, c = document.cookie.split(";"), d = 0, e = c.length; e > d; d++) if (b = c[d].split("="), a === b[0].replace(/^\s*|\s*$/, "")) return decodeURIComponent(b[1]);
    return null
}

function delCookie(b) {
    setCookie(b, "", {
        expires: new Date(0)
    })
}
var i = window.sessionStorage;
function j(a, b) {
    return i && !b ? i.getItem(a) : getCookie(a)
}
function k(a, b, d) {
    i && !d ? i.setItem(a, b) : setCookie(a, b)//,{domain:"www.weixiao100.cn",path:"/"}
}
function l(a, b) {
    i && !b ? i.removeItem(a) : delCookie(a)
}
export const getToken = function() {
      return j("access_token", !0)
}
export const setToken =  function(a) {
  k("access_token", a, !0)
}
export const setUserId =  function(a) {
  k("user_info_json", a, !0)
}
