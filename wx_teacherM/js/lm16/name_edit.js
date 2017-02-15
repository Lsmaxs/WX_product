/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"type":"",   //1是教师2是家长3是学生
 * 	"phone":"",
 * 	"classCode":"",
 * 	"childIndex":"",
 * 	"name":"",
 * 	"parentUserId":""
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
	
	var SERVER_TEA_INFO_URL = common.ctx + '/wap/html/lm16/info_tea.html';  //教师个人信息
//	var SERVER_PAR_INFO_URL = common.ctx + '/wap/html/lm16/info_par.html';  //家长个人信息
	var SERVER_PAR_INFO_URL = common.front_ctx + '/jxhd/html/selfinfo/info_par.html';
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
		
		//获取参数数据
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		
		$("#infoName").val(paramValue.name);
		
		$(".del_tit").click(function(){
			$("#infoName").val('');
		});
		
		$(".bt_green").click(function(){
			saveName(paramValue.type);
		});
		
	}
	
	/**
	 * 保存姓名
	 */
	function saveName(type){
		
		var funcType = $("#funcType").val();
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var type = $("#type").val();
		var infoName = $("#infoName").val().trim();
		if(infoName == ''){
			tip.openAlert1("提示","请输入新的名字");
			return;
		}
		var reg = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;     
        var r = infoName.match(reg);
        if(r == null){
        	tip.openAlert1("提示","请输入中文英文数字");
        	return;
        }
        if(infoName.length >= 5){
        	tip.openAlert1("提示","请输入小于5个文字");
        	return;
        }
        
		if(paramValue.type == 1){  //修改教师
			var jsonObj = {name:infoName,oldPhone:paramValue.phone};
			$(".bt_green").attr("disabled",true);
			$.post(common.ctx+"/wap/per/lm16/saveTeaInfo",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(result.resultCode == '001'){
							storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
							if(funcType == 0){
								//更新localStorage数据
								var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
								userInfo.name = infoName;
								storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(userInfo));
								document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
							}else if(funcType == 1){
								var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
								lmTeaDetail.name = infoName;
								storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
								document.location.href = SERVER_TEA_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
							}
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
						$(".bt_green").removeAttr("disabled");
					}
				);
		}else if(paramValue.type == 2){  //修改家长
			var jsonObj = {name:infoName,oldPhone:paramValue.phone};
			$(".bt_green").attr("disabled",true);
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
								//更新localStorage数据
								var userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+paramValue.cropId));
								userInfo.name = infoName;
								storage.setLocalStorage("parInfo_"+paramValue.cropId,JSON.stringify(userInfo));
								document.location.href = SERVER_PAR_INFO_URL + "?cropId="+cropId+"&userId="+userId;
							}else if(funcType == 1){
								var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
								lmParDetail.name = infoName;
								storage.setSessionStorage("lm_par_detail",JSON.stringify(lmParDetail));
								document.location.href = SERVER_PAR_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
							}
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
						$(".bt_green").removeAttr("disabled");
					}
				);
		}else if(paramValue.type == 3){  //修改学生姓名
			var jsonObj = {StuUserId:paramValue.userId,StuName:infoName,OldClassCode:paramValue.classCode};
			$(".bt_green").attr("disabled",true);
			$.post(common.ctx+"/wap/per/lm16/saveStuInfo",
					{
						userId:paramValue.parentUserId,
						cropId:paramValue.cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(result.resultCode == '001'){
							storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
							if(funcType == 0){
								//更新localStorage数据
								var userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+paramValue.cropId));
								userInfo.childItems[paramValue.childIndex].name = infoName;
								storage.setLocalStorage("parInfo_"+paramValue.cropId,JSON.stringify(userInfo));
								document.location.href = SERVER_PAR_INFO_URL + "?cropId="+cropId+"&userId="+userId;
							}else{
								var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
								lmParDetail.stuName = infoName;
								storage.setSessionStorage("lm_par_detail",JSON.stringify(lmParDetail));
								document.location.href = SERVER_PAR_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
							}
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
						$(".bt_green").removeAttr("disabled");
					}
				);
		}
		
	}
	
});