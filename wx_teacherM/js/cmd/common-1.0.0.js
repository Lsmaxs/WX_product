/**
 * 常用工具类
 * yonson
 */
define(function(require, exports, module) {
	
	var $ = require("jquery");
	var storage = require('storage');
	var base64 = require('base64');
	
	var qt_model={};
	
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
	
		_parent.css({
			'overflow' : 'hidden'
		});
		_img.css({
			'width' : tWidth+'px',
			'height' : tHeight +'px',
			'transform' : 'translate('+translateX+'px,'+translateY+'px)',
			'-ms-transform' : 'translate('+translateX+'px,'+translateY+'px)',
			'-webkit-transform' : 'translate('+translateX+'px,'+translateY+'px)'
		});
	}
	
	/**
	 * 单张图片预处理
	 * @param obj
	 */
	window.imgPreDeal = function(obj){
		if(obj.width > obj.height){
			$(obj).parent().parent().parent().removeClass("list_pic_y").addClass("list_pic_x");
		}
		winFixImg(obj);
	}
	
	qt_model.getUrlParam = function (name){
		var url = window.location.search, 
			reg = new RegExp('[\\?&]' + name + '=([^&]*)'),
			v = url.match(reg);
		return v === null ? null :v[1];
	}
	
	qt_model.getDate = function(day){
		if(!day) day = 0;
		var now = new Date();
		var time = now.getTime() - (day*3600*24*1000);
		now = new Date(time);
		var yearDate = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();  
		return yearDate;
	}
	
	/**
	 * 蜂巢数据记录
	 */
	qt_model.fclog = function(appCode){
		appCode=appCode.toLocaleLowerCase();
		if(window.location.hostname.indexOf("") > -1){
			//加截蜂巢用户行为分析脚本
		    var oBody = document.getElementsByTagName('BODY')[0];
		    var oScript= document.createElement("script");
		    oScript.type = "text/javascript";
		    var environment = 'prod';
		    if(window.location.hostname.indexOf("dev") >= 0){
		    	environment = 'dev';
		    }
		    if('prod' == environment){
		    	oScript.src="http://pro-jssdk.thinkjoy.com.cn/statistics.js?kafkaId=RESOURCE_WX_UBEHAVE&appCode="+appCode+"&ts="+new Date().getTime();
		    }else{
		    	oScript.src="http://dev-jssdk.thinkjoy.com.cn/statistics.js?kafkaId=RESOURCE_WX_UBEHAVE&appCode="+appCode+"&ts="+new Date().getTime();
		    }
		    oBody.appendChild(oScript);
		    
		    //生成跳转行为记录
		    genAdtay();
		    
		    //加截腾讯用户行为分析脚本
		    var oBody_mat = document.getElementsByTagName('BODY')[0];
		    var oScript_mat= document.createElement("script");
		    oScript_mat.type = "text/javascript";
		    var environment_mat = 'prod';
		    if(window.location.hostname.indexOf("dev") >= 0){
		    	environment_mat = 'dev';
		    }
		    if('prod' == environment_mat){
		    	oScript_mat.src=location.protocol+"//pingjs.qq.com/h5/stats.js";
		    	oScript_mat.setAttribute("name","MTAH5");
		    	oScript_mat.setAttribute("sid","500012666");
		    	oScript_mat.setAttribute("cid","500013066");
		    }else{
		    	oScript_mat.src=location.protocol+"//pingjs.qq.com/h5/stats.js";
		    	oScript_mat.setAttribute("name","MTAH5");
		    	oScript_mat.setAttribute("sid","500012663");
		    	oScript_mat.setAttribute("cid","500013069");
		    }
		    oBody_mat.appendChild(oScript_mat);
		    
		    //加截百度用户行为分析脚本
		    var oBody_baidu = document.getElementsByTagName('BODY')[0];
		    var oScript_baidu= document.createElement("script");
		    oScript_baidu.type = "text/javascript";
		    oScript_baidu.src="//hm.baidu.com/hm.js?190c83d0e31df490382d4d94b1294d58";
		    oBody_baidu.appendChild(oScript_baidu);
		    
		}
	}
	
	//生成genAdtay(只保存四级跳转行为)
	function genAdtay(){
		
		//记录点击行为
	    var start = window.location.pathname.lastIndexOf("/");
	    var end = window.location.pathname.lastIndexOf(".html");
	    tagKey = window.location.pathname.substring(start+1,end);
	    var adtag = qt_model.getUrlParam("ADTAG");
	    
	    var newAdtag = '';
	    if(adtag){
	    	var adtagArr = adtag.split(".");
		    if(adtagArr.length >= 3){
		    	for(var i=adtagArr.length-3;i<adtagArr.length;i++){
		    		newAdtag += "."+adtagArr[i];
		    	}
		    }else{
		    	for(var i=0;i<adtagArr.length;i++){
		    		newAdtag += "."+adtagArr[i];
		    	}
		    }
	    }
	    if(newAdtag.length > 0){
	    	newAdtag = newAdtag.substring(1)+"."+tagKey;
	    }else{
	    	newAdtag = tagKey;
	    }
	    storage.setSessionStorage("adtag",newAdtag);
		
	}
	
	qt_model.getDateTime = function(){
		
		var date = new Date();
		Y = date.getFullYear() + '-';
		M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
		D = date.getDate() + ' ';
		h = date.getHours() + ':';
		m = date.getMinutes();
		
		return (Y+M+D+h+m);
		
	}
	
	/**	
	 *	说明：过滤XSS
	 *	@param val 要过滤的字符串
	 *	@param tagArr 要过滤标签的数组 数组格式['body','html','div']等
	 *	@param newStr 要替换成的字符串。默认'#'号
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
		var defaultTag = ['script','iframe','input'];
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
	 * 验证token有效性
	 */
	qt_model.verifyToken = function(returnInfo,cropId){
		
		if(returnInfo.resultCode == '202'){
			sourceUrl = base64.encode(window.location.href);
			sourceUrl = encodeURI(sourceUrl);
			document.location.href = location.protocol+"//"+location.hostname+"/prods/wxlogin/login?cropId="+cropId+"&callbackUrl="+sourceUrl;
			return false;
		}else if(returnInfo.resultCode == '203'){
			document.location.href = location.protocol+"//"+location.hostname+"/prods/wap/html/nopermissions.html";
		}else{
			return true;
		}
		
	}
	
	var letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	
	qt_model.tranChar = function(num,count){
		if(count <= 26){
			return letter.substr(num-1,1);
		}else{
			return num;
		}
	}
	 
	qt_model.ctx = location.protocol+"//"+location.hostname+"/jxhd";
	qt_model.produsUrl = location.protocol +"//"+location.hostname+"/prods";
	qt_model.imageUrl = "http://ks3-host-domain/";
	var front_ctx = '';
	var environment = 'prod';
    if(window.location.hostname.indexOf("dev") >= 0){
    	environment = 'dev';
    }
    if(environment == 'prod'){
    	front_ctx = location.protocol + '//'+location.hostname+'/fronts';
    }else{
    	front_ctx = location.protocol + '//'+location.hostname+'/frontstest';
    }
	qt_model.front_ctx = front_ctx;
	
	//声明模块提供的接口,如：当前模块不对外提供任何借口
	module.exports = qt_model;

});