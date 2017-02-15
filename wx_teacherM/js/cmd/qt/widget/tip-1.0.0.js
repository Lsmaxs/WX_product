/**
 * 弹出框插件
 * yonson
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	
	init();
	
	function init(){
		
		//弹出框一
		var alertButtoHtml1 = '<div id="dialog1" class="weui_dialog_alert" style="display:none">'+
		    				  '<div class="weui_mask"></div>'+
		    				  '<div class="weui_dialog">'+
		    				  '<div class="weui_dialog_hd"><strong class="weui_dialog_title"></strong></div>'+
		    				  '<div class="weui_dialog_bd"></div>'+
		    				  '<div class="weui_dialog_ft">'+
		    				  '<a href="javascript:;" class="weui_btn_dialog primary">确定</a>'+
		    				  '</div></div></div>';
		
		//弹出框二
		var alertButtoHtml2 = '<div id="dialog2" class="weui_dialog_confirm" style="display:none">'+
	    					  '<div class="weui_mask"></div>'+
	    					  '<div class="weui_dialog">'+
	    					  '<div class="weui_dialog_hd"><strong class="weui_dialog_title"></strong></div>'+
	    					  '<div class="weui_dialog_bd"></div>'+
	    					  '<div class="weui_dialog_ft">'+
	    					  '<a href="javascript:;" class="weui_btn_dialog default">取消</a>'+
	    					  '<a href="javascript:;" class="weui_btn_dialog primary">确定</a>'+
	    					  '</div></div></div>';
			
		$("body").append(alertButtoHtml1+alertButtoHtml2);
		
	}
	
	qt_model.openAlert1 = function (title,text,func){
		$('#dialog1 .weui_dialog_title').html(title);
		$('#dialog1 .weui_dialog_bd').html(text);
		$('#dialog1').show(400);
		$('#dialog1').find('.weui_btn_dialog').unbind();
        $('#dialog1').find('.weui_btn_dialog').on('click', function () {
            $('#dialog1').hide(400);
            if(func){
    			func();
    		}
        });
	}
	
	qt_model.openAlert2 = function (title,text,func1,func2,cancelText,definiteText){
		if(cancelText){
			$('#dialog2 .default').text(cancelText);
		}
		if(definiteText){
			$('#dialog2 .primary').text(definiteText);
		}
		$('#dialog2 .weui_dialog_title').html(title);
		$('#dialog2 .weui_dialog_bd').html(text);
		$('#dialog2').show(400);
		$('#dialog2').find('.primary').unbind();
		$('#dialog2').find('.primary').on('click', function () {
            $('#dialog2').hide(400);
            if(func1){
            	func1();
    		}
        });
		$('#dialog2').find('.default').unbind();
        $('#dialog2').find('.default').on('click', function () {
            $('#dialog2').hide(400);
            if(func2){
            	func2();
    		}
        });
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});