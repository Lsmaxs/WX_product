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
		var selectDate = common.getUrlParam("selectDate");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		if(!selectDate){
			selectDate = common.getDate();
		}
		$("#selectDate").val(selectDate);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadTopBar();
		loadLoadData();
		
		$(".list_con").on("click",".content_body",function(){
			var homeworkNu = $(this).find(".homeworkNu")[0].value;
			goHomeworkDetail(homeworkNu);
		});
		
		$(".date-wrap").on("change","#dateSelect",function(){
			doSelectDate(userId,cropId);
		});
		
		$(".list_con").on("click","img",function(){
			var imageUrl = this.getAttribute("data-imageUrl");
			imageShow(this,imageUrl);
			return false;
		});
		
	}
	
	/**
	 * 加载顶部条栏
	 */
	function loadTopBar(){
		var selectDate = $("#selectDate").val();
		var tempStr = '<div class="date_tit" style="position: relative;margin-top:10px" ><span id="showDate">'+selectDate+'</span>'+
					  '<span class="date_tit_span" >选择日期</span>'+
					  '<select id="dateSelect" style="opacity:0;width: 100%;height: 100%;position: absolute;left: 0;top: 0;" >';
					  if(common.getDate() == selectDate){
						  tempStr += '<option value="'+common.getDate()+'" selected="selected" >今天</option>';
					  }else{
						  tempStr += '<option value="'+common.getDate()+'">今天</option>';
					  }
					  if(common.getDate(1) == selectDate){
						  tempStr += '<option value="'+common.getDate(1)+'" selected="selected" >昨天</option>'
					  }else{
						  tempStr += '<option value="'+common.getDate(1)+'">昨天</option>';
					  }
					  if(common.getDate(2) == selectDate){
						  tempStr += '<option value="'+common.getDate(2)+'" selected="selected" >前天</option>';
					  }else{
						  tempStr += '<option value="'+common.getDate(2)+'">前天</option>';
					  }
					  tempStr += '</select></div>';
		$(".date-wrap").prepend(tempStr);
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLoadData(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var selectDate = $("#selectDate").val();
		
		$.post(common.ctx+"/wap/par/homework/listGet",
				{
					userId:userId,
					cropId:cropId,
					selectDate:selectDate
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						var tempValue = genHomeworkList(result);
						$(".list_con").html(tempValue);  //展示内容
						pickUpFlag = false;  //不允许下拉
						toast.hideLoadToast();
					}
				}
			);
	}
	
	/**
	 * 生成数据html
	 */
	function genHomeworkList(homeworkList){
		var tmpStr = '';
	    if(homeworkList.isToday == 0){
	    	$(".point_box").show();
	    }else{
	    	$(".point_box").hide();
	    }
	    if(homeworkList.items && homeworkList.items.length > 0){
			if(homeworkList.isToday == 0){
				$("#no_data_page").show();
				tmpStr += '<div class="point_last"> <b>上一次的的作业情况</b> </div>'+
				  '<div class="last_time"><b>'+homeworkList.sendDay+'</b></div>';
			}
			for(var i=0;i<homeworkList.items.length;i++){
				tmpStr += '<div class="list_box">'+
				  '<div class="content_body" >'+
				  '<input type="hidden" class="homeworkNu" value="'+homeworkList.items[i].nu+'" />'+
				  '<div class="list_from">'+
				  '<div class="title fl">'+homeworkList.items[i].subject+'作业</div>'+
				  '<div class="time fl tr">'+homeworkList.items[i].sendName+'(老师)</div>'+
				  '</div>'+
				  '<div class="list_tit">'+homeworkList.items[i].content;
				  if(homeworkList.items[i].imageUrls){
					  var picClass = "";
					  if(homeworkList.items[i].imageUrls.length == 1){
						 picClass = "list_pic_y";
					  }else if(homeworkList.items[i].imageUrls.length == 4){
						 picClass = "list_pic_4";
					  }else{
						 picClass = "list_pic_more"
					  }
					  tmpStr += '<div class="'+picClass+'">';
					  if(homeworkList.items[i].imageUrls.length == 1){
						  tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" data-imageUrl="'+homeworkList.items[i].imageUrls[0]+'" src="'+homeworkList.items[i].imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
					  }else{
						  for(var j=0;j<homeworkList.items[i].imageUrls.length;j++){
							  tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" data-imageUrl="'+homeworkList.items[i].imageUrls[j]+'" src="'+homeworkList.items[i].imageUrls[j]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
						  }
					  }
					  tmpStr += '</div>';
				  }
				  tmpStr += '</div></div><div class="list_state">';
				  if(homeworkList.items[i].isComplete == 1){
					  tmpStr += '<span name="list_state_name" class="fs_yes" >已完成</span>';
				  }else{
					  tmpStr += '<span name="list_state_name" class="fs_no" >未完成</span>';
				  }
				  tmpStr += '</div></div>';
			}
		}
	    return tmpStr;
		
	}
	
	/**
	 * 完成作业状态变更
	 * @param obj
	 */
	function dealComplete(obj,noticeUnique,ctx){
		//修改状态
		var temp = $(obj);
		var flag = -1;
		if(temp.attr("class") == 'bt_fs_yes'){  //设置为未完成
			flag = 0;
		}else if(temp.attr("class") == 'bt_fs_no'){  //设置为已完成  
			flag = 1;
		}
		//向服务器提交处理请求
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		$.post(common.ctx+"/wap/par/homework/complete",
			{
				flag:flag,
				uuid:userId,
				cropId:cropId,
				noticeUnique:noticeUnique
			},
			function(result){
				if(common.verifyToken(result,cropId)){
					if(result == 'true'){
						if(flag == 0){
							temp.find("[name='noSelect']").removeClass("sel");
							temp.find("[name='yesSelect']").addClass("sel");
							temp.attr("class","bt_fs_no");
							temp.parent().find("[name='list_state_name']").html('未完成');
							
						}else if(flag == 1){
							temp.find("[name='yesSelect']").removeClass("sel");
							temp.find("[name='noSelect']").addClass("sel");
							temp.attr("class","bt_fs_yes");
							temp.parent().find("[name='list_state_name']").html('已完成');
						}
					}else{
						tip.openAlert1("提示","处理失败");
					}
				}
			});
	}
	
	/**
	 * 日期选择
	 * @param ctx
	 * @param url
	 * @param userId
	 * @param cropId
	 */
	function doSelectDate(userId,cropId){
		var selectDate = $("#dateSelect").val();
		document.location.href = common.ctx+"/wap/html/homework/homework_par_list.html?userId="+userId+"&cropId="+cropId+"&selectDate="+selectDate;
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
	 * 跳转至作业详细
	 * @param nu
	 */
	function goHomeworkDetail(nu){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		document.location.href = common.ctx+'/wap/html/homework/homework_par_detail.html?userId='+userId+'&nu='+nu+'&cropId='+cropId;
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});