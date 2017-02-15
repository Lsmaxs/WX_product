/**
 * author:fan
 * data:2015-11-06
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
	
	init();
	
	function init(){
		common.fclog('WXQJ');
		var cropId = common.getUrlParam("wxcropId");
		var userId = common.getUrlParam("parId");
		var teaId = common.getUrlParam("teaId");
		var stuId = common.getUrlParam("stuId");
		var jumpToTeacher = common.getUrlParam("jumpToTeacher");
		var schoolCode = common.getUrlParam("schoolCode");
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		$("#teaId").val(teaId);
		$("#stuId").val(stuId);
		$("#jumpToTeacher").val(jumpToTeacher);
		$("#schoolCode").val(schoolCode);
        
//        $('#content').blur(function(){
//        	contentText(0);
//        });
//        
//        $('#content').focus(function(){
//        	contentText(1);
//        });
        
        $('#sendButton').click(function(){
        	MtaH5.clickStat('jxhd_qingjia_par_send');
        	sendQingjia();
        });
		
	}
	
	/**
	 * 请假事由变更
	 */
	function contentText(flag){
		var value = $("#content").text();
		if(flag == 1){
			if(value == '输入你需要发送的内容'){
				$("#content").text('');
			}
		}else{
			if(value == ''){
				$("#content").text('输入你需要发送的内容');
			}
		}
	}
	
	/**
	 * 提交请假
	 */
	var flag = 0;  //0未提交1提交中2已提交
	function sendQingjia(){
		var content = $("#content").val();
		var leaveStartTime = $("#leaveStartTime").val();
		var leaveEndTime = $("#leaveEndTime").val();
		if(flag == 0){
			flag = 1;
			if(leaveStartTime == ''){
				tip.openAlert1("提示","请选择请假开始时间");
				flag = 0;
				return;
			}
			if(leaveEndTime == ''){
				tip.openAlert1("提示","请选择请假结束时间");
				flag = 0;
				return;
			}
			if(content == ''){
				tip.openAlert1("提示","请输入请假事由");
				flag = 0;
				return;
			}
			postQingjia(null);
		}else if(flag == 1){
			tip.openAlert1("提示","我们正在努力提交中...");
		}else if(flag == 2){
			tip.openAlert1("提示","通知已经提交了");
		}
	}
	
	/**
	 * 提交发送请假
	 */
	function postQingjia(){
		//获取请求必要数据
		toast.showLoadToast("提交中...");
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var teaId = $("#teaId").val();
		var stuId = $("#stuId").val();
		var content = $("#content").val();
		var leaveStartTime = $("#leaveStartTime").val();
		var leaveEndTime = $("#leaveEndTime").val();
		var schoolCode = $("#schoolCode").val();
		
		content = common.filterXss(content);
		
		//构造请求实体
		var json = {
				content:content,
				leaveStartTime:leaveStartTime,
				leaveEndTime:leaveEndTime,
				teaUuid:teaId,
				stuUuid:stuId
		};
		var jsonStr = JSON.stringify(json);
		
		$.post(common.ctx+"/wap/par/qingjia/send",
				{
					json:jsonStr,
					cropId:cropId,
					userId:userId
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						toast.hideLoadToast();
						if(result.resultCode == "001"){
							tip.openAlert2("提示","请假已发送",function(){
								flag = 2;
								var jumpToTeacher = $('#jumpToTeacher').val();
								if(jumpToTeacher=='1'||jumpToTeacher==1)
									document.location.href = common.ctx+"/wap/html/qingjia/qingjia_tea_list.html?cropId="+cropId+"&userId="+userId+"&type=2"+"&isParent=1"+"&schoolCode="+schoolCode;
								else
									document.location.href = common.ctx+"/wap/html/qingjia/qingjia_par_list.html?cropId="+cropId+"&userId="+userId+"&schoolCode="+schoolCode;
							});
						}else{
							tip.openAlert2("提示",result.resultMsg);
							flag = 0;
						}
					}
				}
			);
	}

});
