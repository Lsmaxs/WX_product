    var a = {},
    b = 0,
    c = 8;
    function d(a, b) {
        a[b >> 5] |= 128 << b % 32,
        a[(b + 64 >>> 9 << 4) + 14] = b;
        for (var c = 1732584193,
        d = -271733879,
        e = -1732584194,
        k = 271733878,
        l = 0; l < a.length; l += 16) {
            var m = c,
            n = d,
            o = e,
            p = k;
            c = f(c, d, e, k, a[l + 0], 7, -680876936),
            k = f(k, c, d, e, a[l + 1], 12, -389564586),
            e = f(e, k, c, d, a[l + 2], 17, 606105819),
            d = f(d, e, k, c, a[l + 3], 22, -1044525330),
            c = f(c, d, e, k, a[l + 4], 7, -176418897),
            k = f(k, c, d, e, a[l + 5], 12, 1200080426),
            e = f(e, k, c, d, a[l + 6], 17, -1473231341),
            d = f(d, e, k, c, a[l + 7], 22, -45705983),
            c = f(c, d, e, k, a[l + 8], 7, 1770035416),
            k = f(k, c, d, e, a[l + 9], 12, -1958414417),
            e = f(e, k, c, d, a[l + 10], 17, -42063),
            d = f(d, e, k, c, a[l + 11], 22, -1990404162),
            c = f(c, d, e, k, a[l + 12], 7, 1804603682),
            k = f(k, c, d, e, a[l + 13], 12, -40341101),
            e = f(e, k, c, d, a[l + 14], 17, -1502002290),
            d = f(d, e, k, c, a[l + 15], 22, 1236535329),
            c = g(c, d, e, k, a[l + 1], 5, -165796510),
            k = g(k, c, d, e, a[l + 6], 9, -1069501632),
            e = g(e, k, c, d, a[l + 11], 14, 643717713),
            d = g(d, e, k, c, a[l + 0], 20, -373897302),
            c = g(c, d, e, k, a[l + 5], 5, -701558691),
            k = g(k, c, d, e, a[l + 10], 9, 38016083),
            e = g(e, k, c, d, a[l + 15], 14, -660478335),
            d = g(d, e, k, c, a[l + 4], 20, -405537848),
            c = g(c, d, e, k, a[l + 9], 5, 568446438),
            k = g(k, c, d, e, a[l + 14], 9, -1019803690),
            e = g(e, k, c, d, a[l + 3], 14, -187363961),
            d = g(d, e, k, c, a[l + 8], 20, 1163531501),
            c = g(c, d, e, k, a[l + 13], 5, -1444681467),
            k = g(k, c, d, e, a[l + 2], 9, -51403784),
            e = g(e, k, c, d, a[l + 7], 14, 1735328473),
            d = g(d, e, k, c, a[l + 12], 20, -1926607734),
            c = h(c, d, e, k, a[l + 5], 4, -378558),
            k = h(k, c, d, e, a[l + 8], 11, -2022574463),
            e = h(e, k, c, d, a[l + 11], 16, 1839030562),
            d = h(d, e, k, c, a[l + 14], 23, -35309556),
            c = h(c, d, e, k, a[l + 1], 4, -1530992060),
            k = h(k, c, d, e, a[l + 4], 11, 1272893353),
            e = h(e, k, c, d, a[l + 7], 16, -155497632),
            d = h(d, e, k, c, a[l + 10], 23, -1094730640),
            c = h(c, d, e, k, a[l + 13], 4, 681279174),
            k = h(k, c, d, e, a[l + 0], 11, -358537222),
            e = h(e, k, c, d, a[l + 3], 16, -722521979),
            d = h(d, e, k, c, a[l + 6], 23, 76029189),
            c = h(c, d, e, k, a[l + 9], 4, -640364487),
            k = h(k, c, d, e, a[l + 12], 11, -421815835),
            e = h(e, k, c, d, a[l + 15], 16, 530742520),
            d = h(d, e, k, c, a[l + 2], 23, -995338651),
            c = i(c, d, e, k, a[l + 0], 6, -198630844),
            k = i(k, c, d, e, a[l + 7], 10, 1126891415),
            e = i(e, k, c, d, a[l + 14], 15, -1416354905),
            d = i(d, e, k, c, a[l + 5], 21, -57434055),
            c = i(c, d, e, k, a[l + 12], 6, 1700485571),
            k = i(k, c, d, e, a[l + 3], 10, -1894986606),
            e = i(e, k, c, d, a[l + 10], 15, -1051523),
            d = i(d, e, k, c, a[l + 1], 21, -2054922799),
            c = i(c, d, e, k, a[l + 8], 6, 1873313359),
            k = i(k, c, d, e, a[l + 15], 10, -30611744),
            e = i(e, k, c, d, a[l + 6], 15, -1560198380),
            d = i(d, e, k, c, a[l + 13], 21, 1309151649),
            c = i(c, d, e, k, a[l + 4], 6, -145523070),
            k = i(k, c, d, e, a[l + 11], 10, -1120210379),
            e = i(e, k, c, d, a[l + 2], 15, 718787259),
            d = i(d, e, k, c, a[l + 9], 21, -343485551),
            c = j(c, m),
            d = j(d, n),
            e = j(e, o),
            k = j(k, p)
        }
        return Array(c, d, e, k)
    }
    function e(a, b, c, d, e, f) {
        return j(k(j(j(b, a), j(d, f)), e), c)
    }
    function f(a, b, c, d, f, g, h) {
        return e(b & c | ~b & d, a, b, f, g, h)
    }
    function g(a, b, c, d, f, g, h) {
        return e(b & d | c & ~d, a, b, f, g, h)
    }
    function h(a, b, c, d, f, g, h) {
        return e(b ^ c ^ d, a, b, f, g, h)
    }
    function i(a, b, c, d, f, g, h) {
        return e(c ^ (b | ~d), a, b, f, g, h)
    }
    function j(a, b) {
        var c = (65535 & a) + (65535 & b),
        d = (a >> 16) + (b >> 16) + (c >> 16);
        return d << 16 | 65535 & c
    }
    function k(a, b) {
        return a << b | a >>> 32 - b
    }
    function l(a) {
        for (var b = Array(), d = (1 << c) - 1, e = 0; e < a.length * c; e += c) b[e >> 5] |= (a.charCodeAt(e / c) & d) << e % 32;
        return b
    }
    function m(a) {
        for (var c = b ? "0123456789ABCDEF": "0123456789abcdef", d = "", e = 0; e < 4 * a.length; e++) d += c.charAt(a[e >> 2] >> e % 4 * 8 + 4 & 15) + c.charAt(a[e >> 2] >> e % 4 * 8 & 15);
        return d
    }
    export default function md5(a) {
        return m(d(l(a), a.length * c))
    }
