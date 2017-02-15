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
	//var tip = require('widget/tip');
	//tip.openAlert1("提示","请输入新的名字",function callback(){});
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		loadLocalData();
	}
	
	function bindingEven(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		//修改姓名
		$(".date-wrap").on("click","#infoName",function(){
			document.location.href = common.ctx + '/wap/html/linkman/name_edit.html' + "?cropId=" + cropId+"&userId="+userId + "&type=2";
		});
		//修改手机号码
		$(".date-wrap").on("click","#infoPhone",function(){
			document.location.href = common.ctx + '/wap/html/linkman/phone_edit.html' + "?cropId=" + cropId+"&userId="+userId + "&type=2";
		});
		//修改关系
		$(".date-wrap").on("click",".infoRelation",function(){
			document.location.href = common.ctx + '/wap/html/linkman/relation_par_edit.html' + "?cropId=" + cropId + "&userId=" + userId + '&childIndex=' + this.getAttribute('data-childIndex');
		});
		//修改孩子姓名
		$(".date-wrap").on("click",".childName",function(){
			document.location.href = common.ctx + '/wap/html/linkman/name_edit.html' + "?cropId=" + cropId+"&userId="+userId + "&type=3&childIndex="+this.getAttribute('data-childIndex');
		});
		//修改孩子班级
		$(".date-wrap").on("click",".childClass",function(){
			document.location.href = common.ctx + '/wap/html/linkman/class_par_edit.html' + "?cropId=" + cropId+'&userId='+userId + '&childIndex='+this.getAttribute('data-childIndex');
		});
	}
	
	//加载本地数据
	function loadLocalData(){
		
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		try{
			if(storage.getLocalStorage("parInfo_"+cropId)){
				var tmpStr = genParInfoHtml(JSON.parse(storage.getLocalStorage("parInfo_"+cropId)));
				$(".date-wrap").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/personal/parInfo",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genParInfoHtml(result);
							$(".date-wrap").html(tmpStr);
							storage.deleteLocalStorage("parInfo_"+cropId);
							storage.setLocalStorage("parInfo_"+cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
			bindingEven();
		}catch(e){
			storage.deleteLocalStorage("parInfo_"+cropId);
			storage.deleteLocalStorage("parInfo_"+cropId);
		} 
		
	}

	//生成家长信息html 
	function genParInfoHtml(parInfo){
		
		var tmpStr = '<h6>个人资料</h6>'+
					 '<div class="list_con">'+
					 '<div class="weui_cell line_b">'+
					 '<div class="weui_cell_fl line_h">头像</div>'+
					 '<div class="weui_cell_head"><img src="'+parInfo.headIcon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></div>'+
					 '</div>'+
					 '<div id="infoName" class="weui_cell line_b">'+
					 '<div class="weui_cell_fl">我的姓名</div>'+
					 '<div class="weui_cell_fr">'+parInfo.name+'<span class="dy_more"></span></div>'+
					 '</div>'+
					 '<div id="infoPhone" class="weui_cell">'+
					 '<div class="weui_cell_fl">手机号码</div>'+
					 '<div class="weui_cell_fr">'+parInfo.phone+'<span class="dy_more"></span></div>'+
					 '</div></div>';
					 if(parInfo.childItems && parInfo.childItems.length>0){
						 for(var i=0;i<parInfo.childItems.length;i++){
							 tmpStr += '<h6>小孩'+(i+1)+'资料</h6>' +
							 		   '<div class="list_con">' +
							 		   '<div class="weui_cell line_b childName" data-childIndex='+i+'>' +
							 		   '<div class="weui_cell_fl">小孩姓名</div>' +
							 		   '<div class="weui_cell_fr">' + parInfo.childItems[i].name + '<span class="dy_more"></span></div>' +
							 		   '</div>' +
							 		   '<div class="weui_cell line_b childClass" data-childIndex='+i+'>' +
							 		   '<div class="weui_cell_fl">小孩所在班级</div>' +
							 		   '<div class="weui_cell_fr">' + parInfo.childItems[i].className + '<span class="dy_more"></span></div>' +
							 		   '</div>'+
							 		   '<div class="weui_cell infoRelation" data-childIndex='+i+'>'+
									   '<div class="weui_cell_fl">亲属关系</div>'+
									   '<div class="weui_cell_fr">'+parInfo.childItems[i].kinship.name+'<span class="dy_more"></span></div>'+
									   '</div></div>';
						 }
					 }
					 tmpStr += '<div class="b_ts">【温馨提示】为免错过老师的重要信息，请务必认真核对以上资料是否正确。如资料无误，请按左上角“返回”。<br /></div>';
			return tmpStr;
		
	}
	
});