define(function(require, exports, module) {

	/**
	 * @desc 项目内公用库，提供项目内的通用接口
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
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
	//日历控件
	require('../plugin/laydate/laydate');

	//统计
	require('./stat');

	//服务
	//qt_model.SERVICE = _config.SERVICE;//线上使用
	qt_model.SERVICE = _config.SERVICE2;//开发使用
	qt_model.UPLOADSERVICE = _config.UPLOADSERVICE;

	//本地存储
	var sessionStorage = window.sessionStorage;
	//本地会话数据获取
	function _localGet(key,isCookie){
		return sessionStorage&&!isCookie?sessionStorage.getItem(key):qt_cookie.getCookie(key);
		//return qt_cookie.getCookie(key);
	}
	//本地会话数据设置
	function _localSet(key,value,isCookie){
		sessionStorage&&!isCookie?sessionStorage.setItem(key,value):qt_cookie.setCookie(key,value);
		//qt_cookie.setCookie(key,value);
	}
	//本地会话数据删除
	function _localDel(key,isCookie){
		sessionStorage&&!isCookie?sessionStorage.removeItem(key):qt_cookie.delCookie(key);
	}

	qt_model.localGet = _localGet;
	qt_model.localSet = _localSet;
	qt_model.localDel = _localDel;
	

	/**
	 * @desc 获取登录用户唯一标识access_token
	 * @return 
	 */
	qt_model.getToken= function(){
		return _localGet('access_token',true);
	}

	/**
	 * @desc 设置登录用户唯一标识access_token
	 * @return 
	 */
	qt_model.setToken= function(token){
		_localSet('access_token',token,true);
	}

	/**
	 * @desc 获取登录用户唯一标识
	 * @return 
	 */
	qt_model.getUuid= function(){
		return _localGet('uuid');
	}

	/**
	 * @desc 设置登录用户唯一标识
	 * @return 
	 */
	qt_model.setUuid= function(uuid){
		_localSet('uuid',uuid);
	}

	/**
	 * @desc 获取登录用户学校标识
	 * @return 
	 */
	qt_model.getSchoolCode= function(){
		return _localGet('schoolCode');
	}
	/**
	 * @desc 设置登录用户学校标识
	 * @return 
	 */
	qt_model.setSchoolCode= function(schoolCode){
		_localSet('schoolCode',schoolCode);
	}
	/**
	 * @desc 删除登录用户学校标识
	 * @return 
	 */
	qt_model.delSchoolCode= function(){
		_localDel('schoolCode');
	}
	/**
	 * @desc 获取所在学校名
	 * @return 
	 */
	qt_model.getSchoolName = function(){
		return _localGet('schoolName');
	}

	/**
	 * @desc 设置所在学校名
	 * @return 
	 */
	qt_model.setSchoolName = function(schoolName){
		_localSet('schoolName',schoolName);
	}

	/**
	 * @desc 获取登录用户名称
	 * @return 
	 */
	qt_model.getUserName= function(){
		return _localGet('userName');
	}
	/**
	 * @desc 设置登录用户名称
	 * @return 
	 */
	qt_model.setUserName= function(userName){
		_localSet('userName',userName);
	}


	/**
	 * @desc 获取登录用户头像url
	 * @return 
	 */
	qt_model.getHeadUrl = function(){
		var icon = _localGet('headPortraitUrl');
		return (icon&&icon!='null'&&icon!='undefined')?icon:qt_model.getDefaultHeadUrl();
	}

	/**
	 * @desc 设置登录用户头像url
	 * @return 
	 */
	qt_model.setHeadUrl = function(headUrl){
		_localSet('headPortraitUrl',headUrl);
	}

	/**
	 * @desc 获取默认的登录用户头像url
	 * @return 
	 */
	qt_model.getDefaultHeadUrl = function(){
		return './images/user_pace.png';
	}

	/**
	 * @desc 获取登录用户角色
	 * @return 
	 */
	qt_model.getRole = function(){
		return _localGet('role');
	}

	/**
	 * @desc 设置登录用户角色
	 * @return 
	 */
	qt_model.setRole = function(role){
		_localSet('role',role);
	}

	/**
	 * @desc 获取登录用户角色名称
	 * @return 
	 */
	qt_model.getRoleName = function(){
		return _localGet('roleName');
	}

	/**
	 * @desc 设置登录用户角色名称
	 * @return 
	 */
	qt_model.setRoleName = function(roleName){
		_localSet('roleName',roleName);
	}

	/**
	 * @desc 获取当前角色是否管理员
	 * @return 
	 */
	qt_model.isAdmin = function(){
		return '1'==_localGet('isAdmin');
	}

	/**
	 * @desc 获取当前角色isAdmin值
	 * @return 
	 */
	qt_model.getIsAdmin = function(){
		return _localGet('isAdmin');
	}

	/**
	 * @desc 设置当前角色isAdmin值
	 * @return 
	 */
	qt_model.setIsAdmin = function(isAdmin){
		_localSet('isAdmin',isAdmin);
	}

	/**
	 * @desc 获取当前角色是否班主任
	 * @return 
	 */
	qt_model.isMaster = function(){
		return '1'==_localGet('isMaster');
	}

	/**
	 * @desc 获取当前角色isMaster值
	 * @return 
	 */
	qt_model.getIsMaster = function(){
		return _localGet('isMaster');
	}

	/**
	 * @desc 设置当前角色isMaster值
	 * @return 
	 */
	qt_model.setIsMaster = function(isMaster){
		_localSet('isMaster',isMaster);
	}


	/**
	 * @desc 获取当前角色是否积分管理员
	 * @return 
	 */
	qt_model.isJFAdmin = function(){
		return '1'==_localGet('isJFAdmin');
	}

	/**
	 * @desc 获取当前角色isJFAdmin值
	 * @return 
	 */
	qt_model.getIsJFAdmin = function(){
		return _localGet('isJFAdmin');
	}

	/**
	 * @desc 设置当前角色isJFAdmin值
	 * @return 
	 */
	qt_model.setIsJFAdmin = function(isJFAdmin){
		_localSet('isJFAdmin',isJFAdmin);
	}



	/**
	 * @desc 获取当前角色班主任带班
	 * @return 
	 */
	qt_model.getMasterClassInfo = function(){
		return JSON.parse(_localGet('masterClassInfo'));
	}

	/**
	 * @desc 设置当前角色班主任带班
	 * @return 
	 */
	qt_model.setMasterClassInfo = function(masterClassInfo){
		_localSet('masterClassInfo',JSON.stringify(masterClassInfo));
	}
	
	/**
	 * @desc 获取当前用户通知权限
	 * @return 
	 */
	qt_model.getPermissions = function(permissionsName){
		var per = _localGet('permissions');
		per = per?$.evalJSON(per):{};
		return per[permissionsName];
	}
	
	/**
	 * @desc 保存当前用户通知权限信息
	 */
	qt_model.setPermissions = function(permissions){
		_localSet('permissions',permissions?JSON.stringify(permissions):'');
	}

	/**
	 * @desc 设置模块权限
	 * @return 
	 */
	qt_model.setFuncs = function(funcs){
		if(!funcs){
			return;
		}
		_localSet('funcs',''+$.toJSON(funcs));
	}

	/**
	 * @desc 设置模块权限
	 * @return 
	 */
	qt_model.getFuncs = function(funcname){
		/*"
		funs":{"clazzalbum":1,"homework":1,"linkman":1,"notice":1,"survey":1,"words":1}
		"notice":0,    //通知
		"homework":0,   //作业
		"words":0,    //通讯录，留言
		"clazzalbum":0,   //班级相册
		"activity": 0,     //学校活动
		"czcx": 0,  //成绩查询
		"highcamp": 0,  //高考志愿辅导
		"juniorcamp": 0,  //家长学校
		"qingjia": 1,  //请假
		"survey": 0,  //问卷
		"wgw": 1,  //微官网
		"xxbg": 1,  //学校办公
		"xyzf": 1,   //校园支付
		"yingyu": 0,  //英语辅导
		"ykt": 1,   //校园一卡通
		"yuwen": 0,  //语文辅导
		"yxctb": 0  //优学错题本
		*/
		var funcs = _localGet('funcs');
		funcs = funcs?$.evalJSON(funcs):{};
		return '1' == funcs[funcname];
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
	qt_model.showMsg = function(options,self){
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
		if(self === true &&$('#msgBox').size() > 0){
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
			
		}else{
			parent.showMsg(options);
		}
		
	}

	/**
	 * @desc 获取登录用户登录源
	 * @return 
	 */
	qt_model.getLoginSource = function(){
		var _loginSource = _localGet('loginSource');
		if(!_loginSource){
			 _loginSource = _config.SERVICE+"/login.html";
            // _loginSource = "./login.html";
		}
		return _loginSource;
	}

	/**
	 * @desc 设置登录源
	 * @return 
	 */
	qt_model.setLoginSource = function(loginSource){
		_localSet('loginSource',loginSource);
	}


	/**
	 * @desc 丢失登录态通用处理方法
	 * @return 
	 */
	qt_model.lostLogin = function(){
		//清除所有前端数据
		//qt_model.clearStatus();

		//弹出消息提示框
		qt_model.showMsg({
			msg : '登录超时，需要重新登录！',
			icourl : 'warn',
			btnText : '重新登录',
			callback : function(){
				qt_model.goLogin(true);
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
		qt_cookie.delCookie('uuid');
		qt_cookie.delCookie('userName');
		qt_cookie.delCookie('headPortraitUrl');
		qt_cookie.delCookie('role');
		qt_cookie.delCookie('roleName');
		qt_cookie.delCookie('schoolCode');
		qt_cookie.delCookie('schoolName');
		qt_cookie.delCookie('isAdmin');
		qt_cookie.delCookie('funcs');
	}

	/**
	 * @desc 返回登录页面
	 * @return 
	 */
	qt_model.goLogin = function(fast){
		var _loginUrl = qt_model.getLoginSource();
		qt_model.clearStatus();
		if(fast){
			qt_cookie.delCookie('user_info_json');
			qt_cookie.delCookie('access_token');
			window.top.location.href= _loginUrl;
		}else{
			qt_model.post(qt_model.SERVICE+'/logout',{},function(){
				qt_cookie.delCookie('user_info_json');
				qt_cookie.delCookie('access_token');
				window.top.location.href= _loginUrl;
			});
			setTimeout(function(){
				qt_cookie.delCookie('user_info_json');
				qt_cookie.delCookie('access_token');
				//8秒内接口不响应，认为出错，直接返回登录页
				window.top.location.href= _loginUrl;
			},8000);
		}
	}


	/**
	 * @desc 代理提交，方便统一修改
	 * @return 
	 */
	qt_model.post = function(url,params,callback){
		var _params = {
			json : $.toJSON(params)
		}
		
		$.ajax(url,{
			type : 'post',
			data : _params,
			datatye:'json',
			success : function(rtn){
				callback && callback(rtn);
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				var responseText = XMLHttpRequest.responseText;
				if(/^(Token)?\?+/.test(responseText)){
					//暂时这样判断登录问题
					//Token????
					//console && console.log('debug:error:'+responseText);
					qt_model.lostLogin();
				}
			}
		});
		/*
		$.post(url,_params,function(rtn){
			callback && callback(rtn);
		});
		*/
	}
	
	qt_model.post2 = function(url,params,callback){
		var _params = JSON.stringify(params)
		$.ajax(url,{
			type : 'POST',
			data : _params,
			contentType : 'application/json;charset=UTF-8',
			dataType :'json',
			success : function(rtn){
				callback && callback(rtn);
			}
		});
	}

	/**
	 * @desc 代理提交，方便统一修改
	 * @return 
	 */
	qt_model.jsonp = function(url,params,callback,errCallback){
		$.ajax({
			type : 'get',
			url : url,
			data : params,
			dataType : 'jsonp',
			jsonp: 'callback',
			success : function(rtn){
				callback && callback(rtn);
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				errCallback && errCallback();
			}
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
	qt_model.tips = function(level,msg){
		var _msg = msg?msg:level;
		var _level = msg?level:'error';
		if(!_msg){
			return;
		}
		
		Toastr.options = {
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
		Toastr[_level]&&Toastr[_level](_msg);
	}

	//通用显示Loading
	qt_model.showLoading = function(){
		$('#loading').show();
	}
	//通用隐藏Loading
	qt_model.hideLoading = function(){
		$('#loading').hide();
	}

	//通用显示Progress
	qt_model.showProgress = function(){
		NProgress.start();
	}
	//通用隐藏Progress
	qt_model.hideProgress = function(){
		NProgress.done();
	}
	
	/**
	 * 图片裁剪(金山云图片裁剪服务 http://ks3.ksyun.com/doc/imghandle/api/handle.html) 
	 * @param imageUrl 图片原始地址
	 * @param options 裁剪图片参数(必须与金山云所提供的参数名称一样)
	 */
	qt_model.imgCrop=function(imageUrl,options){
		var index = imageUrl.indexOf('http://ks3.weixiao100.cn/');
		if(index < 0 ){
			return imageUrl;
		}
		var settings = {}; 
		settings = $.extend(settings,options?options:{});
		var _opts='';
		var html = new Array();
		for(var key in settings){
			_opts ="&"+key +"="+ settings[key];
			html.push(_opts);
		}
		var _imageUrl = imageUrl + "@base@tag=imgScale"+html.join('');
		return _imageUrl;

	}
	
	/**	
	 *	说明：过滤XSS
	 *	@param val 要过滤的字符串
	 *	@param tagArr 要过滤标签的数组 数组格式['body','html','div']等
	 *	@param newStr 要替换成的字符串。默认'#'号
	 *	
	 */
	qt_model.filterXss = function (val,tagArr,newStr) {
		val = val.toString();
		var _newStr='';
		if(newStr){
			_newStr = newStr;
		}else{
			_newStr = '#';
		}
		//默认要过滤的标签
		var defaultTag = ['script','iframe'];
		//扩展其他过滤的标签
		if(tagArr){
			for(var i=0;i<tagArr.length;i++){
				defaultTag.push(tagArr[i]);
			}
		}
		for(var i=0;i<defaultTag.length;i++){
			var regStr = defaultTag[i];
			var reg = new RegExp("<[\/]{0,1}"+regStr+"[^>]*>",'gi');
			val = val.replace(reg,_newStr);
		}
		return val;
	};
	
	/**
	 * 日历控件
	 * @param options 日历控件参数对象,参考 http://laydate.layui.com/api.html
	 * @param skinType 皮肤 0:灰色 1:淡蓝  2:大红  3:墨绿  默认灰色 
	 */
	qt_model.layDate = function(options,skinType){
		//默认参数
		var _options = {};
		if(typeof options == 'string'){
			_options.elem = options;
		}else{
			_options = options;
		}
		//扩展参数
		if(!_options.elem){
			return;
		}
		laydate(_options);
		if(skinType){
			var _skin = skinType==0?'default':(skinType==1?'danlan':(skinType==2?'dahong':(skinType==3?'molv':'default')));
			laydate.skin(_skin);
		}
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
