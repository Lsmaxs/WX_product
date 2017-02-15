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
	var toast = require('widget/toast');
	var tip = require('widget/tip');
	var storage = require('storage');
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	function init(){
		
		common.fclog('WXTZ');
		var userId =  common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var nu = common.getUrlParam("nu");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#nu").val(nu);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadLocalData();
		
		$("#htmlbody").on("click",".notice-con img",function(){
			var imgUrl = this.src;
			imageShow(imgUrl);
		});
		
		$("#htmlbody").on("click",".reply_send",function(){
			var content = $(this).parent("div").find(".reply_input_par").val();
			saveComment($(".mess_box"),content);
			return false;
		});
		$("#htmlbody").on("click",".reply_input",function(){
			return false;
		});
	}
	
	/**
	 * 加载本地数据
	 */
	function loadLocalData(){
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		try{
			var tempValue = '';
			//从localStorage加载数据
			var nocache = common.getUrlParam("nocache");
			if(!nocache || nocache!=1){
				if(storage.getLocalStorage("noticedetail_"+nu)){
					var data = JSON.parse(storage.getLocalStorage("noticedetail_"+nu));
					checkExists(data);
					tempValue = genNoticeDetail(data);
					$("#htmlbody").html(tempValue);  //展示内容
					toast.hideLoadToast();
				}
			}
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/par/notice/detailGet",
					{
						userId:userId,
						cropId:cropId,
						nu:nu
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							checkExists(result);
							storage.deleteLocalStorage("noticedetail_"+nu);
							storage.setLocalStorage("noticedetail_"+nu,JSON.stringify(result));
							var tempValue = genNoticeDetail(result);
							$("#htmlbody").html(tempValue);  //展示内容
							focusComm($("#htmlbody"));
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("noticedetail_"+nu);
		}
		
	}
	
	function checkExists(data){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		if(!data || data.resultCode!='0001'){
			storage.deleteLocalStorage("noticedetail_"+nu);
			document.location.href = common.ctx + '/wap/html/notice/notice_404.html?cropId='+cropId+"&userId="+userId+'&nu='+nu;
		}
	}
	
	/**
	 * 生成数据html页面
	 */
	function genNoticeDetail(noticeObj){
		$("#senderName").val(noticeObj.senderName);
		$("#senderUuid").val(noticeObj.senderUUid);
		$("#classCode").val(noticeObj.classCode);
		var tmpStr = '<div class="notice-wrap">'+
					 '<div class="from">'+
					 '<div class="title fl">'+
					 '<span class="face_pic">'+
					 '<img src="'+noticeObj.icon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+
					 '</span>'+noticeObj.senderName+'老师</div>'+
					 '<div class="time fl tr">'+noticeObj.createTime+'</div></div>'+
					 '<div class="notice-con">'+noticeObj.content;
		
					 if(noticeObj.attachmentList){
						 var picClass = "";
						 if(noticeObj.attachmentList.length == 1){
							  picClass = "list_pic_y";
						 }else if(noticeObj.attachmentList.length == 4){
							  picClass = "list_pic_4";
						 }else{
							  picClass = "list_pic_more"
						 }
						 tmpStr += '<div class="'+picClass+'">';
						 if(noticeObj.attachmentList.length == 1){
							 tmpStr += '<a href="javascript:;" ><span><img src="'+noticeObj.attachmentList[0].attachmentUrl+'" onload="imgPreDeal(this);" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
						 }else{
							 for(var i=0;i<noticeObj.attachmentList.length;i++){
	    						 if(noticeObj.attachmentList[i].attachmentType == 1){
	    							 tmpStr += '<a href="javascript:;" ><span><img src="'+noticeObj.attachmentList[i].attachmentUrl+'" onload="winFixImg(this);" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
	    						 }
	    					 }
						 }
	    				 tmpStr += '</div>';
					 }
    				 tmpStr += '</div><div class="list_mess" style="background:#fff;"></div></div>';
    				if(noticeObj.userTabList && noticeObj.userTabList.length>0){
						tmpStr += '<div class="notice-box" >';
					}else{
						tmpStr += '<div class="notice-box" style="display:none;">';
					}
					tmpStr += '<div class="list_mess" style="background:#fff;">'+
					genNoticeCommList(noticeObj.userTabList)+
					'</div></div>';
    				tmpStr += '<div class="reply_box_par">'+
    					'<input class="reply_input_par" placeholder="给老师留言：" />'+
    					'<a href="javascript:;" data-replyid="'+noticeObj.sendUserId+'" class="reply_send">发送</a></div>';
    	return tmpStr;
	}
	

	/**
	 * 图片预览
	 */
	function imageShow(imageUrl){
		var imgArr = $(".notice-con").find("img");
		var urlArr = new Array();
		for(var i = 0;i<imgArr.length;i++){
			urlArr[i] = imgArr[i].src;
		}
		wxApi.previewImage(imageUrl,urlArr);
	}
	
	/**
	 * 跳转至家长留言发送
	 */
	function pathToWords(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var classCode = $("#classCode").val();
		var senderUuid = $("#senderUuid").val();
		var senderName = $("#senderName").val();
		var nu = $("#nu").val();
		
		var noticeObj = JSON.parse(storage.getLocalStorage("noticedetail_"+nu));
		var teaObj = {
				userId:noticeObj.senderUUid,
				icon:noticeObj.icon,
				phone:"",
				name:noticeObj.senderName,
				followed:1,
				targetUserType:1
			}
		storage.setSessionStorage("paramValue",JSON.stringify(teaObj));
		document.location.href = common.ctx+"/wap/html/words/words_par_edit.html?classCode="+classCode+"&targetUuid="+senderUuid+"&targetName="+senderName+"&cropId="+cropId+"&userId="+userId+"&funcType=1&funUniq="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
	}
	
	function saveComment($el,content,replyId){
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
				noticeUnique:$("#nu").val(),
				content:content
		};
		if(replyId){
			json.replyUuid=replyId;
		}
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
							$(".notice-box").show();
							$(".reply_input_par").val("");
							if($el.find(".mess_head").length==0){
								$el.append('<div class="clea_F"><div class="mess_head"><img src="'+result.icon+'" /></div><div class="mess_R"><p class="mess_infor"><span class="mess_name">我：</span>'+result.content+'</p><p class="mess_time_par">'+result.createTime+'</p></div></div>');
							}else{
								$el.append('<div class="mess_reply"><p class="mess_infor"><span class="mess_name">我：</span>'+result.content+'</p><p class="mess_time_par">'+result.createTime+'</p></div>');
							}
							focusComm($el);
						}else if(result.resultCode == "000"){
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				}
		);
	}
	
	function genNoticeCommList(userTabList){
		var tmpStr = '';
		tmpStr += '<div class=" mess_box" style="border:none">';
		if(userTabList && userTabList.length>0){
			var userTab = userTabList[0];
			tmpStr += '<div class=" clea_F" style="border:none">'+
				'<div class="mess_head"><img src="'+userTab.icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'"/></div>'+
				'<div class="mess_R">'+
					'<p class="mess_infor"><span class="mess_name">'+userTab.commentList[0].commentator+'：</span>'+userTab.commentList[0].content+'</p>'+
					'<p class="mess_time_par">'+userTab.commentList[0].createTime+'</p>'+
				'</div>'+
				'</div>';
			for(var i=1;i<userTab.commentList.length;i++){
				tmpStr += '<div class="mess_reply">'+
					'<p class="mess_infor"><span class="mess_name">'+userTab.commentList[i].commentator+'：</span>'+userTab.commentList[i].content+'</p>'+
					'<p class="mess_time_par">'+userTab.commentList[i].createTime+'</p>'+
					'</div>';
			}
		}
		tmpStr += '</div>';
		return tmpStr;
	}
	
	function scrollScreen($el){
		$('html,body').animate({  
	        scrollTop: $el.offset().top - 60
	    }, 1000); 
	}
	
	function focusComm($el){
		var lasComm = $el.find(".mess_reply:last");
		if(lasComm && lasComm.length>0){
			scrollScreen(lasComm);
		}
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});