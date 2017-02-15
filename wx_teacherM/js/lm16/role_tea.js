/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"roleList":{
 * 		"code":"",	
 * 		"name":""
 * 	},
 *  "teachList":{"isMaster":1,"classCode":"","className":"","subjectCode":"","subjectName":""}
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
	var toast = require('widget/toast');
	var wxApi = require('wxApi');
	
	var SERVER_TEA_INFO_URL = common.ctx + '/wap/html/lm16/info_tea.html';
	var SERVER_TEA_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_tea_edit.html';
	var paramValue;
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
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
		
		//获取参数数据
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		
		var myRoleStr = '';
		if(paramValue.roleList){
			for(var i=0;i<paramValue.roleList.length;i++){
				myRoleStr += ","+paramValue.roleList[i].code;
			}
		}
		loadLocalData(myRoleStr);
		
		$(".list_con").on('click','#master_div',function(){
			document.location.href = common.ctx + '/wap/html/lm16/class_select_tea.html?cropId='+cropId+"&userId="+userId+"&funcType="+funcType+"&type="+type;
		});
		
		$(".list_con").on('click','#otherrole_div',function(){
			var rolecode = this.getAttribute("data-rolecode");
			var rolename = this.getAttribute("data-rolename");
			if('1' == rolecode){  //如果是管理员，直接跳转信息主页
				if(funcType == 0){
					document.location.href = SERVER_TEA_INFO_URL + '?cropId='+cropId+"&userId="+userId;
				}else{
					document.location.href = SERVER_TEA_OUFO_URL + '?cropId='+cropId+"&userId="+userId+"&type="+type;
				}
			}else{  //如果是普通老师，先修改角色，再进行跳转操作
				var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
				if(isHaveRole(paramValue.roleList,rolecode)){
					if(funcType == 0){
						document.location.href = SERVER_TEA_INFO_URL + '?cropId='+cropId+"&userId="+userId;
					}else{
						document.location.href = SERVER_TEA_OUFO_URL + '?cropId='+cropId+"&userId="+userId+"&type="+type;
					}
				}else{
					var tmpCode = rolecode;
					if(isHaveRole(paramValue.roleList,'1')){
						tmpCode += ",1";
					}
					editTeaRole(tmpCode,rolename);
				}
			}
		});
		
	}
	
	//修改教师角色
	function editTeaRole(rolecode,rolename){
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var funcType = $("#funcType").val();
		var type = $("#type").val();
		var jsonObj = {editRole:1,roleId:rolecode};
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
							var newRoleList = [];
							newRoleList.push({code:rolecode,name:rolename});
							if(isHaveRole(userInfo.roleList,'1')){
								newRoleList.push({code:'1',name:'管理员'});
							}
							userInfo.roleList = newRoleList;
							storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(userInfo));
							document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
						}else{
							var newRoleList = [];
							newRoleList.push({code:rolecode,name:rolename});
							if(isHaveRole(paramValue.roleList,'1')){
								newRoleList.push({code:'1',name:'管理员'});
							}
							var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
							lmTeaDetail.roleList = newRoleList;
							storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
							paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
							paramValue.roleList = newRoleList;
							storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
							document.location.href = SERVER_TEA_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
						}
					}else{
						tip.openAlert1("提示",result.resultMsg);
					}
				}
			);
		
	}
	
	//判断是否存在该角色
	function isHaveRole(roleList,code){
		if(roleList){
			for(var i=0;i<roleList.length;i++){
				if(roleList[i].code == code){
					return true;
				}
			}
		}
		return false;
	}
	
	//加载本地数据
	function loadLocalData(myRoleStr){
		
		try{
			if(storage.getLocalStorage("roleList_"+paramValue.cropId)){
				var tmpStr = genRoleHtml(JSON.parse(storage.getLocalStorage("roleList_"+paramValue.cropId)).items,myRoleStr);
				$(".list_con").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/per/lm16/role",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genRoleHtml(result.items,myRoleStr);
							$(".list_con").html(tmpStr);
							storage.deleteLocalStorage("roleList_"+paramValue.cropId);
							storage.setLocalStorage("roleList_"+paramValue.cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
		}catch(e){
			storage.deleteLocalStorage("roleList_"+paramValue.cropId);
		} 
		
	}
	
	//生成角色html
	function genRoleHtml(roleList,myRoleStr){
		var tmpStr = '';
		if(roleList){
			for(var i=0;i<roleList.length;i++){
				if(roleList[i].code == '1' && myRoleStr.indexOf(",1") < 0){
					
				}else{
					if(roleList[i].name.indexOf('班主任') >= 0){
						tmpStr += '<div id="master_div" class="weui_cell line_b">';
					}else{
						tmpStr += '<div id="otherrole_div" class="weui_cell line_b" data-rolecode="'+roleList[i].code+'" data-rolename="'+roleList[i].name+'" >';
					}
					if(roleList[i].code == '1'){
						tmpStr += '<div class="weui_cell_fl" style="color:#777" >'+roleList[i].name;
					}else{
						tmpStr += '<div class="weui_cell_fl" >'+roleList[i].name;
					}
					if(myRoleStr.indexOf(","+roleList[i].code) >= 0){
						if(roleList[i].code == '1'){
							tmpStr += '<span class="op-checked-hui"></span>';
						}else{
							tmpStr += '<span class="op-checked"></span>';
						}
					}
					tmpStr += '</div><div class="weui_cell_fr">';
					if(roleList[i].name.indexOf('班主任') >= 0){
						tmpStr += '<span class="dy_more"></span>';
					}
					tmpStr += '</div></div>';
				}
			}
		}
		tmpStr += '<div class="b_ts"><p>1、如您在担任班主任，请点击&ldquo;班主任&rdquo;，并设置所带班级；<br />2、如果您没在担任班主任，请选择&ldquo;普通老师&rdquo;。</p></div>';
		return tmpStr;
		
	}
	
});