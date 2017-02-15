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
	var qt_valid = require('qt/valid');
	var MD5 = require('qt/md5');
	var _common = require('./common');
	var _config = require('./config');
	var wxani = require('./animate.js');
	//七鱼
	var Modernizr = require('../plugin/modernizr/modernizr');
	var _isTransitions = Modernizr.csstransitions;
	var _isTransform = Modernizr.csstransforms;


	//视口尺寸
	var _vs = qt_util.getViewSize();

	//是否测试环境
	var isDev = _config.isDev;

	//服务
	var _SERVICE = _config.SERVICE2;
	//登录专用服务
	var _LOGIN_SERVICE = isDev?'//uww-dev.qtonecloud.cn/v2/oauth/token':'//uww-pro.qtonecloud.cn/v2/oauth/token';
	/**
	 * @desc 初始化用户信息
	 * @return 
	 */
	function initPage(){
		if(qt_cookie.getCookie('user_info_json')){
			location.href='./index.html';
			return;
		}
		handleQrCodeLogin();
		initPswLogin();

		//登录方式切换
		var tabs = $('.login_tit_m a');
		var boxs = $('.login_zhangmi,.login_weixin');
		tabs.off().on('click',function(){
			var _this = $(this);
			if(_this.hasClass('sel')){
				return;
			}
			var index = tabs.index(this);
			if(1 == index && '1' != _this.attr('data-init')){
				_this.attr('data-init','1');
				initQrLogin();
			}
			$('.login_Scanok').hide();
			tabs.removeClass('sel');
			_this.addClass('sel');
			boxs.hide().eq(index).fadeIn();
		});

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

		// 链接忘记密码
		$('#forget_password').on('click',function(e){
			e.preventDefault();
			location.href='./forget_password.html';
		});
		
		//首页
		$('#setHomeBtn').click(function(){
			var _url = location.href;
			var _this = this;
			try{  
				_this.style.behavior = 'url(#default#homepage)';
				_this.setHomePage(_url);
			}catch(e){  
				if (window.netscape) {  
					try {  
						netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");  
					}catch(e){  
						_common.tips("此操作被浏览器拒绝！\n请在浏览器地址栏输入“about:config”并回车\n然后将[signed.applets.codebase_principal_support]设置为'true'");  
					}  
					var prefs = Components.classes['@@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);  
					prefs.setCharPref('browser.startup.homepage',_url);  
				}  
			}
		});

		// 刷新页面判断当前位置是否为播放动画位置
		playAnimation();
		//滚动到动画元素后并播放动画
		$(window).on("scroll", function() {
   			playAnimation();
		});

		initKefu();
	}

	

	//初始化账号密码登录
	function initPswLogin(){
		var _key = 'weixiao100cnloginname';
		//绑定登录
		$('#loginBtn').off().click(function(){
			if(window.notSupportBrowser){
				alert('不支持IE8以下的浏览器，请升级您的浏览器，\n如果您正使用双核浏览器，请切换到极速模式。');
				return;
			}
			var _this = $(this);
			if(applying){
				return;
			}
			var _username = $.trim($('#username').val());
			var _password = $.trim($('#password').val());

			if(!/^\w{5,15}$/.test(_username)){
				_common.tips('请填入正确的登录用户名');
				return false;
			}
			if(!_password){
				_common.tips('请填入登录密码');
				return false;
			}
			if($('#remenberName').hasClass('login_mm_checked')){
				window.localStorage?localStorage.setItem(_key,_username):qt_cookie.setCookie(_key,_username,{expires:'forever'});
			}else{
				window.localStorage?localStorage.removeItem(_key):qt_cookie.delCookie(_key);
			}
			var params = {
                username : _username,
                password: _password
			}
			setApplyTimer();
			_this.html('正在登录中');
			_common.showProgress();
			// var params = {
			// 	//product : 'weixiao',
			// 	client_id : isDev?'demo':'wx_jxhd',
			// 	client_secret : isDev?'demo':'wx_jxhd',
			// 	grant_type : 'password',
			// 	scope : 'read',
			// 	username : _username,
			// 	password: MD5.md5(_password).toLowerCase()
			// }
			console.log(_SERVICE);
			$.ajax(_SERVICE+'/userlogin',{
				crossDomain : true,
				data : params,
				dataType : 'json',
				error : function(XMLHttpRequest, textStatus, errorThrown){
					clearApplyTimer();
					_common.hideProgress();
					_this.html('登录');
				},
				success : function(rtn, textStatus, jqXHR){
					if('001' == rtn.resultCode){
						var token = rtn.rtnData[0].token;
                        var userId = rtn.rtnData[0].userId;
						_common.setToken(token);
						pushToken(token);
						setTimeout(function(){
                            if(userId){
                                qt_cookie.setCookie('user_info_json',userId);
                                location.href='./index.html?t='+(new Date()).getTime();
                            }else{
                                _common.tips('您没有使用本系统的权限');
                            }
						},1000);
					}else if('000' == rtn.resultCode){
                        _common.lostLogin();
                    }else{
                        clearApplyTimer();
                        _common.hideProgress();
                        _common.tips(rtn.resultMsg);
                        _this.html('登录');
                    }
				},
				statusCode : {
					400 : function(XMLHttpRequest){
						//console && console.log(XMLHttpRequest.responseJSON.bizData.message);
						_common.tips('登录失败，请检查账号密码是否正确');
					}
				}
			});
			return false;
		});

		// 绑定记住密码按钮
		$('#remenberName').click(function(){
			$('#remenberName').toggleClass('login_mm_checked');
		});

		//绑定用户名输入回车键
		$('#username').off().on('keyup',function(e){
			if(13 == e.keyCode){
				$('#password').focus();
			}
		});

		//绑定密码输入回车键
		$('#password').off().on('keyup',function(e){
			if(13 == e.keyCode){
				$('#loginBtn').trigger('click');
			}
		});
		

		var _autoname = window.localStorage?localStorage.getItem(_key):qt_cookie.getCookie(_key);
		if(_autoname){
			$('#username').val(_autoname);
			$('#remenberName').addClass('login_mm_checked');
		}
	}

	//初始化扫码登录
	function initQrLogin(){
		var unique = (new Date()).getTime();
		var url = 'http://uclogin.qtonecloud.cn/wxoauth/portal/qkyzhxy/deal?loginid=wxlogin&forwardid=uc_wxpc&unique='+unique;
		if(_config.isDev){
			url = 'http://uclogin.qtonecloud.cn/wxserver/portal/qkyzhxy/deal?loginid=wxlogin&forwardid=uc_wxpc&unique='+unique;
		}
		var href = _SERVICE+'/css/login_wxqr.css?v='+seajs.data.project_version;
		if(!/^https/.test(href)){
			href = href.replace('http','https');
		}
		if(/local/.test(location.hostname)){
			href='https://dev.weixiao100.cn/frontstest/test/qr/login_wxqr.css?v='+(new Date()).getTime();
		}
		var obj = new WxLogin({
			id:"qrcodeCon", 
			appid: "wx39ae560f233212fe",
			redirect_uri: encodeURIComponent(url), 
			scope: "snsapi_login",
			state: "wxlogin",
			style: "",
			href: href
		});
	}

	//处理扫码登录结果
	function handleQrCodeLogin(){
		var status_code = qt_util.P('status_code');
		var token = qt_util.P('token');
		if(!status_code){
			switchLoginType(0);
			return;
		}
		if('1000' == status_code && token){
			$('.login_tit_m a').removeClass('sel').eq(1).addClass('sel');
			$('.login_zhangmi,.login_weixin').hide();
			$('.login_Scanok').show();
			_common.setToken(token);
			pushToken(token);
			if(_isTransitions){
				setTimeout(function(){
					$('.progress_ing').css('width','100%');
				},5);
			}else{
				$('.progress_ing').animate({
					width : '100%'
				},2000);
			}
			setTimeout(function(){
				getUserInfo();
			},2000);
		}else{
			switchLoginType(0);
			//失败的情况
			var msg = '';
			var btnText = '确定';
			switch(status_code){
				case '1001' : msg = '对不起，您当前不是学校的教师或管理员身份，<br/>无法登录本平台。';break;
				case '1002' : msg = '没有关注企业号';break;
				case '1003' : msg = '您还未进行扫码登录授权，请查看扫码登录的操作<br/>教程，我们将引导您进行设置，谢谢！';btnText='操作教程';break;
				case '1004' : msg = '授权失败';break;
				case '1101' : msg = '参数错误';break;
				case '1100' : msg = '未知异常';break;
				default: msg = '未知异常';break;
			}
			showQrMsg({
				msg : msg,
				btnText : btnText,
				callback : function(){
					if('1003' == status_code){
						//showQrhelp();
						return true;
					}else{
						location.href=location.href.replace(/\?.*/,'');
						return false;
					}
				}
			});
		}

	}


	//切换到登录类型
	function switchLoginType(index){
		var tabs = $('.login_tit_m a');
		var boxs = $('.login_zhangmi,.login_weixin');
		tabs.removeClass('sel').eq(index).addClass('sel');
		$('.login_Scanok').hide();
		boxs.hide().eq(index).show();
	}


	// 播放一次动画
	function playAnimation(){
		$('.func_box,.app_box').each(function(index,obj) {
			var _this = $(this);
			var _wxaniCount = _this.attr('data-init');
			if('1' != _wxaniCount){
				if (isScrolledIntoView(this)) {
        			wxani.wxAnimate(this);
        			_this.attr('data-init','1');
				}
			}
    	});
	}

	//判断元素是否在当前视口
	function isScrolledIntoView(elem) {
		var _window = $(window);
        var docViewTop = _window.scrollTop();
		var docViewBottom = docViewTop + _vs.height;
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).outerHeight();

		var upper_Boundary = elemTop>docViewTop && elemTop<docViewBottom;
		var lower_Boundary = elemBottom>docViewTop && elemBottom<docViewBottom;
		return upper_Boundary || lower_Boundary;
	}


	//推送token
	function pushToken(token){
		var _now = (new Date()).getTime();
		var _url = _SERVICE+'/webapp/comm/setToken?access_token='+token+'&_='+_now;
		var img = new Image();
		img.src=_url;
		//$("body").append('<script type="text/javascript" src="'+_url+'"></script>');
	}



	//获取并填充用户信息
	function getUserInfo(){
		_common.post(_SERVICE+'/getLoginUserInfo',{},function(rtn){
			clearApplyTimer();
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var userId = rtn.userId;
				if(userId){
					qt_cookie.setCookie('user_info_json',userId);
					location.href='./index.html?t='+(new Date()).getTime();
				}else{
					_common.tips('您没有使用本系统的权限');
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
			$('#loginBtn').html('登录');
		});
	}

	//是否登录中
	var applying = false;
	var applyTimer = null;
	function setApplyTimer(){
		applying = true;
		applyTimer && clearTimeout(applyTimer);
		applyTimer = setTimeout(function(){
			_common.tips('登录接口服务调用超时，请刷新页面重试！');
			clearApplyTimer();
		},60000);
	}
	function clearApplyTimer(){
		applying = false;
		applyTimer && clearTimeout(applyTimer);
		$('#loginBtn').html('登录');
	}


	//显示扫码结果
	function showQrMsg(options){
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
		var msg = _options.msg;
		var callback = _options.callback;
		var btnText = _options.btnText?_options.btnText:'关闭';
		var mask = _options.mask === false?false:true;
		var textAlign = _options.textAlign?_options.textAlign:'center';

		var box = $('#qrmsgPop');
		box.find('#qrmsgPop_msg').html(''+msg).css('text-align',textAlign);

		box.find('#qrmsgPop_Btn').html(''+btnText).off().click(function(e){
			box.popupClose();
			if(callback){
				return callback();
			}else{
				return false;
			}
		});
		box.find('.a_close').off().click(function(){
			box.popupClose();
		});

		box.popupOpen({
			speed : 200,
			mask : mask,
			maskColor : '#222'
		});
	}
	//显示教程
	function showQrhelp(){
		var box = $('#qrhelpPop');
		box.find('#qrhelpPop_Btn').off().click(function(){
			box.popupClose();
		});
		box.find('.a_close').off().click(function(){
			box.popupClose();
		});
		box.popupOpen({
			speed : 200,
			mask : true,
			maskColor : '#222'
		});
	}


	//初始化QQ客服
	function initKefu(){
		/*不再使用QQ客服
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
		// 展示微信二维码
		var wxTimer = null;
		$('#add_qrcode').hover(function(){
			wxTimer && clearTimeout(wxTimer);
			$('.scan_cade').fadeIn(200);
		},function(){
			wxTimer && clearTimeout(wxTimer);
			wxTimer = setTimeout(function(){
				$('.scan_cade').fadeOut(200);
			},150);
		});
		
		// 展示微校门户微信二维码
		var wxQrTimer = null;
		$('#wx_follow').hover(function(){
			wxQrTimer && clearTimeout(wxQrTimer);
			$('.pop_code1').fadeIn(200);
		},function(){
			wxQrTimer && clearTimeout(wxQrTimer);
			wxQrTimer = setTimeout(function(){
				$('.pop_code1').fadeOut(200);
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




	//业务入口
	initPage();
	
	qt_model.getCustomerInfo = function(){
		return customerInfoData?customerInfoData:{};
	}
	module.exports = qt_model;

});
