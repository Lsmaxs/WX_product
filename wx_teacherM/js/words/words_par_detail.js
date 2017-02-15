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
		var wordsUnique = common.getUrlParam("nu");
		var targetUuid = common.getUrlParam("targetUuid");
		var targetName = common.getUrlParam("targetName");
		var userId =  common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var nu = common.getUrlParam("nu");
		
		$("#wordsUnique").val(wordsUnique);
		$("#targetUuid").val(targetUuid);
		$("#targetName").val(targetName);
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#nu").val(nu);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadLocalData();  //加截数据
		
		$(".reply_box a").click(function(){
			MtaH5.clickStat('jxhd_words_par_reply');
			replyContent();
		});
		
		$(".notice-wrap").on("click",".img",function(){
			var imgUrl = this.src;
			imageShow(imgUrl);
		});
		
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLocalData(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		try{
			var tempValue = '';
			//从localStorage加载数据
			if(storage.getLocalStorage("wordsobj_"+nu)){
				tempValue = genWordsDetail(JSON.parse(storage.getLocalStorage("wordsobj_"+nu)));
				$(".notice-wrap").html(tempValue);  //展示内容
				toast.hideLoadToast();
			}
			
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/par/words/detailGet",
					{
						userId:userId,
						cropId:cropId,
						nu:nu
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							var tempValue = '';
							storage.deleteLocalStorage("wordsobj_"+nu);
							storage.setLocalStorage("wordsobj_"+nu,JSON.stringify(result));
							tempValue = genWordsDetail(result);
							$(".notice-wrap").html(tempValue);  //展示内容
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("wordsobj_"+nu);
		}
	}
	
	/**
	 * 生成留言详细html
	 */
	function genWordsDetail(wordsObj){
		var targetUuid = $("#targetUuid").val();
		var targetName = $("#targetName").val();
		userImage = wordsObj.currentUserIcon;
		if(!targetUuid || targetUuid == ''){
			$("#targetUuid").val(wordsObj.targetUuid);
			$("#targetName").val(wordsObj.targetName);
		}
			
		var tmpStr = '<div class="notice-box" ><div class="from"><div class="mes_tl t_lh20 fl">';
		if(wordsObj.wordsType == 1){
			tmpStr += '<span class="mess_for"></span>';
		}else{
			tmpStr += '<span class="face_pic"><img src="'+wordsObj.headPortraitUrl+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></span>'
		}
		    tmpStr += wordsObj.targetName;
    	if(wordsObj.targetType == 2){
    		tmpStr += '<em class="t_par">家长</em><br /><b>'+wordsObj.stuName+'的家长</b>';
    	}else{
    		tmpStr += '<em class="t_tea">教师</em>';
    	}
    	tmpStr += '</div><div class="time fl tr">'+wordsObj.createTime+'</div></div>'+
    			  '<div class="notice-con">'+wordsObj.content;
    	if(wordsObj.attachmentList){
    		var picClass = "";
			if(wordsObj.attachmentList.length == 1){
				picClass = "list_pic_y";
			}else if(wordsObj.attachmentList.length == 4){
				picClass = "list_pic_4";
			}else{
				picClass = "list_pic_more"
			}
    		tmpStr += '<div class="'+picClass+'">';
    		if(wordsObj.attachmentList.length == 1){
    			tmpStr += '<a class="img_narrow" href="javascript:;" ><span><img onload="imgPreDeal(this);" src="'+wordsObj.attachmentList[0].attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
    		}else{
    			for(var i=0;i<wordsObj.attachmentList.length;i++){
        			if(wordsObj.attachmentList[i].attachmentType == 1){
        				tmpStr += '<a class="img_narrow" href="javascript:;" ><span><img onload="winFixImg(this);" src="'+wordsObj.attachmentList[i].attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
        			}
        		}
    		}
    		tmpStr += '</div>';
    	}
    	if(wordsObj.funcType == 1 || wordsObj.funcType == 2){
    		tmpStr += '<div class="mess_from">';
        	if(wordsObj.funcType == 1){
        		tmpStr += '<b>#来源通知#</b>';
        	}else if(wordsObj.funcType == 2){
        		tmpStr += '<b>#来源作业#</b>';
        	}
        	tmpStr += wordsObj.from+'</div>';
    	}
    	tmpStr += '</div></div><div class="notice-box" >';
    	tmpStr += '<div class="list_state" style="text-align:left; border:none" ><a href="javascript:;" class="bt_mess">';
    	if(wordsObj.replyNum && wordsObj.replyNum > 0){
    		tmpStr += wordsObj.replyNum
    	}else{
    		tmpStr += '0';
    	}
    	tmpStr += '</a></div>';
    	if(wordsObj.replyList && wordsObj.replyList.length > 0){
    		tmpStr += '<div class="list_mess" style="background:#fff; border-top:1px solid #eff1f3;" ><div id="wordsRelpyList">';
    		for(var j=wordsObj.replyList.length-1;j>=0;j--){
    			tmpStr += '<p><img src="'+wordsObj.replyList[j].headPortraitUrl+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+wordsObj.replyList[j].content+'<br /><b>'+wordsObj.replyList[j].createTime+'</b></p><hr />';
    		}
    		tmpStr += '</div></div>';
    	}else{
    		tmpStr += '<div class="list_mess" style="background:#fff; border-top:1px solid #eff1f3;"><div id="wordsRelpyList"><h3 id="no_data_show"> 暂无回复内容</h3></div></div>';
    	}
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
	 * 提交回复
	 */
	var flag = 0;  //0未提交1提交中2已提交
	function replyContent(){
		if(flag == 0){
			flag = 1;
			var wordsUnique = $("#wordsUnique").val();
			var content = $("#replyContent").val();
			var targetUuid = $("#targetUuid").val();
			var userId = $("#userId").val();
			var cropId = $("#cropId").val();
			var targetName = $("#targetName").val();
			
			if(content == '请输入您的回复内容' || content == ''){
				tip.openAlert1("提示","请输入您的回复内容");
				flag = 0;
				return;
			}else{
				content = common.filterXss(content);
				$.post(common.ctx+"/wap/par/words/sendReply",
						{
							wordsUnique:wordsUnique,
							targetUuid:targetUuid,
							userId:userId,
							content:content,
							cropId:cropId
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == "001"){
									$(".list_mess").show();
									flag = 0;
									var wordReply = '<p><img src="'+userImage+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+content+'<br /><b>'+common.getDateTime()+'</b></p><hr />';
									$("#wordsRelpyList").append(wordReply);
									
									var btMess = $.trim($(".bt_mess").html());
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