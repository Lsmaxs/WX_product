define(function(require, exports, module) {
	/**
	 * @desc 
	 * @exports
	 * @version 1.8.4
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var qt_ui = require('qt/ui');
	var _common = require('./common');


	//服务
	var _SERVICE = _common.SERVICE;

	//发送对象配置值
	var _SEND_TYPE = {
		student : '1',
		classGroup : '2',
		teacher : '3',
		teacherGroup : '4',
		parent : '5'
	}


	var options = {};


	//查询通讯录数据
	function queryData(callback){
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}

		//填充可以选择的家长教师数据
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'isRefresh' : 0
		};
		//_common.showLoading();
		//$('#targetBox').hide();
		_common.post(_SERVICE+'/webapp/linkman/list',params,function(rtn){
			//_common.hideLoading();
			//$('#targetBox').show();
			if('001' == rtn.resultCode){
				//填充联系人
				fillContact(rtn);
				callback && callback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	//填充选择的人
	function fillContact(rtn){
		var items = rtn.linkmanParent;
		var html = new Array();

		//填充学生
		if(options.type.indexOf('1')>=0){
			for(var i=0;i<items.length;i++){
				//逐个班添加
				var item = items[i];
				html.push(_getStudentGroupHtml(item));
			}
			var _htmlstr = html.join('<hr/>');
			if(options.multi){
				_htmlstr = _htmlstr.replace(/op-radio/ig,'op-check');
			}
			$('#studentBox .classlist').html(_htmlstr);
		}
		if(options.type.indexOf('3')>=0){
			//填充家长
			html = new Array();
			for(var i=0;i<items.length;i++){
				//逐个班添加
				var item = items[i];
				html.push(_getParentGroupHtml(item));
			}
			_htmlstr = html.join('<hr/>');
			if(options.multi){
				_htmlstr = _htmlstr.replace(/op-radio/ig,'op-check');
			}
			$('#parentBox .classlist').html(_htmlstr);
		}
		if(options.type.indexOf('2')>=0){
			//填充教师
			html = new Array();
			if(options.filterListArry&&options.filterListArry.length>0){
				items =filterLinkManList(options.filterListArry,rtn.linkmanTeacher);
			}else{
				items = rtn.linkmanTeacher;
			}
			// items = rtn.linkmanTeacher;
			for(var i=0;i<items.length;i++){
				var item = items[i];
				html.push(_getTeacherGroupHtml(item));
			}
			_htmlstr = html.join('<hr/>');
			if(options.multi){
				_htmlstr = _htmlstr.replace(/op-radio/ig,'op-check');
			}
			$('#teacherBox .classlist').html(_htmlstr);
		}
	}

	/**
	 * 过滤联系人(教师 || 家长||学生)列表
	 * @param arr1 : 要过滤的值的数组
	 * @param arr2 : 被过滤的数组
	 * 			
	 */
	function filterLinkManList(arr1, arr2) {
		var useridArr = new Array();
		var newArr = new Array();
		// 遍历已选择的人员userId
		for (var i = 0; i < arr1.length; i++) {
			useridArr.push(arr1[i].userId);
		}

		// 遍历教师名单中uuid
		for (var item = 0; item < arr2.length; item++) {
			newArr.push(arr2[item]);
			var teachers = arr2[item].teachers;
			if (teachers.length > 0) {
				for (var j = 0; j < teachers.length; j++) {
					var _uuid = teachers[j].uuid;
					if (useridArr.indexOf(_uuid) > -1) {
						newArr[item].teachers[j] = {};
					}
				}
			}
		}
		return newArr;
	}

	//获取新的班级html
	function _getStudentGroupHtml(item){
		//缓存，方便搜索
		if(!searchCacheMap['group'+item.cid]){
			var cacheObj = {
				unique : 'group'+item.cid,
				keyword : item.className,
				uuid : '',
				name : '',
				nametag : item.className,
				groupid : item.cid,
				groupname : '',
				icon : './images/ico_file.gif',
				sendType : _SEND_TYPE.classGroup
			}
			searchCacheMap['group'+item.cid] = cacheObj;
			searchCacheList.push(cacheObj);
		}
		
		var childs = item.childs;
		var followed = new Array()
		var nofollow = new Array();
		for(var i=0;i<childs.length;i++){
			var child = childs[i];
			var isFollow = false;
			for(var j=0;j<child.parents.length;j++){
				var parent = child.parents[j];
				if('1' == parent.followed){
					isFollow = true;
					break;
				}
			}
			if(isFollow){
				followed.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" data-sendType="'+_SEND_TYPE.student+'" data-groupid="'+item.cid+'" data-groupname="'+item.className+'" data-uuid="'+child.stuId+'" data-name="'+child.stuName+'"></span>'+child.stuName+'</a>');
				//缓存，方便搜索
				if(!searchCacheMap[child.uuid]){
					var cacheObj = {
						unique : child.stuId,
						keyword : child.stuName,
						uuid : child.stuId,
						name : child.stuName,
						nametag : child.stuName,
						groupid : item.cid,
						groupname : item.className,
						icon : '',
						sendType : _SEND_TYPE.student
					}
					searchCacheMap[child.stuId] = cacheObj;
					searchCacheList.push(cacheObj);
				}
			}else{
				//未关注
				nofollow.push(child.stuName);
			}
		}

		//分组前是否出现选择
		var isGroupSelect = options.multi || options.level<=1;

		var html = new Array();
		html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.cid+'" ><span class="op-radio" data-sendType="'+_SEND_TYPE.classGroup+'" data-groupid="'+item.cid+'" data-groupname="'+item.className+'" data-num="'+followed.length+'" '+(isGroupSelect?'':'style="display:none;"')+'></span>'+item.className);
		if(options.isGroupTag){
			html.push('<em>学生'+item.stuCount+'人/未关注'+nofollow.length+'人</em>');
		}
		html.push('<span class="jt_down" '+(options.level<=1?'style="display:none;"':'')+'></span></a>');
		html.push('<div class="fs_list" style="display:none;">');
		html.push('	<div class="gz_tit">');
		html.push('		<p>已关注<em>'+followed.length+'人</em></p>');
		html.push('	    '+followed.join(''));
		html.push('	</div>');
		html.push('	<div class="wgz_tit">');
		html.push('		<p>未关注<em>'+nofollow.length+'人</em></p>');
		html.push('		'+nofollow.join('、'));
		html.push('	</div>');
		html.push('</div>');
		return html.join('');
	}

	//获取新的班级html
	function _getParentGroupHtml(item){
		//缓存，方便搜索
		if(!searchCacheMap['group'+item.cid]){
			var cacheObj = {
				unique : 'group'+item.cid,
				keyword : item.className,
				uuid : '',
				name : '',
				nametag : item.className,
				groupid : item.cid,
				groupname : '',
				icon : './images/ico_file.gif',
				sendType : _SEND_TYPE.classGroup
			}
			searchCacheMap['group'+item.cid] = cacheObj;
			searchCacheList.push(cacheObj);
		}

		var childs = item.childs;
		var followed = new Array()
		var nofollow = new Array();
		for(var i=0;i<childs.length;i++){
			var child = childs[i];
			for(var j=0;j<child.parents.length;j++){
				var parent = child.parents[j];
				if('1' == parent.followed){
					//已经关注
					followed.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" data-sendType="'+_SEND_TYPE.parent+'" data-groupid="'+item.cid+'" data-groupname="'+item.className+'" data-uuid="'+parent.uuid+'" data-name="'+parent.name+'" data-nametag="'+parent.name+'('+child.stuName+' '+parent.tag+')'+'" data-icon="'+parent.icon+'"></span>'+parent.name+'('+child.stuName+' '+parent.tag+')</a>');
					//缓存，方便搜索
					if(!searchCacheMap[parent.uuid]){
						var cacheObj = {
							unique : parent.uuid,
							keyword : child.stuName +'_'+ parent.name,
							uuid : parent.uuid,
							name : parent.name,
							nametag : parent.name + '('+child.stuName+' '+parent.tag+')',
							groupid : item.cid,
							groupname : item.className,
							icon : parent.icon,
							sendType : _SEND_TYPE.parent
						}
						searchCacheMap[parent.uuid] = cacheObj;
						searchCacheList.push(cacheObj);
					}
				}else{
					//未关注
					nofollow.push(parent.name+'('+child.stuName+' '+parent.tag+')');
				}
			}
		}

		//分组前是否出现选择
		var isGroupSelect = options.multi || options.level<=1;
		var html = new Array();
		html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.cid+'" ><span class="op-radio" data-sendType="'+_SEND_TYPE.classGroup+'" data-groupid="'+item.cid+'" data-groupname="'+item.className+'" data-num="'+followed.length+'" '+(isGroupSelect?'':'style="display:none;"')+'></span>'+item.className);
		if(options.isGroupTag){
			html.push('<em>学生'+item.stuCount+'人/家长'+item.parentCount+'人/未关注'+nofollow.length+'人</em>');
		}
		html.push('<span class="jt_down" '+(options.level<=1?'style="display:none;"':'')+'></span></a>');
		html.push('<div class="fs_list" style="display:none;">');
		html.push('	<div class="gz_tit">');
		html.push('		<p>已关注<em>'+followed.length+'人</em></p>');
		html.push('	    '+followed.join(''));
		html.push('	</div>');
		html.push('	<div class="wgz_tit">');
		html.push('		<p>未关注<em>'+nofollow.length+'人</em></p>');
		html.push('		'+nofollow.join('、'));
		html.push('	</div>');
		html.push('</div>');

		return html.join('');
	}

	//获取新的教师html
	function _getTeacherGroupHtml(item){
		//缓存，方便搜索
		if(!searchCacheMap['group'+item.deptId]){
			var cacheObj = {
				unique : 'group'+item.deptId,
				keyword : item.deptName,
				uuid : '',
				name : '',
				nametag : item.deptName,
				groupid : item.deptId,
				groupname : '',
				icon : './images/ico_file.gif',
				sendType : _SEND_TYPE.teacherGroup
			}
			searchCacheMap['group'+item.deptId] = cacheObj;
			searchCacheList.push(cacheObj);
		}

		var teachers = item.teachers;
		var followed = new Array()
		var nofollow = new Array();
		for(var i=0;i<teachers.length;i++){
			var teacher = teachers[i];
			if($.isEmptyObject(teacher)){
				continue;
			}

			if('1' == teacher.followed){
				//已经关注
				followed.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" data-sendType="'+_SEND_TYPE.teacher+'" data-groupid="'+item.deptId+'" data-groupname="'+item.deptName+'" data-uuid="'+teacher.uuid+'" data-name="'+teacher.name+'" data-nametag="'+teacher.name+'(教师)" data-icon="'+teacher.icon+'" data-phone="'+teacher.phone+'"></span>'+teacher.name+'</a>');
				//缓存，方便搜索
				if(!searchCacheMap[teacher.uuid]){
					var cacheObj = {
						unique : teacher.uuid,
						keyword : teacher.name,
						uuid : teacher.uuid,
						name : teacher.name,
						nametag : teacher.name+'(教师)',
						groupid : item.deptId,
						groupname : item.deptName,
						icon : teacher.icon,
						sendType : _SEND_TYPE.teacher
					}
					searchCacheMap[teacher.uuid] = cacheObj;
					searchCacheList.push(cacheObj);
				}
			}else if(!options.isShowFollwed&&'0' == teacher.followed){
				nofollow.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" data-sendType="'+_SEND_TYPE.teacher+'" data-groupid="'+item.deptId+'" data-groupname="'+item.deptName+'" data-uuid="'+teacher.uuid+'" data-name="'+teacher.name+'" data-nametag="'+teacher.name+'(教师)" data-icon="'+teacher.icon+'" data-phone="'+teacher.phone+'"></span>'+teacher.name+'</a>');
			}else{
				//未关注
				nofollow.push(teacher.name);
			}
		}

		//分组前是否出现选择
		var isGroupSelect = options.multi || options.level<=1;

		var html = new Array();
		html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.deptId+'" ><span class="op-radio" data-sendType="'+_SEND_TYPE.teacherGroup+'" data-groupid="'+item.deptId+'" data-groupname="'+item.deptName+'" data-num="'+followed.length+'" '+(isGroupSelect?'':'style="display:none;"')+'></span>'+item.deptName);
		if(options.isGroupTag){
			html.push('<em>'+item.teaCount+'人/未关注'+nofollow.length+'人</em>');
		}
		html.push('<span class="jt_down" '+(options.level<=1?'style="display:none;"':'')+'></span></a>');
		html.push('<div class="fs_list" style="display:none;">');
		if(!options.isShowFollwed){
			html.push(followed.join(''));
			html.push(nofollow.join(''));
		}else {
			html.push('	<div class="gz_tit">');
			html.push('		<p>已关注<em>'+followed.length+'人</em></p>');
			html.push('	    '+followed.join(''));
			html.push('	</div>');
			html.push('	<div class="wgz_tit">');
			html.push('		<p>未关注<em>'+nofollow.length+'人</em></p>');
			html.push('		'+nofollow.join('、'));
			html.push('	</div>');
		}
		html.push('</div>');
		return html.join('');
	}


	//初始化显示的对象
	function initShow(){
		if(true === options.isSearch){
			$('.targetselect_soso').show();
		}else{
			$('.targetselect_soso').hide();
		}
		
		if(true !== options.isShowSelect){
			$('.targetselect_send_obj').hide();
		}

		var types = options.type.split(',');
		var typeMap= {};
		for(var i=0;i<types.length;i++){
			typeMap[types[i]] = true;
		}
		if(typeMap['1']){
			$('#studentBox').show();
		}else{
			$('#studentBox').hide();
		}
		if(typeMap['2']){
			$('#teacherBox').show();
		}else{
			$('#teacherBox').hide();
		}
		if(typeMap['3']){
			$('#parentBox').show();
		}else{
			$('#parentBox').hide();
		}

		if(options.multi){
			$('.operate-all .op-check').show();
		}else{
			$('.operate-all .op-check').hide();
		}
	}


	//初始化
	function initSelectEvent(){

		var targetBox = $('#targetBox');
		var radios = $('.classlist .op-radio');

		targetBox.off().on('click','.operate-all,.operate-class',function(){
			//展开子级事件
			var _this = $(this);
			if(_this.hasClass('operate-class') && options.level<=1){
				_this.find('span').eq(0).trigger('click');
				return false;
			}
			var span = _this.find('span').eq(1);
			var box = _this.next();
			if(span.hasClass('jt_up')){
				//原来已经打开
				span.removeClass('jt_up').addClass('jt_down');
				box.slideUp('fast',function(){
					options.onHeightChange && options.onHeightChange();
				});
			}else{
				//原来关闭
				span.removeClass('jt_down').addClass('jt_up');
				box.slideDown('fast',function(){
					options.onHeightChange && options.onHeightChange();
				});
			}
		}).on('click','.operate-all .op-check,.operate-class .op-check',function(){
			//大类勾选&分组勾选事件(多选)
			var _this = $(this);
			var box = _this.parent().next();
			if(_this.hasClass('op-checked')){
				//原来已经勾选
				_this.removeClass('op-checked');
				box.find('.op-checked').removeClass('op-checked');
				if(_this.parent().hasClass('operate-class')){
					//点击的是班级，要取消大类的勾选
					_this.parent().parent().parent().find('.operate-all .op-check').removeClass('op-checked');
				}
			}else{
				_this.addClass('op-checked');
				box.find('.op-check').addClass('op-checked');
			}
			updateSelectedBox();
			return false;
		}).on('click','.operate-all .op-radio,.operate-class .op-radio',function(){
			var _this = $(this);
			//大类勾选&分组勾选事件(单选)
			radios.removeClass('op-radied');
			_this.addClass('op-radied');
			updateSelectedBox();
			return false;
		}).on('click','.classlist .operate-btn',function(){
			//列表内的选择按钮
			var _this = $(this);
			if(options.multi){
				//多选
				var checkbox = _this.find('.op-check');
				if(checkbox.hasClass('op-checked')){
					//原来已经勾选
					checkbox.removeClass('op-checked');
					//要取消班级的勾选
					_this.parent().parent().prev().find('.op-check').removeClass('op-checked');
				}else{
					checkbox.addClass('op-checked');
				}
			}else{
				//单选
				radios.removeClass('op-radied');
				_this.find('.op-radio').addClass('op-radied');
			}
			updateSelectedBox();
		});


		//绑定删除对象
		$('.targetselect_send_obj').off().on('click','.send_obj_del',function(){
			var _this = $(this).parent();
			var sendType = _this.attr('data-sendType');
			var groupid = _this.attr('data-groupid');
			var uuid = _this.attr('data-uuid');
			var name = _this.attr('data-name');
			if(sendType == _SEND_TYPE.classGroup || sendType == _SEND_TYPE.teacherGroup){
				//分组的情况
				if(options.multi){
					$('.operate-class [data-groupid="'+groupid+'"]').filter('.op-checked').trigger('click');
				}else{
					$('.operate-class [data-groupid="'+groupid+'"]').removeClass('op-radied');
					updateSelectedBox();
				}
			}else{
				//个人的情况，一个人有可能多个分组，所以要filter
				if(options.multi){
					$('[data-uuid="'+uuid+'"]').filter('[data-sendType="'+sendType+'"]').filter('[data-groupid="'+groupid+'"]').trigger('click');
				}else{
					$('[data-uuid="'+uuid+'"]').filter('[data-sendType="'+sendType+'"]').removeClass('op-radied');
					updateSelectedBox();
				}
			}
		});

		//绑定搜索
		var searchTimer = null;
		$('.soso_ip input').off().on('keyup',function(){
			//keyup事件
			var _this = $(this);
			searchTimer && clearTimeout(searchTimer);
			searchTimer = setTimeout(function(){
				showSearchResult(_this.val());
			},300);
		}).on('focus',function(){
			$(this).trigger('keyup');
		});
		$('.soso_list').off().on('mouseleave',function(){
			//keyup事件
			hideSearchResult();
		}).on('mouseenter',function(){
			//keyup事件
			$('.soso_ip input').blur();
		}).on('click','a',function(){
			var _this = $(this);
			var unique = _this.attr('data-unique');
			var searchObj = searchCacheMap[unique];

			var sendType = searchObj.sendType;
			var groupid = searchObj.groupid;
			var uuid = searchObj.uuid;
			var name = searchObj.name;
			var nametag = searchObj.nametag;

			if(sendType == _SEND_TYPE.classGroup || sendType == _SEND_TYPE.teacherGroup){
				//分组
				var check = $('.operate-class [data-groupid="'+groupid+'"]');
				//这里基于学生和家长不可能同时出现，否则这里可能有问题
				if(check.hasClass('op-checked') || check.hasClass('op-radied')){
					//do nothing
				}else{
					$('.operate-class [data-groupid="'+groupid+'"]').trigger('click');
				}
			}else{
				//个人
				var check = $('[data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]');
				if(options.multi){
					check.addClass('op-checked');
				}else{
					check.trigger('click');
				}
			}
			_common.tips('info','选择了“'+nametag+'”');
			updateSelectedBox();
		});

		//绑定选择学生
		$('#selectTargetFinishBtn').off().click(function(){
			if(options.isSelectPer){
				var items = $('.fs_list').find('.op-checked');
			}else{
				var items = $('.targetselect_send_obj .send_obj_item');
			}
			// var items = $('.targetselect_send_obj .send_obj_item');
			var multiCacheMap = {};
			var sendTarget = new Array();
			var totalNum = 0;
			var groupNum = 0;
			items.each(function(index,obj){
				var _this = $(obj);
				var sendType = _this.attr('data-sendType');
				var groupid = _this.attr('data-groupid');
				var groupname = _this.attr('data-groupname');
				var uuid = _this.attr('data-uuid');
				var name = _this.attr('data-name');
				var icon =  _this.attr('data-icon');
				var phone = _this.attr('data-phone');
				sendTarget.push({
					sendType : sendType,
					groupid : groupid,
					groupname : groupname,
					uuid : uuid?uuid:'',
					name : name?name:'',
					icon:icon,
					phone:phone
				});
				if(sendType == _SEND_TYPE.classGroup || sendType == _SEND_TYPE.teacherGroup){
					var num = parseInt(_this.attr('data-num'));
					totalNum+=num;
					groupNum++;
				}else{
					totalNum++;
				}
			});

			options.onChoose && options.onChoose({
				sendTarget : sendTarget,
				totalNum : totalNum,
				groupNum : groupNum
			});
			/*
			_slideobj&&_slideobj.left();
			window.parent.untrace&&window.parent.untrace();
			*/
		});

	}

	//更新已选区
	function updateSelectedBox(data){
		//sendType 类型
		//pkuid 唯一id
		//name 名称
		//count 数量
		//isAdd 是否添加
		//暂时忽略data,采用扫描方式更新

		var targetBox = $('#targetBox');
		if(options.multi){
			//多选
			var html = new Array();
			//逐个分组扫描
			var groups = $('.operate-class .op-check');
			//防止重复
			var multiMap = {};
			groups.each(function(index,obj){
				var _this = $(this);
				if(_this.hasClass('op-checked')){
					var sendType = _this.attr('data-sendType');
					var groupid = _this.attr('data-groupid');
					var groupname = _this.attr('data-groupname');
					var num = _this.attr('data-num');

					html.push('<span class="send_obj_item" data-sendType="'+sendType+'" data-groupid="'+groupid+'" data-groupname="'+groupname+'" data-num="'+num+'">');
					html.push('	<span class="send_obj_img"><img src="images/ico_file.gif" /></span>');
					html.push('	<span class="send_obj_name">'+groupname+'</span>');
					html.push('	<a href="javascript:;" class="send_obj_del">删除</a>');
					html.push('</span>');
				}else{
					//查询该组下的单个人
					var items = _this.parent().next().find('.op-checked');
					items.each(function(){
						var item = $(this);
						var sendType = item.attr('data-sendType');
						var groupid = item.attr('data-groupid');
						var groupname = item.attr('data-groupname');
						var uuid = item.attr('data-uuid');
						var name = item.attr('data-name');
						var nametag = item.attr('data-nametag');
						var icon = item.attr('data-icon');
						icon = icon?icon:'images/user_pace.png';
						if(!multiMap[uuid]){
							multiMap[uuid] = true;
							html.push('<span class="send_obj_item" data-sendType="'+sendType+'" data-groupid="'+groupid+'" data-groupname="'+groupname+'" data-uuid="'+uuid+'" data-name="'+name+'">');
							html.push('	<span class="send_obj_img"><img src="'+icon+'" /></span>');
							html.push('	<span class="send_obj_name">'+(nametag?nametag:name)+'</span>');
							html.push('	<a href="javascript:;" class="send_obj_del">删除</a>');
							html.push('</span>');
						}
					});
				}
			});
			$('.targetselect_send_obj').html(html.join(''));
		}else{
			//单选
			var parSpan = targetBox.find('span.op-radied');
			if(parSpan.size() >0){
				var groupid = parSpan.attr('data-groupid');
				var groupname = parSpan.attr('data-groupname');
				var uuid = parSpan.attr('data-uuid');
				var name = parSpan.attr('data-name');
				var sendType = parSpan.attr('data-sendType');
				var icon = parSpan.attr('data-icon');
				icon = icon?icon:'images/user_pace.png';

				var html = new Array();
				html.push('<span class="send_obj_item" data-sendType="'+sendType+'" data-groupid="'+groupid+'" data-groupname="'+groupname+'" data-uuid="'+uuid+'" data-name="'+name+'">');
				if(sendType == _SEND_TYPE.classGroup || sendType == _SEND_TYPE.teacherGroup){
					html.push('	<span class="send_obj_img"><img src="images/ico_file.gif" /></span>');
					html.push('	<span class="send_obj_name">'+groupname+'</span>');
				}else{
					html.push('	<span class="send_obj_img"><img src="'+icon+'"/></span>');
					html.push('	<span class="send_obj_name">'+name+'</span>');
				}
				html.push('	<a href="javascript:;" class="send_obj_del">删除</a>');
				html.push('</span>');
				$('.targetselect_send_obj').html(html.join(''));
			}else{
				$('.targetselect_send_obj').html('');
			}
		}

		if(options.isShowSelect && $('.targetselect_send_obj').html()){
			//有显示
			$('.targetselect_send_obj').show();
		}else{
			$('.targetselect_send_obj').hide();
		}

		options.onHeightChange && options.onHeightChange();
	}



	//-----------------------------------搜索相关 begin-----------------------------------//

	//搜索对象映射
	var searchCacheMap = {
		/*
		uuid :{
		
		}
		*/
	};

	var searchCacheList = [
		/*
		{
			keyword : 'xxx',
			uuid : '',
			name : '',
			groupid : '',
			groupname : '',
			sendType : '',
		}
		*/
	]; 


	//展示搜索结果
	function showSearchResult(keyword){
		var html = new Array();
		for(var i=0;i<searchCacheList.length;i++){
			var item = searchCacheList[i];
			if(item.keyword.indexOf(keyword)>=0){
				var icon = item.icon?item.icon:'images/user_pace.png';
				html.push('<a href="javascript:;" data-unique="'+item.unique+'">');
				html.push('	<span class="soso_img"><img src="'+icon+'" /></span>');
				html.push('	<span class="soso_name">'+item.nametag+'</span>');
				html.push('	<span class="soso_class">'+item.groupname+'</span>');
				html.push('</a>');
			}
		}
		$('.soso_list').html(html.join('')).show();
	}

	//隐藏搜索结果
	function hideSearchResult(){
		$('.soso_list').hide();
	}

	
	//-----------------------------------搜索相关 end-------------------------------------//

	/**
	 * 初始化对象选择，sendType,1学生个人，2班级分组，3教师个人，4教师分组，5家长个人
	 * @param options 初始化参数
	 * @param [options.level] Integer,选择层级，1精确到分组，2精确到人,默认2
	 * @param [options.multi] Boolean,是否多选 true多选，false单选，默认true
	 * @param [options.type] String,维度类型，1学生，2教师，3家长,多个用逗号分隔，默认1,2
	 * @param [options.isPersonTag] Boolean,家长维度是否在后面显示学生名以及关系 ,默认true
	 * @param [options.isGroupTag] Boolean,分组是否显示描述tag,默认true
	 * @param [options.isSearch] Boolean,是否支持搜索，默认false
	 * @param [options.isShowSelect] Boolean,是否显示已经选择的人或分组，默认false
	 * @param [options.isSelectPer] Boolean,是否支持群组为选择目标，不支持的话，遍历所有群组内的人，默认false
	 * @param [options.isShowFollwed] Boolean,是否按已关注和未关注显示，默认true
	 * @param [options.filterListArry] Array,过滤数组，不渲染目标数组里的集合，默认''
	 * @param [options.onHeightChange] Function,高度发生改变回调函数
	 * @param [options.onChoose] Function,选择按钮点击回调函数，会返回一个对象选择数组[{sendType:1,groupid:'',groupname:'',uuid:'',name:''}]
	 * @param [options.onReady] Function,初始化完成回调
	 */
	qt_model.init = function(_options){
		var opts = {
			level : 2,
			multi : true,
			type : '1,2',
			isPersonTag : true,
			isGroupTag : true,
			isSearch : false,
			isShowSelect : false,
			isSelectPer:false,
			isShowFollwed:true,
			filterListArry:''
		}
		options = $.extend(true,opts,_options);

		queryData(function(){
			initSelectEvent();
			options.onReady && options.onReady();
		});
		initShow();
	}


	/**
	 * 设置已经选择的人
	 * @param data 选择对象，与onChoose方法获取的对象一样
	 */
	qt_model.setSelected = function(data){
		console.log(JSON.stringify(data));
		if(options.multi){
			$('#targetselect .op-checked').removeClass('op-checked');
		}else{
			$('#targetselect .op-radied').removeClass('op-radied');
		}
		updateSelectedBox();
		if(!data || data.length<=0){
			return;
		}
		if(options.multi){
			//多选
			for(var i=0;i<data.length;i++){
				var item = data[i];
				var sendType = item.sendType;
				var groupid = item.groupid;
				var groupname = item.groupname;
				var uuid = item.uuid;
				var name = item.name;
				if(sendType == _SEND_TYPE.teacherGroup){
					$('#tacherBox .operate-class [data-groupid="'+groupid+'"]').addClass('op-checked');
				}else if(sendType == _SEND_TYPE.classGroup){
					if(options.type.indexOf('1')>=0){
						//学生
						$('#studentBox .operate-class [data-groupid="'+groupid+'"]').addClass('op-checked');
					}else{
						//家长
						$('#parentBox .operate-class [data-groupid="'+groupid+'"]').addClass('op-checked');
					}
				}else if(sendType == _SEND_TYPE.teacher){
					$('#tacherBox [data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]').addClass('op-checked');
				}else if(sendType == _SEND_TYPE.student){
					$('#studentBox [data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]').addClass('op-checked');
				}else if(sendType == _SEND_TYPE.parent){
					$('#parentBox [data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]').addClass('op-checked');
				}else{
					//do nothing
				}
			}
		}else{
			//单选
			var item = data[0];
			var sendType = item.sendType;
			var groupid = item.groupid;
			var uuid = item.uuid;

			if(sendType == _SEND_TYPE.teacherGroup){
				$('#tacherBox .operate-class [data-groupid="'+groupid+'"]').addClass('op-radied');
			}else if(sendType == _SEND_TYPE.classGroup){
				if(options.type.indexOf('1')>=0){
					//学生
					$('#studentBox .operate-class [data-groupid="'+groupid+'"]').addClass('op-radied');
				}else{
					//家长
					$('#parentBox .operate-class [data-groupid="'+groupid+'"]').addClass('op-radied');
				}
			}else if(sendType == _SEND_TYPE.teacher){
				$('#tacherBox [data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]').addClass('op-radied');
			}else if(sendType == _SEND_TYPE.student){
				$('#studentBox [data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]').addClass('op-radied');
			}else if(sendType == _SEND_TYPE.parent){
				$('#parentBox [data-uuid="'+uuid+'"]').filter('[data-groupid="'+groupid+'"]').addClass('op-radied');
			}else{
				//do nothing
			}
		}
		updateSelectedBox();
	}



	//----------------------------- 测试代码 --------------------------------//


	module.exports = qt_model;

});
