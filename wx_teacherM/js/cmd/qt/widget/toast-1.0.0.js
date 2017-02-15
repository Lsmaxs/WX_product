/**
 * toast插件
 * yonson
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	
	init();
	
	function init(){
		
		//toast
		var toast = '<div id="toast" style="display: none;font-size:16px">'+
					'<div class="weui_mask_transparent"></div>'+
					'<div class="weui_toast">'+
					'<i class="weui_icon_toast"></i>'+
					'<p class="weui_toast_content">已完成</p>'+
					'</div></div>';
	    
		//loading-toast
	    var loadingToast = '<div id="loadingToast" class="weui_loading_toast" style="display: none;font-size:16px">'+
	    				   '<div class="weui_mask_transparent"></div>'+
	    				   '<div class="weui_toast">'+
	    				   '<div class="weui_loading">'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_0"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_1"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_2"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_3"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_4"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_5"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_6"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_7"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_8"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_9"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_10"></div>'+
	    				   '<div class="weui_loading_leaf weui_loading_leaf_11"></div>'+
	    				   '</div><p class="weui_toast_content">数据加载中</p></div></div>';
	    	
		$("body").append(toast+loadingToast);
		
	}
	
	/**
	 * 显示toast
	 */
	qt_model.showToast = function(content,func){
		if(content){
			$("#toast").find(".weui_toast_content").html(content);
		}
		$("#toast").show();
		setTimeout($("#toast").hide(400),2000);
		if(func){
			func();
		}
	}
	
	/**
	 * 显示数据加截中toast
	 */
	qt_model.showLoadToast = function(content,func){
		if(content){
			$("#loadingToast").find(".weui_toast_content").html(content);
		}
		$("#loadingToast").show();
		if(func){
			func();
		}
	}
	
	/**
	 * 隐藏数据加截中toast
	 */
	qt_model.hideLoadToast = function(func){
		$("#loadingToast").hide();
		if(func){
			func();
		}
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;
	
});