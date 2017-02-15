/**
 * author:yonson
 * data:2015-10-24
 */
/**
 * paramValue = {
			"userId":"",
			"icon":"",
			"phone":"",
			"name":"",
			"stuId","",
			"stuName":"",
			"followed":1,
			"cid":"",
			"className":"",
			"tag":"",
			"targetUserType":1  //1目标为教师；2目标为家长
 * }
 */

/**
 * paramValue = {
		"userId":"",
		"icon":"",
		"phone":"",
		"name":"",
		"followed":1,
		"targetUserType":1  //1目标为教师；2目标为家长
 * }
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var wxApi = require('wxApi');
	var common = require('common');
	var tip = require('widget/tip');
	var toast = require('widget/toast');
	var storage = require('storage');
	var paramValue;
	
	init();
	
	function init(){
		common.fclog('WXLY');
		var userId =  common.getUrlParam("userId");
		var targetUuid = common.getUrlParam("targetUuid");
		var cropId = common.getUrlParam("cropId");
		var funcType = common.getUrlParam("funcType");
		var funUniq = common.getUrlParam("funUniq");
		var classCode = common.getUrlParam("classCode");
		$("#userId").val(userId);
		$("#targetUuid").val(targetUuid);
		$("#cropId").val(cropId);
		$("#funcType").val(funcType);
		$("#funUniq").val(funUniq);
		$("#classCode").val(classCode);
		
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		$("#parName").html(paramValue.name);
		if(paramValue.targetUserType == 1){  //目标为教师角色
			$("#parTag").hide();
		}else{  //目标为家长角色
			$("#parTag").html(paramValue.stuName+" "+paramValue.tag);
		}
		if(paramValue.followed == 1){  //已关注
			$("#parIcon").attr("src",paramValue.icon);
		}else{  //未关注
			$("#parIcon").attr("src","../../wap/images/user_pace_no.png");
		}
		
		wxApi.wxConfig(cropId,['chooseImage','previewImage','uploadImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		$(".opert a").click(function(){
			selectPic();
		});
		$(".bt_green").click(function(){
			MtaH5.clickStat('jxhd_words_tea_send');
			sendWords();
		});
		
		$(".opert").on("click",".del_photo",function(){
			deleteImage(this);
		});
	}

	/**
	 * 显示已选图片
	 */
	function showSelectPic(localPic){
		$(".opert").prepend("<a class=\"selectedImg\" href=\"javascript:void(0)\" ><img height=\"64px\" width=\"64px\" src=\""+localPic+"\" /><span class=\"del_photo\"></span></a>");
	}
	
	/**
	 * 选择图片
	 */
	function selectPic(){
		var selectNum = 9 - $(".opert").find(".selectedImg").length;
		if(selectNum <= 0){
			tip.openAlert1('提示','您已超过了可选图片数量上限');
			return;
		}else{
			wxApi.chooseImage(selectNum,showSelectPic);
		}
	}
	
	/**
	 * 向服务器提交数据
	 */
	function postWords(imageUrls){
		toast.showLoadToast("提交中...");
		var imageUrlStr = "";
		var content = $("#content").val();
		var classCode = $("#classCode").val();
		var targetUuid = $("#targetUuid").val();
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var funcType = $("#funcType").val();
		var funUniq = $("#funUniq").val();
		
		if(imageUrls){
			for(var i=0;i<imageUrls.length;i++){
				imageUrlStr += ","+imageUrls[i];
			}
			imageUrlStr = imageUrlStr.substring(1);
		}
		
		content = common.filterXss(content);
		$.post(common.ctx+"/wap/tea/words/sendWords",
				{
					content:content,
					classCode:classCode,
					tUserId:targetUuid,
					userId:userId,
					cropId:cropId,
					funcType:funcType,
					funUniq:funUniq,
					imageUrls:imageUrlStr,
					targetUserType:paramValue.targetUserType
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						toast.hideLoadToast();
						if(result.resultCode == "001"){
							flag = 2;
							tip.openAlert1("提示","已留言成功",goWordsList);
						}else{
							tip.openAlert1("提示",result.resultMsg);
							flag = 0;
						}
					}
				}
			);
	}
	
	/**
	 * 跳转至留言列表
	 */
	function goWordsList(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+"/wap/html/words/words_tea_list.html?cropId="+cropId+"&userId="+userId+"&type=2";
	}
	
	/**
	 * 提交留言
	 */
	var flag = 0;  //0未提交1提交中2已提交
	function sendWords(){
		var content = $("#content").val();
		if(flag == 0){
			flag = 1;
			if(content == ''){
				tip.openAlert1("提示","请输入留言内容");
				flag = 0;
				return;
			}
			if(wxApi.images.localId.length > 0){  //需要上传图片情况
				wxApi.uploadImage(postWords);	
			}else{  //不需要上传图片情况
				postWords(null);
			}
		}else if(flag == 1){
			tip.openAlert1("提示","我们正在努力提交中...");
		}else if(flag == 2){
			tip.openAlert1("提示","您的留言已经提交了");
		}
	}
	
	/**
	 * 留言框内容变更
	 * @param flag
	 */
	function contentText(flag){
		var value = $("#content").val();
		if(flag == 1){
			if(value == '输入你需要发送的内容'){
				$("#content").text('');
			}
		}else{
			if(value == ''){
				$("#content").text('输入你需要发送的内容');
			}
		}
	}
	
	/**
	 * 删除选择图片
	 * @param obj
	 */
	function deleteImage(obj){
		var imageLocalId = $(obj).parent().find("img").attr("src");
		$(obj).parent().fadeOut(300, function() {
			$(obj).parent().remove();
	    });
		wxApi.images.localId.splice($.inArray(imageLocalId,wxApi.images.localId),1);
	}

});