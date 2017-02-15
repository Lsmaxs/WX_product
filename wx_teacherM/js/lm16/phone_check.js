/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"userId":"",
 * 	"cropId":"",
 * 	"type":"",
 * 	"phone":"",
 * 	"name":""
 * }
 * 
 * 
 * 
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var storage = require('storage');
	var tip = require('widget/tip');
	var wxApi = require('wxApi');
	
	var SERVER_TEA_INFO_URL = common.ctx + '/wap/html/lm16/info_tea.html';  //教师个人资料
//	var SERVER_PAR_INFO_URL = common.ctx + '/wap/html/lm16/info_par.html';  //家长个人资料
	var SERVER_PAR_INFO_URL = common.front_ctx + '/jxhd/html/selfinfo/info_par.html';
	var SERVER_TEA_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_tea_edit.html';  //教师角色信息
	var SERVER_PAR_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_par_edit.html';  //家长角色信息
	
	var countNum = 0;
	var paramValue;
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var funcType = common.getUrlParam("funcType");
		var type = common.getUrlParam("type");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#funcType").val(funcType);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		
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
		
		if(paramValue.phone && paramValue.phone != ''){
			countNum = 60;
			countNumFunc();
			$.post(common.ctx+"/wap/per/lm16/smsCode",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId,
						phone:paramValue.phone
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
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var funcType = $("#funcType").val();
		var type = $("#type").val();
		if(paramValue.phone && paramValue.phone != ''){
			
			var pcheckCode = $("#pcheckCode").val();
			if(pcheckCode == ''){
				tip.openAlert1("提示","请输入验证码");
				return;
			}
			
			if(paramValue.type == 1){  //教师角色
				
				var jsonObj = {phone:paramValue.phone,oldName:paramValue.name,pcheckCode:pcheckCode};
				$.post(common.ctx+"/wap/per/lm16/saveTeaInfo",
						{
							userId:paramValue.userId,
							cropId:paramValue.cropId,
							json:JSON.stringify(jsonObj)
						},
						function(result){
							storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
							if(result.resultCode == '001'){
								if(funcType == 0){
									//更新localStorage数据
									var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
									userInfo.phone = paramValue.phone;
									storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(userInfo));
									document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
								}else if(funcType == 1){
									var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
									lmTeaDetail.phone = paramValue.phone;
									storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
									document.location.href = SERVER_TEA_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
								}
							}else{
								tip.openAlert1("提示",result.resultMsg);
								return;
							}
						}
					);
			}else{
				var jsonObj = {phone:paramValue.phone,oldName:paramValue.name,pcheckCode:pcheckCode};
				$.post(common.ctx+"/wap/per/lm16/saveParInfo",
						{
							userId:paramValue.userId,
							cropId:paramValue.cropId,
							json:JSON.stringify(jsonObj)
						},
						function(result){
							if(result.resultCode == '001'){
								storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
								if(funcType == 0){
									var userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+paramValue.cropId));
									userInfo.phone = paramValue.phone;
									storage.setLocalStorage("parInfo_"+paramValue.cropId,JSON.stringify(userInfo));
									document.location.href = SERVER_PAR_INFO_URL + "?cropId="+cropId+"&userId="+userId;
								}else if(funcType == 1){
									var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
									lmParDetail.phone = paramValue.phone;
									storage.setSessionStorage("lm_par_detail",JSON.stringify(lmParDetail));
									document.location.href = SERVER_PAR_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
								}
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