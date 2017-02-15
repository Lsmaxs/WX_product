/**
 * author:fan
 * data:2015-11-06
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var common = require('common');
	var wxApi = require('wxApi');

	var chosenTeaId = ''; //选中的教师id
	var chosenStuId = ''; //选中的学生id

	var cropId = common.getUrlParam("cropId");
	var userId = common.getUrlParam("userId");
	var _context_schoolCode=common.getUrlParam("schoolCode");
	var jumpToTeacher = common.getUrlParam("isTeacher");
	
	wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
		wxApi.hideAllNonBaseMenuItem();
	});   //js-sdk验证
	
	init();
	
	function init(){
		common.fclog('WXQJ');
		dataPaging();
		
		$("#selectTargetFinishBtn").click(function(){
			next();
		});
	}
	
	/**
	 * 查询数据
	 */
	function dataPaging(){
		$.post(common.ctx+"/wap/par/qingjia/send/sendTarget",
				{
					parId:userId,
					schoolCode:_context_schoolCode
				},
				function(result){
					if(result.resultCode == '0001' && result.items && result.items.length > 0){  //请求成功
						var tempValue = getTargetList(result.items);
						$("#teacherBox").html(tempValue);  //展示内容
					}
				}
			);
	}
	
	/**
	 * 生成通知列表html
	 */
	function getTargetList(targetList){
		
		var tmpStr = '';
		if(targetList){
			for(var i=0;i<targetList.length;i++){
				tmpStr +='<p> <a data-tid="'+targetList[i].teaUuid+'" data-sid="'+targetList[i].stuUuid+'" href="javascript:;" class="operate-btn1"><span id="teacherSpan_'+targetList[i].teaUuid+'_'+targetList[i].stuUuid+'" class="'+(i==0?"op-checked":"op-check")+'"></span><span class="face_pic"><img src="'+targetList[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></span>'+targetList[i].teaName+'</a></p><hr />';
				if(i==0){
					chosenTeaId = targetList[i].teaUuid;
					chosenStuId = targetList[i].stuUuid;
				}
			}
		}
		
		$("body").on("click",".operate-btn1",function(){
			selectTeacher($(this).attr("data-tid"),$(this).attr("data-sid"));
		});
		
		return tmpStr;
		
	}
	
	
	function selectTeacher(teaId,stuId){
		$.each($('span[id^="teacherSpan_"]'),function(i,item){
			$(item).attr("class","op-check");
		});
		$('#teacherSpan_'+teaId+"_"+stuId).attr("class","op-checked");
		chosenTeaId = teaId;
		chosenStuId = stuId;
	}
	
	function next(){
		if(chosenTeaId == '' || chosenStuId == ''){
			alert("请选择老师");
		}else{
			window.location.href = common.ctx+'/wap/html/qingjia/par_send_qingjia.html?wxcropId='+cropId+'&parId='+userId +"&teaId="+chosenTeaId+"&stuId="+chosenStuId+"&jumpToTeacher="+jumpToTeacher+"&schoolCode="+_context_schoolCode;
		}
	}

});