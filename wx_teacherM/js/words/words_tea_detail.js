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
	var toast = require('widget/toast');
	var storage = require('storage');
	
	var userImage = '';
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	
	/**
	 * 初始化操作
	 */
	function init(){
		common.fclog('WXLY');
		var userId =  common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var nu = common.getUrlParam("nu");
		var targetUuid = common.getUrlParam("targetUuid");
		var targetName = common.getUrlParam("targetName");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#nu").val(nu);
		$("#targetUuid").val(targetUuid);
		$("#targetName").val(targetName);
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		loadLocalData();
		
		$(".reply_box a").click(function(){
			MtaH5.clickStat('jxhd_words_tea_reply');
			replyContent();
		});
		
		$(".notice-wrap").on("click","img",function(){
			var imgUrl = this.src;
			imageShow(imgUrl);
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
			if(storage.getLocalStorage("wordsdetail_"+nu)){
				tempValue = genWordsDetail(JSON.parse(storage.getLocalStorage("wordsdetail_"+nu)));
				$(".notice-wrap").html(tempValue);  //展示内容
				toast.hideLoadToast();
			}
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/tea/words/detail/get",
					{
						userId:userId,
						cropId:cropId,
						nu:nu
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){  //请求成功
								storage.deleteLocalStorage("wordsdetail_"+nu);
								storage.setLocalStorage("wordsdetail_"+nu,JSON.stringify(result));
								var tempValue = genWordsDetail(result);
								$(".notice-wrap").html(tempValue);  //展示内容
							}
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("wordsdetail_"+nu);
		}
		
	}
	//生成留言详细html
	function genWordsDetail(wordsDetail){
		
		$("#targetUuid").val(wordsDetail.targetUuid);
		$("#targetName").val(wordsDetail.targetName);
		userImage = wordsDetail.currentUserIcon;
		var tmpStr = '<div class="notice-box" ><div class="from">';
					 if(wordsDetail.targetType == 1){
						 tmpStr += '<div class="mes_tl fl t_lh35">';
					 }else{
						 tmpStr += '<div class="mes_tl fl t_lh20">';
					 }
					 if(wordsDetail.targetType == wordsDetail.wordsType){
						 tmpStr += '<span class="mess_for"></span>';
					 }else{
						 tmpStr += '<span class="face_pic fl"><img src="'+wordsDetail.targetIcon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></span>';
					 }
					 tmpStr += wordsDetail.targetName;
					 if(wordsDetail.targetType == 1){
						 tmpStr += '<em class="t_tea">教师</em></div>';
					 }else if(wordsDetail.targetType == 2){
						 tmpStr += '<em class="t_par">家长</em><br /><b>'+wordsDetail.studentName+'的家长</b></div>';
					 }
			tmpStr += '<div class="time fl tr">'+wordsDetail.createTime+'</div></div>'+
					  '<div class="notice-con">'+wordsDetail.content;
					  if(wordsDetail.imageUrls){
						  var picClass = "";
						  if(wordsDetail.imageUrls.length == 1){
							  picClass = "list_pic_y";
						  }else if(wordsDetail.imageUrls.length == 4){
							  picClass = "list_pic_4";
						  }else{
							  picClass = "list_pic_more"
						  }
						  tmpStr += '<div class="'+picClass+'">';
						  if(wordsDetail.imageUrls.length == 1){
							  tmpStr += '<a class="img_narrow" href="javascript:;" ><span><img onload="imgPreDeal(this);" src="'+wordsDetail.imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
						  }else{
							  for(var j=0;j<wordsDetail.imageUrls.length;j++){
								  tmpStr += '<a class="img_narrow" href="javascript:;" ><span><img onload="winFixImg(this);" src="'+wordsDetail.imageUrls[j]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
							  }
						  }
						  tmpStr += '</div>';
					  }
					  if(wordsDetail.funcType == 1 || wordsDetail.funcType == 2){
				    		tmpStr += '<div class="mess_from">';
				        	if(wordsDetail.funcType == 1){
				        		tmpStr += '<b>#来源通知#</b>';
				        	}else if(wordsDetail.funcType == 2){
				        		tmpStr += '<b>#来源作业#</b>';
				        	}
				        	tmpStr += wordsDetail.from+'</div>';
				    	}
					  tmpStr += '</div></div><div class="notice-box" >';
					  if(wordsDetail.replys.length && wordsDetail.replys.length > 0){
							tmpStr += '<div class="list_state" style="text-align:left; border:none" ><a href="javascript:;" class="bt_mess">'+wordsDetail.replys.length+'</a></div>';
					  }else{
							tmpStr += '<div class="list_state" style="text-align:left; border:none" ><a href="javascript:;" class="bt_mess">0</a></div>';
					  }
					  if(wordsDetail.replys && wordsDetail.replys.length > 0){
						  tmpStr += '<div class="list_mess" style="background:#fff; border-top:1px solid #eff1f3;" >';
						  for(var i=wordsDetail.replys.length-1;i>=0;i--){
				    			tmpStr += '<p><img src="'+wordsDetail.replys[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+wordsDetail.replys[i].content+'<br /><b>'+wordsDetail.replys[i].createTime+'</b></p><hr />';
						  }
						  tmpStr += '</div>';
					  }else{
						  tmpStr += '<div class="list_mess" style="background:#fff; border-top:1px solid #eff1f3;"><h3 id="no_data_show" > 暂无回复内容</h3></div>';
					  }
			
			return tmpStr;
	}
	
	function imageShow(imageUrl){
		var imgArr = $(".notice-con").find("img");
		var urlArr = new Array();
		for(var i = 0;i<imgArr.length;i++){
			urlArr[i] = imgArr[i].src;
		}
		wxApi.previewImage(imageUrl,urlArr);
	}
	
	function contentText(flag){
		var value = $("#replyContent").val();
		if(flag == 1){
			if(value == '请输入您的回复内容'){
				$("#replyContent").val('');
			}
		}else{
			if(value == ''){
				$("#replyContent").val('请输入您的回复内容');
			}
		}
	}
	
	/**
	 * 提交回复
	 */
	 var flag = 0;  //0未提交1提交中2已提交
	function replyContent(){
		if(flag == 0){
			flag = 1;
			var wordsUnique = $("#nu").val();
			var content = $("#replyContent").val();
			var targetUuid = $("#targetUuid").val();
			var userId = $("#userId").val();
			var cropId = $("#cropId").val();
			var targetName = $("#targetName").val();
			var targetUserType = "";
			var wordsDetail = JSON.parse(storage.getLocalStorage("wordsdetail_"+wordsUnique));
			if(wordsDetail.wordsType == 3){//教师发送教师
				targetUserType = 1;  //教师对像
			}else{
				targetUserType = 2;  //家长对像
			}
			if(content == '请输入您的回复内容' || content == ''){
				tip.openAlert1("提示","请输入您的回复内容");
				flag = 0;
				return;
			}else{
				content = common.filterXss(content);
				$.post(common.ctx+"/wap/tea/words/sendReply",
						{
							wordsUnique:wordsUnique,
							teaUserId:targetUuid,
							userId:userId,
							content:content,
							cropId:cropId,
							targetUserType:targetUserType
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == "001"){
									$(".list_mess").show();
									flag = 0;
									var wordReply = '<p><img src="'+userImage+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+content+'<br /><b>'+common.getDateTime()+'</b></p><hr />';
									$(".list_mess").append(wordReply);
									
									var btMess = $(".bt_mess").html();
									if(btMess == '未回复'){
										$(".bt_mess").html(1);
									}else{
										$(".bt_mess").html(Number(btMess)+1);
									}
									$("#replyContent").val('');
									$("#no_data_show").hide();
								}else{
									tip.openAlert1("提示",result.resultMsg);
									flag = 0;
								}
							}
						}
					);
			}
		}else if(flag == 1){
			tip.openAlert1("提示","我们正在努力提交中...");
		}else if(flag == 2){
			tip.openAlert1("提示","您的回复已经提交了");
		}
	}
	
});
