var HighchartsAdapter=function(){var a="undefined"!=typeof Effect;return{init:function(b){a&&(Effect.HighchartsTransition=Class.create(Effect.Base,{initialize:function(a,c,d,e){var f,g;this.element=a,this.key=c,f=a.attr?a.attr(c):$(a).getStyle(c),"d"===c&&(this.paths=b.init(a,a.d,d),this.toD=d,f=0,d=1),g=Object.extend(e||{},{from:f,to:d,attribute:c}),this.start(g)},setup:function(){HighchartsAdapter._extend(this.element),this.element._highchart_animation||(this.element._highchart_animation={}),this.element._highchart_animation[this.key]=this},update:function(a){var c,d=this.paths,e=this.element;d&&(a=b.step(d[0],d[1],a,this.toD)),e.attr?e.element&&e.attr(this.options.attribute,a):(c={},c[this.options.attribute]=a,$(e).setStyle(c))},finish:function(){this.element&&this.element._highchart_animation&&delete this.element._highchart_animation[this.key]}}))},adapterRun:function(a,b){return parseInt($(a).getStyle(b),10)},getScript:function(a,b){var c=$$("head")[0];c&&c.appendChild(new Element("script",{type:"text/javascript",src:a}).observe("load",b))},addNS:function(a){var b=/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,c=/^(?:click|mouse(?:down|up|over|move|out))$/;return b.test(a)||c.test(a)?a:"h:"+a},addEvent:function(a,b,c){a.addEventListener||a.attachEvent?Event.observe($(a),HighchartsAdapter.addNS(b),c):(HighchartsAdapter._extend(a),a._highcharts_observe(b,c))},animate:function(b,c,d){var e,f;if(d=d||{},d.delay=0,d.duration=(d.duration||500)/1e3,d.afterFinish=d.complete,a)for(e in c)f=new Effect.HighchartsTransition($(b),e,c[e],d);else{if(b.attr)for(e in c)b.attr(e,c[e]);d.complete&&d.complete()}b.attr||$(b).setStyle(c)},stop:function(a){var b;if(a._highcharts_extended&&a._highchart_animation)for(b in a._highchart_animation)a._highchart_animation[b].cancel()},each:function(a,b){$A(a).each(b)},inArray:function(a,b,c){return b?b.indexOf(a,c):-1},offset:function(a){return $(a).cumulativeOffset()},fireEvent:function(a,b,c,d){a.fire?a.fire(HighchartsAdapter.addNS(b),c):a._highcharts_extended&&(c=c||{},a._highcharts_fire(b,c)),c&&c.defaultPrevented&&(d=null),d&&d(c)},removeEvent:function(a,b,c){$(a).stopObserving&&(b&&(b=HighchartsAdapter.addNS(b)),$(a).stopObserving(b,c)),window===a?Event.stopObserving(a,b,c):(HighchartsAdapter._extend(a),a._highcharts_stop_observing(b,c))},washMouseEvent:function(a){return a},grep:function(a,b){return a.findAll(b)},map:function(a,b){return a.map(b)},_extend:function(a){a._highcharts_extended||Object.extend(a,{_highchart_events:{},_highchart_animation:null,_highcharts_extended:!0,_highcharts_observe:function(a,b){this._highchart_events[a]=[this._highchart_events[a],b].compact().flatten()},_highcharts_stop_observing:function(a,b){a?b?this._highchart_events[a]=[this._highchart_events[a]].compact().flatten().without(b):delete this._highchart_events[a]:this._highchart_events={}},_highcharts_fire:function(a,b){var c=this;(this._highchart_events[a]||[]).each(function(a){b.stopped||(b.preventDefault=function(){b.defaultPrevented=!0},b.target=c,a.bind(this)(b)===!1&&b.preventDefault())}.bind(this))}})}}}();