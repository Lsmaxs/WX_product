!function(a,b){"function"==typeof define&&define.cmd?define(function(require,exports,module){module.exports=b()}):"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b():a.BASE64=b()}(window,function(){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function b(a){for(var b=new Array,c=0,d=a.length;d>c;c++){var e=a.charCodeAt(c);128>e?b.push(e):e>=128&&2047>=e?(b.push(e>>6|192),b.push(63&e|128)):e>=2048&&65535>=e&&(b.push(e>>12&15|224),b.push(e>>6&63|128),b.push(63&e|128))}return b}function c(b){var c=b.replace(/==$/,"AA");c=c.replace(/=$/,"A");for(var d=0,e=0,f=0,g=0,h=0,i=new Array,j=0,k=c.length;k>j;j+=4)d=a.indexOf(c[j]),e=a.indexOf(c[j+1]),f=a.indexOf(c[j+2]),g=a.indexOf(c[j+3]),h=(d<<18)+(e<<12)+(f<<6)+g,i.push(h>>16),i.push(h>>8&255),i.push(255&h);return/==$/.test(b)?(i.pop(),i.pop()):/=$/.test(b)&&i.pop(),i}var d={encode:function(c){var d=b(c),e=d.length%3;1==e?d.push(0,0):2==e&&d.push(0);for(var f,g=new Array,h=0,i=d.length;i>h;h+=3)f=(d[h]<<16)+(d[h+1]<<8)+d[h+2],g.push(a.charAt(f>>18)),g.push(a.charAt(f>>12&63)),g.push(a.charAt(f>>6&63)),g.push(a.charAt(63&f));var j=g.join("");return 1==e&&(j=j.replace(/AA$/,"==")),2==e&&(j=j.replace(/A$/,"=")),j},decode:function(a){for(var b,d,e=c(a),f=new Array,g=0,h=e.length;h>g;g++)b=e[g],b>=224?(d=((15&e[g])<<12)+((63&e[g+1])<<6)+(63&e[g+2]),g+=2):b>=192?(d=((31&e[g])<<6)+(63&e[g+2]),g+=1):128>=b&&(d=127&e[g]),f.push(String.fromCharCode(d));return f.join("")}};return d});