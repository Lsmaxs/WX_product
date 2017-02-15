/**
 * author:Mud Butterfly
 * data:2015-11-6
 */
define(function(require, exports, module) {
	
	var globalVal={
			pickUpFlag:false,
			page0:1,
			page1:1,
			page_flag:0
	};
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var common = require('common');
	var toast = require('widget/toast');
	var tip = require('widget/tip');
	var storage = require('storage');
	var wxApi = require('wxApi');
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	function init(){
		common.fclog('WXQJ');
		//获取参数信息
		var cropId = common.getUrlParam("cropId");
		var userId = common.getUrlParam("userId");
		var type = common.getUrlParam("type");
		var isParent = common.getUrlParam("isParent");
		var schoolCode = common.getUrlParam("schoolCode");
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		if(type==2 || isParent==1){
			isParent = 1;
		}else{
			type = 1;
			isParent = 0;
		}
		
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#type").val(type);
		$("#isParent").val(isParent);
		$("#schoolCode").val(schoolCode);
		
		$("#no_data_page").show();
		$("#unconfirmedDiv").hide();
		$("#confirmedDiv").hide();
		loadLocalData('unconfirmedDiv','待处理',0);
		loadLocalData('confirmedDiv','已处理',1);
		globalVal.pickUpFlag = true;  //允许下拉
		dataPaging();
		
		if(isParent){
			$(".Leave_tit").show();
			$(".tz_box").show();
		}else{
			$(".Leave_tit").hide();
			$(".tz_box").hide();
		}

		
		$("#teacherSendQingjiaHref").click(function(){
			goSelectTeacher(1);
		});
		
		$("#tipOk").click(function(){
			showInput();
		});
		
		$('#teaSentQingjias').click(function(){
			goNoticeList(2);
		});
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLocalData(divId,head,flag){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		try{
			var tempValue = '';
			//从localStorage加载数据
			if(storage.getLocalStorage("qingjialist_tea_"+cropId+"_"+userId+"_"+flag)){
				tempValue = genReceiveList(JSON.parse(storage.getLocalStorage("qingjialist_tea_"+cropId+"_"+userId+"_"+flag)),flag);
				if(tempValue.length > 0){
					$("#no_data_page").hide();
					$("#"+divId).html('<div class="Leave_line"> <b>'+head+'</b> </div>'+tempValue);  //展示内容
					$("#"+divId).show();
				}
				addConfirmBox();//由于数据是动态加载的，故需主动给批假按钮加上弹出框事件
				toast.hideLoadToast();
			}
	
			//向服务端加截初始化数据（期间不允许下拉操作）
			$.post(common.ctx+"/wap/tea/qingjia/list/1"+"?tmp="+(new Date()).getTime(),
					{
						userId:userId,
						cropId:cropId,
						flag:flag
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){  //请求成功
								storage.deleteLocalStorage("qingjialist_tea_"+cropId+"_"+userId+"_"+flag);
								storage.setLocalStorage("qingjialist_tea_"+cropId+"_"+userId+"_"+flag,JSON.stringify(result.items));
								var tempValue = genReceiveList(result.items,flag);
								
								if(tempValue.length > 0){
									$("#no_data_page").hide();
									$("#"+divId).html('<div class="Leave_line"> <b>'+head+'</b> </div>'+tempValue);  //展示内容
									$("#"+divId).show();
								}
		
							}
							addConfirmBox();//由于数据是动态加载的，故需主动给批假按钮加上弹出框事件
							toast.hideLoadToast();
						}
					}
				);
			

			$("body").on("click","a[name='confirmYesHref']",function(){
				confirmLeave(1,$(this).attr("msgid"));
			});
			
		}catch(e){
			storage.deleteLocalStorage("qingjialist_tea_"+cropId+"_"+userId+"_"+flag);
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
						$.post(common.ctx+"/wap/tea/qingjia/list/"+(globalVal.page0+1),
								{
									userId:userId,
									cropId:cropId,
									flag:0
								},
								function(result){//未处理
									if(common.verifyToken(result,cropId)){
										if(result.resultCode == '001' && result.items && result.items.length > 0){  //请求成功
											globalVal.page0 = globalVal.page0+1;
											var tempValue = genReceiveList(result.items,0);
											$("#unconfirmedDiv").append(tempValue);  //展示内容
											globalVal.page_flag = 0;
										}else{  //没有下一页
											globalVal.page_flag = 2;
										}
										addConfirmBox();//由于数据是动态加载的，故需主动给批假按钮加上弹出框事件
									}
								}
							);
						$.post(common.ctx+"/wap/tea/qingjia/list/"+(globalVal.page1+1),
								{
									userId:userId,
									cropId:cropId,
									flag:1
								},
								function(result){//已处理
									if(common.verifyToken(result,cropId)){
										if(result.resultCode == '001' && result.items && result.items.length > 0){  //请求成功
											globalVal.page1 = globalVal.page1+1;
											var tempValue = genReceiveList(result.items,1);
											$("#comfirmedDiv").append(tempValue);  //展示内容
											globalVal.page_flag = 0;
										}else{  //没有下一页
											globalVal.page_flag = 2;
										}
										addConfirmBox();//由于数据是动态加载的，故需主动给批假按钮加上弹出框事件
									}
								}
							);
					}
				}
			}	
			

			$("body").on("click","a[name='confirmYesHref']",function(){
				confirmLeave(1,$(this).attr("msgid"));
			});
			
			
		});
	}
	
	
	function getLastTimeStr(last){
		if(last!=null && last.length>0){
			try{
				//n天n小时，需用到换行样式
				if(last.indexOf("天") != -1 && last.indexOf("小时") != -1){
					var day = last.split("天")[0];
					var hour = last.split("天")[1].split("小时")[0];
					last = '<span class="th2"><b>' + day +'</b>天<br/><b>' + hour +'</b>小时</span></p>';
				}else if(last.indexOf("天") != -1){
					var day = last.split("天")[0];
					last = '<span class="th1"><b>' + day +'</b>天</span></p>';
				}else if(last.indexOf("小时") != -1){
					var hour = last.split("小时")[0];
					last = '<span class="th1"><b>' + hour +'</b>小时</span></p>';
				}
			}catch(e){
				
			}
		}
		return last;
	}
	
	/**
	 * 收-列表html
	 */
	function genReceiveList(noticeList,flag){
		
		var tmpStr = '';
		if(flag == 0){//未处理
			if(noticeList){
				for(var i=0;i<noticeList.length;i++){
					tmpStr += '<div class="Leave_box1">';
					tmpStr += '<div class="list_from">';
					tmpStr += '    <div class="title1 fl"><img src="'+noticeList[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+noticeList[i].parName+'<br /><b>'+noticeList[i].stuName+' 家长</b></div>';
					tmpStr += '    <div class="time fl tr">'+noticeList[i].createTime+'</div>';
					tmpStr += '</div>';
					tmpStr += '<div class="Leave_list">'+noticeList[i].content;
					tmpStr += '    <p>开始时间：'+noticeList[i].startTime+'<br />结束时间：'+noticeList[i].endTime;
					tmpStr += getLastTimeStr(noticeList[i].number);
					tmpStr += '</div>';
					tmpStr += '<div class="Leave_state">';
					tmpStr += '    <div class="bt"><a msgid="'+noticeList[i].leaveUnique+'" name="confirmYesHref" href="javascript:;">批准</a><a href="javascript:void(0)" msgid="'+noticeList[i].leaveUnique+'" class="cd-popup-trigger">不批准</a></div>';
					tmpStr += '</div>';
					tmpStr += '</div>';
				}
			}
		}else if(flag == 1){//已处理
			if(noticeList){
				for(var i=0;i<noticeList.length;i++){
					tmpStr += '<div class="Leave_box1">';
					tmpStr += '<div class="list_from">';
					tmpStr += '    <div class="title1 fl"><img src="'+noticeList[i].icon+'"  onerror="javascript:this.src=\'../../images/user_pace.png\'" />'+noticeList[i].parName+'<br /><b>'+noticeList[i].stuName+' 家长</b></div>';
					tmpStr += '    <div class="time fl tr">'+noticeList[i].createTime+'</div>';
					tmpStr += '</div>';
					tmpStr += '<div class="Leave_list">'+noticeList[i].content;
					tmpStr += '    <p>开始时间：'+noticeList[i].startTime+'<br />结束时间：'+noticeList[i].endTime;
					tmpStr += getLastTimeStr(noticeList[i].number);
					tmpStr += '</div>';
					tmpStr += '<div class="Leave_state">';
					if(noticeList[i].state==2 || noticeList[i].state=='2')
						tmpStr += '    <div class="reftext_t"><span class="nopass_t">不批准</span>'+noticeList[i].dealTime+'<p>'+noticeList[i].reason+'</p></div>';
					else if(noticeList[i].state==1 || noticeList[i].state=='1')
						tmpStr += '		<div class="reftext_t"><span class="pass_t">已批准</span>'+noticeList[i].dealTime+'</div>';
					tmpStr += '</div>';
					tmpStr += '</div>';
				}
			}
		}
		return tmpStr;
		
	}
	
	
	function addConfirmBox(){
		$('.cd-popup-trigger').off('click');
		$('.cd-popup').off('click');
		$('.cd-popup-trigger').on('click', function(event){
			var id = $(this).attr("msgid");
			event.preventDefault();
			$('.cd-popup').addClass('is-visible');
			
			$('#tipBox').hide();
	
			$('#reasonOk').on('click',function(event){
				event.preventDefault();
				confirmLeave(2,id);
			});
			$('#reason').val('');
			
			$('#tipOk').on('click',showInput());
			
		});
		
		//close popup
		$('.cd-popup').on('click', function(event){
			if( $(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') ) {
				event.preventDefault();
				$(this).removeClass('is-visible');
			}
		});
		//close popup when clicking the esc keyboard button
		$(document).keyup(function(event){
	    	if(event.which=='27'){
	    		$('.cd-popup').removeClass('is-visible');
		    }
	    });
	}
	
	
	function showInput(){
		$('#resonBox').show();
		$('#tipBox').hide();
	}
	
	/**
	 * 获取当前时间
	 * @returns {String}
	 */
	function GetDateT()
	{
		var d,s;
		d = new Date();
		s = d.getYear() + "-";             //取年份
		s = s + (d.getMonth() + 1) + "-";//取月份
		s += d.getDate() + " ";         //取日期
		s += d.getHours() + ":";       //取小时
		s += d.getMinutes();    //取分
	  
		return(s);  
	} 
	
	/**
	 * 批假
	 * @param state 1通过   2不通过
	 */
	function confirmLeave(state,leaveId){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var reason = $('#reason').val();

		var type = $("#type").val();
		var isParent = $("#isParent").val();
		var schoolCode = $("#schoolCode").val();
		
		reason = common.filterXss(reason);
		
		if(state==2 && reason==''){
			//隐藏原弹出框
			$('#resonBox').hide();
			$('#tipBox').show();
		}
		else
			$.post(common.ctx+"/wap/tea/qingjia/confirm",
				{
					reason:reason,
					cropId:cropId,
					userId:userId,
					state:state,
					leaveId:leaveId
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						if(result.resultCode == "001"){
							tip.openAlert1("提示","请假已处理");
							$('#tipOk').attr("href",
									common.ctx + '/wap/html/qingjia/qingjia_tea_list.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&isParent="+isParent+"&schoolCode="+schoolCode+"&tmp="+(new Date()).getTime() );
							storage.deleteLocalStorage("qingjialist_tea_"+cropId+"_"+userId+"_0");
							
							location.reload();
							
						}else{
							tip.openAlert1("提示","处理失败，请重新发送");
						}
					}
				}
			);
	}
	
	
	/**
	 * 跳转至已收/已发列表
	 * @param type 1已收  2已发
	 */
	function goNoticeList(type){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var isParent = $("#isParent").val();
		var schoolCode = $("#schoolCode").val();
		if(type==2)
			document.location.href = common.ctx + '/wap/html/qingjia/qingjia_tea_sentlist.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&isParent="+isParent+"&schoolCode="+schoolCode;
		else
			document.location.href = common.ctx + '/wap/html/qingjia/qingjia_tea_list.html?cropId='+cropId+"&userId="+userId+"&type="+type+"&isParent="+isParent+"&schoolCode="+schoolCode;
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

});