define(function(require, exports, module) {

	/**
	 * @desc 
	 * @exports
	 * @version 2.7.5
	 * @author 
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var qt_cookie = require('qt/cookie');
	var qt_ui = require('qt/ui');
	var _common = require('./common');
	var _config = require('./config');

	//服务
	var _SERVICE = _config.SERVICE;

	//视口尺寸
	var _vs = qt_util.getViewSize();

	/**
	 * @desc 初始化用户信息
	 * @return 
	 */
	function initPage(){
		
		if(!_common.getToken()){
			_common.goLogin();
			return;
		}else{
			$('#username').html(_common.getUserName());
			$('.mainbox').css({
				visibility : 'visible'
			});
		}
		//重置尺寸
		resetDimention();
		initFunList();
		initUserOp();
		
	}


	//计算尺寸
	function resetDimention(){
		var winH=$(window).height();
		var conH = winH - $('#topbar').outerHeight();
		$("#content").height(conH + 'px');
		$("#browserframe").height(conH + 'px');
	}

	//绑定功能模块列表点击
	function initFunList(){
		var lis = $('#funlist li')
		$('#funlist').on('click','li',function(){
			var _this = $(this);
			var url = _this.attr('data-url');
			if(url){
				url = url+(url.indexOf('?')>0?'&':'?')+'t'+(new Date()).getTime()+'=1';
				lis.removeClass('up');
				_this.addClass('up');
				$('#browserframe').attr('src',url);
			}
		});
	}

	//绑定用户名操作
	function initUserOp(){
		//绑定弹出浮层
		$('#opBtn').off().on('click',function(){
			$('#opList').fadeIn(600);
			$(window).off('click.op').on('click.op',function(){
				$('#opList').fadeOut(400);
				$(window).off('click.op');
				return false;
			});
			return false;
		});
		$('#opList').on('mouseleave',function(){
			$('#opList').fadeOut(600);
		});
		//绑定刷新
		var applying = false;
		$('#opRefreshBtn').off().click(function(){
			if(applying){
				return;
			}
			_common.showLoading();
			_common.post(_SERVICE+'/author/createMenu',{},function(rtn){
				_common.hideLoading();
				applying = false;
				if('0000000' == rtn.rtnCode){
					_common.tips('success','刷新成功');
				}else{
					_common.tips(rtn.msg);
				}
			});
		});
		//绑定账户管理
		$('#opAccountBtn').off().click(function(){
			var _url = 'http://ucw-pro.qtonecloud.cn/admin/ucm/index?access_token='+_common.getToken();
			if(_config.isDev){
				_url = 'http://ucw-dev.qtonecloud.cn/admin/ucm/index?access_token='+_common.getToken();
			}
			window.top.location.href=_url;
		});
		//绑定更改密码
		$('#opPswBtn').off().click(function(){
			_common.tips('请联系管理员');
		});
		//绑定注销
		$('#opLogoutBtn').off().click(function(){
			_common.goLogin();
		});

	}


	//------------------------------window方法 begin------------------------------//

	/**
	 * @desc 通用消息提示
	 * @param {Object} options  对象集合
	 * @param {Object} options.title  标题
	 * @param {String} options.msg 消息内容
	 * @param {String} options.textAlign 对齐方式，默认center
	 * @param {String} options.btnText 关闭按钮文字
	 * @param {String} options.okbtnText 确认按钮文字
	 * @param {String} options.icon icon小图标url,可使用warn,suc
	 * @param {Function} options.callback 关闭按钮文字回调
	 * @param {Function} options.okcallback 确认按钮文字回调
	 * @param {boolean} options.mask 是否打开消息蒙层
	 * @return 
	 */
	window.showMsg = function(options){
		var _options = {};
		if(typeof options == 'string'){
			_options.msg = options;
		}else{
			_options = options;
		}
		if(!_options.msg){
			return;
		}

		var title = _options.title;
		var icon = _options.icon;
		var msg = _options.msg;
		var callback = _options.callback;
		var okcallback = _options.okcallback;
		var btnText = _options.btnText?_options.btnText:'关闭';
		var okbtnText = _options.okbtnText?_options.okbtnText:'确定';
		var mask = _options.mask === false?false:true;

		var box = $('#msgBox');
		if(title){
			box.find('#msgBox_title').html(''+title).parent().show();
		}else{
			box.find('#msgBox_title').html('').parent().hide();
		}
		box.find('#msgBox_msg').html(''+msg);
		box.find('.msgbox_body p').css('text-align',textAlign);

		if(icon){
			if('warn' == icon || 'suc' == icon){
				icourl = 'images/ico_'+icon+'.png';
			}
			$('#msgBox_ico').attr('src',icon).show();
		}else{
			$('#msgBox_ico').hide();
		}
		box.find('.btn').eq(1).html(''+btnText).off().click(function(){
			box.popupClose();
			callback&&callback();
		});
		if(okcallback){
			box.find('.btn').eq(0).html(''+okbtnText).off().click(function(){
				box.popupClose();
				okcallback&&okcallback();
			});
		}else{
			box.find('.btn').eq(0).off().hide();
		}
		box.popupOpen({
			speed : 200,
			mask : mask,
			maskColor : '#222'
		});
	}

	//图片对象
	var _picshow = null;
	/**
	 * @desc 图片查看大图浮层
	 * @param {Object} options  对象集合
	 * @return 
	 */
	window.showImgs = function(urls,index){
		var vs = qt_util.getViewSize();
		//初始框框留白区
		var _offset = {top:90,width:130};
		var width = vs.width;
		var height = vs.height;

		var box = $('#picBox');
		box.css({
			width: width+'px',
			height : height + 'px',
			position : 'fixed',
			left : '0',
			top : '0'
		});
		box.find('span').css({
			top : (height-73)/2+'px'
		});

		//水平填满比率
		var rate1 = width/(height-_offset.top*2);
		//垂直填满比率
		var rate2 = (width - _offset.width*2)/height;
		//内部填满比率
		var rate3 = (width - _offset.width*2)/(height-_offset.top*2);

		if(!_picshow){
			_picshow = qt_ui.picshow({
				id : 'picBox',
				urls : urls,
				onShow : function(size){
					var rate = size.width/size.height;
					var tw = width;
					var th = height;
					if(size.width<=(width - _offset.width*2) && size.height <= (height-_offset.top*2)){
						//小于框框
						tw = size.width;
						th = size.height;
					}else if(rate >=rate3){
						//内部宽度填满
						tw = (width - _offset.width*2);
						th = tw * size.height/size.width;
					}else{
						//内部高度填满
						th = (height-_offset.top*2);
						tw = size.width * th / size.height;
					}
					/* 支持水平或垂直填满，改为只支持内部填满
					else if(rate >= rate1){
						//宽度填满
						th = tw/rate1;
					}else if(rate <= rate2){
						//高度可填满
						tw = rate2 *th;
					}else if(rate >=rate3){
						//内部宽度填满
						tw = (width - _offset.width*2);
						th = tw/rate3;
					}else{
						//内部高度填满
						th = (height-_offset.top*2);
						tw = rate3 *th;
					}
					*/
					var tx = (width - tw)/2;
					var ty = (height - th)/2;

					$('#picBoxBody').css({
						'width' : tw + 'px',
						'height' : th + 'px',
						'left' : tx + 'px',
						'top' : ty + 'px'
					});

					var _img = $('#picBoxBody img');
					$('#picBox').off('mousewheel').on('mousewheel',function(event){
						var e = event.originalEvent;
						var detra = (e.wheelDelta || -e.detail);
						var _scale = _img.data('scale');
						_scale = _scale+(detra>0?0.2:-0.2);
						_scale = _scale<1?1:_scale;
						_img.css({
							'transform' : 'scale('+_scale+')',
							'-ms-transform' :'scale('+_scale+')',
							'-webkit-transform' : 'scale('+_scale+')'
						}).data('scale',_scale);
					});
				},
				onSwitch : function(){
					$('#picBoxBody img').css({
						'transform' : 'scale(1)',
						'-ms-transform' : 'scale(1)',
						'-webkit-transform' : 'scale(1)'
					}).data('scale',1);
					$('#picBox').off('mousewheel');
				}
			});

			box.find('.picbox_bg').off().click(function(){
				box.hide();
				$('#picBoxBody img').attr('src','');
			});

			//处理移动
			var start = {x:0,y:0};
			var pos = {left:0,top:0};
			var draging = false;
			$('#picBoxBody').on('mousedown',function(e){
				draging = true;
				var _this = $(this);
				start = {
					x : e.pageX,
					y : e.pageY
				}
				var left = parseInt(_this.css('left').replace('px',''));
				var top = parseInt(_this.css('top').replace('px',''));
				pos = {
					left : left,
					top : top
				};
			}).on('mouseup',function(e){
				draging = false;
			}).on('mousemove',function(e){
				if(!draging){
					return;
				}
				var _this = $(this);
				var now = {
					x : e.pageX,
					y : e.pageY
				}
				var target = {
					x : now.x - start.x + pos.left,
					y : now.y - start.y + pos.top
				}
				_this.css({
					left : target.x+'px',
					top : target.y+'px'
				});
			});

		}else{
			_picshow.reset(urls);
		}
		_picshow.show(index?index:0);
		box.show();
	}



	//提供给刷新access
	window.refreshAccess = function(cropId){
		$.get(_SERVICE+'/school/refreshtoken?corpId='+cropId,function(data,status){
			console.log(data);
		});
	}

	//------------------------------window方法 end--------------------------------//


	//-----------------------------指令相关 begin-----------------------------//
	/**
	 * @desc 提供特殊函数给子窗口调用
	 * @param {Object} options  对象集合
	 * @return 
	 */
	window.handleFrameCall = function(data){
		if('contact' == data.cmd){
			//跳转通讯录指令
			var params = data.params?data.params:{};
			var schoolCode = params.schoolCode;
			var areaAddr = params.areaAddr;
			var lis = $('#funlist li');
			lis.removeClass('up');
			lis.eq(1).addClass('up');
			$('#browserframe').attr('src','./contact.html?'+qt_util.param(params));
		}
	}
	//-----------------------------指令相关 end-------------------------------//




	//业务入口
	initPage();


	

	/*
	_common.post(_SERVICE+'/webapp/xxxx',params,function(rtn){
		if('001' == rtn.resultCode){
		
		}else if('202' == rtn.resultCode){
			_common.lostLogin();
		}else{
			showMsg(rtn.resultMsg);
		}
	});
	

   var ids = [
	    'tjcc1f82e69c27ae09',
		'tjc0a435b64c7d0b0d',
		'tjb7c905d6b81c735a',
		'tjf560fdb75b93c602',
		'tj271174fffb6cbaae',
		'tj4b9005b71ddd650d'
   ];
   for(var i=0;i<ids.length;i++){
		var params = {
			suiteId : ids[i]
		}
		_common.post(_SERVICE+'/school/refreshtoken',params,function(rtn){
			if('0000000' == rtn.rtnCode){
			
			}else if('202' == rtn.rtnCode){
				_common.lostLogin();
			}else{
				showMsg(rtn.rtnMsg);
			}
		});
   }
   */
	//http://dev.admin.weixiao100.cn/school/refreshtoken?suiteId=tjcc1f82e69c27ae09


	module.exports = qt_model;

});
