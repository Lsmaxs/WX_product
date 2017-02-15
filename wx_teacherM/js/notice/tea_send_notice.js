/**
 * author:yonson
 * data:2015-10-27
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
	
	init();

	/**
	 * 初始化操作
	 */
	function init(){
		common.fclog('WXTZ');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var schoolCode = common.getUrlParam("schoolCode");
		var classNameStr = common.getUrlParam("classNameStr");
		var classIdStr = common.getUrlParam("classIdStr");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#classNameStr").val(classNameStr);
		$("#classIdStr").val(classIdStr);
		$("#schoolCode").val(schoolCode);
		
		wxApi.wxConfig(cropId,['chooseImage','previewImage','uploadImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		if(storage.getSessionStorage("sendnotice_"+cropId)){
			var jsonObj = JSON.parse(storage.getSessionStorage("sendnotice_"+cropId));
			$("#content").text(jsonObj.content);
			wxApi.images = jsonObj.images;
			for(var i=0;i<wxApi.images.localId.length;i++){
				showSelectPic(wxApi.images.localId[i]);
			}
		}
		
		//添加图片
		$("#addPic").click(function(){
			selectPic();
		});
		//点击发送
		$(".bt_green").click(function(){
			MtaH5.clickStat('jxhd_notice_tea_send');
			sendNotice();
		});
		
		$("#targetStr").click(function(){
			goTargetSelect();
		});
		
		$(".opert").on("click",".del_photo",function(){
			deleteImage(this);
		});
		
	}
	
	/**
	 * 通知框内容变更
	 */
	function contentText(flag){
		var value = $("#content").text();
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
	 * 提交通知
	 */
	var flag = 0;  //0未提交1提交中2已提交
	function sendNotice(){
		var content = $("#content").val();
		if(flag == 0){
			flag = 1;
			if(content == '输入你需要发送的内容' || content == ''){
				tip.openAlert1("提示","请输入通知内容");
				flag = 0;
				return;
			}
			if(content.length >= 500){
				tip.openAlert1("提示","通知内容不能超过500个文字");
				flag = 0;
				return;
			}
			if(wxApi.images.localId.length > 0){  //需要上传图片情况
				wxApi.uploadImage(postNotice);	
			}else{  //不需要上传图片情况
				postNotice(null);
			}
		}else if(flag == 1){
			tip.openAlert1("提示","我们正在努力提交中...");
		}else if(flag == 2){
			tip.openAlert1("提示","通知已经提交了");
		}
	}
	
	/**
	 * 显示已选图片
	 */
	function showSelectPic(localPic){
		$(".opert").prepend("<a class=\"selectedImg\" href=\"javascript:void(0)\" ><img height=\"64px\" width=\"64px\" src=\""+localPic+"\" /><span class=\"del_photo\"></span></a>");
	}
	//选择图片
	function selectPic(){
		var selectNum = 9 - $(".opert").find(".selectedImg").length;
		if(selectNum <= 0){
			tip.openAlert1("提示","您已超过了可选图片数量上限");
			return;
		}else{
			wxApi.chooseImage(selectNum,showSelectPic);
		}
	}
	
	/**
	 * 提交通知
	 * @param imageUrls
	 */
	function postNotice(imageUrls){
		//获取请求必要数据
		toast.showLoadToast("提交中...");
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var content = $("#content").val();
		var classIdStr = storage.getSessionStorage('targetNum');
		var classNameStr = storage.getSessionStorage('targetNum');
		
		var targets =JSON.parse(sessionStorage.getItem('sendTarget'));
		
		content = common.filterXss(content);
		
		//构造请求实体
		var json = {
				content:content,
				sendTarget:targets,
				mediaIds:imageUrls
		};
		var jsonStr = JSON.stringify(json);
		
		$.post(common.ctx+"/wap/tea/notice/send",
				{
					json:jsonStr,
					cropId:cropId,
					userId:userId
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						toast.hideLoadToast();
						if(result.resultCode == "001"){
							flag = 2;
							tip.openAlert1("提示","通知已发送",goNoticeList);
						}else if(result.resultCode == "000"){
							tip.openAlert1("提示",result.resultMsg);
							flag = 0;
						}
					}
				}
			);
	}
	
	/**
	 * 跳转至通知列表
	 */
	function goNoticeList(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var schoolCode = $("#schoolCode").val();
		document.location.href = common.ctx+"/wap/html/notice/notice_tea_list.html?cropId="+cropId+"&userId="+userId+"&schoolCode="+schoolCode+"&ADTAG="+storage.getSessionStorage("adtag");
	}
	
	/**
	 * 跳转至人员选择页面
	 */
	function goTargetSelect(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var schoolCode = $("#schoolCode").val();
		var content = $("#content").val();
		var json = {
				content:content,
				images:wxApi.images
			}
		storage.setSessionStorage("sendnotice_"+cropId,JSON.stringify(json));
		document.location.href = common.ctx + '/wap/html/notice/tea_send_tagetlist.html?cropId='+cropId+"&userId="+userId+"&schoolCode="+schoolCode+"&ADTAG="+storage.getSessionStorage("adtag");
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
	
	$('#targetStr').val('  已选择发送'+storage.getSessionStorage('targetNum')+'人');
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});