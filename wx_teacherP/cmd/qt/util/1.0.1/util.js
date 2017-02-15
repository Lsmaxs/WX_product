define(function (require, exports, module) {
    var a = {};
    a.toArray = function (a) {
        var b, c = [], d = 0;
        if (!a)return c;
        for (b = a.length; b > d; d++)c.push(a[d]);
        return c
    }, a.P = function (b) {
        var c = window.location.search, d = new RegExp("[\\?&]" + b + "=([^&]*)"), e = c.match(d);
        return null === e ? null : a.text2html(e[1])
    }, a.text2html = function (a) {
        var b = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g, c = "" + a;
        return c.replace(b, function (a) {
            var b = a.charCodeAt(0), c = ["&#"];
            return b = 32 == b ? 160 : b, c.push(b), c.push(";"), c.join("")
        })
    }, a.param = function (a) {
        var b, c = "";
        for (b in a)c += "&" + b + "=" + encodeURIComponent(a[b]);
        return c.length > 1 ? c.slice(1) : c
    }, a.extend = function (a, b) {
        for (var c in b)a[c] = b[c];
        return a
    }, a.getViewSize = function () {
        var a, b = 0, c = 0, d = document;
        return window.innerWidth ? (a = window, b = a.innerWidth, c = a.innerHeight) : d.documentElement && d.documentElement.clientWidth && (a = d.documentElement, b = a.clientWidth, c = a.clientHeight), {
            width: b,
            height: c
        }
    }, a.getPageSize = function () {
        var a, b, c, d, e, f, g, h, i = document, j = i.documentElement, k = i.body;
        return a = j.clientWidth, b = j.scrollWidth, c = k.scrollWidth, d = j.clientHeight, e = j.scrollHeight, f = k.scrollHeight, g = Math.max(a, b, c), h = Math.max(d, e, f), {
            width: g,
            height: h
        }
    }, a.formSubmit = function (a, b) {
        var c, d, e, f, g, h, i, j, k, l = "qt_util_ajaxSubmitForm", m = document;
        if (a) {
            for (c = m.getElementById(l), c || (c = m.createElement("form"), c.id = l, c.method = "post", m.body.appendChild(c)), c.innerHTML = "", e = a.indexOf("?"), d = a, e > 0 && (d = a.substring(0, e)), !1 === b ? ($("#qt_postiframe").length <= 0 && $('<iframe id="qt_util_postiframe" name="qt_util_postiframe" style="display:none;"/>').appendTo("body"), c.target = "qt_util_postiframe") : c.target = "_blank", c.action = d, g = a.substring(e + 1), h = g.split("&"), j = 0, k = h.length; k > j; j++)i = h[j], e = i.indexOf("="), f = m.createElement("input"), f.setAttribute("name", i.substring(0, e)), f.setAttribute("type", "hidden"), f.setAttribute("value", i.substring(e + 1)), c.appendChild(f);
            c.submit()
        }
    }, a.formatDate = function (a, b) {
        var c = new Date(a), d = b ? "" + b : "yyyy-MM-dd", e = {
            "M+": c.getMonth() + 1,
            "d+": c.getDate(),
            "h+": c.getHours(),
            "m+": c.getMinutes(),
            "s+": c.getSeconds(),
            "w+": "天一二三四五六".charAt(c.getDay()),
            "q+": Math.floor((c.getMonth() + 3) / 3),
            S: c.getMilliseconds()
        };
        /(y+)/.test(d) && (d = d.replace(RegExp.$1, (c.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (var f in e)new RegExp("(" + f + ")").test(d) && (d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? e[f] : ("00" + e[f]).substr(("" + e[f]).length)));
        return d
    };
    var b = function (a) {
        "function" == typeof a.onTick ? this.onTick = a.onTick : this.onTick = null, this.time = a.time > 0 ? a.time : 0, this.left = this.time, this.complete = "function" == typeof a.onComplete ? a.onComplete : null, this.timer = null, this.running = !1, this.init()
    };
    b.prototype.init = function () {
        this.formatTime(), this.left <= 0 ? this.stop(!0) : this.start()
    }, b.prototype.start = function () {
        var a = this;
        this.running || (this.running = !0, this.timer = setInterval(function () {
            a.left -= 1e3, a.formatTime(), a.left <= 0 && a.stop(!0)
        }, 1e3))
    }, b.prototype.stop = function (a) {
        "undefined" == typeof a && (a = !1), this.timer && (clearInterval(this.timer), this.timer = null), a && this.complete && this.complete(), this.running = !1, this.left = 0
    }, b.prototype.setTime = function (a, b, c) {
        "undefined" == typeof b && (b = !1), "undefined" == typeof c && (c = !0), "number" == typeof a && (this.stop(), 0 >= a || (b && (a *= 1e3), this.time = a, this.left = a, c && this.start()))
    }, b.prototype.getTime = function (a) {
        return "undefined" == typeof a && (a = !1), a ? Math.floor(this.left / 1e3) : this.left
    }, b.prototype.isRunning = function () {
        return this.running
    }, b.prototype.getTimeObject = function () {
        var b = a.dissolveTime(this.left);
        return b
    }, b.prototype.formatTime = function () {
        var b;
        return this.onTick ? (b = a.dissolveTime(this.left), void this.onTick(b)) : void 0
    }, a.countdown = function (a) {
        return new b(a)
    }, a.dissolveTime = function (a) {
        if ("number" != typeof a || 0 >= a)return {
            s1: "0",
            s2: "0",
            m1: "0",
            m2: "0",
            h1: "0",
            h2: "0",
            d1: "0",
            d2: "0",
            d: 0,
            h: 0,
            m: 0,
            s: 0,
            time: 0
        };
        var b, c, d, e, f, g, h, i, j = a / 1e3, k = j / 60, l = k / 60, m = l / 24, n = Math.floor(j % 60), o = Math.floor(k % 60), p = Math.floor(l % 24), q = Math.floor(m);
        return b = Math.floor(n / 10) + "", c = n % 10 + "", d = Math.floor(o / 10) + "", e = o % 10 + "", f = Math.floor(p / 10) + "", g = p % 10 + "", q > 100 ? h = i = "9" : (h = Math.floor(q / 10) + "", i = q % 10 + ""), {
            s1: b,
            s2: c,
            m1: d,
            m2: e,
            h1: f,
            h2: g,
            d1: h,
            d2: i,
            d: q,
            h: p,
            m: o,
            s: n,
            time: a
        }
    }, module.exports = a
});