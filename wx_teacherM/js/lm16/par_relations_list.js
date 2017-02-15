/**
 * author:yonson
 * data:2016-1-27
 */
/**
 * paramValue = {
 * 	"cropId":"",
 * 	"userId":"",
 * 	"phone":"",
 * 	"name":"",
 * 	"stuUserId":"",
 * 	"tag":""
 * }
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var storage = require('storage');
	var wxApi = require('wxApi');

	var tip = require('widget/tip');
	var paramValue;
	var relapplyed;
	toast.showLoadToast();
	setTimeout(function(){
		init();
	},100);
	
	//初始化操作
	function init(){
		common.fclog('WXLY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		
		$("#cropId").val(cropId);
		$("#userId").val(userId);
		relapplyed = storage.getLocalStorage("par_relapplyed_"+$("#userId").val());
		if(relapplyed){
			relapplyed = JSON.parse(relapplyed);
		}else{
			relapplyed = {};
		}
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//获取参数数据
		paramValue = JSON.parse(storage.getSessionStorage("paramValue"));
		if(paramValue){
			loadLocalData();
		}
	}
	
	function bindingEven(){
		//选择关系
		$(".date-wrap").on("click",".apply",function(){
			var cropId = $("#cropId").val();
			var userId = $("#userId").val();
			var target = this.getAttribute("data-id");
			//$(this).attr("disabled",true);
			var my = $(this);
			var content = '姓名:{name}<br/>所在班级:{class}<br/><br/><span style="color:red">{msg}</span>';
			content = content.replace('{name}',paramValue.stu.name).replace('{class}',paramValue.stu.className).replace('{msg}','如果上述信息有误，请返回修改小孩信息！');
			tip.openAlert2("请确认您的小孩信息",content,null,function(){
				$.post(common.ctx + '/wap/per/lm16/applyDelPar',
						{
							userId:userId,
							cropId:cropId,
							targetUserId:target,
							stuId:paramValue.stu.userId
						},
						function(result){
							if(result.resultCode == '001'){
								my.toggleClass("bt_removed").toggleClass("bt_remove").toggleClass("apply");
								if(result.isDel==1){
									my.html("已移除");
								}else{
									my.html("已申请移除");
									relapplyed[target]="1";
									storage.setLocalStorage("par_relapplyed_"+$("#userId").val(),JSON.stringify(relapplyed));
								}
							}else{
								tip.openAlert1("提示",result.resultMsg);
							}
						}
					);
			},"确定申请移除","返回");
		});
	}
	
	//加载本地数据
	function loadLocalData(){
		if(paramValue){
			var tmpStr = genRelationListHtml(paramValue.stu);
			$(".date-wrap").html(tmpStr);
			bindingEven();
		}
		toast.hideLoadToast();
	}

	//生成html 
	function genRelationListHtml(stu){
		var tmpStr = '<h6>'+stu.name+'其他家长</h6>'+
			'<div class="list_con">';
		for(var i=0;i<stu.parents.length;i++){
			if(i==(stu.parents.length-1)){
				tmpStr += '<div class="weui_cell"><div class="weui_cell_fl1">';
			}else{
				tmpStr += '<div class="weui_cell line_b"><div class="weui_cell_fl1">';
			}
			if(relapplyed[stu.parents[i].uuid]=="1"){
				tmpStr += '<span class="bt_removed">已申请移除</span>';
			}else{
				tmpStr += '<span class="bt_remove apply" data-id="'+stu.parents[i].uuid+'">申请移除</span>';
			}
			if(stu.parents[i].status==1){
				tmpStr += '<span class="user_face"><img src="'+stu.parents[i].icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'" /></span>';
			}else{
				tmpStr += '<span class="user_face"><img src="../../images/user_pace_no_s.png" /></span>';
			}
			tmpStr += '<p class="user_name">'+stu.parents[i].name+' '+stu.parents[i].relation+'</p>'+
				'<p class="user_phone">'+stu.parents[i].phone+'</p>'+
				'</div></div>';
		}
		tmpStr += '</div>'+
			'<p class="p_Cue">【温馨提示】如果发现关联家长信息有误，可能是通讯录导入错误，可点击“申请移除”按扭向客服提出移除申请。</p>';
		return tmpStr;
	}
	
});
