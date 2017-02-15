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
	var qt_valid = require('qt/valid');
	var _common = require('./common');

	//滚动条美化插件
	require('jquery/nicescroll');


	//服务
	var _SERVICE = _common.SERVICE;
	var _window = window;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	function initPage(){

		//管理员才允许修改
		if(!_common.isAdmin()){
			_common.showMsg({
				msg : '你不是管理员，无法添加教师',
				callback : function(){
					window.closeWin && window.closeWin();
				}
			});
			return;
		}

		// 毕业升级提醒
		if(1==_common.localGet('isInUpgrade')){
			$('.notice_wrap,.notice_model').show();
		}

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

		$('#addBox').css({
			visibility : 'visible'
		});
		updateScrollBar();

		//初始化班级列表
		initDeptSelect();
		initClassList();
		initSubjectPop();
		bindPage();

	}

	//绑定各处点击
	function bindPage(){

		//任教班级与科目修改
		$('#subjectEditBtn').off().click(function(){
			showSubjectPop();
		});

		var applying = false;

		//绑定提交
		$('#submitBtn').off().click(function(){
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

			var teaName = $.trim($('#teaName').val());
			var phone = $.trim($('#teaPhone').val());

			if(!teaName){
				_common.tips('请输入教师姓名');
				return;
			}
			if(!qt_valid.phone(phone)){
				_common.tips('请填入正确的教师手机号');
				return;
			}
			var deptId = $('#teaDeptSelect').attr('data-deptId');

			var role = $('#roleEdit').attr('data-role');
			var classid = $('#roleEdit').attr('data-clasid');
			if(!role){
				_common.tips('请输入教师角色');
				return;
			}
			role = parseInt(role);
			//转换任教科目数据
			var classList = [];
			var _subjects = {};
			for(var key in subjectCache){
				var obj = subjectCache[key];
				if(obj){
					var classCode = obj.classCode;
					var subjectCode = obj.subjectCode;

					var _subject= _subjects[classCode];
					if(!_subject){
						_subject = _subjects[classCode] = [];
						classList.push({
							code : classCode
						});
					}
					_subject.push({code : subjectCode});
				}
			}
			if(classList.length>=0){
				for(var i=0;i<classList.length;i++){
					classList[i].teaches = _subjects[classList[i].code]
				}
			}
			teaName = _common.filterXss(teaName);
//			phone = _common.filterXss(phone);
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'teaName' : teaName,
				'phone' : phone,
				'role' : role,
				'classList' : classList
			};
			if(2 == role){
				params.classCode = classid;
			}
			if(deptId){
				params.deptCode = deptId;
			}

			applying = true;
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/personal/tea/add',params,function(rtn){
				applying = false;
				_common.hideProgress();
				if('001' == rtn.resultCode){
					//通讯录刷新
					parent.callListener && parent.callListener({
						id : 'contact_shortcut',
						data : {}
					});
					_common.showMsg({
						msg : '添加成功',
						callback : function(){
							location.reload();
						}
					});
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.tips(rtn.resultMsg);
				}
			});
		});
	}

	//初始化下部门选择拉框
	function initDeptSelect(){

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
		_common.post(_SERVICE+'/webapp/personal/tea/deptlist',params,function(rtn){
			if('001' == rtn.resultCode){
				//填充列表
				var html = new Array();
				for(var i=0;i<rtn.deptList.length;i++){
					var item = rtn.deptList[i];
					html.push('<li data-value="'+(item.code? item.code:item.id )+'" data-label="'+item.name+'">'+item.name+'</li>');
				}
				$('#teaDeptSelect ul').html(html.join(''));
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});

		//自定义下拉选择
		var select = initSelect('teaDeptSelect',function(li){
			var value = li.attr('data-value');
			var label = li.attr('data-label');
			select.attr({
				'data-deptId' : value
			}).find('em').html(''+label);
		});

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


		//绑定点击下拉
		$('#roleEdit').off().click(function(){
			var _this = $(this);
			var _open = _this.attr('data-open');
			if('1' == open){
				//原来已经打开，现在要关闭
				_this.attr('data-open','0');
				$('#roleSelect,#roleSelectClass').hide();
			}else{
				_this.attr('data-open','1');
				$('#roleSelectMaster').add('sel');
				$('#roleSelect,#roleSelectClass').show();
				$("#roleSelectClass").getNiceScroll().resize();
				$(window).on('click.contact',function(){
					$('#roleSelect,#roleSelectClass').hide();
					$('#roleEdit').attr('data-open','0');
					$(window).off('click.contact');
				});
			}
			updateScrollBar();
			return false;
		});
		//点击班主任下的班级
		$('#roleSelectClassList').off('click').on('click','a',function(){
			var _this = $(this);
			var id = _this.attr('data-id');
			var name = _this.text();
			var roleLabel = name+'班主任';
			$('#roleEdit').attr({
				'data-role':'2',
				'data-clasid':id
			}).find('em').text(''+roleLabel);
			//return false;
		});
		//点击普通教师
		$('#roleSelectOther').off().click(function(){
			$('#roleEdit').attr({
				'data-role':'3'
			}).find('em').text('普通教师');
			//return false;
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
			win.popupOpen({
				maskOpacity : 0
			});
		});

		//绑定删除科目
		$('#subjectPopList').off().on('click','.del_classli',function(){
			var _this = $(this);
			_this.parent().remove();
			var classCode = _this.attr('data-classCode');
			var subjectCode = _this.attr('data-subjectCode');
			var exist = subjectCache[classCode+'-'+subjectCode];
			if(exist){
				subjectCache[classCode+'-'+subjectCode] = null;
				delete subjectCache[classCode+'-'+subjectCode];
			}
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

		//自定义滚动条，防止溢出
		var scroll = $('#subjectPopListCon');
		scroll.css({
			overflow : 'hidden'
		});
		scroll.niceScroll($('#subjectPopListWrap'),{
			cursorcolor:'#ccc',
			cursorwidth:'8px',
			cursorminheight:100,
			scrollspeed:60,
			mousescrollstep:60,
			autohidemode:true,
			bouncescroll:false
		});

	}

	//弹出班级科目弹层
	//科目缓存
	var subjectCache = {};
	function showSubjectPop(){
		var win = $('#subjectPop');

		$('#subjectPopGrade em').html('请选择年级');
		$('#subjectPopGrade').removeAttr('data-code').removeAttr('data-name');

		$('#subjectPopClass em').html('请选择班级');
		$('#subjectPopClass').removeAttr('data-code').removeAttr('data-name').find('ul').html('');

		$('#subjectPopSubject').removeAttr('data-code').removeAttr('data-name');
		$('#subjectPopSubject em').html('请选择科目');

		$('#subjectPopNew').show().attr('data-show','1');
		//绑定确定添加按钮
		win.find('.bt_ok').off().on('click',function(){

			var _this = $(this);
			var gradeCode = $('#subjectPopGrade').attr('data-code');
			var gradeName = $('#subjectPopGrade').attr('data-name');
			var classCode = $('#subjectPopClass').attr('data-code');
			var className =  $('#subjectPopClass').attr('data-name');
			var subjectCode = $('#subjectPopSubject').attr('data-code');
			var subjectName = $('#subjectPopSubject').attr('data-name');

			if(!classCode){
				_common.tips('请选择班级');
				return;
			}
			if(!subjectCode){
				_common.tips('请选择任教科目');
				return;
			}
			var exist = subjectCache[classCode+'-'+subjectCode];
			if(exist){
				_common.tips('已经添加过该科目');
				return;
			}
			subjectCache[classCode+'-'+subjectCode] = {
				gradeCode : gradeCode,
				gradeName : gradeName,
				classCode : classCode,
				className : className,
				subjectCode : subjectCode,
				subjectName : subjectName
			};
			//$('#subjectPopNew').before('<li data-subject="1"><span class="li_l">'+gradeName+'</span><span class="li_m">'+className+'</span><span class="li_r">'+subjectName+'</span><a href="javascript:;" class="del_classli" data-subjectCode="'+subjectCode+'" data-classCode="'+classCode+'"></a></li>');
			$('#subjectPopListWrap').append('<li data-subject="1"><span class="li_l">'+gradeName+'</span><span class="li_m">'+className+'</span><span class="li_r">'+subjectName+'</span><a href="javascript:;" class="del_classli" data-subjectCode="'+subjectCode+'" data-classCode="'+classCode+'"></a></li>');
			$("#subjectPopListCon").getNiceScroll().resize();
			$("#subjectPopListCon").getNiceScroll(0).doScrollTop(9999, 0);

			//$('#subjectPopNew').hide().attr('data-show','0');
			win.popupOpen({
				maskOpacity : 0
			});

			var html = new Array();
			for(var key in subjectCache){
				var obj = subjectCache[key];
				html.push(obj.className+'·'+obj.subjectName);
			}
			var label = html.length>0?html.join(' | '):'请选择';
			$('#subjectEditBtn').find('em').text(label);
			updateScrollBar();
		});
		win.popupOpen({
			maskOpacity : 0
		});
	}


	//初始化一个自定义结构的下拉列表
	function initSelect(id,callback){
		var select = $('#'+id);
		select.attr("tabindex","0").on('click',function(){
			$(this).focus().find("ul").toggle();
		}).on('blur',function(){
			$(this).find("ul").hide();
		}).on('click','li',function(){
			var _this = $(this);
			select.find("ul").hide();
			callback && callback(_this);
			return false;
		});
		return select;
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
