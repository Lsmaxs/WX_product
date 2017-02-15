define(function(require, exports, module) {
	/**
	 * @desc 
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
	 * @copyright Copyright 2015-2016
	 * 
	 */
	var qt_model = {};

	function p(name){
		var url = window.location.search, 
			reg = new RegExp('[\\?&]' + name + '=([^&]*)'),
			v = url.match(reg);
		return v === null ? null : v[1];
	}
	function checkIsDev(){
		var hostname =  window.top.location.hostname;
		if(/^(dev|local|test|127|123)\./.test(hostname)){
			return true;
		}else{
			return false;
		}
	}
	var _isDev = checkIsDev();

	var _now = new Date();
	var _month = _now.getMonth()+1;
	_month = _month>=10?_month:('0'+_month);
	var _day = _now.getFullYear() +''+ _month +''+ _now.getDate();

	//蜂巢统计
	function _initHoneyStat(appCode){
		var userid = p('userId');
		userid = userid?userid:'';

		var _body = document.getElementsByTagName('body')[0];

		//蜂巢上报
		var _thinkjoy = 'https://pro-jssdk.qtonecloud.cn/honeycomb-jssdk.js?t='+_day;

		var _script = document.createElement("script");
		_script.type = "text/javascript";
		_script.src=_thinkjoy;
		_script.async="async";
		_script.onload=function(){
			try{
				honeycomb && honeycomb.init(appCode,{env:(_isDev?'dev':'pro'),debug:(_isDev?true:false)});
				var _localIdentify = window.localStorage && localStorage.getItem('_stat_identify');
				if(!userid && !_localIdentify){
					//不存在用户标识，造一个用户标识
					_localIdentify = _now.getTime()+''+parseInt(10000*Math.random());
					window.localStorage && localStorage.setItem('_stat_identify',_localIdentify);
				}
				honeycomb && honeycomb.identify(userid?userid:_localIdentify);
			}catch(e){
				//do nothing
				console && console.log(e);
			}
		}
		/*
		if(!_isDev){
			_body.appendChild( _script);
		}
		*/
		_body.appendChild( _script);
	}



	//初始化腾讯统计
	function _initTxStat(){
		var _body = document.getElementsByTagName('body')[0];
		var _script2 = document.createElement("script");
		_script2.type = "text/javascript";
		_script2.src='https://pingjs.qq.com/h5/stats.js';
		_script2.setAttribute('name','MTAH5');
		_script2.setAttribute('sid',_isDev?'500012663':'500012666');
		_script2.setAttribute('cid',_isDev?'500013069':'500013066');
		_body.appendChild(_script2);
	}

	
	//初始化百度统计
	function _initBdStat(){
		var _hmt = window._hmt;
		window._hmt = _hmt || [];
		var hm = document.createElement("script");
		hm.src = "//hm.baidu.com/hm.js?190c83d0e31df490382d4d94b1294d58";
		var s = document.getElementsByTagName("script")[0]; 
		s.parentNode.insertBefore(hm, s);
	}


	//初始化蜂巢统计
	qt_model.init = function(appCode){
		// _initHoneyStat(appCode);
	}
	//蜂巢自定义统计
	qt_model.track = function(event,data){
		if(!event){
			return;
		}
		 honeycomb && honeycomb.track(event,data);
	}

	//默认执行的统计
	//_initTxStat();
	//_initBdStat();
		
	module.exports = qt_model;
});