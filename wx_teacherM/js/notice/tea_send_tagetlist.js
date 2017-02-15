//服务
//var _SERVICE = 'http://xxxxx/webapp/msg/linkmanAll';
define(function(require, exports, module) {
	
	var qt_model={};
	//引用依赖模块
	var $ = require("jquery");
	var common = require('common');
	var tip = require('widget/tip');
	var wxApi = require('wxApi');
	
	//教师uuid
	var _context_uuid="";
	//学校编码
	var _context_schoolCode="";
	var _cropId="";
	var ctx="";
	var _SERVICE = "";
	
	var _SHOWDATA = {};
	
	/**
	 * 初始化操作
	 */
	function init(){
		common.fclog('WXTZ');
		_context_uuid=common.getUrlParam("userId");
		_context_schoolCode=common.getUrlParam("schoolCode");
		_cropId=common.getUrlParam("cropId");
		ctx=common.ctx;
		
		wxApi.wxConfig(_cropId,['hideAllNonBaseMenuItem'],window.location.href,function(){
			wxApi.hideAllNonBaseMenuItem();
		});   //js-sdk验证
		
		$.post(common.ctx+"/wap/tea/notice/permiss",
				{
					userId:_context_uuid,
					cropId:_cropId
				},
				function(result){
					if(common.verifyToken(result,_cropId)){
						var dataType = "2";
						if(result.resultCode == '001'){
							if(result.type == 1){
								dataType = "1,2";
							}
						}
						_SERVICE = common.ctx+'/wap/data/sendTarget?schoolCode='+_context_schoolCode+'&uid='+_context_uuid+'&type=2&dataType='+dataType;
						
						//初始化选择角色步骤
						initTargetSelect();
					}
				}
			);
	}
	
	//初始化发送对象选择
	function initTargetSelect(){
		//绑定选择学生
		$('#selectTargetFinishBtn').off().click(function(){
			//计算sendTarget，逐个班计算
			var sendTarget = [];
			var multiCache = {};
			var targetNum = 0;
			$('#targetBox').find('.operate-class').each(function(index,obj){
				var item = $(obj);
				//判断是否全班选择
				if('1' == item.find('span').eq(0).data('checked')){
					//选了全班
					sendTarget.push({
						pkuid : item.attr('data-classid'),
						name : item.attr('data-name'),
						type : item.attr('data-sendtype'),
					});
				}else{
					//要加单独的学生
					item.parent().find('.fs_list .op-checked').each(function(index,sobj){
						var item = $(sobj);
						if(!multiCache[item.attr('data-uuid')]){
							sendTarget.push({
								pkuid : item.attr('data-uuid'),
								name : item.attr('data-name'),
								type : item.attr('data-sendtype'),
							});
							multiCache[item.attr('data-uuid')] = true;
						}
					});
				}
				targetNum = targetNum + item.parent().find('.fs_list .op-checked').size();
			});
			console&&console.log('debug:'+JSON.stringify(sendTarget));
			if(targetNum <=0){
				//没有选择人，执行错误处理，这里暂时用alert
				alert('没有选择用户');
				return;
			}
			sessionStorage.setItem('sendTarget',JSON.stringify(sendTarget));
			sessionStorage.setItem('targetNum',targetNum);
			//跳转到最后一步
			location.href=ctx+'/wap/html/notice/tea_send_notice.html?'+'userId='+_context_uuid+'&cropId='+_cropId+"&schoolCode="+_context_schoolCode;
			//接口提交页，
			//sessionStorage.getItem('sendTarget')
		});
		//填充可以选择的学生数据
		var params = {
			uuid : _context_uuid,
			schoolCode : _context_schoolCode,
			'type' : 2,
			'dataType' : '1,2'
		};
		//loading与数据切换
		$('#loading').show();
		//$('#targetBox').hide();

		$.post(_SERVICE,{
			
		},function(rtn){
			$('#loading').hide();
			$('#targetBox').show();
			if('001' == rtn.resultCode){
				_SHOWDATA = rtn;   //保存数据致内存
				fillData(rtn);
				fillSearchData(rtn);
				checkData();
			}else{
				tip.openAlert1('提示',rtn.resultMsg);
			}
		});
		
		//显示搜索页面
		$(".search1").click(function(){
			$("#optCommon").hide();
			$("#optSearch").show();
		});
		
		//取消搜索页面
		$("#cancelSearch").click(function(){
			$("#optSearch").hide();
			$("#optCommon").show();
		});
		
		//事件绑定
		$("#search_content").change(function(){
			var param = $.trim(this.value);
			fiterSearchData(param);
		});
		
		$("#optSearch").on("click","[name='search_person_obj']",function(){
			var obj = $(this);
			var sendTarget = [];
			sendTarget.push({
				pkuid : obj.attr('data-uuid'),
				name : obj.attr('data-name'),
				type : obj.attr('data-sendtype')
			});
			
			sessionStorage.setItem('sendTarget',JSON.stringify(sendTarget));
			sessionStorage.setItem('targetNum',1);
			//跳转到最后一步
			location.href=ctx+'/wap/html/notice/tea_send_notice.html?'+'userId='+_context_uuid+'&cropId='+_cropId+"&schoolCode="+_context_schoolCode;
			
		});
		
		//清除搜索内容
		$(".de_src").click(function(){
			$("#search_content").val('');
			fiterSearchData('');
		});
		
	}
	
	//过滤搜索条件
	function fiterSearchData(param){
		if(!param || param == ''){
			fillSearchData(_SHOWDATA);
		}else{
			var tmpDaataList = {
					studentTargets:[],
					teacherTargets:[],
			};
			var temp = _SHOWDATA;
			
			//筛选学生数据
			if(temp.studentTargets){
				var SendTargetGroup = {
						className:null,
						cid:null,
						type:null,
						citems:[]
				}
				for(var i=0;i<temp.studentTargets.length;i++){
					var classItem = temp.studentTargets[i];
					SendTargetGroup.className = classItem.className;
					SendTargetGroup.cid = classItem.cid;
					SendTargetGroup.type = classItem.type;
					for(var j=0;j<classItem.citems.length;j++){
						if(classItem.citems[j].name && classItem.citems[j].name.indexOf(param) >= 0){
							SendTargetGroup.citems.push(classItem.citems[j]);
						}
					}
				}
			}
			tmpDaataList.studentTargets.push(SendTargetGroup);
			
			//筛选教师数据
			if(temp.teacherTargets){
				var SendTargetGroup = {
						className:null,
						cid:null,
						type:null,
						citems:[]
				}
				for(var i=0;i<temp.teacherTargets.length;i++){
					var deptItem = temp.teacherTargets[i];
					SendTargetGroup.className = deptItem.className;
					SendTargetGroup.cid = deptItem.cid;
					SendTargetGroup.type = deptItem.type;
					for(var j=0;j<deptItem.citems.length;j++){
						if(deptItem.citems[j].name && deptItem.citems[j].name.indexOf(param) >= 0){
							SendTargetGroup.citems.push(deptItem.citems[j]);
						}
					}
				}
			}
			tmpDaataList.teacherTargets.push(SendTargetGroup);
			
			//填充搜索信息
			fillSearchData(tmpDaataList);
		}
	}
	
	//填充选择搜索对像
	function fillSearchData(rtn){
		//填充学生
		var stuHtml = '';
		if(rtn.studentTargets && rtn.studentTargets.length>0){
			stuHtml += '<h2>学生</h2><ul>';
			for(var i=0;i<rtn.studentTargets.length;i++){
				var classItem = rtn.studentTargets[i];
				for(var j=0;j<classItem.citems.length;j++){
					if('1' == classItem.citems[j].followed){
						stuHtml += '<li name="search_person_obj" data-uuid="'+classItem.citems[j].uuid+'" data-sendtype="1" data-name="'+classItem.citems[j].name+'" >'+classItem.citems[j].name+'<b>（'+classItem.className+'）</b></li>';
					}else{
						//stuHtml += '<li onclick="">'+classItem.citems[j].name+'<b>（'+classItem.className+'）</b><span class="pay_us">未关注</span></li>';
						stuHtml += '<li name="search_person_obj" data-uuid="'+classItem.citems[j].uuid+'" data-sendtype="1" data-name="'+classItem.citems[j].name+'" >'+classItem.citems[j].name+'<b>（'+classItem.className+'）</b></li>';
					}
				}
			}
			stuHtml += '</ul>';
		}
		$("#search_student").html(stuHtml);
		
		//填充教师
		var teaHtml = '';
		if(rtn.teacherTargets && rtn.teacherTargets.length>0){
			teaHtml += '<h2>教师</h2><ul>';
			for(var i=0;i<rtn.teacherTargets.length;i++){
				var deptItem = rtn.teacherTargets[i];
				for(var j=0;j<deptItem.citems.length;j++){
					if('1' == deptItem.citems[j].followed){
						teaHtml += '<li name="search_person_obj" data-uuid="'+deptItem.citems[j].uuid+'" data-sendtype="3" data-name="'+deptItem.citems[j].name+'" >'+deptItem.citems[j].name+'<b>（'+deptItem.className+'）</b></li>';
					}else{
						//teaHtml += '<li onclick="">'+deptItem.citems[j].name+'<b>（'+deptItem.className+'）</b><span class="pay_us">未关注</span></li>';
						teaHtml += '<li name="search_person_obj" data-uuid="'+deptItem.citems[j].uuid+'" data-sendtype="3" data-name="'+deptItem.citems[j].name+'" >'+deptItem.citems[j].name+'<b>（'+deptItem.className+'）</b></li>';
					}
				}
			}
			teaHtml += '</ul>';
		}
		$("#search_teacher").html(teaHtml);
	}

	//填充选择对象
	function fillData(rtn){
		var html = new Array();
		var isHideClass = (rtn.studentTargets && rtn.studentTargets.length>5) || (rtn.teacherTargets && rtn.teacherTargets.length>5);
		//填充学生
		var result = rtn.studentTargets;
		if(result && result.length >0){
			html.push('<p class="tz-tit1"><a href="javascript:;" class="operate-all operate-btn1"><span class="op-check"></span>学生<span class="'+(isHideClass?'dy_more':'dy_some')+'">&nbsp;</span></a></p>');
		}else{
			$('#studentBox').hide();
		}
		html.push('<ul class="classlist" style="padding:0 12px 0 0; '+(isHideClass?'display:none;':'')+'">');
		if(result){
			for(var i=0;i<result.length;i++){
				var item = result[i];
				//逐个班填充
				html.push('<li>');
				html.push('<a href="javascript:;" class="operate-class operate-btn1" data-classid="'+item.cid+'" data-sendtype="2" data-name="'+item.className+'"><span class="op-check"></span>'+item.className+'<span class="dy_more">&nbsp;</span></a>');
				if(i != (result.length - 1)){
					html.push('<hr/>');
				}
				//填充学生列表
				html.push('<div class="fs_list" style="display:none;">');
				var citems = item.citems;
				for(var j=0;j<citems.length;j++){
					var citem = citems[j];
					//html.push('<p><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="1" data-name="'+citem.name+'"></span>'+citem.name+'<span title="已关注企业号" class="pay_us">'+('1' == citem.followed?'已关注':'未关注')+'</span></a></p>');
					html.push('<p><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="1" data-name="'+citem.name+'"></span>'+citem.name+'</a></p>');
				}
				html.push('</div>');
				html.push('</li>');
			}
		}
		html.push('</ul>');
		$('#studentBox').html(html.join(''));

		//填充教师
		html = new Array();
		result = rtn.teacherTargets;
		if(result && result.length >0){
			html.push('<p class="tz-tit1"><a href="javascript:;" class="operate-all operate-btn1"><span class="op-check"></span>老师<span class="'+(isHideClass?'dy_more':'dy_some')+'">&nbsp;</span></a></p>');
		}else{
			$('#teacherBox').hide();
		}
		html.push('<ul class="classlist" style="padding:0 12px 0 0; '+(isHideClass?'display:none;':'')+'">');
		if(result){
			for(var i=0;i<result.length;i++){
				var item = result[i];
				//逐个分组填充
				html.push('<li>');
				html.push('<a href="javascript:;" class="operate-class operate-btn1" data-classid="'+item.cid+'" data-sendtype="4" data-name="'+item.className+'"><span class="op-check"></span>'+item.className+'<span class="dy_more">&nbsp;</span></a>');
				if(i != (result.length - 1)){
					html.push('<hr/>');
				}
				//填充老师列表
				html.push('<div class="fs_list" style="display:none;">');
				var citems = item.citems;
				for(var j=0;j<citems.length;j++){
					var citem = citems[j];
					//html.push('<p><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="3" data-name="'+citem.name+'"></span>'+citem.name+'<span title="已关注企业号" class="pay_us">'+('1' == citem.followed?'已关注':'未关注')+'</span></a></p>');
					html.push('<p><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="3" data-name="'+citem.name+'"></span>'+citem.name+'</a></p>');
					
				}
				html.push('</div>');
				html.push('</li>');
			}
		}
		html.push('</ul>');
		$('#teacherBox').html(html.join(''));
		var targetBox = $('#targetBox');
		//绑定所有全选事件
		$('#allSelectBtn').off().click(function(){
			var item = $(this);
			var box = $('#targetBox');
			if('1' == item.data('checked')){
				//已经勾选变成非勾选
				box.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
				item.data('checked','0');
			}else{
				//非勾选变成已经勾选
				box.find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
				item.data('checked','1');
			}
			return false;
		});
		//绑定分类全选事件
		targetBox.find('.operate-all .op-check').off().click(function(){
			var item = $(this);
			var box = item.parent().parent().parent();
			if('1' == item.data('checked')){
				//已经勾选变成非勾选
				box.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
				item.data('checked','0');
				//取消全局勾选
				$('#allSelectBtn').removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				//非勾选变成已经勾选
				box.find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
				item.data('checked','1');
			}
			return false;
		});
		//绑定分类切换显示
		targetBox.find('.operate-all').off().click(function(){
			var item = $(this);
			var ul = item.parent().next();
			if('1' == item.data('fold')){
				//原来已经折叠
				item.data('fold','0');
				item.find('.dy_more').removeClass('dy_more').addClass('dy_some');
				ul.css('height','0px').show();
				ul.animate({height:ul.attr('data-height')+'px'},200,function(){
					ul.css('height','auto');
				});
			}else{
				//先保存当前的高度
				ul.attr('data-height',ul.height());
				item.data('fold','1');
				item.find('.dy_some').removeClass('dy_some').addClass('dy_more');
				ul.animate({height:'0px'},200,function(){
					ul.hide();
				});
			}
		}).data('fold',isHideClass?'1':'0');

		//绑定班级勾选
		targetBox.find('.operate-class .op-check').off().click(function(e){
			var item = $(this);
			var parent = $(this).parent();
			var box = parent.parent().parent().parent();
			var fslist = parent.parent().find('.fs_list');

			if('1' == item.data('checked')){
				item.removeClass('op-checked').addClass('op-check').data('checked','0');
				fslist.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
				//同时修改为非全选
				box.find('.operate-all span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
				$('#allSelectBtn').removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				item.removeClass('op-check').addClass('op-checked').data('checked','1');
				fslist.find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
			}
			return false;
		});
		//绑定班级详情切换展示
		targetBox.find('.operate-class').off().click(function(){
			var item = $(this);
			var fslist = item.parent().find('.fs_list');
			if('1' == item.data('fold')){
				//原来已经折叠
				item.data('fold','0');
				item.find('.dy_more').removeClass('dy_more').addClass('dy_some');
				//item.next().slideDown('fast');
				fslist.css('height','0px').show();
				fslist.animate({height:fslist.attr('data-height')+'px'},200,function(){

				});
			}else{
				item.data('fold','1');
				item.find('.dy_some').removeClass('dy_some').addClass('dy_more');
				//item.next().slideUp('fast');
				fslist.animate({height:'0px'},200,function(){
					fslist.hide();
				});
			}
		}).data('fold','1');

		//绑定单个学生勾选
		targetBox.find('.fs_list .op-check').off().click(function(){
			var item = $(this);
			var box = item.parent().parent().parent().parent().parent().parent();
			if('1' == item.data('checked')){
				item.removeClass('op-checked').addClass('op-check').data('checked','0');
				//同时修改为非全选
				box.find('.operate-all span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
				$('#allSelectBtn').removeClass('op-checked').addClass('op-check').data('checked','0');
				//修改班级非全选
				item.parent().parent().parent().parent().find('.operate-class span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				item.removeClass('op-check').addClass('op-checked').data('checked','1');
			}
		});

		//兼容样式
		targetBox.find('.fs_list').each(function(){
			var _this = $(this);
			var as = _this.find('p');
			var len = as.size();
			var _height = len * 46;
			_this.css('height',_height+'px').attr('data-height',_height);
		});

		targetBox.find('.classlist').each(function(){
			var _this = $(this);
			var as = _this.find('.operate-class');
			var len = as.size();
			var _height = len * 49;
			_this.attr('data-height',_height);
		});
	}

	//从返回按钮回来，重新勾选
	function checkData(){
		var sendTarget = sessionStorage.getItem('sendTarget');
		sessionStorage.removeItem('sendTarget');
		if(!sendTarget){
			return;
		}
		sendTarget = JSON.parse(sendTarget);
		for(var i=0;i<sendTarget.length;i++){
			var item = sendTarget[i];
			if(2 == item.type || 4 == item.type){
				$('.classlist a[data-classid='+item.pkuid+']').find('span').eq(0).trigger('click');
			}else{
				$('.classlist span[data-uuid='+item.pkuid+']').trigger('click');
			}
		}
	}


	//入口
	init();
	//测试代码



	module.exports = qt_model;

});
