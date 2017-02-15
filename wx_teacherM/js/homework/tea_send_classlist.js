/**
 * author:yonson
 * data:2015-10-24
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	//引用相对路径模块
	var common = require('common');
	var tip = require('widget/tip');
	var storage = require('storage');
	var wxApi = require('wxApi');
	
	init();

	/**
	 * 初始化操作
	 */
	function init(){
		common.fclog('WXZY');
		var userId = common.getUrlParam("userId");
		var cropId = common.getUrlParam("cropId");
		$("#userId").val(userId);
		$("#cropId").val(cropId);
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//加截数据
		loadData();
		
		$(".class_list").on("click","p",function(){
			opChecked(this);
		});
		
		$(".bt_green").click("click",function(){
			goSendHomeworkEdit();
		});
		
		$(".input_box p").click("click",function(){
			selectAll(this);
		});
		
	}
	
	/**
	 * 加截数据
	 */
	function loadData(){
		
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		//向服务端加截初始化数据（期间不允许下拉操作）
		$.post(common.ctx+"/wap/tea/homework/getclasslist",
				{
					userId:userId,
					cropId:cropId
				},
				function(result){
					if(common.verifyToken(result,cropId)){
						if(result.resultCode == '001'){
							var tempValue = genHomeworkClasslist(result.items);
							$(".class_list").html(tempValue);
							if(storage.getSessionStorage("homeworkselectclass_"+cropId)){
								var classIds = storage.getSessionStorage("homeworkselectclass_"+cropId);
								var classIdArr = classIds.split(",");
								for(var i=0;i<classIdArr.length;i++){
									$("#classId_"+classIdArr[i]).addClass('op-checked').removeClass('op-check');
								}
							}
						}
					}
				}
			);
	}
	
	/**
	 * 生成作业班级列表信息
	 */
	function genHomeworkClasslist(classList){
		var tempStr = '';
		for(var i=0;i<classList.length;i++){
			tempStr += '<p> <a href="javascript:;" class="operate-btn1"><span id="classId_'+classList[i].classId+'" class="op-check"><input name="classInfo" type="hidden" value="'+classList[i].classId+'-'+classList[i].className+'" /></span>'+classList[i].className+'</a></p>';
			if(i < classList.length-1){
				tempStr += '<hr />';
			}
		}
		return tempStr;
	}
	
	/**
	 * 勾选选择
	 * @param obj
	 */
	function opChecked(obj){
		var newObj = $($(obj).find("span")[0]);
		if(newObj.hasClass('op-check')){
			newObj.addClass('op-checked');
			newObj.removeClass('op-check');
		}else if(newObj.hasClass('op-checked')){
			newObj.addClass('op-check');
			newObj.removeClass('op-checked');
		}
	}
	
	/**
	 * 跳转到发送作业编辑
	 */
	function goSendHomeworkEdit(){
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		var classNameStr = '';
		var classIdStr = '';
		var classInfoList = $(".op-checked").find("[name='classInfo']");
		for(var i=0;i<classInfoList.length;i++){
			var classInfoText = classInfoList[i].value;
			classInfoArr = classInfoText.split('-');
			classNameStr += ","+classInfoArr[1];
			classIdStr += ","+classInfoArr[0];
		}
		if(classIdStr.length <= 0){
			tip.openAlert1("提示","请选择班级");
		}else{
			classIdStr = classIdStr.substring(1);
			classNameStr = classNameStr.substring(1);
			
			//保存选择班级数据至本地缓存，以便后退操作时查看到班级信息
			storage.setSessionStorage("homeworkselectclass_"+cropId,classIdStr);
			
			document.location.href = common.ctx+"/wap/html/homework/tea_send_homework.html?userId="+userId+"&cropId="+cropId+"&classNameStr="+encodeURI(classNameStr)+"&classIdStr="+classIdStr;
		}
		
	}
	
	/**
	 * 全选反选操作
	 * @param obj
	 */
	function selectAll(obj){
		var newObj = $($(obj).find("span")[0]);
		if(newObj.hasClass('op-check')){  //全部选择
			$(".op-check").addClass('op-checked').removeClass('op-check');
		}else if(newObj.hasClass('op-checked')){  //全部反选
			$(".op-checked").addClass('op-check').removeClass('op-checked');
		}
	}
	
	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});