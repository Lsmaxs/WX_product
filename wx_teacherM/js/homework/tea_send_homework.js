/**
 * author:yonson
 * data:2015-10-24
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var wxApi = require('wxApi');
	var common = require('common');
	var tip = require('widget/tip');
	var storage = require('storage');
	var toast = require('widget/toast');
	
	init();

	function init(){
		common.fclog('WXZY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var classNameStr = decodeURI(common.getUrlParam("classNameStr"));
		var classIdStr = common.getUrlParam("classIdStr");
		
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#classNameStr").val(classNameStr);
		$("#classIdStr").val(classIdStr);
		
		wxApi.wxConfig(cropId,['chooseImage','previewImage','uploadImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		if(storage.getSessionStorage("sendhomework_"+cropId)){
			var jsonObj = JSON.parse(storage.getSessionStorage("sendhomework_"+cropId));
			$("#content").text(jsonObj.content);
			var subject = null;
			if(jsonObj.subject == '语文'){
				subject = $("#subject1");
			}else if(jsonObj.subject == '数学'){
				subject = $("#subject2");
			}else if(jsonObj.subject == '英语'){
				subject = $("#subject3");
			}else{
				subject = $("#subject4");
			}
			selectSubject(subject);
			
			wxApi.images = jsonObj.images;
			for(var i=0;i<wxApi.images.localId.length;i++){
				showSelectPic(wxApi.images.localId[i]);
			}
		}
		
		$(".inputstyle").val("班级："+classNameStr);
		//返回选择班级
		$("#goSelectClass").click(function(){
			goSelectClass();
		});
		//选择科目
		$("#subjectSelect").on("click",".op-check",function(){
			selectSubject(this);
		});
		//添加图片
		$("#addPic").click(function(){
			selectPic();
		});
		//点击发送
		$(".bt_green").click(function(){
			MtaH5.clickStat('jxhd_homework_tea_send');
			sendHomework();
		});
		
		$(".opert").on("click",".del_photo",function(){
			deleteImage(this);
		});
		
	}
	
	/**
	 * 留言框内容变更
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
	 * 提交作业
	 */
	var flag = 0;  //0未提交1提交中2已提交
	function sendHomework(){
		var content = $("#content").val();
		var subject = $("#subject").val();
		if(flag == 0){
			flag = 1;
			if(content == '输入你需要发送的内容' || content == ''){
				tip.openAlert1("提示","请输入作业内容");
				flag = 0;
				return;
			}
			if(subject == ''){
				tip.openAlert1("提示","请填写科目");
				flag = 0;
				return;
			}
			if(wxApi.images.localId.length > 0){  //需要上传图片情况
				wxApi.uploadImage(postHomework);	
			}else{  //不需要上传图片情况
				postHomework(null);
			}
		}else if(flag == 1){
			tip.openAlert1("提示","我们正在努力提交中...");
		}else if(flag == 2){
			tip.openAlert1("提示","作业已经提交了");
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
	 * 提交作业
	 * @param imageUrls
	 */
	function postHomework(imageUrls){
		//获取请求必要数据
		toast.showLoadToast("提交中...");
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var subject = $(".op-checked").find("input")[0].value;
		var content = $("#content").val();
		var classIdStr = $("#classIdStr").val();
		var classNameStr = $("#classNameStr").val();
		
		content = common.filterXss(content);
		
		var targets = new Array();
		var classIdArr = classIdStr.split(",");
		var classNameArr = classNameStr.split(",");
		for(var i=0;i<classIdArr.length;i++){
			targets.push({classId:classIdArr[i],className:classNameArr[i]});
		}
		//构造请求实体
		var json = {
				subject:subject,
				content:content,
				targets:targets,
				mediaIds:imageUrls
		};
		var jsonStr = JSON.stringify(json);
		$.post(common.ctx+"/wap/tea/homework/sendHW",
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
							tip.openAlert1("提示","作业已发送",goHomeworkList);
						}else{
							tip.openAlert1("提示",result.resultMsg);
							flag = 0;
						}
					}
				}
			);
	}
	
	/**
	 * 跳转至列表页面
	 */
	function goHomeworkList(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+"/wap/html/homework/homework_tea_list.html?cropId="+cropId+"&userId="+userId;
	}
	
	/**
	 * 选择科目
	 * @param obj
	 */
	function selectSubject(obj){
		var selectedObjList = $("#subjectSelect").find(".op-checked");
		for(var i=0;i<selectedObjList.length;i++){
			$(selectedObjList[i]).addClass('op-check').removeClass('op-checked');
		}
		$(obj).addClass('op-checked').removeClass('op-check');
	}
	
	/**
	 * 跳转至选择班级
	 */
	function goSelectClass(){
		
		var content = $("#content").val();
		var subject = $(".op-checked").find("input")[0].value;
		var json = {
			content:content,
			subject:subject,
			images:wxApi.images
		}	
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		storage.setSessionStorage("sendhomework_"+cropId,JSON.stringify(json));
		
		document.location.href = common.ctx+"/wap/html/homework/tea_send_classlist.html?userId="+userId+"&cropId="+cropId;
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
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});
