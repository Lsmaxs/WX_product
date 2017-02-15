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
	
	var SERVER_TEA_INFO_URL = common.ctx + '/wap/html/linkman/info_tea.html';
	var SERVER_PAR_INFO_URL = common.ctx + '/wap/html/linkman/info_par.html';
	var param_phone = '';
	var countNum = 0;
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
		param_phone = storage.getSessionStorage("param_phone");
		sendPcheckCode();
		
		$(".weui_cell_yzm").on("click","a",function(){
			sendPcheckCode();
		});
		
		$(".bt_green").click(function(){
			savePhone();
		});
		
	}
	
	//倒计时
	function countNumFunc(){
		var timer = setInterval(function(){
			if(countNum > 0){
				$(".weui_cell_yzm").html(countNum+'秒后重发');
				countNum = countNum - 1;
			}else{
				timer && clearInterval(timer);
				$(".weui_cell_yzm").html('<a href="javascript:;">重新获取</a>');
			}
		},1000);
	}
	
	//发送短信验证码
	function sendPcheckCode(){
		
		if(param_phone && param_phone != ''){
			var cropId = $("#cropId").val();
			var userId = $("#userId").val();
			countNum = 60;
			countNumFunc();
			$.post(common.ctx+"/wap/personal/smsCode",
					{
						userId:userId,
						cropId:cropId,
						phone:param_phone
					},
					function(result){
						if(result.resultCode == '001'){
							//不作操作
						}
					}
				);
		}else{
			tip.openAlert1("提示","手机号码无效");
			return;
		}
		
	}
	
	//修改手机号码
	function savePhone(){
		
		if(param_phone && param_phone != ''){
			var cropId = $("#cropId").val();
			var userId = $("#userId").val();
			var type = $("#type").val();
			
			var pcheckCode = $("#pcheckCode").val();
			if(pcheckCode == ''){
				tip.openAlert1("提示","请输入验证码");
				return;
			}
			
			if(type == 1){
				var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+cropId));
				var jsonObj = {phone:param_phone,oldName:userInfo.name,pcheckCode:pcheckCode};
				$.post(common.ctx+"/wap/personal/saveTeaInfo",
						{
							userId:userId,
							cropId:cropId,
							json:JSON.stringify(jsonObj)
						},
						function(result){
							if(result.resultCode == '001'){
								//更新localStorage数据
								userInfo.phone = param_phone;
								storage.setLocalStorage("teaInfo_"+cropId,JSON.stringify(userInfo));
								document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
							}else{
								tip.openAlert1("提示",result.resultMsg);
								return;
							}
						}
					);
			}else{
				var userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
				var jsonObj = {phone:param_phone,oldName:userInfo.name,pcheckCode:pcheckCode};
				$.post(common.ctx+"/wap/personal/saveParInfo",
						{
							userId:userId,
							cropId:cropId,
							json:JSON.stringify(jsonObj)
						},
						function(result){
							if(result.resultCode == '001'){
								userInfo.phone = param_phone;
								storage.setLocalStorage("parInfo_"+cropId,JSON.stringify(userInfo));
								document.location.href = SERVER_PAR_INFO_URL + "?cropId="+cropId+"&userId="+userId;
							}else{
								tip.openAlert1("提示",result.resultMsg);
								return;
							}
						}
					);
			}
		}else{
			tip.openAlert1("提示","手机号码无效");
			return;
		}
		
	}
	
	
});