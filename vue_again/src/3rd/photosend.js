define(function(require, exports, module) {
    var a = {},
    b = require("jquery"),
    c = require("qt/util"),
    d = require("qt/ui"),
    e = require("./common");
    require("jquery/json"),
    require("jquery/nicescroll");
    var f = require("../plugin/webuploader/webuploader"),
    g = e.SERVICE,
    h = c.getViewSize(),
    i = null;
    function j() {
        var a = h.width,
        c = h.height;
        b(".qt-slide").css({
            width: a + "px"
        });
        var e = b(".qt-slide-wrap > div").css({
            width: a + "px",
            height: c + "px"
        }).show();
        b("#loading").css({
            width: a + "px",
            height: c + "px",
            position: "relative"
        }),
        i = d.slide({
            id: "qtslide"
        }),
        e.each(function(a, c) {
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
            i.left()
        },
        window.goRight = function() {
            i.right()
        }
    }
    function k() {
        b("#selectTargetBtn").off().click(function() {
            i && i.right(),
            window.parent.trace && window.parent.trace(function() {
                i && i.left(),
                b("#selectTargetBtn").val("请选择")
            })
        }),
        b("#selectTargetFinishBtn").off().click(function() {
            i && i.left(),
            window.parent.untrace && window.parent.untrace();
            var a = b("#targetBox").find(".operate-class span.op-checked"),
            c = a.parent();
            if (c.size() > 0) {
                var d = c.attr("data-name"),
                e = c.attr("data-classid");
                b("#selectTargetBtn").val(d).data("sendTarget", e).data("className", d)
            } else b("#selectTargetBtn").val("请选择").data("sendTarget", "").data("className", "")
        });
        var a = {
            uuid: e.getUuid(),
            schoolCode: e.getSchoolCode()
        };
        b("#loading").show(),
        b("#targetBox").hide(),
        e.post(g + "/webapp/comm/bddb", a,
        function(a) {
            if (b("#loading").hide(), b("#targetBox").show(), "001" == a.resultCode) {
                for (var c = a.items,
                d = new Array,
                f = 0; f < c.length; f++) {
                    var g = c[f];
                    d.push('<a href="javascript:;" class="operate-class" data-classid="' + g.cid + '" data-name="' + g.name + '"><span class="op-check"></span>' + g.name + '<span class="jt_up" style="display:none;"></span></a>'),
                    d.push("<hr/>")
                }
                var h = b("#targetBox").prepend(d.join("")),
                i = h.find(".operate-class .op-check");
                i.off().click(function(a) {
                    return i.removeClass("op-checked"),
                    b(this).addClass("op-checked"),
                    !1
                })
            } else "202" == a.resultCode ? e.lostLogin() : e.showMsg(a.resultMsg)
        })
    }
    function l() {
        var a = (b("#uploadPicBtn").width(), b("#uploadPicBtn").height(), 0);
        _picUploader = f.create({
            swf: "./plugin/webuploader/Uploader.swf",
            server: e.UPLOADSERVICE + "/webapp/comm/upload?app=notice&uuid=" + e.getUuid() + "&schoolCode=" + e.getSchoolCode(),
            pick: "#uploadPicBtn",
            accept: {
                title: "Images",
                extensions: "gif,jpg,jpeg,bmp,png",
                mimeTypes: "image/*"
            },
            threads: 100,
            fileNumLimit: 1e3,
            fileSingleSizeLimit: 3145728,
            thumb: {
                width: 115,
                height: 115,
                quality: 70,
                allowMagnify: !1,
                crop: !0,
                type: "image/jpeg"
            },
            compress: !1,
            resize: !1
        }),
        _picUploader.on("uploadBeforeSend",
        function(a, b, c) {
            "flash" == _picUploader.predictRuntimeType() && (c.Accept = "*/*")
        }),
        _picUploader.on("fileQueued",
        function(a) {
            _picUploader.makeThumb(a,
            function(c, d) {
                if (c);
                else {
                    var e = new Array;
                    e.push('<li data-name="' + a.name + '" data-id="' + a.id + '">'),
                    e.push('<div class="ph_l" href="javascript:;"><div style="position:relative;"><div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><img src="' + d + '" /></div><input class="edit_name" maxlength="10" value="' + (a.name.length > 10 ? a.name.substring(0, 10) : a.name) + '" data-name="' + (a.name.length > 10 ? a.name.substring(0, 10) : a.name) + '"/></div>'),
                    e.push('<div class="photo_op"><span><a href="javascript:;" class="photo_edit" style="display:none;">编辑</a><a href="javascript:;" class="photo_det">删除</a></span></div>'),
                    e.push('<div class="pt_op_bg"><span></span></div>'),
                    e.push("</li>"),
                    b("#uploadPicBtn").parent().parent().before(e.join(""))
                }
            })
        }),
        _picUploader.on("filesQueued",
        function() {
            b("#picList").off().on("click", ".photo_det",
            function(a) {
                var c = b(this).parent().parent().parent();
                console.log(c.attr("data-id")),
                _picUploader.removeFile(c.attr("data-id")),
                c.fadeOut(400,
                function() {
                    c.remove()
                })
            }).on("blur", "input",
            function() {
                var a = b(this),
                c = a.val();
                c || a.val(a.attr("data-name"))
            }),
            a > 0 && (e.showMsg("部分文件大小受限，请选择小于3M的图片"), a = 0)
        }),
        _picUploader.on("error",
        function(b, c, d) {
            "F_EXCEED_SIZE" == b && a++,
            "Q_EXCEED_NUM_LIMIT" == b && e.showMsg("最多上传" + c + "张图片")
        })
    }
    var m = !1;
    function n() {
        b("#submitBtn").off().click(function() {
            if (!m) {
                var c = e.getUuid();
                if (c) {
                    var d = e.getSchoolCode();
                    if (d) {
                        var f = b("#selectTargetBtn").data("sendTarget"),
                        g = b("#selectTargetBtn").data("className");
                        if (!f) return e.showMsg("请选择发送班级"),
                        !1;
                        m = !0,
                        b("#submitBtn").html("发布中").removeClass("btn_blue").addClass("btn_Grey"),
                        b("#uploadPicBtn").parent().parent().css("visibility", "hidden");
                        var h = {
                            uuid: c,
                            schoolCode: d,
                            classCode: f,
                            className: g
                        },
                        i = !1,
                        j = [],
                        k = b("#picList li[data-name]");
                        if (k.size() > 0) {
                            var l = k.size();
                            b("#picList  div .uploadnum").html("0%"),
                            _picUploader.on("uploadStart",
                            function(c) {
                                var d = b('#picList [data-id="' + c.id + '"]');
                                d.find(".uploadprogress").show();
                                var e = d.find(".uploadbg"),
                                f = d.find(".uploadnum"),
                                g = 60 + Math.ceil(10 * Math.random()),
                                k = {
                                    now: Math.ceil(10 * Math.random()),
                                    step: 1 + Math.ceil(1e3 * Math.random()) % 3,
                                    wait: g,
                                    finish: !1,
                                    timer: null
                                };
                                k.timer = setInterval(function() {
                                    console && console.log("debug:progress:" + c.id + " : " + k.now);
                                    k.now;
                                    k.now = k.finish ? k.now + 5 : k.now,
                                    k.now = !k.finish && k.now >= k.wait ? k.wait: k.now + k.step,
                                    k.now >= 100 && (k.now = 100),
                                    f.html(k.now + "%"),
                                    e.css({
                                        height: 100 - k.now + "%",
                                        "margin-top": k.now + "%"
                                    }),
                                    k.now >= 100 && (k.timer && clearInterval(k.timer), l--, d.find(".uploadprogress").hide(), d.find(".photo_op,.pt_op_bg").remove(), k = null, 0 >= l && (i = !0, b("#picList li[data-url]").each(function(a, c) {
                                        var d = b(c);
                                        j.push({
                                            picUrl: d.attr("data-url"),
                                            picDesc: d.find(".edit_name").val()
                                        })
                                    }), h.items = j, a(h)))
                                },
                                1e3),
                                d.data("upObj", k)
                            }),
                            _picUploader.on("uploadSuccess",
                            function(a, c) {
                                var d = c,
                                e = b('#picList [data-id="' + a.id + '"]');
                                e.attr("data-url", d.url);
                                var f = e.data("upObj");
                                f && (f.finish = !0)
                            }),
                            _picUploader.on("uploadFinished",
                            function() {}),
                            _picUploader.upload()
                        } else e.showMsg("请选择上传的图片");
                        return ! 1
                    }
                }
            }
        });
        function a(a) {
            e.post(g + "/webapp/clazzcircle/add", a,
            function(a) {
                m = !1,
                "001" == a.resultCode ? e.showMsg({
                    msg: "发布成功",
                    callback: function() {
                        o()
                    }
                }) : "202" == a.resultCode ? e.lostLogin() : e.showMsg(a.resultMsg)
            })
        }
    }
    function o() {
        location.reload()
    }
    j(),
    k(),
    l(),
    n(),
    module.exports = a
});
