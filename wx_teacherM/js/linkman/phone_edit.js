/**
 * author:yonson
 * data:2016-1-27
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var storage = require('storage');
	var tip = require('widget/tip');
	
	var NEXT_SERVER_URL = common.ctx + '/wap/html/linkman/phone_check.html'
	
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var type = common.getUrlParam("type");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#type").val(type);
		
		var userInfo;
		if(type == 1){  //教师
			userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+cropId));
		}else{  //家长
			userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
		}
		if(userInfo){
			$("#myPhone").html(userInfo.phone);
		}
		
		$(".bt_green").click(function(){
			nextStep();
		});
		
	}
	
	//下一部操作
	function nextStep(){
		
		var phone = $("#infoPhone").val();
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var type = $("#type").val();
		if(phone == ''){
			$(".error_ts").html("手机号码不能为空");
			$(".error_ts").show();
			return;
		}else if(phone.length != 11){
			$(".error_ts").html("手机号码格式不正确，请输入11位手机号");
			$(".error_ts").show();
			return;
		}
		storage.setSessionStorage("param_phone",phone);
		document.location.href = NEXT_SERVER_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
		
	}
	
	
});