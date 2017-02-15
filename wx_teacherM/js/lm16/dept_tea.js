/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"deptList":[{"code":"","name":""}]
 * }
 * 
 * 
 * 
 * 
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var storage = require('storage');
	var toast = require('widget/toast');
	var wxApi = require('wxApi');
	
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
		
		var myDeptStr = '';
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		if(paramValue.deptList){
			for(var i=0;i<paramValue.deptList.length;i++){
				myDeptStr += ","+paramValue.deptList[i].code;
			}
		}
		loadLocalData(myDeptStr);
		
		$(".list_con").on("click",".weui_cell",function(){
			alertTip();
		});
		
	}
	
	//加截本地数据
	function loadLocalData(myDeptStr){
		
		if(storage.getLocalStorage("teaDeptList_"+paramValue.cropId)){
			var tmpStr = genDeptHtml(JSON.parse(storage.getLocalStorage("teaDeptList_"+paramValue.cropId)).items,myDeptStr);
			$(".list_con").html(tmpStr);
			toast.hideLoadToast();
		}
			
		$.post(common.ctx+"/wap/per/lm16/dept",
				{
					userId:paramValue.userId,
					cropId:paramValue.cropId
				},
				function(result){
					if(result.resultCode == '001'){
						var tmpStr = genDeptHtml(result.items,myDeptStr);
						$(".list_con").html(tmpStr);
						storage.deleteLocalStorage("teaDeptList_"+paramValue.cropId);
						storage.setLocalStorage("teaDeptList_"+paramValue.cropId,JSON.stringify(result));
					}
					toast.hideLoadToast();
				}
			);
		
	}
	
	//生成部门html
	function genDeptHtml(deptList,myDeptStr){
		
		var tempStr = '';
		if(deptList && deptList.length > 0){
			for(var i=0;i<deptList.length;i++){
				tempStr += '<div class="weui_cell line_b">'+
						   '<div class="weui_cell_fl">'+deptList[i].name+'</div>';
						   if(myDeptStr.indexOf(","+deptList[i].code) >= 0){
							   tempStr += '<div class="weui_cell_fr"><a href="javascript:;" class="operate-btn"><span class="op-checked"></span></a></div>';
						   }else{
							   tempStr += '<div class="weui_cell_fr"><a href="javascript:;" class="operate-btn"></a></div>';
						   }
						   tempStr += '</div>';
			}
		}
		if(tempStr.length < 10){
			tempStr = '<div style="padding-top:50%" class="rj_tit"><p>学校暂未设置部门</p></div>';
		}
		return tempStr;
		
	}
	
	var flag = false;
	function alertTip(){
		if(!flag){
			$(".ts_addbm").fadeToggle(1000);
			setTimeout(function(){
				$(".ts_addbm").fadeToggle(1000);
				flag = false;
			},3000); 
			flag = true;
		}
	}
	
});