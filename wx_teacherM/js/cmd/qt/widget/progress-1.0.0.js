/**
 * 进度条插件
 * yonson
 */
define(function(require, exports, module) {
	
	var initVar = {
			isOk:false,  //是否完成进度
			width:0,     //进度完成状态0~100
			isStop:false  //是否关闭进度
	};
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	
	init();
	
	function init(){
		
		var progress = '<div class="weui_progress" style="display:none;">'+
					   '<div class="weui_progress_bar">'+
					   '<div class="weui_progress_inner_bar" style="width: 0%;"></div>'+
					   '</div>'+
					   '<a href="javascript:;" class="weui_progress_opr">'+
					   '<i class="weui_icon_cancel"></i>'+
					   '</a></div>';
		$("body").append(progress);
		
	}
	
	/**
	 * 显示进度条
	 * isCancel:是否开启取消关注
	 * cFunc：取消回调方法(isCancel为true时有效)
	 */
	qt_model.showProgress = function(isCancel,cFunc){
		if(!isCancel){
			$(".weui_progress_opr").hide();
		}else{
			if(cFunc){
				$(".weui_progress_opr").click(function(){
					cFunc();
				});
			}
		}
	}
	
	/**
	 *  开启进度条
	 */
	qt_model.startProgress = function(func){
		initVar.isOk = false;
		initVar.width = 0;
		initVar.isStop = false;
		var times = setInterval(function(){
			if(initVar.isOk){  //事件已处理成功
				var randomNum = getRandom(10,20);
				initVar.width += randomNum;
				if(initVar.width > 100)
					initVar.width = 100;
			}else{  //事件还没有处理成功
				var randomNum = getRandom(5,10);
				if(initVar.width > 80)
					initVar.width = 80;
			}
			$(".weui_progress_inner_bar").css("width",initVar.width+"%");
			if(initVar.width == 100){  //处理完成
				clearInterval(timer);    //清除定时器
				func();  //调用回调函数
			}else if(initVar.isStop){
				clearInterval(timer);    //清除定时器
			}
		},300);
	}
	
	/**
	 * ok进度条
	 */
	qt_model.okProgress = function(flag){
		initVar.isOk = flag;
	}
	
	/**
	 * 停止进度条
	 */
	qt_model.stopProgress = function(){
		initVar.isOk = false;
		initVar.width = 0;
		initVar.isStop = true;
	}
	
	/**
	 * 生成指定范围随机数
	 */
	function getRandom(n,m){
        return Math.floor(Math.random()*m+n)
    }
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;
	
});