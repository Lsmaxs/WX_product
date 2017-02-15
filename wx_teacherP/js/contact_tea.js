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

	//滚动条美化插件
	require('jquery/nicescroll');


	//服务
	var _SERVICE = _common.SERVICE;
	var _window = window;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//用户参数信息
	var info = qt_util.P('info');
	info = info && $.evalJSON(decodeURIComponent(info));
	
	//是否有修改权限
	var editPremiss = false;

	function initPage(){
		if(!info){
			_common.tips('教师信息查询失败');
			return;
		}

		var uuid = _common.getUuid();

		// 毕业升级提醒
		if(1==_common.localGet('isInUpgrade')){
			$('.notice_wrap,.notice_model').show();
		}
		//设置非编辑状态
		$('.user_edit_par .lir').show();
		$('.user_edit_par .lir_edit').hide();

		//美化滚动条
		var _width = winSize.width;
		var _height = winSize.height;
		var scroll = $('.nicescrollContainer');
		scroll.css({






			width : _width+'px',
			height : _height+'px',
			overflow : 'hidden'
		});
		scroll.niceScroll(scroll.find('.nicescrollWrapper'),{
			cursorcolor:'#ccc',
			cursorwidth:'8px',
			cursorminheight:100,
			scrollspeed:60,
			mousescrollstep:60,
			autohidemode:true,
			bouncescroll:false
		});


		_common.showLoading();
		initContact(function(){
			_common.hideLoading();
			$('#contact').css({
				visibility : 'visible'
			});
			updateScrollBar();
		});

		queryTeacherPremission(function(permiss) {

			if(permiss == 0) {
				editPremiss = true;
			} else {
				editPremiss = false;
			}
			
			//管理员才允许修改
			if(_common.isAdmin() || uuid == info.uuid){
				$('.bt_edit').show();
				if(!editPremiss) {
					$('#roleEditBtn').hide();
				}
				
				$('#delBtn').show();
			} else {
				$('#roleEditBtn,#subjectEditBtn').hide();
				$('.bt_edit').hide();
				$('#delBtn').hide();
			}
			
			//管理员才执行相关修改的编辑
			//模拟了permiss=0;
			initClassList();
			initEdit();
			initSubjectPop();
			initLinkManTeaGroup();
		});
		
		/**if(_common.isAdmin() || uuid == info.uuid){
			//管理员才执行相关修改的编辑
			initClassList();
			initEdit();
			initSubjectPop();
			initLinkManTeaGroup();
		} **/

	}
	
	//获取修改权限
	function queryTeacherPremission(callback) {
		
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode
		};
		_common.post(_SERVICE+'/webapp/school/isPermissUpdateTeaInfo',params,function(rtn){
			if('001' == rtn.resultCode){
				//逐个权限设置
				callback && callback(rtn.permiss);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	//获取详情
	function initContact(callback){
		var pUuid = info.uuid;
		if(!pUuid){
			//错误，理论上要加入提示
			_common.tips('目标用户信息丢失');
			return;
		}

		var uuid = _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'tuuid' : pUuid,
		};
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/linkman/tea/detail',params,function(rtn){
			_common.hideProgress();
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

	//填充联系人
	var editInfo = {};
	var teacherInfo = null;
	var teachClassId=[];
	function fillContact(rtn){
		/*
		{
			"resultCode": "001",
			"resultMsg": "请求处理成功",
			"teaName": "蔡玲",
			"uuid": "188ec1ee625711e58635fa163e0e90d3",
			"icon": "http://shp.qpic.cn/bizmp/ILgQqqAciauzSA2npjfPRwGnt1KDwxk58QIQW2FvibaiaBpwkRllWJib0Q/",
			"followed": 1,
			"phone": "13380899740",
			"roles":[,//教师角色 1管理员 2班主任 3科任教师 4其他
				{
					"code":"1",
					"name":"管理员",
				},
				{
					"code":"2",
					"name":"班主任"
				}
			],
			"isManager":1,//1.是 2.否
			"isMaster":1,//1.是 2.否
			"masterClass":"小一(1)班",//当班主任的班级
			"depts":[
				{
					"code":"10001",
					"name":"行政组"
				},...
			],
			"gradeList":[
				{
					"code":"201",
					"name":"一年级"
					"classList":[
						{
							"code":"14341342314",
							"name":"小一(1)班",
							"teaches":[
								{
									"code":"001",
									"name":"语文"
								},
								...
							]
						},...
					]
				},...
			],
			editable:1// 1可编辑 0不可编辑
		}
		*/
		//填充个人信息
		var _src = rtn.icon?rtn.icon:_common.getDefaultHeadUrl();
		_src = 1==rtn.followed?_src:'./images/user_face_big.png';
		$('#detail_img').attr('src',_src);

		$('#detail_name').text(''+rtn.teaName);
		
		$('#nameLabel').text(''+rtn.teaName);
		$('#phoneLabel').text(''+rtn.phone);

		//显示角色
		var roleLabel = '';
		if(1 == rtn.isManager){
			roleLabel = '管理员';
		}
		if(1 == rtn.isMaster){
			roleLabel = roleLabel +(rtn.isManager?' | ':'')+ rtn.masterClass+'班主任';
		}
		if(1 != rtn.isManager && 1!= rtn.isMaster){
			roleLabel = '普通教师';
		}
		$('#detail_role').text(''+roleLabel).attr('title',roleLabel);
		$('#roleLabel').text(''+roleLabel);
		

		//显示带班信息
		var html = new Array();
		var html2 = new Array();
		var teaHtml = new Array();
		teachClassId=[];//先清空数据
		for(var i=0;i<rtn.gradeList.length;i++){
			var grade = rtn.gradeList[i];
			for(var j=0;j<grade.classList.length;j++){
				var _class = grade.classList[j];
				teaHtml.push(_class.name);
				teachClassId.push(_class.code);
				for(var k=0;k<_class.teaches.length;k++){
					var teach = _class.teaches[k];
					html.push(_class.name+'·'+teach.name);
					html2.push('<li data-subject="1"><span class="li_l">'+grade.name+'</span><span class="li_m">'+_class.name+'</span><span class="li_r">'+teach.name+'</span><a href="javascript:;" class="del_classli" data-tuuid="'+rtn.uuid+'" data-subjectCode="'+teach.code+'" data-classCode="'+_class.code+'"></a></li>');
				}
			}
		}
		if(html.length>0){
			if(html.length>2){
				html = html.slice(0,2);
			}
			$('#subjectLabel').html(html.join(' | ')+'...');
		}else{
			$('#subjectLabel').html('无');
		}
		if(teaHtml.length > 0){
			if(teaHtml.length>3){
				teaHtml = teaHtml.slice(0,3);
			}
			$('#classLabel').html(teaHtml.join(' | ')+'...');
		}else{
			$('#classLabel').html('无');
		}
		//console.log('teachClassId:'+JSON.stringify(teachClassId));
		$('#subjectPopList [data-subject="1"]').remove();
		$('#subjectPopList').prepend(html2.join(''));


		//填充所属部门
		html = new Array();
		for(var i=0;i<rtn.depts.length;i++){
			html.push(rtn.depts[i].name);
		}
		if(html.length>0){
			$('#deptLabel').html(html.join(' | '));
		}else{
			$('#deptLabel').html('无');
		}


		//缓存修改信息
		editInfo = {
			"targetUuid":rtn.uuid//要修改的家长用户的uuid
		}
		teacherInfo = rtn;


		//根据是否关注现实按钮
		if(1 == rtn.followed){
			$('#inviteBtn').hide();
			$('#messageBtn').show();
			if(_common.isAdmin()){
				$('#inviteTips').show();
			}else{
				$('#inviteTips').hide();
			}
			initSendMessage(rtn.uuid,rtn.teaName,rtn.depts[0].code);
		}else{
			$('#inviteBtn').show();
			$('#messageBtn').hide();
			$('#inviteTips').hide();
			initFollow(rtn.uuid);
		}

		//非管理员且修改的是自己，要判断管理员是否授权修改自己的班级科目
		if(!_common.isAdmin() && _common.getUuid() == info.uuid){
			var isEditable = (1 == rtn.editable);
			if(isEditable){
				$('#subjectEditBtn').show();
			}
		}

		//设置关注，留言，删除信息
		initDelete(rtn.uuid);
		updateScrollBar();
	}


	//查询所带班级
	function initClassList(){
		//加载班级
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'noMaster' : 1
		};
		_common.post(_SERVICE+'/webapp/personal/tea/teachClass',params,function(rtn){
			if('001' == rtn.resultCode){
				//填充班级列表
				/*
				{
					"resultCode": "001",
					"resultMsg": "请求处理成功",
					"classList":[
						{
							"id":"144446909521827281",
							"name":"小二(1)班"
						},...
					]
				}
				*/
				var html = new Array();
				for(var i=0;i<rtn.classList.length;i++){
					var item = rtn.classList[i];
					html.push('<li><a href="javascript:;" data-id="'+item.id+'" title="'+item.name+'">'+item.name+'</a></li>');
				}
				$('#roleSelectClassList').html(html.join(''));

				//执行nicescroll
				$('#roleSelectClass').niceScroll($('#roleSelectClassList'),{
					cursorcolor:'#ccc',
					cursorwidth:'8px',
					cursorminheight:100,
					scrollspeed:60,
					mousescrollstep:60,
					autohidemode:true,
					bouncescroll:false
				});
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}
	
	//查询通讯录分组
	var cacheGroup=[];
	function initLinkManTeaGroup(){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'isRefresh' : 0
		};
		_common.post(_SERVICE+'/webapp/linkman/list',params,function(rtn){
			if('001' == rtn.resultCode){
				if(rtn.linkmanTeacher && rtn.linkmanTeacher.length >0){
					
					var html = new Array();
					for(var i=0;i<rtn.linkmanTeacher.length;i++){
						var item = rtn.linkmanTeacher[i];
						if(item.deptId !='10000'){
							html.push('<a data-deptId='+item.deptId+' href="javascript:;"><i class="ipt_check"></i>'+item.deptName+'</a>');
						}
						cacheGroup.push(item.deptName);
					}
					$('#subjectPop_group .editbumen_list').html(html.join(''));
				}
				
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}



	//初始化修改
	function initEdit(){
		//姓名修改
		$('#nameEditBtn').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			$('#nameEdit').val(''+$('#nameLabel').text());
			box.find('.lir').hide();
			box.find('.lir_edit').css('display','inline-block');
		});
		$('#nameSure').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			var _name = $('#nameEdit').val();
			_name = _common.filterXss(_name);
			if(!_name || _name == $('#nameLabel').html()){
				//不用修改
				box.find('.lir').css('display','inline-block');
				box.find('.lir_edit').hide();
			}else{
				updateEditInfo({teaName:_name},function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
		});

		//电话修改
		$('#phoneEditBtn').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			$('#phoneEdit').val(''+$('#phoneLabel').text());
			box.find('.lir').hide();
			box.find('.lir_edit').css('display','inline-block');
		});
		$('#phoneSure').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			var _val = $('#phoneEdit').val();
			_val = _common.filterXss(_val);
			if(!_val || _val == $('#phoneLabel').text()){
				//不用修改
				box.find('.lir').css('display','inline-block');
				box.find('.lir_edit').hide();
			}else{
				editInfo.phone = _val;
				updateEditInfo({phone:_val},function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
		});

		//角色修改
		$('#roleEditBtn').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();

			$('#roleEdit').text(''+$('#roleLabel').text());
			box.find('.lir').hide();
			box.find('.lir_edit').css('display','inline-block');
		});
		//点击下拉
		$('#roleEdit').off().click(function(){
			var _this = $(this);
			var _open = _this.attr('data-open');
			if('1' == open){
				//原来已经打开，现在要关闭
				_this.attr('data-open','0');
				$('#roleSelect,#roleSelectClass').hide();
			}else{
				var _width = _this.outerWidth();
				var _bound = 210 +_width;
				$('#roleSelectMaster').add('sel');
				$('#roleSelect').css('left',(_bound-76)+'px').show();
				$('#roleSelectClass').css('left',_bound+'px').show();
				_this.attr('data-open','1');
				$('#roleSelect,#roleSelectClass').show();
				$("#roleSelectClass").getNiceScroll().resize();
				$(window).on('click.contact',function(){
					$('#roleSelect,#roleSelectClass').hide();
					$('#roleEdit').attr('data-open','0');
					$(window).off('click.contact');
				});
			}
			return false;
		});
		//点击班主任下的班级
		$('#roleSelectClassList').off('click').on('click','a',function(){
			var _this = $(this);
			var id = _this.attr('data-id');
			var name = _this.text();

			//显示角色
			var roleLabel = '';
			if(1 == teacherInfo.isManager){
				roleLabel = '管理员 | ';
			}
			roleLabel = roleLabel + name+'班主任';
			$('#roleEdit').text(''+roleLabel);
			$('#roleSure').attr({
				'data-role':'2',
				'data-clasid':id
			});
			//return false;
		});
		//点击普通教师
		$('#roleSelectOther').off().click(function(){
			var roleLabel = '';
			if(1 == teacherInfo.isManager){
				roleLabel = '管理员 | ';
			}
			roleLabel = roleLabel+'普通教师';
			$('#roleEdit').text(''+roleLabel);
			$('#roleSure').attr({
				'data-role':'3'
			});
			//return false;
		});
		//确定修改
		$('#roleSure').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			var _val = $('#roleEdit').text();
			if(!_val || _val == $('#roleLabel').text()){
				//不用修改
				box.find('.lir').show();
				box.find('.lir_edit').hide();
			}else{
				var role = $('#roleSure').attr('data-role');
				var classId = $('#roleSure').attr('data-clasid');
				
				var _params = {
					role : role
				}
				if('2' == role){
					_params.classId = classId;
				}
				updateEditInfo(_params,function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
			$('#roleSelect,#roleSelectClass').hide();
			$('#roleEdit').attr('data-open','0');
		});

		//任教班级与科目修改
		$('#subjectEditBtn').off().click(function(){
			showSubjectPop();
		});
	}

	//更新家长信息
	function updateEditInfo(_params,callback){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = $.extend(editInfo,_params);

		params.uuid = uuid;
		params.schoolCode = schoolCode;

		_common.post(_SERVICE+'/webapp/personal/tea/update',params,function(rtn){
			if('001' == rtn.resultCode){
				//更新成功，刷新数据
				initContact(function(){
					callback && callback();
				});
				//通讯录刷新
				parent.callListener && parent.callListener({
					id : 'contact_shortcut',
					data : {}
				});

			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}


	//初始化弹窗
	function initSubjectPop(){
		var win = $('#subjectPop');

		//绑定关闭
		win.find('.close').off().click(function(){
			win.popupClose();
		});

		//绑定添加按钮
		win.find('.add_class').off().on('click',function(){
			var _new = $('#subjectPopNew');
			if('1' == _new.attr('data-show')){
				//已经显示添加未实现
				_common.tips('请先确认未保存的班级信息');
				return;
			}
			_new.show().attr('data-show','1');
		});

		//绑定删除科目
		$('#subjectPopList').off().on('click','.del_classli',function(){
			var _this = $(this);

			var tuuid = editInfo.targetUuid;
			var subjectCode = _this.attr('data-subjectCode');
			var classCode = _this.attr('data-classCode');

			var params = {
				"tuuid":tuuid,//修改对象的用户id
				"subjectCode":subjectCode,//科目号
				"classCode":classCode,//班级号
				"type":0//1新增 0删除
			}
			updateSubject(params,function(){
				_this.parent().remove();
				initContact(function(){
					showSubjectPop();
				});
			});
		});
		
		//绑定修改老师部门
		$('#teaDepartment').off().on('click',function(){
			showDepartmentPop();
		});
		//绑定修改老师带班 
		$('#classEditBtn').off().on('click',function(){
			showTeaClassPop();
		});

		//查询年级，班级
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode
		};
		//查询年级班级
		_common.post(_SERVICE+'/webapp/personal/tea/teachGrade',params,function(rtn){
			if('001' == rtn.resultCode){
				/*
				{
					"resultCode": "001",
					"resultMsg": "请求处理成功",
					"gradeList":[
						{
							"code":"20032",
							"name":"一年级",
							"classList":[
								{
									"code":"14356489347",
									"name":"小一(1)班"
								},...
							]
						},...
					]
				}
				*/
				var classMap = {};
				//填充年级
				var html = new Array();
				for(var i=0;i<rtn.gradeList.length;i++){
					var item = rtn.gradeList[i];
					html.push('<li data-code="'+item.code+'" data-name="'+item.name+'" title="'+item.name+'">'+item.name+'</li>');
					classMap[item.code] = item.classList;
				}
				$('#subjectPopGrade ul').html(html.join(''));


				//绑定年级选择
				$('#subjectPopGrade').attr("tabindex","0").off().on('click',function(){
					var _this = $(this);
					_this.focus().find('ul').show();
				}).on('blur',function(){
					$(this).find("ul").hide();
				}).on('click','li',function(){
					var _this = $(this);
					var _code = _this.attr('data-code');
					var _name = _this.attr('data-name');
					$('#subjectPopGrade').attr({
						'data-code' : _code,
						'data-name' : _name
					}).find('em').text(_name);

					//下拉列表
					$('#subjectPopGrade').find('ul').hide();

					//填充班级
					var classList = classMap[_code];
					var html = new Array();
					for(var i=0;i<classList.length;i++){
						var item = classList[i];
						html.push('<li data-code="'+item.code+'" data-name="'+item.name+'" title="'+item.name+'">'+item.name+'</li>');
					}
					$('#subjectPopClass ul').html(html.join(''));
					$('#subjectPopClass em').html('请选择班级');

					//防止冒泡
					return false;
				})

				//绑定班级选择
				$('#subjectPopClass').attr("tabindex","0").off().on('click',function(){
					var _this = $(this);
					_this.focus().find('ul').show();
				}).on('blur',function(){
					$(this).find("ul").hide();
				}).on('click','li',function(){
					var _this = $(this);
					var _code = _this.attr('data-code');
					var _name = _this.attr('data-name');
					$('#subjectPopClass').attr({
						'data-code' : _code,
						'data-name' : _name
					}).find('em').text(_name);

					//下拉列表
					$('#subjectPopClass').find('ul').hide();

					//防止冒泡
					return false;
				});
				
				//组建教师带班的html,
				var teaClassHtml = new Array();
				for(var i=0;i<rtn.gradeList.length;i++){
					var item = rtn.gradeList[i];
					teaClassHtml.push('<div class="class_list">');
					teaClassHtml.push('<div class="class_all">');
					teaClassHtml.push('<a data-gradeCode='+item.code+' class="class_check" href="javascript:;" id="" data-check="0"><i class="ipt_check"></i>'+item.name+'</a>');
					teaClassHtml.push('</div>');
					if(item.classList && item.classList.length > 0){
						teaClassHtml.push('<div class="class_sub">');
						for(var j=0;j<item.classList.length;j++){
							var cla = item.classList[j];
							teaClassHtml.push('<a style="width:28%;"  href="javascript:;" data-classCode='+cla.code+'><i class="ipt_check"></i>'+cla.name+'</a>');
						}
						teaClassHtml.push('</div>');
					}
					teaClassHtml.push('</div>');
				}
				$('#classPop_group .editbumen_list').html(teaClassHtml.join(''));
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});

		//查询科目
		_common.post(_SERVICE+'/webapp/personal/subject',params,function(rtn){
			if('001' == rtn.resultCode){
				/*
					{
						"resultCode": "001",
						"resultMsg": "请求处理成功",
						"subjectList":[
							{
								"code":"41",
								"name":"语文"
							},...
						]
					}
				*/
				var html = new Array();
				for(var i=0;i<rtn.subjectList.length;i++){
					var item = rtn.subjectList[i];
					html.push('<li data-code="'+item.code+'" data-name="'+item.name+'" title="'+item.name+'">'+item.name+'</li>');
				}
				$('#subjectPopSubject ul').html(html.join(''));
				//绑定科目选择
				$('#subjectPopSubject').attr("tabindex","0").off().on('click',function(){
					var _this = $(this);
					_this.focus().find('ul').show();
				}).on('blur',function(){
					$(this).find("ul").hide();
				}).on('click','li',function(){
					var _this = $(this);
					var _code = _this.attr('data-code');
					var _name = _this.attr('data-name');
					$('#subjectPopSubject').attr({
						'data-code' : _code,
						'data-name' : _name
					}).find('em').text(_name);

					//下拉列表
					$('#subjectPopSubject').find('ul').hide();

					//防止冒泡
					return false;
				});
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	//弹出班级科目弹层
	function showSubjectPop(){
		var win = $('#subjectPop');

		$('#subjectPopGrade em').html('请选择年级');
		$('#subjectPopGrade').removeAttr('data-code').removeAttr('data-name');

		$('#subjectPopClass em').html('请选择班级');
		$('#subjectPopClass').removeAttr('data-code').removeAttr('data-name').find('ul').html('');
		
		$('#subjectPopSubject').removeAttr('data-code').removeAttr('data-name');
		$('#subjectPopSubject em').html('请选择科目');


		$('#subjectPopNew').hide().attr('data-show','0');
		//绑定确定添加按钮
		win.find('.bt_ok').off().on('click',function(){
			var _this = $(this);
			var tuuid = editInfo.targetUuid;
			var classCode = $('#subjectPopClass').attr('data-code');
			var subjectCode = $('#subjectPopSubject').attr('data-code');

			if(!classCode){
				_common.tips('请选择班级');
				return;
			}
			if(!subjectCode){
				_common.tips('请选择任教科目');
				return;
			}
			
			var params = {
				"tuuid":tuuid,//修改对象的用户id
				"subjectCode":subjectCode,//科目号
				"classCode":classCode,//班级号
				"type":1//1新增 0删除
			}
			updateSubject(params,function(){
				_common.tips('success','添加成功');
				initContact(function(){
					showSubjectPop();
				});
			});
		});
		win.popupOpen({
			maskOpacity : 0
		});
	}

	//修改任教科目
	function updateSubject(_params,callback){
		//查询年级，班级
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = $.extend({},_params);
		params.uuid = uuid;
		params.schoolCode = schoolCode;
		//设置科目
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/personal/editTeach',params,function(rtn){
			_common.hideProgress();
			if('001' == rtn.resultCode){
				callback && callback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}
	
	//弹出修改教师所属部门弹层
	var isSubmit = false;
	function showDepartmentPop(){
		var box = $('#subjectPop_group');
		//获取列表中部门的数量。
		var departmentLen = $('#subjectPop_group .editbumen_list a').length;
		//关闭按钮，取消按钮
		$('#close_subjectPop,#submitBtn_cenecl').off().on('click',function(){
			//清空状态
			$('#checkAllGroup').attr('data-check',0);
			$('#checkAllGroup').find('i').removeClass().addClass('ipt_check');
			$('#subjectPop_group .editbumen_list a i').removeClass().addClass('ipt_check');
			$('#subjectPop_group .editbumen_ts').css('visibility','hidden');
			box.popupClose();
		});
		//获取当前老师已在的部门，并勾选到列表中对应的部门
		var labelNameArr = $('#deptLabel').text().split(' | ');
		$('#subjectPop_group .editbumen_list a').each(function(){
			var item = $(this);
			if(labelNameArr.indexOf(item.text()) !=-1){
				item.find('i').removeClass().addClass('ipt_checked');
			}
		});
		//全选，反选
		$('#checkAllGroup').off().on('click',function(){
			var _this = $(this);
			if(_this.attr('data-check') == 0){
				_this.attr('data-check',1);
				_this.find('i').removeClass().addClass('ipt_checked');
				$('#subjectPop_group .editbumen_list a i').removeClass().addClass('ipt_checked');
			}else{
				_this.attr('data-check',0);
				_this.find('i').removeClass().addClass('ipt_check');
				$('#subjectPop_group .editbumen_list a i').removeClass().addClass('ipt_check');
			}
			return false;
		});
		//单个选择
		$('#subjectPop_group .editbumen_list').off().on('click','a',function(){
			var _this = $(this);
			var checkBox = _this.find('i');
			if(checkBox.hasClass('ipt_check')){
				checkBox.removeClass().addClass('ipt_checked');
				var checkCount=0;
				$('#subjectPop_group .editbumen_list a').each(function(){
					var sub = $(this).find('i').hasClass('ipt_checked');
					if(sub){
						checkCount ++;
					}
				});
				if(checkCount == departmentLen ){
					$('#checkAllGroup').attr('data-check',1);
					$('#checkAllGroup').find('i').removeClass().addClass('ipt_checked');
				}
				
			}else{
				checkBox.removeClass().addClass('ipt_check');
				$('#checkAllGroup').attr('data-check',0);
				$('#checkAllGroup').find('i').removeClass().addClass('ipt_check');
			}
			$('#subjectPop_group .editbumen_ts').css('visibility','hidden');
			return false;
		});
		
		//确定按钮
		$('#submitBtn_update').off().on('click',function(){
			if(!editPremiss) {
				_common.tips('您没有修改资料的权限，请联系学校管理员修改');
				return;
			}
			if(isSubmit){
				_common.tips('正操作中,请勿重复操作哦');
				return;
			}
			//至少选择一个分组
			var checkCount=0;
			$('#subjectPop_group .editbumen_list a').each(function(){
				var sub = $(this).find('i').hasClass('ipt_checked');
				if(sub){
					checkCount ++;
				}
			});
			if(checkCount==0){
				$('#subjectPop_group .editbumen_ts').css('visibility','visible').html('请至少勾选一个所属部门，否则无法保存！');
				return false;
			}
			if(checkCount >8){
				$('#subjectPop_group .editbumen_ts').css('visibility','visible').html('最多只能勾选8个所属部门！');
				return false;
			}
			//获取所有选中的学校id
			var deptIds = [];
			var deptNames=[];
			$('#subjectPop_group .editbumen_list a').each(function(){
				var _this = $(this);
				var checkBox = _this.find('i');
				if(checkBox.hasClass('ipt_checked')){
					deptIds.push(_this.attr('data-deptid'));
					deptNames.push(_this.text());
				}
			});
			var params = {
					targetUuid:info.uuid,
					deptIds:deptIds.join(',')
			}
			isSubmit = true;
			updateDepartment(params,function(){
				
				_common.tips('success','修改成功');
				//通讯录刷新
				parent.callListener && parent.callListener({
					id : 'contact_shortcut',
					data : {}
				});
				box.popupClose();
				//修改页面
				$('#deptLabel').html(deptNames.join(' | '));
			});
			return false;
		});
		
		box.popupOpen({
			maskOpacity : 0
		});
	}
	//修改教师所属部门
	function updateDepartment(_params,cback){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = $.extend({},_params);
		params.uuid = uuid;
		params.schoolCode = schoolCode;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/personal/tea/update',params,function(rtn){
			isSubmit = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				cback && cback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}
	

/////////////////////////////////////////////////////////////////////
	//弹出修改教师带班弹层
	var isSubmitClass = false;
	function showTeaClassPop(){
		var box = $('#classPop_group');
		
		//关闭按钮，取消按钮
		$('#close_classPop,#submitClassBtn_cenecl').off().on('click',function(){
			//清空状态
			$('#classPop_group .editbumen_ts').css('visibility','hidden');
			$('#classPop_group .class_sub a i').removeClass().addClass('ipt_check');
			$('#checkAllClassGroup i').removeClass().addClass('ipt_check');
			$('#classPop_group .class_all i').removeClass().addClass('ipt_check');
			box.popupClose();
		});
		//获取当前老师已在的部门，并勾选到列表中对应的部门  teachClassId
		$('#classPop_group .class_sub a').each(function(){
			var _this = $(this);
			if(teachClassId.indexOf(_this.attr('data-classcode')) !=-1){
				_this.find('i').removeClass().addClass('ipt_checked');
			}
		});
		//全局：全选，反选
		$('#checkAllClassGroup').off().on('click',function(){
			var _this = $(this);
			var check = _this.find('i');
			if(check.hasClass('ipt_check')){
				check.removeClass().addClass('ipt_checked');
				$('#classPop_group .editbumen_list i').removeClass().addClass('ipt_checked');
			}else{
				check.removeClass().addClass('ipt_check');
				$('#classPop_group .editbumen_list i').removeClass().addClass('ipt_check');
			}
		});
		//局部：全选，反选
		$('#classPop_group .class_all').off().on('click','a',function(){
			var _this = $(this);
			var check = _this.find('i');
			if(check.hasClass('ipt_check')){
				check.removeClass().addClass('ipt_checked');
				_this.parent().next().find('i').removeClass().addClass('ipt_checked');
			}else{
				check.removeClass().addClass('ipt_check');
				_this.parent().next().find('i').removeClass().addClass('ipt_check');
			}
		});
		//单个选择
		$('#classPop_group .class_sub').off().on('click','a',function(){
			var _this = $(this);
			var parent =  _this.parent();
			//先获取该层的所有子元素数目，
			var total = parent.find('a').length;
			var check = _this.find('i');
			if(check.hasClass('ipt_check')){
					check.removeClass().addClass('ipt_checked');
			}else{
				check.removeClass().addClass('ipt_check');
				$('#checkAllClassGroup i').removeClass().addClass('ipt_check');
			}
			var checkCount=0;
			parent.find('a').each(function(){
				var sub = $(this).find('i');
				if(sub.hasClass('ipt_checked')){
					checkCount++;
				}
			});
			if(checkCount == total ){
				parent.prev().find('i').removeClass().addClass('ipt_checked');
			}else{
				parent.prev().find('i').removeClass().addClass('ipt_check');
			}
			$('#classPop_group .editbumen_ts').css('visibility','hidden');
		});
		
		//提示的显示   
		$('#wenhao').off().on('click',function(){
			$('.editclass_hlep').fadeIn();
			return false;
		}).mouseleave(function(){
			$('.editclass_hlep').fadeOut();
			return false;
		});
		
		
		//确定按钮
		$('#submitClassBtn_update').off().on('click',function(){
			if(!editPremiss) {
				_common.tips('您没有修改资料的权限，请联系学校管理员修改');
				return;
			}
			if(isSubmitClass){
				_common.tips('正操作中,请勿重复操作哦');
				return;
			}
			//至少勾选一个。
			var checkCount=0;
			$('#classPop_group  .editbumen_list .class_sub a').each(function(){
				var sub = $(this).find('i').hasClass('ipt_checked');
				if(sub){
					checkCount ++;
				}
			});
			/*
			if(checkCount ==0){
				$('#classPop_group .editbumen_ts').css('visibility','visible').html('请至少勾选一个所属班级，否则无法保存！');
				return false;
			}
			*/
			//获取已选中的状态
			var classCodes=[];
			var classNames=[];
			$('#classPop_group .editbumen_list .class_list .class_sub a').each(function(){
				var _this = $(this);
				if(_this.find('i').hasClass('ipt_checked')){
					
					classCodes.push(_this.attr('data-classcode'));
					classNames.push(_this.text());
				}
			});
			//console.log(classCodes);
			//console.log(classNames);

			var params = {
					tuuid:info.uuid,
					classCodes:classCodes.join(',')
			}
			
			isSubmitClass = true;
			updateTeaClass(params,function(){
				
				_common.tips('success','修改成功');
				//通讯录刷新
				parent.callListener && parent.callListener({
					id : 'contact_shortcut',
					data : {}
				});
				box.popupClose();
				//修改页面
				//if(classNames.length>3){
				//	classNames = classNames.slice(0,3);
				//}
				$('#classPop_group .editbumen_ts').css('visibility','hidden');
				$('#classPop_group .class_sub a i').removeClass().addClass('ipt_check');
				$('#checkAllClassGroup i').removeClass().addClass('ipt_check');
				$('#classPop_group .class_all i').removeClass().addClass('ipt_check');
				//$('#classLabel').html(classNames.join(' | ')+'...');
				
				//initPage();
				initContact(function(){
					//callback && callback();
				});

			});

			
		});
		
		box.popupOpen({
			maskOpacity : 0
		});
	}
	
	//修改教师带班
	function updateTeaClass(_params,cback){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = $.extend({},_params);
		params.uuid = uuid;
		params.schoolCode = schoolCode;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/personal/editTeachClass',params,function(rtn){
			isSubmitClass = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				cback && cback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}
	
/////////////////////////////////////////////////////////////////////

	//初始化关注按钮
	function initFollow(puuid){
		$('#inviteBtn').off().click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'qrcode';
			options.url = './qrcode.html';
			options.title =  '学校二维码';
			options.callback = function(){
				//do nothing
			}
			parent.closeWin && parent.closeWin({
				isSwitch : true,
				callback : function(){
					parent.openWin && parent.openWin(options);
				}
			});
		});
	}

	//初始化发送留言
	function initSendMessage(puuid,name,cid){
		var applying = false;
		//初始化资料修改
		$('#inviteTips a').off().on('click',function(){
			if(applying){
				return;
			}
			var uuid =  _common.getUuid();
			if(!uuid){
				_common.lostLogin();
				return;
			}
			var schoolCode = _common.getSchoolCode();
			if(!schoolCode){
				_common.lostLogin();
				return;
			}
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'targetUuid' : puuid,
				'noticeType' : '1'
			};
			applying = true;
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/linkman/notice',params,function(rtn){
				applying = false;
				if('001' == rtn.resultCode){
					_common.hideProgress();
					_common.tips('success','发送成功');
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.tips(rtn.resultMsg);
				}
			});
		});

		$('#messageBtn').off().click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'messagesend';
			options.url = './message_send.html?puuid='+encodeURIComponent(puuid)+'&pname='+encodeURIComponent(name+'(教师)')+'&cid='+encodeURIComponent(cid)+'&userType=1';
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
		});
		if(_common.getFuncs('words')){
			$('#messageBtn').show();
		}else{
			$('#messageBtn').hide();
		}
	}

	//初始化删除
	function initDelete(targetUuid){
		$('#delBtn').off().click(function(){
			var uuid = _common.getUuid();
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
				'targetUuid':targetUuid
			};
			_common.showMsg({
				msg : '一旦你移除了此教师，对方将离开当前班级，不再收到班级的相关消息，请谨慎对待！',
				textAlign : 'left',
				btnText : '取消',
				okbtnText : '移除',
				okcallback : function(){
					_common.showProgress();
					_common.post(_SERVICE+'/webapp/personal/tea/del',params,function(rtn){
						_common.hideProgress();
						if('001' == rtn.resultCode){
							//通知刷新
							parent.callListener && parent.callListener({
								id : 'contact_shortcut',
								data : {}
							});
							_common.showMsg({
								msg : '移除成功',
								callback : function(){
									parent.closeWin && parent.closeWin();
								}
							});
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.tips(rtn.resultMsg);
						}
					});
				}
			});
		});
	}
	
	//弹出删除教师弹层
	function showDelTeaPop(targetUuid){
		var box = $('#msgBox_del');
		//关闭按钮
		$('#close_msgBoxPop').off().on('click',function(){
			box.popupClose();
		});
		
		//确定按钮
		$('#deleteTea').off().on('click',function(){
			var uuid = _common.getUuid();
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
				'targetUuid':targetUuid
			};
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/personal/tea/del',params,function(rtn){
				_common.hideProgress();
				if('001' == rtn.resultCode){
					//通知刷新
					parent.callListener && parent.callListener({
						id : 'contact_shortcut',
						data : {}
					});
					_common.showMsg({
						msg : '移除成功',
						callback : function(){
							parent.closeWin && parent.closeWin();
						}
					});
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.tips(rtn.resultMsg);
				}
			});
		});
		
		box.popupOpen({
			maskOpacity : 0
		});
	}
	//更新滚动条
	function updateScrollBar(){
		var scrollobj = $('.nicescrollContainer').getNiceScroll();
		scrollobj.each(function(){
			this.resize();
		});
	}


	//业务入口
	initPage();


	module.exports = qt_model;

});
