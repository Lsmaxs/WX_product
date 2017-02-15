/**
 * author:yonson
 * data:2016-3-17
 */
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var toast = require('widget/toast');
	var tip = require('widget/tip');
	var storage = require('storage');
	var wxApi = require('wxApi');
	
	var SERVER_GET_TEADATA_URL = common.ctx + '/wap/tea/lm16/getTeaList';  //请求教师数据
	var SERVER_GET_PARDATA_URL = common.ctx + '/wap/tea/lm16/getParList';  //请求家长数据
	var SERVER_GET_TEAEXDATA_URL = common.ctx + '/wap/tea/lm16/getTeaExInfo';  //获取教师额外信息
	var SERVER_WORD_URL = common.ctx + '/wap/html/words/words_tea_edit.html';  //发送留言信息
	var SERVER_TEA_DETAIL_URL = common.ctx + '/wap/html/lm16/linkman_tea_detail.html';  //教师详细
	var SERVER_PAR_DETAIL_URL = common.ctx + '/wap/html/lm16/linkman_par_detail.html';  //家长详细
	var SERVER_SHARE_URL = common.produsUrl + '/wap/html/joinex/share_join.html';  //分享页面
	var SERVER_ADD_TEACH_URL = common.ctx + '/wap/html/linkman/info_tea.html';  //个人资料修改
	var SERVER_GET_APPLY_COUNT = common.ctx + '/wap/tea/linkman/joinAskCount'; //获取教师申请加入未处理的数量
	
	var selectType = 0;
	var isNotTeach = 1;
	
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
		
		wxApi.wxConfig(cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		//判断是否管理员，如果是管理员在sessionStorge中设置管理员标置位
		var ia = common.getUrlParam("ia");
		if(ia == 1){
			storage.setSessionStorage("ia_"+cropId,"1");
		}
		
		//加截数据
		loadData();
		
		//加载老师申请加入的未处理数量
		getCountOfTeaApply(userId, cropId, ia);
		
		//查看教师加入申请消息
		$(".new_yz").click(function(){
			document.location.href = common.ctx + '/wap/html/lm16/tea_applyjoin_list.html?cropId='+cropId+"&userId="+userId+"&tmp="+(new Date()).getTime();
		});
		
		//查询操作
		$("#searchLinkman").change(function(){
			var searchValue = $(this).val();
			genSearchHtml(searchValue);
		});
		
		//点击留言功能
		$("#parentList,.search_box").on("click","a[name='sendWords']",function(){
			var index = this.getAttribute("data-index");
			var indexArr = index.split('-');
			sendWords(indexArr[0],indexArr[1],indexArr[2]);
			return false;
		});
		
		//点击留言功能
		$("#teacherList,.search_box").on("click","a[name='sendWordsTea']",function(){
			var index = this.getAttribute("data-index");
			var indexArr = index.split('-');
			sendWordsTea(indexArr[0],indexArr[1]);
			return false;
		});
		
		//进入家长详细
		$("#parentList,.search_box").on("click","li[name='parDetail']",function(){
			var index = this.getAttribute("data-index");
			var indexArr = index.split('-');
			goParDetail(indexArr[0],indexArr[1],indexArr[2]);
			return false;
		});
		
		//进入教师详细
		$("#teacherList,.search_box").on("click","li[name='teaDetail']",function(){
			var index = this.getAttribute("data-index");
			var indexArr = index.split('-');
			goTeaDetail(indexArr[0],indexArr[1]);
			return false;
		});
		
		//选择家长
		$("#selectPar").click(function(){
			$("#selectPar").addClass("sel");
			$("#selectTea").removeClass("sel");
			selectType = 0;
			$("#teacherList").hide();
			if(isNotTeach == 0){
				$(".address_par_nodate").fadeIn(400);
			}else{
				$("#parentList").fadeIn(400);
			}
			
		});
		//选择教师
		$("#selectTea").click(function(){
			$("#selectTea").addClass("sel");
			$("#selectPar").removeClass("sel");
			selectType = 1;
			$("#parentList").hide();
			$(".address_par_nodate").hide();
			$("#teacherList").fadeIn(400);
		});
		
		//查询操作
		$("#searchLinkman").change(function(){
			var searchValue = $(this).val();
			genSearchHtml(searchValue);
		});
		
		$("#parentList,#teacherList").on("click",".tit",function(){
			var type = this.getAttribute("data-type");
			var deptId = this.getAttribute("data-deptId");
			slideSelect(this,type,deptId);
		});
		
		$("#parentList,#teacherList,.search_box").on("click","a[name='onPhone']",function(e){
			e.stopPropagation();
		});
		
		//点击邀请关注
		$("#parentList,#teacherList,.search_box").on("click","span[name='inviteAttention']",function(){
			invitePerson();
			return false;
		});
		
		//添加科目信息
		$("#addTeachs").click(function(){
			document.location.href = SERVER_ADD_TEACH_URL + "?cropId="+cropId+"&userId="+userId;
		});
		
		//请求学校信息
		if(storage.getSessionStorage("school_info")){
			
		}else{
			$.post(common.produsUrl+"/info/getSchoolInfo",
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						storage.setSessionStorage("school_info",JSON.stringify(result));
					}
				);
		}
		
		
	}
	
	//加截数据
	function loadData(){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		try{
			if(storage.getLocalStorage("teaLinkman_"+cropId)){
				var tmpStr = genTeaHtml(JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId)));
				$("#teacherList").html(tmpStr);
				toast.hideLoadToast();
			}
			//加截班级数据
			if(storage.getLocalStorage("classLinkman_"+cropId)){
				var tmpStr = genParHtml(JSON.parse(storage.getLocalStorage("classLinkman_"+cropId)));
				$("#parentList").html(tmpStr);
				toast.hideLoadToast();
			}
			var isRefresh = '0';
			if(storage.getLocalStorage("isLinkmanRefresh_"+cropId) == '1'){
				isRefresh = '1';
			}
			
			$.post(SERVER_GET_TEADATA_URL,
					{
						userId:userId,
						cropId:cropId,
						isRefresh:isRefresh
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							storage.setLocalStorage("isLinkmanRefresh_"+cropId,"0"); 
							var tmpStr = genTeaHtml(result);
							$("#teacherList").html(tmpStr);
							toast.hideLoadToast();
							storage.deleteLocalStorage("teaLinkman_"+cropId);
							storage.setLocalStorage("teaLinkman_"+cropId,JSON.stringify(result));
						}
					}
				);
			
			$.post(SERVER_GET_PARDATA_URL,
					{
						userId:userId,
						cropId:cropId,
						isRefresh:isRefresh
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							storage.setLocalStorage("isLinkmanRefresh_"+cropId,"0"); 
							var tmpStr = genParHtml(result);
							$("#parentList").html(tmpStr);
							toast.hideLoadToast();	
							storage.deleteLocalStorage("classLinkman_"+cropId);
							storage.setLocalStorage("classLinkman_"+cropId,JSON.stringify(result));
						}
					}
				);
			
			//获取自身带班额外信息
			$.post(SERVER_GET_TEAEXDATA_URL,
					{
						userId:userId,
						cropId:cropId
					},
					function(result){
						if(common.verifyToken(result,cropId)){
							storage.deleteLocalStorage("myselfTeacherExInfo_"+cropId);
							storage.setLocalStorage("myselfTeacherExInfo_"+cropId,JSON.stringify(result));
						}
					}
				);
			
		}catch(e){
			storage.deleteLocalStorage("teaLinkman_"+cropId);
			storage.deleteLocalStorage("classLinkman_"+cropId);
		}
	}
	
	//生成教师html页面
	function genTeaHtml(teaListResp){
		
		var tmpStr = new Array();
		if(teaListResp.items){
			for(var i=0;i<teaListResp.items.length;i++){
				var linkmanDepartGroup = teaListResp.items[i];
				tmpStr.push('<div data-type="1" data-deptId="'+linkmanDepartGroup.deptId+'" class="tit">'+linkmanDepartGroup.deptName+'<b>教师'+linkmanDepartGroup.teaCount+' /  未关注<em>'+linkmanDepartGroup.noFollowedCount+'</em></b>');
				if(i == teaListResp.items.length - 1){
					tmpStr.push('<span class="dy_some"></span></div><div id="tea_'+linkmanDepartGroup.deptId+'" class="con" >');
				}else{
					tmpStr.push('<span class="dy_more"></span></div><div id="tea_'+linkmanDepartGroup.deptId+'" class="con" style="display:none" >');
				}
				tmpStr.push('<ul class="tea_list">');
				if(linkmanDepartGroup.teachers){
					for(var j=0;j<linkmanDepartGroup.teachers.length;j++){
						var linkmanContact = linkmanDepartGroup.teachers[j];
						var liClassName = '';
						if(j == linkmanDepartGroup.teachers.length - 1){
							liClassName = 'class="line_none"';
						}
						if(linkmanContact.followed == 1){  //关注
							tmpStr.push('<li '+liClassName+' name="teaDetail" data-index="'+i+'-'+j+'" ><img src="'+linkmanContact.icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'"  /><b>'+linkmanContact.name+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em>');
							tmpStr.push('<span class="address_cont"><a name="sendWordsTea" data-index="'+i+'-'+j+'" href="javascript:;"><img src="../../images/ico_xx.png" /></a><a name="onPhone" href="tel:'+linkmanContact.phone+'"><img src="../../images/ico_phone.png" /></a></span></li>');
						}else{  //未关注
							tmpStr.push('<li '+liClassName+' name="teaDetail" data-index="'+i+'-'+j+'" ><img src="../../images/user_pace_no_s.png" /><b>'+linkmanContact.name+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em>');
							tmpStr.push('<span class="address_add" name="inviteAttention" >邀请关注</span></li>');
						}
					}
				}
				tmpStr.push('</ul>');
				tmpStr.push('</div>');
			}
		}
		return tmpStr.join('');
		
	}
	
	//生成家长html页面
	function genParHtml(parListResp){
		
		var tmpStr = new Array();
		if(parListResp.items){
			for(var i=0;i<parListResp.items.length;i++){
				var linkmanClassGroup = parListResp.items[i];
				tmpStr.push('<div data-type="2" data-deptId="'+linkmanClassGroup.cid+'" class="tit">'+linkmanClassGroup.className+'<b>学生'+linkmanClassGroup.stuCount+' / 家长'+linkmanClassGroup.parentCount+' / 未关注<em>'+linkmanClassGroup.noFollowedCount+'</em></b>');
				if(i == parListResp.items.length - 1){
					tmpStr.push('<span class="dy_some"></span></div><div id="par_'+linkmanClassGroup.cid+'" class="con" >');
				}else{
					tmpStr.push('<span class="dy_more"></span></div><div id="par_'+linkmanClassGroup.cid+'" class="con" style="display:none" >');
				}
				if(linkmanClassGroup.childs){
					for(var j=0;j<linkmanClassGroup.childs.length;j++){
						var linkmanChild = linkmanClassGroup.childs[j];
						if(linkmanChild.parents && linkmanChild.parents.length > 0){
							tmpStr.push('<ul class="par_list">');
							for(var z=0;z<linkmanChild.parents.length;z++){
								var linkmanContact = linkmanChild.parents[z];
								var liClassName = '';
								if(z == linkmanChild.parents.length - 1){
									liClassName = 'class="line_none"';
								}
								if(linkmanContact.followed == 1){  //关注
									tmpStr.push('<li '+liClassName+' name="parDetail" data-index="'+i+'-'+j+'-'+z+'" ><img src="'+linkmanContact.icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'" /><b>'+linkmanChild.stuName+' '+linkmanContact.tag+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em><br />');
									tmpStr.push('<span class="address_cont"><a name="sendWords" data-classCode='+linkmanClassGroup.cid+' data-index="'+i+'-'+j+'-'+z+'" href="javascript:;"><img src="../../images/ico_xx.png" /></a><a name="onPhone" href="tel:'+linkmanContact.phone+'"><img src="../../images/ico_phone.png" /></a></span></li>');
								}else{  //未关注
									tmpStr.push('<li '+liClassName+' name="parDetail" data-index="'+i+'-'+j+'-'+z+'" ><img src="../../images/user_pace_no_s.png" /><b>'+linkmanChild.stuName+' '+linkmanContact.tag+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em><br />');
									tmpStr.push('<span class="address_add" name="inviteAttention" >邀请关注</span></li>');
								}
							}
							tmpStr.push('</ul>');
						}
					}
				}
				tmpStr.push('</div>');
			}
		}
		if(tmpStr.length == 0 && selectType == 0){
			isNotTeach = 0;
			$(".address_par_nodate").show();
		}else{
			$(".address_par_nodate").hide();
		}
		return tmpStr.join('');
	}
	
	//教师向家长发送留言
	function sendWords(i,j,z){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var parListResp = JSON.parse(storage.getLocalStorage("classLinkman_"+cropId));
		var linkmanClassGroup = parListResp.items[i];
		var linkmanChild = linkmanClassGroup.childs[j];
		var linkmanContact = linkmanChild.parents[z];
		var parObj = {
				userId:linkmanContact.uuid,
				icon:linkmanContact.icon,
				phone:linkmanContact.phone,
				name:linkmanContact.name,
				stuId:linkmanChild.stuId,
				stuName:linkmanChild.stuName,
				followed:linkmanContact.followed,
				cid:linkmanClassGroup.cid,
				className:linkmanClassGroup.className,
				tag:linkmanContact.tag,
				targetUserType:2
			}
		storage.setSessionStorage("paramValue",JSON.stringify(parObj));
		document.location.href = SERVER_WORD_URL+"?classCode="+linkmanClassGroup.cid+"&targetUuid="+linkmanContact.uuid+"&targetName="+encodeURI(linkmanContact.name)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
	}
	
	//教师向教师发送留言
	function sendWordsTea(i,j){
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var teaListResp = JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId));
		var linkmanContact = teaListResp.items[i].teachers[j];
		var teaObj = {
			cropId:cropId,
			userId:linkmanContact.uuid,
			icon:linkmanContact.icon,
			phone:linkmanContact.phone,
			name:linkmanContact.name,
			followed:linkmanContact.followed,
			targetUserType:1
		}
		storage.setSessionStorage("paramValue",JSON.stringify(teaObj));
		document.location.href = SERVER_WORD_URL+"?&targetUuid="+linkmanContact.uuid+"&targetName="+encodeURI(linkmanContact.name)+"&cropId="+cropId+"&userId="+userId+"&funcType=0&funUniq=";
	}
	
	//跳转至教师详细
	function goTeaDetail(i,j){
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var teaListResp = JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId));
		var linkmanContact = teaListResp.items[i].teachers[j];
		var teaObj = {
			cropId:cropId,
			userId:linkmanContact.uuid,
			icon:linkmanContact.icon,
			phone:linkmanContact.phone,
			name:linkmanContact.name,
			followed:linkmanContact.followed,
		}
		storage.setSessionStorage("lm_tea_detail",JSON.stringify(teaObj));
		document.location.href = SERVER_TEA_DETAIL_URL + "?cropId="+cropId+"&userId="+userId+"&type=1";
		
	}
	
	//跳转至家长详细
	function goParDetail(i,j,z){
		
		var cropId = $("#cropId").val();
		var userId = $("#userId").val();
		var parListResp = JSON.parse(storage.getLocalStorage("classLinkman_"+cropId));
		var linkmanClassGroup = parListResp.items[i];
		var linkmanChild = linkmanClassGroup.childs[j];
		var linkmanContact = linkmanChild.parents[z];
		var parObj = {
			cropId:cropId,
			userId:linkmanContact.uuid,
			icon:linkmanContact.icon,
			phone:linkmanContact.phone,
			name:linkmanContact.name,
			stuId:linkmanChild.stuId,
			stuName:linkmanChild.stuName,
			followed:linkmanContact.followed,
			cid:linkmanClassGroup.cid,
			className:linkmanClassGroup.className,
			tag:linkmanContact.tag
		}
		storage.setSessionStorage("lm_par_detail",JSON.stringify(parObj));
		document.location.href = SERVER_PAR_DETAIL_URL + "?cropId="+cropId+"&userId="+userId+"&type=1";
		
	}
	
	//菜单slide
	function slideSelect(obj,type,detpId){
		$($(obj).find("span")[0]).toggleClass("dy_more").toggleClass("dy_some");
		if(type == 1){  //教师
			$("#tea_"+detpId).slideToggle(300);
		}else{  //家长
			$("#par_"+detpId).slideToggle(300);
		}
	}
	
	//邀请关注
	function invitePerson(){
		var schoolInfo = JSON.parse(storage.getSessionStorage("school_info"));
		document.location.href = SERVER_SHARE_URL + "?cropId="+schoolInfo.cropId+"&schoolCode="+schoolInfo.schoolCode+"&schoolName="+schoolInfo.schoolName;
	}
	
	//生成搜索页页
	function genSearchHtml(searchValue){
		
		var cropId = $("#cropId").val();
		if(searchValue && searchValue.trim() != ''){
			searchValue = searchValue.trim();
			var teaListResp = JSON.parse(storage.getLocalStorage("teaLinkman_"+cropId));
			var parListResp = JSON.parse(storage.getLocalStorage("classLinkman_"+cropId));
			
			var tmpStr = new Array();
			if(teaListResp){
				for(var i=0;i<teaListResp.items.length;i++){
					tmpStr.push('<div class="search_list">');
					var linkmanDepartGroup = teaListResp.items[i];
					tmpStr.push('<div class="tit">'+linkmanDepartGroup.deptName+'</div>');
					if(linkmanDepartGroup.teachers && linkmanDepartGroup.teachers.length > 0){
						tmpStr.push('<div class="con">');
						tmpStr.push('<ul class="tea_list">');
						for(var j=0;j<linkmanDepartGroup.teachers.length;j++){
							var linkmanContact = linkmanDepartGroup.teachers[j];
							if(linkmanContact.name.indexOf(searchValue) >= 0){
								var liClassName = '';
								if(j == linkmanDepartGroup.teachers.length - 1){
									liClassName = 'class="line_none"';
								}
								if(linkmanContact.followed == 1){  //关注
									tmpStr.push('<li '+liClassName+' name="teaDetail" data-index="'+i+'-'+j+'" ><img src="'+linkmanContact.icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'"  /><b>'+linkmanContact.name+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em>');
									tmpStr.push('<span class="address_cont"><a name="sendWordsTea" data-index="'+i+'-'+j+'" href="javascript:;"><img src="../../images/ico_xx.png" /></a><a name="onPhone" href="tel:'+linkmanContact.phone+'"><img src="../../images/ico_phone.png" /></a></span></li>');
								}else{  //未关注
									tmpStr.push('<li '+liClassName+' name="teaDetail" data-index="'+i+'-'+j+'" ><img src="../../images/user_pace_no_s.png" /><b>'+linkmanContact.name+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em>');
									tmpStr.push('<span class="address_add" name="inviteAttention" >邀请关注</span></li>');
								}
							}
						}
						tmpStr.push('</ul>');
						tmpStr.push('</div>');
					}
					tmpStr.push('</div>');
				}
			}
			
			if(parListResp.items){
				for(var i=0;i<parListResp.items.length;i++){
					linkmanClassGroup = parListResp.items[i];
					if(linkmanClassGroup.childs && linkmanClassGroup.childs.length > 0){
						tmpStr.push('<div class="search_list">');
						tmpStr.push('<div class="tit">'+linkmanClassGroup.className+'</div>');
						tmpStr.push('<div class="con">');
						for(var j=0;j<linkmanClassGroup.childs.length;j++){
							var linkmanChild = linkmanClassGroup.childs[j];
							if(linkmanChild.parents && linkmanChild.parents.length > 0){
								if(linkmanChild.stuName.indexOf(searchValue) >= 0){
									tmpStr.push('<ul class="par_list">');
									for(var z=0;z<linkmanChild.parents.length;z++){
										var linkmanContact = linkmanChild.parents[z];
										var liClassName = '';
										if(z == linkmanChild.parents.length - 1){
											liClassName = 'class="line_none"';
										}
										if(linkmanContact.followed == 1){  //关注
											tmpStr.push('<li '+liClassName+' name="parDetail" data-index="'+i+'-'+j+'-'+z+'" ><img src="'+linkmanContact.icon+'" onerror="javascript:this.src=\'../../images/user_pace_no1_s.png\'" /><b>'+linkmanChild.stuName+' '+linkmanContact.tag+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em><br />');
											tmpStr.push('<span class="address_cont"><a name="sendWords" data-classCode='+linkmanClassGroup.cid+' data-index="'+i+'-'+j+'-'+z+'" href="javascript:;"><img src="../../images/ico_xx.png" /></a><a name="onPhone" href="tel:'+linkmanContact.phone+'"><img src="../../images/ico_phone.png" /></a></span></li>');
										}else{  //未关注
											tmpStr.push('<li '+liClassName+' name="parDetail" data-index="'+i+'-'+j+'-'+z+'" ><img src="../../images/user_pace_no_s.png" /><b>'+linkmanChild.stuName+' '+linkmanContact.tag+'</b><br /><em>'+hidePhone(linkmanContact.phone)+'</em><br />');
											tmpStr.push('<span class="address_add" name="inviteAttention" >邀请关注</span></li>');
										}
									}
									tmpStr.push('</ul>');
								}
							}
						}
						tmpStr.push('</div>');
						tmpStr.push('</div>');
					}
				}
			}
			$(".search_box").html(tmpStr.join(''));
			$(".address_box").hide();
			$(".search_box").fadeIn(400);
		}else{
			$(".search_box").hide();
			$(".address_box").fadeIn(400);
		}
		
	}
	
	//获取教师申请加入未处理条数
	function getCountOfTeaApply(userId, cropId, ia){
		if(ia == 1){
			$.post(SERVER_GET_APPLY_COUNT,
				{
					userId:userId,
					corpId:cropId
				},function(result){
					if(result.resultCode == '001' && result.count != null && result.count > 0){
						$("#newApplyCount").html(''+result.count);
						$(".new_yz").show();
					}
				}
			);
		}
	}
	
	//隐藏手机号码
	function hidePhone(phone){
		if(phone && phone.length == 11){
			return phone.substring(0,3)+"*****"+phone.substring(8,11);
		}
		return phone;
	}
	
});
