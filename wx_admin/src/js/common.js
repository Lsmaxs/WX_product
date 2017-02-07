define(function(require, exports, module) {

	/**
	 * @desc 项目内公用库，提供项目内的通用接口
	 * @exports
	 * @version 2.7.5
	 * @author
	 * @copyright Copyright 2014-2015
	 *
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_cookie = require('qt/cookie');
	var _config = require('./config');
	require('jquery/json');
	require('jquery/popup');
	var Modernizr = require('../plugin/modernizr/modernizr');

	//错误tips提示
	var Toastr = require('../plugin/toastr/toastr');
	var NProgress = require('../plugin/nprogress/nprogress');
	NProgress.configure({trickleRate:0.05,trickleSpeed:800,showSpinner:false});

	var _isTransitions = Modernizr.csstransitions;
	var _isTransform = Modernizr.csstransforms;


	//服务
	qt_model.SERVICE = _config.SERVICE;
	qt_model.UPLOADSERVICE = _config.UPLOADSERVICE;

	//本地存储
	var sessionStorage = window.sessionStorage;
		//本地会话数据获取
	function _sessionGet(key,isCookie){
		return sessionStorage&&!isCookie?sessionStorage.getItem(key):qt_cookie.getCookie(key);
	}
	//本地会话数据设置
	function _sessionSet(key,value,isCookie){
		sessionStorage&&!isCookie?sessionStorage.setItem(key,value):qt_cookie.setCookie(key,value);
	}
	//本地会话数据删除
	function _sessionDel(key,isCookie){
		sessionStorage&&!isCookie?sessionStorage.removeItem(key):qt_cookie.delCookie(key);
	}
	qt_model.sessionGet = _sessionGet;
	qt_model.sessionSet = _sessionSet;
	qt_model.sessionDel = _sessionDel;
	/**
	 * @desc 获取登录用户唯一标识access_token
	 * @return
	 */
	qt_model.getToken= function(){
		return _sessionGet('access_token',true);
	}

	/**
	 * @desc 设置登录用户唯一标识access_token
	 * @return
	 */
	qt_model.setToken= function(token){
		_sessionSet('access_token',token,true);
	}

	/**
	 * @desc 获取登录用户名称
	 * @return
	 */
	qt_model.getUserName= function(){
		return _sessionGet('userName');
	}
	/**
	 * @desc 设置登录用户名称
	 * @return
	 */
	qt_model.setUserName= function(userName){
		_sessionSet('userName',userName);
	}

	/**
	 * @desc 获取登录用户头像url
	 * @return
	 */
	qt_model.getHeadUrl = function(){
		var icon = _sessionGet('headPortraitUrl');
		return (icon&&icon!='null'&&icon!='undefined')?icon:qt_model.getDefaultHeadUrl();
	}

	/**
	 * @desc 设置登录用户头像url
	 * @return
	 */
	qt_model.setHeadUrl = function(headUrl){
		_sessionSet('headPortraitUrl',headUrl);
	}

	/**
	 * @desc 获取默认的登录用户头像url
	 * @return
	 */
	qt_model.getDefaultHeadUrl = function(){
		return './images/user_pace.png';
	}

	/**
	 * @desc 丢失登录态通用处理方法
	 * @return
	 */
	qt_model.lostLogin = function(){
		//清除所有前端数据
		qt_model.clearStatus();

		//弹出消息提示框
		qt_model.showMsg({
			msg : '登录超时，需要重新登录！',
			icourl : 'warn',
			btnText : '重新登录',
			callback : function(){
				qt_model.goLogin();
			}
		});
	}

	/**
	 * @desc 清空用户所有状态信息
	 * @return
	 */
	qt_model.clearStatus = function(){
		//清除所有前端数据
		sessionStorage.clear();
		qt_cookie.delCookie('access_token');
		qt_cookie.delCookie('userName');
		qt_cookie.delCookie('headPortraitUrl');
	}

	/**
	 * @desc 返回登录页面
	 * @return
	 */
	qt_model.goLogin = function(){
		qt_model.clearStatus();
		window.top.location.href= './login.html';
		/*
		qt_model.post(qt_model.SERVICE+'/logout',{},function(){
			window.top.location.href= qt_model.SERVICE+'/index';
		});
		setTimeout(function(){
			//8秒内接口不响应，认为出错，直接返回登录页
			window.top.location.href= qt_model.SERVICE+'/index';
		},8000);
		*/
	}


	 /**
	 * @desc 代理提交，方便统一修改
	 * @return
	 */
	qt_model.post = function (url, params, callback) {
		var _params = {
			style: '',//不知道有什么用的参数
			data: params,
			clientInfo: {}//不知道有什么用的参数
		}
		$.ajax(url, {
			type: 'POST',
			data: JSON.stringify(_params),
			contentType: 'application/json;charset=UTF-8',
			dataType: 'json',
			success: function (rtn) {
				callback && callback(rtn);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				var responseText = XMLHttpRequest.responseText;
				if (/^(Token)?\?+/.test(responseText)) {
					//暂时这样判断登录问题
					//Token????
					//console && console.log('debug:error:'+responseText);
					qt_model.lostLogin();
				}
			}
		});
	};

    /**
     * @desc 代理提交，方便统一修改
     * @return
     */
    qt_model.get = function(url,params,callback){
        $.ajax(url,{
            type : 'get',
            contentType : 'application/json;charset=UTF-8',
            dataType :'json',
            success : function(rtn){
                callback && callback(rtn);
            },
            error : function(XMLHttpRequest, textStatus, errorThrown){
                var responseText = XMLHttpRequest.responseText;
                //console.log(XMLHttpRequest);
                if(XMLHttpRequest.statusText == "error"){
                    qt_model.lostLogin();
				}
                if(/^(Token)?\?+/.test(responseText)){
                    //暂时这样判断登录问题
                    //Token????
                    //console && console.log('debug:error:'+responseText);
                    qt_model.lostLogin();
                }
            }
        });
    }
	/**
	 * @desc jsonp提交
	 * @return
	 */
	qt_model.jsonp = function(url,params,callback){
		$.ajax({
			url: url,
			data : params,
			dataType :'jsonp',
			success : function(rtn){
				callback && callback(rtn);
			}
		});
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
	qt_model.showMsg = function(options){
		//马上校验
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

	/**
	 * @desc 弹窗展示图片(实际委托给父窗口)
	 * @return
	 */
	qt_model.showImgs = function(urls,index){
		parent.showImgs && parent.showImgs(urls,index);
	}

	/**
	 * @desc 通用消息提示
	 * @param {Object} level tips等级
	 * @param {Object} msg 消息内容
	 * @param {String} options.msg
	 * @return
	 */
	qt_model.tips = function(level,msg,options){
		var _msg = msg?msg:level;
		var _level = msg?level:'error';
		if(!_msg){
			return;
		}
		var _options = {
			"closeButton": false,
			"debug": false,
			"newestOnTop": false,
			"progressBar": false,
			"positionClass": "toast-bottom-center",
			"preventDuplicates": false,
			"onclick": null,
			"showDuration": "300",
			"hideDuration": "1000",
			"timeOut": "2000",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		}
		_options = $.extend(true,_options,options?options:{});
		Toastr.options = _options;
		Toastr[_level]&&Toastr[_level](_msg);
	}

	//通用显示loading
	qt_model.showLoading = function(){
		NProgress.start();
	}
	//通用隐藏loading
	qt_model.hideLoading = function(){
		NProgress.done();
	}


	//禁止返回键
	qt_model.stopBackspace = function(){
		$(document).on('keydown',function(e){
			var _tag = e.target.tagName.toLowerCase();
			var isAllow = ('input' == _tag || 'textarea' == _tag);

			if((8 == e.keyCode && !isAllow) || (e.altKey) || ((e.ctrlKey) && ((e.keyCode == 78) || (e.keyCode == 82)) ) || (e.keyCode == 116) ){
				return false;
			}
		});
	}

	//前端打星号
	qt_model.fillStar = function(phoneno){
		if(!phoneno){
			return phoneno;
		}
		var str = phoneno.substring(0,3) + '****'+ phoneno.substring(7);
		return str;
	}


	//格式化日期
	qt_model.formateDate = function(longtime){
		var _date = new Date(longtime);
		var _year = _date.getFullYear();
		var _month = _date.getMonth()+1;
		var _day= _date.getDate();
		var _hour = _date.getHours();
		var _min = _date.getMinutes();
		var _second = _date.getSeconds();
		_month = _month<10?'0'+_month:_month;
		_day = _day<10?'0'+_day:_day;
		_hour = _hour<10?'0'+_hour:_hour;
		_min = _min<10?'0'+_min:_min;
		_second = _second<10?'0'+_second:_second;
		return _year+'-'+_month+'-'+_day+' '+_hour+':'+_min+':'+_second;
	}

	//------------------------------window方法 begin------------------------------//
	/**
	 * @desc 图片居中自适应处理函数，使用条件是img必须有父元素作为wrapper
	 * @param {Object} img  要做自适应的图片dom对象，一般在<img onload="winFixImg(this);" />中使用
	 * @return
	 */
	window.winFixImg  = function(img){
		var _width = img.width;
		var _height = img.height;
		var _img = $(img);
		var _parent = _img.parent();
		var _pWidth = _parent.width();
		var _pHeight = _parent.height();
		if(!_pWidth){
			_pWidth = parseInt(_parent.css('width').replace('px'));
		}
		if(!_pHeight){
			_pHeight = parseInt(_parent.css('height').replace('px'));
		}

		var rate = _pWidth/_pHeight;
		var imgrate = _width/_height;

		var translateX = 0;
		var translateY = 0;
		var tWidth = _pWidth;
		var tHeight = _pHeight;

		if(imgrate >= rate){
			//图片比默认比率更宽，需要水平偏移
			tWidth = _width * tHeight / _height ;
			translateX = (_pWidth - tWidth)/2;
		}else{
			//图片比默认比率更高，需要垂直偏移
			tHeight = _height * tWidth / _width;
			translateY = (_pHeight - tHeight)/2;
		}

		//微校只支持IE9+,直接使用transform,如需兼容IE8,需要修改
		_parent.css({
			'overflow' : 'hidden'
		});
		if(_isTransform){
			_img.css({
				'width' : tWidth+'px',
				'height' : tHeight +'px',
				'transform' : 'translate('+translateX+'px,'+translateY+'px)',
				'-ms-transform' : 'translate('+translateX+'px,'+translateY+'px)',
				'-webkit-transform' : 'translate('+translateX+'px,'+translateY+'px)'
			});
		}else{
			_img.css({
				'width' : tWidth+'px',
				'height' : tHeight +'px',
				'left' : translateX+'px',
				'top' : translateY+'px',
				'position' : 'relative'
			});
		}
	}

	/**
	 * @desc 图片加载错误设置默认图片
	 * @param {Object} img  要做处理的图片dom对象，一般在<img onerror="winErrorImg(this);" />中使用
	 * @return
	 */
	window.winErrorImg  = function(img){
		img.src='./images/default.jpg';
	}


	//------------------------------window方法 end--------------------------------//


	module.exports = qt_model;

});
