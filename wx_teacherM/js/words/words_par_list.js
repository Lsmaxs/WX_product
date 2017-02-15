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
		var type = common.getUrlParam("type");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		if(!type){
			type = 1;
		}
		$("#type").val(type);
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadLocalData();
		dataPaging();
		
		$(".date-wrap").on("click","img",function(){
			var url = $(this).attr("src");
			imageShow(this,url);
			return false;
		});
		
		$(".date-wrap").on("click",".list_box",function(){
			var noticeNu = $(this).find(".noticeNu")[0].value;
			goWordsDetail(noticeNu);
		});
		
		if(type == 1){
			$(".bd_r_l").addClass("sel");
			$(".bd_r_r").click(function(){
				goWordsList(2);
			});
		}else{
			$(".bd_r_r").addClass("sel");
			$(".bd_r_l").click(function(){
				goWordsList(1);
			});
		}
		
	}
	
	/**
	 * 从localStoger中加截数据
	 */
	function loadLocalData(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		
		try{
			var tempValue = '';
			//从localStorage加载数据
			if(storage.getLocalStorage("wordslist_"+type+"_"+cropId)){
				tempValue = genWordList(JSON.parse(storage.getLocalStorage("wordslist_"+type+"_"+cropId)),type);
				$(".date-wrap").html(tempValue);  //展示内容
				toast.hideLoadToast();
			}
			
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/par/words/list/1",
					{
						userId:userId,
						cropId:cropId,
						type:type
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							var tempValue = '';
							storage.deleteLocalStorage("wordslist_"+type+"_"+cropId);
							storage.setLocalStorage("wordslist_"+type+"_"+cropId,JSON.stringify(result.items));
							if(result.items.length && result.items.length == 0){
								tempValue = genNoWordList();
								globalVal.pickUpFlag = false;  //不允许下拉
							}else{
								tempValue = genWordList(result.items,type);
								globalVal.pickUpFlag = true;  //允许下拉
							}
							$(".date-wrap").html(tempValue);  //展示内容
							toast.hideLoadToast();
						}
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("wordslist_"+type+"_"+cropId);
		}
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
						var userId = $("#userId").val();
						var cropId = $("#cropId").val();
						var type = $("#type").val();
						$.post(common.ctx+"/wap/par/words/list/"+(globalVal.page+1),
								{
									userId:userId,
									cropId:cropId,
									type:type
								},
								function(result){
									if(common.verifyToken(result,cropId)){
										if(result.items && result.items.length > 0){  //请求成功
											globalVal.page = globalVal.page+1;
											var tempValue = genWordList(result.items,type);
											$(".list_con").append(tempValue);  //展示内容
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
	 * 构造留言列表信息
	 * @param wordsList
	 * @returns {String}
	 */
	function genWordList(wordsList,type){
		var tmpStr = '<div class="list_con">';
		if(wordsList && wordsList.length){
			for(var i=0;i<wordsList.length;i++){
				tmpStr += '<div class="list_box" >'+
						  '<input type="hidden" class="noticeNu" value="'+wordsList[i].wordsUnique+'"  />'+
					 	  '<div class="list_from">';
				if(wordsList[i].targetType == 1){
					tmpStr += '<div class="title fl t_lh35">';
				}else{
					tmpStr += '<div class="title fl t_lh20">';
				}
				if(type == 2){
					tmpStr += '<span class="mess_for"></span>'+wordsList[i].targetName;
				}else{
					tmpStr += '<span class="face_pic"><img src="'+wordsList[i].headPortraitUrl+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></span>'+wordsList[i].targetName;
				}
			    if(wordsList[i].targetType == 1){
				    tmpStr += '<em class="t_tea">教师</em></div>';
			    }else{
				    tmpStr += '<em class="t_par">家长</em><br /><B>'+wordsList[i].stuName+'的家长</B></div>';
			    }
				tmpStr += '<div class="time fl tr">'+wordsList[i].createTime+'</div></div>'+
						  '<div class="list_tit">'+wordsList[i].content;
						  if(wordsList[i].attachmentList){
							  var picClass = "";
							  if(wordsList[i].attachmentList.length == 1){
								  picClass = "list_pic_y";
							  }else if(wordsList[i].attachmentList.length == 4){
								  picClass = "list_pic_4";
							  }else{
								  picClass = "list_pic_more"
							  }
							  tmpStr += '<div class="'+picClass+'">';
							  if(wordsList[i].attachmentList.length == 1){
								  tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" src="'+wordsList[i].attachmentList[0].attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
							  }else{
								  for(var j=0;j<wordsList[i].attachmentList.length;j++){
									  tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" src="'+wordsList[i].attachmentList[j].attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
								  }
							  }
							  tmpStr += '</div>';
						  }
						  if(wordsList[i].funcType == 1 || wordsList[i].funcType == 2){
							  tmpStr += '<div class="mess_from">';
							  if(wordsList[i].funcType == 1){
								  tmpStr += '<b>#来源通知#</b>';
							  }else{
								  tmpStr += '<b>#来源作业#</b>';
							  }
							  tmpStr += wordsList[i].from + '</div>';
						  }
				tmpStr += '</div>'+
						  '<div class="list_state">';
						  if(wordsList[i].replyList){
							  for(var z=0;z<wordsList[i].replyList.length;z++){
								  if(wordsList[i].replyList[z].iSaid == 1){
									  tmpStr += '<p><img src="'+wordsList[i].replyList[z].headPortraitUrl+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />';
									  tmpStr += wordsList[i].replyList[z].content+'<br /><b>'+wordsList[i].replyList[z].createTime+'</b></p>';
								  }else{
									  tmpStr += '<p><img src="'+wordsList[i].replyList[z].headPortraitUrl+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />';
									  tmpStr += wordsList[i].replyList[z].content+'<br /><b>'+wordsList[i].replyList[z].createTime+'</b></p>';
								  }
							  }
						  }
						  if(wordsList[i].replyNum && wordsList[i].replyNum > 0){
							  tmpStr += '<a href="javascript:;" class="bt_mess">'+wordsList[i].replyNum+'</a></div>';
						  }else{
							  tmpStr += '<a href="javascript:;" class="bt_mess">未回复</a></div>';
						  }
				tmpStr += '</div>';
			}
		}
		tmpStr += '</div>';
		return tmpStr;
	}
	
	/**
	 * 构造无留言列表信息
	 * @returns {String}
	 */
	function genNoWordList(){
		$("#noDataShow").show();
		var tmpStr = '<div class=" point_box">'+
					 '<h2 class="c-tx1">暂时没有留言记录哦</h2>'+
	    			 '<img src="../../images/tc_face2.png" /></div>'+
	    			 '<div class="list_con"></div>';
	    return tmpStr;
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
	
	/**
	 * 跳转到接收留言列表
	 * @param type
	 */
	function goWordsList(type){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+"/wap/html/words/words_par_list.html?cropId="+cropId+"&userId="+userId+"&type="+type;
	}
	
	/**
	 * 跳转到留言详细
	 * @param nu
	 */
	function goWordsDetail(nu){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+"/wap/html/words/words_par_detail.html?cropId="+cropId+"&userId="+userId+"&nu="+nu;
	}

});