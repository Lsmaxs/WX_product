/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"phone":"",
 * 	"name":"",
 * 	"stuUserId":"",
 * 	"tag":""
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
	
//	var NEXT_SERVER_URL = common.ctx + '/wap/html/lm16/info_par.html';
	var NEXT_SERVER_URL = common.front_ctx + '/jxhd/html/selfinfo/info_par.html';
	var SERVER_TEA_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_par_edit.html';
	var tip = require('widget/tip');
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
		
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#funcType").val(funcType);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//获取参数数据
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		
		loadLocalData();
	}
	
	function bindingEven(){
		//选择关系
		$(".date-wrap").on("click",".weui_cell",function(){
			var cropId = $("#cropId").val();
			var userId = $("#userId").val();
			var funcType = $("#funcType").val();
			var type = $("#type").val();
			var parRelation = JSON.parse(storage.getLocalStorage("parRelation_"+paramValue.cropId));
			var index = parseInt(this.getAttribute("data-index"));
			var parRelationObj = parRelation.items[index];
			$.post(common.ctx + '/wap/per/lm16/saveParInfo',
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId,
						json:JSON.stringify({stuUuid:paramValue.stuUserId,relationCode:parRelationObj.code,relationName:parRelationObj.name,oldPhone:paramValue.phone,oldName:paramValue.name})
					},
					function(result){
						if(result.resultCode == '001'){
							storage.setLocalStorage("isLinkmanRefresh_"+cropId,"1");
							if(funcType == 0){
								var parInfo = JSON.parse(storage.getLocalStorage("parInfo_"+paramValue.cropId));
								parInfo.kinship = parRelationObj;
								storage.setLocalStorage("parInfo_"+paramValue.cropId,JSON.stringify(parInfo));
								document.location.href = NEXT_SERVER_URL + "?cropId="+cropId+"&userId="+userId;
							}else if(funcType == 1){
								var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
								lmParDetail.tag = parRelationObj.name;
								storage.setSessionStorage("lm_par_detail",JSON.stringify(lmParDetail));
								document.location.href = SERVER_TEA_OUFO_URL + "?cropId="+cropId+"&userId="+userId+"&type="+type;
							}
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
			);
		});
	}
	
	//加载本地数据
	function loadLocalData(){
		
		try{
			if(storage.getLocalStorage("parRelation")){
				var tmpStr = genRelationListHtml(JSON.parse(storage.getLocalStorage("parRelation_"+paramValue.cropId)));
				$(".date-wrap").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/per/lm16/relation",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genRelationListHtml(result);
							$(".date-wrap").html(tmpStr);
							storage.deleteLocalStorage("parRelation_"+paramValue.cropId);
							storage.setLocalStorage("parRelation_"+paramValue.cropId,JSON.stringify(result));
							bindingEven();
						}
						toast.hideLoadToast();
					}
				);
		}catch(e){
			storage.deleteLocalStorage("parRelation");
		} 
		
	}

	//生成家长信息html 
	function genRelationListHtml(relationList){
		var tmpStr = '<div class="list_con">';
		var spanClass = "";
		for(var i=0;i<relationList.items.length;i++){
			if(paramValue.tag==relationList.items[i].name){
				paramValue.relation = {code:relationList.items[i].code,name:relationList.items[i].name};
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
