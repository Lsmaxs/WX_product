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
	var toast = require('widget/toast');
	var storage = require('storage');
	var tip = require('widget/tip');
	
	var userId,cropId,type,schoolCode;
	
	var globalVal={
			pickUpFlag:false,
			page:1,
			page_flag:0
	};
	
	toast.showLoadToast();
	setTimeout(function(){
		userId = common.getUrlParam("userId");
		cropId = common.getUrlParam("cropId");
		type = common.getUrlParam("type");
		schoolCode = common.getUrlParam("schoolCode");
		init();
	},100);
	
	/**
	 * 初始化工作
	 */
	function init(){
		
		common.fclog('WXTZ');
		//初始化操作
		if(!type){
			type = "1";
		}
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#type").val(type);
		$("#schoolCode").val(schoolCode);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//卡选菜单设置
		if(type == "1"){
			$(".bd_r_l").addClass("sel");
			$(".bd_r_r").click(function(){
				goNoticeList(2)
			});
		}else{
			$(".bd_r_r").addClass("sel");
			$(".bd_r_l").click(function(){
				goNoticeList(1);
			});
		}
		
		//发送通知菜单设置
		$(".tz_box").click(function(){
			goSelectClass();
		});
		var sencond_date = new Date();
		//数据加载处理
		loadLocalData();
		dataPaging();
		
		//图片事件绑定
		$(".list_con").on("click","img",function(){
			var url = $(this).attr("src");
			imageShow(this,url);
			return false;
		});
		
		//列表事件绑定
		$(".list_con").on("click",".list_box",function(){
			var noticeNu = $(this).find(".noticeNu")[0].value;
			goNoticeDetail(noticeNu);
		});
		$(".list_con").on("click",".rec_del",function(){
			var noticeNu = this.getAttribute("data-nu");
			tip.openAlert2("提示","确认要删除本条通知吗？",function(){
				delNotice(noticeNu);
			});
			return false;
		});
		if(type==2){
			$(".list_con").on("click",".list_state",function(){
				var noticeDiv = $(this).parent();
				noticeDiv.find(".reply_list_par").slideToggle(300);
				noticeDiv.find(".reply_input_par").focus();
				return false;
			});
			$(".list_con").on("click",".reply_list_par",function(){
				return false;
			});
		}
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
	function loadLocalData (){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		try{
			var tempValue = '';
			//从localStorage加载数据
			if(storage.getLocalStorage("noticelist_"+type+"_"+cropId)){
				tempValue = genNoticeList(JSON.parse(storage.getLocalStorage("noticelist_"+type+"_"+cropId)),type);
				if(tempValue.length > 0){
					$("#no_data_page").hide();
					$(".list_con").html(tempValue);  //展示内容
				}else{
					$("#no_data_page").show();
				}
				toast.hideLoadToast();
			}
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/tea/notice/list/1",
					{
						userId:userId,
						cropId:cropId,
						type:type
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){  //请求成功
								storage.deleteLocalStorage("noticelist_"+type+"_"+cropId);
								storage.setLocalStorage("noticelist_"+type+"_"+cropId,JSON.stringify(result.items));
								var tempValue = genNoticeList(result.items,type);
								
								if(tempValue.length > 0){
									$("#no_data_page").hide();
									$(".list_con").html(tempValue);  //展示内容
								}else{
									$("#no_data_page").show();
								}
								
								globalVal.pickUpFlag = true;  //允许下拉
							}
							toast.hideLoadToast();
						}
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("noticelist_"+type+"_"+cropId);
		}
		
	}
	
	/**
	 * 分页查询数据
	 */
	function dataPaging (){
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
						var type = $("#type").val();
						$.post(common.ctx+"/wap/tea/notice/list/"+(globalVal.page+1),
								{
									userId:userId,
									cropId:cropId,
									type:type
								},
								function(result){
									if(common.verifyToken(result,cropId)){
										if(result.resultCode == '001' && result.items && result.items.length > 0){  //请求成功
											globalVal.page = globalVal.page+1;
											var tempValue = genNoticeList(result.items,type);
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
	 * 生成通知列表html
	 */
	function genNoticeList(noticeList,type){
		
		var tmpStr = '';
		if(type == 1){
			if(noticeList){
				for(var i=0;i<noticeList.length;i++){
					tmpStr += '<div class="list_box" >'+
							  '<input type="hidden" class="noticeNu" value="'+noticeList[i].nu+'" />'+
							  '<div class="list_from">'+
							  '</div><div class="list_tit">'+noticeList[i].content;
							  if(noticeList[i].imageUrls && noticeList[i].imageUrls.length>0){
								  var picClass = "";
								  if(noticeList[i].imageUrls.length == 1){
									  picClass = "list_pic_y";
								  }else if(noticeList[i].imageUrls.length == 4){
									  picClass = "list_pic_4";
								  }else{
									  picClass = "list_pic_more"
								  }
								  tmpStr += '<div class="'+picClass+'">';
								  if(noticeList[i].imageUrls.length == 1){
									  tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" src="'+noticeList[i].imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
								  }else{
									  for(var j=0;j<noticeList[i].imageUrls.length;j++){
										  tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" src="'+noticeList[i].imageUrls[j]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
									  }
								  }
								  tmpStr += '</div>';
							  }
							  tmpStr += '</div><div class="rec_time">'+noticeList[i].createTime+'<a class="rec_del" data-nu="'+noticeList[i].nu+'" href="javascript:;">删除</a><span class="mess_Num">'+noticeList[i].userCommNum+'</span></div><div class="list_state"><p>';
							  if(noticeList[i].targets){
								  tmpStr += "发给：";
								  for(var z=0;z<noticeList[i].targets.length && z<2;z++){
									  if(z != 0){
										  tmpStr += '、'; 
									  }
									  tmpStr += noticeList[i].targets[z];
								  }
								  if(z < noticeList[i].targets.length){
									  tmpStr += '...(共'+(noticeList[i].readNum+noticeList[i].unReadNum)+'人)';
								  }
							  }
							  tmpStr += '</p><p>已读/未读：<span class="c-tx8">'+noticeList[i].readNum+'/'+noticeList[i].unReadNum+'</span></p></div></div>';
				}
			}
		}else if(type == 2){
			if(noticeList){
				for(var i=0;i<noticeList.length;i++){
					tmpStr += '<div class="list_box" >'+
							  '<input type="hidden" class="noticeNu" value="'+noticeList[i].nu+'"  />'+
							  '<div class="list_from"><div class="title fl"><span class="face_pic">'+
							  '<img src="'+noticeList[i].sendIcon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" >'+
							  '</span>'+noticeList[i].sendName+'</div>'+
							  '<div class="time fl tr">'+noticeList[i].createTime+'</div>'+
							  '</div><div class="list_tit">'+noticeList[i].content;
							  if(noticeList[i].imageUrls){
								  var picClass = "";
								  if(noticeList[i].imageUrls.length == 1){
									  picClass = "list_pic_y";
								  }else if(noticeList[i].imageUrls.length == 4){
									  picClass = "list_pic_4";
								  }else{
									  picClass = "list_pic_more"
								  }
								  tmpStr += '<div class="'+picClass+'">';
								  if(noticeList[i].imageUrls.length == 1){
									  tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" src="'+noticeList[i].imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
								  }else{
									  for(var j=0;j<noticeList[i].imageUrls.length;j++){
										  tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" src="'+noticeList[i].imageUrls[j]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
									  } 
								  }
								  tmpStr += '</div>';
							  }
							  tmpStr += '</div><div class="list_state"><span class="mess_Num">留言</span></div>'+
							  '<div class="reply_list_par"><input class="reply_input_par" placeholder="回复老师："/> <a href="javascript:;" class="reply_send">发送</a></div>'+
							  '</div>';
				}
			}
		}
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
	 * 跳转至通知列表
	 * @param type
	 */
	function goNoticeList(type){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var schoolCode = $("#schoolCode").val();
		document.location.href = common.ctx + '/wap/html/notice/notice_tea_list.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&schoolCode="+schoolCode+"&ADTAG="+storage.getSessionStorage("adtag");
	}
	
	/**
	 * 跳转至选择班级
	 */
	function goSelectClass(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var schoolCode = $("#schoolCode").val();
		document.location.href = common.ctx + '/wap/html/notice/tea_send_tagetlist.html?cropId='+cropId+"&userId="+userId+"&schoolCode="+schoolCode+"&ADTAG="+storage.getSessionStorage("adtag");
	}
	
	/**
	 * 跳转至通知详细列表
	 * @param type
	 */
	function goNoticeDetail(nu){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var type = $("#type").val();
		document.location.href = common.ctx + '/wap/html/notice/notice_tea_detail.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&nu="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
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
						tip.openAlert1('提示',result.resultMsg);
						if(result.resultCode == '001'){  //请求成功
							$(".noticeNu").each(function(){
								if($(this).val()==nu){
									$(this).parent("div").remove();
								}
							});
						}
					}
				}
			);
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
							document.location.href = common.ctx + '/wap/html/notice/notice_tea_detail.html?cropId='+cropId+"&userId="+userId+"&type=2&nu="+nu+"&nocache=1&ADTAG="+storage.getSessionStorage("adtag");
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
