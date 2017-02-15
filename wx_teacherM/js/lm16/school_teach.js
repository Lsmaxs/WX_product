/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":""
 * 
 * }
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var storage = require('storage');
	var wxApi = require('wxApi');
	
	var paramValue;
	
	init();
	
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
		
		loadLocalData();
		
	}
	
	//加截本地数据
	function loadLocalData(){
		if(storage.getLocalStorage("classSelectTea_"+paramValue.cropId)){
			var classSelectTea = JSON.parse(storage.getLocalStorage("classSelectTea_"+paramValue.cropId));
			var tmpStr = genSchoolTeachHtml(classSelectTea.teachList);
			$(".list_con").html(tmpStr);
		}
	}
	
	//生成html页面
	function genSchoolTeachHtml(schoolTeachList){
		
		var tmpStr = '';
		if(schoolTeachList){
			for(var i=0;i<schoolTeachList.length;i++){
				tmpStr += '<div class="weui_cell line_b">'+
						  '<div class="weui_cell_class">'+schoolTeachList[i].className+'</div>'+
						  '<div class="weui_cell_km">'+schoolTeachList[i].teacherName+'</div>'+
						  '</div>';
			}
		}
		return tmpStr;
		
	}
	
	
});