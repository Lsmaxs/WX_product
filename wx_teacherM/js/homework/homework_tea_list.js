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
	var tip = require('widget/tip');
	var toast = require('widget/toast');
	var storage = require('storage');
	
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	function init(){
		common.fclog('WXZY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		var type = common.getUrlParam("type");
		if(!type){
			type = 1;
		}
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		$("#type").val(type);
		
		wxApi.wxConfig(cropId,['previewImage','hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		if(type == 1){
			$(".date-wrap").on("click",".bd_r_r",function(){
				goHomeworkList(2);
			});
			$(".list_con").on("click",".list_box",function(){
				var homeworkNu = $(this).find(".homeworkNu")[0].value;
				goHomeworkDetail(homeworkNu);
			});
		}else{
			$(".date-wrap").on("click",".bd_r_l",function(){
				goHomeworkList(1);
			});
			$(".list_con").on("click",".content_body",function(){
				var homeworkNu = $(this).find(".homeworkNu")[0].value;
				goHomeworkDetail(homeworkNu);
			});
		}
		$(".date-wrap").on("change","#dateSelect",function(){
			changeDateSelect();
		});
		loadTopBar(type);
		loadLocalData();
		dataPaging();
		
		$(".list_con").on("click","img",function(){
			var imageUrl = this.getAttribute("data-imageUrl");
			imageShow(this,imageUrl);
			return false;
		});
		
		$(".tz_box").click(function(){
			goSendHomework();
		});
		
	}
	
	function loadTopBar(type){
		var tmpStr = '';
		if(type == 1){
			tmpStr += '<div class="class_tab"> <a class="bd_r_l sel" href="javascript:;">已发的作业</a><a class="bd_r_r" href="javascript:;">收到的作业</a></div>'+
					  '<div class=" point_box" id="no_data_page" style="margin-top: 100px;display: none" >'+
					  '<h2 class="c-tx1">暂时没有记录哦</h2>'+
					  '<img src="../../images/tc_face2.png" />'+
					  '</div>';
		}else{
			
			tmpStr += '<div class="class_tab"> <a class="bd_r_l" href="javascript:;">已发的作业</a><a class="bd_r_r sel" href="javascript:;">收到的作业</a></div>'+
					  '<div class="date_tit" style="position: relative;" ><span id="showDate"></span>'+
					  '<span class="date_tit_span" >选择日期</span>'+
					  '<select id="dateSelect" style="opacity:0;width: 100%;height: 100%;position: absolute;left: 0;top: 0;" >'+
		  			  '<option value="'+common.getDate()+'" >今天</option>'+
		  			  '<option value="'+common.getDate(1)+'" >昨天</option>'+
		  			  '<option value="'+common.getDate(2)+'" >前天</option>'+
		  			  '</select></div>'+
		  			  '<div class=" point_box" id="no_data_page" style="display: none" >'+
		  			  '<h2 class="c-tx1">今天还没有作业</h2>'+
		  			  '<img src="../../images/tc_face2.png" /></div>';
		}
		$(".date-wrap").prepend(tmpStr);
	}
	
	
	/**
	 * 从localStoger中加截数据(发送的作业信息)
	 */
	function loadLocalData(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		try{
			if(type == 2){
				var selectDate = $("#dateSelect").val();
				var selectDateArr = selectDate.split("-");
				$("#showDate").html(selectDateArr[1]+'月'+selectDateArr[2]+'日');
			}
			var tempValue = '';
			//从localStorage加载数据
			if(storage.getLocalStorage("homeworklist_"+type+"_"+cropId)){
				tempValue = genHomeworkList(JSON.parse(storage.getLocalStorage("homeworklist_"+type+"_"+cropId)),type);
				if(type == 1){
					if(tempValue.length > 0){
						$("#no_data_page").hide();
						$(".list_con").html(tempValue);  //展示内容
					}else{
						$("#no_data_page").show();
					}
				}
				toast.hideLoadToast();
			}
			
			if(type == 1){
				//向服务端加截初始化数据（期间不允许下拉操作）
				$.post(common.ctx+"/wap/tea/homework/list/1",
						{
							userId:userId,
							cropId:cropId
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == '001'){  //请求成功
									storage.deleteLocalStorage("homeworklist_"+type+"_"+cropId);
									storage.setLocalStorage("homeworklist_"+type+"_"+cropId,JSON.stringify(result.items));
									var tempValue = genHomeworkList(result.items,type);
									
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
			}else if(type == 2){
				$.post(common.ctx+"/wap/par/homework/listGet",
						{
							userId:userId,
							cropId:cropId
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == '001'){  //请求成功
									storage.deleteLocalStorage("homeworklist_"+type+"_"+cropId);
									storage.setLocalStorage("homeworklist_"+type+"_"+cropId,JSON.stringify(result));
									var tempValue = genHomeworkList(result,type);
									
									$(".list_con").html(tempValue);  //展示内容
									globalVal.pickUpFlag = false;  //不允许下拉
								}
								toast.hideLoadToast();
							}
						}
					);
			}
			
		}catch(e){
			storage.deleteLocalStorage("homeworklist_"+type+"_"+cropId);
		}
	}
	
	/**
	 * 分页加截数据
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
						var type = $("#type").val();
						if(type == '1'){
							$.post(common.ctx+"/wap/tea/homework/list/"+(globalVal.page+1),
									{
										userId:userId,
										cropId:cropId,
										type:type
									},
									function(result){
										if(common.verifyToken(result,cropId)){
											if(result.resultCode == '001' && result.items && result.items.length > 0){  //请求成功
												globalVal.page = globalVal.page+1;
												var tempValue = genHomeworkList(result.items,type);
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
			}	
		}); 
	}
	
	/**
	 * 生成作业列表
	 * @param homeworkList
	 * @returns {String}
	 */
	function genHomeworkList(homeworkList,type){
		
		var tmpStr = '';
		if(type == 1){
			if(homeworkList && homeworkList.length){
				for(var i=0;i<homeworkList.length;i++){
					tmpStr += '<div class="list_box" >'+
							  '<input type="hidden" class="homeworkNu" value="'+homeworkList[i].nu+'" />'+
							  '<div class="list_from">'+
						      '<div class="title fl">'+homeworkList[i].subject+'作业</div>'+
						      '<div class="time fl tr">'+homeworkList[i].createTime+'</div>'+
					    	  '</div>'+
					    	  '<div class="list_tit">'+homeworkList[i].content;
							  if(homeworkList[i].imageUrls){
								  var picClass = "";
								  if(homeworkList[i].imageUrls.length == 1){
									  picClass = "list_pic_y";
								  }else if(homeworkList[i].imageUrls.length == 4){
									  picClass = "list_pic_4";
								  }else{
									  picClass = "list_pic_more"
								  }
								  tmpStr += '<div class="'+picClass+'">';
								  if(homeworkList[i].imageUrls.length == 1){
									  tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" data-imageUrl="'+homeworkList[i].imageUrls[0]+'" src="'+homeworkList[i].imageUrls[0]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
								  }else{
									  for(var j=0;j<homeworkList[i].imageUrls.length;j++){
							        	  tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" data-imageUrl="'+homeworkList[i].imageUrls[j]+'" src="'+homeworkList[i].imageUrls[j]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
							          }
								  }
						          tmpStr += '</div>';
							  }
					          
					tmpStr += '</div>'+
					          '<div class="list_state">';
					          if(homeworkList[i].targets.length > 0){
					        	  tmpStr += '<p>发给：';
					        	  for(var z=0;z<homeworkList[i].targets.length;z++){
					        		  tmpStr += homeworkList[i].targets[z];
					        		  if(z >= 1 && homeworkList[i].targets.length > z){
					        			  tmpStr += '...';
					        			  break;
					        		  }else{
					        			  tmpStr += '、';
					        		  }
						          }
					        	  tmpStr += '(共'+(homeworkList[i].readNum+homeworkList[i].unReadNum)+'人)</p>';
					          }
					tmpStr += '<p>已读/未读：<span class="c-tx8">'+homeworkList[i].readNum+'/'+homeworkList[i].unReadNum+'</span></p></div></div>';        
				}
			}
		}else{
			if(homeworkList.items && homeworkList.items.length > 0){
				if(homeworkList.isToday == 0){
					$("#no_data_page").show();
					tmpStr += '<div class="point_last"> <b>上一次的的作业情况</b> </div>'+
					  '<div class="last_time"><b>'+homeworkList.sendDay+'</b></div>';
				}else{
					$("#no_data_page").hide();
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
						for(var j=0;j<homeworkList.items[i].imageUrls.length;j++){
							tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" data-imageUrl="'+homeworkList.items[i].imageUrls[j]+'" src="'+homeworkList.items[i].imageUrls[j]+'" onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
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
			}else{
				$("#no_data_page").show();
			}
		}
		
		return tmpStr;
	}
	
	/**
	 * 收到的作业，选择日期
	 */
	function changeDateSelect(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var selectDate = $("#dateSelect").val();
		var type = $("#type").val();
		
		var selectDateArr = selectDate.split("-");
		$("#showDate").html(selectDateArr[1]+'月'+selectDateArr[2]+'日');
		
		$.post(common.ctx+"/wap/par/homework/listGet",
				{
					userId:userId,
					cropId:cropId,
					selectDate:selectDate
				},
				function(result){
					if(result.resultCode == '001'){  //请求成功
						storage.deleteLocalStorage("homeworklist_"+type+"_"+cropId);
						storage.setLocalStorage("homeworklist_"+type+"_"+cropId,JSON.stringify(result));
						var tempValue = genHomeworkList(result,type);
						
						$(".list_con").html(tempValue);  //展示内容
						globalVal.pickUpFlag = false;  //允许下拉
					}
				}
			);
		
		
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
	 * 跳转至作业列表页面
	 * @param type
	 */
	function goHomeworkList(type){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		document.location.href = common.ctx + "/wap/html/homework/homework_tea_list.html?type="+type+"&userId="+userId+"&cropId="+cropId;
	}
	
	/**
	 * 跳转到作业详细页面
	 */
	function goHomeworkDetail(nu){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		var type = $("#type").val();
		if(type == 1){
			document.location.href = common.ctx+"/wap/html/homework/homework_tea_detail.html?nu="+nu+"&userId="+userId+"&cropId="+cropId+"&type=2";
		}else if(type == 2){
			document.location.href = common.ctx+'/wap/html/homework/homework_par_detail.html?userId='+userId+'&nu='+nu+'&cropId='+cropId;
		}
		
	}
	
	/**
	 * 发送作业操作
	 */
	function goSendHomework(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		document.location.href = common.ctx+"/wap/html/homework/tea_send_classlist.html?userId="+userId+"&cropId="+cropId;
	}
	
	
	/**
	 * 完成作业状态变更
	 * @param obj
	 */
	function dealComplete(obj,noticeUnique){
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
			});
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});
