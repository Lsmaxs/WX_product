define(function(require, exports, module) {

	/**
	 * @desc 配置文件
	 * @exports
	 * @version 2.7.5
	 * @author
	 * @copyright Copyright 2014-2015
	 *
	 */
	var qt_model={};

	//配置
	var _pathname = window.top.location.pathname;
	var _pathPrefix = _pathname.substring(0,_pathname.lastIndexOf('/'));
	//通用服务
	qt_model.SERVICE = location.protocol+'//'+location.hostname+(location.port?(':'+location.port):'');
	var _isDev = false;
	var _isTest = false;
	(function(){
		var hostname =  location.hostname;
		if(/^(dev|local|test|front|127|123)\./.test(hostname)){
			_isDev = true;
		}
		if(/^(test|front|123)\./.test(hostname)){
			qt_model.SERVICE = qt_model.SERVICE+'/wxht';
		}
		if(/^(test)\./.test(hostname)){
			_isTest = true;
		}
	})();

	//是否测试环境
	qt_model.isDev = _isDev;
	qt_model.isTest = _isTest;

	module.exports = qt_model;

});
