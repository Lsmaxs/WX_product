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
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	/**
	 * 初始化操作
	 */
	function init(){
		common.fclog('WXZY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var nu = common.getUrlParam("nu");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#nu").val(nu);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadLocalData();
		
		$(".tz_box").click(function(){
			pathToWords();
		});
		
		$(".list_con").on("click","img",function(){
			var attachmentUrl = this.getAttribute("data-attachmentUrl");
			imageShow(attachmentUrl);
		});
		
//		$("body").on("click",".bt_fs_yes",function(){
//			dealComplete(this);
//		});
//		
//		$("body").on("click",".bt_fs_no",function(){
//			dealComplete(this);
//		});
		
		$("body").on("click",".bt_fs_no",function(){
			dealComplete();
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
			if(storage.getLocalStorage("homeworkobj_"+nu)){
				tempValue = genHomeworkDetail(JSON.parse(storage.getLocalStorage("homeworkobj_"+nu)));
				$(".list_con").html(tempValue);  //展示内容
				toast.hideLoadToast();
			}
			
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/par/homework/detailGet",
					{
						userId:userId,
						cropId:cropId,
						nu:nu
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							var tempValue = '';
							storage.deleteLocalStorage("homeworkobj_"+nu);
							storage.setLocalStorage("homeworkobj_"+nu,JSON.stringify(result));
							tempValue = genHomeworkDetail(result);
							$(".list_con").html(tempValue);  //展示内容
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("homeworkobj_"+nu);
		}
	}
	
	/**
	 * 生成作业详细页面
	 */
	function genHomeworkDetail(homeworkObj){
		$("#senderName").val(homeworkObj.senderName);
		$("#senderUUid").val(homeworkObj.senderUUid);
		$("#classCode").val(homeworkObj.classCode);
		var tmpStr = '<div class="from">'+
					 '<div class="title fl" style="width:45%;">'+homeworkObj.subject+'作业</div>'+
					 '<div class="time fl tr" style="width:55%;">'+homeworkObj.senderName+' '+homeworkObj.createTime+'</div>'+
					 '</div>'+
					 '<div class="list_tit">'+homeworkObj.content;
					 if(homeworkObj.attachmentList){
						 var picClass = "";
						 if(homeworkObj.attachmentList.length == 1){
							 picClass = "list_pic_y";
						 }else if(homeworkObj.attachmentList.length == 4){
							 picClass = "list_pic_4";
						 }else{
							 picClass = "list_pic_more"
						 }
						 tmpStr += '<div class="'+picClass+'">';
						 if(homeworkObj.attachmentList.length == 1){
							 var homeworkAttachment = homeworkObj.attachmentList[0];
							 tmpStr += '<a href="javascript:;" ><span><img onload="imgPreDeal(this);"  data-attachmentUrl="'+homeworkAttachment.attachmentUrl+'"  src="'+homeworkAttachment.attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
						 }else{
							 for(var i=0;i<homeworkObj.attachmentList.length;i++){
								var homeworkAttachment = homeworkObj.attachmentList[i];
								if(homeworkAttachment.attachmentType == 1){
									tmpStr += '<a href="javascript:;" ><span><img onload="winFixImg(this);"  data-attachmentUrl="'+homeworkAttachment.attachmentUrl+'"  src="'+homeworkAttachment.attachmentUrl+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
								}
							 } 
						 }
						 tmpStr += '</div>';
					 }
			tmpStr += '</div>';
			if(homeworkObj.isComplete == 1){
				tmpStr += '<a href="javascript:;" class="bt_fs_yes"><i></i>已完成</a>';
			}else{
				tmpStr += '<a href="javascript:;" class="bt_fs_no"><i></i>确认完成作业</a>';
			}
			
//					  '<div><p class="state">';
//					  if(homeworkObj.isComplete == 1){
//						  tmpStr += '<span name="list_state_name">已完成</span>'+
//						  			'<span class="bt_fs_yes">'+
//						  			'<a name="noSelect" class="sel" href="javascript:;">NO</a>'+
//					      			'<a name="yesSelect" href="javascript:;">YES</a>'+
//					      			'</span>';
//					  }else{
//						  tmpStr += '<span name="list_state_name">未完成</span>'+
//						  			'<span class="bt_fs_no" >'+
//						  			'<a name="noSelect"  href="javascript:;">NO</a>'+
//					        		'<a name="yesSelect" class="sel" href="javascript:;">YES</a>'+
//					        		'</span>';
//					  }
//					  tmpStr += '</p></div>';
			return tmpStr;
	}
	
	
	/**
	 * 完成作业状态变更
	 * @param obj
	 */
	function dealComplete(){
		//修改状态
		var noticeUnique = $("#nu").val();
		//向服务器提交处理请求
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		$.post(common.ctx+"/wap/par/homework/complete",
			{
				flag:1,
				uuid:userId,
				cropId:cropId,
				noticeUnique:noticeUnique
			},
			function(result){
				if(common.verifyToken(result,cropId)){
					if(result == 'true'){
						$(".bt_fs_no").addClass("bt_fs_yes").removeClass("bt_fs_no");
					}else{
						tip.openAlert1("提示","处理失败");
					}
				}
			});
	}
	
	/**
	 * 跳转至家长留言发送
	 */
	function pathToWords(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var classCode = $("#classCode").val();
		var senderUUid = $("#senderUUid").val();
		var senderName = $("#senderName").val();
		var nu = $("#nu").val();
		
		var homeworkObj = JSON.parse(storage.getLocalStorage("homeworkobj_"+nu));
		
		var teaObj = {
				userId:senderUUid,
				icon:homeworkObj.senderIcon,
				phone:"",
				name:senderName,
				followed:1,
				targetUserType:1
			}
		storage.setSessionStorage("paramValue",JSON.stringify(teaObj));
		
		document.location.href = common.ctx+"/wap/html/words/words_par_edit.html?classCode="+classCode+"&targetUuid="+senderUUid+"&targetName="+senderName+"&cropId="+cropId+"&userId="+userId+"&funcType=2&funUniq="+nu;
	}
	
	/**
	 * 图片预览
	 */
	function imageShow(imageUrl){
		var imgArr = $(".list_tit").find("img");
		var urlArr = new Array();
		for(var i = 0;i<imgArr.length;i++){
			urlArr[i] = imgArr[i].src;
		}
		wxApi.previewImage(imageUrl,urlArr);
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});