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

	function initPage(){
		if(!info){
			_common.tips('家长信息查询失败');
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

		_common.showLoading();
		initContact(function(){
			_common.hideLoading();
			$('#contact').css({
				visibility : 'visible'
			});
			updateScrollBar();
		});
		//默认显示非修改
		$('.user_edit_par .lir').show();
		$('.user_edit_par .lir_edit').hide();

		initClassList();
		initRelatiList();
		initEdit();
	}

	//获取详情
	function initContact(callback){

		var pUuid = info.uuid;
		if(!pUuid){
			//错误，理论上要加入提示
			_common.tips('目标用户信息丢失');
			return;
		}
		var stuId = info.sid;
		if(!stuId){
			//错误，理论上要加入提示
			_common.tips('目标用户信息丢失');
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
			'puuid' : pUuid,
			'stuId' : stuId
		};
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/linkman/par/detail',params,function(rtn){
			_common.hideProgress();
			if('001' == rtn.resultCode){
				//填充联系人
				fillContact(rtn);
				callback && callback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	//填充联系人

	var editInfo = {};
	var parentInfo = null;
	function fillContact(rtn){
		/*
		{
			"resultCode": "001",
			"resultMsg": "请求处理成功",
			"parName": "陈建宏",
			"uuid": "188ec1ee625711e58635fa163e0e90d3",
			"icon": "http://shp.qpic.cn/bizmp/ILgQqqAciauzSA2npjfPRwGnt1KDwxk58QIQW2FvibaiaBpwkRllWJib0Q/",
			"followed": 1,
			"phone": "13380899740",

			"stuId":"198ec1ee625711e58635fa163e0e90d3",//学生id,
			"stuName":"陈筱敏",//学生名称
			"classInfo":{
				"id":"144446909521827281",
				"name":"小二(1)班"
		    }
			"relation":{
				"code":"1",
				"name":"爸爸"
			}
		}
		*/

		//填充个人信息
		var _src = rtn.icon?rtn.icon:_common.getDefaultHeadUrl();
		_src = 1==rtn.followed?_src:'./images/user_face_big.png';
		$('#detail_img').attr('src',_src);

		$('#detail_name').text(''+rtn.parName);
		$('#detail_relate').text(''+rtn.stuName+' '+rtn.relation.name);

		$('#nameLabel').text(''+rtn.parName);
		$('#phoneLabel').text(''+rtn.phone);
		$('#stuNameLabel').text(''+rtn.stuName);
		$('#classNameLabel').text(''+rtn.classInfo.name).attr('data-classId',rtn.classInfo.id);
		$('#relateLabel').text(''+rtn.relation.name).attr('data-relationCode',rtn.relation.code);


		//缓存修改信息
		editInfo = {
			//"uuid":_common.getUuid(),//登录用户uuid
			"targetUuid":rtn.uuid,//要修改的家长用户的uuid
			"stuId":rtn.stuId//学生id
			//"stuName":rtn.stuName,//学生姓名
			//"schoolCode":_common.getSchoolCode(),
			//"parName":rtn.parName,
			//"classId":rtn.classInfo.id,//学生所在班级id
			//"phone":rtn.phone
			//"relationCode":rtn.relation.code//家长关系码
		};
		parentInfo = rtn;

		//可否修改
		var isEditable = (1 == rtn.editable);
		if(!isEditable){ //修改过原为isEditable
			$('.bt_edit').show();
		}else{
			$('.bt_edit').hide();
		}



		//根据是否关注现实按钮
		if(1 == rtn.followed){
			$('#inviteBtn').hide();
			$('#messageBtn').show();
			if(isEditable){
				$('#inviteTips').show();
			}else{
				$('#inviteTips').hide();
			}
			initSendMessage(rtn.uuid,rtn.parName,rtn.classInfo.id,rtn.stuName,rtn.relation.name);
		}else{
			$('#inviteBtn').show();
			$('#messageBtn').hide();
			initFollow(rtn.uuid);
			$('#inviteTips').hide();
		}

		//设置关注，留言，删除信息
		if(!isEditable){
			$('#delBtn').show();
			initDelete(rtn.uuid,rtn.stuId);
		}else{
			$('#delBtn').hide();
		}
		updateScrollBar();
	}

	//查询所带班级
	function initClassList(){
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
					//html.push('<option value="'+item.id+'" data-name="'+item.name+'">'+item.name+'</option>');
					html.push('<li data-code="'+item.id+'" data-name="'+item.name+'" title="'+item.name+'">'+item.name+'</li>');
				}
				$('#classNameEdit').find('ul').html(html.join(''));

				var select = initSelect('classNameEdit',function(_this){
					var _code = _this.attr('data-code');
					var _name = _this.attr('data-name');
					select.attr({
						'data-code':_code,
						'data-name':_name
					});
					select.find('em').html(_name);
				});

			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	//查询关系列表
	function initRelatiList(){
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
		_common.post(_SERVICE+'/webapp/personal/par/relation',params,function(rtn){
			if('001' == rtn.resultCode){
				//填充班级列表
				/*
				{
					"resultCode": "001",
					"resultMsg": "请求处理成功",
					"relationList":[
						{
							"code":"001",
							"name":"爸爸"
						},...
					]
				}
				*/
				var html = new Array();
				for(var i=0;i<rtn.relationList.length;i++){
					var item = rtn.relationList[i];
					//html.push('<option value="'+item.code+'" data-name="'+item.name+'">'+item.name+'</option>');
					html.push('<li data-code="'+item.code+'" data-name="'+item.name+'" title="'+item.name+'">'+item.name+'</li>');
				}
				$('#relateEdit').find('ul').html(html.join(''));

				var select = initSelect('relateEdit',function(_this){
					var _code = _this.attr('data-code');
					var _name = _this.attr('data-name');
					select.attr({
						'data-code':_code,
						'data-name':_name
					});
					select.find('em').html(_name);
				});

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
			if(!_name || _name == $('#nameLabel').text()){
				//不用修改
				box.find('.lir').css('display','inline-block');
				box.find('.lir_edit').hide();
			}else{
				updateEditInfo({parName:_name},function(){
					$('#stuNameLabel').html(_name);
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
				updateEditInfo({phone:_val},function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
		});

		//关联学生修改
		$('#stuNameEditBtn').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			$('#stuNameEdit').val(''+$('#stuNameLabel').text());
			box.find('.lir').hide();
			box.find('.lir_edit').css('display','inline-block');
		});
		$('#stuNameSure').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			var _val = $('#stuNameEdit').val();
			_val = _common.filterXss(_val);
			if(!_val || _val == $('#stuNameLabel').text()){
				//不用修改
				box.find('.lir').css('display','inline-block');
				box.find('.lir_edit').hide();
			}else{
				updateEditInfo({stuName:_val},function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
		});

		//所在班级修改
		$('#classNameEditBtn').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();

			$('#classNameEdit').attr('data-code','').find('em').text($('#classNameLabel').text());

			box.find('.lir').hide();
			box.find('.lir_edit').css('display','inline-block');
		});
		$('#classNameSure').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			var _val = $('#classNameEdit').attr('data-code');
			var _classId = $('#classNameLabel').attr('data-classId');
			if(!_val || _val == _classId){
				//不用修改
				box.find('.lir').css('display','inline-block');
				box.find('.lir_edit').hide();
			}else{
				updateEditInfo({classId:_val},function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
		});

		//亲属关系修改
		$('#relateEditBtn').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();

			$('#relateEdit').attr('data-code','').find('em').text($('#relateLabel').text());

			box.find('.lir').hide();
			box.find('.lir_edit').css('display','inline-block');
		});
		$('#relateSure').off().click(function(){
			var _this = $(this);
			var box = _this.parent().parent();
			var _val = $('#relateEdit').attr('data-code');
			var _relationCode = $('#relateLabel').attr('data-relationCode');
			if(!_val || _val == _relationCode){
				//不用修改
				box.find('.lir').css('display','inline-block');
				box.find('.lir_edit').hide();
			}else{
				updateEditInfo({relationCode:_val},function(){
					_common.tips('success','修改成功');
					box.find('.lir').css('display','inline-block');
					box.find('.lir_edit').hide();
				});
			}
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

		_common.showProgress();
		_common.post(_SERVICE+'/webapp/personal/par/update',params,function(rtn){
			_common.hideProgress();
			if('001' == rtn.resultCode){
				//更新成功，刷新数据
				if(rtn.newChildId) {
					editInfo.stuId = rtn.newChildId;
					parentInfo.stuId = rtn.newChildId;
					info.sid = rtn.newChildId;
				}
				initContact();
				//通知刷新
				parent.callListener && parent.callListener({
					id : 'contact_shortcut',
					data : {}
				});
				callback && callback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}


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
	function initSendMessage(puuid,name,cid,stuName,tag){
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
				'noticeType' : '2'
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
			options.url = './message_send.html?puuid='+encodeURIComponent(puuid)+'&pname='+encodeURIComponent(name+'('+stuName+' '+tag+')')+'&cid='+encodeURIComponent(cid)+'&userType=2';
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
	function initDelete(targetUuid,stuId){
		$('#delBtn').off().click(function(){
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
				'targetUuid':targetUuid,
				'stuId': stuId
			};
			_common.showMsg({
				msg : '一旦你移除了此家长，对方将离开当前班级，不再收到班级的相关消息，请谨慎对待！',
				textAlign : 'left',
				btnText : '取消',
				okbtnText : '移除',
				okcallback : function(){
					_common.showProgress();
					_common.post(_SERVICE+'/webapp/personal/par/del',params,function(rtn){
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
