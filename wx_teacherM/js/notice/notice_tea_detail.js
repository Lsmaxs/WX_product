/**
 * author:yonson
 * data:2015-10-26
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

	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	function init(){
		common.fclog('WXTZ');
		var cropId = common.getUrlParam("cropId");
		var userId = common.getUrlParam("userId");
		var nu = common.getUrlParam("nu");
		var type = common.getUrlParam("type");
		if(!type){   //默认是我接收到的通知
			type = 2;
		}
		var isParent = common.getUrlParam("isParent");
		
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#nu").val(nu);
		$("#type").val(type);
		$("#isParent").val(isParent);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadLocalData();
		
		$("body").on("click",".tz_box",function(){
			MtaH5.clickStat('jxhd_notice_tea_words');
			pathToWords();
		});
		
		$("#htmlbody").on("click","#readPenson",function(){
			$($(this).find("span")[0]).toggleClass("dy_more").toggleClass("dy_some");
			$("#readPensonList").slideToggle(300);
		});
		
		$("#htmlbody").on("click","#unReadPenson",function(){
			$($(this).find("span")[1]).toggleClass("dy_more").toggleClass("dy_some");
			$("#unReadPensonList").slideToggle(300);
			$("#urp_selectall").slideToggle(300);
		});
		
		$("#htmlbody").on("click","img",function(){
			var imgUrl = this.src;
			var type = this.getAttribute("data-type");
			imageShow(imgUrl,type);
		});
		
		$("#htmlbody").on("click","#urp_selectall",function(){
			selectAll(this);
			return false;
		});
		
		$("#htmlbody").on("click","p[name='opChecked']",function(){
			opChecked(this);
		});
		
		$("#htmlbody").on("click","#sendAgain",function(){
			MtaH5.clickStat('jxhd_notice_tea_sendagain');
			sendAgain();
		});
		$("#htmlbody").on("click",".rec_del",function(){
			var noticeNu = $("#nu").val();
			tip.openAlert2("提示","确认要删除本条通知吗？",function(){
				delNotice(noticeNu);
			});
		});
		$("#htmlbody").on("click",".mess_box",function(){
			if($("#type").val()==1){
				$($(this).find("span")[3]).toggleClass("dy_more").toggleClass("dy_some");
				$($(this).find(".comm_space")[0]).slideToggle(300);
				var messNew = $(this).find(".mess_new");
				if(messNew && messNew.length>0){
					var commId = this.getAttribute('data-comm-userid');
					$(messNew[0]).remove();
					commentRead(commId);
				}
			}
		});
		$("#htmlbody").on("click",".reply_send",function(){
			if($("#type").val()==1){
				var content = $($(this).parent("div").find(".reply_input")[0]).val();
				saveComment($(this).parent("div"),content,$("#type").val(),this.getAttribute("data-replyid"));
			}else{
				var content = $(this).parent("div").find(".reply_input_par").val();
				saveComment($(".mess_box"),content,$("#type").val());
			}
			return false;
		});
		$("#htmlbody").on("click",".reply_input",function(){
			return false;
		});
		$("#htmlbody").on("click",".read_tit",function(){
			goReadList();
		});
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLocalData(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		var type = $("#type").val();
		
		try{
			var tempValue = '';
			//从localStorage加载数据
			var nocache = common.getUrlParam("nocache");
			if(!nocache || nocache!=1){
				if(storage.getLocalStorage("noticedetail_"+type+"_"+nu)){
					var data = JSON.parse(storage.getLocalStorage("noticedetail_"+type+"_"+nu));
					checkExists(data);
					tempValue = genNoticeDetail(data,type);
					$("#htmlbody").html(tempValue);  //展示内容
					toast.hideLoadToast();
				}
			}
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/tea/notice/detail/get",
					{
						userId:userId,
						cropId:cropId,
						nu:nu,
						type:type
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							checkExists(result);
							if(result.resultCode == '001'){  //请求成功
								storage.deleteLocalStorage("noticedetail_"+type+"_"+nu);
								storage.setLocalStorage("noticedetail_"+type+"_"+nu,JSON.stringify(result));
								var tempValue = genNoticeDetail(result,type);
								$("#htmlbody").html(tempValue);  //展示内容
							}
							if(type==2){
								focusComm($("#htmlbody"));
							}
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("noticedetail_"+type+"_"+nu);
		}
	}
	
	function checkExists(data){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		var type = $("#type");
		if(!data || data.resultCode!='001'){
			storage.deleteLocalStorage("noticedetail_"+type+"_"+nu);
			document.location.href = common.ctx + '/wap/html/notice/notice_404.html?cropId='+cropId+"&userId="+userId+'&nu='+nu;
		}
	}
	
	/**
	 * 生成通知详细html
	 * @param noticeObj
	 * @param type
	 */
	function genNoticeDetail(noticeObj,type){
		$("#classCode").val(noticeObj.classCode);
		$("#senderUuid").val(noticeObj.sendUserId);
		$("#senderName").val(noticeObj.sendName);
		var tmpStr = '';
		if(type == 1){
			 tmpStr += '<div class="dtl-wrap"><div class="list_box">'+
			 '<div class="list_tit">'+noticeObj.content;
			 
			 if(noticeObj.imageUrls && noticeObj.imageUrls.length>0){
				 var picClass = "";
				 if(noticeObj.imageUrls.length == 1){
					 picClass = "list_pic_y";
				 }else if(noticeObj.imageUrls.length == 4){
					 picClass = "list_pic_4";
				 }else{
					 picClass = "list_pic_more"
				 }
				 tmpStr += '<div class="'+picClass+'">';
				 if(noticeObj.imageUrls.length == 1){
					 tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" data-type="1" src="'+noticeObj.imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
				 }else{
					 for(var i=0;i<noticeObj.imageUrls.length;i++){
						 tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" data-type="1" src="'+noticeObj.imageUrls[i]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
					 } 
				 }
				 tmpStr += '</div>';
			  }
			 tmpStr += '</div>'+
			 		   '<div class="rec_time">'+noticeObj.createTime+'<a class="rec_del" href="javascript:;">删除</a></div>'+
			 		   '<div class="rec_for">发给：';
			 for(var i=0;i<noticeObj.targets.length && i<2;i++){
				 if(i != 0){
					 tmpStr += '、';
				 }
				 tmpStr += noticeObj.targets[i];
			 }
			 if(noticeObj.targets.length > 2){
				 tmpStr += '...';
			 }
			 tmpStr += '（共'+(noticeObj.readList.length+noticeObj.unReadList.length)+'人）</div></div>';
			 tmpStr += '<div class="list_box">'+
			 	'<div class="read_tit">阅读情况：<span>已读<b>'+noticeObj.readList.length+'</b>/未读<b>'+noticeObj.unReadList.length+'</b></span><span class="dy_more"></span></div>'+
			 	'</div>';
			 tmpStr += '<div class="notice-box" >'+
			 		'<div class="notice_top" ><span class="ts_mess">展开信息可进行回复</span><i class="bt_mess"><em>'+noticeObj.userTabList.length+'</em>人留言</i></div>'+
			 		genNoticeCommList(noticeObj.userTabList,type)+
			 	'</div>';
		}else if(type == 2){
			tmpStr += '<div class="notice-wrap">'+
					  '<div class="from">'+
					  '<div class="title fl"><span class="face_pic"><img src="'+noticeObj.sendIcon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></span>'+noticeObj.sendName+'</div>'+
					  '<div class="time fl tr">'+noticeObj.createTime+'</div>'+
					  '</div>'+
					  '<div class="notice-con"">'+noticeObj.content;
					  if(noticeObj.imageUrls && noticeObj.imageUrls.length>0){
						  var picClass = "";
						  if(noticeObj.imageUrls.length == 1){
							  picClass = "list_pic_y";
						  }else if(noticeObj.imageUrls.length == 4){
							  picClass = "list_pic_4";
						  }else{
							  picClass = "list_pic_more"
						  }
						  tmpStr += '<div class="'+picClass+'">';
						  if(noticeObj.imageUrls.length == 1){
							  tmpStr += '<a href="javascript:;"><span><img data-type="2" onload="imgPreDeal(this);" src="'+noticeObj.imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
						  }else{
							  for(var i=0;i<noticeObj.imageUrls.length;i++){
								  tmpStr += '<a href="javascript:;"><span><img data-type="2" onload="winFixImg(this);"  src="'+noticeObj.imageUrls[i]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
							  }
						  }
						  tmpStr += '</div>';
					  }
					  tmpStr += '</div><div class="list_mess" style="background:#fff;"></div></div>';
					  //if($("#isParent").val() == '1'){
					  //$(".tz_box").show();  //开放给教师使用
					  //}
			if(noticeObj.userTabList && noticeObj.userTabList.length>0){
				tmpStr += '<div class="notice-box" >';
			}else{
				tmpStr += '<div class="notice-box" style="display:none;">';
			}
			tmpStr += '<div class="list_mess" style="background:#fff;">'+
			genNoticeCommList(noticeObj.userTabList,type)+
			'</div></div>';
			tmpStr += '<div class="reply_box_par">'+
				'<input class="reply_input_par" placeholder="给老师留言：" />'+
				'<a href="javascript:;" data-replyid="'+noticeObj.sendUserId+'" class="reply_send">发送</a></div>';
		}
		return tmpStr;
		
	}
	
	/**
	 * 图片预览
	 */
	function imageShow(imageUrl,type){
		if(type == 1){
			var imgArr = $(".list_tit").find("img");
			var urlArr = new Array();
			for(var i = 0;i<imgArr.length;i++){
				urlArr[i] = imgArr[i].src;
			}
			wxApi.previewImage(imageUrl,urlArr);
		}else if(type == 2){
			var imgArr = $(".notice-con").find("img");
			var urlArr = new Array();
			for(var i = 0;i<imgArr.length;i++){
				urlArr[i] = imgArr[i].src;
			}
			wxApi.previewImage(imageUrl,urlArr);
		}
	}
	
	/**
	 * 跳转至人员介页
	 */
	function goReadMan(type){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		if(type == 1){
			document.location.href = common.ctx+"/wap/html/notice/notice_tea_read.html?cropId="+cropId+"&userId="+userId+"&nu="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
		}else{
			document.location.href = common.ctx+"/wap/html/notice/notice_tea_unread.html?cropId="+cropId+"&userId="+userId+"&nu="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
		}
	}
	
	/**
	 * 跳转至教师留言发送
	 */
	function pathToWords(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var classCode = $("#classCode").val();
		var senderUuid = $("#senderUuid").val();
		var senderName = $("#senderName").val();
		var nu = $("#nu").val();
		
		var noticeObj = JSON.parse(storage.getLocalStorage("noticedetail_"+2+"_"+nu));
		var teaObj = {
				userId:noticeObj.sendUserId,
				icon:noticeObj.sendIcon,
				phone:"",
				name:noticeObj.sendName,
				followed:1,
				targetUserType:1
			}
		storage.setSessionStorage("paramValue",JSON.stringify(teaObj));
		
		if($("#isParent").val() == '0'){  //家长身份
			document.location.href = common.ctx+"/wap/html/words/words_par_edit.html?classCode="+classCode+"&targetUuid="+senderUuid+"&targetName="+senderName+"&cropId="+cropId+"&userId="+userId+"&funcType=1&funUniq="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
		}else{
			document.location.href = common.ctx+"/wap/html/words/words_tea_edit.html?targetUuid="+senderUuid+"&targetName="+senderName+"&cropId="+cropId+"&userId="+userId+"&funcType=1&funUniq="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
		}
		
	}
	
	/**
	 * 勾选选择
	 * @param obj
	 */
	function opChecked(obj){
		var newObj = $($(obj).find("span")[0]);
		if(newObj.hasClass('op-check')){
			newObj.addClass('op-checked')
			newObj.removeClass('op-check')
		}else if(newObj.hasClass('op-checked')){
			newObj.addClass('op-check')
			newObj.removeClass('op-checked')
		}
	}
	
	/**
	 * 再次发送
	 */
	var sendFlag = 0;
	function sendAgain(){
		if(sendFlag == 0){
			sendFlag = 1;
			var userId = $("#userId").val();
			var cropId = $("#cropId").val();
			var nu = $("#nu").val();
			var sendStuTarget = '';
			var userInfoList = $(".op-checked").find("[name='userInfo']");
			for(var i=0;i<userInfoList.length;i++){
				sendStuTarget += "," + userInfoList[i].value;
			}
			
			//向服务端请求最新数据
			if(sendStuTarget.length <= 0){
				tip.openAlert1("提示","请选择发送人员");
				sendFlag = 0;
			}else{
				sendStuTarget = sendStuTarget.substring(1);
				$.post(common.ctx+"/wap/tea/notice/resend",
						{
							userId:userId,
							cropId:cropId,
							nu:nu,
							sendStuTarget:sendStuTarget
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == '001'){  //请求成功
									tip.openAlert1("提示","发送成功");
									sendFlag = 2;
								}else{
									tip.openAlert1("提示","发送失败");
									sendFlag = 0;
								}
							}
						}
					);
			}
		}else if(sendFlag == 1){
			tip.openAlert1("提示","消息正在发送中...");
		}else if(sendFlag == 2){
			tip.openAlert1("提示","消息已发送过");
		}
	}
	
	/**
	 * 全选反选操作
	 * @param obj
	 */
	function selectAll(obj){
		var newObj = $(obj);
		if(newObj.hasClass('op-check')){  //全部选择
			$(".op-check").addClass('op-checked').removeClass('op-check');
		}else if(newObj.hasClass('op-checked')){  //全部反选
			$(".op-checked").addClass('op-check').removeClass('op-checked');
		}
	}
	
	function delNotice(nu){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		$.post(common.ctx+"/wap/tea/notice/del",
				{
					userId:userId,
					cropId:cropId,
					nu:nu
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						if(result.resultCode == '001'){  //请求成功
							tip.openAlert1("提示",result.resultMsg);
							document.location.href = common.ctx + '/wap/html/notice/notice_tea_list.html?cropId='+cropId+"&userId="+userId+"&ADTAG="+storage.getSessionStorage("adtag");
						}else{
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				}
			);
	}
	
	function commentRead(commUuid){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var json = {
				noticeUnique:$("#nu").val(),
				commUuid:commUuid
		};
		var jsonStr = JSON.stringify(json);
		$.post(common.ctx+"/wap/tea/notice/comment/read",
				{
					json:jsonStr,
					cropId:cropId,
					userId:userId
				}
		);
	}
	
	function saveComment($el,content,type,replyId){
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
		$.post(common.ctx+"/wap/tea/notice/comment/add",
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
							if(type==1){
								$el.find(".reply_input").val("");
								$el.before('<div class="mess_reply"><p class="mess_infor"><span class="mess_name">我：</span>'+content+'</p><p class="mess_time">'+result.createTime+'</p></div>');
								focusComm($el.parent());
							}else{
								$(".reply_input_par").val("");
								if($el.find(".mess_head").length==0){
									$el.append('<div class="clea_F"><div class="mess_head"><img src="'+result.icon+'" /></div><div class="mess_R"><p class="mess_infor"><span class="mess_name">我：</span>'+result.content+'</p><p class="mess_time_par">'+result.createTime+'</p></div></div>');
								}else{
									$el.append('<div class="mess_reply"><p class="mess_infor"><span class="mess_name">我：</span>'+result.content+'</p><p class="mess_time_par">'+result.createTime+'</p></div>');
								}
								focusComm($el);
							}
						}else if(result.resultCode == "000"){
							tip.openAlert1("提示",result.resultMsg);
						}
					}
				}
		);
	}
	
	function genNoticeCommList(userTabList,type){
		var tmpStr = '';
		if(type==1){
			var tmpStr = '<div class="list_mess" style="background:#fff;">';
			if(userTabList && userTabList.length>0){
				for(var i=0;i<userTabList.length;i++){
					tmpStr += '<div class="mess_box" data-commentlist="'+i+'" data-comm-userid="'+userTabList[i].uuid+'">';
					tmpStr += '<div class="clea_F">';
					if(userTabList[i].senderRead==0){
						tmpStr += '<div class="mess_new"></div>';
					}
					var fcomment = userTabList[i].commentList[0];
					tmpStr += '<div class="mess_head"><img src="'+userTabList[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'" /></div>'+
						'<div class="mess_R">'+
						'<span class="mess_time">'+fcomment.createTime+'</span><span class="mess_name">'+userTabList[i].userName+'</span><span class="mess_class">'+userTabList[i].tag+'</span>'+
						'<p class="mess_infor">'+fcomment.content+'</p>'+
						'<a class="link_more"><span class="dy_more"></span></a>'+
						'</div>';
					tmpStr += '</div>';
					//评论列表
					tmpStr += '<div class="comm_space" style="display:none;"><div class="comm_list">';
					for(var j=1;j<userTabList[i].commentList.length;j++){
						var comment = userTabList[i].commentList[j];
						tmpStr += '<div class="mess_reply">'+
							'<p class="mess_infor"><span class="mess_name">'+comment.commentator+'：</span>'+comment.content+'</p>'+
							'<span class="mess_time">'+comment.createTime+'</span>'+
							'</div>';
					}
					tmpStr += '<div class="reply_box">'+
						'<input class="reply_input" placeholder="回复'+userTabList[i].userName+'：" />'+
						'<a href="javascript:;" class="reply_send" data-replyid="'+userTabList[i].uuid+'">发送</a>'+
						'</div>';
					tmpStr += '</div></div>';
					tmpStr += '</div>';
				}
			}
			tmpStr += '</div>';
		}else{
			tmpStr += '<div class=" mess_box" style="border:none;">';
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
		}
		
		return tmpStr;
	}
	
	function goReadList(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		document.location.href = common.ctx + '/wap/html/notice/notice_read_list.html?cropId='+cropId+"&userId="+userId+"&nu="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
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
