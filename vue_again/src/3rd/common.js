define(function(require, exports, module) {
    var a = {},
    b = require("jquery"),
    c = require("qt/cookie"),
    d = require("./config");
    require("jquery/json"),
    require("jquery/popup");
    var e = require("../plugin/modernizr/modernizr"),
    f = require("../plugin/toastr/toastr"),
    g = require("../plugin/nprogress/nprogress");
    g.configure({
        trickleRate: .05,
        trickleSpeed: 800,
        showSpinner: !1
    });
    var h = (e.csstransitions, e.csstransforms);
    require("../plugin/laydate/laydate"),
    require("./stat"),
    a.SERVICE = d.SERVICE,
    a.UPLOADSERVICE = d.UPLOADSERVICE;
    var i = window.sessionStorage;
    function j(a, b) {
        return i && !b ? i.getItem(a) : c.getCookie(a)
    }
    function k(a, b, d) {
        i && !d ? i.setItem(a, b) : c.setCookie(a, b)
    }
    function l(a, b) {
        i && !b ? i.removeItem(a) : c.delCookie(a)
    }
    a.localGet = j,
    a.localSet = k,
    a.localDel = l,
    a.getToken = function() {
        return j("access_token", !0)
    },
    a.setToken = function(a) {
        k("access_token", a, !0)
    },
    a.getUuid = function() {
        return j("uuid")
    },
    a.setUuid = function(a) {
        k("uuid", a)
    },
    a.getSchoolCode = function() {
        return j("schoolCode")
    },
    a.setSchoolCode = function(a) {
        k("schoolCode", a)
    },
    a.delSchoolCode = function() {
        l("schoolCode")
    },
    a.getSchoolName = function() {
        return j("schoolName")
    },
    a.setSchoolName = function(a) {
        k("schoolName", a)
    },
    a.getUserName = function() {
        return j("userName")
    },
    a.setUserName = function(a) {
        k("userName", a)
    },
    a.getHeadUrl = function() {
        var b = j("headPortraitUrl");
        return b && "null" != b && "undefined" != b ? b: a.getDefaultHeadUrl()
    },
    a.setHeadUrl = function(a) {
        k("headPortraitUrl", a)
    },
    a.getDefaultHeadUrl = function() {
        return "./images/user_pace.png"
    },
    a.getRole = function() {
        return j("role")
    },
    a.setRole = function(a) {
        k("role", a)
    },
    a.getRoleName = function() {
        return j("roleName")
    },
    a.setRoleName = function(a) {
        k("roleName", a)
    },
    a.isAdmin = function() {
        return "1" == j("isAdmin")
    },
    a.getIsAdmin = function() {
        return j("isAdmin")
    },
    a.setIsAdmin = function(a) {
        k("isAdmin", a)
    },
    a.isMaster = function() {
        return "1" == j("isMaster")
    },
    a.getIsMaster = function() {
        return j("isMaster")
    },
    a.setIsMaster = function(a) {
        k("isMaster", a)
    },
    a.isJFAdmin = function() {
        return "1" == j("isJFAdmin")
    },
    a.getIsJFAdmin = function() {
        return j("isJFAdmin")
    },
    a.setIsJFAdmin = function(a) {
        k("isJFAdmin", a)
    },
    a.getMasterClassInfo = function() {
        return JSON.parse(j("masterClassInfo"))
    },
    a.setMasterClassInfo = function(a) {
        k("masterClassInfo", JSON.stringify(a))
    },
    a.getPermissions = function(a) {
        var c = j("permissions");
        return c = c ? b.evalJSON(c) : {},
        c[a]
    },
    a.setPermissions = function(a) {
        k("permissions", a ? JSON.stringify(a) : "")
    },
    a.setFuncs = function(a) {
        a && k("funcs", "" + b.toJSON(a))
    },
    a.getFuncs = function(a) {
        var c = j("funcs");
        return c = c ? b.evalJSON(c) : {},
        "1" == c[a]
    },
    a.showMsg = function(a, c) {
        var d = {};
        if ("string" == typeof a ? d.msg = a: d = a, d.msg) if (c === !0 && b("#msgBox").size() > 0) {
            var e = d.title,
            f = d.icon,
            g = d.msg,
            h = d.callback,
            i = d.okcallback,
            j = d.btnText ? d.btnText: "关闭",
            k = d.okbtnText ? d.okbtnText: "确定",
            l = d.mask === !1 ? !1 : !0,
            m = d.textAlign ? d.textAlign: "center",
            n = b("#msgBox");
            e ? n.find("#msgBox_title").html("" + e).parent().show() : n.find("#msgBox_title").html("").parent().hide(),
            n.find("#msgBox_msg").html("" + g),
            n.find(".msgbox_body p").css("text-align", m),
            f ? (("warn" == f || "suc" == f) && (icourl = "images/ico_" + f + ".png"), b("#msgBox_ico").attr("src", f).show()) : b("#msgBox_ico").hide(),
            n.find(".btn").eq(1).html("" + j).off().click(function() {
                n.popupClose(),
                h && h()
            }),
            i ? n.find(".btn").eq(0).html("" + k).off().click(function() {
                n.popupClose(),
                i && i()
            }) : n.find(".btn").eq(0).off().hide(),
            n.popupOpen({
                speed: 200,
                mask: l,
                maskColor: "#222"
            })
        } else parent.showMsg(a)
    },
    a.getLoginSource = function() {
        var a = j("loginSource");
        return a || (a = d.SERVICE + "/login.html"),
        a
    },
    a.setLoginSource = function(a) {
        k("loginSource", a)
    },
    a.lostLogin = function() {
        a.showMsg({
            msg: "登录超时，需要重新登录！",
            icourl: "warn",
            btnText: "重新登录",
            callback: function() {
                a.goLogin(!0)
            }
        })
    },
    a.clearStatus = function() {
        i.clear(),
        c.delCookie("uuid"),
        c.delCookie("userName"),
        c.delCookie("headPortraitUrl"),
        c.delCookie("role"),
        c.delCookie("roleName"),
        c.delCookie("schoolCode"),
        c.delCookie("schoolName"),
        c.delCookie("isAdmin"),
        c.delCookie("funcs")
    },
    a.goLogin = function(b) {
        var d = a.getLoginSource();
        a.clearStatus(),
        b ? (c.delCookie("user_info_json"), c.delCookie("access_token"), window.top.location.href = d) : (a.post(a.SERVICE + "/logout", {},
        function() {
            c.delCookie("user_info_json"),
            c.delCookie("access_token"),
            window.top.location.href = d
        }), setTimeout(function() {
            c.delCookie("user_info_json"),
            c.delCookie("access_token"),
            window.top.location.href = d
        },
        8e3))
    },
    a.post = function(c, d, e) {
        var f = {
            json: b.toJSON(d)
        };
        b.ajax(c, {
            type: "post",
            data: f,
            datatye: "json",
            success: function(a) {
                e && e(a)
            },
            error: function(b, c, d) {
                var e = b.responseText;
                /^(Token)?\?+/.test(e) && a.lostLogin()
            }
        })
    },
    a.post2 = function(a, c, d) {
        var e = JSON.stringify(c);
        b.ajax(a, {
            type: "POST",
            data: e,
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function(a) {
                d && d(a)
            }
        })
    },
    a.jsonp = function(a, c, d, e) {
        b.ajax({
            type: "get",
            url: a,
            data: c,
            dataType: "jsonp",
            jsonp: "callback",
            success: function(a) {
                d && d(a)
            },
            error: function(a, b, c) {
                e && e()
            }
        })
    },
    a.showImgs = function(a, b) {
        parent.showImgs && parent.showImgs(a, b)
    },
    a.tips = function(a, b) {
        var c = b ? b: a,
        d = b ? a: "error";
        c && (f.options = {
            closeButton: !1,
            debug: !1,
            newestOnTop: !1,
            progressBar: !1,
            positionClass: "toast-bottom-center",
            preventDuplicates: !1,
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "2000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        },
        f[d] && f[d](c))
    },
    a.showLoading = function() {
        b("#loading").show()
    },
    a.hideLoading = function() {
        b("#loading").hide()
    },
    a.showProgress = function() {
        g.start()
    },
    a.hideProgress = function() {
        g.done()
    },
    a.imgCrop = function(a, c) {
        var d = a.indexOf("http://weixiao.kssws.ks-cdn.com/");
        if (0 > d) return a;
        var e = {};
        e = b.extend(e, c ? c: {});
        var f = "",
        g = new Array;
        for (var h in e) f = "&" + h + "=" + e[h],
        g.push(f);
        var i = a + "@base@tag=imgScale" + g.join("");
        return i
    },
    a.filterXss = function(a, b, c) {
        a = a.toString();
        var d = "";
        d = c ? c: "#";
        var e = ["script", "iframe"];
        if (b) for (var f = 0; f < b.length; f++) e.push(b[f]);
        for (var f = 0; f < e.length; f++) {
            var g = e[f],
            h = new RegExp("<[/]{0,1}" + g + "[^>]*>", "gi");
            a = a.replace(h, d)
        }
        return a
    },
    a.layDate = function(a, b) {
        var c = {};
        if ("string" == typeof a ? c.elem = a: c = a, c.elem && (laydate(c), b)) {
            var d = 0 == b ? "default": 1 == b ? "danlan": 2 == b ? "dahong": 3 == b ? "molv": "default";
            laydate.skin(d)
        }
    },
    window.winFixImg = function(a) {
        var c = a.width,
        d = a.height,
        e = b(a),
        f = e.parent(),
        g = f.width(),
        i = f.height();
        g || (g = parseInt(f.css("width").replace("px"))),
        i || (i = parseInt(f.css("height").replace("px")));
        var j = g / i,
        k = c / d,
        l = 0,
        m = 0,
        n = g,
        o = i;
        k >= j ? (n = c * o / d, l = (g - n) / 2) : (o = d * n / c, m = (i - o) / 2),
        f.css({
            overflow: "hidden"
        }),
        h ? e.css({
            width: n + "px",
            height: o + "px",
            transform: "translate(" + l + "px," + m + "px)",
            "-ms-transform": "translate(" + l + "px," + m + "px)",
            "-webkit-transform": "translate(" + l + "px," + m + "px)"
        }) : e.css({
            width: n + "px",
            height: o + "px",
            left: l + "px",
            top: m + "px",
            position: "relative"
        })
    },
    window.winErrorImg = function(a) {
        a.src = "./images/default.jpg"
    },
    module.exports = a
});
