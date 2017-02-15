/**
 * author:yonson
 * data:2016-3-17
 */

/* 数据模型:lm_tea_detail=
		{
			"schoolCode":"",
			"userId":"",
			"icon":"",
			"phone":"",
			"name":"",
			"followed":1,
			"isAdmin":1,
			"roleList":{"code":"","name":""},
			"teachList":{"isMaster":1,"classCode":"","className":"","subjectCode":"","subjectName":""},
			"deptList"{"code":"","name":""}
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
	var SERVER_EDIT_DEPT_URL = common.ctx + '/wap/html/lm16/dept_tea.html';
	var SERVER_EDIT_ROLE_URL = common.ctx + '/wap/html/lm16/role_tea.html';
	var SERVER_EDIT_TEACH_URL = common.ctx + '/wap/html/lm16/class_sub_tea.html'
	var SERVER_DELETE_TEA_URL = common.ctx + '/wap/per/lm16/deleteTeacher';
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
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//从缓存中取回用户信息
		var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
		genHtml(lmTeaDetail);
		
		//点击修改提醒
		$("#sendTip").click(function(){
			sendTip(cropId,userId,lmTeaDetail.userId,1);
		});
		//点击移除教师
		$(".f_bt_detUser").click(function(){
			deleteTea(cropId,userId,lmTeaDetail.userId);
		});
		//修改教师姓名
		$("#teaName_edit").click(function(){
			editTeaName(cropId,lmTeaDetail.userId,lmTeaDetail.phone,null,lmTeaDetail.name);
		});
		//修改手机号码
		$("#phone_edit").click(function(){
			editPhone(cropId,lmTeaDetail.userId,lmTeaDetail.phone,lmTeaDetail.name);
		});
		//修改角色
		$("#roleNames_edit").click(function(){
			editTeaRole(cropId,lmTeaDetail.userId,lmTeaDetail.roleList,lmTeaDetail.teachList);
		});
		//修改带班信息
		$("#teachNames_edit").click(function(){
			editTeaTeach(cropId,lmTeaDetail.userId,lmTeaDetail.teachList);
		});
		//修改所属部门
		$("#deptNames_edit").click(function(){
			editTeaDept(cropId,lmTeaDetail.userId,lmTeaDetail.deptList);
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
	function deleteTea(pcropId,puserId,ptargetUserId){
		$.post(SERVER_DELETE_TEA_URL,
				{
					cropId:pcropId,
					userId:puserId,
					targetUserId:ptargetUserId
				},
				function(result){
					if(common.verifyToken(result,pcropId)){
						if(result.resultCode == '001'){
							storage.deleteLocalStorage("teaLinkman_"+pcropId);
							storage.deleteLocalStorage("classLinkman_"+pcropId);
							storage.setLocalStorage("isLinkmanRefresh_"+pcropId,"1");
							tip.openAlert1("提示","教师移除成功",function(){
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
	
	//生成html页面
	function genHtml(lmTeaDetail){
		$("#teaName").prepend(lmTeaDetail.name);
		$("#phone").prepend(lmTeaDetail.phone);
		var roleText = '';
		var teachText = '';
		var deptText = '';
		if(lmTeaDetail.roleList){
			for(var i=0;i<lmTeaDetail.roleList.length && i<2;i++){
				roleText += lmTeaDetail.roleList[i].name + ",";
			}
			if(roleText.length > 0){
				roleText = roleText.substring(0,roleText.length-1);
				if(lmTeaDetail.roleList.length > 2){
					roleText += "...";
				}
			}
		}
		if(roleText.length > 0){
			$("#roleNames").prepend(roleText);
		}else{
			$("#roleNames").prepend("暂无角色");
		}
		if(lmTeaDetail.teachList){
			for(var i=0;i<lmTeaDetail.teachList.length && i<2;i++){
				teachText += lmTeaDetail.teachList[i].className;
				if(lmTeaDetail.teachList[i].subjectName){
					teachText += "."+lmTeaDetail.teachList[i].subjectName
				}
				teachText += ",";
			}
			if(teachText.length > 0){
				teachText = teachText.substring(0,teachText.length-1);
				if(lmTeaDetail.teachList.length > 2){
					teachText += "...";
				}
			}
		}
		if(teachText.length > 0){
			$("#teachNames").prepend(teachText);
		}else{
			$("#teachNames").prepend("暂无带班信息");
		}
		if(lmTeaDetail.deptList){
			for(var i=0;i<lmTeaDetail.deptList.length && i<2;i++){
				deptText += lmTeaDetail.deptList[i].name+",";
			}
			if(deptText.length > 0){
				deptText = deptText.substring(0,deptText.length-1);
				if(lmTeaDetail.deptList.length > 2){
					deptText += "...";
				}
			}
		}
		$("#deptNames").prepend(deptText)
		if(lmTeaDetail.followed == 1){
			$(".rem_Edit").show();
		}
		
	}
	
	//修改家长姓名
	function editTeaName(pcropId,puserId,pphone,pclassCode,pname){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
				cropId:pcropId,
				userId:puserId,
				type:1,
				phone:pphone,
				classCode:pclassCode,
				name:pname
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
				type:1,
				phone:pphone,
				name:pname
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_PHONE_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
	//查询教师部门信息
	function editTeaDept(pcropId,puserId,pdeptList){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
			cropId:pcropId,
			userId:puserId,
			deptList:pdeptList
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_DEPT_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
	//修改角色
	function editTeaRole(pcropId,puserId,proleList,teachList){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
				cropId:pcropId,
				userId:puserId,
				roleList:proleList,
				teachList:teachList
			}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_ROLE_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
	//修改带班信息
	function editTeaTeach(pcropId,puserId,pteachList){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		var paramValue = {
				cropId:pcropId,
				userId:puserId,
				teachList:pteachList
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		document.location.href = SERVER_EDIT_TEACH_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&funcType="+1;
	}
	
});