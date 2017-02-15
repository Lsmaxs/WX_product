/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"name":"",
 * 	"phone":"",
 * 	"teachList":[
 * 		{
 * 			"classCode":"",
 * 			"className":"",
 * 			"subjectCode":"",
 * 			"subjectName":""
 * 		}
 * 	]
 * 
 * }
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var storage = require('storage');
	var tip = require('widget/tip');
	var iscroll = require('widget/iscroll');
	var wxApi = require('wxApi');
	
	var NEXT_SERVER_URL = common.ctx + '/wap/html/lm16/info_tea.html';
	
	var paramValue;
	init();
	
	var index1 = 2;
	var index2 = 2;
	var slideFlag = false;
	var editObj = null;
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var funcType = common.getUrlParam("funcType");
		var type = common.getUrlParam("type");
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#funcType").val(funcType);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		
		var csHtml = genClassSubHtml(paramValue.teachList);
		if(csHtml.length > 10){
			$(".list_con").html(csHtml);
		}else{
			$("#noData").show();
			$("#commonShow").hide();
		}
		loadLocalData();
		
		$(".list_con").on("click",".del_km",function(){
			var classCode = $(this).parent().parent().attr("data-class-code");
			var subjectCode = $(this).parent().parent().attr("data-subject-code");
			var obj = this;
			tip.openAlert2("提示","确认要删除该任教信息吗？",function(){
				editClassSub(1,classCode,null,subjectCode,null,obj);
			});
			return false;
		});
		
		var scrollPl = iscroll.iscroll('.pl',{
			scrollX : false,
			scrollY : true,
			bounce : false,
			eventPassthrough : false,
			momentum : true,
			directionLockThreshold : 10,
			snap: 'li'
		});
		
		var scrollPr = iscroll.iscroll('.pr',{
			scrollX : false,
			scrollY : true,
			bounce : false,
			eventPassthrough : false,
			momentum : true,
			directionLockThreshold : 10,
			snap: 'li'
		});
		
		$(".bt_green").click(function(){
			if(storage.getLocalStorage("classList_"+paramValue.cropId) && storage.getLocalStorage("subjectList_"+paramValue.cropId)){
				if(!slideFlag){
					$(".pop_addkm").hide().slideDown(500);
					scrollPl.refresh();
					scrollPr.refresh();
					slideFlag = true;
				}
			}else{
				tip.openAlert1("提示","班级数据与科目数据正在加载中...");
			}
			
		});
		
		scrollPl.on('scrollEnd', function () {
			var _index = Math.round(this.y/40);
		    var _y = _index*40;
		    scrollPl.scrollTo(0,_y);
		    index1 = _index*-1+2;
		    $(".pl li").removeClass("sel");
		    $($(".pl li")[index1]).addClass("sel");
		});
		
		scrollPr.on('scrollEnd', function () {
			var _index = Math.round(this.y/40);
		    var _y = _index*40;
		    scrollPr.scrollTo(0,_y);
		    index2 = _index*-1+2;
		    $(".pr li").removeClass("sel");
		    $($(".pr li")[index2]).addClass("sel");
		});
		
		$(".bt_kmcancel").click(function(){
			$(".pop_addkm").show().slideUp(500);
			slideFlag = false;
			scrollPl.scrollTo(0,0);
		    $(".pl li").removeClass("sel");
		    $($(".pl li")[2]).addClass("sel");
		    
		    scrollPr.scrollTo(0,0);
		    $(".pr li").removeClass("sel");
		    $($(".pr li")[2]).addClass("sel");
		    editObj = null;
		});
		
//		$(".list_con").on("click",".weui_cell",function(){
//			var classCode = this.getAttribute("data-class-code");
//			var subjectCode = this.getAttribute("data-subject-code");
//			
//			slideFlag = false;
//			if(storage.getLocalStorage("classList_"+paramValue.cropId) && storage.getLocalStorage("subjectList_"+paramValue.cropId)){
//				if(!slideFlag){
//					$(".pop_addkm").hide().slideDown(500);
//					scrollPl.refresh();
//					scrollPr.refresh();
//					slideFlag = true;
//				}
//			}else{
//				tip.openAlert1("提示","班级数据与科目数据正在加载中...");
//				return false;
//			}
//			
//			var gradeList = JSON.parse(storage.getLocalStorage("classList_"+paramValue.cropId));
//			var subjectList = JSON.parse(storage.getLocalStorage("subjectList_"+paramValue.cropId));
//			if(gradeList.items){
//				var z=0;
//				for(var i=0;i<gradeList.items.length;i++){
//					if(gradeList.items[i].items){
//						var classList = gradeList.items[i].items;
//						for(var j=0;j<classList.length;j++){
//							if(classCode == classList[j].code){
//								var _y = (z*-1)*40;
//							    scrollPl.scrollTo(0,_y);
//							    $(".pl li").removeClass("sel");
//							    $($(".pl li")[z+2]).addClass("sel");
//							    break;
//							}
//							z++;
//						}
//					}
//				}
//			}
//			if(subjectList.items){
//				for(var i=0;i<subjectList.items.length;i++){
//					if(subjectCode == subjectList.items[i].code){
//						var _y = (i*-1)*40;
//					    scrollPr.scrollTo(0,_y);
//					    $(".pr li").removeClass("sel");
//					    $($(".pr li")[i+2]).addClass("sel");
//					    break;
//					}
//				}
//			}
//			editObj = this;
//			
//		});
		
		$(".bt_kmsure").click(function(){
			$(".pop_addkm").show().slideUp(500);
			slideFlag = false;
			var classCode = $(".pl .sel").attr("data-code");
			var className = $(".pl .sel").attr("data-name");
			var subjectCode = $(".pr .sel").attr("data-code");
			var subjectName = $(".pr .sel").attr("data-name");
			
			if(classCode && subjectCode){
				var flag = false;
				if(paramValue.teachList){
					for(var i=0;i<paramValue.teachList.length;i++){
						if(editObj){
							var oldClassCode = editObj.getAttribute("data-class-code");
							var oldSubjectCode = editObj.getAttribute("data-subject-code");
							if(classCode == oldClassCode && subjectCode == oldSubjectCode){
								continue;
							}
						}
						if(paramValue.teachList[i].classCode == classCode && paramValue.teachList[i].subjectCode == subjectCode){
							flag = true;
							break;
						}
					}
				}
				if(flag){
					tip.openAlert1("提示","该班级科目已存在");
				}else{
					if(editObj){  //修改
						editClassSub(3,classCode,className,subjectCode,subjectName,editObj);
						editObj = null;
					}else{  //添加
						editClassSub(2,classCode,className,subjectCode,subjectName,null);
					}
				}
			}
			
		});
		
	}
	
	//加截本地数据
	function loadLocalData(){
		
		try{
			if(storage.getLocalStorage("classList_"+paramValue.cropId)){
				var tmpStr = genPlHtml(JSON.parse(storage.getLocalStorage("classList_"+paramValue.cropId)));
				$("#pl_div").html(tmpStr);
			}
			if(storage.getLocalStorage("subjectList_"+paramValue.cropId)){
				var tmpStr = genPrHtml(JSON.parse(storage.getLocalStorage("subjectList_"+paramValue.cropId)));
				$("#pr_div").html(tmpStr);
			}
				
			$.post(common.ctx+"/wap/per/lm16/grade",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genPlHtml(result);
							$("#pl_div").html(tmpStr);
							storage.deleteLocalStorage("classList_"+paramValue.cropId);
							storage.setLocalStorage("classList_"+paramValue.cropId,JSON.stringify(result));
						}
					}
				);
			
			$.post(common.ctx+"/wap/per/lm16/subject",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genPrHtml(result);
							$("#pr_div").html(tmpStr);
							storage.deleteLocalStorage("subjectList_"+paramValue.cropId);
							storage.setLocalStorage("subjectList_"+paramValue.cropId,JSON.stringify(result));
						}
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("classList_"+paramValue.cropId);
			storage.deleteLocalStorage("subjectList_"+paramValue.cropId);
		} 
		
	}
	
	//生成plhtml
	function genPlHtml(gradeList){
		var flag = true;
		var tmpStr = '';
		if(gradeList.items){
			tmpStr += '<li></li><li></li>';
			for(var i=0;i<gradeList.items.length;i++){
				if(gradeList.items[i].items){
					var classList = gradeList.items[i].items;
					for(var j=0;j<classList.length;j++){
						if(flag){
							tmpStr += '<li class="sel" data-code="'+classList[j].code+'" data-name="'+classList[j].name+'" >'+classList[j].name+'</li>';
							flag = false;
						}else{
							tmpStr += '<li data-code="'+classList[j].code+'" data-name="'+classList[j].name+'" >'+classList[j].name+'</li>';
						}
					}
				}
			}
			tmpStr += '<li></li><li></li>';
		}
		return tmpStr;
	}
	
	//生成prhtml
	function genPrHtml(subjectList){
		var flag = true;
		var tmpStr = '';
		if(subjectList.items){
			tmpStr += '<li></li><li></li>';
			for(var i=0;i<subjectList.items.length;i++){
				if(flag){
					tmpStr += '<li class="sel" data-code="'+subjectList.items[i].code+'" data-name="'+subjectList.items[i].name+'" >'+subjectList.items[i].name+'</li>';
					flag = false;
				}else{
					tmpStr += '<li data-code="'+subjectList.items[i].code+'" data-name="'+subjectList.items[i].name+'" >'+subjectList.items[i].name+'</li>';
				}
			}
			tmpStr += '<li></li><li></li>';
		}
		return tmpStr;
	}
	
	//删除班级科目信息
	function editClassSub(type,classCode,className,subjectCode,subjectName,obj){
		
		var funcType = $("#funcType").val();
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var jsonObj = '';
		if(type != 3){
			jsonObj = {type:type,classCode:classCode,subjectCode:subjectCode,name:paramValue.name,phone:paramValue.phone,targetUserId:paramValue.userId};
			$.post(common.ctx+"/wap/per/lm16/editTeach",
					{
						userId:userId,
						cropId:cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){
								storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
								//更新localStorage数据
								$(obj).parent().parent().hide();
								if(type == 1){   //删除操作
									if(funcType == 0){   //个人资料修改进入
										var teaInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
										var tcList = teaInfo.teaClassList;
										var newTcList = [];
										for(var i=0;i<tcList.length;i++){
											if(tcList[i].classCode == classCode && (subjectCode == 'null' || tcList[i].subjectCode == subjectCode)){
												
											}else{
												newTcList.push(tcList[i]);
											}
										}
										teaInfo.teaClassList = newTcList;
										storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(teaInfo));
										paramValue.teachList = newTcList;
										storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
									}else{  //教师修改资料进入
										var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
										var tcList = lmTeaDetail.teachList;
										var newTcList = [];
										for(var i=0;i<tcList.length;i++){
											if(tcList[i].classCode == classCode && (subjectCode == 'null' || tcList[i].subjectCode == subjectCode)){
												
											}else{
												newTcList.push(tcList[i]);
											}
										}
										lmTeaDetail.teachList = newTcList;
										storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
										paramValue.teachList = newTcList;
										storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
									}
								}else if(type == 2){  //添加操作
									var tmpStr = genClassSubHtml([{classCode:classCode,className:className,subjectCode:subjectCode,subjectName:subjectName}]);
									$("#noData").hide();
									$(".list_con").append(tmpStr);
									if(funcType == 0){  //个人资料进入
										var teaInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
										var tcList = teaInfo.teaClassList;
										tcList.push({classCode:classCode,className:className,subjectCode:subjectCode,subjectName:subjectName});
										teaInfo.teaClassList = tcList;
										storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(teaInfo));
										paramValue.teachList = tcList;
										storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
									}else{  //教师修改资料进入
										var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
										var tcList = lmTeaDetail.teachList;
										tcList.push({classCode:classCode,className:className,subjectCode:subjectCode,subjectName:subjectName});
										lmTeaDetail.teachList = tcList;
										storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
										paramValue.teachList = tcList;
										storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
									}
								}
							}else{
								tip.openAlert1("提示",result.resultMsg);
							}
						}
					}
				);
		}else{
			var oldClassCode = obj.getAttribute("data-class-code");
			var oldSubjectCode = obj.getAttribute("data-subject-code");
			jsonObj = {type:1,classCode:oldClassCode,subjectCode:oldSubjectCode,name:paramValue.name,phone:paramValue.phone,targetUserId:paramValue.userId};
			$.post(common.ctx+"/wap/per/lm16/editTeach",
					{
						userId:userId,
						cropId:cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){
								var tcList = paramValue.teachList;  
								var newTcList = [];
								for(var i=0;i<tcList.length;i++){
									if(tcList[i].classCode == oldClassCode && (oldSubjectCode == 'null' || tcList[i].subjectCode == oldSubjectCode)){
										
									}else{
										newTcList.push(tcList[i]);
									}
								}
								
								if(funcType == 0){   //个人资料修改
									var teaInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
									teaInfo.teaClassList = newTcList;
									storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(teaInfo));
									paramValue.teachList = newTcList;
									storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
								}else{  //教师修改资料
									var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
									lmTeaDetail.teachList = newTcList;
									storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
									paramValue.teachList = newTcList;
									storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
								}
								
								jsonObj = {type:2,classCode:classCode,subjectCode:subjectCode,name:paramValue.name,phone:paramValue.phone,targetUserId:paramValue.userId};
								$.post(common.ctx+"/wap/per/lm16/editTeach",
										{
											userId:userId,
											cropId:paramValue.cropId,
											json:JSON.stringify(jsonObj)
										},
										function(result){
											if(result.resultCode == '001'){
												if(funcType == 0){
													var teaInfo = JSON.parse(storage.getLocalStorage("teaInfo_"+paramValue.cropId));
													var tcList = teaInfo.teaClassList;
													tcList.push({classCode:classCode,className:className,subjectCode:subjectCode,subjectName:subjectName});
													teaInfo.teaClassList = tcList;
													storage.setLocalStorage("teaInfo_"+paramValue.cropId,JSON.stringify(teaInfo));
													paramValue.teachList = tcList;
													storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
												}else{
													var lmTeaDetail = JSON.parse(storage.getSessionStorage("lm_tea_detail"));
													var tcList = lmTeaDetail.teachList;
													tcList.push({classCode:classCode,className:className,subjectCode:subjectCode,subjectName:subjectName});
													lmTeaDetail.teachList = tcList;
													storage.setSessionStorage("lm_tea_detail",JSON.stringify(lmTeaDetail));
													paramValue.teachList = tcList;
													storage.setSessionStorage("paramValue",JSON.stringify(paramValue));
												}
												$(obj).find(".weui_cell_class").html(className);
												$(obj).find(".weui_cell_km").html(subjectName+'<a href="javascript:;" class="del_km cd-popup-trigger">删除</a>');
												obj.setAttribute("data-class-code",classCode);
												obj.setAttribute("data-subject-code",subjectCode);
											}
										}
									);
							}else{
								tip.openAlert1("提示","修改失败");
							}
						}
					}
				);
		}
	}
	
	//生成班级科目html
	function genClassSubHtml(classSubList){
		
		var tmpStr = '';
		if(classSubList){
			for(var i=0;i<classSubList.length;i++){
				if(classSubList[i].subjectName){
					tmpStr += '<div class="weui_cell line_b" data-class-code=\"'+classSubList[i].classCode+'\" data-subject-code=\"'+classSubList[i].subjectCode+'\" >'+
							  '<div class="weui_cell_class">'+classSubList[i].className+'</div>'+
							  '<div class="weui_cell_km">'+classSubList[i].subjectName+'<a href="javascript:;" class="del_km cd-popup-trigger">删除</a></div></div>';
				}
			}
		}
		return tmpStr;
		
	}
	
});
