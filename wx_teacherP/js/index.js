define(function(require, exports, module) {

	/**
	 * @desc
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 */

	/**
	 * @ 为微官网首页url添加是否第一次访问标识参数
	 * @ 2016.10.9
	 * @ 修改lines:464~479 509~517 1286~1293
	 * @ author huangyu
	 */

	/**
	 * @ 为教师前台添加首页弹窗
	 * @ 2016.10.11
	 * @ 修改lines:316-340 451-479
	 * @ author huangyu
	 */

	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var qt_cookie = require('qt/cookie');
	var qt_ui = require('qt/ui');
	var MD5 = require('qt/md5');
	var _common = require('./common');
	var _config = require('./config');
	require('jquery/popup');
	require('jquery/nicescroll');
	var Modernizr = require('../plugin/modernizr/modernizr');
	//Esaas工具条
	//var Esaas = require('../plugin/esaas/esaas');
	var Esaas = require('../plugin/esaas/2.0/esaas');

	var _isTransitions = Modernizr.csstransitions;
	var _isTransform = Modernizr.csstransforms;

	//服务
	var _SERVICE = _common.SERVICE;
	//var _INDEX_SERVICE = 'http://'+location.hostname+':'+(location.port?location.port:'80')+'/tea';

	//视口尺寸
	var _vs = qt_util.getViewSize();

	//主窗口是否已经显示
	var _showMain = false;

	// 项目版本
	var _version = seajs.data.project_version;

	// 统计脚本
	var _stat = require('./stat.js');

	_stat.init('wxpt');

	// 全局广告位编码后url
	var _encodeUrl = '';

	//获取用户信息
	var userInfo = {};
	function applyUserInfo(){
		//判断是否同一浏览器的第二个窗口
		/*
		if(_common.getUuid()){
			$('#topbar').hide();
			showMsg({
				msg:'您已经打开了操作窗口,<br/>请关闭本窗口，在已打开的窗口中进行操作!',
				btnText:'知道了',
				callback : function(){
					try{
						window.close();
					}catch(e){
						//do nothing
					}
				}
			});
			return;
		}else{
			window.onunload = function(){
				_common.clearStatus();
			}
		}
		*/
		var info = qt_cookie.getCookie('user_info_json');
		if(!info){
			_common.lostLogin();
			return;
		}
        console.log(_SERVICE);
		_common.post(_SERVICE+'/info/'+info,{ },function(rtn){
			userInfo = rtn;
			initUserInfo(rtn);
			//如果带登录源，则填充登录源
			if(userInfo.loginSource){
				_common.setLoginSource(userInfo.loginSource);
			}
		});
		//模拟单个角色
	    //var info = {"headPortraitUrl":"http://pic.nipic.com/2007-11-09/2007119122519868_2.jpg","items":[{"role":1,"roleName":"班主任","schoolCode":"100001","schoolName":"学校名字","funs":{"clazzalbum":1,"homework":1,"linkman":1,"notice":1,"survey":1,"words":1},"isAdmin":1}],"resultCode":"001","resultMsg":"处理成功","userName":"ethan","uuid":"1000"};
		/*
		//模拟多个角色
		var info = {"headPortraitUrl":"http://pic.nipic.com/2007-11-09/2007119122519868_2.jpg","items":[
				{"role":1,"roleName":"班主任","schoolCode":"100001","schoolName":"全通小学","funs":{"clazzalbum":1,"homework":1,"linkman":1,"notice":1,"survey":1,"words":1},"isAdmin":1},
				{"role":1,"roleName":"班主任","schoolCode":"100001","schoolName":"全通小学","funs":{"clazzalbum":1,"homework":1,"linkman":1,"notice":1,"survey":1,"words":1},"isAdmin":1},
				{"role":1,"roleName":"班主任","schoolCode":"100001","schoolName":"全通中学","funs":{"clazzalbum":1,"homework":1,"linkman":1,"notice":1,"survey":1,"words":1},"isAdmin":1}
			],
			"resultCode":"001",
			"resultMsg":"处理成功",
			"userName":"ethan",
			"uuid":"1000"
		};
		initUserInfo(info);
		*/
	}

	/**
	 * @desc 初始化用户信息
	 * @return
	 */
	function initUserInfo(info){
		try{
			if('001'!= info.resultCode){
				//角色查询异常
				showMsg({
					msg:info.resultMsg,
					callback : function(){
						_common.goLogin();
						return;
					}
				});
				return;
			}
			var items = info.items;
			if(!items || items.length <=0){
				showMsg({
					msg:'您没有操作本系统的角色',
					btnText:'知道了',
					callback : function(){
						try{
							_common.goLogin();
						}catch(e){
							//do nothing
						}
					}
				});
				return;
			}
		}catch(e){
			showMsg({
				msg:'角色查询异常，请重新登录',
				btnText:'知道了',
				callback : function(){
					try{
						_common.goLogin();
					}catch(e){
						//do nothing
					}
				}
			});
			return;
		}

		//有角色，开始初始化
		_common.setUuid(info.uuid);
		_common.setUserName(info.userName);
		_common.setHeadUrl(info.headPortraitUrl);
		initRole(info);
	}

	//初始化角色选择
	function initRole(info){
		var items = info.items;

		//角色缓存
		var _roleCache = {};

		//当前选择的学校
		if(items.length == 1){
			//只有一个
			var item = items[0];
			switchRole(item);
			$('#selectSchool').hide();
			$('#switchBtn').hide();
		}else{
			$('#selectSchool').show();
			//有多个，弹出角色选择
			var html = new Array();
			var html2 = new Array();
			for(var i=0;i<items.length;i++){
				var item = items[i];
				html.push('<a href="javascript:;" class="rolebox_role" data-schoolCode="'+item.schoolCode+'">');
				html.push('<span><img src="'+(info.headPortraitUrl?info.headPortraitUrl:_common.getDefaultHeadUrl())+'" /></span>');
				html.push('<p class="rolebox_role_name">'+info.userName+item.roleName+'</p>');
				html.push('<p class=" rolebox_role_school">'+item.schoolName+'</p>');
				html.push('</a>');

				html2.push('<a href="javascript:;" data-schoolCode="'+item.schoolCode+'">'+item.schoolName+'</a>');

				_roleCache[item.schoolCode] = item;
			}
			$('#roleBoxList').html(html.join(''));
			if(items.length >9){
				$('#roleBoxList').find('.rolebox_role').css({
					'margin':'0 15px'
				});
			}
			$('#schoolList').html(html2.join('<hr/>'));

			//绑定角色选择
			$('#roleBoxList').off().on('click','[data-schoolCode]',function(){
				var schoolCode = $(this).attr('data-schoolCode');
				$('#roleBox').fadeOut(function(){
					var item = _roleCache[schoolCode];
					switchRole(item);
					_common.localSet('isInUpgrade',item.isInUpgrade);
				});
			});
			var schoolCode = qt_cookie.getCookie('schoolCode') || _common.getSchoolCode();
			if(schoolCode){
				//有schoolCode,默认帮选
				var defaultSelectItem = null;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					if(schoolCode == item.schoolCode){
						defaultSelectItem = item;
						break;
					}
				}
				switchRole(defaultSelectItem);
			}else{
				//弹出角色选择
				$('#roleBox').fadeIn('slow');
				var boxh = $('#roleBox').height();
				$('#roleBox').show().popupOpen({
					mask : false,
					callback : function(){
						$('#roleBox').css({
							height : boxh+'px',
							'margin-top' : (0-boxh/2)+'px'
						}).css({
							'transform' : 'scale(1)',
							'-webkit-transform' : 'scale(1)'
						});
					}
				});
			}

			//绑定更换角色
			$('#switchBtn').off().click(function(){
				qt_cookie.delCookie('schoolCode');
				_common.delSchoolCode();
				location.reload();
			});



		}
	}

	//切换选择角色
	function switchRole(item){
		//处理cookie
		var sa = {"words":1};
		_common.setRole(item.role);
		_common.setRoleName(item.roleName);
		_common.setSchoolCode(item.schoolCode);
		_common.setSchoolName(item.schoolName);
		_common.setIsAdmin(1);//item.isAdmin
		_common.setIsMaster(item.isMaster);
		_common.setIsJFAdmin(item.isJFAdmin);
		_common.setMasterClassInfo(item.masterClassInfo);
		_common.setFuncs(sa);//item.funs
		_common.setPermissions(item.permissions);

		//记录七鱼用户信息
		initQiyuUserInfo(item.schoolCode);

		//关闭已经打开的窗口
		closeWin();
		//刷新消息
		if('1' == $('#messageFrame').attr('init')){
			reseNavFrame('messageFrame')
		}
		if('1' == $('#contactFrame').attr('init')){
			reseNavFrame('contactFrame')
		}
		if(!_showMain){
			_showMain = true;
			//处理界面
			initTopbar();
			//计算位置
			initPos();
			//绑定各个区域的事件
			initNav();
			initFuncs();

			// initKefu();
			showQQKefu();
			initTraceBack();
			//处理esaas
			initEsaas(userInfo.isShowEsaas,item.agencyCode);

			$(window).on('resize',function(){
				_vs = qt_util.getViewSize();
				initPos();
			});

			//弹出要显示的内容
			var isAdmin = _common.isAdmin();
			if(isAdmin && _common.getFuncs('mkActivity')){
				$('#topHbBtn').trigger('click');
			}else{
				$('#l_wrap').fadeIn('slow');
				setTimeout(function(){
					$('#l_wrap').css({
						'transform' : 'scale(1)',
						'-ms-transform' : 'scale(1)',
						'-webkit-transform' : 'scale(1)'
					});
				},200);
				var permissionRoleArr=['4'];
				_common.isAdmin()&&permissionRoleArr.push('2');
				_common.isJFAdmin()&&permissionRoleArr.push('1');
				_common.isMaster()&&permissionRoleArr.push('3');
				var param={
					uniqueCode: '1_1',
    				permissionRole: permissionRoleArr.join(','),
    				page: '',
    				pageSize:''
				}
				_common.jsonp('/appmsg/yyzx/findInfo',param,function(rtn){
					if((rtn.items.length>0)&&((rtn.items[0].content.length)>0)){
						_encodeUrl=encodeURIComponent(rtn.items[0].content);
						$('#l_wrap').on('transitionend webkitTransitionEnd',function(event){
							var _con = $('span.nav_jt');
							if(!_con.is(event.target)&& _con.has(event.target).length == 0){
								var options={};
								options.key = 'wxpt_index';
								options.url = './wxpt_index.html?adimg='+_encodeUrl;
								options.title =  '首页';
								options.callback = function(){}
								openWin(options);
							}
						});
					}
				});
			}
		}

	}

	//适应窗口大小
	function initPos(){
		var _vw = _vs.width;
		var _vh = _vs.height;
		//左侧尺寸
		var _height = $('#l_wrap').height();
		var _width = $('#l_wrap').width();
		//顶部栏的高度
		var _barH = $('#topbar').height();
		//左侧空白区高度
		var _infoH = $('.l_info_content').height();
		$('#messageFrame,#contactFrame,#myFrame').css('height',_infoH+'px').attr('data-h',_infoH);

		if(_vh > _barH + _height +20){
			//视口大于尺寸
			//针对大尺寸适应高度,最少维持10px边距
			var fixHeight = _vh - _barH - 20;
			//避免高度很大的屏幕显示起来很短
			if(fixHeight > _height){
				_height = fixHeight;
			}
			//设置最大值
			if(_height > 620){
				_height = 620;
			}
			//调整各个区块大小
			$('#l_wrap,#winBox,#otherBox').css({height:_height+'px'});
			//左侧中间区域，两个值已经知道，直接写死
			var _funcH = 72;
			var _navH = 40;
			var infoH = _height - _funcH -_navH;
			$('.l_info,.l_info_content').css({height:infoH+'px'});
			$('#messageFrame,#contactFrame,#myFrame').css('height',infoH+'px').attr('data-h',infoH);
			//调整右侧窗口（里面各个title,header的高度，这里实际将winbox,otherwin都同时修改了）
			var rconH = _height - 20 - 36 - 10;
			$('.win_con').css({height:rconH+'px'});


			//居中处理
			var top = Math.ceil((_vh - _barH -_height)/2);
			$('#l_wrap,#winBox,#otherBox').css('top',_barH + top+'px');

			//弹出样式处理
			var percent = Math.floor(_funcH/_height*100);

			$('.transWin').css({
				'transform-origin':'0% '+percent+'%',
				'-webkit-transform-origin':'0% '+percent+'%',
				'-ms-transform-origin':'0% '+percent+'%'
			});
		}
		//宽度
		if(_vw > _width+_default_win_width){
			var left =  Math.floor((_vw-_width-_default_win_width)/2);
			$('#l_wrap').css('left',left+'px');
			$('#winBox').css('left',left+_width+'px');
		}

		$('.topbar_funs,.topbar_set,.topbar_info,.topbar_qq').show();

		if(!$('#messageFrame').attr('src')){
			reseNavFrame('messageFrame');
		}
		if(!$('#contactFrame').attr('src')){
			reseNavFrame('contactFrame');
		}
		if(!$('#myFrame').attr('src')){
			reseNavFrame('myFrame');
		}
		//全屏窗口尺寸
		$('#fullBox').css({
			height: (_vh - _barH)+'px',
			top : _barH+'px'
		});

	}


	//初始化顶部微官网切换
	function initTopbar(){
		//填充用户信息
		$('#headUrl').attr('src',''+_common.getHeadUrl());
		//$('#username').html(''+_common.getUserName()+_common.getRoleName());
		//$('#schoolName').html(''+_common.getSchoolName());
		$('#nameAndSchool').html(''+_common.getUserName()+_common.getRoleName()+' '+_common.getSchoolName())

		//初始化设置
		initSetting();

		//通用切换
		var tabs = $('#topbarinfo .topbar_funs a');
		var nowTabIndex = 0;
		$('#topbarinfo').data('tabIndex',0);
		tabs.off().click(function(){
			var _this = $(this);
			var url = _this.attr('data-url');
			var _out = _this.attr('data-out');
			if('1' == _out){
				//新窗口打开，直接允许通过，不做特殊处理
				return true;
			}
			var index = tabs.index(this);
			if($('#topbarinfo').data('tabIndex') == index){
				return;
			}
			tabs.removeClass('sel').eq(index).addClass('sel');
			if(0 == index){
				nowTabIndex = index;
				$('#topbarinfo').data('tabIndex',nowTabIndex);
				// switchToIndex();
				switchToIndex(function(){
					closeWin({
						isSwitch : true,
						callback : function(){
								if(_encodeUrl.length>0){
									var options={};
									options.key = 'wxpt_index';
									options.url = './wxpt_index.html?adimg='+_encodeUrl;
									options.title =  '首页';
									options.callback = function(){}
									openWin(options);
								}
						}
					});
				});
			}else if(1==index){
				//特殊处理红包活动
				tabs.removeClass('sel');
				nowTabIndex = index;
				$('#topbarinfo').data('tabIndex',nowTabIndex);
				switchToFullWin({
					url:'./act/package2016/pc/index.html?schoolCode='+_common.getSchoolCode()+'&userId='+_common.getUuid()
				});
			}else{
				var init = _this.attr('data-init');
				if('1' != init){
					switch(index){
						case 2 : _initOther('wgw');break;
						default:break;
					}
				}else{
					//该按钮已经初始化完成
					var options = {};
					options.key = 'other';
					options.url = url;
					options.title =  _this.attr('data-title');
					options.width =  _this.attr('data-width');
					options.callback = function(){
						//do nothing
					}
					nowTabIndex = index;
					$('#topbarinfo').data('tabIndex',nowTabIndex);

					//特殊处理微官网
					if(2 == index){
						checkFirstWgw(function(){
							if(isFirst){
								isFirst=false;
								options.url+=options.url.indexOf('?')>=0?'&isFirst=1':'?isFirst=1';
							}
							switchToOtherWin(options);
							//switchToFullWin(options);
						});
					}else{
						switchToOtherWin(options);
					}
				}
			}

		});

		//初始化微官网
		function _initOther(appCode) {
            var uuid = _common.getUuid();
            if (!uuid) {
                return;
            }
            var schoolCode = _common.getSchoolCode();
            if (!schoolCode) {
                return;
            }
            var token = _common.getToken();
            if (!token) {
                return;
            }
			// var params = {
			// 	'uuid' : uuid,
			// 	'schoolCode' : schoolCode,
			// 	'appCode': appCode
			// };
			// _common.post( _SERVICE +'/comm/thirdurl',params,function(rtn){
			// 	if('001' == rtn.resultCode){
			// 		//窗口打开参数
			// 		$('#top'+appCode+'Btn').attr({
			// 			'data-init':'1',
			// 			'data-url':rtn.url
			// 		});
			// 		$('#top'+appCode+'Btn').trigger('click');
			// 	}else if('202' == rtn.resultCode){
			// 		_common.lostLogin();
			// 	}else{
			// 		showMsg(rtn.resultMsg);
			// 	}
			// });
			// 不请求数据写入微官网地址
			var URL = window.location.hostname + ':' + window.location.port + '/admin/v3/index.html?schoolCode=' + schoolCode + '&access_token=' + token + '&uuid=' + uuid;
			$('#top' + appCode + 'Btn').attr({
				'data-init': '1',
				'data-url': URL
			});
			$('#top' + appCode + 'Btn').trigger('click');
		}

		//微官网
		var isAdmin = _common.isAdmin();
		//暂时全部开放微官网，并且暂时不校验funcs
		//isAdmin = '1';
		if(isAdmin){
			$('#topwgwBtn').show();
		}else{
			$('#topwgwBtn').remove();
		}
		if(isAdmin && _common.getFuncs('mkActivity')){
			$('#topHbBtn').show();
		}else{
			$('#topHbBtn').hide();
		}

		if(1 != userInfo.isShowEsaas){
			initParter();
		}
	}

	//初始化顶部外跳合作方
	function initParter(){
		//其他外跳的接入口,不接入essass才使用
		var _outAppCode = [];
		if(_common.getFuncs('xxbg')){
			_outAppCode.push('xxbg');
			$('#topxxbgBtn').show();
		}else{
			$('#topxxbgBtn').remove();
		}
		if(_common.getFuncs('xyzf')){
			_outAppCode.push('xyzf');
			$('#topxyzfBtn').show();
		}else{
			$('#topxyzfBtn').remove();
		}

		//初始化外跳的地址
		var params = {
			'uuid' : _common.getUuid(),
			'schoolCode' : _common.getSchoolCode(),
			'appCodeList': _outAppCode
		};
		_common.post( _SERVICE+'/webapp/comm/thirdurllist',params,function(rtn){
			if('001' == rtn.resultCode){
				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					$('#top'+item.code+'Btn').attr({
						'href':item.url,
						'target':'_blank'
					}).show();
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				showMsg(rtn.resultMsg);
			}
		});
	}

	//初始化功能模块
	function initFuncs(){
		//权限模块显示隐藏
		if(!_common.getFuncs('notice')){
			$('.t_func [data-func="notice"]').remove();
		}
		if(!_common.getFuncs('homework')){
			$('.t_func [data-func="homework"]').remove();
		}
		if(!_common.getFuncs('words')){
			$('.t_func [data-func="messagesend"]').remove();
		}
		if(!_common.getFuncs('clazzalbum')){
			$('.t_func [data-func="photosend"]').remove();
		}
		if(!_common.getFuncs('czcx')){
			$('.t_func [data-func="scorelist"]').remove();
		}

		// 通知权限的显示 是管理员且安装了通知模块
		if(_common.isAdmin() && _common.getFuncs('notice')){
			$('#noticePermissionBtn').show();
		}else{
			$('#noticePermissionBtn').hide();
		}


		/*
		//处理样式
		var funclis = $('.t_func ul li');
		var funclength = funclis.size();
		if(funclength<4){
			funclis.css({'width':(100/funclength)+'%'});
		}
		*/

		//点击事件处理
		var funcs = $('[data-func]');
		var win = $('#winBox');
		funcs.click(function(){
			var func = $(this);

			var winFunc = win.attr('data-key');
			var funkey = func.attr('data-func');

			//当前是否已经打开自己
			if(funkey == winFunc){
				return;
			}

			//窗口打开参数
			var options = {};
			options.key = funkey;

			var width = func.data('width');
			options.width = width?parseInt(width):700;
			var time = func.data('time');
			if(time)options.time =parseInt(time);
			options.url =  func.data('url');
			options.title =  func.data('title');
			options.callback = function(){
				//do nothing
			}

			closeWin({
				isSwitch : winFunc?true:false,
				callback : function(){
					openWin(options);
				}
			});
		});
	}

	//初始化导航
	function initNav(){
		var navBox = $('#navBox');
		var navs = $('#mainNav li');
		var flag = navBox.find('.nav_jt');

		var infoWrapper = $('#infoWrapper');
		var infoContent = infoWrapper.find('.l_info_content');


		var moving = false;

		navs.click(function(){
			if(moving){
				return;
			}

			var width = navBox.width();
			var normalLeft = -width;


			var nowIndex =  parseInt(infoWrapper.attr('data-nowIndex'));
			var nextIndex = navs.index(this);

			if(nowIndex == nextIndex){
				return;
			}

			var nav = $(this);
			//导航样式
			navs.removeClass('sel');
			nav.addClass('sel');
			//游标位置
			var flagLeft = nav.attr('data-left');
			flag.css('left',flagLeft);

			//主体内容
			var nextContent = infoContent.eq(nextIndex);
			var nowContent = infoContent.eq(nowIndex);


			//默认右侧滑出
			var targetLeft = -2*width;

			if(nextIndex > nowIndex){
				nextContent.css('left',(2*width)+'px').show();
				targetLeft = -2*width;
			}else{
				nextContent.css('left','0px').show();
				targetLeft = 0;
			}
			moving = true;
			infoWrapper.animate({left:targetLeft+'px'},400,function(){
				//alert('debug:.....next='+nextIndex+'&now='+nowIndex+'&width='+width+'&targetLeft='+targetLeft);
				moving = false;
				nowContent.hide();
				nextContent.css('left',width+'px');
				infoWrapper.css('left',(-width)+'px');

				infoWrapper.attr('data-nowIndex',nextIndex);

			});
		});
	}
	//刷新导航iframe
	function reseNavFrame(id){
		var _frame = $('#'+id);
		var h = _frame.attr('data-h');
		var _src =  _frame.attr('data-src')+'?v='+_version;
		_frame.attr('src',_src+(h?('&h='+h):'')).attr('init','1');
	}

	//绑定回退按钮
	function initTraceBack(){
		$('#winBox h2 a').off().on('click',function(){
			var callback = _traceStack.pop();
			if(_traceStack.length <=0){
				$('#winBox').find('h2 a').hide();
			}
			callback&&callback();
		})
	}

	//初始化设置
	function initSetting(){
		var _setTimer = null;
		$('#setting').click(function(){
			_setTimer && clearTimeout(_setTimer);
			$('#settinglist').fadeIn();
		}).mouseleave(function(){
			_setTimer && clearTimeout(_setTimer);
			_setTimer = setTimeout(function(){
				_setTimer && clearTimeout(_setTimer);
				$('#settinglist').fadeOut();
			},200);
		});
		$('#settinglist').mouseenter(function(){
			_setTimer && clearTimeout(_setTimer);
		}).mouseleave(function(){
			_setTimer && clearTimeout(_setTimer);
			_setTimer = setTimeout(function(){
				_setTimer && clearTimeout(_setTimer);
				$('#settinglist').fadeOut();
			},200);
		});

		$('#nameAndSchool').off().click(function(){
			$('#setting').trigger('click');
		});

		//绑定设置密码按钮
		$('#setPswBtn').click(function(){
			switchToIndex(function(){
				//窗口打开参数
				var options = {};
				options.key = 'psw';
				options.url = './psw.html';
				options.title =  '设置密码';
				options.callback = function(){
					//do nothing
				}
				closeWin({
					isSwitch : true,
					callback : function(){
						openWin(options);
					}
				});
			});
		});
		//绑定设置科目按钮
		$('#setSubjectBtn').click(function(){
			switchToIndex(function(){
				//窗口打开参数
				var options = {};
				options.key = 'subject';
				options.url = './subject.html';
				options.title =  '设置科目';
				options.callback = function(){
					//do nothing
				}
				closeWin({
					isSwitch : true,
					callback : function(){
						openWin(options);
					}
				});
			});
		});
		//绑定二维码
		$('#qrcodeBtn').click(function(){
			switchToIndex(function(){
				//窗口打开参数
				var options = {};
				options.key = 'qrcode';
				options.url = './qrcode.html';
				options.title =  '学校二维码';
				options.callback = function(){
					//do nothing
				}
				closeWin({
					isSwitch : true,
					callback : function(){
						openWin(options);
					}
				});
			});
		});

		//绑定一键邀请
		if(_common.isAdmin()){
			$('#inviteBtn').click(function(){
				switchToIndex(function(){
					//窗口打开参数
					var options = {};
					options.key = 'invite';
					options.url = './invite.html';
					options.title =  '全校邀请';
					options.callback = function(){
						//do nothing
					}
					closeWin({
						isSwitch : true,
						callback : function(){
							openWin(options);
						}
					});
				});
			}).show();

			//绑定学校设置
			$('#rightsettingBtn').click(function(){
				switchToIndex(function(){
					//窗口打开参数
					var options = {};
					options.key = 'rightsetting';
					options.url = './rightsetting.html';
					options.title =  '学校设置';
					options.callback = function(){
						//do nothing
					}
					closeWin({
						isSwitch : true,
						callback : function(){
							openWin(options);
						}
					});
				});
			}).show();
		}else{
			$('#inviteBtn').remove();
			$('#rightsettingBtn').remove();
		}

		//绑定通知权限

		$('#noticePermissionBtn').click(function(){
			switchToIndex(function(){
				//窗口打开参数
				var options = {};
				options.key = 'noticepermission';
				options.url = './notice_permi_set.html';
				options.title =  '通知权限设置';
				options.callback = function(){
					//do nothing
				}
				closeWin({
					isSwitch : true,
					callback : function(){
						openWin(options);
					}
				});
			});
		});

		//绑定注销
		$('#logoutBtn').off().click(function(){
			_common.goLogin();
		});

	}


	//初始化esaas
	function initEsaas(isShowEsaas,agencyCode){

		if(1 != isShowEsaas){
			//不显示
			return;
		}

		//Esaas按钮
		var _url = 'http://open.qky100.com';
		if(_config.isDev){
			_url = 'http://open.qky-dev.thinkjoy.com.cn';
		}
		$.ajax({
			url: _url+'/v2/eSAASProductsByJsonp',            //实际环境地址
			type: "GET",
			dataType: "jsonp",//注意：解决跨域，只能写成该类型
			timeout: 6000,
			jsonp: 'callback',//注意：该参数指定为callback,服务器端才能接收，解决跨域问题
			data: {
				accessToken: _common.getToken(),
				uid: _common.getUuid(),
				userType: 1,
				agencyCode: agencyCode,
				schoolCode: _common.getSchoolCode(),
				loginSource: (userInfo.loginSource?userInfo.loginSource:(_SERVICE+"/login.html"))
			},
			error: function (request) {
				//只要报错都用原来的入口
				initParter();
			},
			success: function (rtn) {
				//显示
				if('0000000' == rtn.rtnCode){
					if(rtn.bizData && rtn.bizData.length>0){
						$('#esaasBtn').show().css('visibility','visible');
						Esaas.jqInit($,{
							id : 'esaasBtn',
							rootClass : 'qt_esaasbar',
							//defaultBtn : false,//声明不适用默认按钮
							triggerEvent : 'mouseenter',
							theme : 'white',
							bar : {
								//底色
								background : 'white',
								//高亮底色
								backgroundHover : '#2196F3',
								//top值偏移，一般用于自定义按钮的样式兼容，修改传入数值，单位px
								top : 0,//55,
								left : 0,
								target : '_self',
								color:'#cfcfcf',
								zIndex:200
							},
							btn : {
					            background : 'white',
					            backgroundHover : '#fff',


					        },
							data : rtn.bizData
						});
					}else{
						//esaas没有数据，使用原来的入口
						initParter();
					}
				}
			}
		});
	}

	//初始化QQ客服
	function initKefu(){
		/*改为七鱼客服
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
		*/
		//wx qrcode
		var wxTimer = null;
		$('#wxkefu').on('mouseenter',function(){
			wxTimer && clearTimeout(wxTimer);
			$(this).find('.pop_code1').fadeIn(200);
		}).on('mouseleave',function(){
			var _this = $(this);
			wxTimer && clearTimeout(wxTimer);
			wxTimer = setTimeout(function(){
				_this.find('.pop_code1').fadeOut(200);
			},150);
		});

		//获取与客服的用户信息
		var dataJson = window.localStorage.getItem("customerInfo");
		if(dataJson && dataJson.length >0){
    		dataJson = JSON.parse(dataJson);
    	}else{
			dataJson = {};
    		dataJson.qyuid = new Date();
    		dataJson.data = [];
    	}
		ysf && ysf.on({
			'onload': function(){
			   ysf.config({
				   uid:dataJson.qyuid,
				   data:JSON.stringify(dataJson.data)
			   });
			}
		});
		$('#float_winR').css('display','block');

	}


	//初始化七鱼
	function initQiyuUserInfo(schoolCode){
		//设置localStorage 保存与客服用户信息
		var paramsInfo = {
			uuid : _common.getUuid(),
			schoolCode:schoolCode
		}
		_common.post(_SERVICE+'/webapp/customer/getCustomerInfo',paramsInfo,function(rtn){
			if('001' == rtn.resultCode){
				if(rtn.data && rtn.data.length>0){
					var cusJson = {
						uid:rtn.qyuid,
						data:rtn.data
					}
					window.localStorage.setItem("customerInfo",JSON.stringify(cusJson));
				}
			}
		});
	}

	//显示客服
	function showQQKefu(){
		$('#kefuBox').show();
	}
	//隐藏客服
	function hideQQKefu(){
		$('#kefuBox').hide();
	}

	//美化滚动条
	function initScroll(){
		$('html').niceScroll({
			cursorcolor:'#666',
			cursoropacitymax:0.7,
			cursorwidth:'12px',
			cursorborderradius:'2px',
			cursorborder:'0px solid #f5f5f5',
			autohidemode:true,
			bouncescroll:false
		});
	}

	//------------------------------window方法 begin------------------------------//

	//默认窗口动画时间
	var _default_win_time_open = 800;
	var _default_win_time_close = 300;
	var _default_win_width = 700;
	var _win_frame_index=0;
	//子窗口历史记录
	var _traceStack = [];
	/**
	 * @desc 子窗口前进记录
	 * @param {Object} callback  绑定到回退按钮的回调函数
	 * @return
	 */
	window.trace = function(callback){
		 $('#winBox').find('h2 a').show();
		_traceStack.push(callback);
	}
	/**
	 * @desc 清空子窗口前进记录
	 * @return
	 */
	window.untrace = function(){
		 $('#winBox').find('h2 a').hide();
		_traceStack = [];
	}
	/**
	 * @desc 关闭窗口
	 * @param {Object} options  对象集合
	 * @param {Object} options.time 关闭时间
	 * @return
	 */
	window.closeWin = function(options){
		options = options?options:{};
		//动画时间
		var time = options.time?options.time:_default_win_time_close;
		var win = $('#winBox');

		if(!win.attr('data-key','')){
			options.callback&&options.callback(win);
			return;
		}

		win.attr('data-key','');
		win.fadeOut(time,function(){
			win.hide();
			var left = parseInt($('#l_wrap').css('left').replace('px',''));
			$('#winBox').css({left:left+300+'px'});
			options.callback&&options.callback(win);
		});
		untrace();
	}

	/**
	 * @desc 打开窗口
	 * @param {Object} options  对象集合
	 * @param {Object} options.key  打开的模块
	 * @param {Object} options.time 打开时间
	 * @param {Object} options.width 窗口宽度
	 * @param {Object} options.url 窗口url
	 * @param {Object} options.title 窗口标题
	 * @return
	 */
	window.openWin = function(options){
		options = options?options:{};
		if(!options.key){
			return;
		}
		//动画时间
		var time = options.time?options.time:_default_win_time_open;
		//窗口宽度
		var width = options.width?options.width:_default_win_width;

		//url链接附加字符
		var _prefix = options.url.indexOf('?')>=0?'&':'?';

		/*width值水平滑出效果
		var win = $('#winBox').css('width','0px').show();
		win.find('.win_wrap').css('width',width+'px');
		//重置回调函数
		win.find('iframe').off().on('load',function(){
			console.log('onload');
			win.animate({width:width+'px'},time,function(){
				options.callback&&options.callback(win);
			});
		})
		*/
		/* faseIn效果
		var win = $('#winBox').css({'width':width+'px'}).css('opacity','0').show();
		win.find('.win_wrap').css('width',width+'px');
		//重置回调函数
		win.find('iframe').off().on('load',function(){
			console.log('onload');
			win.hide().css('opacity','1');
			win.fadeIn(time,function(){
				options.callback&&options.callback(win);
			});
		})
		*/
		/*width值css3水平滑出效果
		var win = $('#winBox');
		win.css({
			'transition' : 'none',
			'-webkit-transition' : 'none',
			'-ms-transition' : 'none'
		}).css('width','0px').show();
		win.find('.win_wrap').css('width',width+'px');
		//重置回调函数
		win.find('iframe').off().on('load',function(){
			console.log('onload');
			win.css({width:width+'px'});
		})
		win.off().on('transitionend',function(){
			options.callback&&options.callback(win);
		}).on('webkitTransitionEnd',function(){
			options.callback&&options.callback(win);
		});
		win.css({
			'transition' : 'width '+(time/1000)+'s',
			'-webkit-transition' : 'width '+(time/1000)+'s',
			'-ms-transition' : 'width '+(time/1000)+'s'
		});
		*/

		/*scale值css3弹出效果
		var win = $('#winBox');
		win.css({
			'transition' : 'none',
			'-webkit-transition' : 'none'
		}).css({
			'transform' : 'scale(0)',
			'-webkit-transform' : 'scale(0)'
		}).show();
		win.css({width:width+'px'});
		win.find('.win_wrap').css('width',width+'px');
		//重置回调函数
		win.find('iframe').off().on('load',function(){
			win.css({
				'transform' : 'scale(1)',
				'-webkit-transform' : 'scale(1)'
			});
		})
		win.off().on('transitionend',function(){
			options.callback&&options.callback(win);
		}).on('webkitTransitionEnd',function(){
			options.callback&&options.callback(win);
		});
		win.css({
			'transition' : 'transform '+(time/1000)+'s',
			'-webkit-transition' : '-webkit-transform '+(time/1000)+'s'
		});
		*/

		if(_isTransitions){
			//支持的话使用scale值css3弹出效果
			var win = $('#winBox');
			win.css({
				'transition' : 'none',
				'-webkit-transition' : 'none'
			}).css({
				'transform' : 'scale(0)',
				'-webkit-transform' : 'scale(0)'
			}).show();
			win.css({width:width+'px'});
			win.find('.win_wrap').css('width',width+'px');
			//重置回调函数
			win.find('iframe').css('visibility','hidden');
			win.find('.win_con div').show();
			win.find('iframe').off().on('load',function(){
				/*
				win.css({
					'transform' : 'scale(1)',
					'-webkit-transform' : 'scale(1)'
				});
				*/
				win.find('.win_con div').css('display','none');
				win.find('iframe').css('visibility','visible');
			});

			win.off().on('transitionend',function(){
				options.callback&&options.callback(win);
			}).on('webkitTransitionEnd',function(){
				options.callback&&options.callback(win);
			});
			win.css({
				'transition' : 'transform '+(time/1000)+'s',
				'-webkit-transition' : '-webkit-transform '+(time/1000)+'s'
			});
			win.css({
				'transform' : 'scale(1)',
				'-webkit-transform' : 'scale(1)'
			});
			//修改页面url
			win.find('iframe').attr('src',''+options.url+_prefix+'v='+_version);
		}else{
			//不支持的话使用width值水平滑出效果
			/*
			var win = $('#winBox').css('width','0px').show();
			win.find('.win_wrap').css('width',width+'px');
			//重置回调函数
			win.find('.win_con div').show();
			win.find('iframe').css('visibility','hidden');

			win.find('iframe').off().on('load',function(){
				win.find('.win_con div').css('display','none');
				win.find('iframe').css('visibility','visible');
			});
			win.animate({width:width+'px'},time,function(){
				options.callback&&options.callback(win);
			});
			*/
			var win = $('#winBox').css({'width':width+'px'});
			win.find('.win_wrap').css('width',width+'px');
			win.find('.win_con div').show();
			win.find('iframe').css('visibility','hidden').hide();
			//重置回调函数
			win.find('iframe').off().on('load',function(){
				win.find('.win_con div').css('display','none');
				win.find('iframe').css('visibility','visible');
			});
			win.fadeIn(time,function(){
				win.find('iframe').show().attr('src',''+options.url+_prefix+'v='+_version);
				options.callback&&options.callback(win);
			});
		}

		win.attr('data-key',options.key);
		win.find('h2 span').html(''+options.title);
		win.find('h2 a').hide();
		win.find('.win_close').off().on('click',function(){
			var _datakey = win.attr('data-key');
			if(_datakey&&_datakey=='wxpt_index'){
				try{
					_stat && _stat.track('wxpt_index_close');
				}catch(e){};
			}
			closeWin();
		});
	}

	//设置右侧窗口标题
	window.setWinTitle = function(title){
		$('#winBox_title').html(title);
	}

	//子窗口互调注册中心,key:注册的窗口id，约定是页面文件名，value:回调，所有数据是json
	var _listener = {};
	window.regListener = function(options){
		// if(!options){
		// 	return false;
		// }
		// if(!options.id){
		// 	return false;
		// }
		// _listener[''+options.id] = options.callback;
        return options && options.id ? _listener["" + options.id] = options.callback : false
	}
	window.unregListener = function(id){
		if(!id){
			return false;
		}
		_listener[''+id] = null;
	}
	window.callListener = function(options){
		if(!options){
			return false;
		}
		if(!options.id){
			return false;
		}
		var callback = _listener[''+options.id];
		callback&&callback(options.data);
	}

    regListener({
        id: "historyback",
        callback: function(e) {
            var winBox = $("#winBox");
            winBox.find(".win_back").off().on("click", function() {
                winBox.find(".win_back").hide();
                    history.back()
            });
                winBox.find(".win_back").show()
        }
	})

	//大屏打开
	window.openBigWin = function(options){
		var _callback = options.callback;
		function closeBigWin(){
			untrace();
			var left = parseInt($('#l_wrap').css('left').replace('px',''));
			$('#winBox').animate({left:left+300+'px'},400,function(){
				closeWin();
			});
		}
		options.callback = function(){
			var left = parseInt($('#l_wrap').css('left').replace('px',''));
			$('#winBox').animate({left:left+'px'},400,function(){
				_callback&&_callback();
			});
			trace(function(){
				closeBigWin();
			});
		}
		openWin(options);
		$('#winBox').find('.win_close').off().on('click',function(){
			closeBigWin();
		});
	}



	//标识当前正在显示的非首页的win()
	var _showedWin ='index';
	//切换到合作方界面(微官网etc)
	window.switchToOtherWin = function(options){
		options = options?options:{};
		if(!options.key){
			return;
		}
		//关闭相关窗口
		$('#l_wrap').hide().removeClass('transScale');
		$('#winBox').hide().attr('data-key','');
		$('#fullBox').hide();


		//动画时间
		var time = options.time?options.time:_default_win_time_open;
		//窗口宽度
		var width = options.width?options.width:_default_win_width;

		//url链接附加字符
		var _prefix = options.url.indexOf('?')>=0?'&':'?';

		//计算位置
		var left = (_vs.width - width) /2;
		left = left <0?0:left;

		var win = $('#otherBox');
		//使用scale值css3弹出效果
		if(_isTransitions){
			win.css({
				'transition' : 'none',
				'-webkit-transition' : 'none'
			}).css({
				'transform' : 'scale(0)',
				'-webkit-transform' : 'scale(0)',
				'left' : left+'px'
			}).show();
			win.css({width:width+'px'});
			win.find('.win_wrap').css('width',width+'px');
			//重置回调函数
			win.find('iframe').css('visibility','hidden');
			win.find('.win_con div').show();
			win.find('iframe').off().on('load',function(){
				win.find('.win_con div').css('display','none');
				win.find('iframe').css('visibility','visible');
			});

			win.off().on('transitionend',function(){
				options.callback&&options.callback(win);
			}).on('webkitTransitionEnd',function(){
				options.callback&&options.callback(win);
			});
			win.css({
				'transition' : 'transform '+(time/1000)+'s',
				'-webkit-transition' : '-webkit-transform '+(time/1000)+'s'
			});
			win.css({
				'transform' : 'scale(1)',
				'-webkit-transform' : 'scale(1)'
			});

			//修改页面url
			win.find('iframe').attr('src',''+options.url+_prefix+'t='+(new Date()).getTime());
		}else{
			win.css({
				'width':width+'px',
				'left' : left+'px'
			});
			win.find('.win_wrap').css('width',width+'px');
			win.find('.win_con div').show();
			win.find('iframe').css('visibility','hidden').hide();
			//重置回调函数
			win.find('iframe').off().on('load',function(){
				win.find('.win_con div').css('display','none');
				win.find('iframe').css('visibility','visible');
			});
			win.fadeIn(time,function(){
				win.find('iframe').show().attr('src',''+options.url+_prefix+'t='+(new Date()).getTime());
				options.callback&&options.callback(win);
			});
		}

		win.attr('data-key',options.key);
		win.find('h2 span').html(''+options.title);
		win.find('h2 a').hide();
		win.find('.win_close').off().on('click',function(){
			switchToIndex(function(){
				closeWin({
					isSwitch : true,
					callback : function(){
							if(_encodeUrl.length>0){
								var options={};
								options.key = 'wxpt_index';
								options.url = './wxpt_index.html?adimg='+_encodeUrl;
								options.title =  '首页';
								options.callback = function(){}
								openWin(options);
							}
					}
				});
			});
		});
		_showedWin = 'otherWin';
	}

	window.switchToIndex = function(callback){
		if('index' == _showedWin){
			callback && callback();
			return;
		}

		//关闭相应的窗口
		var win = $('#otherBox');
		if('fullWin' == _showedWin){
			var win = $('#fullBox');
		}
		win.attr('data-key','');
		$('#topbarinfo .topbar_funs a').removeClass('sel').eq(0).addClass('sel');
		$('#topbarinfo').data('tabIndex',0);
		win.fadeOut('fast',function(){
			win.hide();
			$('#l_wrap').off('transitionend webkitTransitionEnd').css({
				'transform' : 'scale(0)',
				'-webkit-transform' : 'scale(0)'
			}).addClass('transScale').fadeIn('slow',function(){
				!_isTransitions && callback && callback();
			});
			setTimeout(function(){
				$('#l_wrap').on('transitionend webkitTransitionEnd',function(event){
					var _con = $('span.nav_jt');
					if(!_con.is(event.target)&& _con.has(event.target).length == 0){
						callback && callback();
					}
				}).css({
					'transform' : 'scale(1)',
					'-webkit-transform' : 'scale(1)'
				});
			},200);
		}).find('iframe').attr('src','');
		_showedWin = 'index';
	}

	//打开全屏窗口
	window.switchToFullWin = function(options){
		if(!options.url){
			return;
		}
		//关闭相关窗口
		$('#l_wrap').hide().removeClass('transScale');
		$('#winBox').hide().attr('data-key','');
		$('#otherBox').hide();

		//动画时间
		var time = options.time?options.time:1000;

		var win = $('#fullBox');
		//使用scale值css3弹出效果
		if(_isTransitions){
			win.css({
				'transition' : 'none',
				'-webkit-transition' : 'none'
			}).css({
				'transform' : 'scale(0)',
				'-webkit-transform' : 'scale(0)'
			}).show();
			//重置回调函数
			win.find('iframe').css('visibility','hidden');
			win.find('.loading').show();
			win.find('iframe').off().on('load',function(){
				win.find('.loading').hide();
				win.find('iframe').css('visibility','visible');
			});

			win.off().on('transitionend',function(){
				options.callback&&options.callback(win);
			}).on('webkitTransitionEnd',function(){
				options.callback&&options.callback(win);
			});
			win.css({
				'transition' : 'transform '+(time/1000)+'s cubic-bezier(0.32,0.78,0.66,1)',
				'-webkit-transition' : '-webkit-transform '+(time/1000)+'s cubic-bezier(0.32,0.78,0.66,1)'
			});

			setTimeout(function(){
				win.css({
					'transform' : 'scale(1)',
					'-webkit-transform' : 'scale(1)'
				});

				//修改页面url
				win.find('iframe').attr('src',''+options.url);
			},100);

		}else{
			win.find('.loading').show();
			win.find('iframe').css('visibility','hidden').hide();
			//重置回调函数
			win.find('iframe').off().on('load',function(){
				win.find('.loading').hide();
				win.find('iframe').css('visibility','visible');
			});
			win.fadeIn(time,function(){
				win.find('iframe').show().attr('src',''+options.url);
				options.callback&&options.callback(win);
			});
		}
		//处理是否显示关闭
		if(options.isClose){
			win.find('.fullbox_close').show().off().on('click',function(){
				switchToIndex();
			});
		}else{
			win.find('.fullbox_close').hide();
		}
		_showedWin = 'fullWin';
	}




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
		var textAlign = _options.textAlign?_options.textAlign:'center';

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
			}).show();
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

		var rate1 = width/(height-_offset.top*2);
		var rate2 = (width - _offset.width*2)/height;
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

		}else{
			_picshow.reset(urls);
		}
		_picshow.show(index?index:0);
		//box.popupOpen();
		box.show();
	}

	/**
	 * @desc 提供特殊函数给子窗口调用
	 * @param {Object} options  对象集合
	 * @return
	 */
	window.handleFrameCall = function(data){
		if(data.cmd == 'wgw_show_tips'){
			showHongbaoPop();
		}else if(data.cmd = 'hongbao_go_wgw'){
			$('#topwgwBtn').trigger('click');
		}
	}
	//注册全局消息通信事件处理函数

	window.addEventListener('message',function(e){
		if(e.origin.indexOf('.qq.com')>0){
			//引入了QQ插件
			return;
		}
		if(!e.origin.indexOf('.weixiao100.cn')>=0){
			//非来源weixiao100.cn的消息不作处理
			return;
		}
		var _data = e.data;
		if(!_data){
			return;
		}
		_data = JSON.parse(_data);
		handleFrameCall(_data);
	},false);


	//------------------------------window方法 end--------------------------------//

	//------------------------------活动插件方法 begin----------------------------//

	// 全局标识，是否第一次访问微官网
	var isFirst=false;
	function checkFirstWgw(callback){
		var _checkkey = 'weixiao100wgwfirstcheck' + MD5.md5(_common.getUuid());
		var first = localStorage.getItem(_checkkey);
		//测试
		if('1' != first){
			isFirst=true;
			showWgwIntro(callback);
			localStorage.setItem(_checkkey,'1');
		}else{
			callback && callback();
		}
	}
	//展示微官网引导步骤
	function showWgwIntro(callback){
		$('#l_wrap,#fullBox').hide();

		var barH = $('#topbar').height();
		var _top =  barH + (_vs.height - barH - 537)/2;
		$('#mask').css({
			position : 'fixed',
			top : barH+'px',
			width : '100%',
			height : (_vs.height - barH)+'px',
			background : '#000',
			opacity:'0.45',
			'z-index':200
		}).show();
		$('#wgwIntro').css({
			top : _top+'px'
		}).fadeIn();

		var imgIndex = 0;
		var imgs = $('#wgwIntro img');
		imgs.eq(0).show();
		imgs.off().on('click',function(){
			imgs.hide();
			imgIndex++;
			if(imgIndex >2){
				$('#mask,#wgwIntro').hide();
				callback && callback();
			}else{
				imgs.eq(imgIndex).show();
			}
		});
	}
	//展示红包tips
	function showHongbaoPop(){
		var win = $('#hongbaoPop');
		win.find('.hbpop_close,.hbpop_btn').off().on('click',function(){
			win.popupClose();
		});
		win.popupOpen();
	}

	//------------------------------活动插件方法 end------------------------------//

	//业务入口
	applyUserInfo();

	//临时测试代码
	/*
	_common.post(_SERVICE+'/webapp/xxxx',params,function(rtn){
		if('001' == rtn.resultCode){

		}else if('202' == rtn.resultCode){
			_common.lostLogin();
		}else{
			showMsg(rtn.resultMsg);
		}
	});
	*/
	module.exports = qt_model;

});
