/**
 * author:yonson
 * data:2016-1-27
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var storage = require('storage');
	
	init();
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		loadLocalData();
		
	}
	
	//加截本地数据
	function loadLocalData(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		
		if(storage.getLocalStorage("classSelectTea_"+cropId)){
			var classSelectTea = JSON.parse(storage.getLocalStorage("classSelectTea_"+cropId));
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