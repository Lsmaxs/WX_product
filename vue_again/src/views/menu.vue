<template>
  <div class="desktopCloud-content">
    <!-- 校园广播-->
    <carousel>
      <slider>
        <img src="../assets/a1.jpg">
          <div class="carousel-caption">
          1
          </div>
        </slider>
      <slider>
        <img src="../assets/a2.jpg">
        <div class="carousel-caption">
        2
        </div>
      </slider>
    </carousel>
    <!-- 课程邮件 -->
    <div class="desktopCloudBar-bd clearfix">
        <div class="desktopCloudBar-l fl">
            <div class="desktopCloudBar-l-title">
                您下一节需要上的课程为
            </div>
            <div class="desktopCloudBar-l-icon">
                {{loginUser.userName}}
            </div>
            <div class="desktopCloudBar-l-content">
                一年级1班 第6节
            </div>
        </div>
        <div class="desktopCloudBar-r fl">
           <div class="desktopCloudBar-r-title" id="newEmail">
                <!-- <sup  style="color:red" id="sup">●</sup>
                您有<b style="color:red">1</b>封未读的邮件 --><br/>
            </div>
            <div class="desktopCloudBar-r-icon">
            </div>
            <div class="desktopCloudBar-r-content">
                来自校长的邮件
            </div>
        </div>
    </div>
    <div class="desktopCloudBar-fd clearfix">
            <a class="desktopCloudBar-icon desktopCloudBar-icon-radio" v-on:click="newWin" href="javascript:;" url="https://official.weixiao100.cn/custom/v3/index.html?schoolCode=888888&cropId=wx49c11c1f33811d3c&t=1471507661758" title="广播" ><span>微官网</span></a>
            <a id="notice" class="desktopCloudBar-icon desktopCloudBar-icon-scheduleof" v-link="{name: 'noticeList'}"  title="广播" ><span>广播</span></a>
            <a id="classcircle" class="desktopCloudBar-icon desktopCloudBar-icon-schedule" v-link="{name: 'feedsList'}" title="班级圈" ><span>班级圈</span></a>
            <a id="mail" class="desktopCloudBar-icon desktopCloudBar-icon-results" href="javascript:;" title="成绩" ><span>邮件</span></a>
            <a id="subject" class="desktopCloudBar-icon desktopCloudBar-icon-monitoring" href="javascript:;" title="监控" ><span>微课</span></a>
            <a id="schedule" class="desktopCloudBar-icon desktopCloudBar-icon-process" href="javascript:;" title="流程" ><span>日程</span></a>
            <a id="timeTable" class="desktopCloudBar-icon desktopCloudBar-icon-more" href="javascript:;" title="班级圈" ><span>流程</span></a>
            <a id="checkIn" class="desktopCloudBar-icon desktopCloudBar-icon-attendance" href="javascript:;" title="考勤" ><span>考勤</span></a>
            <a id="watch" class="desktopCloudBar-icon desktopCloudBar-icon-samllwebsite" v-on:click="watch" href="javascript:;" url="http://192.168.20.72" title="微官网" ><span>监控</span></a>
            <a id="manage" class="desktopCloudBar-icon desktopCloudBar-icon-emall" href="javascript:;" title="邮件" ><span>管理</span></a>
    </div>
  </div>
</template>

<script1>
  import { carousel,slider } from 'vue-strap'
  export default {
    components: {
      carousel,
      slider
    }
  }
</script1>
<script>
  import { carousel,slider } from 'vue-strap'
  import { getLoginUser } from '../vuex/getters';
  var gui = require('nw.gui');
  export default {
    components: {
      carousel,
      slider
    },
    vuex: {
      getters: {
        loginUser: getLoginUser,
      },
    },
    created() {
        window.moveBy(gui.Window.get().x, 0)
    },
    methods: {
      newWin: function (event) {
        // `this` 在方法里指当前 Vue 实例
        // `event` 是原生 DOM 事件
        gui.Window.open(event.target.getAttribute("url"), {
          position: 'center',
          always_on_top:true,
          width: 900,
          height: 800
        });
      },
       watch: function (event) {
        // `this` 在方法里指当前 Vue 实例
        // `event` 是原生 DOM 事件
        gui.Window.open(event.target.getAttribute("url"), {
          position: 'center',
          always_on_top:true,
          width: 900,
          height: 800
        });
      }
    }
  }
</script>

<style>
* {font-family:"微软雅黑";}
.fl{
    float: left;
}
.fr{
    float: right;
}
/*清除浮动*/
.clearfix:after{content:".";display:block;height:0;clear:both;visibility:hidden}
.clearfix{*+height:1%;}
/*清除浮动end*/
/*基础样式 end*/

/*首页*/
body{
}
.desktopCloud-bg{
    /*background: url('../assets/desktopCloud-bg.jpg') no-repeat;*/
    width: 100%;
    position: absolute;
    z-index: -1;
}
.desktopCloud-bottom{
    background: url('../assets/bottomBar.png') repeat-x;
    height:48px;
    position:fixed;
    bottom: 0;
    width: 100%;
}
.desktopCloud-content{
    width:715px;
    padding: 30px 20px;
    margin: 0 auto;
        -webkit-box-shadow:0px 0px 20px -5px #000;
        -moz-box-shadow:0px 0px 20px -5px #000;
        box-shadow:0px 0px 20px -5px #000;
}
.desktopCloudBar-hd{
    width: 715px;
    height:184px;
    /*background: url('../assets/campus-broadcastBar.png') no-repeat;*/
    -webkit-box-shadow:0px 0px 20px -5px #000;
    -moz-box-shadow:0px 0px 20px -5px #000;
    box-shadow:0px 0px 20px -5px #000;
}
.desktopCloudBar-hd-icon{
    background: url('../assets/campus-broadcast-tips.png') 30px 0 no-repeat;
    width: 60px;
    height: 60px;
    line-height: 60px;
    font-size: 25px;
    padding-left: 110px;
}
.desktopCloudBar-hd-title{
    font-size: 27px;
    padding-left: 47px;
    margin-top: 8px;
}
.desktopCloudBar-hd-content{
    padding-left: 47px;
    margin-top: 12px;
    line-height: 24px;
}
.desktopCloudBar-bd{
    margin-top: 10px;
}
.desktopCloudBar-l{
    background: url('../assets/courseBar.png') no-repeat;
    width:304px;
    height:170px;

}
.desktopCloudBar-l-title{
    font-size: 16px;
    margin-left: 60px;
    margin-top: 15px;
}
.desktopCloudBar-l-icon{
    font-size: 54px;
    color:#04be01;
    margin-left: 98px;
    line-height: 90px;
    height:90px;
}
.desktopCloudBar-l-content{
    font-size: 25px;
    margin-left: 60px;
}

.desktopCloudBar-r{
    background: url('../assets/emailBar.png') -25px 0 no-repeat;
    width:304px;
    height:170px;
    margin-left: 60px;
}
.desktopCloudBar-r-title{
    font-size: 16px;
    margin-left: 60px;
    margin-top: 15px;
    width: 220px;
}
.desktopCloudBar-r-icon{
    font-size: 54px;
    color:#ed8373;
    margin-left: 98px;
    line-height: 90px;
    height:90px;
}
.desktopCloudBar-r-content{
    font-size: 25px;
    margin-left: 60px;
}
.desktopCloudBar-fd{
    width:675px;
    height: 297px;
    background: url('../assets/goodsList-bg.jpg') 0 0 no-repeat;
    margin-top: 15px;

}

.desktopCloudBar-icon{
    background:url('../assets/goodsList-icon2.png') 0 -14px no-repeat;
    display: inline-block;
    float: left;
    margin-top: 8px;
    margin-left: 1px;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    height: 125px;
}
.desktopCloudBar-icon-radio{
    background-position: 0 -14px;
    width: 138px;

}
.desktopCloudBar-icon-scheduleof{
    background-position: -141px -14px;
    width: 129px;

}
.desktopCloudBar-icon-schedule{
    background-position: -265px -14px;
    width: 129px;

}
.desktopCloudBar-icon-results {
    background-position: -395px -14px;
    width: 129px;

}
.desktopCloudBar-icon-monitoring {
    background-position: -529px -14px;
    width: 135px;

}



.desktopCloudBar-icon-process{
    background-position: 0px -148px;
    width: 139px;

}
.desktopCloudBar-icon-more{
    background-position: -141px -148px;
    width: 129px;

}

.desktopCloudBar-icon-attendance {
    background-position: -270px -148px;
    width: 124px;
}
.desktopCloudBar-icon-samllwebsite {
    background-position: -394px -148px;
    width: 134px;
}
.desktopCloudBar-icon-emall{
    background-position: -521px -148px;
    width: 134px;

}

.desktopCloudBar-icon span{

    margin-top: 105px;
    display: inline-block;
    text-align: center;
    width: 100%;
}
</style>
