/**
 * storage操作
 */
define(function(require, exports, module) {
	
	var qt_model={};
	
	var storage_version = '1.1.0';
	
	/**
	 * 获取sessionStorage
	 */
	qt_model.getSessionStorage = function(key){
		if(window.sessionStorage){
			return window.sessionStorage.getItem(key);
		}else{
			return null;
		}
	}
	
	/**
	 * 设置sessionStorage
	 */
	qt_model.setSessionStorage = function(key,value){
		if(window.sessionStorage){
			window.sessionStorage.setItem(key,value);
		}
	}
	
	/**
	 * 删除sessionStorage
	 */
	qt_model.deleteSessionStorage = function(key){
		if(window.sessionStorage){
			window.sessionStorage.removeItem(key);
		}
	}
	
	/**
	 * 获取localStorage
	 */
	qt_model.getLocalStorage = function(key){
		if(window.localStorage){
			if(window.localStorage.getItem("storage_version") == storage_version){
				return window.localStorage.getItem(key);
			}else{
				window.localStorage.clear();
				window.localStorage.setItem("storage_version",storage_version);
				return null;
			}
		}else{
			return null;
		}
	}
	
	/**
	 * 设置localStorage
	 */
	qt_model.setLocalStorage = function(key,value){
		if(window.localStorage){
			window.localStorage.setItem(key,value);
		}
	}
	
	/**
	 * 删除localStorage
	 */
	qt_model.deleteLocalStorage = function(key){
		if(window.localStorage){
			window.localStorage.removeItem(key);
		}
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;
	
});