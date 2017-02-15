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
 * 	"teachList":{"isMaster":1,"classCode":"","className":"","subjectCode":"","subjectName":""}
 * }
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
		var myTeachStr = '';
		if(paramValue.teachList){
			for(var i=0;i<paramValue.teachList.length;i++){
				if(paramValue.teachList[i].isMaster == 1){
					myTeachStr += ','+paramValue.teachList[i].classCode;
				}
			}
		}
		loadLocalData(myTeachStr);
		//查询学校班主任情况
		$(".phone_h1 a").click(function(){
			document.location.href = common.ctx + '/wap/html/lm16/school_teach.html?cropId='+cropId+'&userId='+userId;
		});
		
		$(".list_con").on("click",".weui_cell_fr",function(){
			$(".weui_cell_fr a").html('<span class="op-checkclass"></span>');
			$(this).find("a").html('<span class="op-checkclassd"></span>');
			var className = $(this).find("a")[0].getAttribute("data-classname");
			var classCode = $(this).find("a")[0].getAttribute("data-classcode");
			$(".l_box").html('<p>当前已选择所带班级：</p><span>'+className+'<a href="javascript:;" class="del_class">删除</a></span>');
		});
		
		$(".f_bottom").on("click",".del_class",function(){
			$(".weui_cell_fr a").html('<span class="op-checkclass"></span>');
			$(".l_box").html('<p>当前已选择所带班级：</p>');
		});
		
		$(".bt_green").click(function(){
			var checkclassd = $(".op-checkclassd");
			if(checkclassd.length > 0){
				var classcode = checkclassd.parent().attr("data-classcode");
				var classname = checkclassd.parent().attr("data-classname");
				saveSelectClass(classcode,classname);
			}else{  
				tip.openAlert1("提示","请选择班级");
			}
			
		});
	}
	
	//保存教师所选班级信息
	function saveSelectClass(classCode,className){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var funcType = $("#funcType").val();
		var type = $("#type").val();
		var tmpCode = ",2"
		if(isHaveRole(paramValue.roleList,"1")){
			tmpCode += ",1"
		}
		var jsonObj = {};
		if(tmpCode.length > 0){
			jsonObj.roleId = tmpCode.substring(1);
		}
		jsonObj.editRole = 1;
		//jsonObj.classSubList = [{classCode:classCode,className:className}];
		jsonObj.classCode = classCode;
		jsonObj.className = className;
		$.post(common.ctx+"/wap/per/lm16/saveTeaInfo",
				{
					userId:paramValue.userId,
					cropId:cropId,
					json:JSON.stringify(jsonObj)
				},
				function(result){
					if(result.resultCode == '001'){
						storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
						if(funcType == 0){
							//更新localStorage数据
							var userInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
							var newRoleList = [];
							newRoleList.push({code:2,name:"班主任"});
							if(isHaveRole(userInfo.roleList,"1")){
								newRoleList.push({code:1,name:"管理员"});
							}
							userInfo.roleList = newRoleList;
							
							//修改客户端缓存带班信息
							var flag = true;
							var newTeaClassList = new Array();
							if(userInfo.teaClassList){
								for(var i = 0;i<userInfo.teaClassList.length;i++){
									if(userInfo.teaClassList[i].subjectCode && userInfo.teaClassList[i].subjectCode != ''){
										if(userInfo.teaClassList[i].classCode == classCode){
											userInfo.teaClassList[i].isMaster = 1;
											newTeaClassList.push(userInfo.teaClassList[i]);
											flag = false;
										}else{
											newTeaClassList.push(userInfo.teaClassList[i]);
										}
									}
								}
							}
							if(flag){
								newTeaClassList.push({classCode:classCode,className:className,isMaster:1});
							}
							userInfo.teaClassList = newTeaClassList;
							
							storage.setLocalStorage("teaInfo_"+cropId,JSON.stringify(userInfo));
							paramValue.roleList = newRoleList;
							storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
							document.location.href = SERVER_TEA_INFO_URL + "?cropId="+cropId+"&userId="+userId;
						}else{
							var newRoleList = [];
							newRoleList.push({code:2,name:"班主任"});
							if(isHaveRole(paramValue.roleList,"1")){
								newRoleList.push({code:1,name:"管理员"});
							}
							var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
							lmTeaDetail.roleList = newRoleList;
							
							//修改客户端缓存带班信息
							var flag = true;
							var newTeachList = new Array();
							if(lmTeaDetail.teachList){
								for(var i=0;i<lmTeaDetail.teachList.length;i++){
									if(lmTeaDetail.teachList[i].subjectCode && lmTeaDetail.teachList[i].subjectCode != ''){
										if(lmTeaDetail.teachList[i].classCode == classCode){
											lmTeaDetail.teachList[i].isMaster = 1;
											newTeachList.push(lmTeaDetail.teachList[i]);
											flag = false;
										}else{
											newTeachList.push(lmTeaDetail.teachList[i]);
										}
									}
								}
							}
							if(flag){
								newTeachList.push({classCode:classCode,className:className,isMaster:1});
							}
							lmTeaDetail.teachList = newTeachList;
							
							storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
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
	
	//加载本地数据
	function loadLocalData(myTeachStr){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		
		try{
			if(storage.getLocalStorage("classSelectTea_"+paramValue.cropId)){
				var classSelectTea = JSON.parse(storage.getLocalStorage("classSelectTea_"+paramValue.cropId));
				var tmpStr = genClassSelectHtml(classSelectTea.classList,classSelectTea.teachList,myTeachStr);
				$(".list_con").html(tmpStr);
				if(classSelectTea.teachList.length > 0){
					$(".phone_h1").show();
				}else{
					$(".phone_h1").hide();
				}
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/per/lm16/teach",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){
								var tmpStr = genClassSelectHtml(result.classList,result.teachList,myTeachStr);
								$(".list_con").html(tmpStr);
								storage.deleteLocalStorage("classSelectTea_"+cropId);
								storage.setLocalStorage("classSelectTea_"+cropId,JSON.stringify(result));
								if(result.teachList.length > 0){
									$(".phone_h1").show();
								}else{
									$(".phone_h1").hide();
								}
							}
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("teaInfo_"+cropId);
		}
		
	}
	
	//生成html
	function genClassSelectHtml(classList,teachList,myTeachStr){
		var tmpStr = '';
		if(classList){
			for(var i=0;i<classList.length;i++){
				if(!isHaveMaster(classList[i].code,teachList)){
					tmpStr += '<div class="weui_cell line_b">'+
							  '<div class="weui_cell_fl">'+classList[i].name+'</div>'+
							  '<div class="weui_cell_fr"><a href="javascript:;" class="operate-btn" data-classname='+classList[i].name+' data-classcode='+classList[i].code+' >';
					if(myTeachStr.indexOf(','+classList[i].code) >= 0){
						tmpStr += '<span class="op-checkclassd"></span>';
					}else{
						tmpStr += '<span class="op-checkclass"></span>';
					}
					tmpStr += '</a></div></div>';
				}
			}
		}
		return tmpStr;
        
	}
	
	//判断该班级是否存在班主任角色
	function isHaveMaster(classCode,teachList){
		if(teachList){
			for(var i=0;i<teachList.length;i++){
				if(teachList[i].classCode == classCode){
					return true;
				}
			}
		}
		return false;
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
	
	
});