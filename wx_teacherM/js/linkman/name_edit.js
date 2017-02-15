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
	var userInfo;
	var childIndex;
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var type = common.getUrlParam("type");  //type=1为教师；type=2为家长；type=3为学生
		childIndex = common.getUrlParam("childIndex");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#type").val(type);
		
		if(type == 1){  //教师
			userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+cropId));
		}else if(type == 2){  //家长
			userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
		}else if(type == 3){
			userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId)).childItems[childIndex];
		}
		if(userInfo){
			//$(".out_txt").html(userInfo.name);
			$("#infoName").val(userInfo.name);
		}
		
		$(".del_tit").click(function(){
			$(".out_txt").html('');
			$("#infoName").val('');
		});
		
//		$("#infoName").click(function(){
//			$(".out_txt").html('');
//		});
		
		$(".bt_green").click(function(){
			saveName(type);
		});
		
	}
	
	/**
	 * 保存姓名
	 */
	function saveName(type){
		
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
        if(infoName.length >= 10){
        	tip.openAlert1("提示","请输入小于10个字符");
        	return;
        }
        
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		if(type == 1){  //修改教师
			var jsonObj = {name:infoName,oldPhone:userInfo.phone};
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
							userInfo.name = infoName;
							storage.setLocalStorage("teaInfo_"+cropId,JSON.stringify(userInfo));
							document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				);
		}else if(type == 2){  //修改家长
			var jsonObj = {name:infoName,oldPhone:userInfo.phone};
			$.post(common.ctx+"/wap/personal/saveParInfo",
					{
						userId:userId,
						cropId:cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(result.resultCode == '001'){
							//更新localStorage数据
							var userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
							userInfo.name = infoName;
							storage.setLocalStorage("parInfo_"+cropId,JSON.stringify(userInfo));
							document.location.href = SERVER_PAR_INFO_URL + "?cropId="+cropId+"&userId="+userId;
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				);
		}else if(type == 3){
			var jsonObj = {StuUserId:userInfo.userId,StuName:infoName,OldClassCode:userInfo.classCode};
			$.post(common.ctx+"/wap/personal/saveStuInfo",
					{
						userId:userId,
						cropId:cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(result.resultCode == '001'){
							//更新localStorage数据
							var userInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
							userInfo.childItems[childIndex].name = infoName;
							storage.setLocalStorage("parInfo_"+cropId,JSON.stringify(userInfo));
							document.location.href = SERVER_PAR_INFO_URL + "?cropId="+cropId+"&userId="+userId;
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				);
		}
		
	}
	
});