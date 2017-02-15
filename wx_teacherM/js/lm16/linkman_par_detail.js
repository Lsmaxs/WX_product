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
	var wx = require('wx');
	
	var SERVER_PAR_EDIT_URL = common.ctx + "/wap/html/lm16/linkman_par_edit.html";
	var SERVER_TEA_WORD_URL = common.ctx + "/wap/html/words/words_tea_edit.html";
	var SERVER_PAR_WORD_URL = common.ctx + "/wap/html/words/words_par_edit.html";
	var SERVER_SHARE_URL = common.produsUrl + '/wap/html/joinex/share_join.html';  //分享页面
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");//教师uid
		var cropId = common.getUrlParam("cropId");
		var type = common.getUrlParam("type");
		var parUuid = common.getUrlParam("parUuid");//家长uid
		var stuId = common.getUrlParam("stuId");//学生uid
		
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		var ia = storage.getSessionStorage("ia_"+cropId,"1");
		
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
		
		//从缓存中取回用户信息
		var lmParDetail;
		//重新获取家长信息
		if(stuId != null && stuId != ""){
			$.post(common.produsUrl+"/inner/joinex/getParInfo",
				{
					userId:userId,
					cropId:cropId,
					parUuid:parUuid,
					stuId:stuId
				},
				function(result){
					if(result.resultCode == "001"){
						genHtml(result);
						var parObj = {
							cropId:cropId,
							userId:result.uuid,
							icon:result.icon,
							phone:result.phone,
							name:result.name,
							stuId:result.stuId,
							stuName:result.stuName,
							followed:result.followed,
							cid:result.cid,
							className:result.className,
							tag:result.tag
						}
						storage.setSessionStorage("lm_par_detail",JSON.stringify(parObj));
						lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
						
						$(".user_edit").show();
						
						//点击邀请关注
						$("#inviteAttention").click(function(){
							invitePerson();
						});
						
						//发送留言
						$("#sendWords").click(function(){
							sendWords(type,lmParDetail.cid,lmParDetail.userId,lmParDetail.name);
						});
						
						//点击编辑用户信息
						$(".user_edit").click(function(){
							document.location.href = SERVER_PAR_EDIT_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type+"&parUuid="+parUuid+"&stuId="+stuId;
						});
						$(".btn_phone").parent().attr("href","tel:"+lmParDetail.phone);

					}else{
						tip.openAlert1("提示",result.resultMsg,function(){
							wx.closeWindow();
						});
					}
				}
			);
		}else{
			lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
			genHtml(lmParDetail);
			
			var userEditFlag = false;
			if(userId == lmParDetail.userId){  
				userEditFlag = true;
			}else if(ia == 1){
				userEditFlag = true;
			}else if(type == 1){  //教师身份
				var myselfTeacherExInfo = JSON.parse(storage.getLocalStorage("myselfTeacherExInfo_"+cropId));
				if(myselfTeacherExInfo.teachList){
					for(var i=0;i<myselfTeacherExInfo.teachList.length;i++){
						if(lmParDetail.cid == myselfTeacherExInfo.teachList[i].classCode && myselfTeacherExInfo.teachList[i].isMaster == 1){
							userEditFlag = true;
							break;
						}
					}
				}
			}
			if(userEditFlag){
				$(".user_edit").show();
			}
			
			
			//点击邀请关注
			$("#inviteAttention").click(function(){
				invitePerson();
			});
			
			//发送留言
			$("#sendWords").click(function(){
				sendWords(type,lmParDetail.cid,lmParDetail.userId,lmParDetail.name);
			});
			
			//点击编辑用户信息
			$(".user_edit").click(function(){
				goEditFunc(cropId,userId,type);
			});
			$(".btn_phone").parent().attr("href","tel:"+lmParDetail.phone);
			
		}
		
		
		
		
	}
	
	//生成html页面
	function genHtml(lmParDetail){
		var type = $("#type").val();
		//头像
		if(lmParDetail.followed == 1){  //关注
			$("#userHeadImage").attr("src",lmParDetail.icon);
			if(type == 1){
				$("#sendWords").show();
			}
		}else{  //没有关注
			$("#userHeadImage").attr("src",common.ctx + '/wap/images/user_pace_no.png');
			$("#inviteAttention").show();
		}
		
		$('#parName').html(lmParDetail.name);
		$('#stuText').html(lmParDetail.stuName+"  "+lmParDetail.tag);
		$("#phone").html(lmParDetail.phone);
		$("#stuName").html(lmParDetail.stuName);
		$("#className").html(lmParDetail.className);
		$("#relationName").html(lmParDetail.tag);
		
	}
	
	//邀请关注
	function invitePerson(){
		var schoolInfo = JSON.parse(storage.getSessionStorage("school_info"));
		document.location.href = SERVER_SHARE_URL + "?cropId="+schoolInfo.cropId+"&schoolCode="+schoolInfo.schoolCode+"&schoolName="+schoolInfo.schoolName;
	}
	
	//教师发送留言
	function sendWords(type,classCode){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
		var paramValue = {
				userId:lmParDetail.userId,
				icon:lmParDetail.icon,
				phone:lmParDetail.phone,
				name:lmParDetail.name,
				stuId:lmParDetail.stuId,
				stuName:lmParDetail.stuName,
				followed:lmParDetail.followed,
				cid:lmParDetail.cid,
				className:lmParDetail.className,
				tag:lmParDetail.tag
		}
		storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
		if(type == 1){  //教师
			document.location.href = SERVER_TEA_WORD_URL+"?classCode="+classCode+"&targetUuid="+lmParDetail.userId+"&targetName="+encodeURI(lmParDetail.name)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
		}else{  //家长
			document.location.href = SERVER_PAR_WORD_URL+"?classCode="+classCode+"&targetUuid="+lmParDetail.userId+"&targetName="+encodeURI(lmParDetail.name)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
		}
	}
	
	//跳转至编辑页面
	function goEditFunc(cropId,userId,type){
		document.location.href = SERVER_PAR_EDIT_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
	}
	
});