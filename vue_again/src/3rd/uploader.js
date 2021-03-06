define(function(require, exports, module) {
    require("jquery"); !
    function(a, b) {
        var c, d = {},
        e = function(a, b) {
            var c, d, e;
            if ("string" == typeof a) return h(a);
            for (c = [], d = a.length, e = 0; d > e; e++) c.push(h(a[e]));
            return b.apply(null, c)
        },
        f = function(a, b, c) {
            2 === arguments.length && (c = b, b = null),
            e(b || [],
            function() {
                g(a, c, arguments)
            })
        },
        g = function(a, b, c) {
            var f, module = {
                exports: b
            };
            "function" == typeof b && (c.length || (c = [e, module.exports, module]), f = b.apply(null, c), void 0 !== f && (module.exports = f)),
            d[a] = module.exports
        },
        h = function(b) {
            var module = d[b] || a[b];
            if (!module) throw new Error("`" + b + "` is undefined");
            return module
        },
        i = function(a) {
            var b, c, e, f, g, h;
            h = function(a) {
                return a && a.charAt(0).toUpperCase() + a.substr(1)
            };
            for (b in d) if (c = a, d.hasOwnProperty(b)) {
                for (e = b.split("/"), g = h(e.pop()); f = h(e.shift());) c[f] = c[f] || {},
                c = c[f];
                c[g] = d[b]
            }
            return a
        },
        j = function(c) {
            return a.__dollar = c,
            i(b(a, f, e))
        };
        "object" == typeof module && "object" == typeof module.exports ? module.exports = j() : "function" == typeof define && define.amd ? define(["jquery"], j) : (c = a.WebUploader, a.WebUploader = j(), a.WebUploader.noConflict = function() {
            a.WebUploader = c
        })
    } (window,
    function(a, b, c) {
        return b("dollar-third", [],
        function() {
            var b = a.__dollar || a.jQuery || a.Zepto;
            if (!b) throw new Error("jQuery or Zepto not found!");
            return b
        }),
        b("dollar", ["dollar-third"],
        function(a) {
            return a
        }),
        b("promise-third", ["dollar"],
        function(a) {
            return {
                Deferred: a.Deferred,
                when: a.when,
                isPromise: function(a) {
                    return a && "function" == typeof a.then
                }
            }
        }),
        b("promise", ["promise-third"],
        function(a) {
            return a
        }),
        b("base", ["dollar", "promise"],
        function(b, c) {
            var d = function() {},
            e = Function.call;
            function f(a) {
                return function() {
                    return e.apply(a, arguments)
                }
            }
            function g(a, b) {
                return function() {
                    return a.apply(b, arguments)
                }
            }
            function h(a) {
                var b;
                return Object.create ? Object.create(a) : (b = function() {},
                b.prototype = a, new b)
            }
            return {
                version: "0.1.5",
                $: b,
                Deferred: c.Deferred,
                isPromise: c.isPromise,
                when: c.when,
                browser: function(a) {
                    var b = {},
                    c = a.match(/WebKit\/([\d.]+)/),
                    d = a.match(/Chrome\/([\d.]+)/) || a.match(/CriOS\/([\d.]+)/),
                    e = a.match(/MSIE\s([\d\.]+)/) || a.match(/(?:trident)(?:.*rv:([\w.]+))?/i),
                    f = a.match(/Firefox\/([\d.]+)/),
                    g = a.match(/Safari\/([\d.]+)/),
                    h = a.match(/OPR\/([\d.]+)/);
                    return c && (b.webkit = parseFloat(c[1])),
                    d && (b.chrome = parseFloat(d[1])),
                    e && (b.ie = parseFloat(e[1])),
                    f && (b.firefox = parseFloat(f[1])),
                    g && (b.safari = parseFloat(g[1])),
                    h && (b.opera = parseFloat(h[1])),
                    b
                } (navigator.userAgent),
                os: function(a) {
                    var b = {},
                    c = a.match(/(?:Android);?[\s\/]+([\d.]+)?/),
                    d = a.match(/(?:iPad|iPod|iPhone).*OS\s([\d_]+)/);
                    return c && (b.android = parseFloat(c[1])),
                    d && (b.ios = parseFloat(d[1].replace(/_/g, "."))),
                    b
                } (navigator.userAgent),
                inherits: function(a, c, d) {
                    var e;
                    return "function" == typeof c ? (e = c, c = null) : e = c && c.hasOwnProperty("constructor") ? c.constructor: function() {
                        return a.apply(this, arguments)
                    },
                    b.extend(!0, e, a, d || {}),
                    e.__super__ = a.prototype,
                    e.prototype = h(a.prototype),
                    c && b.extend(!0, e.prototype, c),
                    e
                },
                noop: d,
                bindFn: g,
                log: function() {
                    return a.console ? g(console.log, console) : d
                } (),
                nextTick: function() {
                    return function(a) {
                        setTimeout(a, 1)
                    }
                } (),
                slice: f([].slice),
                guid: function() {
                    var a = 0;
                    return function(b) {
                        for (var c = ( + new Date).toString(32), d = 0; 5 > d; d++) c += Math.floor(65535 * Math.random()).toString(32);
                        return (b || "wu_") + c + (a++).toString(32)
                    }
                } (),
                formatSize: function(a, b, c) {
                    var d;
                    for (c = c || ["B", "K", "M", "G", "TB"]; (d = c.shift()) && a > 1024;) a /= 1024;
                    return ("B" === d ? a: a.toFixed(b || 2)) + d
                }
            }
        }),
        b("mediator", ["base"],
        function(a) {
            var b, c = a.$,
            d = [].slice,
            e = /\s+/;
            function f(a, b, d, e) {
                return c.grep(a,
                function(a) {
                    return a && (!b || a.e === b) && (!d || a.cb === d || a.cb._cb === d) && (!e || a.ctx === e)
                })
            }
            function g(a, b, d) {
                c.each((a || "").split(e),
                function(a, c) {
                    d(c, b)
                })
            }
            function h(a, b) {
                for (var c, d = !1,
                e = -1,
                f = a.length; ++e < f;) if (c = a[e], c.cb.apply(c.ctx2, b) === !1) {
                    d = !0;
                    break
                }
                return ! d
            }
            return b = {
                on: function(a, b, c) {
                    var d, e = this;
                    return b ? (d = this._events || (this._events = []), g(a, b,
                    function(a, b) {
                        var f = {
                            e: a
                        };
                        f.cb = b,
                        f.ctx = c,
                        f.ctx2 = c || e,
                        f.id = d.length,
                        d.push(f)
                    }), this) : this
                },
                once: function(a, b, c) {
                    var d = this;
                    return b ? (g(a, b,
                    function(a, b) {
                        var e = function() {
                            return d.off(a, e),
                            b.apply(c || d, arguments)
                        };
                        e._cb = b,
                        d.on(a, e, c)
                    }), d) : d
                },
                off: function(a, b, d) {
                    var e = this._events;
                    return e ? a || b || d ? (g(a, b,
                    function(a, b) {
                        c.each(f(e, a, b, d),
                        function() {
                            delete e[this.id]
                        })
                    }), this) : (this._events = [], this) : this
                },
                trigger: function(a) {
                    var b, c, e;
                    return this._events && a ? (b = d.call(arguments, 1), c = f(this._events, a), e = f(this._events, "all"), h(c, b) && h(e, arguments)) : this
                }
            },
            c.extend({
                installTo: function(a) {
                    return c.extend(a, b)
                }
            },
            b)
        }),
        b("uploader", ["base", "mediator"],
        function(a, b) {
            var c = a.$;
            function d(a) {
                this.options = c.extend(!0, {},
                d.options, a),
                this._init(this.options)
            }
            return d.options = {},
            b.installTo(d.prototype),
            c.each({
                upload: "start-upload",
                stop: "stop-upload",
                getFile: "get-file",
                getFiles: "get-files",
                addFile: "add-file",
                addFiles: "add-file",
                sort: "sort-files",
                removeFile: "remove-file",
                cancelFile: "cancel-file",
                skipFile: "skip-file",
                retry: "retry",
                isInProgress: "is-in-progress",
                makeThumb: "make-thumb",
                md5File: "md5-file",
                getDimension: "get-dimension",
                addButton: "add-btn",
                predictRuntimeType: "predict-runtime-type",
                refresh: "refresh",
                disable: "disable",
                enable: "enable",
                reset: "reset"
            },
            function(a, b) {
                d.prototype[a] = function() {
                    return this.request(b, arguments)
                }
            }),
            c.extend(d.prototype, {
                state: "pending",
                _init: function(a) {
                    var b = this;
                    b.request("init", a,
                    function() {
                        b.state = "ready",
                        b.trigger("ready")
                    })
                },
                option: function(a, b) {
                    var d = this.options;
                    return arguments.length > 1 ? void(c.isPlainObject(b) && c.isPlainObject(d[a]) ? c.extend(d[a], b) : d[a] = b) : a ? d[a] : d
                },
                getStats: function() {
                    var a = this.request("get-stats");
                    return a ? {
                        successNum: a.numOfSuccess,
                        progressNum: a.numOfProgress,
                        cancelNum: a.numOfCancel,
                        invalidNum: a.numOfInvalid,
                        uploadFailNum: a.numOfUploadFailed,
                        queueNum: a.numOfQueue,
                        interruptNum: a.numofInterrupt
                    }: {}
                },
                trigger: function(a) {
                    var d = [].slice.call(arguments, 1),
                    e = this.options,
                    f = "on" + a.substring(0, 1).toUpperCase() + a.substring(1);
                    return b.trigger.apply(this, arguments) === !1 || c.isFunction(e[f]) && e[f].apply(this, d) === !1 || c.isFunction(this[f]) && this[f].apply(this, d) === !1 || b.trigger.apply(b, [this, a].concat(d)) === !1 ? !1 : !0
                },
                destroy: function() {
                    this.request("destroy", arguments),
                    this.off()
                },
                request: a.noop
            }),
            a.create = d.create = function(a) {
                return new d(a)
            },
            a.Uploader = d,
            d
        }),
        b("runtime/runtime", ["base", "mediator"],
        function(a, b) {
            var c = a.$,
            d = {},
            e = function(a) {
                for (var b in a) if (a.hasOwnProperty(b)) return b;
                return null
            };
            function f(b) {
                this.options = c.extend({
                    container: document.body
                },
                b),
                this.uid = a.guid("rt_")
            }
            return c.extend(f.prototype, {
                getContainer: function() {
                    var a, b, d = this.options;
                    return this._container ? this._container: (a = c(d.container || document.body), b = c(document.createElement("div")), b.attr("id", "rt_" + this.uid), b.css({
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        width: "1px",
                        height: "1px",
                        overflow: "hidden"
                    }), a.append(b), a.addClass("webuploader-container"), this._container = b, this._parent = a, b)
                },
                init: a.noop,
                exec: a.noop,
                destroy: function() {
                    this._container && this._container.remove(),
                    this._parent && this._parent.removeClass("webuploader-container"),
                    this.off()
                }
            }),
            f.orders = "html5,flash",
            f.addRuntime = function(a, b) {
                d[a] = b
            },
            f.hasRuntime = function(a) {
                return !! (a ? d[a] : e(d))
            },
            f.create = function(a, b) {
                var g, h;
                if (b = b || f.orders, c.each(b.split(/\s*,\s*/g),
                function() {
                    return d[this] ? (g = this, !1) : void 0
                }), g = g || e(d), !g) throw new Error("Runtime Error");
                return h = new d[g](a)
            },
            b.installTo(f.prototype),
            f
        }),
        b("runtime/client", ["base", "mediator", "runtime/runtime"],
        function(a, b, c) {
            var d;
            d = function() {
                var a = {};
                return {
                    add: function(b) {
                        a[b.uid] = b
                    },
                    get: function(b, c) {
                        var d;
                        if (b) return a[b];
                        for (d in a) if (!c || !a[d].__standalone) return a[d];
                        return null
                    },
                    remove: function(b) {
                        delete a[b.uid]
                    }
                }
            } ();
            function e(b, e) {
                var f, g = a.Deferred();
                this.uid = a.guid("client_"),
                this.runtimeReady = function(a) {
                    return g.done(a)
                },
                this.connectRuntime = function(b, h) {
                    if (f) throw new Error("already connected!");
                    return g.done(h),
                    "string" == typeof b && d.get(b) && (f = d.get(b)),
                    f = f || d.get(null, e),
                    f ? (a.$.extend(f.options, b), f.__promise.then(g.resolve), f.__client++) : (f = c.create(b, b.runtimeOrder), f.__promise = g.promise(), f.once("ready", g.resolve), f.init(), d.add(f), f.__client = 1),
                    e && (f.__standalone = e),
                    f
                },
                this.getRuntime = function() {
                    return f
                },
                this.disconnectRuntime = function() {
                    f && (f.__client--, f.__client <= 0 && (d.remove(f), delete f.__promise, f.destroy()), f = null)
                },
                this.exec = function() {
                    if (f) {
                        var c = a.slice(arguments);
                        return b && c.unshift(b),
                        f.exec.apply(this, c)
                    }
                },
                this.getRuid = function() {
                    return f && f.uid
                },
                this.destroy = function(a) {
                    return function() {
                        a && a.apply(this, arguments),
                        this.trigger("destroy"),
                        this.off(),
                        this.exec("destroy"),
                        this.disconnectRuntime()
                    }
                } (this.destroy)
            }
            return b.installTo(e.prototype),
            e
        }),
        b("lib/dnd", ["base", "mediator", "runtime/client"],
        function(a, b, c) {
            var d = a.$;
            function e(a) {
                a = this.options = d.extend({},
                e.options, a),
                a.container = d(a.container),
                a.container.length && c.call(this, "DragAndDrop")
            }
            return e.options = {
                accept: null,
                disableGlobalDnd: !1
            },
            a.inherits(c, {
                constructor: e,
                init: function() {
                    var a = this;
                    a.connectRuntime(a.options,
                    function() {
                        a.exec("init"),
                        a.trigger("ready")
                    })
                }
            }),
            b.installTo(e.prototype),
            e
        }),
        b("widgets/widget", ["base", "uploader"],
        function(a, b) {
            var c = a.$,
            d = b.prototype._init,
            e = b.prototype.destroy,
            f = {},
            g = [];
            function h(a) {
                if (!a) return ! 1;
                var b = a.length,
                d = c.type(a);
                return 1 === a.nodeType && b ? !0 : "array" === d || "function" !== d && "string" !== d && (0 === b || "number" == typeof b && b > 0 && b - 1 in a)
            }
            function i(a) {
                this.owner = a,
                this.options = a.options
            }
            return c.extend(i.prototype, {
                init: a.noop,
                invoke: function(a, b) {
                    var d = this.responseMap;
                    return d && a in d && d[a] in this && c.isFunction(this[d[a]]) ? this[d[a]].apply(this, b) : f
                },
                request: function() {
                    return this.owner.request.apply(this.owner, arguments)
                }
            }),
            c.extend(b.prototype, {
                _init: function() {
                    var a = this,
                    b = a._widgets = [],
                    e = a.options.disableWidgets || "";
                    return c.each(g,
                    function(c, d) { (!e || !~e.indexOf(d._name)) && b.push(new d(a))
                    }),
                    d.apply(a, arguments)
                },
                request: function(b, c, d) {
                    var e, g, i, j, k = 0,
                    l = this._widgets,
                    m = l && l.length,
                    n = [],
                    o = [];
                    for (c = h(c) ? c: [c]; m > k; k++) e = l[k],
                    g = e.invoke(b, c),
                    g !== f && (a.isPromise(g) ? o.push(g) : n.push(g));
                    return d || o.length ? (i = a.when.apply(a, o), j = i.pipe ? "pipe": "then", i[j](function() {
                        var b = a.Deferred(),
                        c = arguments;
                        return 1 === c.length && (c = c[0]),
                        setTimeout(function() {
                            b.resolve(c)
                        },
                        1),
                        b.promise()
                    })[d ? j: "done"](d || a.noop)) : n[0]
                },
                destroy: function() {
                    e.apply(this, arguments),
                    this._widgets = null
                }
            }),
            b.register = i.register = function(b, d) {
                var e, f = {
                    init: "init",
                    destroy: "destroy",
                    name: "anonymous"
                };
                return 1 === arguments.length ? (d = b, c.each(d,
                function(a) {
                    return "_" === a[0] || "name" === a ? void("name" === a && (f.name = d.name)) : void(f[a.replace(/[A-Z]/g, "-$&").toLowerCase()] = a)
                })) : f = c.extend(f, b),
                d.responseMap = f,
                e = a.inherits(i, d),
                e._name = f.name,
                g.push(e),
                e
            },
            b.unRegister = i.unRegister = function(a) {
                if (a && "anonymous" !== a) for (var b = g.length; b--;) g[b]._name === a && g.splice(b, 1)
            },
            i
        }),
        b("widgets/filednd", ["base", "uploader", "lib/dnd", "widgets/widget"],
        function(a, b, c) {
            var d = a.$;
            return b.options.dnd = "",
            b.register({
                name: "dnd",
                init: function(b) {
                    if (b.dnd && "html5" === this.request("predict-runtime-type")) {
                        var e, f = this,
                        g = a.Deferred(),
                        h = d.extend({},
                        {
                            disableGlobalDnd: b.disableGlobalDnd,
                            container: b.dnd,
                            accept: b.accept
                        });
                        return this.dnd = e = new c(h),
                        e.once("ready", g.resolve),
                        e.on("drop",
                        function(a) {
                            f.request("add-file", [a])
                        }),
                        e.on("accept",
                        function(a) {
                            return f.owner.trigger("dndAccept", a)
                        }),
                        e.init(),
                        g.promise()
                    }
                },
                destroy: function() {
                    this.dnd && this.dnd.destroy()
                }
            })
        }),
        b("lib/filepaste", ["base", "mediator", "runtime/client"],
        function(a, b, c) {
            var d = a.$;
            function e(a) {
                a = this.options = d.extend({},
                a),
                a.container = d(a.container || document.body),
                c.call(this, "FilePaste")
            }
            return a.inherits(c, {
                constructor: e,
                init: function() {
                    var a = this;
                    a.connectRuntime(a.options,
                    function() {
                        a.exec("init"),
                        a.trigger("ready")
                    })
                }
            }),
            b.installTo(e.prototype),
            e
        }),
        b("widgets/filepaste", ["base", "uploader", "lib/filepaste", "widgets/widget"],
        function(a, b, c) {
            var d = a.$;
            return b.register({
                name: "paste",
                init: function(b) {
                    if (b.paste && "html5" === this.request("predict-runtime-type")) {
                        var e, f = this,
                        g = a.Deferred(),
                        h = d.extend({},
                        {
                            container: b.paste,
                            accept: b.accept
                        });
                        return this.paste = e = new c(h),
                        e.once("ready", g.resolve),
                        e.on("paste",
                        function(a) {
                            f.owner.request("add-file", [a])
                        }),
                        e.init(),
                        g.promise()
                    }
                },
                destroy: function() {
                    this.paste && this.paste.destroy()
                }
            })
        }),
        b("lib/blob", ["base", "runtime/client"],
        function(a, b) {
            function c(a, c) {
                var d = this;
                d.source = c,
                d.ruid = a,
                this.size = c.size || 0,
                !c.type && this.ext && ~"jpg,jpeg,png,gif,bmp".indexOf(this.ext) ? this.type = "image/" + ("jpg" === this.ext ? "jpeg": this.ext) : this.type = c.type || "application/octet-stream",
                b.call(d, "Blob"),
                this.uid = c.uid || this.uid,
                a && d.connectRuntime(a)
            }
            return a.inherits(b, {
                constructor: c,
                slice: function(a, b) {
                    return this.exec("slice", a, b)
                },
                getSource: function() {
                    return this.source
                }
            }),
            c
        }),
        b("lib/file", ["base", "lib/blob"],
        function(a, b) {
            var c = 1,
            d = /\.([^.]+)$/;
            function e(a, e) {
                var f;
                this.name = e.name || "untitled" + c++,
                f = d.exec(e.name) ? RegExp.$1.toLowerCase() : "",
                !f && e.type && (f = /\/(jpg|jpeg|png|gif|bmp)$/i.exec(e.type) ? RegExp.$1.toLowerCase() : "", this.name += "." + f),
                this.ext = f,
                this.lastModifiedDate = e.lastModifiedDate || (new Date).toLocaleString(),
                b.apply(this, arguments)
            }
            return a.inherits(b, e)
        }),
        b("lib/filepicker", ["base", "runtime/client", "lib/file"],
        function(b, c, d) {
            var e = b.$;
            function f(a) {
                if (a = this.options = e.extend({},
                f.options, a), a.container = e(a.id), !a.container.length) throw new Error("按钮指定错误");
                a.innerHTML = a.innerHTML || a.label || a.container.html() || "",
                a.button = e(a.button || document.createElement("div")),
                a.button.html(a.innerHTML),
                a.container.html(a.button),
                c.call(this, "FilePicker", !0)
            }
            return f.options = {
                button: null,
                container: null,
                label: null,
                innerHTML: null,
                multiple: !0,
                accept: null,
                name: "file"
            },
            b.inherits(c, {
                constructor: f,
                init: function() {
                    var c = this,
                    f = c.options,
                    g = f.button;
                    g.addClass("webuploader-pick"),
                    c.on("all",
                    function(a) {
                        var b;
                        switch (a) {
                        case "mouseenter":
                            g.addClass("webuploader-pick-hover");
                            break;
                        case "mouseleave":
                            g.removeClass("webuploader-pick-hover");
                            break;
                        case "change":
                            b = c.exec("getFiles"),
                            c.trigger("select", e.map(b,
                            function(a) {
                                return a = new d(c.getRuid(), a),
                                a._refer = f.container,
                                a
                            }), f.container)
                        }
                    }),
                    c.connectRuntime(f,
                    function() {
                        c.refresh(),
                        c.exec("init", f),
                        c.trigger("ready")
                    }),
                    this._resizeHandler = b.bindFn(this.refresh, this),
                    e(a).on("resize", this._resizeHandler)
                },
                refresh: function() {
                    var a = this.getRuntime().getContainer(),
                    b = this.options.button,
                    c = b.outerWidth ? b.outerWidth() : b.width(),
                    d = b.outerHeight ? b.outerHeight() : b.height(),
                    e = b.offset();
                    c && d && a.css({
                        bottom: "auto",
                        right: "auto",
                        width: c + "px",
                        height: d + "px"
                    }).offset(e)
                },
                enable: function() {
                    var a = this.options.button;
                    a.removeClass("webuploader-pick-disable"),
                    this.refresh()
                },
                disable: function() {
                    var a = this.options.button;
                    this.getRuntime().getContainer().css({
                        top: "-99999px"
                    }),
                    a.addClass("webuploader-pick-disable")
                },
                destroy: function() {
                    var b = this.options.button;
                    e(a).off("resize", this._resizeHandler),
                    b.removeClass("webuploader-pick-disable webuploader-pick-hover webuploader-pick")
                }
            }),
            f
        }),
        b("widgets/filepicker", ["base", "uploader", "lib/filepicker", "widgets/widget"],
        function(a, b, c) {
            var d = a.$;
            return d.extend(b.options, {
                pick: null,
                accept: null
            }),
            b.register({
                name: "picker",
                init: function(a) {
                    return this.pickers = [],
                    a.pick && this.addBtn(a.pick)
                },
                refresh: function() {
                    d.each(this.pickers,
                    function() {
                        this.refresh()
                    })
                },
                addBtn: function(b) {
                    var e = this,
                    f = e.options,
                    g = f.accept,
                    h = [];
                    if (b) return d.isPlainObject(b) || (b = {
                        id: b
                    }),
                    d(b.id).each(function() {
                        var i, j, k;
                        k = a.Deferred(),
                        i = d.extend({},
                        b, {
                            accept: d.isPlainObject(g) ? [g] : g,
                            swf: f.swf,
                            runtimeOrder: f.runtimeOrder,
                            id: this
                        }),
                        j = new c(i),
                        j.once("ready", k.resolve),
                        j.on("select",
                        function(a) {
                            e.owner.request("add-file", [a])
                        }),
                        j.init(),
                        e.pickers.push(j),
                        h.push(k.promise())
                    }),
                    a.when.apply(a, h)
                },
                disable: function() {
                    d.each(this.pickers,
                    function() {
                        this.disable()
                    })
                },
                enable: function() {
                    d.each(this.pickers,
                    function() {
                        this.enable()
                    })
                },
                destroy: function() {
                    d.each(this.pickers,
                    function() {
                        this.destroy()
                    }),
                    this.pickers = null
                }
            })
        }),
        b("lib/image", ["base", "runtime/client", "lib/blob"],
        function(a, b, c) {
            var d = a.$;
            function e(a) {
                this.options = d.extend({},
                e.options, a),
                b.call(this, "Image"),
                this.on("load",
                function() {
                    this._info = this.exec("info"),
                    this._meta = this.exec("meta")
                })
            }
            return e.options = {
                quality: 90,
                crop: !1,
                preserveHeaders: !1,
                allowMagnify: !1
            },
            a.inherits(b, {
                constructor: e,
                info: function(a) {
                    return a ? (this._info = a, this) : this._info
                },
                meta: function(a) {
                    return a ? (this._meta = a, this) : this._meta
                },
                loadFromBlob: function(a) {
                    var b = this,
                    c = a.getRuid();
                    this.connectRuntime(c,
                    function() {
                        b.exec("init", b.options),
                        b.exec("loadFromBlob", a)
                    })
                },
                resize: function() {
                    var b = a.slice(arguments);
                    return this.exec.apply(this, ["resize"].concat(b))
                },
                crop: function() {
                    var b = a.slice(arguments);
                    return this.exec.apply(this, ["crop"].concat(b))
                },
                getAsDataUrl: function(a) {
                    return this.exec("getAsDataUrl", a)
                },
                getAsBlob: function(a) {
                    var b = this.exec("getAsBlob", a);
                    return new c(this.getRuid(), b)
                }
            }),
            e
        }),
        b("widgets/image", ["base", "uploader", "lib/image", "widgets/widget"],
        function(a, b, c) {
            var d, e = a.$;
            return d = function(a) {
                var b = 0,
                c = [],
                d = function() {
                    for (var d; c.length && a > b;) d = c.shift(),
                    b += d[0],
                    d[1]()
                };
                return function(a, e, f) {
                    c.push([e, f]),
                    a.once("destroy",
                    function() {
                        b -= e,
                        setTimeout(d, 1)
                    }),
                    setTimeout(d, 1)
                }
            } (5242880),
            e.extend(b.options, {
                thumb: {
                    width: 110,
                    height: 110,
                    quality: 70,
                    allowMagnify: !0,
                    crop: !0,
                    preserveHeaders: !1,
                    type: "image/jpeg"
                },
                compress: {
                    width: 1600,
                    height: 1600,
                    quality: 90,
                    allowMagnify: !1,
                    crop: !1,
                    preserveHeaders: !0
                }
            }),
            b.register({
                name: "image",
                makeThumb: function(a, b, f, g) {
                    var h, i;
                    return a = this.request("get-file", a),
                    a.type.match(/^image/) ? (h = e.extend({},
                    this.options.thumb), e.isPlainObject(f) && (h = e.extend(h, f), f = null), f = f || h.width, g = g || h.height, i = new c(h), i.once("load",
                    function() {
                        a._info = a._info || i.info(),
                        a._meta = a._meta || i.meta(),
                        1 >= f && f > 0 && (f = a._info.width * f),
                        1 >= g && g > 0 && (g = a._info.height * g),
                        i.resize(f, g)
                    }), i.once("complete",
                    function() {
                        b(!1, i.getAsDataUrl(h.type)),
                        i.destroy()
                    }), i.once("error",
                    function(a) {
                        b(a || !0),
                        i.destroy()
                    }), void d(i, a.source.size,
                    function() {
                        a._info && i.info(a._info),
                        a._meta && i.meta(a._meta),
                        i.loadFromBlob(a.source)
                    })) : void b(!0)
                },
                beforeSendFile: function(b) {
                    var d, f, g = this.options.compress || this.options.resize,
                    h = g && g.compressSize || 0,
                    i = g && g.noCompressIfLarger || !1;
                    return b = this.request("get-file", b),
                    !g || !~"image/jpeg,image/jpg".indexOf(b.type) || b.size < h || b._compressed ? void 0 : (g = e.extend({},
                    g), f = a.Deferred(), d = new c(g), f.always(function() {
                        d.destroy(),
                        d = null
                    }), d.once("error", f.reject), d.once("load",
                    function() {
                        var a = g.width,
                        c = g.height;
                        b._info = b._info || d.info(),
                        b._meta = b._meta || d.meta(),
                        1 >= a && a > 0 && (a = b._info.width * a),
                        1 >= c && c > 0 && (c = b._info.height * c),
                        d.resize(a, c)
                    }), d.once("complete",
                    function() {
                        var a, c;
                        try {
                            a = d.getAsBlob(g.type),
                            c = b.size,
                            (!i || a.size < c) && (b.source = a, b.size = a.size, b.trigger("resize", a.size, c)),
                            b._compressed = !0,
                            f.resolve()
                        } catch(e) {
                            f.resolve()
                        }
                    }), b._info && d.info(b._info), b._meta && d.meta(b._meta), d.loadFromBlob(b.source), f.promise())
                }
            })
        }),
        b("file", ["base", "mediator"],
        function(a, b) {
            var c = a.$,
            d = "WU_FILE_",
            e = 0,
            f = /\.([^.]+)$/,
            g = {};
            function h() {
                return d + e++
            }
            function i(a) {
                this.name = a.name || "Untitled",
                this.size = a.size || 0,
                this.type = a.type || "application/octet-stream",
                this.lastModifiedDate = a.lastModifiedDate || 1 * new Date,
                this.id = h(),
                this.ext = f.exec(this.name) ? RegExp.$1: "",
                this.statusText = "",
                g[this.id] = i.Status.INITED,
                this.source = a,
                this.loaded = 0,
                this.on("error",
                function(a) {
                    this.setStatus(i.Status.ERROR, a)
                })
            }
            return c.extend(i.prototype, {
                setStatus: function(a, b) {
                    var c = g[this.id];
                    "undefined" != typeof b && (this.statusText = b),
                    a !== c && (g[this.id] = a, this.trigger("statuschange", a, c))
                },
                getStatus: function() {
                    return g[this.id]
                },
                getSource: function() {
                    return this.source
                },
                destroy: function() {
                    this.off(),
                    delete g[this.id]
                }
            }),
            b.installTo(i.prototype),
            i.Status = {
                INITED: "inited",
                QUEUED: "queued",
                PROGRESS: "progress",
                ERROR: "error",
                COMPLETE: "complete",
                CANCELLED: "cancelled",
                INTERRUPT: "interrupt",
                INVALID: "invalid"
            },
            i
        }),
        b("queue", ["base", "mediator", "file"],
        function(a, b, c) {
            var d = a.$,
            e = c.Status;
            function f() {
                this.stats = {
                    numOfQueue: 0,
                    numOfSuccess: 0,
                    numOfCancel: 0,
                    numOfProgress: 0,
                    numOfUploadFailed: 0,
                    numOfInvalid: 0,
                    numofDeleted: 0,
                    numofInterrupt: 0
                },
                this._queue = [],
                this._map = {}
            }
            return d.extend(f.prototype, {
                append: function(a) {
                    return this._queue.push(a),
                    this._fileAdded(a),
                    this
                },
                prepend: function(a) {
                    return this._queue.unshift(a),
                    this._fileAdded(a),
                    this
                },
                getFile: function(a) {
                    return "string" != typeof a ? a: this._map[a]
                },
                fetch: function(a) {
                    var b, c, d = this._queue.length;
                    for (a = a || e.QUEUED, b = 0; d > b; b++) if (c = this._queue[b], a === c.getStatus()) return c;
                    return null
                },
                sort: function(a) {
                    "function" == typeof a && this._queue.sort(a)
                },
                getFiles: function() {
                    for (var a, b = [].slice.call(arguments, 0), c = [], e = 0, f = this._queue.length; f > e; e++) a = this._queue[e],
                    (!b.length || ~d.inArray(a.getStatus(), b)) && c.push(a);
                    return c
                },
                removeFile: function(a) {
                    var b = this._map[a.id];
                    b && (delete this._map[a.id], a.destroy(), this.stats.numofDeleted++)
                },
                _fileAdded: function(a) {
                    var b = this,
                    c = this._map[a.id];
                    c || (this._map[a.id] = a, a.on("statuschange",
                    function(a, c) {
                        b._onFileStatusChange(a, c)
                    }))
                },
                _onFileStatusChange: function(a, b) {
                    var c = this.stats;
                    switch (b) {
                    case e.PROGRESS:
                        c.numOfProgress--;
                        break;
                    case e.QUEUED:
                        c.numOfQueue--;
                        break;
                    case e.ERROR:
                        c.numOfUploadFailed--;
                        break;
                    case e.INVALID:
                        c.numOfInvalid--;
                        break;
                    case e.INTERRUPT:
                        c.numofInterrupt--
                    }
                    switch (a) {
                    case e.QUEUED:
                        c.numOfQueue++;
                        break;
                    case e.PROGRESS:
                        c.numOfProgress++;
                        break;
                    case e.ERROR:
                        c.numOfUploadFailed++;
                        break;
                    case e.COMPLETE:
                        c.numOfSuccess++;
                        break;
                    case e.CANCELLED:
                        c.numOfCancel++;
                        break;
                    case e.INVALID:
                        c.numOfInvalid++;
                        break;
                    case e.INTERRUPT:
                        c.numofInterrupt++
                    }
                }
            }),
            b.installTo(f.prototype),
            f
        }),
        b("widgets/queue", ["base", "uploader", "queue", "file", "lib/file", "runtime/client", "widgets/widget"],
        function(a, b, c, d, e, f) {
            var g = a.$,
            h = /\.\w+$/,
            i = d.Status;
            return b.register({
                name: "queue",
                init: function(b) {
                    var d, e, h, i, j, k, l, m = this;
                    if (g.isPlainObject(b.accept) && (b.accept = [b.accept]), b.accept) {
                        for (j = [], h = 0, e = b.accept.length; e > h; h++) i = b.accept[h].extensions,
                        i && j.push(i);
                        j.length && (k = "\\." + j.join(",").replace(/,/g, "$|\\.").replace(/\*/g, ".*") + "$"),
                        m.accept = new RegExp(k, "i")
                    }
                    return m.queue = new c,
                    m.stats = m.queue.stats,
                    "html5" === this.request("predict-runtime-type") ? (d = a.Deferred(), this.placeholder = l = new f("Placeholder"), l.connectRuntime({
                        runtimeOrder: "html5"
                    },
                    function() {
                        m._ruid = l.getRuid(),
                        d.resolve()
                    }), d.promise()) : void 0
                },
                _wrapFile: function(a) {
                    if (! (a instanceof d)) {
                        if (! (a instanceof e)) {
                            if (!this._ruid) throw new Error("Can't add external files.");
                            a = new e(this._ruid, a)
                        }
                        a = new d(a)
                    }
                    return a
                },
                acceptFile: function(a) {
                    var b = !a || !a.size || this.accept && h.exec(a.name) && !this.accept.test(a.name);
                    return ! b
                },
                _addFile: function(a) {
                    var b = this;
                    return a = b._wrapFile(a),
                    b.owner.trigger("beforeFileQueued", a) ? b.acceptFile(a) ? (b.queue.append(a), b.owner.trigger("fileQueued", a), a) : void b.owner.trigger("error", "Q_TYPE_DENIED", a) : void 0
                },
                getFile: function(a) {
                    return this.queue.getFile(a)
                },
                addFile: function(a) {
                    var b = this;
                    a.length || (a = [a]),
                    a = g.map(a,
                    function(a) {
                        return b._addFile(a)
                    }),
                    b.owner.trigger("filesQueued", a),
                    b.options.auto && setTimeout(function() {
                        b.request("start-upload")
                    },
                    20)
                },
                getStats: function() {
                    return this.stats
                },
                removeFile: function(a, b) {
                    var c = this;
                    a = a.id ? a: c.queue.getFile(a),
                    this.request("cancel-file", a),
                    b && this.queue.removeFile(a)
                },
                getFiles: function() {
                    return this.queue.getFiles.apply(this.queue, arguments)
                },
                fetchFile: function() {
                    return this.queue.fetch.apply(this.queue, arguments)
                },
                retry: function(a, b) {
                    var c, d, e, f = this;
                    if (a) return a = a.id ? a: f.queue.getFile(a),
                    a.setStatus(i.QUEUED),
                    void(b || f.request("start-upload"));
                    for (c = f.queue.getFiles(i.ERROR), d = 0, e = c.length; e > d; d++) a = c[d],
                    a.setStatus(i.QUEUED);
                    f.request("start-upload")
                },
                sortFiles: function() {
                    return this.queue.sort.apply(this.queue, arguments)
                },
                reset: function() {
                    this.owner.trigger("reset"),
                    this.queue = new c,
                    this.stats = this.queue.stats
                },
                destroy: function() {
                    this.reset(),
                    this.placeholder && this.placeholder.destroy()
                }
            })
        }),
        b("widgets/runtime", ["uploader", "runtime/runtime", "widgets/widget"],
        function(a, b) {
            return a.support = function() {
                return b.hasRuntime.apply(b, arguments)
            },
            a.register({
                name: "runtime",
                init: function() {
                    if (!this.predictRuntimeType()) throw Error("Runtime Error")
                },
                predictRuntimeType: function() {
                    var a, c, d = this.options.runtimeOrder || b.orders,
                    e = this.type;
                    if (!e) for (d = d.split(/\s*,\s*/g), a = 0, c = d.length; c > a; a++) if (b.hasRuntime(d[a])) {
                        this.type = e = d[a];
                        break
                    }
                    return e
                }
            })
        }),
        b("lib/transport", ["base", "runtime/client", "mediator"],
        function(a, b, c) {
            var d = a.$;
            function e(a) {
                var c = this;
                a = c.options = d.extend(!0, {},
                e.options, a || {}),
                b.call(this, "Transport"),
                this._blob = null,
                this._formData = a.formData || {},
                this._headers = a.headers || {},
                this.on("progress", this._timeout),
                this.on("load error",
                function() {
                    c.trigger("progress", 1),
                    clearTimeout(c._timer)
                })
            }
            return e.options = {
                server: "",
                method: "POST",
                withCredentials: !1,
                fileVal: "file",
                timeout: 12e4,
                formData: {},
                headers: {},
                sendAsBinary: !1
            },
            d.extend(e.prototype, {
                appendBlob: function(a, b, c) {
                    var d = this,
                    e = d.options;
                    d.getRuid() && d.disconnectRuntime(),
                    d.connectRuntime(b.ruid,
                    function() {
                        d.exec("init")
                    }),
                    d._blob = b,
                    e.fileVal = a || e.fileVal,
                    e.filename = c || e.filename
                },
                append: function(a, b) {
                    "object" == typeof a ? d.extend(this._formData, a) : this._formData[a] = b
                },
                setRequestHeader: function(a, b) {
                    "object" == typeof a ? d.extend(this._headers, a) : this._headers[a] = b
                },
                send: function(a) {
                    this.exec("send", a),
                    this._timeout()
                },
                abort: function() {
                    return clearTimeout(this._timer),
                    this.exec("abort")
                },
                destroy: function() {
                    this.trigger("destroy"),
                    this.off(),
                    this.exec("destroy"),
                    this.disconnectRuntime()
                },
                getResponse: function() {
                    return this.exec("getResponse")
                },
                getResponseAsJson: function() {
                    return this.exec("getResponseAsJson")
                },
                getStatus: function() {
                    return this.exec("getStatus")
                },
                _timeout: function() {
                    var a = this,
                    b = a.options.timeout;
                    b && (clearTimeout(a._timer), a._timer = setTimeout(function() {
                        a.abort(),
                        a.trigger("error", "timeout")
                    },
                    b))
                }
            }),
            c.installTo(e.prototype),
            e
        }),
        b("widgets/upload", ["base", "uploader", "file", "lib/transport", "widgets/widget"],
        function(a, b, c, d) {
            var e = a.$,
            f = a.isPromise,
            g = c.Status;
            e.extend(b.options, {
                prepareNextFile: !1,
                chunked: !1,
                chunkSize: 5242880,
                chunkRetry: 2,
                threads: 3,
                formData: {}
            });
            function h(a, b) {
                var c, d, e = [],
                f = a.source,
                g = f.size,
                h = b ? Math.ceil(g / b) : 1,
                i = 0,
                j = 0;
                for (d = {
                    file: a,
                    has: function() {
                        return !! e.length
                    },
                    shift: function() {
                        return e.shift()
                    },
                    unshift: function(a) {
                        e.unshift(a)
                    }
                }; h > j;) c = Math.min(b, g - i),
                e.push({
                    file: a,
                    start: i,
                    end: b ? i + c: g,
                    total: g,
                    chunks: h,
                    chunk: j++,
                    cuted: d
                }),
                i += c;
                return a.blocks = e.concat(),
                a.remaning = e.length,
                d
            }
            b.register({
                name: "upload",
                init: function() {
                    var b = this.owner,
                    c = this;
                    this.runing = !1,
                    this.progress = !1,
                    b.on("startUpload",
                    function() {
                        c.progress = !0
                    }).on("uploadFinished",
                    function() {
                        c.progress = !1
                    }),
                    this.pool = [],
                    this.stack = [],
                    this.pending = [],
                    this.remaning = 0,
                    this.__tick = a.bindFn(this._tick, this),
                    b.on("uploadComplete",
                    function(a) {
                        a.blocks && e.each(a.blocks,
                        function(a, b) {
                            b.transport && (b.transport.abort(), b.transport.destroy()),
                            delete b.transport
                        }),
                        delete a.blocks,
                        delete a.remaning
                    })
                },
                reset: function() {
                    this.request("stop-upload", !0),
                    this.runing = !1,
                    this.pool = [],
                    this.stack = [],
                    this.pending = [],
                    this.remaning = 0,
                    this._trigged = !1,
                    this._promise = null
                },
                startUpload: function(b) {
                    var c = this;
                    if (e.each(c.request("get-files", g.INVALID),
                    function() {
                        c.request("remove-file", this)
                    }), b) if (b = b.id ? b: c.request("get-file", b), b.getStatus() === g.INTERRUPT) e.each(c.pool,
                    function(a, c) {
                        c.file === b && c.transport && c.transport.send()
                    }),
                    b.setStatus(g.QUEUED);
                    else {
                        if (b.getStatus() === g.PROGRESS) return;
                        b.setStatus(g.QUEUED)
                    } else e.each(c.request("get-files", [g.INITED]),
                    function() {
                        this.setStatus(g.QUEUED)
                    });
                    if (!c.runing) {
                        c.runing = !0;
                        var d = [];
                        e.each(c.pool,
                        function(a, b) {
                            var e = b.file;
                            e.getStatus() === g.INTERRUPT && (d.push(e), c._trigged = !1, b.transport && b.transport.send())
                        });
                        for (var b; b = d.shift();) b.setStatus(g.PROGRESS);
                        b || e.each(c.request("get-files", g.INTERRUPT),
                        function() {
                            this.setStatus(g.PROGRESS)
                        }),
                        c._trigged = !1,
                        a.nextTick(c.__tick),
                        c.owner.trigger("startUpload")
                    }
                },
                stopUpload: function(b, c) {
                    var d = this;
                    if (b === !0 && (c = b, b = null), d.runing !== !1) {
                        if (b) {
                            if (b = b.id ? b: d.request("get-file", b), b.getStatus() !== g.PROGRESS && b.getStatus() !== g.QUEUED) return;
                            return b.setStatus(g.INTERRUPT),
                            e.each(d.pool,
                            function(a, c) {
                                c.file === b && (c.transport && c.transport.abort(), d._putback(c), d._popBlock(c))
                            }),
                            a.nextTick(d.__tick)
                        }
                        d.runing = !1,
                        this._promise && this._promise.file && this._promise.file.setStatus(g.INTERRUPT),
                        c && e.each(d.pool,
                        function(a, b) {
                            b.transport && b.transport.abort(),
                            b.file.setStatus(g.INTERRUPT)
                        }),
                        d.owner.trigger("stopUpload")
                    }
                },
                cancelFile: function(a) {
                    a = a.id ? a: this.request("get-file", a),
                    a.blocks && e.each(a.blocks,
                    function(a, b) {
                        var c = b.transport;
                        c && (c.abort(), c.destroy(), delete b.transport)
                    }),
                    a.setStatus(g.CANCELLED),
                    this.owner.trigger("fileDequeued", a)
                },
                isInProgress: function() {
                    return !! this.progress
                },
                _getStats: function() {
                    return this.request("get-stats")
                },
                skipFile: function(a, b) {
                    a = a.id ? a: this.request("get-file", a),
                    a.setStatus(b || g.COMPLETE),
                    a.skipped = !0,
                    a.blocks && e.each(a.blocks,
                    function(a, b) {
                        var c = b.transport;
                        c && (c.abort(), c.destroy(), delete b.transport)
                    }),
                    this.owner.trigger("uploadSkip", a)
                },
                _tick: function() {
                    var b, c, d = this,
                    e = d.options;
                    return d._promise ? d._promise.always(d.__tick) : void(d.pool.length < e.threads && (c = d._nextBlock()) ? (d._trigged = !1, b = function(b) {
                        d._promise = null,
                        b && b.file && d._startSend(b),
                        a.nextTick(d.__tick)
                    },
                    d._promise = f(c) ? c.always(b) : b(c)) : d.remaning || d._getStats().numOfQueue || d._getStats().numofInterrupt || (d.runing = !1, d._trigged || a.nextTick(function() {
                        d.owner.trigger("uploadFinished")
                    }), d._trigged = !0))
                },
                _putback: function(a) {
                    var b;
                    a.cuted.unshift(a),
                    b = this.stack.indexOf(a.cuted),
                    ~b || this.stack.unshift(a.cuted)
                },
                _getStack: function() {
                    for (var a, b = 0; a = this.stack[b++];) {
                        if (a.has() && a.file.getStatus() === g.PROGRESS) return a; (!a.has() || a.file.getStatus() !== g.PROGRESS && a.file.getStatus() !== g.INTERRUPT) && this.stack.splice(--b, 1)
                    }
                    return null
                },
                _nextBlock: function() {
                    var a, b, c, d, e = this,
                    g = e.options;
                    return (a = this._getStack()) ? (g.prepareNextFile && !e.pending.length && e._prepareNextFile(), a.shift()) : e.runing ? (!e.pending.length && e._getStats().numOfQueue && e._prepareNextFile(), b = e.pending.shift(), c = function(b) {
                        return b ? (a = h(b, g.chunked ? g.chunkSize: 0), e.stack.push(a), a.shift()) : null
                    },
                    f(b) ? (d = b.file, b = b[b.pipe ? "pipe": "then"](c), b.file = d, b) : c(b)) : void 0
                },
                _prepareNextFile: function() {
                    var a, b = this,
                    c = b.request("fetch-file"),
                    d = b.pending;
                    c && (a = b.request("before-send-file", c,
                    function() {
                        return c.getStatus() === g.PROGRESS || c.getStatus() === g.INTERRUPT ? c: b._finishFile(c)
                    }), b.owner.trigger("uploadStart", c), c.setStatus(g.PROGRESS), a.file = c, a.done(function() {
                        var b = e.inArray(a, d);~b && d.splice(b, 1, c)
                    }), a.fail(function(a) {
                        c.setStatus(g.ERROR, a),
                        b.owner.trigger("uploadError", c, a),
                        b.owner.trigger("uploadComplete", c)
                    }), d.push(a))
                },
                _popBlock: function(a) {
                    var b = e.inArray(a, this.pool);
                    this.pool.splice(b, 1),
                    a.file.remaning--,
                    this.remaning--
                },
                _startSend: function(b) {
                    var c, d = this,
                    e = b.file;
                    return e.getStatus() !== g.PROGRESS ? void(e.getStatus() === g.INTERRUPT && d._putback(b)) : (d.pool.push(b), d.remaning++, b.blob = 1 === b.chunks ? e.source: e.source.slice(b.start, b.end), c = d.request("before-send", b,
                    function() {
                        e.getStatus() === g.PROGRESS ? d._doSend(b) : (d._popBlock(b), a.nextTick(d.__tick))
                    }), void c.fail(function() {
                        1 === e.remaning ? d._finishFile(e).always(function() {
                            b.percentage = 1,
                            d._popBlock(b),
                            d.owner.trigger("uploadComplete", e),
                            a.nextTick(d.__tick)
                        }) : (b.percentage = 1, d.updateFileProgress(e), d._popBlock(b), a.nextTick(d.__tick))
                    }))
                },
                _doSend: function(b) {
                    var c, f, h = this,
                    i = h.owner,
                    j = h.options,
                    k = b.file,
                    l = new d(j),
                    m = e.extend({},
                    j.formData),
                    n = e.extend({},
                    j.headers);
                    b.transport = l,
                    l.on("destroy",
                    function() {
                        delete b.transport,
                        h._popBlock(b),
                        a.nextTick(h.__tick)
                    }),
                    l.on("progress",
                    function(a) {
                        b.percentage = a,
                        h.updateFileProgress(k)
                    }),
                    c = function(a) {
                        var c;
                        return f = l.getResponseAsJson() || {},
                        f._raw = l.getResponse(),
                        c = function(b) {
                            a = b
                        },
                        i.trigger("uploadAccept", b, f, c) || (a = a || "server"),
                        a
                    },
                    l.on("error",
                    function(a, d) {
                        b.retried = b.retried || 0,
                        b.chunks > 1 && ~"http,abort".indexOf(a) && b.retried < j.chunkRetry ? (b.retried++, l.send()) : (d || "server" !== a || (a = c(a)), k.setStatus(g.ERROR, a), i.trigger("uploadError", k, a), i.trigger("uploadComplete", k))
                    }),
                    l.on("load",
                    function() {
                        var a;
                        return (a = c()) ? void l.trigger("error", a, !0) : void(1 === k.remaning ? h._finishFile(k, f) : l.destroy())
                    }),
                    m = e.extend(m, {
                        id: k.id,
                        name: k.name,
                        type: k.type,
                        lastModifiedDate: k.lastModifiedDate,
                        size: k.size
                    }),
                    b.chunks > 1 && e.extend(m, {
                        chunks: b.chunks,
                        chunk: b.chunk
                    }),
                    i.trigger("uploadBeforeSend", b, m, n),
                    l.appendBlob(j.fileVal, b.blob, k.name),
                    l.append(m),
                    l.setRequestHeader(n),
                    l.send()
                },
                _finishFile: function(a, b, c) {
                    var d = this.owner;
                    return d.request("after-send-file", arguments,
                    function() {
                        a.setStatus(g.COMPLETE),
                        d.trigger("uploadSuccess", a, b, c)
                    }).fail(function(b) {
                        a.getStatus() === g.PROGRESS && a.setStatus(g.ERROR, b),
                        d.trigger("uploadError", a, b)
                    }).always(function() {
                        d.trigger("uploadComplete", a)
                    })
                },
                updateFileProgress: function(a) {
                    var b = 0,
                    c = 0;
                    a.blocks && (e.each(a.blocks,
                    function(a, b) {
                        c += (b.percentage || 0) * (b.end - b.start)
                    }), b = c / a.size, this.owner.trigger("uploadProgress", a, b || 0))
                }
            })
        }),
        b("widgets/validator", ["base", "uploader", "file", "widgets/widget"],
        function(a, b, c) {
            var d, e = a.$,
            f = {};
            return d = {
                addValidator: function(a, b) {
                    f[a] = b
                },
                removeValidator: function(a) {
                    delete f[a]
                }
            },
            b.register({
                name: "validator",
                init: function() {
                    var b = this;
                    a.nextTick(function() {
                        e.each(f,
                        function() {
                            this.call(b.owner)
                        })
                    })
                }
            }),
            d.addValidator("fileNumLimit",
            function() {
                var a = this,
                b = a.options,
                c = 0,
                d = parseInt(b.fileNumLimit, 10),
                e = !0;
                d && (a.on("beforeFileQueued",
                function(a) {
                    return c >= d && e && (e = !1, this.trigger("error", "Q_EXCEED_NUM_LIMIT", d, a), setTimeout(function() {
                        e = !0
                    },
                    1)),
                    c >= d ? !1 : !0
                }), a.on("fileQueued",
                function() {
                    c++
                }), a.on("fileDequeued",
                function() {
                    c--
                }), a.on("reset",
                function() {
                    c = 0
                }))
            }),
            d.addValidator("fileSizeLimit",
            function() {
                var a = this,
                b = a.options,
                c = 0,
                d = parseInt(b.fileSizeLimit, 10),
                e = !0;
                d && (a.on("beforeFileQueued",
                function(a) {
                    var b = c + a.size > d;
                    return b && e && (e = !1, this.trigger("error", "Q_EXCEED_SIZE_LIMIT", d, a), setTimeout(function() {
                        e = !0
                    },
                    1)),
                    b ? !1 : !0
                }), a.on("fileQueued",
                function(a) {
                    c += a.size
                }), a.on("fileDequeued",
                function(a) {
                    c -= a.size
                }), a.on("reset",
                function() {
                    c = 0
                }))
            }),
            d.addValidator("fileSingleSizeLimit",
            function() {
                var a = this,
                b = a.options,
                d = b.fileSingleSizeLimit;
                d && a.on("beforeFileQueued",
                function(a) {
                    return a.size > d ? (a.setStatus(c.Status.INVALID, "exceed_size"), this.trigger("error", "F_EXCEED_SIZE", d, a), !1) : void 0
                })
            }),
            d.addValidator("duplicate",
            function() {
                var a = this,
                b = a.options,
                c = {};
                if (!b.duplicate) {
                    function d(a) {
                        for (var b, c = 0,
                        d = 0,
                        e = a.length; e > d; d++) b = a.charCodeAt(d),
                        c = b + (c << 6) + (c << 16) - c;
                        return c
                    }
                    a.on("beforeFileQueued",
                    function(a) {
                        var b = a.__hash || (a.__hash = d(a.name + a.size + a.lastModifiedDate));
                        return c[b] ? (this.trigger("error", "F_DUPLICATE", a), !1) : void 0
                    }),
                    a.on("fileQueued",
                    function(a) {
                        var b = a.__hash;
                        b && (c[b] = !0)
                    }),
                    a.on("fileDequeued",
                    function(a) {
                        var b = a.__hash;
                        b && delete c[b]
                    }),
                    a.on("reset",
                    function() {
                        c = {}
                    })
                }
            }),
            d
        }),
        b("lib/md5", ["runtime/client", "mediator"],
        function(a, b) {
            function c() {
                a.call(this, "Md5")
            }
            return b.installTo(c.prototype),
            c.prototype.loadFromBlob = function(a) {
                var b = this;
                b.getRuid() && b.disconnectRuntime(),
                b.connectRuntime(a.ruid,
                function() {
                    b.exec("init"),
                    b.exec("loadFromBlob", a)
                })
            },
            c.prototype.getResult = function() {
                return this.exec("getResult")
            },
            c
        }),
        b("widgets/md5", ["base", "uploader", "lib/md5", "lib/blob", "widgets/widget"],
        function(a, b, c, d) {
            return b.register({
                name: "md5",
                md5File: function(b, e, f) {
                    var g = new c,
                    h = a.Deferred(),
                    i = b instanceof d ? b: this.request("get-file", b).source;
                    return g.on("progress load",
                    function(a) {
                        a = a || {},
                        h.notify(a.total ? a.loaded / a.total: 1)
                    }),
                    g.on("complete",
                    function() {
                        h.resolve(g.getResult())
                    }),
                    g.on("error",
                    function(a) {
                        h.reject(a)
                    }),
                    arguments.length > 1 && (e = e || 0, f = f || 0, 0 > e && (e = i.size + e), 0 > f && (f = i.size + f), f = Math.min(f, i.size), i = i.slice(e, f)),
                    g.loadFromBlob(i),
                    h.promise()
                }
            })
        }),
        b("runtime/compbase", [],
        function() {
            function a(a, b) {
                this.owner = a,
                this.options = a.options,
                this.getRuntime = function() {
                    return b
                },
                this.getRuid = function() {
                    return b.uid
                },
                this.trigger = function() {
                    return a.trigger.apply(a, arguments)
                }
            }
            return a
        }),
        b("runtime/html5/runtime", ["base", "runtime/runtime", "runtime/compbase"],
        function(b, c, d) {
            var e = "html5",
            f = {};
            function g() {
                var a = {},
                d = this,
                g = this.destroy;
                c.apply(d, arguments),
                d.type = e,
                d.exec = function(c, e) {
                    var g, h = this,
                    i = h.uid,
                    j = b.slice(arguments, 2);
                    return f[c] && (g = a[i] = a[i] || new f[c](h, d), g[e]) ? g[e].apply(g, j) : void 0
                },
                d.destroy = function() {
                    return g && g.apply(this, arguments)
                }
            }
            return b.inherits(c, {
                constructor: g,
                init: function() {
                    var a = this;
                    setTimeout(function() {
                        a.trigger("ready")
                    },
                    1)
                }
            }),
            g.register = function(a, c) {
                var e = f[a] = b.inherits(d, c);
                return e
            },
            a.Blob && a.FileReader && a.DataView && c.addRuntime(e, g),
            g
        }),
        b("runtime/html5/blob", ["runtime/html5/runtime", "lib/blob"],
        function(a, b) {
            return a.register("Blob", {
                slice: function(a, c) {
                    var d = this.owner.source,
                    e = d.slice || d.webkitSlice || d.mozSlice;
                    return d = e.call(d, a, c),
                    new b(this.getRuid(), d)
                }
            })
        }),
        b("runtime/html5/dnd", ["base", "runtime/html5/runtime", "lib/file"],
        function(a, b, c) {
            var d = a.$,
            e = "webuploader-dnd-";
            return b.register("DragAndDrop", {
                init: function() {
                    var b = this.elem = this.options.container;
                    this.dragEnterHandler = a.bindFn(this._dragEnterHandler, this),
                    this.dragOverHandler = a.bindFn(this._dragOverHandler, this),
                    this.dragLeaveHandler = a.bindFn(this._dragLeaveHandler, this),
                    this.dropHandler = a.bindFn(this._dropHandler, this),
                    this.dndOver = !1,
                    b.on("dragenter", this.dragEnterHandler),
                    b.on("dragover", this.dragOverHandler),
                    b.on("dragleave", this.dragLeaveHandler),
                    b.on("drop", this.dropHandler),
                    this.options.disableGlobalDnd && (d(document).on("dragover", this.dragOverHandler), d(document).on("drop", this.dropHandler))
                },
                _dragEnterHandler: function(a) {
                    var b, c = this,
                    d = c._denied || !1;
                    return a = a.originalEvent || a,
                    c.dndOver || (c.dndOver = !0, b = a.dataTransfer.items, b && b.length && (c._denied = d = !c.trigger("accept", b)), c.elem.addClass(e + "over"), c.elem[d ? "addClass": "removeClass"](e + "denied")),
                    a.dataTransfer.dropEffect = d ? "none": "copy",
                    !1
                },
                _dragOverHandler: function(a) {
                    var b = this.elem.parent().get(0);
                    return b && !d.contains(b, a.currentTarget) ? !1 : (clearTimeout(this._leaveTimer), this._dragEnterHandler.call(this, a), !1)
                },
                _dragLeaveHandler: function() {
                    var a, b = this;
                    return a = function() {
                        b.dndOver = !1,
                        b.elem.removeClass(e + "over " + e + "denied")
                    },
                    clearTimeout(b._leaveTimer),
                    b._leaveTimer = setTimeout(a, 100),
                    !1
                },
                _dropHandler: function(a) {
                    var b, f, g = this,
                    h = g.getRuid(),
                    i = g.elem.parent().get(0);
                    if (i && !d.contains(i, a.currentTarget)) return ! 1;
                    a = a.originalEvent || a,
                    b = a.dataTransfer;
                    try {
                        f = b.getData("text/html")
                    } catch(j) {}
                    return f ? void 0 : (g._getTansferFiles(b,
                    function(a) {
                        g.trigger("drop", d.map(a,
                        function(a) {
                            return new c(h, a)
                        }))
                    }), g.dndOver = !1, g.elem.removeClass(e + "over"), !1)
                },
                _getTansferFiles: function(b, c) {
                    var d, e, f, g, h, i, j, k = [],
                    l = [];
                    for (d = b.items, e = b.files, j = !(!d || !d[0].webkitGetAsEntry), h = 0, i = e.length; i > h; h++) f = e[h],
                    g = d && d[h],
                    j && g.webkitGetAsEntry().isDirectory ? l.push(this._traverseDirectoryTree(g.webkitGetAsEntry(), k)) : k.push(f);
                    a.when.apply(a, l).done(function() {
                        k.length && c(k)
                    })
                },
                _traverseDirectoryTree: function(b, c) {
                    var d = a.Deferred(),
                    e = this;
                    return b.isFile ? b.file(function(a) {
                        c.push(a),
                        d.resolve()
                    }) : b.isDirectory && b.createReader().readEntries(function(b) {
                        var f, g = b.length,
                        h = [],
                        i = [];
                        for (f = 0; g > f; f++) h.push(e._traverseDirectoryTree(b[f], i));
                        a.when.apply(a, h).then(function() {
                            c.push.apply(c, i),
                            d.resolve()
                        },
                        d.reject)
                    }),
                    d.promise()
                },
                destroy: function() {
                    var a = this.elem;
                    a && (a.off("dragenter", this.dragEnterHandler), a.off("dragover", this.dragOverHandler), a.off("dragleave", this.dragLeaveHandler), a.off("drop", this.dropHandler), this.options.disableGlobalDnd && (d(document).off("dragover", this.dragOverHandler), d(document).off("drop", this.dropHandler)))
                }
            })
        }),
        b("runtime/html5/filepaste", ["base", "runtime/html5/runtime", "lib/file"],
        function(a, b, c) {
            return b.register("FilePaste", {
                init: function() {
                    var b, c, d, e, f = this.options,
                    g = this.elem = f.container,
                    h = ".*";
                    if (f.accept) {
                        for (b = [], c = 0, d = f.accept.length; d > c; c++) e = f.accept[c].mimeTypes,
                        e && b.push(e);
                        b.length && (h = b.join(","), h = h.replace(/,/g, "|").replace(/\*/g, ".*"))
                    }
                    this.accept = h = new RegExp(h, "i"),
                    this.hander = a.bindFn(this._pasteHander, this),
                    g.on("paste", this.hander)
                },
                _pasteHander: function(a) {
                    var b, d, e, f, g, h = [],
                    i = this.getRuid();
                    for (a = a.originalEvent || a, b = a.clipboardData.items, f = 0, g = b.length; g > f; f++) d = b[f],
                    "file" === d.kind && (e = d.getAsFile()) && h.push(new c(i, e));
                    h.length && (a.preventDefault(), a.stopPropagation(), this.trigger("paste", h))
                },
                destroy: function() {
                    this.elem.off("paste", this.hander)
                }
            })
        }),
        b("runtime/html5/filepicker", ["base", "runtime/html5/runtime"],
        function(a, b) {
            var c = a.$;
            return b.register("FilePicker", {
                init: function() {
                    var a, b, d, e, f = this.getRuntime().getContainer(),
                    g = this,
                    h = g.owner,
                    i = g.options,
                    j = this.label = c(document.createElement("label")),
                    k = this.input = c(document.createElement("input"));
                    if (k.attr("type", "file"), k.attr("name", i.name), k.addClass("webuploader-element-invisible"), j.on("click",
                    function() {
                        k.trigger("click")
                    }), j.css({
                        opacity: 0,
                        width: "100%",
                        height: "100%",
                        display: "block",
                        cursor: "pointer",
                        background: "#ffffff"
                    }), i.multiple && k.attr("multiple", "multiple"), i.accept && i.accept.length > 0) {
                        for (a = [], b = 0, d = i.accept.length; d > b; b++) a.push(i.accept[b].mimeTypes);
                        k.attr("accept", a.join(","))
                    }
                    f.append(k),
                    f.append(j),
                    e = function(a) {
                        h.trigger(a.type)
                    },
                    k.on("change",
                    function(a) {
                        var b, d = arguments.callee;
                        g.files = a.target.files,
                        b = this.cloneNode(!0),
                        b.value = null,
                        this.parentNode.replaceChild(b, this),
                        k.off(),
                        k = c(b).on("change", d).on("mouseenter mouseleave", e),
                        h.trigger("change")
                    }),
                    j.on("mouseenter mouseleave", e)
                },
                getFiles: function() {
                    return this.files
                },
                destroy: function() {
                    this.input.off(),
                    this.label.off()
                }
            })
        }),
        b("runtime/html5/util", ["base"],
        function(b) {
            var c = a.createObjectURL && a || a.URL && URL.revokeObjectURL && URL || a.webkitURL,
            d = b.noop,
            e = d;
            return c && (d = function() {
                return c.createObjectURL.apply(c, arguments)
            },
            e = function() {
                return c.revokeObjectURL.apply(c, arguments)
            }),
            {
                createObjectURL: d,
                revokeObjectURL: e,
                dataURL2Blob: function(a) {
                    var b, c, d, e, f, g;
                    for (g = a.split(","), b = ~g[0].indexOf("base64") ? atob(g[1]) : decodeURIComponent(g[1]), d = new ArrayBuffer(b.length), c = new Uint8Array(d), e = 0; e < b.length; e++) c[e] = b.charCodeAt(e);
                    return f = g[0].split(":")[1].split(";")[0],
                    this.arrayBufferToBlob(d, f)
                },
                dataURL2ArrayBuffer: function(a) {
                    var b, c, d, e;
                    for (e = a.split(","), b = ~e[0].indexOf("base64") ? atob(e[1]) : decodeURIComponent(e[1]), c = new Uint8Array(b.length), d = 0; d < b.length; d++) c[d] = b.charCodeAt(d);
                    return c.buffer
                },
                arrayBufferToBlob: function(b, c) {
                    var d, e = a.BlobBuilder || a.WebKitBlobBuilder;
                    return e ? (d = new e, d.append(b), d.getBlob(c)) : new Blob([b], c ? {
                        type: c
                    }: {})
                },
                canvasToDataUrl: function(a, b, c) {
                    return a.toDataURL(b, c / 100)
                },
                parseMeta: function(a, b) {
                    b(!1, {})
                },
                updateImageHead: function(a) {
                    return a
                }
            }
        }),
        b("runtime/html5/imagemeta", ["runtime/html5/util"],
        function(a) {
            var b;
            return b = {
                parsers: {
                    65505 : []
                },
                maxMetaDataSize: 262144,
                parse: function(a, b) {
                    var c = this,
                    d = new FileReader;
                    d.onload = function() {
                        b(!1, c._parse(this.result)),
                        d = d.onload = d.onerror = null
                    },
                    d.onerror = function(a) {
                        b(a.message),
                        d = d.onload = d.onerror = null
                    },
                    a = a.slice(0, c.maxMetaDataSize),
                    d.readAsArrayBuffer(a.getSource())
                },
                _parse: function(a, c) {
                    if (! (a.byteLength < 6)) {
                        var d, e, f, g, h = new DataView(a),
                        i = 2,
                        j = h.byteLength - 4,
                        k = i,
                        l = {};
                        if (65496 === h.getUint16(0)) {
                            for (; j > i && (d = h.getUint16(i), d >= 65504 && 65519 >= d || 65534 === d) && (e = h.getUint16(i + 2) + 2, !(i + e > h.byteLength));) {
                                if (f = b.parsers[d], !c && f) for (g = 0; g < f.length; g += 1) f[g].call(b, h, i, e, l);
                                i += e,
                                k = i
                            }
                            k > 6 && (a.slice ? l.imageHead = a.slice(2, k) : l.imageHead = new Uint8Array(a).subarray(2, k))
                        }
                        return l
                    }
                },
                updateImageHead: function(a, b) {
                    var c, d, e, f = this._parse(a, !0);
                    return e = 2,
                    f.imageHead && (e = 2 + f.imageHead.byteLength),
                    d = a.slice ? a.slice(e) : new Uint8Array(a).subarray(e),
                    c = new Uint8Array(b.byteLength + 2 + d.byteLength),
                    c[0] = 255,
                    c[1] = 216,
                    c.set(new Uint8Array(b), 2),
                    c.set(new Uint8Array(d), b.byteLength + 2),
                    c.buffer
                }
            },
            a.parseMeta = function() {
                return b.parse.apply(b, arguments)
            },
            a.updateImageHead = function() {
                return b.updateImageHead.apply(b, arguments)
            },
            b
        }),
        b("runtime/html5/imagemeta/exif", ["base", "runtime/html5/imagemeta"],
        function(a, b) {
            var c = {};
            return c.ExifMap = function() {
                return this
            },
            c.ExifMap.prototype.map = {
                Orientation: 274
            },
            c.ExifMap.prototype.get = function(a) {
                return this[a] || this[this.map[a]]
            },
            c.exifTagTypes = {
                1 : {
                    getValue: function(a, b) {
                        return a.getUint8(b)
                    },
                    size: 1
                },
                2 : {
                    getValue: function(a, b) {
                        return String.fromCharCode(a.getUint8(b))
                    },
                    size: 1,
                    ascii: !0
                },
                3 : {
                    getValue: function(a, b, c) {
                        return a.getUint16(b, c)
                    },
                    size: 2
                },
                4 : {
                    getValue: function(a, b, c) {
                        return a.getUint32(b, c)
                    },
                    size: 4
                },
                5 : {
                    getValue: function(a, b, c) {
                        return a.getUint32(b, c) / a.getUint32(b + 4, c)
                    },
                    size: 8
                },
                9 : {
                    getValue: function(a, b, c) {
                        return a.getInt32(b, c)
                    },
                    size: 4
                },
                10 : {
                    getValue: function(a, b, c) {
                        return a.getInt32(b, c) / a.getInt32(b + 4, c)
                    },
                    size: 8
                }
            },
            c.exifTagTypes[7] = c.exifTagTypes[1],
            c.getExifValue = function(b, d, e, f, g, h) {
                var i, j, k, l, m, n, o = c.exifTagTypes[f];
                if (!o) return void a.log("Invalid Exif data: Invalid tag type.");
                if (i = o.size * g, j = i > 4 ? d + b.getUint32(e + 8, h) : e + 8, j + i > b.byteLength) return void a.log("Invalid Exif data: Invalid data offset.");
                if (1 === g) return o.getValue(b, j, h);
                for (k = [], l = 0; g > l; l += 1) k[l] = o.getValue(b, j + l * o.size, h);
                if (o.ascii) {
                    for (m = "", l = 0; l < k.length && (n = k[l], "\x00" !== n); l += 1) m += n;
                    return m
                }
                return k
            },
            c.parseExifTag = function(a, b, d, e, f) {
                var g = a.getUint16(d, e);
                f.exif[g] = c.getExifValue(a, b, d, a.getUint16(d + 2, e), a.getUint32(d + 4, e), e)
            },
            c.parseExifTags = function(b, c, d, e, f) {
                var g, h, i;
                if (d + 6 > b.byteLength) return void a.log("Invalid Exif data: Invalid directory offset.");
                if (g = b.getUint16(d, e), h = d + 2 + 12 * g, h + 4 > b.byteLength) return void a.log("Invalid Exif data: Invalid directory size.");
                for (i = 0; g > i; i += 1) this.parseExifTag(b, c, d + 2 + 12 * i, e, f);
                return b.getUint32(h, e)
            },
            c.parseExifData = function(b, d, e, f) {
                var g, h, i = d + 10;
                if (1165519206 === b.getUint32(d + 4)) {
                    if (i + 8 > b.byteLength) return void a.log("Invalid Exif data: Invalid segment size.");
                    if (0 !== b.getUint16(d + 8)) return void a.log("Invalid Exif data: Missing byte alignment offset.");
                    switch (b.getUint16(i)) {
                    case 18761:
                        g = !0;
                        break;
                    case 19789:
                        g = !1;
                        break;
                    default:
                        return void a.log("Invalid Exif data: Invalid byte alignment marker.")
                    }
                    if (42 !== b.getUint16(i + 2, g)) return void a.log("Invalid Exif data: Missing TIFF marker.");
                    h = b.getUint32(i + 4, g),
                    f.exif = new c.ExifMap,
                    h = c.parseExifTags(b, i, i + h, g, f)
                }
            },
            b.parsers[65505].push(c.parseExifData),
            c
        }),
        b("runtime/html5/jpegencoder", [],
        function(a, exports, module) {
            function b(a) {
                var b, c, d, e, f, g = (Math.round, Math.floor),
                h = new Array(64),
                i = new Array(64),
                j = new Array(64),
                k = new Array(64),
                l = new Array(65535),
                m = new Array(65535),
                n = new Array(64),
                o = new Array(64),
                p = [],
                q = 0,
                r = 7,
                s = new Array(64),
                t = new Array(64),
                u = new Array(64),
                v = new Array(256),
                w = new Array(2048),
                x = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63],
                y = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                z = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                A = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125],
                B = [1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250],
                C = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                D = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                E = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119],
                F = [0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250];
                function G(a) {
                    for (var b = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99], c = 0; 64 > c; c++) {
                        var d = g((b[c] * a + 50) / 100);
                        1 > d ? d = 1 : d > 255 && (d = 255),
                        h[x[c]] = d
                    }
                    for (var e = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], f = 0; 64 > f; f++) {
                        var l = g((e[f] * a + 50) / 100);
                        1 > l ? l = 1 : l > 255 && (l = 255),
                        i[x[f]] = l
                    }
                    for (var m = [1, 1.387039845, 1.306562965, 1.175875602, 1, .785694958, .5411961, .275899379], n = 0, o = 0; 8 > o; o++) for (var p = 0; 8 > p; p++) j[n] = 1 / (h[x[n]] * m[o] * m[p] * 8),
                    k[n] = 1 / (i[x[n]] * m[o] * m[p] * 8),
                    n++
                }
                function H(a, b) {
                    for (var c = 0,
                    d = 0,
                    e = new Array,
                    f = 1; 16 >= f; f++) {
                        for (var g = 1; g <= a[f]; g++) e[b[d]] = [],
                        e[b[d]][0] = c,
                        e[b[d]][1] = f,
                        d++,
                        c++;
                        c *= 2
                    }
                    return e
                }
                function I() {
                    b = H(y, z),
                    c = H(C, D),
                    d = H(A, B),
                    e = H(E, F)
                }
                function J() {
                    for (var a = 1,
                    b = 2,
                    c = 1; 15 >= c; c++) {
                        for (var d = a; b > d; d++) m[32767 + d] = c,
                        l[32767 + d] = [],
                        l[32767 + d][1] = c,
                        l[32767 + d][0] = d;
                        for (var e = -(b - 1); - a >= e; e++) m[32767 + e] = c,
                        l[32767 + e] = [],
                        l[32767 + e][1] = c,
                        l[32767 + e][0] = b - 1 + e;
                        a <<= 1,
                        b <<= 1
                    }
                }
                function K() {
                    for (var a = 0; 256 > a; a++) w[a] = 19595 * a,
                    w[a + 256 >> 0] = 38470 * a,
                    w[a + 512 >> 0] = 7471 * a + 32768,
                    w[a + 768 >> 0] = -11059 * a,
                    w[a + 1024 >> 0] = -21709 * a,
                    w[a + 1280 >> 0] = 32768 * a + 8421375,
                    w[a + 1536 >> 0] = -27439 * a,
                    w[a + 1792 >> 0] = -5329 * a
                }
                function L(a) {
                    for (var b = a[0], c = a[1] - 1; c >= 0;) b & 1 << c && (q |= 1 << r),
                    c--,
                    r--,
                    0 > r && (255 == q ? (M(255), M(0)) : M(q), r = 7, q = 0)
                }
                function M(a) {
                    p.push(v[a])
                }
                function N(a) {
                    M(a >> 8 & 255),
                    M(255 & a)
                }
                function O(a, b) {
                    var c, d, e, f, g, h, i, j, k, l = 0,
                    m = 8,
                    o = 64;
                    for (k = 0; m > k; ++k) {
                        c = a[l],
                        d = a[l + 1],
                        e = a[l + 2],
                        f = a[l + 3],
                        g = a[l + 4],
                        h = a[l + 5],
                        i = a[l + 6],
                        j = a[l + 7];
                        var p = c + j,
                        q = c - j,
                        r = d + i,
                        s = d - i,
                        t = e + h,
                        u = e - h,
                        v = f + g,
                        w = f - g,
                        x = p + v,
                        y = p - v,
                        z = r + t,
                        A = r - t;
                        a[l] = x + z,
                        a[l + 4] = x - z;
                        var B = .707106781 * (A + y);
                        a[l + 2] = y + B,
                        a[l + 6] = y - B,
                        x = w + u,
                        z = u + s,
                        A = s + q;
                        var C = .382683433 * (x - A),
                        D = .5411961 * x + C,
                        E = 1.306562965 * A + C,
                        F = .707106781 * z,
                        G = q + F,
                        H = q - F;
                        a[l + 5] = H + D,
                        a[l + 3] = H - D,
                        a[l + 1] = G + E,
                        a[l + 7] = G - E,
                        l += 8
                    }
                    for (l = 0, k = 0; m > k; ++k) {
                        c = a[l],
                        d = a[l + 8],
                        e = a[l + 16],
                        f = a[l + 24],
                        g = a[l + 32],
                        h = a[l + 40],
                        i = a[l + 48],
                        j = a[l + 56];
                        var I = c + j,
                        J = c - j,
                        K = d + i,
                        L = d - i,
                        M = e + h,
                        N = e - h,
                        O = f + g,
                        P = f - g,
                        Q = I + O,
                        R = I - O,
                        S = K + M,
                        T = K - M;
                        a[l] = Q + S,
                        a[l + 32] = Q - S;
                        var U = .707106781 * (T + R);
                        a[l + 16] = R + U,
                        a[l + 48] = R - U,
                        Q = P + N,
                        S = N + L,
                        T = L + J;
                        var V = .382683433 * (Q - T),
                        W = .5411961 * Q + V,
                        X = 1.306562965 * T + V,
                        Y = .707106781 * S,
                        Z = J + Y,
                        $ = J - Y;
                        a[l + 40] = $ + W,
                        a[l + 24] = $ - W,
                        a[l + 8] = Z + X,
                        a[l + 56] = Z - X,
                        l++
                    }
                    var _;
                    for (k = 0; o > k; ++k) _ = a[k] * b[k],
                    n[k] = _ > 0 ? _ + .5 | 0 : _ - .5 | 0;
                    return n
                }
                function P() {
                    N(65504),
                    N(16),
                    M(74),
                    M(70),
                    M(73),
                    M(70),
                    M(0),
                    M(1),
                    M(1),
                    M(0),
                    N(1),
                    N(1),
                    M(0),
                    M(0)
                }
                function Q(a, b) {
                    N(65472),
                    N(17),
                    M(8),
                    N(b),
                    N(a),
                    M(3),
                    M(1),
                    M(17),
                    M(0),
                    M(2),
                    M(17),
                    M(1),
                    M(3),
                    M(17),
                    M(1)
                }
                function R() {
                    N(65499),
                    N(132),
                    M(0);
                    for (var a = 0; 64 > a; a++) M(h[a]);
                    M(1);
                    for (var b = 0; 64 > b; b++) M(i[b])
                }
                function S() {
                    N(65476),
                    N(418),
                    M(0);
                    for (var a = 0; 16 > a; a++) M(y[a + 1]);
                    for (var b = 0; 11 >= b; b++) M(z[b]);
                    M(16);
                    for (var c = 0; 16 > c; c++) M(A[c + 1]);
                    for (var d = 0; 161 >= d; d++) M(B[d]);
                    M(1);
                    for (var e = 0; 16 > e; e++) M(C[e + 1]);
                    for (var f = 0; 11 >= f; f++) M(D[f]);
                    M(17);
                    for (var g = 0; 16 > g; g++) M(E[g + 1]);
                    for (var h = 0; 161 >= h; h++) M(F[h])
                }
                function T() {
                    N(65498),
                    N(12),
                    M(3),
                    M(1),
                    M(0),
                    M(2),
                    M(17),
                    M(3),
                    M(17),
                    M(0),
                    M(63),
                    M(0)
                }
                function U(a, b, c, d, e) {
                    for (var f, g = e[0], h = e[240], i = 16, j = 63, k = 64, n = O(a, b), p = 0; k > p; ++p) o[x[p]] = n[p];
                    var q = o[0] - c;
                    c = o[0],
                    0 == q ? L(d[0]) : (f = 32767 + q, L(d[m[f]]), L(l[f]));
                    for (var r = 63; r > 0 && 0 == o[r]; r--);
                    if (0 == r) return L(g),
                    c;
                    for (var s, t = 1; r >= t;) {
                        for (var u = t; 0 == o[t] && r >= t; ++t);
                        var v = t - u;
                        if (v >= i) {
                            s = v >> 4;
                            for (var w = 1; s >= w; ++w) L(h);
                            v = 15 & v
                        }
                        f = 32767 + o[t],
                        L(e[(v << 4) + m[f]]),
                        L(l[f]),
                        t++
                    }
                    return r != j && L(g),
                    c
                }
                function V() {
                    for (var a = String.fromCharCode,
                    b = 0; 256 > b; b++) v[b] = a(b)
                }
                this.encode = function(a, f) {
                    f && W(f),
                    p = new Array,
                    q = 0,
                    r = 7,
                    N(65496),
                    P(),
                    R(),
                    Q(a.width, a.height),
                    S(),
                    T();
                    var g = 0,
                    h = 0,
                    i = 0;
                    q = 0,
                    r = 7,
                    this.encode.displayName = "_encode_";
                    for (var l, m, n, o, v, x, y, z, A, B = a.data,
                    C = a.width,
                    D = a.height,
                    E = 4 * C,
                    F = 0; D > F;) {
                        for (l = 0; E > l;) {
                            for (v = E * F + l, x = v, y = -1, z = 0, A = 0; 64 > A; A++) z = A >> 3,
                            y = 4 * (7 & A),
                            x = v + z * E + y,
                            F + z >= D && (x -= E * (F + 1 + z - D)),
                            l + y >= E && (x -= l + y - E + 4),
                            m = B[x++],
                            n = B[x++],
                            o = B[x++],
                            s[A] = (w[m] + w[n + 256 >> 0] + w[o + 512 >> 0] >> 16) - 128,
                            t[A] = (w[m + 768 >> 0] + w[n + 1024 >> 0] + w[o + 1280 >> 0] >> 16) - 128,
                            u[A] = (w[m + 1280 >> 0] + w[n + 1536 >> 0] + w[o + 1792 >> 0] >> 16) - 128;
                            g = U(s, j, g, b, d),
                            h = U(t, k, h, c, e),
                            i = U(u, k, i, c, e),
                            l += 32
                        }
                        F += 8
                    }
                    if (r >= 0) {
                        var G = [];
                        G[1] = r + 1,
                        G[0] = (1 << r + 1) - 1,
                        L(G)
                    }
                    N(65497);
                    var H = "data:image/jpeg;base64," + btoa(p.join(""));
                    return p = [],
                    H
                };
                function W(a) {
                    if (0 >= a && (a = 1), a > 100 && (a = 100), f != a) {
                        var b = 0;
                        b = 50 > a ? Math.floor(5e3 / a) : Math.floor(200 - 2 * a),
                        G(b),
                        f = a
                    }
                }
                function X() {
                    a || (a = 50),
                    V(),
                    I(),
                    J(),
                    K(),
                    W(a)
                }
                X()
            }
            return b.encode = function(a, c) {
                var d = new b(c);
                return d.encode(a)
            },
            b
        }),
        b("runtime/html5/androidpatch", ["runtime/html5/util", "runtime/html5/jpegencoder", "base"],
        function(a, b, c) {
            var d, e = a.canvasToDataUrl;
            a.canvasToDataUrl = function(a, f, g) {
                var h, i, j, k, l;
                return c.os.android ? ("image/jpeg" === f && "undefined" == typeof d && (k = e.apply(null, arguments), l = k.split(","), k = ~l[0].indexOf("base64") ? atob(l[1]) : decodeURIComponent(l[1]), k = k.substring(0, 2), d = 255 === k.charCodeAt(0) && 216 === k.charCodeAt(1)), "image/jpeg" !== f || d ? e.apply(null, arguments) : (i = a.width, j = a.height, h = a.getContext("2d"), b.encode(h.getImageData(0, 0, i, j), g))) : e.apply(null, arguments)
            }
        }),
        b("runtime/html5/image", ["base", "runtime/html5/runtime", "runtime/html5/util"],
        function(a, b, c) {
            var d = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D";
            return b.register("Image", {
                modified: !1,
                init: function() {
                    var a = this,
                    b = new Image;
                    b.onload = function() {
                        a._info = {
                            type: a.type,
                            width: this.width,
                            height: this.height
                        },
                        a._metas || "image/jpeg" !== a.type ? a.owner.trigger("load") : c.parseMeta(a._blob,
                        function(b, c) {
                            a._metas = c,
                            a.owner.trigger("load")
                        })
                    },
                    b.onerror = function() {
                        a.owner.trigger("error")
                    },
                    a._img = b
                },
                loadFromBlob: function(a) {
                    var b = this,
                    d = b._img;
                    b._blob = a,
                    b.type = a.type,
                    d.src = c.createObjectURL(a.getSource()),
                    b.owner.once("load",
                    function() {
                        c.revokeObjectURL(d.src)
                    })
                },
                resize: function(a, b) {
                    var c = this._canvas || (this._canvas = document.createElement("canvas"));
                    this._resize(this._img, c, a, b),
                    this._blob = null,
                    this.modified = !0,
                    this.owner.trigger("complete", "resize")
                },
                crop: function(a, b, c, d, e) {
                    var f = this._canvas || (this._canvas = document.createElement("canvas")),
                    g = this.options,
                    h = this._img,
                    i = h.naturalWidth,
                    j = h.naturalHeight,
                    k = this.getOrientation();
                    e = e || 1,
                    f.width = c,
                    f.height = d,
                    g.preserveHeaders || this._rotate2Orientaion(f, k),
                    this._renderImageToCanvas(f, h, -a, -b, i * e, j * e),
                    this._blob = null,
                    this.modified = !0,
                    this.owner.trigger("complete", "crop")
                },
                getAsBlob: function(a) {
                    var b, d = this._blob,
                    e = this.options;
                    if (a = a || this.type, this.modified || this.type !== a) {
                        if (b = this._canvas, "image/jpeg" === a) {
                            if (d = c.canvasToDataUrl(b, a, e.quality), e.preserveHeaders && this._metas && this._metas.imageHead) return d = c.dataURL2ArrayBuffer(d),
                            d = c.updateImageHead(d, this._metas.imageHead),
                            d = c.arrayBufferToBlob(d, a)
                        } else d = c.canvasToDataUrl(b, a);
                        d = c.dataURL2Blob(d)
                    }
                    return d
                },
                getAsDataUrl: function(a) {
                    var b = this.options;
                    return a = a || this.type,
                    "image/jpeg" === a ? c.canvasToDataUrl(this._canvas, a, b.quality) : this._canvas.toDataURL(a)
                },
                getOrientation: function() {
                    return this._metas && this._metas.exif && this._metas.exif.get("Orientation") || 1
                },
                info: function(a) {
                    return a ? (this._info = a, this) : this._info
                },
                meta: function(a) {
                    return a ? (this._meta = a, this) : this._meta
                },
                destroy: function() {
                    var a = this._canvas;
                    this._img.onload = null,
                    a && (a.getContext("2d").clearRect(0, 0, a.width, a.height), a.width = a.height = 0, this._canvas = null),
                    this._img.src = d,
                    this._img = this._blob = null
                },
                _resize: function(a, b, c, d) {
                    var e, f, g, h, i, j = this.options,
                    k = a.width,
                    l = a.height,
                    m = this.getOrientation();~ [5, 6, 7, 8].indexOf(m) && (c ^= d, d ^= c, c ^= d),
                    e = Math[j.crop ? "max": "min"](c / k, d / l),
                    j.allowMagnify || (e = Math.min(1, e)),
                    f = k * e,
                    g = l * e,
                    j.crop ? (b.width = c, b.height = d) : (b.width = f, b.height = g),
                    h = (b.width - f) / 2,
                    i = (b.height - g) / 2,
                    j.preserveHeaders || this._rotate2Orientaion(b, m),
                    this._renderImageToCanvas(b, a, h, i, f, g)
                },
                _rotate2Orientaion: function(a, b) {
                    var c = a.width,
                    d = a.height,
                    e = a.getContext("2d");
                    switch (b) {
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        a.width = d,
                        a.height = c
                    }
                    switch (b) {
                    case 2:
                        e.translate(c, 0),
                        e.scale( - 1, 1);
                        break;
                    case 3:
                        e.translate(c, d),
                        e.rotate(Math.PI);
                        break;
                    case 4:
                        e.translate(0, d),
                        e.scale(1, -1);
                        break;
                    case 5:
                        e.rotate(.5 * Math.PI),
                        e.scale(1, -1);
                        break;
                    case 6:
                        e.rotate(.5 * Math.PI),
                        e.translate(0, -d);
                        break;
                    case 7:
                        e.rotate(.5 * Math.PI),
                        e.translate(c, -d),
                        e.scale( - 1, 1);
                        break;
                    case 8:
                        e.rotate( - .5 * Math.PI),
                        e.translate( - c, 0)
                    }
                },
                _renderImageToCanvas: function() {
                    if (!a.os.ios) return function(b) {
                        var c = a.slice(arguments, 1),
                        d = b.getContext("2d");
                        d.drawImage.apply(d, c)
                    };
                    function b(a, b, c) {
                        var d, e, f, g = document.createElement("canvas"),
                        h = g.getContext("2d"),
                        i = 0,
                        j = c,
                        k = c;
                        for (g.width = 1, g.height = c, h.drawImage(a, 0, 0), d = h.getImageData(0, 0, 1, c).data; k > i;) e = d[4 * (k - 1) + 3],
                        0 === e ? j = k: i = k,
                        k = j + i >> 1;
                        return f = k / c,
                        0 === f ? 1 : f
                    }
                    if (a.os.ios >= 7) return function(a, c, d, e, f, g) {
                        var h = c.naturalWidth,
                        i = c.naturalHeight,
                        j = b(c, h, i);
                        return a.getContext("2d").drawImage(c, 0, 0, h * j, i * j, d, e, f, g)
                    };
                    function c(a) {
                        var b, c, d = a.naturalWidth,
                        e = a.naturalHeight;
                        return d * e > 1048576 ? (b = document.createElement("canvas"), b.width = b.height = 1, c = b.getContext("2d"), c.drawImage(a, -d + 1, 0), 0 === c.getImageData(0, 0, 1, 1).data[3]) : !1
                    }
                    return function(a, d, e, f, g, h) {
                        var i, j, k, l, m, n, o, p = d.naturalWidth,
                        q = d.naturalHeight,
                        r = a.getContext("2d"),
                        s = c(d),
                        t = "image/jpeg" === this.type,
                        u = 1024,
                        v = 0,
                        w = 0;
                        for (s && (p /= 2, q /= 2), r.save(), i = document.createElement("canvas"), i.width = i.height = u, j = i.getContext("2d"), k = t ? b(d, p, q) : 1, l = Math.ceil(u * g / p), m = Math.ceil(u * h / q / k); q > v;) {
                            for (n = 0, o = 0; p > n;) j.clearRect(0, 0, u, u),
                            j.drawImage(d, -n, -v),
                            r.drawImage(i, 0, 0, u, u, e + o, f + w, l, m),
                            n += u,
                            o += l;
                            v += u,
                            w += m
                        }
                        r.restore(),
                        i = j = null
                    }
                } ()
            })
        }),
        b("runtime/html5/transport", ["base", "runtime/html5/runtime"],
        function(a, b) {
            var c = a.noop,
            d = a.$;
            return b.register("Transport", {
                init: function() {
                    this._status = 0,
                    this._response = null
                },
                send: function() {
                    var b, c, e, f = this.owner,
                    g = this.options,
                    h = this._initAjax(),
                    i = f._blob,
                    j = g.server;
                    g.sendAsBinary ? (j += (/\?/.test(j) ? "&": "?") + d.param(f._formData), c = i.getSource()) : (b = new FormData, d.each(f._formData,
                    function(a, c) {
                        b.append(a, c)
                    }), b.append(g.fileVal, i.getSource(), g.filename || f._formData.name || "")),
                    g.withCredentials && "withCredentials" in h ? (h.open(g.method, j, !0), h.withCredentials = !0) : h.open(g.method, j),
                    this._setRequestHeader(h, g.headers),
                    c ? (h.overrideMimeType && h.overrideMimeType("application/octet-stream"), a.os.android ? (e = new FileReader, e.onload = function() {
                        h.send(this.result),
                        e = e.onload = null
                    },
                    e.readAsArrayBuffer(c)) : h.send(c)) : h.send(b)
                },
                getResponse: function() {
                    return this._response
                },
                getResponseAsJson: function() {
                    return this._parseJson(this._response)
                },
                getStatus: function() {
                    return this._status
                },
                abort: function() {
                    var a = this._xhr;
                    a && (a.upload.onprogress = c, a.onreadystatechange = c, a.abort(), this._xhr = a = null)
                },
                destroy: function() {
                    this.abort()
                },
                _initAjax: function() {
                    var a = this,
                    b = new XMLHttpRequest,
                    d = this.options;
                    return ! d.withCredentials || "withCredentials" in b || "undefined" == typeof XDomainRequest || (b = new XDomainRequest),
                    b.upload.onprogress = function(b) {
                        var c = 0;
                        return b.lengthComputable && (c = b.loaded / b.total),
                        a.trigger("progress", c)
                    },
                    b.onreadystatechange = function() {
                        return 4 === b.readyState ? (b.upload.onprogress = c, b.onreadystatechange = c, a._xhr = null, a._status = b.status, b.status >= 200 && b.status < 300 ? (a._response = b.responseText, a.trigger("load")) : b.status >= 500 && b.status < 600 ? (a._response = b.responseText, a.trigger("error", "server")) : a.trigger("error", a._status ? "http": "abort")) : void 0
                    },
                    a._xhr = b,
                    b
                },
                _setRequestHeader: function(a, b) {
                    d.each(b,
                    function(b, c) {
                        a.setRequestHeader(b, c)
                    })
                },
                _parseJson: function(a) {
                    var b;
                    try {
                        b = JSON.parse(a)
                    } catch(c) {
                        b = {}
                    }
                    return b
                }
            })
        }),
        b("runtime/html5/md5", ["runtime/html5/runtime"],
        function(a) {
            var b = function(a, b) {
                return a + b & 4294967295
            },
            c = function(a, c, d, e, f, g) {
                return c = b(b(c, a), b(e, g)),
                b(c << f | c >>> 32 - f, d)
            },
            d = function(a, b, d, e, f, g, h) {
                return c(b & d | ~b & e, a, b, f, g, h)
            },
            e = function(a, b, d, e, f, g, h) {
                return c(b & e | d & ~e, a, b, f, g, h)
            },
            f = function(a, b, d, e, f, g, h) {
                return c(b ^ d ^ e, a, b, f, g, h)
            },
            g = function(a, b, d, e, f, g, h) {
                return c(d ^ (b | ~e), a, b, f, g, h)
            },
            h = function(a, c) {
                var h = a[0],
                i = a[1],
                j = a[2],
                k = a[3];
                h = d(h, i, j, k, c[0], 7, -680876936),
                k = d(k, h, i, j, c[1], 12, -389564586),
                j = d(j, k, h, i, c[2], 17, 606105819),
                i = d(i, j, k, h, c[3], 22, -1044525330),
                h = d(h, i, j, k, c[4], 7, -176418897),
                k = d(k, h, i, j, c[5], 12, 1200080426),
                j = d(j, k, h, i, c[6], 17, -1473231341),
                i = d(i, j, k, h, c[7], 22, -45705983),
                h = d(h, i, j, k, c[8], 7, 1770035416),
                k = d(k, h, i, j, c[9], 12, -1958414417),
                j = d(j, k, h, i, c[10], 17, -42063),
                i = d(i, j, k, h, c[11], 22, -1990404162),
                h = d(h, i, j, k, c[12], 7, 1804603682),
                k = d(k, h, i, j, c[13], 12, -40341101),
                j = d(j, k, h, i, c[14], 17, -1502002290),
                i = d(i, j, k, h, c[15], 22, 1236535329),
                h = e(h, i, j, k, c[1], 5, -165796510),
                k = e(k, h, i, j, c[6], 9, -1069501632),
                j = e(j, k, h, i, c[11], 14, 643717713),
                i = e(i, j, k, h, c[0], 20, -373897302),
                h = e(h, i, j, k, c[5], 5, -701558691),
                k = e(k, h, i, j, c[10], 9, 38016083),
                j = e(j, k, h, i, c[15], 14, -660478335),
                i = e(i, j, k, h, c[4], 20, -405537848),
                h = e(h, i, j, k, c[9], 5, 568446438),
                k = e(k, h, i, j, c[14], 9, -1019803690),
                j = e(j, k, h, i, c[3], 14, -187363961),
                i = e(i, j, k, h, c[8], 20, 1163531501),
                h = e(h, i, j, k, c[13], 5, -1444681467),
                k = e(k, h, i, j, c[2], 9, -51403784),
                j = e(j, k, h, i, c[7], 14, 1735328473),
                i = e(i, j, k, h, c[12], 20, -1926607734),
                h = f(h, i, j, k, c[5], 4, -378558),
                k = f(k, h, i, j, c[8], 11, -2022574463),
                j = f(j, k, h, i, c[11], 16, 1839030562),
                i = f(i, j, k, h, c[14], 23, -35309556),
                h = f(h, i, j, k, c[1], 4, -1530992060),
                k = f(k, h, i, j, c[4], 11, 1272893353),
                j = f(j, k, h, i, c[7], 16, -155497632),
                i = f(i, j, k, h, c[10], 23, -1094730640),
                h = f(h, i, j, k, c[13], 4, 681279174),
                k = f(k, h, i, j, c[0], 11, -358537222),
                j = f(j, k, h, i, c[3], 16, -722521979),
                i = f(i, j, k, h, c[6], 23, 76029189),
                h = f(h, i, j, k, c[9], 4, -640364487),
                k = f(k, h, i, j, c[12], 11, -421815835),
                j = f(j, k, h, i, c[15], 16, 530742520),
                i = f(i, j, k, h, c[2], 23, -995338651),
                h = g(h, i, j, k, c[0], 6, -198630844),
                k = g(k, h, i, j, c[7], 10, 1126891415),
                j = g(j, k, h, i, c[14], 15, -1416354905),
                i = g(i, j, k, h, c[5], 21, -57434055),
                h = g(h, i, j, k, c[12], 6, 1700485571),
                k = g(k, h, i, j, c[3], 10, -1894986606),
                j = g(j, k, h, i, c[10], 15, -1051523),
                i = g(i, j, k, h, c[1], 21, -2054922799),
                h = g(h, i, j, k, c[8], 6, 1873313359),
                k = g(k, h, i, j, c[15], 10, -30611744),
                j = g(j, k, h, i, c[6], 15, -1560198380),
                i = g(i, j, k, h, c[13], 21, 1309151649),
                h = g(h, i, j, k, c[4], 6, -145523070),
                k = g(k, h, i, j, c[11], 10, -1120210379),
                j = g(j, k, h, i, c[2], 15, 718787259),
                i = g(i, j, k, h, c[9], 21, -343485551),
                a[0] = b(h, a[0]),
                a[1] = b(i, a[1]),
                a[2] = b(j, a[2]),
                a[3] = b(k, a[3])
            },
            i = function(a) {
                var b, c = [];
                for (b = 0; 64 > b; b += 4) c[b >> 2] = a.charCodeAt(b) + (a.charCodeAt(b + 1) << 8) + (a.charCodeAt(b + 2) << 16) + (a.charCodeAt(b + 3) << 24);
                return c
            },
            j = function(a) {
                var b, c = [];
                for (b = 0; 64 > b; b += 4) c[b >> 2] = a[b] + (a[b + 1] << 8) + (a[b + 2] << 16) + (a[b + 3] << 24);
                return c
            },
            k = function(a) {
                var b, c, d, e, f, g, j = a.length,
                k = [1732584193, -271733879, -1732584194, 271733878];
                for (b = 64; j >= b; b += 64) h(k, i(a.substring(b - 64, b)));
                for (a = a.substring(b - 64), c = a.length, d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], b = 0; c > b; b += 1) d[b >> 2] |= a.charCodeAt(b) << (b % 4 << 3);
                if (d[b >> 2] |= 128 << (b % 4 << 3), b > 55) for (h(k, d), b = 0; 16 > b; b += 1) d[b] = 0;
                return e = 8 * j,
                e = e.toString(16).match(/(.*?)(.{0,8})$/),
                f = parseInt(e[2], 16),
                g = parseInt(e[1], 16) || 0,
                d[14] = f,
                d[15] = g,
                h(k, d),
                k
            },
            l = function(a) {
                var b, c, d, e, f, g, i = a.length,
                k = [1732584193, -271733879, -1732584194, 271733878];
                for (b = 64; i >= b; b += 64) h(k, j(a.subarray(b - 64, b)));
                for (a = i > b - 64 ? a.subarray(b - 64) : new Uint8Array(0), c = a.length, d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], b = 0; c > b; b += 1) d[b >> 2] |= a[b] << (b % 4 << 3);
                if (d[b >> 2] |= 128 << (b % 4 << 3), b > 55) for (h(k, d), b = 0; 16 > b; b += 1) d[b] = 0;
                return e = 8 * i,
                e = e.toString(16).match(/(.*?)(.{0,8})$/),
                f = parseInt(e[2], 16),
                g = parseInt(e[1], 16) || 0,
                d[14] = f,
                d[15] = g,
                h(k, d),
                k
            },
            m = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"],
            n = function(a) {
                var b, c = "";
                for (b = 0; 4 > b; b += 1) c += m[a >> 8 * b + 4 & 15] + m[a >> 8 * b & 15];
                return c
            },
            o = function(a) {
                var b;
                for (b = 0; b < a.length; b += 1) a[b] = n(a[b]);
                return a.join("")
            },
            p = function(a) {
                return o(k(a))
            },
            q = function() {
                this.reset()
            };
            return "5d41402abc4b2a76b9719d911017c592" !== p("hello") && (b = function(a, b) {
                var c = (65535 & a) + (65535 & b),
                d = (a >> 16) + (b >> 16) + (c >> 16);
                return d << 16 | 65535 & c
            }),
            q.prototype.append = function(a) {
                return /[\u0080-\uFFFF]/.test(a) && (a = unescape(encodeURIComponent(a))),
                this.appendBinary(a),
                this
            },
            q.prototype.appendBinary = function(a) {
                this._buff += a,
                this._length += a.length;
                var b, c = this._buff.length;
                for (b = 64; c >= b; b += 64) h(this._state, i(this._buff.substring(b - 64, b)));
                return this._buff = this._buff.substr(b - 64),
                this
            },
            q.prototype.end = function(a) {
                var b, c, d = this._buff,
                e = d.length,
                f = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (b = 0; e > b; b += 1) f[b >> 2] |= d.charCodeAt(b) << (b % 4 << 3);
                return this._finish(f, e),
                c = a ? this._state: o(this._state),
                this.reset(),
                c
            },
            q.prototype._finish = function(a, b) {
                var c, d, e, f = b;
                if (a[f >> 2] |= 128 << (f % 4 << 3), f > 55) for (h(this._state, a), f = 0; 16 > f; f += 1) a[f] = 0;
                c = 8 * this._length,
                c = c.toString(16).match(/(.*?)(.{0,8})$/),
                d = parseInt(c[2], 16),
                e = parseInt(c[1], 16) || 0,
                a[14] = d,
                a[15] = e,
                h(this._state, a)
            },
            q.prototype.reset = function() {
                return this._buff = "",
                this._length = 0,
                this._state = [1732584193, -271733879, -1732584194, 271733878],
                this
            },
            q.prototype.destroy = function() {
                delete this._state,
                delete this._buff,
                delete this._length
            },
            q.hash = function(a, b) { / [\u0080 - \uFFFF] / .test(a) && (a = unescape(encodeURIComponent(a)));
                var c = k(a);
                return b ? c: o(c)
            },
            q.hashBinary = function(a, b) {
                var c = k(a);
                return b ? c: o(c)
            },
            q.ArrayBuffer = function() {
                this.reset()
            },
            q.ArrayBuffer.prototype.append = function(a) {
                var b, c = this._concatArrayBuffer(this._buff, a),
                d = c.length;
                for (this._length += a.byteLength, b = 64; d >= b; b += 64) h(this._state, j(c.subarray(b - 64, b)));
                return this._buff = d > b - 64 ? c.subarray(b - 64) : new Uint8Array(0),
                this
            },
            q.ArrayBuffer.prototype.end = function(a) {
                var b, c, d = this._buff,
                e = d.length,
                f = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (b = 0; e > b; b += 1) f[b >> 2] |= d[b] << (b % 4 << 3);
                return this._finish(f, e),
                c = a ? this._state: o(this._state),
                this.reset(),
                c
            },
            q.ArrayBuffer.prototype._finish = q.prototype._finish,
            q.ArrayBuffer.prototype.reset = function() {
                return this._buff = new Uint8Array(0),
                this._length = 0,
                this._state = [1732584193, -271733879, -1732584194, 271733878],
                this
            },
            q.ArrayBuffer.prototype.destroy = q.prototype.destroy,
            q.ArrayBuffer.prototype._concatArrayBuffer = function(a, b) {
                var c = a.length,
                d = new Uint8Array(c + b.byteLength);
                return d.set(a),
                d.set(new Uint8Array(b), c),
                d
            },
            q.ArrayBuffer.hash = function(a, b) {
                var c = l(new Uint8Array(a));
                return b ? c: o(c)
            },
            a.register("Md5", {
                init: function() {},
                loadFromBlob: function(a) {
                    var b, c, d = a.getSource(),
                    e = 2097152,
                    f = Math.ceil(d.size / e),
                    g = 0,
                    h = this.owner,
                    i = new q.ArrayBuffer,
                    j = this,
                    k = d.mozSlice || d.webkitSlice || d.slice;
                    c = new FileReader,
                    (b = function() {
                        var l, m;
                        l = g * e,
                        m = Math.min(l + e, d.size),
                        c.onload = function(b) {
                            i.append(b.target.result),
                            h.trigger("progress", {
                                total: a.size,
                                loaded: m
                            })
                        },
                        c.onloadend = function() {
                            c.onloadend = c.onload = null,
                            ++g < f ? setTimeout(b, 1) : setTimeout(function() {
                                h.trigger("load"),
                                j.result = i.end(),
                                b = a = d = i = null,
                                h.trigger("complete")
                            },
                            50)
                        },
                        c.readAsArrayBuffer(k.call(d, l, m))
                    })()
                },
                getResult: function() {
                    return this.result
                }
            })
        }),
        b("runtime/flash/runtime", ["base", "runtime/runtime", "runtime/compbase"],
        function(b, c, d) {
            var e = b.$,
            f = "flash",
            g = {};
            function h() {
                var a;
                try {
                    a = navigator.plugins["Shockwave Flash"],
                    a = a.description
                } catch(b) {
                    try {
                        a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version")
                    } catch(c) {
                        a = "0.0"
                    }
                }
                return a = a.match(/\d+/g),
                parseFloat(a[0] + "." + a[1], 10)
            }
            function i() {
                var d = {},
                e = {},
                h = this.destroy,
                i = this,
                j = b.guid("webuploader_");
                c.apply(i, arguments),
                i.type = f,
                i.exec = function(a, c) {
                    var f, h = this,
                    j = h.uid,
                    k = b.slice(arguments, 2);
                    return e[j] = h,
                    g[a] && (d[j] || (d[j] = new g[a](h, i)), f = d[j], f[c]) ? f[c].apply(f, k) : i.flashExec.apply(h, arguments)
                };
                function k(a, b) {
                    var c, d, f = a.type || a;
                    c = f.split("::"),
                    d = c[0],
                    f = c[1],
                    "Ready" === f && d === i.uid ? i.trigger("ready") : e[d] && e[d].trigger(f.toLowerCase(), a, b)
                }
                a[j] = function() {
                    var a = arguments;
                    setTimeout(function() {
                        k.apply(null, a)
                    },
                    1)
                },
                this.jsreciver = j,
                this.destroy = function() {
                    return h && h.apply(this, arguments)
                },
                this.flashExec = function(a, c) {
                    var d = i.getFlash(),
                    e = b.slice(arguments, 2);
                    return d.exec(this.uid, a, c, e)
                }
            }
            return b.inherits(c, {
                constructor: i,
                init: function() {
                    var a, c = this.getContainer(),
                    d = this.options;
                    c.css({
                        position: "absolute",
                        top: "-8px",
                        left: "-8px",
                        width: "9px",
                        height: "9px",
                        overflow: "hidden"
                    }),
                    a = '<object id="' + this.uid + '" type="application/x-shockwave-flash" data="' + d.swf + '" ',
                    b.browser.ie && (a += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '),
                    a += 'width="100%" height="100%" style="outline:0"><param name="movie" value="' + d.swf + '" /><param name="flashvars" value="uid=' + this.uid + "&jsreciver=" + this.jsreciver + '" /><param name="wmode" value="transparent" /><param name="allowscriptaccess" value="always" /></object>',
                    c.html(a)
                },
                getFlash: function() {
                    return this._flash ? this._flash: (this._flash = e("#" + this.uid).get(0), this._flash)
                }
            }),
            i.register = function(a, c) {
                return c = g[a] = b.inherits(d, e.extend({
                    flashExec: function() {
                        var a = this.owner,
                        b = this.getRuntime();
                        return b.flashExec.apply(a, arguments)
                    }
                },
                c))
            },
            h() >= 11.4 && c.addRuntime(f, i),
            i
        }),
        b("runtime/flash/filepicker", ["base", "runtime/flash/runtime"],
        function(a, b) {
            var c = a.$;
            return b.register("FilePicker", {
                init: function(a) {
                    var b, d, e = c.extend({},
                    a);
                    for (b = e.accept && e.accept.length, d = 0; b > d; d++) e.accept[d].title || (e.accept[d].title = "Files");
                    delete e.button,
                    delete e.id,
                    delete e.container,
                    this.flashExec("FilePicker", "init", e)
                },
                destroy: function() {
                    this.flashExec("FilePicker", "destroy")
                }
            })
        }),
        b("runtime/flash/image", ["runtime/flash/runtime"],
        function(a) {
            return a.register("Image", {
                loadFromBlob: function(a) {
                    var b = this.owner;
                    b.info() && this.flashExec("Image", "info", b.info()),
                    b.meta() && this.flashExec("Image", "meta", b.meta()),
                    this.flashExec("Image", "loadFromBlob", a.uid)
                }
            })
        }),
        b("runtime/flash/transport", ["base", "runtime/flash/runtime", "runtime/client"],
        function(b, c, d) {
            var e = b.$;
            return c.register("Transport", {
                init: function() {
                    this._status = 0,
                    this._response = null,
                    this._responseJson = null
                },
                send: function() {
                    var a, b = this.owner,
                    c = this.options,
                    d = this._initAjax(),
                    f = b._blob,
                    g = c.server;
                    d.connectRuntime(f.ruid),
                    c.sendAsBinary ? (g += (/\?/.test(g) ? "&": "?") + e.param(b._formData), a = f.uid) : (e.each(b._formData,
                    function(a, b) {
                        d.exec("append", a, b)
                    }), d.exec("appendBlob", c.fileVal, f.uid, c.filename || b._formData.name || "")),
                    this._setRequestHeader(d, c.headers),
                    d.exec("send", {
                        method: c.method,
                        url: g,
                        forceURLStream: c.forceURLStream,
                        mimeType: "application/octet-stream"
                    },
                    a)
                },
                getStatus: function() {
                    return this._status
                },
                getResponse: function() {
                    return this._response || ""
                },
                getResponseAsJson: function() {
                    return this._responseJson
                },
                abort: function() {
                    var a = this._xhr;
                    a && (a.exec("abort"), a.destroy(), this._xhr = a = null)
                },
                destroy: function() {
                    this.abort()
                },
                _initAjax: function() {
                    var b = this,
                    c = new d("XMLHttpRequest");
                    return c.on("uploadprogress progress",
                    function(a) {
                        var c = a.loaded / a.total;
                        return c = Math.min(1, Math.max(0, c)),
                        b.trigger("progress", c)
                    }),
                    c.on("load",
                    function() {
                        var d, e = c.exec("getStatus"),
                        f = !1,
                        g = "";
                        return c.off(),
                        b._xhr = null,
                        e >= 200 && 300 > e ? f = !0 : e >= 500 && 600 > e ? (f = !0, g = "server") : g = "http",
                        f && (b._response = c.exec("getResponse"), b._response = decodeURIComponent(b._response), d = a.JSON && a.JSON.parse ||
                        function(a) {
                            try {
                                return new Function("return " + a).call()
                            } catch(b) {
                                return {}
                            }
                        },
                        b._responseJson = b._response ? d(b._response) : {}),
                        c.destroy(),
                        c = null,
                        g ? b.trigger("error", g) : b.trigger("load")
                    }),
                    c.on("error",
                    function() {
                        c.off(),
                        b._xhr = null,
                        b.trigger("error", "http")
                    }),
                    b._xhr = c,
                    c
                },
                _setRequestHeader: function(a, b) {
                    e.each(b,
                    function(b, c) {
                        a.exec("setRequestHeader", b, c)
                    })
                }
            })
        }),
        b("runtime/flash/blob", ["runtime/flash/runtime", "lib/blob"],
        function(a, b) {
            return a.register("Blob", {
                slice: function(a, c) {
                    var d = this.flashExec("Blob", "slice", a, c);
                    return new b(d.uid, d)
                }
            })
        }),
        b("runtime/flash/md5", ["runtime/flash/runtime"],
        function(a) {
            return a.register("Md5", {
                init: function() {},
                loadFromBlob: function(a) {
                    return this.flashExec("Md5", "loadFromBlob", a.uid)
                }
            })
        }),
        b("preset/all", ["base", "widgets/filednd", "widgets/filepaste", "widgets/filepicker", "widgets/image", "widgets/queue", "widgets/runtime", "widgets/upload", "widgets/validator", "widgets/md5", "runtime/html5/blob", "runtime/html5/dnd", "runtime/html5/filepaste", "runtime/html5/filepicker", "runtime/html5/imagemeta/exif", "runtime/html5/androidpatch", "runtime/html5/image", "runtime/html5/transport", "runtime/html5/md5", "runtime/flash/filepicker", "runtime/flash/image", "runtime/flash/transport", "runtime/flash/blob", "runtime/flash/md5"],
        function(a) {
            return a
        }),
        b("widgets/log", ["base", "uploader", "widgets/widget"],
        function(a, b) {
            var c, d = a.$,
            e = " http://static.tieba.baidu.com/tb/pms/img/st.gif??",
            f = (location.hostname || location.host || "protected").toLowerCase(),
            g = f && /baidu/i.exec(f);
            if (g) {
                c = {
                    dv: 3,
                    master: "webuploader",
                    online: /test/.exec(f) ? 0 : 1,
                    module: "",
                    product: f,
                    type: 0
                };
                function h(a) {
                    var b = d.extend({},
                    c, a),
                    f = e.replace(/^(.*)\?/, "$1" + d.param(b)),
                    g = new Image;
                    g.src = f
                }
                return b.register({
                    name: "log",
                    init: function() {
                        var a = this.owner,
                        b = 0,
                        c = 0;
                        a.on("error",
                        function(a) {
                            h({
                                type: 2,
                                c_error_code: a
                            })
                        }).on("uploadError",
                        function(a, b) {
                            h({
                                type: 2,
                                c_error_code: "UPLOAD_ERROR",
                                c_reason: "" + b
                            })
                        }).on("uploadComplete",
                        function(a) {
                            b++,
                            c += a.size
                        }).on("uploadFinished",
                        function() {
                            h({
                                c_count: b,
                                c_size: c
                            }),
                            b = c = 0
                        }),
                        h({
                            c_usage: 1
                        })
                    }
                })
            }
        }),
        b("webuploader", ["preset/all", "widgets/log"],
        function(a) {
            return a
        }),
        c("webuploader")
    })
});
