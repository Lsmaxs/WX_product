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
	var toast = require('widget/toast');
	
	var SERVER_TEA_INFO_URL = common.ctx + '/wap/html/linkman/info_tea.html';
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	var deleteCode = '';
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		var myRoleStr = '';
		var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+cropId));
		if(userInfo.roleList){
			for(var i=0;i<userInfo.roleList.length;i++){
				myRoleStr += ","+userInfo.roleList[i].code;
				if(userInfo.roleList[i].code == '1'){
					deleteCode += ',6';
				}else if(userInfo.roleList[i].code == '3'){
					deleteCode += ',5';
				}
			}
		}
		
		loadLocalData(myRoleStr);
		
		$(".list_con").on('click','#master_div',function(){
			document.location.href = common.ctx + '/wap/html/linkman/class_select_tea.html?cropId='+cropId+"&userId="+userId;
		});
		
		$(".list_con").on('click','#otherrole_div',function(){
			var rolecode = this.getAttribute("data-rolecode");
			var rolename = this.getAttribute("data-rolename");
			if('2' == rolecode){  //如果是管理员，直接跳转信息主页
				document.location.href = SERVER_TEA_INFO_URL + '?cropId='+cropId+"&userId="+userId;
			}else{  //如果是普通老师，先修改角色，再进行跳转操作
				var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+cropId));
				if(isHaveRole(userInfo.roleList,rolecode)){
					document.location.href = SERVER_TEA_INFO_URL + '?cropId='+cropId+"&userId="+userId;
				}else{
					var tmpCode = deleteCode+","+rolecode;
					tmpCode = tmpCode.substring(1);
					editTeaRole(tmpCode,rolename);
				}
			}
		});
		
	}
	
	//修改教师角色
	function editTeaRole(rolecode,rolename){
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var jsonObj = {editRole:1,roleId:rolecode};
		$.post(common.ctx+"/wap/personal/saveTeaInfo",
				{
					userId:userId,
					cropId:cropId,
					json:JSON.stringify(jsonObj)
				},
				function(result){
					if(result.resultCode == '001'){
						//更新localStorage数据
						var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+cropId));
						var newRoleList = [];
						newRoleList.push({code:rolecode,name:rolename});
						if(isHaveRole(userInfo.roleList,'2')){
							newRoleList.push({code:'2',name:'管理员'});
						}
						userInfo.roleList = newRoleList;
						storage.setLocalStorage("teaInfo_"+cropId,JSON.stringify(userInfo));
						document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
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
		
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		try{
			if(storage.getLocalStorage("roleList_"+cropId)){
				var tmpStr = genRoleHtml(JSON.parse(storage.getLocalStorage("roleList_"+cropId)).items,myRoleStr);
				$(".list_con").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/personal/role",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genRoleHtml(result.items,myRoleStr);
							$(".list_con").html(tmpStr);
							storage.deleteLocalStorage("roleList_"+cropId);
							storage.setLocalStorage("roleList_"+cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
		}catch(e){
			storage.deleteLocalStorage("roleList_"+cropId);
		} 
		
	}
	
	//生成角色html
	function genRoleHtml(roleList,myRoleStr){
		
		var tmpStr = '';
		if(roleList){
			for(var i=0;i<roleList.length;i++){
				if(roleList[i].code == '2' && myRoleStr.indexOf(",2") < 0){
					
				}else{
					if(roleList[i].name.indexOf('班主任') >= 0){
						tmpStr += '<div id="master_div" class="weui_cell line_b">';
					}else{
						tmpStr += '<div id="otherrole_div" class="weui_cell line_b" data-rolecode="'+roleList[i].code+'" data-rolename="'+roleList[i].name+'" >';
					}
					if(roleList[i].code == '2'){
						tmpStr += '<div class="weui_cell_fl" style="color:#777" >'+roleList[i].name;
					}else{
						tmpStr += '<div class="weui_cell_fl" >'+roleList[i].name;
					}
					if(myRoleStr.indexOf(","+roleList[i].code) >= 0){
						if(roleList[i].code == '2'){
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