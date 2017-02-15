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
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证

		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#nu").val(nu);

		loadLocalData();
		
		$("body").on("click",".tz_box",function(){
			MtaH5.clickStat('jxhd_notice_tea_words');
			pathToWords();
		});
		
		$(".list_con").on("click","#readPenson",function(){
			$($(this).find("span")[0]).toggleClass("dy_more").toggleClass("dy_some");
			$("#readPensonList").slideToggle(300);
		});
		
		$(".list_con").on("click","#unReadPenson",function(){
			$($(this).find("span")[1]).toggleClass("dy_more").toggleClass("dy_some");
			$("#unReadPensonList").slideToggle(300);
		});
		
		$(".tz_box1").on("click","#urp_selectall",function(){
			selectAll($(this).find("span")[0]);
			return false;
		});
		
		$(".list_con").on("click","p[name='opChecked']",function(){
			opChecked(this);
		});
		
		$(".list_con").on("click","a[name='onPhone']",function(e){
			e.stopPropagation();
		});
		
		$(".tz_box1").on("click",".send_mess",function(){
			MtaH5.clickStat('jxhd_notice_tea_sendagain');
			sendAgain();
		});
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLocalData(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var nu = $("#nu").val();
		var tempValue = '';
		//从localStorage加载数据
		if(storage.getLocalStorage("noticedetail_1_"+nu)){
			tempValue = genReadList(JSON.parse(storage.getLocalStorage("noticedetail_1_"+nu)));
			$(".list_con").html(tempValue);  //展示内容
			toast.hideLoadToast();
		}
	}
	
	/**
	 * 生成通知详细html
	 * @param noticeObj
	 * @param type
	 */
	function genReadList(noticeObj){
		var tmpStr = '';
		var readList = noticeObj.readList;
		var unReadList = noticeObj.unReadList;
		if(!unReadList || unReadList.length==0){
			$(".tz_box1").hide();
		}
		tmpStr += '<div class="list_state" style="border:none">';
		//已读
		tmpStr += '<div id="readPenson" class="photo_m"  style="background:#f0f0f0; border-bottom:1px solid #e0e0e0;">'+
					'<div class="float_l">已读<b>（'+readList.length+'人）</b></div>'+
					'<span class="dy_more">&nbsp;</span>'+
				'</div>'+
				'<div id="readPensonList" class="tz-list" style="display:none">'+
				'<ul class="ul-over">';
		for(var i=0;i<readList.length;i++){
			tmpStr += '<li>'+readList[i].name+'</li>';
		}
		tmpStr += '</ul></div>';
		//未读
		tmpStr += '<div id="unReadPenson" class="photo_m" style="background:#f0f0f0">'+
				'<div class="float_l"><span class="op-check" style="display:none"></span>未读<b>（'+unReadList.length+'人）</b></div>'+
				'<span class="dy_some">&nbsp;</span>'+
			'</div>'+
			'<div id="unReadPensonList" class="tz-list" style="display:">';
		for(var i=0;i<unReadList.length;i++){
			/*
			tmpStr += '<p name="opChecked"><a href="javascript:;" class="operate-btn1">'+
					'<span class="op-check"><input type="hidden" name="userInfo" value="'+unReadList[i].suuid+'"/></span>'+
					unReadList[i].name+'<span class="address_cont"><a name="onPhone" href="tel:'+unReadList[i].phone+'"><img src="../../images/ico_phone.png" /></a></span>'+
				'</a></p>';
			*/
			tmpStr += '<p name="opChecked"><a href="javascript:;" class="operate-btn1">'+
				'<span class="op-check"><input type="hidden" name="userInfo" value="'+unReadList[i].suuid+'"/></span>'+unReadList[i].name+'</a>'+
				'<span class="address_cont"><a name="onPhone" href="tel:'+unReadList[i].phone+'"><img src="../../images/ico_phone.png" /></a></span></p>'
		}
		tmpStr += '</div>';
		tmpStr += '</div>';
		return tmpStr;
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
									tip.openAlert1("提示","发送成功",function(){
										document.location.href = common.ctx + '/wap/html/notice/notice_tea_detail.html?cropId='+cropId+"&userId="+userId+"&type=1&nu="+nu+"&ADTAG="+storage.getSessionStorage("adtag");
									});
									//sendFlag = 2;
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
		}
		/*else if(sendFlag == 2){
			tip.openAlert1("提示","消息已发送过");
		}*/
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

	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});
