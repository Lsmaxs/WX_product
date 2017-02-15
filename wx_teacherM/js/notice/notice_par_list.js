/**
 * author:yonson
 * data:2015-10-24
 */
define(function(require, exports, module) {
	
	var globalVal={
			pickUpFlag:false,
			page:1,
			page_flag:0
	};
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var wxApi = require('wxApi');
	var common = require('common');
	var toast = require('widget/toast');
	var storage = require('storage');
	var tip = require('widget/tip');
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	/**
	 * 初始化操作
	 */
	function init(){
		common.fclog('WXTZ');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//数据加载处理
		loadLocalData();
		dataPaging();
		
		$(".list_con").on("click","img",function(){
			var url = $(this).attr("src");
			imageShow(this,url);
			return false;
		});
		
		$(".list_con").on("click",".list_box",function(){
			var noticeNu = $(this).find(".noticeNu")[0].value;
			goNoticeDetail(noticeNu);
		});
		$(".list_con").on("click",".list_state",function(){
			var noticeDiv = $(this).parent();
			noticeDiv.find(".reply_list_par").slideToggle(300);
			noticeDiv.find(".reply_input_par").focus();
			return false;
		});
		$(".list_con").on("click",".reply_list_par",function(){
			return false;
		});
		$(".list_con").on("click",".reply_send",function(){
			var noticeDiv = $(this).parent().parent();
			var nu = noticeDiv.find(".noticeNu").val();
			var content = noticeDiv.find(".reply_input_par").val();
			saveComment(nu,content);
			return false;
		});
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLocalData(){
		
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		try{
			var tempValue = '';
			//从localStorage加载数据
			if(storage.getLocalStorage("noticelist_"+cropId)){
				tempValue = genNoticeListHtml(JSON.parse(storage.getLocalStorage("noticelist_"+cropId)));
				if(tempValue.length > 0){
					$("#no_data_page").hide();
					$(".list_con").html(tempValue);  //展示内容
				}else{
					$("#no_data_page").show();
				}
				toast.hideLoadToast();
			}
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/par/notice/list/1",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							storage.deleteLocalStorage("noticelist_"+cropId);
							storage.setLocalStorage("noticelist_"+cropId,JSON.stringify(result.items));
							var tempValue = genNoticeListHtml(result.items);
							
							if(tempValue.length > 0){
								$("#no_data_page").hide();
								$(".list_con").html(tempValue);  //展示内容
							}else{
								$("#no_data_page").show();
							}
							
							globalVal.pickUpFlag = true;  //允许下拉
							toast.hideLoadToast();
						}
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("noticelist_"+cropId);
		}
		
	}
	
	/**
	 * 生成通知列表html
	 */
	function genNoticeListHtml(noticeList){
		
		var noticeStr='';
		for(var i=0;i<noticeList.length;i++){
			var noticeObj = noticeList[i];
			noticeStr += '<div class="list_box">'+
						 '<input type="hidden" class="noticeNu" value="'+noticeObj.noticeUnique+'" />'+
		      			 '<div class="list_from">'+
		        		 '<div class="title fl">'+
    					 '<span class="face_pic">'+
    					 '<img src="'+noticeObj.icon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+
    					 '</span>'+noticeObj.senderName+'老师</div>'+
    					 '<div class="time fl tr"> '+noticeObj.createTime+'</div>'+
		      			 '</div>'+
		      			 '<div class="list_tit">'+noticeObj.content;
						 if(noticeObj.attachmentList){
							 var picClass = "";
							  if(noticeObj.attachmentList.length == 1){
								  picClass = "list_pic_y";
							  }else if(noticeObj.attachmentList.length == 4){
								  picClass = "list_pic_4";
							  }else{
								  picClass = "list_pic_more"
							  }
		      				 noticeStr += '<div class="'+picClass+'">';
		      				 if(noticeObj.attachmentList.length == 1){
		      					var attachment = noticeObj.attachmentList[0];
		      					noticeStr += '<a href="javascript:;" ><span><img onload="imgPreDeal(this);" src="'+attachment.attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
		      				 }else{
		      					for(var j=0;j<noticeObj.attachmentList.length;j++){
			      					var attachment = noticeObj.attachmentList[j];
			      					if(attachment.attachmentType == 1){
			      						noticeStr += '<a href="javascript:;" ><span><img onload="winFixImg(this);" src="'+attachment.attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
			      					}
			      				 } 
		      				 }
		      				 noticeStr += '</div>';
		      			 }
				  noticeStr += '</div><div class="list_state"><span class="mess_Num">留言</span></div>'+
				  '<div class="reply_list_par"><input class="reply_input_par" placeholder="回复老师："/> <a href="javascript:;" class="reply_send">发送</a></div>'+
				  '</div>';
		}
		return noticeStr;
		
	}

	/**
	 * 分页处理
	 */
	function dataPaging(){ 
		var range = 50;//距下边界长度/单位px  
		var totalheight = 0;   
		$(window).scroll(function(){ 
			if(globalVal.pickUpFlag){
				var srollPos = $(window).scrollTop();
				totalheight = parseFloat($(window).height()) + parseFloat(srollPos); 
				if(($(document).height()-range) <= totalheight) {
					if(globalVal.page_flag == 0){ 
						globalVal.page_flag = 1;
						var cropId = $("#cropId").val();
						var userId = $("#userId").val();
						$.post(common.ctx+"/wap/par/notice/list/"+(globalVal.page+1),
								{
									userId:userId,
									cropId:cropId
								},
								function(result){
									if(common.verifyToken(result,cropId)){
										if(result.items && result.items.length > 0){  //可能还有下一页
											globalVal.page = globalVal.page+1;
											genNoticeListHtml(result.items);
											globalVal.page_flag = 0;
										}else{  //没有下一页
											globalVal.page_flag = 2;
										}
									}
								}
							);
					}
				}
			}
		});  
		
	}
	
	/**
	 * 跳转至详细页面
	 * @param cropId
	 * @param userId
	 * @param nu
	 */
	function goNoticeDetail(nu){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+'/wap/html/notice/notice_par_detail.html?userId='+userId+'&nu='+nu+'&cropId='+cropId+"&ADTAG="+storage.getSessionStorage("adtag");
	}
	
	/**
	 * 图片预览
	 */
	function imageShow(obj,imageUrl){
		var imgArr = $(obj).parent().parent().parent().find("img");
		var urlArr = new Array();
		for(var i = 0;i<imgArr.length;i++){
			urlArr[i] = imgArr[i].src;
		}
		wxApi.previewImage(imageUrl,urlArr);
	}
	
	function saveComment(nu,content){
		if(!content || content.length==0){
			tip.openAlert1("提示","回复内容不能为空");
			return false;
		}else if(content.length>120){
			tip.openAlert1("提示","回复内容不能超过120个字");
			return false;
		}
		content = common.filterXss(content);
		toast.showLoadToast("提交中...");
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var json = {
				noticeUnique:nu,
				content:content
		};
		var jsonStr = JSON.stringify(json);
		$.post(common.ctx+"/wap/par/notice/comment/add",
				{
					json:jsonStr,
					cropId:cropId,
					userId:userId
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						toast.hideLoadToast();
						if(result.resultCode == "001"){
							document.location.href = common.ctx + '/wap/html/notice/notice_par_detail.html?cropId='+cropId+"&userId="+userId+"&nu="+nu+"&nocache=1&ADTAG="+storage.getSessionStorage("adtag");
						}else if(result.resultCode == "000"){
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				}
		);
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});