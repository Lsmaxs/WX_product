/**
 * author:yonson
 * data:2016-3-17
 */

/* 数据模型:lm_par_detail=
		{
			"schoolCode":"",
			"userId":"",
			"icon":"",
			"phone":"",
			"name":"",
			"stuId","",
			"stuName":"",
			"followed":1,
			"cid":"",
			"className":"",
			"tag":""
		}
*/

define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var tip = require('widget/tip');
	var storage = require('storage');
	var wxApi = require('wxApi');
	
	var SERVER_EDIT_NAME_URL = common.ctx + '/wap/html/lm16/name_edit.html';
	var SERVER_EDIT_PHONE_URL = common.ctx + '/wap/html/lm16/phone_edit.html';
	var SERVER_EDIT_RELATION_URL = common.ctx + '/wap/html/lm16/relation_par_edit.html';
	var SERVER_EDIT_CLASS_URL = common.ctx + '/wap/html/lm16/class_par_edit.html';
	var SERVER_DELETE_PAR_URL = common.ctx + '/wap/per/lm16/deleteParStu';
	var SERVER_TIP_USER_URL = common.ctx + '/wap/per/lm16/sendNotice';
	var SERVER_PAR_LM_URL = common.ctx + '/wap/html/lm16/linkman_par.html';
	var SERVER_TEA_LM_URL = common.ctx + '/wap/html/lm16/linkman_tea.html';
	
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var type = common.getUrlParam("type");
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//从缓存中取回用户信息
		var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
		genHtml(lmParDetail);
		
		//点击发送提醒
		$("#sendTip").click(function(){
			sendTip(cropId,userId,lmParDetail.userId,2);
		});
		
		//点击移除家长
		$(".f_bt_detUser").click(function(){
			deletePar(cropId,userId,lmParDetail.userId,lmParDetail.stuId);
		});
		
		//修改姓名
		$("#parName_edit").click(function(){
			editParName(cropId,lmParDetail.userId,lmParDetail.phone,lmParDetail.cid,lmParDetail.name);
		});
		
		//修改手机号码
		$("#phone_edit").click(function(){
			editPhone(cropId,lmParDetail.userId,lmParDetail.phone,lmParDetail.name);
		});
		
		//修改学生姓名
		$("#stuName_edit").click(function(){
			editStuName(cropId,lmParDetail.stuId,lmParDetail.phone,lmParDetail.cid,lmParDetail.stuName,lmParDetail.userId);
		});
		
		//修改班级
		$("#className_edit").click(function(){
			editInClass(cropId,lmParDetail.userId,lmParDetail.cid,lmParDetail.className,lmParDetail.stuId);
		});
		
		//修改亲属关系
		$("#relationName_edit").click(function(){
			editRelationShip(cropId,lmParDetail.userId,lmParDetail.phone,lmParDetail.name,lmParDetail.stuId,lmParDetail.tag);
		});
		
		
	}
	
	//对该家长发送tip提醒
	var isSendTip = false;
	function sendTip(pcropId,puserId,ptargetUserId,pnoticeType){
		if(isSendTip == false){
			$.post(SERVER_TIP_USER_URL,
					{
						cropId:pcropId,
						userId:puserId,
						targetUserId:ptargetUserId,
						noticeType:pnoticeType
					},
					function(result){
						if(common.verifyToken(result,pcropId)){
							if(result.resultCode == '001'){
								isSendTip = true;
								tip.openAlert1("提示","提醒成功");
							}else{
								tip.openAlert1("提示",result.resultMsg);
							}
						}
					}
				);
		}else{
			tip.openAlert1("提示","您已发送过提醒");
		}
	}
	
	//删除该家长
	function deletePar(pcropId,puserId,ptargetUserId,pstuId){
		$.post(SERVER_DELETE_PAR_URL,
				{
					cropId:pcropId,
					userId:puserId,
					targetUserId:ptargetUserId,
					stuId:pstuId
				},
				function(result){
					if(common.verifyToken(result,pcropId)){
						if(result.resultCode == '001'){
							storage.deleteLocalStorage("teaLinkman_"+pcropId);
							storage.deleteLocalStorage("classLinkman_"+pcropId);
							storage.setLocalStorage("isLinkmanRefresh_"+pcropId,"1");
							tip.openAlert1("提示","家长移除成功",function(){
								var userId = common.getUrlParam("userId");
								var cropId = common.getUrlParam("cropId");
								var type = common.getUrlParam("type");
								if(type == 1){  //教师
									document.location.href = SERVER_TEA_LM_URL + "?cropId="+cropId+"&userId="+userId;
								}else{  //家长
									document.location.href = SERVER_PAR_LM_URL + "?cropId="+cropId+"&userId="+userId;
								}
							});
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				}
			);
	}
	
	//生成对应html页面
	function genHtml(lmParDetail){
		
		$("#parName").prepend(lmParDetail.name);
		$("#phone").prepend(lmParDetail.phone);
		$("#stuName").prepend(lmParDetail.stuName);
		$("#className").prepend(lmParDetail.className);
		$("#relationName").prepend(lmParDetail.tag);
		
		if(lmParDetail.followed == 1){
			$("#inviteAttention").show();
		}
		
	}
	
	//修改家长姓名
	function editParName(pcropId,puserId,pphone,pclassCode,pname){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
				cropId:pcropId,
				userId:puserId,
				type:2,
				phone:pphone,
				classCode:pclassCode,
				name:pname
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_NAME_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
		
	}
	
	//修改学生姓名
	function editStuName(pcropId,puserId,pphone,pclassCode,pname,parentUserId){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
				cropId:pcropId,
				userId:puserId,
				type:3,
				phone:pphone,
				classCode:pclassCode,
				name:pname,
				parentUserId:parentUserId
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_NAME_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
	//修改手机号码
	function editPhone(pcropId,puserId,pphone,pname){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
				cropId:pcropId,
				userId:puserId,
				type:2,
				phone:pphone,
				name:pname
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_PHONE_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
		
	}
	
	//修改亲属关系
	function editRelationShip(pcropId,puserId,pphone,pname,pstuId,tag){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
			cropId:pcropId,
			userId:puserId,
			phone:pphone,
			name:pname,
			stuUserId:pstuId,
			tag:tag
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_RELATION_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
	//修改所在班级信息
	function editInClass(pcropId,puserId,pclassCode,pclassName,pstuUserId){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
			cropId:pcropId,
			userId:puserId,
			classCode:pclassCode,
			className:pclassName,
			stuUserId:pstuUserId
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_CLASS_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
	
	
});