/**
 * author:haobiao
 * data:2016-04-13
 */
define(function(require, exports, module) {
	
	var globalVal={
			pickUpFlag:true,
			page0:1,
			page1:0,
			page0_flag:0,
			page1_flag:0,
			pageSize:5
	};
	
	var onDealCount = 0;
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var common = require('common');
	var toast = require('widget/toast');
	var tip = require('widget/tip');
	var storage = require('storage');
	var wxApi = require('wxApi');
	
	var confimPass = 0;
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	function init(){
		common.fclog('WXLY');
		//获取参数信息
		var cropId = common.getUrlParam("cropId");
		var userId = common.getUrlParam("userId");
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		$("#no_data_page").hide();
		$("#unDealwithDiv").hide();
		$("#dealwithDiv").hide();
		
		getCountOfTeaApply(userId, cropId);
		loadLocalData('unDealwithDiv','待处理',0);
		loadLocalData('dealwithDiv','已处理',1);
		globalVal.pickUpFlag = true;  //允许下拉
		dataPaging();
	}
	
	/**
	 * 加截本地数据
	 */
	function loadLocalData(divId, head, flag){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		try{
			var tempValue = '';
			//从localStorage加载数据
			/*if(storage.getLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag)){
				tempValue = getDataList(JSON.parse(storage.getLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag)), flag);
				if(tempValue.length > 0){
					$("#no_data_page").hide();
					if(flag == 0){
						$("#"+divId).html('<div class="dy_line"> <b><em id="undealCount">'+onDealCount+'</em>条未处理</b></div>' + tempValue);  //展示内容
					}else if(flag == 1){
						$("#"+divId).html('<div class="dy_line"> <b>已处理</b></div>' + tempValue);  //展示内容
					}
					$("#"+divId).show();
				}
				toast.hideLoadToast();
			}*/
	
			//向服务端加截初始化数据（期间不允许下拉操作）
			if(flag == 0){
				$.post(common.ctx+"/wap/tea/linkman/joinAskList/1"+"?tmp="+(new Date()).getTime(),
					{
						userId:userId,
						corpId:cropId,
						state:flag
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							console.log("未处理第1页，数据长度："+result.items.length);
							if(result.resultCode == '001'){  //请求成功
								globalVal.pageSize = result.items.length;
								//storage.deleteLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag);
								//storage.setLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag,JSON.stringify(result.items));
								var tempValue = getDataList(result.items, flag);
								if(tempValue.length > 0){
									$("#"+divId).html('<div class="dy_line"> <b><em id="undealCount">'+onDealCount+'</em>条未处理</b></div>'+tempValue);  //展示内容
									$("#"+divId).show();
								}
							}
							toast.hideLoadToast();
						}
					}
				);
			}else if(flag == 1 ){
				$.post(common.ctx+"/wap/tea/linkman/joinAskList/1"+"?tmp="+(new Date()).getTime(),
					{
						userId:userId,
						corpId:cropId,
						state:flag
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							console.log("已处理第1页，数据长度："+result.items.length);
							if(result.resultCode == '001'){  //请求成功
								globalVal.page1 = globalVal.page1 + 1;
								//storage.deleteLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag);
								//storage.setLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag,JSON.stringify(result.items));
								var tempValue = getDataList(result.items, flag);
								if(tempValue.length > 0){
									$("#"+divId).html('<div class="dy_line"> <b>已处理</b></div>'+tempValue);  //展示内容
									$("#"+divId).show();
								}
							}
							toast.hideLoadToast();
						}
					}
				);
			}

			$("body").on("click","a[name='passJoin']",function(){
				confirmApply(1, $(this).attr("joinId"));
			});
			$("body").on("click","a[name='noPassJoin']",function(){
				confirmApply(0, $(this).attr("joinId"));
			});
		}catch(e){
			//storage.deleteLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_"+flag);
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
				//var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
		        //var dbHiht = $("body").height();         //页面(约等于窗体)高度/单位px
		        //if(srollPos+700 >= dbHiht){	
		        	var cropId = $("#cropId").val();
					var userId = $("#userId").val();
					
		        	if(globalVal.page0_flag == 0){ 
		        		globalVal.page0_flag = 1;
		        		$.post(common.ctx+"/wap/tea/linkman/joinAskList/"+(globalVal.page0+1),
							{
								userId:userId,
								corpId:cropId,
								state:0
							},
							function(result){//未处理
								if(common.verifyToken(result,cropId)){
									console.log("未处理第"+(globalVal.page0+1)+"页，数据长度："+result.items.length);
									if(result.resultCode == '001' && result.items && result.items.length > 0){//请求成功
										globalVal.page0 = globalVal.page0+1;
										var tempValue = getDataList(result.items, 0);
										$("#unDealwithDiv").append(tempValue);  //展示内容
										globalVal.page0_flag = 0;
									}else{  //没有下一页
										globalVal.page0_flag = 2;
									}
									getCountOfTeaApply(userId, cropId);
								}
							}
						);
					}
					
					if(globalVal.page0_flag != 0 && globalVal.page1_flag == 0){ 
						globalVal.page1_flag = 1;
						$.post(common.ctx+"/wap/tea/linkman/joinAskList/"+(globalVal.page1+1),
							{
								userId:userId,
								corpId:cropId,
								state:1
							},
							function(result){//已处理
								console.log("已处理第"+(globalVal.page1+1)+"页，数据长度："+result.items.length);
								if(result.resultCode == '001' && result.items && result.items.length > 0){  //请求成功
									globalVal.page1 = globalVal.page1+1;
									var tempValue = getDataList(result.items, 1);
									if(globalVal.page1 == 1){
										$("#dealwithDiv").html('<div class="dy_line"> <b>已处理</b></div>'+tempValue);  //展示内容
										$("#dealwithDiv").show();
									}else{
										$("#dealwithDiv").append(tempValue);  //展示内容
									}
									globalVal.page1_flag = 0;
								}else{  //没有下一页
									globalVal.page1_flag = 2;
								}
							}
						);
					}
				}
			}	

			$("body").on("click","a[name='passJoin']",function(){
				confirmApply(1, $(this).attr("joinId"));
			});
			$("body").on("click","a[name='noPassJoin']",function(){
				confirmApply(0, $(this).attr("joinId"));
			});
		});
	}
	
	/**
	 * 列表数据
	 * flag 0-未处理；1-已处理
	 */
	function getDataList(joinList, flag){
		var tmpStr = '';
		if(flag == 0){//未处理
			if(joinList){
				for(var i=0;i<joinList.length;i++){
					tmpStr += '<div class="list_box">';
					tmpStr += '<div class="list_from titred">';
					tmpStr += '<div class="dy_tit">'+joinList[i].name+'老师申请加入学校</div>';
					tmpStr += '</div>';
					tmpStr += '<div class="list_tit">';
					tmpStr += '<p>申请人：'+joinList[i].name+'</p>';
					tmpStr += '<p>手机号码：'+joinList[i].phone+'</p>';
					tmpStr += '<p>申请时间：'+joinList[i].createTime+'</p>';
					tmpStr += '</div>';
					tmpStr += '<div class="photo_m">';
					tmpStr += '<div class="bt"><a joinId="'+joinList[i].id+'" name="passJoin" href="javascript:;">通过</a><a joinId="'+joinList[i].id+'" name="noPassJoin" href="javascript:;" class="cd-popup-trigger">不通过</a></div>';
					tmpStr += '</div>';
					tmpStr += '</div>';
				}
			}
		}else if(flag == 1){//已处理
			if(joinList){
				for(var i=0;i<joinList.length;i++){
					tmpStr += '<div class="list_box">';
					tmpStr += '<div class="list_from titred">';
					tmpStr += '<div class="dy_tit">'+joinList[i].name+'老师申请加入学校</div>';
					tmpStr += '</div>';
					tmpStr += '<div class="list_tit">';
					tmpStr += '<p>申请人：'+joinList[i].name+'</p>';
					tmpStr += '<p>手机号码：'+joinList[i].phone+'</p>';
					tmpStr += '<p>申请时间：'+joinList[i].createTime+'</p>';
					tmpStr += '</div>';
					tmpStr += '<div class="photo_m">';
					if(joinList[i].status == 3){
						tmpStr += '<div class="tit_tg">已通过</div>';
					}else if(joinList[i].status == 4){
						tmpStr += '<div class="tit_tg" style="color: red;">不通过</div>';
					}
					tmpStr += '</div>';
					tmpStr += '</div>';
				}
			}
		}
		return tmpStr;
	}
	
	/**
	 * 教师申请加入
	 * @param state 0-不通过; 1-通过;   
	 */
	function confirmApply(state, joinId){
		console.log("教师申请加入");
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		if(confimPass == 0){
			confimPass = 1;
			$.post(common.ctx+"/wap/tea/linkman/dealJoinAsk",
				{
					userId:userId,
					corpId:cropId,
					state:state,
					joinId:joinId
				},
				function(result){
					if(result.resultCode == "001"){
						confimPass = 0;
						tip.openAlert1("提示","申请已处理");
						//storage.deleteLocalStorage("tea_applyjoin_list_"+cropId+"_"+userId+"_0");
						document.location.href = common.ctx + '/wap/html/lm16/tea_applyjoin_list.html?cropId='+cropId+"&userId="+userId+"&tmp="+(new Date()).getTime();
					}else{
						tip.openAlert1("提示","处理失败，请重新操作");
					}
				}
			);
		}
	}
	
	//获取教师申请加入未处理条数
	function getCountOfTeaApply(userId, cropId){
		$.post(common.ctx + '/wap/tea/linkman/joinAskCount',
			{
				userId:userId,
				corpId:cropId
			},function(result){
				if(result.resultCode == '001' && result.count != null && result.count > 0){
					onDealCount = result.count;
				}
			}
		);
	}

});