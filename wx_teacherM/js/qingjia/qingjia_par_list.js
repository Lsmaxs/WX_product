/**
 * author:fan
 * data:2015-11-06
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
	
	function init(){
		common.fclog('WXQJ');
		var cropId = common.getUrlParam("cropId");
		var userId = common.getUrlParam("userId");
		var schoolCode = common.getUrlParam("schoolCode");
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#schoolCode").val(schoolCode);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		loadLocalData();
		dataPaging();
		
		$(".Leave_state").on("click","img",function(){
			var url = $(this).attr("src");
			imageShow(this,url);
			return false;
		});
		
		$("#parentSendQingjiaHref").click(function(){
			goSelectTeacher(0);
		});
		
		$("#teacherSendQingjiaHref").click(function(){
			goSelectTeacher(1);
		});
		
		$('#teaReceivedQingjias').click(function(){
			goNoticeList(1);
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
			if(storage.getLocalStorage("qingjialist_"+cropId+"_"+userId)){
				tempValue = getQingJiaList(JSON.parse(storage.getLocalStorage("qingjialist_"+cropId+"_"+userId)));
				if(tempValue.length > 0){
					$("#no_data_page").hide();
					$(".Leave_con").html(tempValue);  //展示内容
					//显示时间轴的背景灰线
					$("body").css("background","url(../../images/line.gif) repeat-y #ebebeb");
				}else{
					$("#no_data_page").show();
					//隐藏时间轴的背景灰线
					$("body").css("background","#ebebeb");
				}
				toast.hideLoadToast();
			}
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/par/qingjia/list/1",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '0001'){  //请求成功
								storage.deleteLocalStorage("qingjialist_"+cropId+"_"+userId);
								storage.setLocalStorage("qingjialist_"+cropId+"_"+userId,JSON.stringify(result.items));
								var tempValue = getQingJiaList(result.items);
								if(tempValue.length > 0){
									$("#no_data_page").hide();
									$(".Leave_con").html(tempValue);  //展示内容
									//显示时间轴的背景灰线
									$("body").css("background","url(../../images/line.gif) repeat-y #ebebeb");
								}else{
									$("#no_data_page").show();
									//隐藏时间轴的背景灰线
									$("body").css("background","#ebebeb");
								}
								
								globalVal.pickUpFlag = true;  //允许下拉
							}
							toast.hideLoadToast();
						}
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("qingjialist_"+cropId+"_"+userId);
		}
		
	}
	
	/**
	 * 分页查询数据
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
						$.post(common.ctx+"/wap/par/qingjia/list/"+(globalVal.page+1),
								{
									userId:userId,
									cropId:cropId
								},
								function(result){
									if(common.verifyToken(result,cropId)){
										if(result.resultCode == '0001' && result.items && result.items.length > 0){  //请求成功
											globalVal.page = globalVal.page+1;
											var tempValue = getQingJiaList(result.items);
											$(".Leave_con").append(tempValue);  //展示内容
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
	
	function getLastTimeStr(last){
		if(last!=null && last.length>0){
			try{
				//n天n小时，需用到换行样式
				if(last.indexOf("天") != -1 && last.indexOf("小时") != -1){
					var day = last.split("天")[0];
					var hour = last.split("天")[1].split("小时")[0];
					last = '<span class="th2"><b>' + day +'</b>天<br/><b>' + hour +'</b>小时</span></p></div>';
				}else if(last.indexOf("天") != -1){
					var day = last.split("天")[0];
					last = '<span class="th1"><b>' + day +'</b>天</span></p></div>';
				}else if(last.indexOf("小时") != -1){
					var hour = last.split("小时")[0];
					last = '<span class="th1"><b>' + hour +'</b>小时</span></p></div>';
				}
			}catch(e){
				
			}
		}
		return last;
	}
	
	/**
	 * 生成请假列表html
	 */
	function getQingJiaList(qingjiaList){
		
		var tmpStr = '';
		if(qingjiaList){
			for(var i=0;i<qingjiaList.length;i++){
				tmpStr +=' <div class="Leave_time"><span></span>'+qingjiaList[i].createTime+'</div>'+
						 '<div class="Leave_box">'+
						 '<div class="Leave_list">'+qingjiaList[i].content+' <p>开始时间：'+getTimeStr(qingjiaList[i].leaveStartTime, qingjiaList[i].weekStart)+
						 '<br />结束时间：'+getTimeStr(qingjiaList[i].leaveEndTime, qingjiaList[i].weekEnd)+
						 getLastTimeStr(qingjiaList[i].number)+
						 '<div class="Leave_state"><div class="face_pic fl"><img src="'+qingjiaList[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></div>';
				if(qingjiaList[i].state == 0){
					tmpStr +='<div class="Wait"><span></span>老师未处理</div> </div></div>';
				}else if(qingjiaList[i].state == 1){
					tmpStr +=' <div class="pass"><span></span>已批准</div> <div class="reftime"> '+qingjiaList[i].dealTime+'</div></div></div>';
				}else if(qingjiaList[i].state == 2){
					tmpStr +=' <div class="refuse"><span></span>不批准</div> <div class="reftime">'+qingjiaList[i].dealTime+'</div><div class="reftext">'+qingjiaList[i].reason+'</div> </div></div>';
				}
			}
		}
		
		return tmpStr;
		
	}
	
	/**
	 * 以固定格式组装时间
	 * @param time
	 * @param week
	 * @returns 2015-10-16（星期一）08:00
	 */
	function getTimeStr(time,week){
		var a = time.split(" ");
		return a[0]+" ("+week+") "+a[1];
	} 
	
	/**
	 * 跳转至选择老师
	 */
	function goSelectTeacher(iAmTeacher){
		var isTeacher = 0;
		if(iAmTeacher==1)
			isTeacher = 1;
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var schoolCode = $("#schoolCode").val();
		document.location.href = common.ctx + '/wap/html/qingjia/par_send_tagetlist.html?cropId='+cropId+"&userId="+userId+"&isTeacher="+isTeacher+"&schoolCode="+schoolCode;
	}


	function goNoticeList(type){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var schoolCode = $("#schoolCode").val();
		if(type==2)
			document.location.href = common.ctx + '/wap/html/qingjia/qingjia_tea_sentlist.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&isParent=1&schoolCode="+schoolCode;
		else
			document.location.href = common.ctx + '/wap/html/qingjia/qingjia_tea_list.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&isParent=1&schoolCode="+schoolCode;
	}

});