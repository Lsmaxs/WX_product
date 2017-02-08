var w = require("nw.gui").Window;
window.moveBy(w.get().x, 0)
var menu = {
  home:"https://official.weixiao100.cn/custom/v3/index.html?schoolCode=888888&cropId=wx49c11c1f33811d3c&t=1471507661758",
  notice:"https://www.weixiao100.cn/fronts/jxhd/html/notice/index_tea.html?userId=9818a7c940354ef7844bae3d839c08bf&schoolCode=888888&cropId=wx49c11c1f33811d3c&userName=%E8%B5%96%E5%8B%87&ia=0",
  classcircle:"https://www.weixiao100.cn/fronts/xywh/html/classcircle/album_tea_list.html?userId=9818a7c940354ef7844bae3d839c08bf&schoolCode=888888&cropId=wx49c11c1f33811d3c&userName=%E8%B5%96%E5%8B%87&ia=0",
  mail:"http://oa-h5.qky100.com/mail/mail.html?.rnd=0.7801012105774134",
  subject:"https://www.weixiao100.cn/fronts/other/tiyan_wk/#/home/index/public",
  schedule:"http://oa-h5.qky100.com/calendar/calendar.html?.rnd=0.33138106972910464",
  timeTable:"http://oa-h5.qky100.com/index.jsp?suiteCode=xxts&cropId=wx49c11c1f33811d3c&appCode=oa&userId=9818a7c940354ef7844bae3d839c08bf&timestamp=1476063404105&tag=gzlc&schoolCode=888888&encry=5162b22dc0f89a252f1b4109c909fc5e&userType=1,2",
  checkIn:"https://www.weixiao100.cn/fronts/other/tiyan_znk/kq/index_tch.html",
  manage:"http://www.weixiao100.cn/tea/login.html?product=%24%7Bproduct%7D&scope=read&client_secret=wx_jxhd&grant_type=password&redirect_uri=http%3A%2F%2Fwww.weixiao100.cn%2Ftea%2FuserIndex&client_id=wx_jxhd&appKey=%24%7BappKey%7D",
  watch:"http://jia.360.cn/pc/player_autosize.html?sn=36071719584&channel=hide",
  "slide-img-1":"https://www.weixiao100.cn/fronts/jxhd/html/notice/detail_read.html?userId=9818a7c940354ef7844bae3d839c08bf&cropId=wx49c11c1f33811d3c&nu=1cd249125b840c467fd10ba99dcf2bbb&isReceiver=1&t=1476013669644",
  "slide-img-2":"https://www.weixiao100.cn/fronts/jxhd/html/notice/detail_read.html?userId=9818a7c940354ef7844bae3d839c08bf&cropId=wx49c11c1f33811d3c&nu=86864fdbe023620afe681c95ce076fc3&isReceiver=1&t=1476013728036",
  "slide-img-3":"https://www.weixiao100.cn/fronts/jxhd/html/notice/detail_read.html?userId=9818a7c940354ef7844bae3d839c08bf&cropId=wx49c11c1f33811d3c&nu=c5ab84e10dbd8bef16ff3d6f41d696fd&isReceiver=1&t=1476014045650",
}

if(!window.slider) {
 var slider={};
}

slider.data= [
 {
     "id":"slide-img-1", // 与slide-runner中的img标签id对应
     "client":"开学一个月",
     "desc":"" //这里修改描述
 },
 {
     "id":"slide-img-2",
     "client":"语文应该这样学",
     "desc":""
 },
 {
     "id":"slide-img-3",
     "client":"别让嫉妒心毁了孩子",
     "desc":""
 }
];

window.onload = function() {
  document.addEventListener("click",function(evt){
    var target= evt.target
    var url = menu[target.id]
    if(target.id=="manage"){
      w.open(url, {
        position: 'center',
        always_on_top:true,
        width: 900,
        height: 800
      });
    } else if(url){
      w.open(url, {
        position: 'center',
        always_on_top:true,
        width: 600,
        height: 800
      });
    }
  })
  
};


function clickIt(){
	w.open("http://oa-h5.qky100.com/mail/mail_view.html?.rnd=0.7500122946221381", {
        position: 'center',
        always_on_top:true,
        width: 600,
        height: 800
      });
    $("#newEmail").html("<br/>");
    //setTimeout('$("#newEmail").html(`<b  style="color:red">●</b> 您有<b style="color:red">1</b>封未读的邮件`)',5000);
}

function newEmail(){
      setTimeout('$("#newEmail").html(`<b  style="color:red">●</b> 您有<b style="color:red">1</b>封未读的邮件`)',5000);
}