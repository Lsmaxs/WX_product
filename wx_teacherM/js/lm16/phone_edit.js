/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"type":"",
 * 	"phone":""
 * }
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var storage = require('storage');
	var tip = require('widget/tip');
	var wxApi = require('wxApi');
	
	var NEXT_SERVER_URL = common.ctx + '/wap/html/lm16/phone_check.html';
	var SERVER_TEA_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_tea_edit.html';  //教师角色信息
	var SERVER_PAR_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_par_edit.html';  //家长角色信息
	var paramValue;
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var funcType = common.getUrlParam("funcType");    //0通过个人修改进入1通过通讯录修改进入
		var type = common.getUrlParam("funcType");        //操作人员1是教师2是家长
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#funcType").val(funcType);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		
		$("#myPhone").html(paramValue.phone);
		$(".bt_green").click(function(){
			nextStep();
		});
		
	}
	
	//下一部操作
	function nextStep(){
		
		var phone = $("#infoPhone").val();
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var funcType = $("#funcType").val();
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
		paramValue.phone = phone;
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		if(funcType == 0){
			document.location.href = NEXT_SERVER_URL + "?cropId="+cropId+"&userId="+userId+"&funcType="+funcType+"&type="+type;
		}else{
			//保存手机号码信息（直接保存，无需验证码）
			if(paramValue.type == 1){  //操作对象为教师
				var jsonObj = {phone:paramValue.phone,oldName:paramValue.name,pcheckCode:'QTONEHYUJMN246135'};
				$.post(common.ctx+"/wap/per/lm16/saveTeaInfo",
						{
							userId:paramValue.userId,
							cropId:paramValue.cropId,
							json:JSON.stringify(jsonObj)
						},
						function(result){
							if(result.resultCode == '001'){
								storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
								var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
								lmTeaDetail.phone = paramValue.phone;
								storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
								document.location.href = SERVER_TEA_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
							}else{
								tip.openAlert1("提示",result.resultMsg);
								return;
							}
						}
					);
			}else if(paramValue.type == 2){  //操作对像为家长
				var jsonObj = {phone:paramValue.phone,oldName:paramValue.name,pcheckCode:'QTONEHYUJMN246135'};
				$.post(common.ctx+"/wap/per/lm16/saveParInfo",
						{
							userId:paramValue.userId,
							cropId:paramValue.cropId,
							json:JSON.stringify(jsonObj)
						},
						function(result){
							if(result.resultCode == '001'){
								storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
								var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
								lmParDetail.phone = paramValue.phone;
								storage.setSessionStorage("lm_par_detail",JSON.stringify(lmParDetail));
								document.location.href = SERVER_PAR_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
							}else{
								tip.openAlert1("提示",result.resultMsg);
								return;
							}
						}
					);
			}
		}
	}
	
	
});