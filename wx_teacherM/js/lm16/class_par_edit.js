/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"classCode":"",
 * 	"stuUserId":"",
 * 	"className":""
 * 	"childIndex":""
 * 	""
 * }
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var storage = require('storage');
	var tip = require('widget/tip');
	var wxApi = require('wxApi');
	
	//var NEXT_SERVER_URL = common.ctx + '/wap/html/lm16/info_par.html';
	var NEXT_SERVER_URL = common.front_ctx + '/jxhd/html/selfinfo/info_par.html';
	var SERVER_TEA_OUFO_URL = common.ctx + '/wap/html/lm16/linkman_par_edit.html';
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
		
		loadLocalData();
		bindingEven();
	}
	
	function bindingEven(){
		//选择关系
		$(".date-wrap").on("click",".weui_cell",function(){
			var userId = $("#userId").val();
			var cropId = $("#cropId").val();
			var funcType = $("#funcType").val();
			var type = $("#type").val();
			var newClassCode = this.getAttribute("data-classcode");
			var newClassName = this.getAttribute("data-classname");
			var jsonObj = {ClassCode:newClassCode,OldClassCode:paramValue.classCode,StuUserId:paramValue.stuUserId};
			$.post(common.ctx+"/wap/per/lm16/saveStuInfo",
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
								var parInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
								parInfo.childItems[paramValue.childIndex].className = newClassName;
								parInfo.childItems[paramValue.childIndex].classCode = newClassCode;
								storage.setLocalStorage("parInfo_"+paramValue.cropId,JSON.stringify(parInfo));
								document.location.href = NEXT_SERVER_URL + "?cropId="+cropId+"&userId="+userId;
							}else{
								var lmParDetail = JSON.parse(storage.getSessionStorage("lm_par_detail"));
								lmParDetail.cid = newClassCode;
								lmParDetail.className = newClassName;
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
			if(storage.getLocalStorage("gradeList_"+paramValue.cropId)){
				var tmpStr = genClassListHtml(JSON.parse(storage.getLocalStorage("gradeList_"+paramValue.cropId)));
				$(".date-wrap").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/per/lm16/grade",
					{
						userId:paramValue.userId,
						cropId:paramValue.cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genClassListHtml(result);
							$(".date-wrap").html(tmpStr);
							storage.deleteLocalStorage("gradeList_"+paramValue.cropId);
							storage.setLocalStorage("gradeList_"+paramValue.cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
		}catch(e){
			storage.deleteLocalStorage("gradeList_"+paramValue.cropId);
		} 
		
	}

	//生成家长信息html 
	function genClassListHtml(gradeList){
		var tmpStr = '<div class="phone_h1">当前所在班级：'+paramValue.className+'</div>' +
					 '<h6>选择新班级</h6>' +
					 '<div class="list_con">';
		for(var i=0;i<gradeList.items.length;i++){
			var classList = gradeList.items[i].items;
			for(var j=0;j<classList.length;j++){
				tmpStr += '<div class="weui_cell line_b" data-classcode="'+classList[j].code+'" data-classname="'+classList[j].name+'" >' +
				  		  '<div class="weui_cell_fl">'+classList[j].name;
				if(paramValue.classCode == classList[j].code){
					tmpStr += '<a href="javascript:;" class="operate-btn"><span class="op-checked"></span></a>';
				}else{
					tmpStr += '<a href="javascript:;" class="operate-btn"><span class="op-check"></span></a>';
				}
				tmpStr += '</div></div>';
			}
		}
		tmpStr += '</div>';
		return tmpStr;
	}
	
});
