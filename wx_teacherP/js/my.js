define(function(require, exports, module) {

	/**
	 * @desc 
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var qt_cookie = require('qt/cookie');
	var _common = require('./common');
	require('jquery/nicescroll');


	//服务
	var _SERVICE = _common.SERVICE;

	//获取窗口大小
	var winSize = qt_util.getViewSize();
	$('.viewport').css({'height':qt_util.P('h')+'px','overflow':'hidden'});

	//window引用，防止回调中指针出错
	var _window = window;


	//绑定设置科目按钮
	$('#setSubjectBtn').click(function(){
		//窗口打开参数
		var options = {};
		options.key = 'subject';
		options.url = './subject.html';
		options.title =  '设置科目';
		options.callback = function(){
			//do nothing
		}
		window.parent.closeWin&&window.parent.closeWin({
			isSwitch : true,
			callback : function(){
				_window.parent.openWin&&_window.parent.openWin(options);
			}
		});
	});

	//留言列表
	if(_common.getFuncs('words')){
		$('#messagelistBtn').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'messagelist';
			options.url = './message_list.html';
			options.title =  '留言列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
		});
		$('#messagelistBtn').parent().show();
	}else{
		$('#messagelistBtn').parent().remove();
	}

	//班级相册
	if(_common.getFuncs('clazzalbum')){
		$('#classPhotoBtn').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'photolist';
			options.url = './photo_list.html';
			options.title =  '班级相册';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
		});
		$('#classPhotoBtn').parent().show();
	}else{
		$('#classPhotoBtn').parent().remove();
	}
	

	//问卷列表
	if(_common.getFuncs('survey')){
		$('#questionlistBtn').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'questionlist';
			options.url = './question_list.html';
			options.title =  '问卷列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
		});
		$('#questionlistBtn').parent().show();
	}else{
		$('#questionlistBtn').parent().remove();
	}
	

	//请假列表
	if(_common.getFuncs('qingjia')){
		$('#leavelistBtn').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'leavelist';
			options.url = './leave_list.html';
			options.title =  '请假列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
		});
		$('#leavelistBtn').parent().show();
	}else{
		$('#leavelistBtn').parent().remove();
	}

	
	//通知列表
	if(_common.getFuncs('notice')){
		$('#noticelistBtn').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'noticelist';
			options.url = './notice_list.html';
			options.title =  '通知列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
		});
		$('#noticelistBtn').parent().show();
	}else{
		$('#noticelistBtn').parent().remove();
	}
	
	//自定义滚动条
	$('.viewport').niceScroll({
		cursorcolor:'#ccc',
		cursorwidth:'8px',
		cursorminheight:100,
		scrollspeed:60,
		mousescrollstep:60,
		autohidemode:'leave',
		bouncescroll:false
	});
	


	module.exports = qt_model;

});
