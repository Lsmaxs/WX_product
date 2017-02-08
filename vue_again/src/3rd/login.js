define(function(require, exports, module) {
    var a = {},
    b = require("jquery"),
    c = require("qt/util"),
    d = require("qt/cookie"),
    e = (require("qt/valid"), require("qt/md5")),
    f = require("./common"),
    g = require("./config"),
    h = require("./animate.js"),
    i = require("../plugin/modernizr/modernizr"),
    j = i.csstransitions,
    k = (i.csstransforms, c.getViewSize()),
    l = g.isDev,
    m = g.SERVICE,
    n = l ? "//uww-dev.qtonecloud.cn/v2/oauth/token": "//uww-pro.qtonecloud.cn/v2/oauth/token";
    function o() {
        if (d.getCookie("user_info_json")) return void(location.href = "./index.html");
        r(),
        p();
        var a = b(".login_tit_m a"),
        c = b(".login_zhangmi,.login_weixin");
        a.off().on("click",
        function() {
            var d = b(this);
            if (!d.hasClass("sel")) {
                var e = a.index(this);
                1 == e && "1" != d.attr("data-init") && (d.attr("data-init", "1"), q()),
                b(".login_Scanok").hide(),
                a.removeClass("sel"),
                d.addClass("sel"),
                c.hide().eq(e).fadeIn()
            }
        }),
        b("#addFavBtn").click(function() {
            var a = document.title,
            b = location.href;
            try {
                window.external.addFavorite(b, a)
            } catch(c) {
                try {
                    window.sidebar.addPanel(a, b, "")
                } catch(c) {
                    f.tips("加入收藏失败，请使用Ctrl+D进行添加")
                }
            }
        }),
        b("#forget_password").on("click",
        function(a) {
            a.preventDefault(),
            location.href = "./forget_password.html"
        }),
        b("#setHomeBtn").click(function() {
            var a = location.href,
            b = this;
            try {
                b.style.behavior = "url(#default#homepage)",
                b.setHomePage(a)
            } catch(c) {
                if (window.netscape) {
                    try {
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
                    } catch(c) {
                        f.tips("此操作被浏览器拒绝！\n请在浏览器地址栏输入“about:config”并回车\n然后将[signed.applets.codebase_principal_support]设置为'true'")
                    }
                    var d = Components.classes["@@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
                    d.setCharPref("browser.startup.homepage", a)
                }
            }
        }),
        t(),
        b(window).on("scroll",
        function() {
            t()
        }),
        C()
    }
    function p() {
        var a = "weixiao100cnloginname";
        b("#loginBtn").off().click(function() {
            if (window.notSupportBrowser) return void alert("不支持IE8以下的浏览器，请升级您的浏览器，\n如果您正使用双核浏览器，请切换到极速模式。");
            var c = b(this);
            if (!x) {
                var g = b.trim(b("#username").val()),
                h = b.trim(b("#password").val());
                if (!/^\w{5,15}$/.test(g)) return f.tips("请填入正确的登录用户名"),
                !1;
                if (!h) return f.tips("请填入登录密码"),
                !1;
                b("#remenberName").hasClass("login_mm_checked") ? window.localStorage ? localStorage.setItem(a, g) : d.setCookie(a, g, {
                    expires: "forever"
                }) : window.localStorage ? localStorage.removeItem(a) : d.delCookie(a);
                var i = {
                    userid: g,
                    password: e.md5(e.md5(h))
                };
                z(),
                c.html("正在登录中"),
                f.showProgress();
                var i = {
                    client_id: l ? "demo": "wx_jxhd",
                    client_secret: l ? "demo": "wx_jxhd",
                    grant_type: "password",
                    scope: "read",
                    username: g,
                    password: e.md5(h).toLowerCase()
                };
                return b.ajax(n, {
                    crossDomain: !0,
                    data: i,
                    dataType: "json",
                    error: function(a, b, d) {
                        A(),
                        f.hideProgress(),
                        c.html("登录")
                    },
                    success: function(a, b, d) {
                        if ("0000000" == a.rtnCode) {
                            var e = a.bizData.value;
                            f.setToken(e),
                            v(e),
                            setTimeout(function() {
                                w()
                            },
                            2e3)
                        } else A(),
                        f.hideProgress(),
                        f.tips(a.msg),
                        c.html("登录")
                    },
                    statusCode: {
                        400 : function(a) {
                            f.tips("登录失败，请检查账号密码是否正确")
                        }
                    }
                }),
                !1
            }
        }),
        b("#remenberName").click(function() {
            b("#remenberName").toggleClass("login_mm_checked")
        }),
        b("#username").off().on("keyup",
        function(a) {
            13 == a.keyCode && b("#password").focus()
        }),
        b("#password").off().on("keyup",
        function(a) {
            13 == a.keyCode && b("#loginBtn").trigger("click")
        });
        var c = window.localStorage ? localStorage.getItem(a) : d.getCookie(a);
        c && (b("#username").val(c), b("#remenberName").addClass("login_mm_checked"))
    }
    function q() {
        var a = (new Date).getTime(),
        b = "http://uclogin.qtonecloud.cn/wxoauth/portal/qkyzhxy/deal?loginid=wxlogin&forwardid=uc_wxpc&unique=" + a;
        g.isDev && (b = "http://uclogin.qtonecloud.cn/wxserver/portal/qkyzhxy/deal?loginid=wxlogin&forwardid=uc_wxpc&unique=" + a);
        var c = m + "/css/login_wxqr.css?v=" + seajs.data.project_version;
        /^https/.test(c) || (c = c.replace("http", "https")),
        /local/.test(location.hostname) && (c = "https://dev.weixiao100.cn/frontstest/test/qr/login_wxqr.css?v=" + (new Date).getTime());
        new WxLogin({
            id: "qrcodeCon",
            appid: "wx39ae560f233212fe",
            redirect_uri: encodeURIComponent(b),
            scope: "snsapi_login",
            state: "wxlogin",
            style: "",
            href: c
        })
    }
    function r() {
        var a = c.P("status_code"),
        d = c.P("token");
        if (!a) return void s(0);
        if ("1000" == a && d) b(".login_tit_m a").removeClass("sel").eq(1).addClass("sel"),
        b(".login_zhangmi,.login_weixin").hide(),
        b(".login_Scanok").show(),
        f.setToken(d),
        v(d),
        j ? setTimeout(function() {
            b(".progress_ing").css("width", "100%")
        },
        5) : b(".progress_ing").animate({
            width: "100%"
        },
        2e3),
        setTimeout(function() {
            w()
        },
        2e3);
        else {
            s(0);
            var e = "",
            g = "确定";
            switch (a) {
            case "1001":
                e = "对不起，您当前不是学校的教师或管理员身份，<br/>无法登录本平台。";
                break;
            case "1002":
                e = "没有关注企业号";
                break;
            case "1003":
                e = "您还未进行扫码登录授权，请查看扫码登录的操作<br/>教程，我们将引导您进行设置，谢谢！",
                g = "操作教程";
                break;
            case "1004":
                e = "授权失败";
                break;
            case "1101":
                e = "参数错误";
                break;
            case "1100":
                e = "未知异常";
                break;
            default:
                e = "未知异常"
            }
            B({
                msg: e,
                btnText: g,
                callback: function() {
                    return "1003" == a ? !0 : (location.href = location.href.replace(/\?.*/, ""), !1)
                }
            })
        }
    }
    function s(a) {
        var c = b(".login_tit_m a"),
        d = b(".login_zhangmi,.login_weixin");
        c.removeClass("sel").eq(a).addClass("sel"),
        b(".login_Scanok").hide(),
        d.hide().eq(a).show()
    }
    function t() {
        b(".func_box,.app_box").each(function(a, c) {
            var d = b(this),
            e = d.attr("data-init");
            "1" != e && u(this) && (h.wxAnimate(this), d.attr("data-init", "1"))
        })
    }
    function u(a) {
        var c = b(window),
        d = c.scrollTop(),
        e = d + k.height,
        f = b(a).offset().top,
        g = f + b(a).outerHeight(),
        h = f > d && e > f,
        i = g > d && e > g;
        return h || i
    }
    function v(a) {
        var b = (new Date).getTime(),
        c = m + "/webapp/comm/setToken?access_token=" + a + "&_=" + b,
        d = new Image;
        d.src = c
    }
    function w() {
        f.post(m + "/getLoginUserInfo", {},
        function(a) {
            if (A(), f.hideProgress(), "001" == a.resultCode) {
                var c = a.userId;
                c ? (d.setCookie("user_info_json", c), location.href = "./index.html?t=" + (new Date).getTime()) : f.tips("您没有使用本系统的权限")
            } else "202" == a.resultCode ? f.lostLogin() : f.tips(a.resultMsg);
            b("#loginBtn").html("登录")
        })
    }
    var x = !1,
    y = null;
    function z() {
        x = !0,
        y && clearTimeout(y),
        y = setTimeout(function() {
            f.tips("登录接口服务调用超时，请刷新页面重试！"),
            A()
        },
        6e4)
    }
    function A() {
        x = !1,
        y && clearTimeout(y),
        b("#loginBtn").html("登录")
    }
    function B(a) {
        var c = {};
        if ("string" == typeof a ? c.msg = a: c = a, c.msg) {
            var d = (c.title, c.msg),
            e = c.callback,
            f = c.btnText ? c.btnText: "关闭",
            g = c.mask === !1 ? !1 : !0,
            h = c.textAlign ? c.textAlign: "center",
            i = b("#qrmsgPop");
            i.find("#qrmsgPop_msg").html("" + d).css("text-align", h),
            i.find("#qrmsgPop_Btn").html("" + f).off().click(function(a) {
                return i.popupClose(),
                e ? e() : !1
            }),
            i.find(".a_close").off().click(function() {
                i.popupClose()
            }),
            i.popupOpen({
                speed: 200,
                mask: g,
                maskColor: "#222"
            })
        }
    }
    function C() {
        try {
            BizQQWPA && BizQQWPA.addCustom({
                nameAccount: "800105253",
                selector: "qqkefu",
                aty: 0
            }),
            BizQQWPA && BizQQWPA.visitor({
                nameAccount: "800105253"
            })
        } catch(a) {}
        var c = null;
        b("#add_qrcode").hover(function() {
            c && clearTimeout(c),
            b(".scan_cade").fadeIn(200)
        },
        function() {
            c && clearTimeout(c),
            c = setTimeout(function() {
                b(".scan_cade").fadeOut(200)
            },
            150)
        })
    }
    o(),
    module.exports = a
});
