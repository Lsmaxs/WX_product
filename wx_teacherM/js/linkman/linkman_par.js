/**
 * author:yonson
 * data:2015-10-24
 */
define(function(require, exports, module) {

	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var wxApi = require('wxApi');
	var common = require('common');
	var toast = require('widget/toast');
	var storage = require('storage');
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	/**
	 * 初始化工作
	 */
	function init(){
		common.fclog('WXLY');
		//初始化操作
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		//wx-js验证
		wxApi.wxConfig(cropId,[],window.location.href);   //js-sdk验证
		//加截数据
		loadLocalData();
		
		//事件绑定
		$("#searchLinkman").change(function(){
			sLinkmanOnBlur();
		});
		$("body").on("click",".cls-sendword",function(){
			MtaH5.clickStat('jxhd_linkman_par_words');
			var classCode = this.getAttribute("data-classCode");
			var userId = this.getAttribute("data-userId");
			var userName = this.getAttribute("data-userName");
			sendWords(classCode,userId,userName);
		});
		$("#teaLinkman,#classLinkman").on("click",".tit",function(){
			slideSelect(this);
		});
		
	}

	/**
	 * 加截本地数据
	 */
	function loadLocalData(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		try{
			if(storage.getLocalStorage("teaLinkman_"+cropId)){
				var tmpStr = genTeaLinkman(JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId)));
				$("#teaLinkman").html(tmpStr);
				toast.hideLoadToast();
			}
			//加截班级数据
			if(storage.getLocalStorage("classLinkman_"+cropId)){
				var tmpStr = genParLinkman(JSON.parse(storage.getLocalStorage("classLinkman_"+cropId)));
				$("#classLinkman").html(tmpStr);
				toast.hideLoadToast();
			}
			
			$.post(common.ctx+"/wap/par/linkman/tea/list",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						var tmpStr = genTeaLinkman(result);
						$("#teaLinkman").html(tmpStr);
						toast.hideLoadToast();
						storage.deleteLocalStorage("teaLinkman_"+cropId);
						storage.setLocalStorage("teaLinkman_"+cropId,JSON.stringify(result));
					}
				);
			$.post(common.ctx+"/wap/par/linkman/par/list",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						var tmpStr = genParLinkman(result);
						$("#classLinkman").html(tmpStr);
						toast.hideLoadToast();	
						storage.deleteLocalStorage("classLinkman_"+cropId);
						storage.setLocalStorage("classLinkman_"+cropId,JSON.stringify(result));
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("teaLinkman_"+cropId);
			storage.deleteLocalStorage("classLinkman_"+cropId);
		} 
	}
	
	/**
	 * 生成教师通信录数据
	 * @param teaLinkmanList
	 * @returns {String}
	 */
	function genTeaLinkman(teaLinkmanList){
		var tmpStr = '<h2>教师通讯录</h2>'+
			         '<div class="address_list"><div class="tit" >我的老师<span class="dy_some">&nbsp;</span></div><ul>';
		for(var i=0;i<teaLinkmanList.length;i++){
			if(i == teaLinkmanList.length-1){
				tmpStr += '<li class="none_line line_h42" >';
			}else{
				tmpStr += '<li class="line_h42" >';
			}
//			if(!teaLinkmanList[i].icon || teaLinkmanList[i].icon == '' || teaLinkmanList[i].icon == 'null'){
//				tmpStr += '<span class="follow_ico"></span>';
//			}
			if(teaLinkmanList[i].isFocuson == 1){  //已关注
				tmpStr += '<img src="'+teaLinkmanList[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'"  />';
			}else{  //未关注
				tmpStr += '<img src="'+teaLinkmanList[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace_no_s.png\'"  />';
			}
			tmpStr += '<b>'+teaLinkmanList[i].name+'</b><br />'+
			 		  '<span class="address_cont">'+
			 		  '<a class="cls-sendword" href="javascript:;" data-classCode="'+teaLinkmanList[i].classCode+'" data-userId="'+teaLinkmanList[i].uuid+'" data-userName="'+teaLinkmanList[i].name+'" ><img src="../../images/ico_xx.png" /></a>'+
			 		  //'<a href="tel:'+teaLinkmanList[i].phone+'"><img src="'+ctx+'/static/wap/images/ico_phone.png" /></a>'+
			 		  '</span></li>';
		}
		tmpStr += '</ul></div>';
		return tmpStr;
	}
	
	function slideSelect(obj){
		$($(obj).find("span")[0]).toggleClass("dy_more").toggleClass("dy_some");
		$($(obj).parent().find("ul")[0]).slideToggle(300);
	}
	
	/**
	 * 生成家长通信录数据
	 * @param classLinkmanList
	 * @returns {String}
	 */
	function genParLinkman(classLinkmanList){
		
		var tmpStr = '';
		if(classLinkmanList.length > 0){
			tmpStr += '<h2>家长通讯录</h2>';
			for(var i=0;i<classLinkmanList.length;i++){
				tmpStr += '<div class="address_list"><div class="tit" >'+classLinkmanList[i].className;
				if(classLinkmanList[i].stuNum && classLinkmanList[i].parNum){
					tmpStr += '<b>（学生<em>'+classLinkmanList[i].stuNum+'</em> / 家长<em>'+classLinkmanList[i].parNum+'</em>）</b>';
				}
				tmpStr += '<span class="dy_some">&nbsp;</span></div><ul>';
				var linkmanParList = classLinkmanList[i].linkmanParList;
				for(var j=0;j<linkmanParList.length;j++){
					if(j == linkmanParList.length - 1){
						tmpStr += '<li class="none_line line_h42" >';
					}else{
						tmpStr += '<li class="line_h42" >';
					}
//					if(!linkmanParList[j].icon || linkmanParList[j].icon == '' || linkmanParList[j].icon == 'null'){
//						tmpStr += '<span class="follow_ico"></span>';
//					}
					if(linkmanParList[j].isFocuson == 1){  //已关注
						tmpStr += '<img src="'+linkmanParList[j].icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'"  />';
					}else{  //未关注
						tmpStr += '<img src="'+linkmanParList[j].icon+'" onerror="javascript:this.src=\'../../images/user_pace_no_s.png\'"  />';
					}
					tmpStr += '<b>'+linkmanParList[j].stuName+'家长'+'</b> <em>'+linkmanParList[j].name+'</em><br />'+
		  			  		  '<span class="address_cont">'+
		  			  		  // '<a href="javascript:;" onclick="sendWords(\''+classLinkmanList[i].classCode+'\',\''+linkmanParList[j].uuid+'\')" ><img src="'+ctx+'/static/wap/images/ico_xx.png" /></a>'+
		  			  		  // '<a href="tel:'+linkmanParList[j].phone+'"><img src="'+ctx+'/static/wap/images/ico_phone.png" /></a>'+
		  			  		  '</span></li>';
				}		  
				tmpStr += '</ul></div>';
			}
		}
		return tmpStr;
		
	}
	
	/**
	 * 查询输入失去焦点
	 */
	function sLinkmanOnBlur(){
		var queryParam = $.trim($("#searchLinkman").val());
		var cropId = $("#cropId").val();
		if(queryParam){
			var teaArr = new Array();
			var parArr = new Array();
			var classArr = new Array();
			var teaObjList = JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId));
			var classObjList = JSON.parse(storage.getLocalStorage("classLinkman_"+cropId));
			for(var i=0;i<teaObjList.length;i++){
				if(teaObjList[i].name && teaObjList[i].name.indexOf(queryParam) >= 0){
					teaArr.push(teaObjList[i]);
				}
			}
			for(var i=0;i<classObjList.length;i++){
				var linkmanParList = classObjList[i].linkmanParList;
				for(var j=0;j<linkmanParList.length;j++){
					if(linkmanParList[j].name && linkmanParList[j].name.indexOf(queryParam) >= 0){
						parArr.push(linkmanParList[j]);
					}
				}
			}
			var tmpStr = '';
			if(teaArr.length > 0){
				tmpStr += genTeaLinkman(teaArr);
			}
			if(parArr.length > 0){
				var clazzInfo = {className:"家长",linkmanParList:parArr};
				classArr.push(clazzInfo);
				tmpStr += genParLinkman(classArr);
			}
			$(".address_box").html(tmpStr);
		}else{   //为空查询全部内容
			var teaStr = '<div id="teaLinkman">' + genTeaLinkman(JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId))) + '</div>';
			var parStr = '<div id="classLinkman">' + genParLinkman(JSON.parse(storage.getLocalStorage("classLinkman_"+cropId))) + '</div>';
			$(".address_box").html(teaStr+parStr);
			$("#searchLinkman").val('');
		}
		
	}
	
	/**
	 * 向教师发送留言信息
	 */
	function sendWords(classCode,targetUuid,targetName){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+"/wap/html/words/words_par_edit.html?classCode="+classCode+"&targetUuid="+targetUuid+"&targetName="+encodeURI(targetName)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
	}
	
	module.exports = qt_model;

});