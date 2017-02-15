define(function(require, exports, module) {

	/**
	 * @desc 配置文件
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	//配置
	var _pathname = window.top.location.pathname;
	var _pathPrefix = _pathname.substring(0,_pathname.lastIndexOf('/'));

	//通用服务
	qt_model.SERVICE = location.protocol+'//'+location.hostname+(location.port?(':'+location.port):'')+(_pathPrefix?_pathPrefix:'');
    qt_model.SERVICE2 = qt_model.SERVICE+ '/tea';//开发使用用于匹配nginx代理
	//上传服务
	qt_model.UPLOADSERVICE = location.protocol+'//'+location.hostname+':'+(location.port?location.port:'80')+'/uploadSer';
	//图片前缀
	qt_model.IMG_PREFIX = 'http://ks3.weixiao100.cn/';

	//检测是否测试环境
	function checkIsDev(){
		var hostname =  window.top.location.hostname;
		if(/^(dev|local|test|front|127|123)\./.test(hostname)){
			return true;
		}else{
			return false;
		}
	}
	//是否测试环境
	qt_model.isDev = checkIsDev();

	module.exports = qt_model;

});
