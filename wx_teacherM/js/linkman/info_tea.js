/**
 * author:yonson
 * data:2016-1-27
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var tip = require('widget/tip');
	var storage = require('storage');
	
	var userId = common.getUrlParam("userId");
	var cropId = common.getUrlParam("cropId");
	var isParent = common.getUrlParam("isParent");
	common.fclog('WXLY');
	
	$("#userId").val(userId);
	$("#cropId").val(cropId);
	if(isParent && isParent == 1){
		$("#selectRole").show();
		$("body").css("background","#fbf9fe");
		
		$("#role_teacher").click(function(){
			document.location.href = common.ctx + '/wap/html/linkman/info_tea.html?cropId='+cropId+"&userId="+userId;
		});
		
		$("#role_parent").click(function(){
			document.location.href = common.ctx + '/wap/html/linkman/info_par.html?cropId='+cropId+"&userId="+userId;
		});
	}else{
		$("body").css("background","#fbf9fe");
		$("#commonShow").show();
		toast.showLoadToast();
		setTimeout(function(){
			init();
		},100);
	}
	
	//初始化操作
	function init(){
		
		loadLocalData();
		//修改姓名
		$(".date-wrap").on("click","#infoName",function(){
			document.location.href = common.ctx + '/wap/html/linkman/name_edit.html?cropId='+cropId+"&userId="+userId+"&type=1";
		});
		//修改手机号码
		$(".date-wrap").on("click","#infoPhone",function(){
			document.location.href = common.ctx + '/wap/html/linkman/phone_edit.html?cropId='+cropId+"&userId="+userId+"&type=1";
		});
		//修改角色
		$(".date-wrap").on("click","#infoRole",function(){
			document.location.href = common.ctx + '/wap/html/linkman/role_tea.html?cropId='+cropId+"&userId="+userId;
			//tip.openAlert1("提示","角色修改稍候开放");
		});
		//查看部门信息
		$(".date-wrap").on("click","#infoDept",function(){
			document.location.href = common.ctx + '/wap/html/linkman/dept_tea.html?cropId='+cropId+"&userId="+userId;
		});
		$(".date-wrap").on("click","#infoClassSub",function(){
			document.location.href = common.ctx + '/wap/html/linkman/class_sub_tea.html?cropId='+cropId+"&userId="+userId;
		});
		
	}
	
	//加载本地数据
	function loadLocalData(){
		
		var userId = $("#userId").val();
		var cropId = $("#cropId").val();
		
		try{
			if(storage.getLocalStorage("teaInfo_"+cropId)){
				var tmpStr = genTeaInfoHtml(JSON.parse(storage.getLocalStorage("teaInfo_"+cropId)));
				$(".date-wrap").html(tmpStr);
				toast.hideLoadToast();
			}
				
			$.post(common.ctx+"/wap/personal/teaInfo",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(result.resultCode == '001'){
							var tmpStr = genTeaInfoHtml(result);
							$(".date-wrap").html(tmpStr);
							storage.deleteLocalStorage("teaInfo_"+cropId);
							storage.setLocalStorage("teaInfo_"+cropId,JSON.stringify(result));
						}
						toast.hideLoadToast();
					}
				);
		}catch(e){
			storage.deleteLocalStorage("teaInfo_"+cropId);
		} 
		
	}
	
	//生成教师信息html 
	function genTeaInfoHtml(teaInfo){
		
		var tmpStr = '<h6>个人资料</h6>'+
					 '<div class="list_con">'+
					 '<div class="weui_cell line_b">'+
					 '<div class="weui_cell_fl line_h">头像</div>'+
					 '<div class="weui_cell_head"><img src="'+teaInfo.headIcon+'" onerror="javascript:this.src=\'../../images/user_pace.png\'" /></div>'+
					 '</div>'+
					 '<div id="infoName" class="weui_cell line_b">'+
					 '<div class="weui_cell_fl">我的姓名</div>'+
					 '<div class="weui_cell_fr">'+teaInfo.name+'<span class="dy_more"></span></div>'+
					 '</div>'+
					 '<div id="infoPhone" class="weui_cell">'+
					 '<div class="weui_cell_fl">手机号码</div>'+
					 '<div class="weui_cell_fr">'+teaInfo.phone+'<span class="dy_more"></span></div>'+
					 '</div></div>'+
					 '<h6>校务资料</h6>'+
					 '<div class="list_con">'+
					 '<div id="infoRole" class="weui_cell line_b">'+
					 '<div class="weui_cell_fl">角色</div>'+
					 '<div class="weui_cell_fr">';
					 if(teaInfo.roleList && teaInfo.roleList.length > 0){
						 for(var i=0;i<teaInfo.roleList.length;i++){
							 if(teaInfo.roleList[i].code == '1'){  //班主任，查询对应班级信息
								 if(teaInfo.teaClassList){
									 var ttflag = true;
									 for(var j=0;j<teaInfo.teaClassList.length;j++){
										 if(ttflag && teaInfo.teaClassList[j].isMaster == 1){
											 tmpStr += teaInfo.teaClassList[j].className;
											 ttflag = false;
										 }
									 }
								 }
							 }
							 tmpStr += teaInfo.roleList[i].name;
							 if(i != teaInfo.roleList.length - 1){
								 tmpStr += '、';
							 }
						 }
					 }else{
						 tmpStr += '暂无角色';
					 }
			tmpStr += '<span class="dy_more"></span></div>'+
					  '</div>'+
					  '<div id="infoClassSub" class="weui_cell line_b">'+
					  '<div class="weui_cell_fl">任教班级与科目</div>'+
					  '<div class="weui_cell_fr">';
					  var csFlag = true;
					  if(teaInfo.teaClassList && teaInfo.teaClassList.length > 0){
						  for(var i=0;i<teaInfo.teaClassList.length;i++){
							  if(csFlag){
								  if(teaInfo.teaClassList[i].subjectName){
									  tmpStr += teaInfo.teaClassList[i].className + "•"+teaInfo.teaClassList[i].subjectName
									  csFlag = false;
								  }
							  }
						  }
					  }
					  if(csFlag){
						  tmpStr += '暂无任教科目';
					  }
			tmpStr += '<span class="dy_more"></span></div>'+
					  '</div>'+
					  '<div id="infoDept" class="weui_cell">'+
					  '<div class="weui_cell_fl">所属部门</div>'+
					  '<div class="weui_cell_fr">';
					  if(teaInfo.deptList && teaInfo.deptList.length > 0){
						  for(var i=0;i<teaInfo.deptList.length && i < 2 ;i++){
							  tmpStr += teaInfo.deptList[i].name;
							  if((i < teaInfo.deptList.length - 1) && (i < 1)){
								  tmpStr += '、';
							  }
						  }
						  if(teaInfo.deptList.length > 2){
							  tmpStr += '...';
						  }
					  }else{
						  tmpStr += '暂无部门信息';
					  }
			tmpStr += '<span class="dy_more"></span></div>'+
					  '</div></div>';
			tmpStr += '<div class="b_ts">【温馨提示】为免影响学校的日常教学管理，请务必认真核对以上资料是否正确。如资料无误，请按左上角“返回”。 </div>';
			
			return tmpStr;
		
	}
	
});
