define(function(require, exports, module) {

	/**
	 * @desc
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 *
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var _common = require('./common');
    var _stat = require('./stat');
	//滚动条美化插件
	require('jquery/nicescroll');
	require('jquery/json');

	//服务
	var _SERVICE = _common.SERVICE;
	var _window = window;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//学校是否开通留言模块
	var isWordsFun = _common.getFuncs('words')


	_stat.init('wxpt');
	//初始化通讯录
	var _contactCache = [];
	//班级对象缓存，key是班级id，value是对象
	var _classCache = {};

	//获取通讯录
	function initContact(refreshCallback){

		//加载数据
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'isRefresh' : refreshCallback?1:0
		};
		_common.post(_SERVICE+'/webapp/linkman/list',params,function(rtn){
			_common.hideLoading();
			$('#contact').show();
			if('001' == rtn.resultCode){
				//填充联系人
				if(refreshCallback){
					refreshFillContact(rtn);
				}else{
					fillContact(rtn);
					scrollObj&&updateScrollBar();
				}
				refreshCallback && refreshCallback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});


		//绑定班级点击事件
		$('#contact').off().on('click','ul .class_tb',function(){
			var _this = $(this);
			var _block = _this.next();
			if('1' == _this.attr('data-open')){
				//已经打开,改为关闭
				_this.find('span').eq(0).removeClass('op-classed').addClass('op-class');
				_this.attr('data-open','0');
				if(_block.find('a').size() >0){
					_block.slideUp('fast',function(){
						scrollObj&&updateScrollBar();
					});
				}
			}else{
				//已经关闭,改为打开
				_this.find('span').eq(0).removeClass('op-class').addClass('op-classed');
				_this.attr('data-open','1');
				if(_block.find('a').size() >0){
					_block.slideDown('fast',function(){
						scrollObj&&updateScrollBar();
					});
				}
				if('1' != _this.attr('data-showicon')){
					_block.find('img[_src]').each(function(index,obj){
						$(obj).attr('src',$(obj).attr('_src'));
					});
					_this.attr('data-showicon','1');
				}
			}
			return false;
		});

		//绑定具体的每个人点击事件
		$('#contactList,#searchReasult').off().on('click','p a',function(){
			var _this = $(this);

			var _uuid = _this.attr('data-uuid');
			var _type = _this.attr('data-type');
			var _sid = _this.attr('data-sid');


			if(!_uuid || !_type){
				return;
			}
			var info = {
				uuid : _uuid,
				type : _type,
				sid : _sid
			}
			openDetail(info);

			/*暂时不做任何事情
			var info = {
				uuid : _this.attr('data-uuid'),
				name : _this.attr('data-name'),
				stuName : _this.attr('data-stuName'),
				icon : _this.attr('data-icon'),
				phone : _this.attr('data-phone'),
				followed : _this.attr('data-followed'),
				cid : _this.attr('data-cid'),
				type : _this.attr('data-type'),
				className : _this.attr('data-className')
			}

			if(!info.uuid || !info.name){
				return;
			}
			uuid&&openDetail(info);
			*/
		});

		//绑定具体的每个人点击事件
		$('#contactList,#searchReasult').on('click','p a .bt_mess',function(){
			var _this = $(this);

			var _uuid = _this.attr('data-uuid');
			var _name = _this.attr('data-name');
			var _cid = _this.attr('data-cid');
			var _userType = _this.attr('data-userType');

			//窗口打开参数
			var options = {};
			options.key = 'messagesend';
			options.url = './message_send.html?puuid='+encodeURIComponent(_uuid)+'&pname='+encodeURIComponent(_name)+'&cid='+encodeURIComponent(_cid)+'&userType='+_userType;
			options.title =  '发留言';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			return false;
		});

		//绑定tab切换
		$('#typeTab a').off().on('click',function(){
			//还原搜索
			$('#searchText').val('');
			hideSerchResult();

			var _this = $(this);
			var type = _this.attr('data-type');
			$('#contactList li').hide();
			$('#contactList li[data-type='+type+']').fadeIn();
			$('#typeTab a').removeClass('sel');
			_this.addClass('sel');

			$('#typeTab').attr('data-type',type);

			scrollObj && updateScrollBar();
			$(".nicescrollContainer").getNiceScroll(0).doScrollTop(0,5);
			scrollObj && updateScrollBar();
		});

	}

	//填充通讯录
	function fillContact(rtn){
		_classCache = {};
		_contactCache = [];

		var items = rtn.linkmanParent;
		var html = new Array();

		//填充家长
		for(var i=0;i<items.length;i++){
			//逐个班添加
			var item = items[i];

			html.push(_getParentGroupHtml(item,true,false));
			var childs = item.childs;
			for(var j=0;j<childs.length;j++){
				var child = childs[j];
				//缓存，以便搜索
				_contactCache.push({
					name : child.stuName,
					item : child,
					type : 1,
					groupid : item.cid
				});
			}
			//缓存，以便搜索
			_classCache[item.cid] = item;
		}

		if(items.length <=0){
			html.push('<li data-type="1"><div style="color:#ababab;text-align:center;padding-top:50px;">尚无任教班级信息</div></li>');
		}

		//填充教师
		items = rtn.linkmanTeacher;
		for(var i=0;i<items.length;i++){
			var item = items[i];

			html.push(_getTeacherGroupHtml(item,false,false));
			for(var j=0;j<item.teachers.length;j++){
				var teacher = item.teachers[j];
				//缓存，以便搜索
				_contactCache.push({
					name : teacher.name,
					item : teacher,
					type : 2,
					groupid : item.deptId
				});
			}
			//缓存，以便搜索
			_classCache[item.deptId] = item;
		}

		$('#contactList').html(html.join(''));


		if(rtn.linkmanParent.length <=0){
			$('.tab_role_p a').eq(1).trigger('click');
		}

		//分别展开最后一个
		//data-type="1"
	}


	//刷新时候更新数据
	function refreshFillContact(rtn){
		_classCache = {};
		_contactCache = [];

		var html = new Array();

		var type = $('#typeTab').attr('data-type');
		//当前是否显示家长
		var isParent = '1' == type;

		//列表元素
		var contactList = $('#contactList');

		//填充家长
		var items = rtn.linkmanParent;

		for(var i=0;i<items.length;i++){
			//逐个班处理
			var item = items[i];

			var li = contactList.find('li[data-cid="'+item.cid+'"]');
			if(li.length<=0){
				//新增加的班，默认不展开
				html.push(_getParentGroupHtml(item,isParent,false));
			}else{
				//已经存在，检查是否已经展开，根据原来的展开情况插入
				var clstb = li.find('.class_tb');
				var isDetail = '1' == clstb.attr('data-open');
				html.push(_getParentGroupHtml(item,isParent,isDetail));
			}
			var childs = item.childs;
			for(var j=0;j<childs.length;j++){
				var child = childs[j];
				//缓存，以便搜索
				_contactCache.push({
					name : child.stuName,
					item : child,
					type : 1,
					groupid : item.cid
				});
			}
			//缓存，以便搜索
			_classCache[item.cid] = item;
		}

		if(items.length <=0){
			html.push('<li data-type="1" style="'+(isParent?'':'display:none;')+'"><div style="color:#ababab;text-align:center;padding-top:50px;">尚无任教班级信息</div></li>');
		}

		//填充教师
		items = rtn.linkmanTeacher;
		for(var i=0;i<items.length;i++){
			//逐个分组处理
			var item = items[i];

			var li = contactList.find('li[data-deptId="'+item.deptId+'"]');
			if(li.length<=0){
				//新增加的分组，默认不展开
				html.push(_getTeacherGroupHtml(item,!isParent,false));
			}else{
				//已经存在，检查是否已经展开，根据原来的展开情况插入
				var clstb = li.find('.class_tb');
				var isDetail = '1' == clstb.attr('data-open');
				html.push(_getTeacherGroupHtml(item,!isParent,isDetail));
			}
			for(var j=0;j<item.teachers.length;j++){
				var teacher = item.teachers[j];
				//缓存，以便搜索
				_contactCache.push({
					name : teacher.name,
					item : teacher,
					type : 2,
					groupid : item.deptId
				});
			}
			//缓存，以便搜索
			_classCache[item.deptId] = item;
		}

		contactList.html(html.join(''));
		scrollObj&&updateScrollBar();
	}

	//获取新的班级html
	function _getParentGroupHtml(item,isShow,isDetail){

		var html = new Array();

		//班级未填充过，要插入班级
		html.push('<li data-type="1" '+(isShow?'':'style="display:none;"')+' data-cid="'+item.cid+'">');
		html.push('  <a class="class_tb" href="javascript:;" data-open="'+(isDetail?'1':'0')+'" data-showicon="'+(isDetail?'1':'0')+'"><span class="op-class"></span>'+item.className+' <span class="class_info">学生'+item.stuCount+'人 / 家长'+item.parentCount+'人 / 未关注<em>'+item.noFollowedCount+'</em>人</span></a>');
		html.push('  <div '+(isDetail?'':'style="display:none;"')+'>');
		var childs = item.childs;
		//逐个学生处理
		for(var j=0;j<childs.length;j++){
			var child = childs[j];
			html.push('	<p class="stu_box">');
			for(var k=0;k<child.parents.length;k++){
				var parent = child.parents[k];

				var _src = parent.icon?parent.icon:_common.getDefaultHeadUrl();
				_src = 1==parent.followed?_src:'./images/user_face_big.png';

				html.push('<a href="javascript:;" data-sid="'+child.stuId+'" data-stuName="'+child.stuName+'" data-className="'+item.className+'" data-uuid="'+parent.uuid+'" data-type="1">');
				if(isDetail){
					html.push('<img src="'+_src+'" onerror="this.src=\'./images/user_pace.png\'" />');
				}else{
					html.push('<img src="./images/user_pace.png" _src="'+_src+'" onerror="this.src=\'./images/user_pace.png\'" />');
				}
				html.push('<b>'+child.stuName+' '+parent.tag+'</b><br/>'+parent.phone+'<span class="bt_mess" '+(isWordsFun && ('1' == parent.followed)?'':'style="display:block;"')+' data-cid="'+item.cid+'" data-name="'+parent.name+'('+child.stuName+' '+parent.tag+')'+'" data-uuid="'+parent.uuid+'" data-userType="2"></span>');//(isWordsFun && ('1' == parent.followed)?'':'style="display:none;"')
				html.push('</a>');
			}
			html.push('	</p>');
		}
		html.push('  </div>');
		html.push('</li>');

		return html.join('');
	}

	//获取新的教师html
	function _getTeacherGroupHtml(item,isShow,isDetail){
		var html = new Array();

		html.push('<li data-type="2" '+(isShow?'':'style="display:none;"')+' data-deptId="'+item.deptId+'">');
		html.push('	<a class="class_tb" href="javascript:;" data-open="'+(isDetail?'1':'0')+'" data-showicon="'+(isDetail?'1':'0')+'"><span class="op-class"></span>'+item.deptName+' <span class="class_info">教师'+item.teaCount+'人 / 未关注<em>'+item.noFollowedCount+'</em>人</span></a>');
		html.push('	<p '+(isDetail?'':'style="display:none;"')+'>');
		for(var j=0;j<item.teachers.length;j++){
			var teacher = item.teachers[j];
			var _src = teacher.icon?teacher.icon:_common.getDefaultHeadUrl();
			_src = 1==teacher.followed?_src:'./images/user_face_big.png';
			html.push('<a href="javascript:;" data-uuid="'+teacher.uuid+'" data-type="2">');
			if(isDetail){
				html.push('<img src="'+_src+'" onerror="this.src=\'./images/user_pace.png\'"/><b>'+teacher.name+'</b><br/>'+teacher.phone);
			}else{
				html.push('<img src="./images/user_pace.png" _src="'+_src+'" onerror="this.src=\'./images/user_pace.png\'"/><b>'+teacher.name+'</b><br/>'+teacher.phone);
			}
			html.push('<span class="bt_mess" '+(isWordsFun && ('1' == teacher.followed)?'':'style="display:block;"')+' data-cid="'+item.deptId+'" data-name="'+teacher.name+'(教师)" data-uuid="'+teacher.uuid+'" data-userType="1"></span>')
			html.push('</a>');
		}
		html.push('	</p>');
		html.push('</li>');

		return html.join('');
	}



	//初始化搜索
	var _searchTimer = null;
	function initSearch(){
		$('#searchText').off().keyup(function(e){
			_searchTimer&&clearTimeout(_searchTimer);
			_searchTimer = setTimeout(function(){
				var _val = $.trim($('#searchText').val());
				if(_val){
					showSearchResult(_val);
				}else{
					hideSerchResult();
				}
			},200);
		});
	}
	//显示查询结果
	function showSearchResult(name,isRefresh){
		//保存包含的分组id
		var groupList = new Array();
		var groupMap = {};

		var type = $('#typeTab').attr('data-type');
		for(var i=0;i<_contactCache.length;i++){
			var item = _contactCache[i];
			if(item.type != type){
				continue;
			}
			if(item.name.indexOf(name) >=0){
				if(!groupMap[item.groupid]){
					groupMap[item.groupid] = new Array();
					groupList.push(item.groupid);
				}
				groupMap[item.groupid].push(item.item);
			}
		}
		//开始填充数据
		var html = new Array();

		if('2' == type){
			//当前显示教师
			for(var i = 0;i<groupList.length;i++){
				//逐个班添加
				var item = _classCache[groupList[i]];
				var teachers = groupMap[groupList[i]];

				html.push('<li data-type="2" data-deptId="'+item.deptId+'">');
				html.push('	<a class="class_tb" href="javascript:;" data-open="0" data-showicon="0"><span class="op-classed"></span>'+item.deptName+' <span class="class_info">教师'+item.teaCount+'人 / 未关注<em>'+item.noFollowedCount+'</em>人</span></a>');
				html.push('	<p style="display:none;">');
				for(var j=0;j<teachers.length;j++){
					var teacher = teachers[j];
					var _src = teacher.icon?teacher.icon:_common.getDefaultHeadUrl();
					_src = 1==teacher.followed?_src:'./images/user_face_big.png';
					html.push('<a href="javascript:;" data-uuid="'+teacher.uuid+'" data-type="2"><img src="./images/user_pace.png" _src="'+_src+'" onerror="this.src=\'./images/user_pace.png\'"/><b>'+teacher.name+'</b><br/>'+teacher.phone+'<span class="bt_mess" '+(isWordsFun && ('1' == teacher.followed)?'':'style="display:none;"')+' data-cid="'+item.deptId+'" data-name="'+teacher.name+'(教师)" data-uuid="'+teacher.uuid+'" data-userType="1"></span></a>');
				}
				html.push('	</p>');
				html.push('</li>');
			}
		}else{
			//当前显示家长
			for(var i = 0;i<groupList.length;i++){
				//逐个班添加
				var item = _classCache[groupList[i]];
				var childs = groupMap[groupList[i]];

				html.push('<li data-type="1" data-cid="'+item.cid+'">');
				html.push('  <a class="class_tb" href="javascript:;" data-open="0" data-showicon="0"><span class="op-classed"></span>'+item.className+' <span class="class_info">学生'+item.stuCount+'人 / 家长'+item.parentCount+'人 / 未关注<em>'+item.noFollowedCount+'</em>人</span></a>');
				html.push('  <div style="display:none;">');
				//逐个学生添加
				for(var j=0;j<childs.length;j++){
					var child = childs[j];
					html.push('	<p class="stu_box">');
					for(var k=0;k<child.parents.length;k++){
						var parent = child.parents[k];

						var _src = parent.icon?parent.icon:_common.getDefaultHeadUrl();
						_src = 1==parent.followed?_src:'./images/user_face_big.png';

						html.push('<a href="javascript:;" data-sid="'+child.stuId+'" data-stuName="'+child.stuName+'" data-className="'+item.className+'" data-uuid="'+parent.uuid+'" data-type="1">');
						html.push('<img src="./images/user_pace.png" _src="'+_src+'" onerror="this.src=\'./images/user_pace.png\'" />');
						html.push('<b>'+child.stuName+' '+parent.tag+'</b><br/>'+parent.phone+'<span class="bt_mess" '+(isWordsFun && ('1' == parent.followed)?'':'style="display:none;"')+' data-cid="'+item.cid+'" data-name="'+parent.name+'('+child.stuName+' '+parent.tag+')'+'" data-uuid="'+parent.uuid+'" data-userType="2"></span>');
						html.push('</a>');
					}
					html.push('	</p>');
				}
				html.push('  </div>');
				html.push('</li>');
			}
		}
		if(groupList.length >0){
			if(true === isRefresh){
				//刷新搜索
				//查询原来的打开的分组
				var opened = new Array();
				var attrName = '2' == type?'data-deptId':'data-cid';
				var lis = $('#searchReasult a[data-open="1"]').parent();
				lis.each(function(index,obj){
					var li = $(obj);
					opened.push(li.attr(attrName));
				});
				//填充html
				$('#searchReasult').html(html.join(''));
				var cls = $('#searchReasult li')
				for(var i=0;i<opened.length;i++){
					var groupid = opened[i];
					cls.filter('['+attrName+'="'+groupid+'"]').find('.class_tb').trigger('click');
				}
			}else{
				//默认全部打开
				$('#searchReasult').html(html.join(''));
				$('#searchReasult .class_tb').trigger('click');
			}
			$('#contactList').hide();
			$('#searchReasult').show();
		}else{
			hideSerchResult();
		}
		scrollObj&&updateScrollBar();
	}
	//隐藏查询结果
	function hideSerchResult(){
		$('#contactList').show();
		$('#searchReasult').hide();
		scrollObj&&updateScrollBar();
	}


	//打开详情窗口
	function openDetail(info){
		//窗口打开参数
		var options = {};
		options.key = 'contact';
		//options.width = 300;
		if('2' == info.type){
			options.url = './contact_tea.html?info='+encodeURIComponent($.toJSON(info));
		}else{
			options.url = './contact.html?info='+encodeURIComponent($.toJSON(info));
		}
		options.title = '详情';
		options.callback = function(){
			//do nothing
		}
		var _window = window;
		window.parent.closeWin&&window.parent.closeWin({
			isSwitch : true,
			callback : function(){
				_window.parent.openWin&&_window.parent.openWin(options);
			}
		});
	}

	//初始化刷新
	var refreshing = false;
	var canFresh = true;
	function initRefresh(){
		$('#refreshBtn').off().on('click',function(){
			if(refreshing){
				return;
			}
			if(!canFresh){
				_common.tips('info','刷新过于频繁，请稍后！');
				return;
			}
			_common.showLoading();
			//刷新
			initContact(function(){
				canFresh = false;
				setTimeout(function(){
					canFresh = true;
				},10000);

				//$('#typeTab a.sel').trigger('click');

				//原来处于搜索，更新搜索
				var search = $.trim($('#searchText').val());
				if(search){
					showSearchResult(search,true);
				}

				_common.hideLoading();
				_common.tips('info','刷新成功');
				refreshing = false;
			});
			_common.showLoading();
		});


		//注册刷新回调，供其它页面调用
		parent.regListener && parent.regListener({
			id : 'contact_shortcut',
			callback : function(data){
				//该页面忽略参数，纯粹刷新
				canFresh = true;
				$('#refreshBtn').trigger('click');
			}
		});
	}



	//绑定各种添加操作
	function initOp(){
		var addUser = $('.add_user');
		$('#opBtn').off().on('click',function(){
			addUser.show();
			$(window).off('click.initOp').click(function(){
				$(window).off('click.initOp');
				addUser.hide();
			});
			return false;
		});

		addUser.off().on('mouseleave',function(){
			$(window).off('click.initOp');
			addUser.hide();
		});

		if(!_common.isAdmin()){
			$('#opAddTeaBtn').remove();
		}else{
			$('#opAddTeaBtn').show();
			$('#opAddTeaBtn').off().click(function(){
				var options = {};
				options.key = 'contact_addteacher';
				options.title = '新增教师';
				options.url = './contact_addteacher.html';
				options.callback = function(){
					//do nothing
				}
				var _window = window;
				window.parent.closeWin&&window.parent.closeWin({
					isSwitch : true,
					callback : function(){
						_window.parent.openWin&&_window.parent.openWin(options);
					}
				});
			});
		}
		if(!_common.isAdmin() && !_common.isMaster()){
			$('#opAddStuBtn').remove();
		}else{
			$('#opAddStuBtn').off().click(function(){
				var options = {};
				options.key = 'contact_addstudent';
				options.title = '新增学生';
				options.url = './contact_addstudent.html';
				options.callback = function(){
					//do nothing
				}
				var _window = window;
				window.parent.closeWin&&window.parent.closeWin({
					isSwitch : true,
					callback : function(){
						_window.parent.openWin&&_window.parent.openWin(options);
					}
				});
			});
		}

		if(!_common.isAdmin()){
			$('#opAddDeptBtn').remove();
		}else{
			//新增教师分组
			$('#opAddDeptBtn').show();
			$('#opAddDeptBtn').off().click(function(){
				// _stat.track('teacher_contact_teachergroup');
				var options = {};
				options.key = 'contact_addteacher';
				options.title = '教师分组管理';
				options.url = './contact_group.html';
				options.callback = function(){
					//do nothing
				}
				var _window = window;
				window.parent.closeWin&&window.parent.closeWin({
					isSwitch : true,
					callback : function(){
						_window.parent.openWin&&_window.parent.openWin(options);
					}
				});
			});
		}

		if(!_common.isAdmin()){
			$('#opAddClassBtn').remove();
		}else{
			//新增班级管理
			$('#opAddClassBtn').show();
			$('#opAddClassBtn').off().click(function(){
				//_stat.track('teacher_contact_classmaster');
				var options = {};
				options.key = 'contact_addteacher';
				options.title = '班级管理';
				options.url = './contact_master.html';
				options.callback = function(){
					//do nothing
				}
				var _window = window;
				window.parent.closeWin&&window.parent.closeWin({
					isSwitch : true,
					callback : function(){
						_window.parent.openWin&&_window.parent.openWin(options);
					}
				});
			});
		}

		if(!_common.isAdmin() && !_common.isMaster()){
			//既不是管理员又不是班主任，没有任何权限，隐藏按钮
			$('#opBtn').css('visibility','hidden');
		}
	}

	//自定义滚动条
	var scrollObj;
	function initPageScroll(){

		//$('.viewport').css({'height':qt_util.P('h')+'px','overflow':'hidden'});
		var height = parseInt(qt_util.P('h'));

		var scrollCon = $('.nicescrollContainer').css({
			height : (height-70)+'px',
			overflow : 'hidden'
		});

		scrollObj = scrollCon.niceScroll(scrollCon.find('.nicescrollWrapper'),{
			cursorcolor:'#ccc',
			cursorwidth:'8px',
			cursorminheight:100,
			scrollspeed:60,
			mousescrollstep:60,
			autohidemode:'leave',
			bouncescroll:false
		});

	}
	//更新滚动条
	function updateScrollBar(){
		var scrollobj = $('.nicescrollContainer').getNiceScroll();
		scrollobj.each(function(){
			this.resize();
		});
	}

	//qt_model.callChild = childWinCall;

	//业务入口
	initPageScroll();
	initContact();
	initSearch();
	initRefresh();
	initOp();

	//测试代码

	module.exports = qt_model;

});
