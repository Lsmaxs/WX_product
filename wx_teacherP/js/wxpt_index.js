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
	var _common = require('./common');

	//滚动条美化插件
	require('jquery/nicescroll');

	//服务
	var _SERVICE = _common.SERVICE;
	var _window = window;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//用户参数信息
	var adimg = qt_util.P('adimg');
	adimg = adimg && decodeURIComponent(adimg);


	function initPage(){
		if(!adimg){
			_common.tips('广告位图片查询失败');
			return;
		}
		// setTimeout($('#adimg').attr('src',adimg),5000)
		$('#adsrc').attr('src',adimg).load(function(){
			var _this = $(this);
			var contentWidth=_this.outerWidth();
			var contentHeight = _this.outerHeight();
			var _width = winSize.width;
			var _height = winSize.height;
			var scalePercent=0;
			scalePercent  = (_width/contentWidth).toFixed(2)-0;
			_this.css({'-webkit-transform': 'translate3d(0, 0, 0)','-webkit-transform':'scale('+scalePercent+')','transform':'scale('+scalePercent+')','-webkit-transform-origin':'0 0','transform-origin':'0 0','padding':3/scalePercent+'px '+2/scalePercent+'px '+'0'});
			// 处理自定义 滚动条
			var slide = $('.nicescrollContainer');
			var footH = (contentHeight*scalePercent).toFixed(2)-0;
			if(footH>_height){
				slide.css('height',_height+'px');
				slide.find('.nicescrollWrapper').css('height',footH+'px');
				slide.niceScroll(slide.find('.nicescrollWrapper'),{
					cursorcolor:'#ccc',
					cursorwidth:'8px',
					cursorminheight:100,
					scrollspeed:60,
					mousescrollstep:60,
					autohidemode:true,
					bouncescroll:false
				});	
			}else{
				$('body').eq(0).css('overflow-y','hidden');
			}
			
			
		});

		// var contentHeight=$('#adsrc').outerHeight();
		// var scalePercent=0;
		// if(winSize.width>contentHeight){
		// 	scalePercent  = (winSize.width/contentHeight).toFixed(2)-0;
		// }else{
		// 	scalePercent  = (contentHeight/winSize.width).toFixed(2)-0;
		// }
		// $('#adsrc').css({'-webkit-transform': 'translate3d(0, 0, 0)','-webkit-transform':'scale('+scalePercent+')','transform':'scale('+scalePercent+')','-webkit-transform-origin':'50% 0','transform-origin':'50% 0'});	
	}

	initPage();

	module.exports=qt_model;
})