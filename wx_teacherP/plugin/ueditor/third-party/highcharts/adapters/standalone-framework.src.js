var HighchartsAdapter=function(){var a,b,c,d=document,e=[],f=[];Math.easeInOutSine=function(a,b,c,d){return-c/2*(Math.cos(Math.PI*a/d)-1)+b};function g(b){function c(a,b,c){a.removeEventListener(b,c,!1)}function d(a,b,c){c=a.HCProxiedMethods[c.toString()],a.detachEvent("on"+b,c)}function e(a,b){var e,f,g,h,i=a.HCEvents;if(a.removeEventListener)e=c;else{if(!a.attachEvent)return;e=d}b?(f={},f[b]=!0):f=i;for(h in f)if(i[h])for(g=i[h].length;g--;)e(a,h,i[h][g])}return b.HCExtended||Highcharts.extend(b,{HCExtended:!0,HCEvents:{},bind:function(b,c){var d,e=this,f=this.HCEvents;e.addEventListener?e.addEventListener(b,c,!1):e.attachEvent&&(d=function(a){c.call(e,a)},e.HCProxiedMethods||(e.HCProxiedMethods={}),e.HCProxiedMethods[c.toString()]=d,e.attachEvent("on"+b,d)),f[b]===a&&(f[b]=[]),f[b].push(c)},unbind:function(a,b){var f,g;a?(f=this.HCEvents[a]||[],b?(g=HighchartsAdapter.inArray(b,f),g>-1&&(f.splice(g,1),this.HCEvents[a]=f),this.removeEventListener?c(this,a,b):this.attachEvent&&d(this,a,b)):(e(this,a),this.HCEvents[a]=[])):(e(this),this.HCEvents={})},trigger:function(a,b){var c,d,e,f=this.HCEvents[a]||[],g=this,h=f.length;for(d=function(){b.defaultPrevented=!0},c=0;h>c;c++){if(e=f[c],b.stopped)return;b.preventDefault=d,b.target=g,b.type=a,e.call(this,b)===!1&&b.preventDefault()}}}),b}return{init:function(a){d.defaultView||(this._getStyle=function(a,b){var c;return a.style[b]?a.style[b]:("opacity"===b&&(b="filter"),c=a.currentStyle[b.replace(/\-(\w)/g,function(a,b){return b.toUpperCase()})],"filter"===b&&(c=c.replace(/alpha\(opacity=([0-9]+)\)/,function(a,b){return b/100})),""===c?1:c)},this.adapterRun=function(a,b){var c={width:"clientWidth",height:"clientHeight"}[b];return c?(a.style.zoom=1,a[c]-2*parseInt(HighchartsAdapter._getStyle(a,"padding"),10)):void 0}),Array.prototype.forEach||(this.each=function(a,b){for(var c=0,d=a.length;d>c;c++)if(b.call(a[c],a[c],c,a)===!1)return c}),Array.prototype.indexOf||(this.inArray=function(a,b){var c,d=0;if(b)for(c=b.length;c>d;d++)if(b[d]===a)return d;return-1}),Array.prototype.filter||(this.grep=function(a,b){for(var c=[],d=0,e=a.length;e>d;d++)b(a[d],d)&&c.push(a[d]);return c}),c=function(a,b,c){this.options=b,this.elem=a,this.prop=c},c.prototype={update:function(){var b,c=this.paths,d=this.elem,e=d.element;c&&e?d.attr("d",a.step(c[0],c[1],this.now,this.toD)):d.attr?e&&d.attr(this.prop,this.now):(b={},b[d]=this.now+this.unit,Highcharts.css(d,b)),this.options.step&&this.options.step.call(this.elem,this.now,this)},custom:function(a,c,d){var e,g=this,h=function(a){return g.step(a)};this.startTime=+new Date,this.start=a,this.end=c,this.unit=d,this.now=this.start,this.pos=this.state=0,h.elem=this.elem,h()&&1===f.push(h)&&(b=setInterval(function(){for(e=0;e<f.length;e++)f[e]()||f.splice(e--,1);f.length||clearInterval(b)},13))},step:function(a){var b,c,d,e=+new Date,f=this.options;if(this.elem.stopAnimation)b=!1;else if(a||e>=f.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),this.options.curAnim[this.prop]=!0,c=!0;for(d in f.curAnim)f.curAnim[d]!==!0&&(c=!1);c&&f.complete&&f.complete.call(this.elem),b=!1}else{var g=e-this.startTime;this.state=g/f.duration,this.pos=f.easing(g,0,1,f.duration),this.now=this.start+(this.end-this.start)*this.pos,this.update(),b=!0}return b}},this.animate=function(b,d,e){var f,g,h,i,j,k="";b.stopAnimation=!1,("object"!=typeof e||null===e)&&(i=arguments,e={duration:i[2],easing:i[3],complete:i[4]}),"number"!=typeof e.duration&&(e.duration=400),e.easing=Math[e.easing]||Math.easeInOutSine,e.curAnim=Highcharts.extend({},d);for(j in d)h=new c(b,e,j),g=null,"d"===j?(h.paths=a.init(b,b.d,d.d),h.toD=d.d,f=0,g=1):b.attr?f=b.attr(j):(f=parseFloat(HighchartsAdapter._getStyle(b,j))||0,"opacity"!==j&&(k="px")),g||(g=parseFloat(d[j])),h.custom(f,g,k)}},_getStyle:function(a,b){return window.getComputedStyle(a).getPropertyValue(b)},getScript:function(a,b){var c=d.getElementsByTagName("head")[0],e=d.createElement("script");e.type="text/javascript",e.src=a,e.onload=b,c.appendChild(e)},inArray:function(a,b){return b.indexOf?b.indexOf(a):e.indexOf.call(b,a)},adapterRun:function(a,b){return parseInt(HighchartsAdapter._getStyle(a,b),10)},grep:function(a,b){return e.filter.call(a,b)},map:function(a,b){for(var c=[],d=0,e=a.length;e>d;d++)c[d]=b.call(a[d],a[d],d,a);return c},offset:function(a){for(var b=0,c=0;a;)b+=a.offsetLeft,c+=a.offsetTop,a=a.offsetParent;return{left:b,top:c}},addEvent:function(a,b,c){g(a).bind(b,c)},removeEvent:function(a,b,c){g(a).unbind(b,c)},fireEvent:function(a,b,c,e){var f;d.createEvent&&(a.dispatchEvent||a.fireEvent)?(f=d.createEvent("Events"),f.initEvent(b,!0,!0),f.target=a,Highcharts.extend(f,c),a.dispatchEvent?a.dispatchEvent(f):a.fireEvent(b,f)):a.HCExtended===!0&&(c=c||{},a.trigger(b,c)),c&&c.defaultPrevented&&(e=null),e&&e(c)},washMouseEvent:function(a){return a},stop:function(a){a.stopAnimation=!0},each:function(a,b){return Array.prototype.forEach.call(a,b)}}}();