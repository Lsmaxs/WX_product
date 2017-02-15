!function(a,b){var c=a.arrayMin,d=a.arrayMax,e=a.each,f=a.extend,g=a.merge,h=a.map,i=a.pick,j=a.pInt,k=a.getOptions().plotOptions,l=a.seriesTypes,m=a.extendClass,n=a.splat,o=a.wrap,p=a.Axis,q=a.Tick,r=a.Series,s=l.column.prototype,t=Math,u=t.round,v=t.floor,w=t.max,x=function(){};function y(a,b,c){this.init.call(this,a,b,c)}f(y.prototype,{init:function(a,b,c){var d,f=this,h=f.defaultOptions;f.chart=b,b.angular&&(h.background={}),f.options=a=g(h,a),d=a.background,d&&e([].concat(n(d)).reverse(),function(a){var b=a.backgroundColor;a=g(f.defaultBackgroundOptions,a),b&&(a.backgroundColor=b),a.color=a.backgroundColor,c.options.plotBands.unshift(a)})},defaultOptions:{center:["50%","50%"],size:"85%",startAngle:0},defaultBackgroundOptions:{shape:"circle",borderWidth:1,borderColor:"silver",backgroundColor:{linearGradient:{x1:0,y1:0,x2:0,y2:1},stops:[[0,"#FFF"],[1,"#DDD"]]},from:Number.MIN_VALUE,innerRadius:0,to:Number.MAX_VALUE,outerRadius:"105%"}});var z=p.prototype,A=q.prototype,B={getOffset:x,redraw:function(){this.isDirty=!1},render:function(){this.isDirty=!1},setScale:x,setCategories:x,setTitle:x},C={isRadial:!0,defaultRadialGaugeOptions:{labels:{align:"center",x:0,y:null},minorGridLineWidth:0,minorTickInterval:"auto",minorTickLength:10,minorTickPosition:"inside",minorTickWidth:1,plotBands:[],tickLength:10,tickPosition:"inside",tickWidth:2,title:{rotation:0},zIndex:2},defaultRadialXOptions:{gridLineWidth:1,labels:{align:null,distance:15,x:0,y:null},maxPadding:0,minPadding:0,plotBands:[],showLastLabel:!1,tickLength:0},defaultRadialYOptions:{gridLineInterpolation:"circle",labels:{align:"right",x:-3,y:-2},plotBands:[],showLastLabel:!1,title:{x:4,text:null,rotation:90}},setOptions:function(a){this.options=g(this.defaultOptions,this.defaultRadialOptions,a)},getOffset:function(){z.getOffset.call(this),this.chart.axisOffset[this.side]=0},getLinePath:function(a,b){var c=this.center;return b=i(b,c[2]/2-this.offset),this.chart.renderer.symbols.arc(this.left+c[0],this.top+c[1],b,b,{start:this.startAngleRad,end:this.endAngleRad,open:!0,innerR:0})},setAxisTranslation:function(){z.setAxisTranslation.call(this),this.center&&(this.isCircular?this.transA=(this.endAngleRad-this.startAngleRad)/(this.max-this.min||1):this.transA=this.center[2]/2/(this.max-this.min||1),this.isXAxis&&(this.minPixelPadding=this.transA*this.minPointOffset+(this.reversed?(this.endAngleRad-this.startAngleRad)/4:0)))},beforeSetTickPositions:function(){this.autoConnect&&(this.max+=this.categories&&1||this.pointRange||this.closestPointRange||0)},setAxisSize:function(){z.setAxisSize.call(this),this.isRadial&&(this.center=this.pane.center=l.pie.prototype.getCenter.call(this.pane),this.len=this.width=this.height=this.isCircular?this.center[2]*(this.endAngleRad-this.startAngleRad)/2:this.center[2]/2)},getPosition:function(a,b){return this.isCircular||(b=this.translate(a),a=this.min),this.postTranslate(this.translate(a),i(b,this.center[2]/2)-this.offset)},postTranslate:function(a,b){var c=this.chart,d=this.center;return a=this.startAngleRad+a,{x:c.plotLeft+d[0]+Math.cos(a)*b,y:c.plotTop+d[1]+Math.sin(a)*b}},getPlotBandPath:function(a,b,c){var d,e,f,g,k=this.center,l=this.startAngleRad,m=k[2]/2,n=[i(c.outerRadius,"100%"),c.innerRadius,i(c.thickness,10)],o=/%$/,p=this.isCircular;return"polygon"===this.options.gridLineInterpolation?g=this.getPlotLinePath(a).concat(this.getPlotLinePath(b,!0)):(p||(n[0]=this.translate(a),n[1]=this.translate(b)),n=h(n,function(a){return o.test(a)&&(a=j(a,10)*m/100),a}),"circle"!==c.shape&&p?(d=l+this.translate(a),e=l+this.translate(b)):(d=-Math.PI/2,e=1.5*Math.PI,f=!0),g=this.chart.renderer.symbols.arc(this.left+k[0],this.top+k[1],n[0],n[0],{start:d,end:e,innerR:i(n[1],n[0]-n[2]),open:f})),g},getPlotLinePath:function(a,b){var c,d,f,g,h=this,i=h.center,j=h.chart,k=h.getPosition(a);return h.isCircular?g=["M",i[0]+j.plotLeft,i[1]+j.plotTop,"L",k.x,k.y]:"circle"===h.options.gridLineInterpolation?(a=h.translate(a),a&&(g=h.getLinePath(0,a))):(c=j.xAxis[0],g=[],a=h.translate(a),f=c.tickPositions,c.autoConnect&&(f=f.concat([f[0]])),b&&(f=[].concat(f).reverse()),e(f,function(b,e){d=c.getPosition(b,a),g.push(e?"L":"M",d.x,d.y)})),g},getTitlePosition:function(){var a=this.center,b=this.chart,c=this.options.title;return{x:b.plotLeft+a[0]+(c.x||0),y:b.plotTop+a[1]-{high:.5,middle:.25,low:0}[c.align]*a[2]+(c.y||0)}}};o(z,"init",function(a,c,d){var e,h,j,k,l,m,o=this,p=c.angular,q=c.polar,r=d.isX,s=p&&r,t=c.options,u=d.pane||0;p?(f(this,s?B:C),e=!r,e&&(this.defaultRadialOptions=this.defaultRadialGaugeOptions)):q&&(f(this,C),e=r,this.defaultRadialOptions=r?this.defaultRadialXOptions:g(this.defaultYAxisOptions,this.defaultRadialYOptions)),a.call(this,c,d),s||!p&&!q||(k=this.options,c.panes||(c.panes=[]),this.pane=l=c.panes[u]=c.panes[u]||new y(n(t.pane)[u],c,o),m=l.options,c.inverted=!1,t.chart.zoomType=null,this.startAngleRad=h=(m.startAngle-90)*Math.PI/180,this.endAngleRad=j=(i(m.endAngle,m.startAngle+360)-90)*Math.PI/180,this.offset=k.offset||0,this.isCircular=e,e&&d.max===b&&j-h===2*Math.PI&&(this.autoConnect=!0))}),o(A,"getPosition",function(a,b,c,d,e){var f=this.axis;return f.getPosition?f.getPosition(c):a.call(this,b,c,d,e)}),o(A,"getLabelPosition",function(a,b,c,d,e,f,g,h,k){var l,m=this.axis,n=f.y,o=f.align,p=(m.translate(this.pos)+m.startAngleRad+Math.PI/2)/Math.PI*180%360;return m.isRadial?(l=m.getPosition(this.pos,m.center[2]/2+i(f.distance,-25)),"auto"===f.rotation?d.attr({rotation:p}):null===n&&(n=.9*j(d.styles.lineHeight)-d.getBBox().height/2),null===o&&(o=m.isCircular?p>20&&160>p?"left":p>200&&340>p?"right":"center":"center",d.attr({align:o})),l.x+=f.x,l.y+=n):l=a.call(this,b,c,d,e,f,g,h,k),l}),o(A,"getMarkPath",function(a,b,c,d,e,f,g){var h,i,j=this.axis;return j.isRadial?(h=j.getPosition(this.pos,j.center[2]/2+d),i=["M",b,c,"L",h.x,h.y]):i=a.call(this,b,c,d,e,f,g),i}),k.arearange=g(k.area,{lineWidth:1,marker:null,threshold:null,tooltip:{pointFormat:'<span style="color:{series.color}">{series.name}</span>: <b>{point.low}</b> - <b>{point.high}</b><br/>'},trackByArea:!0,dataLabels:{verticalAlign:null,xLow:0,xHigh:0,yLow:0,yHigh:0}}),l.arearange=a.extendClass(l.area,{type:"arearange",pointArrayMap:["low","high"],toYData:function(a){return[a.low,a.high]},pointValKey:"low",getSegments:function(){var a=this;e(a.points,function(b){a.options.connectNulls||null!==b.low&&null!==b.high?null===b.low&&null!==b.high&&(b.y=b.high):b.y=null}),r.prototype.getSegments.call(this)},translate:function(){var a=this,b=a.yAxis;l.area.prototype.translate.apply(a),e(a.points,function(a){var c=a.low,d=a.high,e=a.plotY;null===d&&null===c?a.y=null:null===c?(a.plotLow=a.plotY=null,a.plotHigh=b.translate(d,0,1,0,1)):null===d?(a.plotLow=e,a.plotHigh=null):(a.plotLow=e,a.plotHigh=b.translate(d,0,1,0,1))})},getSegmentPath:function(a){var b,c,d,e,f,g=[],h=a.length,i=r.prototype.getSegmentPath,j=this.options,k=j.step;for(b=HighchartsAdapter.grep(a,function(a){return null!==a.plotLow});h--;)c=a[h],null!==c.plotHigh&&g.push({plotX:c.plotX,plotY:c.plotHigh});return e=i.call(this,b),k&&(k===!0&&(k="left"),j.step={left:"right",center:"center",right:"left"}[k]),f=i.call(this,g),j.step=k,d=[].concat(e,f),f[0]="L",this.areaPath=this.areaPath.concat(e,f),d},drawDataLabels:function(){var a,b,c=this.data,d=c.length,e=[],f=r.prototype,g=this.options.dataLabels,h=this.chart.inverted;if(g.enabled||this._hasPointLabels){for(a=d;a--;)b=c[a],b.y=b.high,b.plotY=b.plotHigh,e[a]=b.dataLabel,b.dataLabel=b.dataLabelUpper,b.below=!1,h?(g.align="left",g.x=g.xHigh):g.y=g.yHigh;for(f.drawDataLabels.apply(this,arguments),a=d;a--;)b=c[a],b.dataLabelUpper=b.dataLabel,b.dataLabel=e[a],b.y=b.low,b.plotY=b.plotLow,b.below=!0,h?(g.align="right",g.x=g.xLow):g.y=g.yLow;f.drawDataLabels.apply(this,arguments)}},alignDataLabel:l.column.prototype.alignDataLabel,getSymbol:l.column.prototype.getSymbol,drawPoints:x}),k.areasplinerange=g(k.arearange),l.areasplinerange=m(l.arearange,{type:"areasplinerange",getPointSpline:l.spline.prototype.getPointSpline}),k.columnrange=g(k.column,k.arearange,{lineWidth:1,pointRange:null}),l.columnrange=m(l.arearange,{type:"columnrange",translate:function(){var a,b=this,c=b.yAxis;s.translate.apply(b),e(b.points,function(d){var e,f,g,h=d.shapeArgs,i=b.options.minPointLength;d.plotHigh=a=c.translate(d.high,0,1,0,1),d.plotLow=d.plotY,g=a,f=d.plotY-a,i>f&&(e=i-f,f+=e,g-=e/2),h.height=f,h.y=g})},trackerGroups:["group","dataLabels"],drawGraph:x,pointAttrToOptions:s.pointAttrToOptions,drawPoints:s.drawPoints,drawTracker:s.drawTracker,animate:s.animate,getColumnMetrics:s.getColumnMetrics}),k.gauge=g(k.line,{dataLabels:{enabled:!0,y:15,borderWidth:1,borderColor:"silver",borderRadius:3,style:{fontWeight:"bold"},verticalAlign:"top",zIndex:2},dial:{},pivot:{},tooltip:{headerFormat:""},showInLegend:!1});var D=a.extendClass(a.Point,{setState:function(a){this.state=a}}),E={type:"gauge",pointClass:D,angular:!0,drawGraph:x,fixedBox:!0,trackerGroups:["group","dataLabels"],translate:function(){var a=this,b=a.yAxis,c=a.options,d=b.center;a.generatePoints(),e(a.points,function(a){var e=g(c.dial,a.dial),f=j(i(e.radius,80))*d[2]/200,h=j(i(e.baseLength,70))*f/100,k=j(i(e.rearLength,10))*f/100,l=e.baseWidth||3,m=e.topWidth||1,n=b.startAngleRad+b.translate(a.y,null,null,null,!0);c.wrap===!1&&(n=Math.max(b.startAngleRad,Math.min(b.endAngleRad,n))),n=180*n/Math.PI,a.shapeType="path",a.shapeArgs={d:e.path||["M",-k,-l/2,"L",h,-l/2,f,-m/2,f,m/2,h,l/2,-k,l/2,"z"],translateX:d[0],translateY:d[1],rotation:n},a.plotX=d[0],a.plotY=d[1]})},drawPoints:function(){var a=this,b=a.yAxis.center,c=a.pivot,d=a.options,f=d.pivot,h=a.chart.renderer;e(a.points,function(b){var c=b.graphic,e=b.shapeArgs,f=e.d,i=g(d.dial,b.dial);c?(c.animate(e),e.d=f):b.graphic=h[b.shapeType](e).attr({stroke:i.borderColor||"none","stroke-width":i.borderWidth||0,fill:i.backgroundColor||"black",rotation:e.rotation}).add(a.group)}),c?c.animate({translateX:b[0],translateY:b[1]}):a.pivot=h.circle(0,0,i(f.radius,5)).attr({"stroke-width":f.borderWidth||0,stroke:f.borderColor||"silver",fill:f.backgroundColor||"black"}).translate(b[0],b[1]).add(a.group)},animate:function(a){var b=this;a||(e(b.points,function(a){var c=a.graphic;c&&(c.attr({rotation:180*b.yAxis.startAngleRad/Math.PI}),c.animate({rotation:a.shapeArgs.rotation},b.options.animation))}),b.animate=null)},render:function(){this.group=this.plotGroup("group","series",this.visible?"visible":"hidden",this.options.zIndex,this.chart.seriesGroup),l.pie.prototype.render.call(this),this.group.clip(this.chart.clipRect)},setData:l.pie.prototype.setData,drawTracker:l.column.prototype.drawTracker};l.gauge=a.extendClass(l.line,E),k.boxplot=g(k.column,{fillColor:"#FFFFFF",lineWidth:1,medianWidth:2,states:{hover:{brightness:-.3}},threshold:null,tooltip:{pointFormat:'<span style="color:{series.color};font-weight:bold">{series.name}</span><br/>Maximum: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Minimum: {point.low}<br/>'},whiskerLength:"50%",whiskerWidth:2}),l.boxplot=m(l.column,{type:"boxplot",pointArrayMap:["low","q1","median","q3","high"],toYData:function(a){return[a.low,a.q1,a.median,a.q3,a.high]},pointValKey:"high",pointAttrToOptions:{fill:"fillColor",stroke:"color","stroke-width":"lineWidth"},drawDataLabels:x,translate:function(){var a=this,b=a.yAxis,c=a.pointArrayMap;l.column.prototype.translate.apply(a),e(a.points,function(a){e(c,function(c){null!==a[c]&&(a[c+"Plot"]=b.translate(a[c],0,1,0,1))})})},drawPoints:function(){var a,c,d,f,g,h,j,k,l,m,n,o,p,q,r,s,t,w,x,y,z,A,B=this,C=B.points,D=B.options,E=B.chart,F=E.renderer,G=B.doQuartiles!==!1,H=parseInt(B.options.whiskerLength,10)/100;e(C,function(e){l=e.graphic,z=e.shapeArgs,n={},q={},s={},A=e.color||B.color,e.plotY!==b&&(a=e.pointAttr[e.selected?"selected":""],t=z.width,w=v(z.x),x=w+t,y=u(t/2),c=v(G?e.q1Plot:e.lowPlot),d=v(G?e.q3Plot:e.lowPlot),f=v(e.highPlot),g=v(e.lowPlot),n.stroke=e.stemColor||D.stemColor||A,n["stroke-width"]=i(e.stemWidth,D.stemWidth,D.lineWidth),n.dashstyle=e.stemDashStyle||D.stemDashStyle,q.stroke=e.whiskerColor||D.whiskerColor||A,q["stroke-width"]=i(e.whiskerWidth,D.whiskerWidth,D.lineWidth),s.stroke=e.medianColor||D.medianColor||A,s["stroke-width"]=i(e.medianWidth,D.medianWidth,D.lineWidth),j=n["stroke-width"]%2/2,k=w+y+j,m=["M",k,d,"L",k,f,"M",k,c,"L",k,g,"z"],G&&(j=a["stroke-width"]%2/2,k=v(k)+j,c=v(c)+j,d=v(d)+j,w+=j,x+=j,o=["M",w,d,"L",w,c,"L",x,c,"L",x,d,"L",w,d,"z"]),H&&(j=q["stroke-width"]%2/2,f+=j,g+=j,p=["M",k-y*H,f,"L",k+y*H,f,"M",k-y*H,g,"L",k+y*H,g]),j=s["stroke-width"]%2/2,h=u(e.medianPlot)+j,r=["M",w,h,"L",x,h,"z"],l?(e.stem.animate({d:m}),H&&e.whiskers.animate({d:p}),G&&e.box.animate({d:o}),e.medianShape.animate({d:r})):(e.graphic=l=F.g().add(B.group),e.stem=F.path(m).attr(n).add(l),H&&(e.whiskers=F.path(p).attr(q).add(l)),G&&(e.box=F.path(o).attr(a).add(l)),e.medianShape=F.path(r).attr(s).add(l)))})}}),k.errorbar=g(k.boxplot,{color:"#000000",grouping:!1,linkedTo:":previous",tooltip:{pointFormat:k.arearange.tooltip.pointFormat},whiskerWidth:null}),l.errorbar=m(l.boxplot,{type:"errorbar",pointArrayMap:["low","high"],toYData:function(a){return[a.low,a.high]},pointValKey:"high",doQuartiles:!1,getColumnMetrics:function(){return this.linkedParent&&this.linkedParent.columnMetrics||l.column.prototype.getColumnMetrics.call(this)}}),k.waterfall=g(k.column,{lineWidth:1,lineColor:"#333",dashStyle:"dot",borderColor:"#333"}),l.waterfall=m(l.column,{type:"waterfall",upColorProp:"fill",pointArrayMap:["low","y"],pointValKey:"y",init:function(a,b){b.stacking=!0,l.column.prototype.init.call(this,a,b)},translate:function(){var a,b,c,d,e,f,g,h,i,j=this,k=j.options,m=j.yAxis,n=k.threshold,o=k.borderWidth%2/2;for(l.column.prototype.translate.apply(this),h=n,c=j.points,b=0,a=c.length;a>b;b++)d=c[b],e=d.shapeArgs,f=j.getStack(b),i=f.points[j.index],isNaN(d.y)&&(d.y=j.yData[b]),g=w(h,h+d.y)+i[0],e.y=m.translate(g,0,1),d.isSum||d.isIntermediateSum?(e.y=m.translate(i[1],0,1),e.height=m.translate(i[0],0,1)-e.y):h+=f.total,e.height<0&&(e.y+=e.height,e.height*=-1),d.plotY=e.y=u(e.y)-o,e.height=u(e.height),d.yBottom=e.y+e.height},processData:function(a){var b,c,d,e,f,g,h,i=this,j=i.options,k=i.yData,l=i.points,m=k.length,n=j.threshold||0;for(d=c=e=f=n,h=0;m>h;h++)g=k[h],b=l&&l[h]?l[h]:{},"sum"===g||b.isSum?k[h]=d:"intermediateSum"===g||b.isIntermediateSum?(k[h]=c,c=n):(d+=g,c+=g),e=Math.min(d,e),f=Math.max(d,f);r.prototype.processData.call(this,a),i.dataMin=e,i.dataMax=f},toYData:function(a){return a.isSum?"sum":a.isIntermediateSum?"intermediateSum":a.y},getAttribs:function(){l.column.prototype.getAttribs.apply(this,arguments);var b=this,c=b.options,d=c.states,f=c.upColor||b.color,h=a.Color(f).brighten(.1).get(),i=g(b.pointAttr),j=b.upColorProp;i[""][j]=f,i.hover[j]=d.hover.upColor||h,i.select[j]=d.select.upColor||f,e(b.points,function(a){a.y>0&&!a.color&&(a.pointAttr=i,a.color=f)})},getGraphPath:function(){var a,b,c,d,e=this.data,f=e.length,g=this.options.lineWidth+this.options.borderWidth,h=u(g)%2/2,i=[],j="M",k="L";for(c=1;f>c;c++)b=e[c].shapeArgs,a=e[c-1].shapeArgs,d=[j,a.x+a.width,a.y+h,k,b.x,a.y+h],e[c-1].y<0&&(d[2]+=a.height,d[5]+=a.height),i=i.concat(d);return i},getExtremes:x,getStack:function(a){var b=this.yAxis,c=b.stacks,d=this.stackKey;return this.processedYData[a]<this.options.threshold&&(d="-"+d),c[d][a]},drawGraph:r.prototype.drawGraph}),k.bubble=g(k.scatter,{dataLabels:{inside:!0,style:{color:"white",textShadow:"0px 0px 3px black"},verticalAlign:"middle"},marker:{lineColor:null,lineWidth:1},minSize:8,maxSize:"20%",tooltip:{pointFormat:"({point.x}, {point.y}), Size: {point.z}"},turboThreshold:0,zThreshold:0}),l.bubble=m(l.scatter,{type:"bubble",pointArrayMap:["y","z"],trackerGroups:["group","dataLabelsGroup"],pointAttrToOptions:{stroke:"lineColor","stroke-width":"lineWidth",fill:"fillColor"},applyOpacity:function(b){var c=this.options.marker,d=i(c.fillOpacity,.5);return b=b||c.fillColor||this.color,1!==d&&(b=a.Color(b).setOpacity(d).get("rgba")),b},convertAttribs:function(){var a=r.prototype.convertAttribs.apply(this,arguments);return a.fill=this.applyOpacity(a.fill),a},getRadii:function(a,b,c,d){var e,f,g,h,i=this.zData,j=[];for(f=0,e=i.length;e>f;f++)h=b-a,g=h>0?(i[f]-a)/(b-a):.5,j.push(t.ceil(c+g*(d-c))/2);this.radii=j},animate:function(a){var b=this.options.animation;a||(e(this.points,function(a){var c=a.graphic,d=a.shapeArgs;c&&d&&(c.attr("r",1),c.animate({r:d.r},b))}),this.animate=null)},translate:function(){var a,c,d,e=this.data,f=this.radii;for(l.scatter.prototype.translate.call(this),a=e.length;a--;)c=e[a],d=f?f[a]:0,c.negative=c.z<(this.options.zThreshold||0),d>=this.minPxSize/2?(c.shapeType="circle",c.shapeArgs={x:c.plotX,y:c.plotY,r:d},c.dlBox={x:c.plotX-d,y:c.plotY-d,width:2*d,height:2*d}):c.shapeArgs=c.plotY=c.dlBox=b},drawLegendSymbol:function(a,b){var c=j(a.itemStyle.fontSize)/2;b.legendSymbol=this.chart.renderer.circle(c,a.baseline-c,c).attr({zIndex:3}).add(b.legendGroup),b.legendSymbol.isMarker=!0},drawPoints:l.column.prototype.drawPoints,alignDataLabel:l.column.prototype.alignDataLabel}),p.prototype.beforePadding=function(){var a=this,f=this.len,g=this.chart,h=0,k=f,l=this.isXAxis,m=l?"xData":"yData",n=this.min,o={},p=t.min(g.plotWidth,g.plotHeight),q=Number.MAX_VALUE,r=-Number.MAX_VALUE,s=this.max-n,u=f/s,v=[];this.tickPositions&&(e(this.series,function(b){var f,g=b.options;"bubble"===b.type&&b.visible&&(a.allowZoomOutside=!0,v.push(b),l&&(e(["minSize","maxSize"],function(a){var b=g[a],c=/%$/.test(b);b=j(b),o[a]=c?p*b/100:b}),b.minPxSize=o.minSize,f=b.zData,f.length&&(q=t.min(q,t.max(c(f),g.displayNegative===!1?g.zThreshold:-Number.MAX_VALUE)),r=t.max(r,d(f)))))}),e(v,function(a){var b,c=a[m],d=c.length;if(l&&a.getRadii(q,r,o.minSize,o.maxSize),s>0)for(;d--;)b=a.radii[d],h=Math.min((c[d]-n)*u-b,h),k=Math.max((c[d]-n)*u+b,k)}),v.length&&s>0&&i(this.options.min,this.userMin)===b&&i(this.options.max,this.userMax)===b&&(k-=f,u*=(f+h-k)/f,this.min+=h/u,this.max+=k/u))};var F=r.prototype,G=a.Pointer.prototype;F.toXY=function(a){var b,c=this.chart,d=a.plotX,e=a.plotY;a.rectPlotX=d,a.rectPlotY=e,a.clientX=(d/Math.PI*180+this.xAxis.pane.options.startAngle)%360,b=this.xAxis.postTranslate(a.plotX,this.yAxis.len-e),a.plotX=a.polarPlotX=b.x-c.plotLeft,a.plotY=a.polarPlotY=b.y-c.plotTop},F.orderTooltipPoints=function(a){this.chart.polar&&(a.sort(function(a,b){return a.clientX-b.clientX}),a[0]&&(a[0].wrappedClientX=a[0].clientX+360,a.push(a[0])))};function H(a,b,c){a.call(this,b,c),this.chart.polar&&(this.closeSegment=function(a){var b=this.xAxis.center;a.push("L",b[0],b[1])},this.closedStacks=!0)}o(l.area.prototype,"init",H),o(l.areaspline.prototype,"init",H),o(l.spline.prototype,"getPointSpline",function(a,b,c,d){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w=1.5,x=w+1;return this.chart.polar?(f=c.plotX,g=c.plotY,h=b[d-1],i=b[d+1],this.connectEnds&&(h||(h=b[b.length-2]),i||(i=b[1])),h&&i&&(j=h.plotX,k=h.plotY,l=i.plotX,m=i.plotY,n=(w*f+j)/x,o=(w*g+k)/x,p=(w*f+l)/x,q=(w*g+m)/x,r=Math.sqrt(Math.pow(n-f,2)+Math.pow(o-g,2)),s=Math.sqrt(Math.pow(p-f,2)+Math.pow(q-g,2)),t=Math.atan2(o-g,n-f),u=Math.atan2(q-g,p-f),v=Math.PI/2+(t+u)/2,Math.abs(t-v)>Math.PI/2&&(v-=Math.PI),n=f+Math.cos(v)*r,o=g+Math.sin(v)*r,p=f+Math.cos(Math.PI+v)*s,q=g+Math.sin(Math.PI+v)*s,c.rightContX=p,c.rightContY=q),d?(e=["C",h.rightContX||h.plotX,h.rightContY||h.plotY,n||f,o||g,f,g],h.rightContX=h.rightContY=null):e=["M",f,g]):e=a.call(this,b,c,d),e}),o(F,"translate",function(a){if(a.call(this),this.chart.polar&&!this.preventPostTranslate)for(var b=this.points,c=b.length;c--;)this.toXY(b[c])}),o(F,"getSegmentPath",function(a,b){var c=this.points;return this.chart.polar&&this.options.connectEnds!==!1&&b[b.length-1]===c[c.length-1]&&null!==c[0].y&&(this.connectEnds=!0,b=[].concat(b,[c[0]])),a.call(this,b)});function I(a,b){var c,d=this.chart,e=this.options.animation,f=this.group,g=this.markerGroup,h=this.xAxis.center,i=d.plotLeft,j=d.plotTop;d.polar?d.renderer.isSVG&&(e===!0&&(e={}),b?(c={translateX:h[0]+i,translateY:h[1]+j,scaleX:.001,scaleY:.001},f.attr(c),g&&(g.attrSetters=f.attrSetters,g.attr(c))):(c={translateX:i,translateY:j,scaleX:1,scaleY:1},f.animate(c,e),g&&g.animate(c,e),this.animate=null)):a.call(this,b)}o(F,"animate",I),o(s,"animate",I),o(F,"setTooltipPoints",function(a,b){return this.chart.polar&&f(this.xAxis,{tooltipLen:360}),a.call(this,b)}),o(s,"translate",function(a){var b,c,d,e,f=this.xAxis,g=this.yAxis.len,h=f.center,j=f.startAngleRad,k=this.chart.renderer;if(this.preventPostTranslate=!0,a.call(this),f.isRadial)for(c=this.points,e=c.length;e--;)d=c[e],b=d.barX+j,d.shapeType="path",d.shapeArgs={d:k.symbols.arc(h[0],h[1],g-d.plotY,null,{start:b,end:b+d.pointWidth,innerR:g-i(d.yBottom,g)})},this.toXY(d)}),o(s,"alignDataLabel",function(a,b,c,d,e,f){if(this.chart.polar){var g,h,i=b.rectPlotX/Math.PI*180;null===d.align&&(g=i>20&&160>i?"left":i>200&&340>i?"right":"center",d.align=g),null===d.verticalAlign&&(h=45>i||i>315?"bottom":i>135&&225>i?"top":"middle",d.verticalAlign=h),F.alignDataLabel.call(this,b,c,d,e,f)}else a.call(this,b,c,d,e,f)}),o(G,"getIndex",function(a,b){var c,d,e,f,g=this.chart;return g.polar?(d=g.xAxis[0].center,e=b.chartX-d[0]-g.plotLeft,f=b.chartY-d[1]-g.plotTop,c=180-Math.round(Math.atan2(e,f)/Math.PI*180)):c=a.call(this,b),c}),o(G,"getCoordinates",function(a,b){var c=this.chart,d={xAxis:[],yAxis:[]};return c.polar?e(c.axes,function(a){var e=a.isXAxis,f=a.center,g=b.chartX-f[0]-c.plotLeft,h=b.chartY-f[1]-c.plotTop;d[e?"xAxis":"yAxis"].push({axis:a,value:a.translate(e?Math.PI-Math.atan2(g,h):Math.sqrt(Math.pow(g,2)+Math.pow(h,2)),!0)})}):d=a.call(this,b),d})}(Highcharts);