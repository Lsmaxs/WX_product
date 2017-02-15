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
	var NEXT_SERVER_URL = common.ctx + '/wap/html/linkman/info_par.html';
	var tip = require('widget/tip');
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var childIndex = common.getUrlParam('childIndex');
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#childIndex").val(childIndex);
		
		loadLocalData();
	}
	
	function bindingEven(){
		//选择关系
		$(".date-wrap").on("click",".weui_cell",function(){
			var cropId = $("#cropId").val();
			var userId = $("#userId").val();
			var parRelation = JSON.parse(storage.getLocalStorage("parRelation_"+cropId));
			var parInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
			var index = parseInt(this.getAttribute("data-index"));
			var childIndex = $("#childIndex").val();
			
			var stuUuid = parInfo.childItems[childIndex].userId;
			
			$.post(common.ctx + '/wap/personal/saveParInfo',
					{
						userId:userId,
						cropId:cropId,
						json:JSON.stringify({stuUuid:stuUuid,relationCode:parRelation.items[index].code,relationName:parRelation.items[index].name,oldPhone:parInfo.phone,oldName:parInfo.name})
					},
					function(result){
						if(result.resultCode == '001'){
							parInfo.kinship = parRelation.items[index];
							storage.setLocalStorage("parInfo_"+cropId,JSON.stringify(parInfo));
							document.location.href = NEXT_SERVER_URL + "?cropId="+cropId+"&userId="+userId;
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
			);
		});
	}
	
	//加载本地数据
	function loadLocalData(){
		
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		try{
			if(storage.getLocalStorage("parRelation")){
				var tmpStr = genRelationListHtml(JSON.parse(storage.getLocalStorage("parRelation_"+cropId)));
				$(".date-wrap").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/personal/relation",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genRelationListHtml(result);
							$(".date-wrap").html(tmpStr);
							storage.deleteLocalStorage("parRelation");
							storage.setLocalStorage("parRelation_"+cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
			bindingEven();
		}catch(e){
			storage.deleteLocalStorage("parRelation");
		} 
		
	}

	//生成家长信息html 
	function genRelationListHtml(relationList){
		var cropId = $("#cropId").val();
		var childIndex = $("#childIndex").val();
		var parInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
		var tmpStr = '<div class="list_con">';
		var spanClass = "";
		for(var i=0;i<relationList.items.length;i++){
			if(parInfo.childItems[childIndex] && parInfo.childItems[childIndex].kinship.code==relationList.items[i].code){
				spanClass = "op-checked";
			}else{
				spanClass = "op-check";
			}
			tmpStr += '<div data-index="'+i+'" class="weui_cell line_b">' +
					  '<div class="weui_cell_fl">'+relationList.items[i].name+'</div>' +
					  '<div class="weui_cell_fr"><a href="javascript:" class="operate-btn"><span class='+spanClass+'></span></a></div>' +
					  '</div>';
		}
		tmpStr += '</div>';
		return tmpStr;
	}
	
});
