define(function(require,exports,module){var a={},b=require("jquery"),c=require("qt/util");require("jquery/popup");var d=require("../plugin/nprogress/nprogress");d.configure({trickleRate:.05,trickleSpeed:800,showSpinner:!1});var e=window.location.pathname,f=(e.substring(0,e.lastIndexOf("/")),"http://"+location.hostname+":"+(location.port?location.port:"80")),g=c.P("schoolCode"),h=c.P("userId"),i=null,j=0,k=0,l=[{pic:"",name:""},{pic:"1",name:"1元爱心基金"},{pic:"5",name:"红包5元"},{pic:"10",name:"红包10元"},{pic:"50",name:"红包50元"},{pic:"100",name:"红包100元"},{pic:"mi",name:"红米Note3"},{pic:"mini",name:"Ipad mini4"}];function m(){return g&&h?(n(),b("#wgwBtn").off().on("click",function(){0==k?s("活动还没开始哦~",function(){parent&&parent!=window&&parent.handleFrameCall&&parent.handleFrameCall({cmd:"hongbao_go_wgw"})}):parent&&parent!=window&&parent.handleFrameCall&&parent.handleFrameCall({cmd:"hongbao_go_wgw"})}),void b("#applyBtn").off().on("click",function(){if(0==k)return void s("活动还没开始哦~");if(2==k)return void s("活动已经结束了哦~");if(1==k){var a={uid:h,schoolCode:g,activeCode:i};r(f+"/portal/wap/mkactive/lotteryEntry",a,function(a){s("0001"==a.resultCode?"抽奖在微信内进行哦，赶紧到手机上看看吧！":a.resultMsg)})}})):void(window.top.location.href="http://www.myhost-domain.cn")}function n(){var a={uid:h,schoolCode:g};r(f+"/portal/wap/mkactive/join",a,function(a){"0001"==a.resultCode?(k=1,i=a.activeCode,j=a.times?a.times:0,b("#applyTime").html(""+j),o(a.awards),p(),q()):"0007"==a.resultCode?(b("#luckyList span").html("活动尚未开始"),u(),u()):"0008"==a.resultCode?(k=2,o(a.awards),p(),q()):s(a.resultMsg),u()})}function o(a){if(a.length>0&&a.length<=10){for(var c=new Array,d=0;d<a.length;d++){var e=a[d],f=l[e.index],g=e.username.substring(0,3)+"****"+e.username.substring(7);c.push("<p><span>"+g+'</span><b><img src="./images/Prize_'+f.pic+'.png" />'+f.name+"</b></p>")}b("#luckyList").html(c.join(""))}else if(a.length>10){var h=0;function i(){b("#luckyList").hide();for(var c=new Array,d=0;10>d;d++){var e=a[h++],f=l[e.index],g=e.username.substring(0,3)+"****"+e.username.substring(7);c.push("<p><span>"+g+'</span><b><img src="./images/Prize_'+f.pic+'.png" />'+f.name+"</b></p>"),h>=a.length&&(h%=a.length)}b("#luckyList").html(c.join("")).fadeIn(1500)}{setInterval(i,5e3)}i()}}function p(){var a={uid:h,schoolCode:g,activeCode:i};r(f+"/portal/wap/mkactive/activemotion",a,function(a){if("0001"==a.resultCode){for(var c=a.items,d=new Array,e=0;e<c.length;e++){var f=c[e];d.push("<li><span>"+f.result+"</span>"+f.event+"</li>")}d.length<=0?(b("#noread").show(),b("#readlist").hide()):(b("#noread").hide(),b("#readlist").show()),b("#readlist").html(d.join(""))}else s(a.resultMsg);u()})}function q(){var a={uid:h,schoolCode:g,activeCode:i};r(f+"/portal/wap/mkactive/myawards",a,function(a){if("0001"==a.resultCode){for(var c=a.items,d=new Array,e=Math.ceil(c.length/9),f=new Array,g=1;e>=g;g++)f.push("<a "+(1==g?'class="sel"':"")+' href="javascript:;">'+g+"</a>");if(b("#recordFlow").html(f.join("")),c.length<=9){for(var g=0;g<c.length;g++){var h=c[g],i=l[h.index];d.push('<li><img src="./images/Prize_'+i.pic+'.png"/>'+i.name+"</li>")}b("#recordlist").html(d.join("")),b("#recordFlow").hide()}else{for(var g=0;9>g;g++){var h=c[g],i=l[h.index];d.push('<li><img src="./images/Prize_'+i.pic+'.png"/>'+i.name+"</li>")}b("#recordlist").html(d.join("")),b("#recordFlow").show();var j=b("#recordFlow a");b("#recordFlow").off().on("click","a",function(){var a=j.index(this),d=9*a,e=d+8;e=e>=c.length-1?c.length-1:e;for(var f=new Array,g=d;e>=g;g++){var h=c[g],i=l[h.index];f.push('<li><img src="./images/Prize_'+i.pic+'.png"/>'+i.name+"</li>")}b("#recordlist").hide().html(f.join("")).fadeIn(800),j.removeClass("sel").eq(a).addClass("sel")})}d.length<=0?(b("#norecord").show(),b("#recordlist").hide(),b("#recordFlow").hide()):(b("#norecord").hide(),b("#recordlist").show())}else s(a.resultMsg);u()})}function r(a,c,d){var e={json:JSON.stringify(c)};b.post(a,e,function(a){d&&d(a)})}function s(a,b){parent&&parent!=window?parent.showMsg({msg:a,btnText:"知道了",callback:function(){try{b&&b()}catch(a){}}}):(alert(a),b&&b())}var t=3;function u(){t--,0>=t&&d.done()}d.start(),m(),module.exports=a});