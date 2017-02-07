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
	var _common = require('./common');
	var _config = require('./config');
	var qt_util = require('qt/util');
	var qt_cookie = require('qt/cookie');
	var qt_md5 = require('qt/md5');
	var qt_valid = require('qt/valid');


	//视口尺寸
	var _vs = qt_util.getViewSize();

	//服务
	var _SERVICE = _config.SERVICE;

	/**
	 * @desc 初始化用户信息
	 * @return 
	 */
	function initPage(){
		var _key = 'adminweixiao100cnloginname';
		//绑定登录
		var applying = false;
		$('#loginBtn').off().click(function(){
			if(applying){
				return;
			}
			var _this = $(this);
			var _username = $.trim($('#username').val());
			var _pwd = $.trim($('#pwd').val());

			/*if(!/^a?1([3456789])\d{9}$/.test(_username)){
				_common.tips('请填入登录手机号');
				return false;
			}*/
			if(!_pwd){
				_common.tips('请填入登录密码');
				return false;
			}

			if($('#remenberName')[0].checked){
				window.localStorage?localStorage.setItem(_key,_username):qt_cookie.setCookie(_key,_username,{expires:'forever'});
			}else{
				window.localStorage?localStorage.removeItem(_key):qt_cookie.delCookie(_key);
			}

			

			/*var _LOGIN_SERVICE = '//uww-pro.qtonecloud.cn/v2/oauth/token';
			_LOGIN_SERVICE = _config.isDev?'//uww-dev.qtonecloud.cn/v2/oauth/token':_LOGIN_SERVICE;
			_LOGIN_SERVICE = _config.isTest?'//uww-test.qtonecloud.cn/v2/oauth/token':_LOGIN_SERVICE;
			var params = {
				product : 'weixiao',
				client_id : 'weixiao',
				client_secret : 'weixiao',
				grant_type : 'password',
				scope : 'read',
				username : _username,
				password: qt_md5.md5(_pwd).toLowerCase()
			}*/
            var _LOGIN_SERVICE = '192.168.30.190:8099';
            var params = {
                username : _username,
                password: _pwd
            };
			/*
			$.getJSON(_LOGIN_SERVICE,params,function(rtn){
				_common.hideLoading();
				applying = false;
				if('0000000' == rtn.rtnCode){

					var token = rtn.bizData.value;
					_common.setToken(token);
					pushToken(token);
					getUserInfo();
				}else{
					_common.tips(rtn.msg);
				}
			});
			*/
			setApplyTimer();
			_this.html('正在登录中');
			_common.showLoading();
			$.ajax('/api/auth/login.do',{
				crossDomain : true,
				data : params,
				dataType : 'json',
				error : function(XMLHttpRequest, textStatus, errorThrown){
					clearApplyTimer();
					_common.hideLoading();
					_this.html('登录');
				},
				success : function(rtn, textStatus, jqXHR){
                    _common.hideLoading();
					if('0000000' == rtn.rtnCode){
                        var userinfo = rtn.bizData.userInfo;
						var token = rtn.bizData.value;
						_common.setToken(token);
                        pushToken(token);
                        _common.sessionSet('user',JSON.stringify(userinfo));
                        _common.setUserName(userinfo.name);
                        location.href='./index.html';
					}else if("202" == jqXHR.textStatus ) {
                        _common.lostLogin();
                    }else{
						clearApplyTimer();
						_common.hideLoading();
						_common.tips("密码错误");
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

		var _autoname = window.localStorage?localStorage.getItem(_key):qt_cookie.getCookie(_key);
		if(_autoname){
			$('#username').val(_autoname);
			$('#remenberName')[0].checked = true;
		}
	}

	//推送token
	function pushToken(token){
		var _now = (new Date()).getTime();
		var _url = 'http://ucw-pro.qtonecloud.cn/admin?access_token='+token+'&_='+_now;
		if(_config.isDev){
			_url = 'http://ucw-dev.qtonecloud.cn/admin?access_token='+token+'&_='+_now;
		}
		if(_config.isTest){
			_url = 'http://ucw-test.qtonecloud.cn/admin?access_token='+token+'&_='+_now;
		}
		$("body").append('<script type="text/javascript" src="'+_url+'"></script>');
	}

	//获取并填充用户信息
	function getUserInfo(){
		_common.showLoading();
		_common.post(_SERVICE+'/api/user/getUserInfo.do',{},function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var userinfo = rtn.bizData;
				_common.sessionSet('user',JSON.stringify(userinfo));
				_common.setUserName(userinfo.userName);
				location.href='./index.html';
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.rtnMsg);
			}
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
	*/
	module.exports = qt_model;

});
