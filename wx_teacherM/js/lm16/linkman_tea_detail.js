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
	
	var SERVER_TEA_EDIT_URL = common.ctx + "/wap/html/lm16/linkman_tea_edit.html";
	var SERVER_TEA_WORD_URL = common.ctx + "/wap/html/words/words_tea_edit.html";  //教师留言
	var SERVER_PAR_WORD_URL = common.ctx + "/wap/html/words/words_par_edit.html";  //家长留言
	var SERVER_SHARE_URL = common.produsUrl + '/wap/html/joinex/share_join.html';  //分享页面
	
	var classCode = '';
	var lmTeaDetail;
	init();
	
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
		
		if(userId == lmTeaDetail.userId || storage.getSessionStorage("ia_"+cropId) == '1'){
			$(".user_edit").show();
		}
		
		//点击邀请关注
		$("#inviteAttention").click(function(){
			invitePerson();
		});
		//点击发送留言
		$("#sendWords").click(function(){
			sendWords(type,lmTeaDetail.userId,lmTeaDetail.name);
		});
		//点击编辑用户信息
		$(".user_edit").click(function(){
			goEditFunc(cropId,userId,type);
		});
		$(".btn_phone").parent().attr("href","tel:"+lmTeaDetail.phone);
		
		//请求学校信息
		if(storage.getSessionStorage("school_info")){
			
		}else{
			$.post(common.produsUrl+"/info/getSchoolInfo",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						storage.setSessionStorage("school_info",JSON.stringify(result));
					}
				);
		}
		
	}
	
	//生成html页面
	function genHtml(lmTeaDetail){
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var type = $("#type").val();  //1教师2家长
		//头像
		if(lmTeaDetail.followed == 1){  //关注
			$("#userHeadImage").attr("src",lmTeaDetail.icon);
			if(type == 2){
				$.post(common.ctx+"/wap/par/lm16/getTeaSchoolCode",
						{
							userId:userId,
							cropId:cropId,
							teachId:lmTeaDetail.userId
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == '001'){
									classCode = result.classCode;
								}
							}
						}
					);
				$("#sendWords").show();
			}else{
				$("#sendWords").show();
			}
		}else{
			$("#userHeadImage").attr("src",common.ctx + '/wap/images/user_pace_no.png');
			$("#inviteAttention").show();
		}
		$("#teaName").html(lmTeaDetail.name);
		$("#phone").html(lmTeaDetail.phone);
		$("#phone").parent().attr("href","tel:"+lmTeaDetail.phone);
		
		//请求额外教师信息
		$.post(common.ctx+"/wap/tea/lm16/getTeaExInfo",
				{
					userId:lmTeaDetail.userId,
					cropId:cropId
				},
				function(result){
					if(result.resultCode == '001'){
						var roleText = '';
						var teachText = '';
						var deptText = '';
						//将数据保存到sessionStroge中
						lmTeaDetail.isAdmin = result.isAdmin;
						lmTeaDetail.roleList = [];
						if(result.roleList){
							for(var i=0;i<result.roleList.length;i++){
								if(i<2){
									roleText += result.roleList[i].name + ",";
								}
								lmTeaDetail.roleList.push({code:result.roleList[i].code,name:result.roleList[i].name});
							}
							if(result.roleList.length > 0){
								roleText = roleText.substring(0,roleText.length-1);
								if(result.roleList.length > 2){
									roleText += "...";
								}
							}
						}
						lmTeaDetail.teachList = [];
						if(result.teachList){
							for(var i=0;i<result.teachList.length;i++){
								if(i<2){
									teachText += result.teachList[i].className;
									if(result.teachList[i].subjectName){
										teachText += "-"+result.teachList[i].subjectName;
									}
									teachText += ",";
								}
								lmTeaDetail.teachList.push({isMaster:result.teachList[i].isMaster,
										classCode:result.teachList[i].classCode,className:result.teachList[i].className,
										subjectCode:result.teachList[i].subjectCode,subjectName:result.teachList[i].subjectName});
							}
							if(result.teachList.length > 0){
								teachText = teachText.substring(0,teachText.length-1);
								if(result.teachList.length > 2){
									teachText += "...";
								}
							}
						}
						lmTeaDetail.deptList = [];
						if(result.deptList){
							for(var i=0;i<result.deptList.length;i++){
								if(i<2){
									deptText += result.deptList[i].name+",";
								}
								lmTeaDetail.deptList.push({code:result.deptList[i].code,name:result.deptList[i].name});
							}
							if(result.deptList.length > 0){
								deptText = deptText.substring(0,deptText.length-1);
								if(result.deptList.length > 2){
									deptText += "...";
								}
							}
						}
						storage.deleteSessionStorage("lm_tea_detail");
						storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
						
						//渲染页面
						if(roleText.length > 0){
							$("#roleNames").html(roleText);
						}else{
							$("#roleNames").html("暂无角色");
						}
						if(teachText.length > 0){
							$("#teachNames").html(teachText);
						}else{
							$("#teachNames").html("暂无带班信息");
						}
						$("#deptNames").html(deptText);
					}
				}
			);
		
	}
	
	//教师发送留言
	function sendWords(type){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		
		var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
		var paramValue = {
				userId:lmTeaDetail.userId,
				icon:lmTeaDetail.icon,
				phone:lmTeaDetail.phone,
				name:lmTeaDetail.name,
				followed:lmTeaDetail.followed,
				targetUserType:1
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		if(type == 1){  //教师
			document.location.href = SERVER_TEA_WORD_URL+"?targetUuid="+lmTeaDetail.userId+"&targetName="+encodeURI(lmTeaDetail.name)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
		}else{  //家长
			document.location.href = SERVER_PAR_WORD_URL+"?classCode="+classCode+"&targetUuid="+lmTeaDetail.userId+"&targetName="+encodeURI(lmTeaDetail.name)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
		}
	}
	
	//跳转至编辑页面
	function goEditFunc(cropId,userId,type){
		document.location.href = SERVER_TEA_EDIT_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
	}
	
	//邀请关注
	function invitePerson(){
		var schoolInfo = JSON.parse(storage.getSessionStorage("school_info"));
		document.location.href = SERVER_SHARE_URL + "?cropId="+schoolInfo.cropId+"&schoolCode="+schoolInfo.schoolCode+"&schoolName="+schoolInfo.schoolName;
	}
	
});