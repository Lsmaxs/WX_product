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
	var tip = require('widget/tip');
	var NEXT_SERVER_URL = common.ctx + '/wap/html/linkman/info_par.html';
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var childIndex = common.getUrlParam("childIndex");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#childIndex").val(childIndex);
		loadLocalData();
		bindingEven();
	}
	
	function bindingEven(){
		//选择关系
		$(".date-wrap").on("click",".weui_cell",function(){
			var userId = $("#userId").val();
			var cropId = $("#cropId").val();
			var childIndex = parseInt($("#childIndex").val());
			var gradeList = JSON.parse(storage.getLocalStorage("gradeList_"+cropId));
			var parInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId));
			var childInfo = parInfo.childItems[childIndex];
			var newClassCode = this.getAttribute("data-classcode");
			var newClassName = this.getAttribute("data-classname");
			var jsonObj = {ClassCode:newClassCode,OldClassCode:childInfo.classCode,StuUserId:childInfo.userId};
			$.post(common.ctx+"/wap/personal/saveStuInfo",
					{
						userId:userId,
						cropId:cropId,
						json:JSON.stringify(jsonObj)
					},
					function(result){
						if(result.resultCode == '001'){
							//更新localStorage数据							
							parInfo.childItems[childIndex].className = newClassName;
							parInfo.childItems[childIndex].classCode = newClassCode;
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
		var childIndex = parseInt($("#childIndex").val());
		var childInfo = JSON.parse(storage.getLocalStorage("parInfo_"+cropId)).childItems[childIndex];
		try{
			if(storage.getLocalStorage("gradeList_"+cropId)){
				var tmpStr = genClassListHtml(JSON.parse(storage.getLocalStorage("gradeList_"+cropId)),childInfo);
				$(".date-wrap").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/personal/grade",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genClassListHtml(result,childInfo);
							$(".date-wrap").html(tmpStr);
							storage.deleteLocalStorage("gradeList_"+cropId);
							storage.setLocalStorage("gradeList_"+cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
		}catch(e){
			storage.deleteLocalStorage("gradeList_"+cropId);
		} 
		
	}

	//生成家长信息html 
	function genClassListHtml(gradeList,childInfo){
		var tmpStr = '<div class="phone_h1">当前所在班级：'+childInfo.className+'</div>' +
					 '<h6>选择新班级</h6>' +
					 '<div class="list_con">';
		for(var i=0;i<gradeList.items.length;i++){
			var classList = gradeList.items[i].items;
			for(var j=0;j<classList.length;j++){
				tmpStr += '<div class="weui_cell line_b" data-classcode="'+classList[j].code+'" data-classname="'+classList[j].name+'" >' +
				  		  '<div class="weui_cell_fl">'+classList[j].name;
				if(childInfo.classCode == classList[j].code){
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
