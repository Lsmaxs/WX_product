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
	var _common = require('./common');
	var _config = require('./config');
	var qt_util = require('qt/util');

	function initPage(){

		initQQkefu();

		//收藏
		$('#addFavBtn').click(function(){
			var _title = document.title;
			var _url = location.href;
			try{
				window.external.addFavorite(_url, _title);
			}catch (e){
				try{
					window.sidebar.addPanel(_title,_url,"");
				}catch (e){
					_common.tips("加入收藏失败，请使用Ctrl+D进行添加");
				}
			}
		});

		//关闭按钮
		$('.bt_green').off().on('click',function(){
			window.close();
		});


	}

	//初始化QQ客服
	function initQQkefu(){
		//topbar_qq
		try{
			BizQQWPA && BizQQWPA.addCustom({
				nameAccount : '800105253',
				selector : 'qqkefu',
				aty :0
			});
			BizQQWPA && BizQQWPA.visitor({
				nameAccount : '800105253'
			});
		}catch(e){
			//do nothing
		}

		// 展示微信二维码
		var wxTimer = null;
		$('#add_qrcode').hover(function(){
			console.log('debug:....1');
			wxTimer && clearTimeout(wxTimer);
			$('.scan_cade').fadeIn(200);
		},function(){
			wxTimer && clearTimeout(wxTimer);
			wxTimer = setTimeout(function(){
				$('.scan_cade').fadeOut(200);
			},150);
		});
	}

	//业务入口
	initPage();
	
	module.exports = qt_model;
});
