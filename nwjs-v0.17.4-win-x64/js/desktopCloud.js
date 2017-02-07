var w = require("nw.gui").Window;
window.moveBy(w.get().x, 0)
var menu = {
  home:"https://official.weixiao100.cn/custom/v3/index.html?schoolCode=zscy001&cropId=wx29a48dfc48fb3877&t=1474540271480",
  notice:"https://www.weixiao100.cn/fronts/jxhd/html/notice/index_tea.html?userId=f3b15f6f1c0c45b8a61e5381c02639f6&schoolCode=888888&cropId=wx49c11c1f33811d3c&userName=",
  classcircle:"https://www.weixiao100.cn/xywh/wap/html/classcircle/album_par_list.html?userId=bf2e0883c63511e58635fa163e0e90d3&schoolCode=zscy001&cropId=wx29a48dfc48fb3877&userName=%E6%A2%81%E5%86%B0#main",
  score:"http://dev.weixiao100.cn/frontstest/xxts/html/score/teacher.html?userId=3140b67cd8484b2db512d0034f7bb20e&cropId=wx720bfe80a251d709#main",
  schedule:"http://oa-h5.qky100.com/index.jsp?suiteCode=xxts&cropId=wx49c11c1f33811d3c&appCode=oa&userId=f3b15f6f1c0c45b8a61e5381c02639f6&timestamp=1475029102147&tag=gzrc&schoolCode=888888&encry=66c530fe508118e547a085c5f53b3f9d&userType=1",
  flow:"http://oa-h5.qky100.com/work/work_main_new.html?rnd=0.3193638341035694",
  mail:"https://www.weixiao100.cn/fronts/other/tiyan_wk/#/home/index/public",
  watch:"https://www.weixiao100.cn/fronts/other/tiyan_znk/znjk/index.html",
  checkIn:"https://www.weixiao100.cn/fronts/other/tiyan_znk/kq/index_tch.html",
  detail:"https://www.weixiao100.cn/fronts/jxhd/html/notice/detail_send.html?userId=f3b15f6f1c0c45b8a61e5381c02639f6&cropId=wx49c11c1f33811d3c&nu=1474945735647997&schoolCode=888888&t=1474961959430",
  headmaster:"http://oa-h5.qky100.com/index.jsp?suiteCode=xxts&cropId=wx49c11c1f33811d3c&appCode=oa&userId=f3b15f6f1c0c45b8a61e5381c02639f6&timestamp=1475032623066&tag=nbyj&schoolCode=888888&encry=6249bdd21791c356a3bec77c4909ecd6&userType=1",
  timeTable:"https://app.iyeeke.com/mobile/timetable?date=2016-09-28&type=WEEK&subjectId=75917&userType=FACULTY"
}

window.onload = function() {
  document.addEventListener("click",function(evt){
    var target= evt.target
    //alert(1);
    var url = menu[target.id]
    if(url){
      w.open(url, {
        position: 'center',
        always_on_top:true,
        icon:"../images/classcircle.png",
        title:"13242345354",
        width: 600,
        height: 800
      });
    }
  })
};

function clickIt(){
	w.open("http://oa-h5.qky100.com/index.jsp?suiteCode=xxts&cropId=wx29a48dfc48fb3877&appCode=oa&userId=f3b15f6f1c0c45b8a61e5381c02639f6&timestamp=1474942956063&tag=nbyj&schoolCode=zscy001&encry=e8a7cc6b4ead0e419c55fcf1c985e5dc&userType=1,2", {
        position: 'center',
        always_on_top:true,
        icon:"../images/classcircle.png",
        title:"13242345354",
        width: 600,
        height: 800
      });
}

function clickNotice(){
	w.open("https://www.weixiao100.cn/fronts/jxhd/html/notice/detail_send.html?userId=f3b15f6f1c0c45b8a61e5381c02639f6&cropId=wx49c11c1f33811d3c&nu=1474945735647997&schoolCode=888888&t=1474961959430", {
        position: 'center',
        always_on_top:true,
        icon:"../images/classcircle.png",
        title:"13242345354",
        width: 600,
        height: 800
      });
}