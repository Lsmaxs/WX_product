define(function(require, exports, module) {
    var a = {},
    b = require("jquery"),
    c = require("qt/util"),
    d = require("qt/ui"),
    e = require("./common");
    require("jquery/json"),
    require("jquery/nicescroll");
    var f = e.SERVICE,
    g = c.getViewSize(),
    h = null;
    function i(a) {
        var c = g.width,
        e = g.height;
        b(".qt-slide").css({
            width: c + "px"
        });
        var f = b(".qt-slide-wrap > div").css({
            width: c + "px",
            height: e + "px"
        }).show();
        h = d.slide({
            id: "qtslide",
            initIndex: a ? a: 0
        }),
        f.each(function(a, c) {
            b(c).niceScroll(b(c).find(".nicescrollWrapper"), {
                cursorcolor: "#ccc",
                cursorwidth: "8px",
                cursorminheight: 100,
                scrollspeed: 60,
                mousescrollstep: 60,
                autohidemode: !0,
                bouncescroll: !1
            })
        }),
        window.goLeft = function() {
            h.left()
        },
        window.goRight = function() {
            h.right()
        };
        var i = f.eq(0).getNiceScroll(0);
        i.onscrollend = function(a) {
            a.end.y + 100 >= i.page.maxh && p()
        };
        var j = f.eq(1).getNiceScroll(0);
        j.onscrollend = function(a) {
            a.end.y + 100 >= j.page.maxh && x()
        }
    }
    function j() {
        var a = {
            uuid: e.getUuid(),
            schoolCode: e.getSchoolCode()
        };
        e.post(f + "/webapp/comm/bddb", a,
        function(a) {
            if ("001" == a.resultCode) {
                for (var c = a.items,
                d = new Array,
                f = 4,
                g = 0; g < c.length; g++) {
                    var h = c[g];
                    0 == g % f ? d.push('<a class="bd_r_l ' + (1 == c.length ? "bd_r_r": "") + '" href="javascript:;" data-classid="' + h.cid + '" data-name="' + h.name + '">' + h.name + "</a>") : 3 == g % f || g == c.length - 1 ? d.push('<a class="bd_r_r" href="javascript:;" data-classid="' + h.cid + '" data-name="' + h.name + '">' + h.name + "</a><br/>") : d.push('<a href="javascript:;" data-classid="' + h.cid + '" data-name="' + h.name + '">' + h.name + "</a>")
                }
                b("#classtab").html(d.join("")),
                c.length < f && b("#classtab").css({
                    "text-align": "center"
                }),
                b("#classtab").find("a").click(function() {
                    var a = b(this),
                    c = a.attr("data-classid");
                    z(c)
                })
            } else "202" == a.resultCode ? e.lostLogin() : e.showMsg(a.resultMsg)
        })
    }
    var k = 20,
    l = {},
    m = 0,
    n = !1;
    function o(a) {
        var c = e.getUuid();
        if (c) {
            var d = e.getSchoolCode();
            if (d) {
                var g = {
                    uuid: c,
                    schoolCode: d,
                    pageSize: k,
                    page: a
                };
                n || (n = !0, e.showProgress(), e.post(f + "/webapp/clazzcircle/index", g,
                function(d) {
                    if (n = !1, e.hideProgress(), "001" == d.resultCode) {
                        for (var f = new Array,
                        g = d.items,
                        h = 0; h < g.length; h++) {
                            var i = g[h];
                            if (!l["" + i.batchId]) {
                                for (var j = i.zanPenson.length,
                                o = !1,
                                p = new Array,
                                q = 0; q < i.zanPenson.length; q++) {
                                    var s = i.zanPenson[q];
                                    p.push('<b data-uuid="' + s.userId + '">' + s.userName + "</b>"),
                                    c == s.userId && (o = !0)
                                }
                                f.push('<div class="photo_box" data-batchid="' + i.batchId + '">'),
                                f.push('	<div class="photo_list">'),
                                f.push('		<a href="javascript:;" data-batchid="' + i.batchId + '" data-num="' + j + '" class="' + (o ? "bt_zan_sel": "bt_zan") + '"><span></span>' + j + "</a>"),
                                f.push('		<div class="pt_tit">'),
                                f.push('			<span class="face_pic"><img src="' + (i.icon ? i.icon: e.getDefaultHeadUrl()) + '" onerror="this.src=\'./images/user_pace.png\'"/></span><b>' + i.createName + " " + (1 == i.creatorType ? "老师": 2 == i.creatorType ? "家长": "") + "</b><br/>"),
                                f.push("			" + i.createTime + "&nbsp;&nbsp;&nbsp;上传了" + i.picNum + "张图片到" + i.className + '&nbsp;&nbsp;&nbsp;<a data-classid="' + i.classCode + '" href="javascript:;">查看全部></a>'),
                                f.push("		</div>"),
                                f.push("	</div>"),
                                f.push('	<div class="imgwrapperRoot">');
                                for (var q = 0; q < i.picUrls.length; q++) {
                                    var t = i.picUrls[q],
                                    u = e.imgCrop(t.url, {
                                        w: 500,
                                        h: 500
                                    });
                                    f.push('<a class="imgwrapper" href="javascript:;" style="overflow:hidden;"><img src="' + u + '" data-src="' + t.url + '" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>')
                                }
                                f.push("	</div>"),
                                f.push('	<div class="zan_name" ' + (j > 0 ? "": 'style="display:none;"') + ">" + p.join("，") + "</div>"),
                                f.push("</div>"),
                                l["" + i.batchId] = 1
                            }
                        }
                        b("#batchList").append(f.join("")),
                        1 == a && g.length <= 0 && (b("#batchList").hide(), b("#noData").show().find("a").off().click(function() {
                            parent && parent.setWinTitle && parent.setWinTitle("发照片"),
                            location.href = "./photo_send.html"
                        }), b("#mainPage").css({
                            background: "#fff"
                        })),
                        g.length == k && (m = a),
                        b("#batchList a[data-classid]").off().click(function() {
                            var a = b(this).attr("data-classid");
                            a && z(a)
                        }),
                        b("#batchList a[data-batchid]").off().click(function() {
                            r.apply(this)
                        })
                    } else "202" == d.resultCode ? e.lostLogin() : e.showMsg(d.resultMsg)
                }))
            }
        }
    }
    function p() {
        n || o(m + 1)
    }
    var q = !1;
    function r() {
        if (!q) {
            var a = b(this),
            c = !1;
            c = a.hasClass("bt_zan_sel") ? !1 : !0;
            var d = e.getUuid(),
            g = e.getSchoolCode(),
            h = e.getUserName(),
            i = a.attr("data-batchid");
            if (d && i) {
                q = !0;
                var j = {
                    uuid: d,
                    schoolCode: g,
                    batchid: i,
                    type: c ? 1 : 2,
                    userName: h
                };
                e.post(f + "/webapp/clazzcircle/opt", j,
                function(b) {
                    if (q = !1, "001" == b.resultCode) {
                        var f = a.parent().parent().find(".zan_name");
                        if (c) {
                            a.removeClass("bt_zan").addClass("bt_zan_sel");
                            var g = f.find("b");
                            g.length > 0 ? f.prepend('<b data-uuid="' + d + '">' + h + "</b>，") : f.prepend('<b data-uuid="' + d + '">' + h + "</b>"),
                            a.html("<span></span>" + (g.size() + 1)),
                            f.show()
                        } else {
                            a.removeClass("bt_zan_sel").addClass("bt_zan"),
                            f.find('[data-uuid="' + d + '"]').remove();
                            var i = f.html();
                            f.html(i.replace(/^，/, ""));
                            var g = f.find("b");
                            a.html("<span></span>" + g.size()),
                            g.length <= 0 && f.hide()
                        }
                    } else "202" == b.resultCode ? e.lostLogin() : e.showMsg(b.resultMsg)
                })
            }
        }
    }
    var s = 20,
    t = {},
    u = 0,
    v = 0;
    function w(a, c) {
        var d = e.getUuid();
        if (d) {
            var g = e.getSchoolCode();
            if (g) {
                var h = {
                    uuid: d,
                    schoolCode: g,
                    classCode: v,
                    pageSize: s,
                    page: a
                };
                n || (n = !0, e.showProgress(), e.post(f + "/webapp/clazzcircle/list", h,
                function(d) {
                    if (n = !1, e.hideProgress(), "001" == d.resultCode) {
                        for (var f = new Array,
                        g = d.items,
                        h = 0; h < g.length; h++) {
                            var i = g[h];
                            if (!t["" + i.albumId]) {
                                var j = i.picUrl;
                                j && (j = j.lastIndexOf("/"), j = i.picUrl.substring(j + 1));
                                var l = e.imgCrop(i.picUrl, {
                                    w: 500,
                                    h: 500
                                }),
                                m = i.picDesc ? i.picDesc: j;
                                f.push('<li data-albumid="' + i.albumId + '">'),
                                f.push('    <div class="ph_l" href="javascript:;">'),
                                f.push('        <a class="imgwrapper" href="javascript:;" style="overflow:hidden;"><img src="' + l + '" data-src="' + i.picUrl + '" onload="winFixImg(this);" onerror="winErrorImg(this);"></a>'),
                                f.push("        <span>" + m + '</span><input maxlength="10" style="display:none;" type="text" class="edit_name"  data-name="' + m + '" value="' + m + '" />'),
                                f.push("    </div>"),
                                f.push("    <span>" + i.creatorName + " " + (1 == i.creatorType ? "老师": 2 == i.creatorType ? "家长": "") + "</span>"),
                                f.push('    <div class="photo_op"><span><a href="javascript:;" class="photo_edit">编辑</a><a href="javascript:;" class="photo_det">删除</a></span></div>'),
                                f.push('    <div class="pt_op_bg"><span></span></div>'),
                                f.push("</li>"),
                                t["" + i.albumId] = 1
                            }
                        }
                        b("#albumlist").append(f.join("")),
                        1 == a && g.length <= 0 && (b("#albumlist").hide(), b("#noData2").show().find("a").off().click(function() {
                            parent && parent.setWinTitle && parent.setWinTitle("发照片"),
                            location.href = "./photo_send.html"
                        }), b("#mainPage").css({
                            background: "#fff"
                        })),
                        g.length == k && (u = a),
                        c && c()
                    } else "202" == d.resultCode ? e.lostLogin() : e.showMsg(d.resultMsg)
                }))
            }
        }
    }
    function x() {
        n || w(u + 1)
    }
    function y() {
        b("#albumlist").on("click", ".photo_edit",
        function() {
            var a = b(this),
            c = a.parent().parent().parent();
            c.find(".ph_l span").hide(),
            c.find(".ph_l input").show().off().blur(function() {
                var a = b(this),
                d = a.val(),
                g = a.attr("data-name");
                if (d && d != g) {
                    var h = c.attr("data-albumid"),
                    i = e.getUuid();
                    if (i) {
                        var j = e.getSchoolCode();
                        if (j) {
                            var k = {
                                uuid: i,
                                schoolCode: j,
                                classCode: v,
                                albumId: h,
                                picDesc: d
                            };
                            e.post(f + "/webapp/clazzcircle/edds", k,
                            function(b) {
                                "001" == b.resultCode ? (a.hide(), a.prev().html("" + d).show()) : "202" == b.resultCode ? e.lostLogin() : e.showMsg(b.resultMsg)
                            })
                        }
                    }
                }
            })
        }).on("click", ".photo_det",
        function() {
            var a = b(this);
            e.showMsg({
                msg: "确定要删除该相片吗？",
                okcallback: function() {
                    var b = a.parent().parent().parent(),
                    c = b.attr("data-albumid");
                    if (c) {
                        var d = e.getUuid();
                        if (d) {
                            var g = e.getSchoolCode();
                            if (g) {
                                var h = {
                                    uuid: d,
                                    schoolCode: g,
                                    classCode: v,
                                    albumId: c
                                };
                                e.post(f + "/webapp/clazzcircle/dele", h,
                                function(a) {
                                    "001" == a.resultCode ? b.remove() : "202" == a.resultCode ? e.lostLogin() : e.showMsg(a.resultMsg)
                                })
                            }
                        }
                    }
                }
            })
        })
    }
    function z(a, c) {
        var d = e.getUuid();
        if (d) {
            var f = e.getSchoolCode();
            f && a && (v = a, t = {},
            u = 0, b("#albumlist").html("").show(), b("#noData2").hide(), w(1,
            function() { ! c && A()
            }))
        }
    }
    function A() {
        h && h.right(),
        window.parent.setWinTitle && window.parent.setWinTitle("相册详情"),
        window.parent.trace && window.parent.trace(function() {
            h && h.left(),
            window.parent.setWinTitle && window.parent.setWinTitle("班级相册")
        })
    }
    function B() {
        b("#batchList").on("click", ".imgwrapper",
        function() {
            var a = b(this),
            c = a.parent().find(".imgwrapper"),
            d = c.index(this),
            f = [];
            c.find("img").each(function() {
                f.push(b(this).attr("data-src"))
            }),
            e.showImgs(f, d)
        }),
        b("#albumlist").on("click", ".imgwrapper",
        function() {
            var a = (b(this), b("#albumlist").find(".imgwrapper")),
            c = a.index(this),
            d = [];
            a.find("img").each(function() {
                d.push(b(this).attr("data-src"))
            }),
            e.showImgs(d, c)
        })
    }
    i(),
    j(),
    o(1),
    B(),
    y(),
    module.exports = a
});
