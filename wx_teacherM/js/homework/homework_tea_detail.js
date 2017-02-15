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
	 * 初始化环境
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
		
		$(".list_con").on("click","img",function(){
			var imageUrls = this.getAttribute("data-imageUrls");
			imageShow(imageUrls);
		});
		
		$(".list_con").on("click","#readPerson",function(){
			$($(this).find("span")[0]).toggleClass("dy_more").toggleClass("dy_some");
			$("#readPensonList").slideToggle(300);
		});
		
		$("#sendAgain").slideToggle(300);
		$(".list_con").on("click","#unReadPerson",function(){
			$($(this).find("span")[1]).toggleClass("dy_more").toggleClass("dy_some");
			$("#unReadPensonList").slideToggle(300);
			$("#urp_selectall").slideToggle(300);
		});
		
		$(".list_con").on("click","#urp_selectall",function(){
			selectAll(this);
			return false;
		});
		
		$(".list_con").on("click","p[name='opChecked']",function(){
			opChecked(this);
		});
		
		$(".list_con").on("click","#sendAgain",function(){
			sendAgain();
		});
		
		
	}
	
	/**
	 * 从localStoger中加截数据
	 */
	function loadLocalData(){
		var nu = $("#nu").val();
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		try{
			var tempValue = "";
			//从localStorage加载数据
			if(storage.getLocalStorage("homeworkdetail_"+nu)){
				tempValue = genHomeworkDetail(JSON.parse(storage.getLocalStorage("homeworkdetail_"+nu)));
				$(".list_con").html(tempValue);  //展示内容
				toast.hideLoadToast();
			}
			//向服务端请求最新数据
			$.post(common.ctx+"/wap/tea/homework/detail/get",
					{
						userId:userId,
						cropId:cropId,
						nu:nu
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							if(result.resultCode == '001'){  //请求成功
								storage.deleteLocalStorage("homeworkdetail_"+nu);
								storage.setLocalStorage("homeworkdetail_"+nu,JSON.stringify(result));
								var tempValue = genHomeworkDetail(result);
								$(".list_con").html(tempValue);  //展示内容
							}
							toast.hideLoadToast();
						}
					}
				);
		}catch(e){
			storage.deleteLocalStorage("homeworkdetail_"+nu);
		}
	}
	
	/**
	 * 生成作业详细实体
	 * @param homeworkDetail
	 * @returns {String}
	 */
	function genHomeworkDetail(homeworkDetail){
		var tmpStr = '<div class="list_from">'+
					 '<div class="title fl">'+homeworkDetail.subject+'作业</div>'+
	    			 '<div class="time fl tr">'+homeworkDetail.createTime+'</div>'+
	  				 '</div><div class="list_tit">'+homeworkDetail.content;
					 if(homeworkDetail.imageUrls){
						 var picClass = "";
						 if(homeworkDetail.imageUrls.length == 1){
							 picClass = "list_pic_y";
						 }else if(homeworkDetail.imageUrls.length == 4){
							 picClass = "list_pic_4";
						 }else{
							 picClass = "list_pic_more"
						 }
						 tmpStr += '<div class="'+picClass+'">';
						 if(homeworkDetail.imageUrls.length == 1){
							 tmpStr += '<a href="javascript:;"><span><img onload="imgPreDeal(this);" data-imageUrls="'+homeworkDetail.imageUrls[0]+'" src="'+homeworkDetail.imageUrls[0]+'"  onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
						 }else{
							 for(var i=0;i<homeworkDetail.imageUrls.length;i++){
				      			tmpStr += '<a href="javascript:;"><span><img onload="winFixImg(this);" data-imageUrls="'+homeworkDetail.imageUrls[i]+'" src="'+homeworkDetail.imageUrls[i]+'"  onerror="javascript:this.src=\'../../images/no_photo.png\'" /></span></a>';
				      		 } 
						 }
		      			 tmpStr += '</div>';
					 }
					  
	      	tmpStr += '</div><div class="list_state">';
	  			      if(homeworkDetail.targets && homeworkDetail.targets.length > 0){
	  			    	  tmpStr += '<p style="padding-bottom:8px">发给：';
	  			    	  for(var j=0;j<homeworkDetail.targets.length;j++){
	  			    		  tmpStr += homeworkDetail.targets[j];
			        		  if(j >= 1 && homeworkDetail.targets.length > j){
			        			  tmpStr += '...';
			        			  break;
			        		  }else{
			        			  tmpStr += '、';
			        		  }
	  			    	  }
	  			    	tmpStr += '(共'+(homeworkDetail.readPerson.length+homeworkDetail.unReadPerson.length)+'人)</p>';
	  			      }
	  		tmpStr += '<div class="photo_m" id="readPerson" style="background:#f0f0f0; border-bottom:1px solid #e0e0e0;"  >'+
	        		  '<div class="float_l">已读（'+homeworkDetail.readPerson.length+'人）</div>'+
	        		  '<span class="dy_more">&nbsp;</span></div>'+
	        		  '<div id="readPensonList" class="tz-list" style="display: none" >'+
	        		  '<ul class="ul-over">';
	           		  for(var i=0;i<homeworkDetail.readPerson.length;i++){
	           			  tmpStr += '<li>'+homeworkDetail.readPerson[i].name+'</li>';
	           		  }
	           		  tmpStr += '</ul></div>'+
	           		  			'<div class="photo_m" id="unReadPerson" style="background:#f0f0f0"  >'+
	           		  			'<div class="float_l"><span id="urp_selectall" class="op-check" style="display: none" ></span>未读（'+homeworkDetail.unReadPerson.length+'人）</div>'+
	           		  			'<span class="dy_more">&nbsp;</span></div>'+
	           		  			'<div id="unReadPensonList" class="tz-list" style="display: none" >';
					  if(homeworkDetail.unReadPerson){
						   for(var i=0;i<homeworkDetail.unReadPerson.length;i++){
							   if(homeworkDetail.unReadPerson[i].isFocus == 0){
								   tmpStr += '<p name="opChecked" > <a href="javascript:;" class="operate-btn1"><span class="op-check"><input type="hidden" name="userInfo" value="'+homeworkDetail.unReadPerson[i].suuid+'" ></span>'+homeworkDetail.unReadPerson[i].name+'<span title="未关注企业号" class="pay_us">未关注</span></a></p>'
							   }else{
								   tmpStr += '<p name="opChecked" > <a href="javascript:;" class="operate-btn1"><span class="op-check"><input type="hidden" name="userInfo" value="'+homeworkDetail.unReadPerson[i].suuid+'" ></span>'+homeworkDetail.unReadPerson[i].name+'</a></p>';
							   }
						   }
					  }
					  tmpStr += '<a href="javascript:;" id="sendAgain" class="bt_green" >再次发送</a></div></div>';
	       	return tmpStr;
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
				$.post(common.ctx+"/wap/tea/homework/resendHW",
						{
							userId:userId,
							cropId:cropId,
							nu:nu,
							sendStuTarget:sendStuTarget
						},
						function(result){
							if(common.verifyToken(result,cropId)){
								if(result.resultCode == '001'){  //请求成功
									tip.openAlert1("提示","发送成功");
									sendFlag = 2;
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
		}else if(sendFlag == 2){
			tip.openAlert1("提示","消息已发送过");
		}
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