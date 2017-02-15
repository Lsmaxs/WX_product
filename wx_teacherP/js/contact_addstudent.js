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
		//管理员或班主任才允许修改
		if(!_common.isAdmin() && !_common.isMaster()){
			_common.showMsg({
				msg : '你不是管理员或班主任，没有权限使用本功能',
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
		initClassList();
		initRelatiList();
		bindPage();
		
	}

	//绑定各处点击
	function bindPage(){

		//绑定添加多个家长按钮
		var parentUuid = 1;
		$('#addMoreBtn').off().click(function(){
			parentUuid++;

			var size = $('#parentList div[data-parent="1"]').size();
			size++;

			var html = new Array();
			html.push('<div data-parent="1">');
			html.push('	<h3>家长'+size+'信息</h3>');
			html.push('	<span>');
			html.push('		<p>家长姓名</p>');
			html.push('		<input class="input_txt_name1" type="text" />');
			html.push('	</span>');
			html.push('	<span>');
			html.push('		<p>家长手机号码</p>');
			html.push('		<input class="input_txt_phone" type="text" />');
			html.push('	</span>');
			html.push('	<span>');
			html.push('		<p>亲属关系</p>');
			html.push('		<div id="relateSelect_'+parentUuid+'" class="select_gx select_box"><em>请选择</em><b></b>');
			html.push('			<ul>'+relationListHtml.join('')+'</ul>');
			html.push('		</div>');
			html.push('	</span>');
			html.push('	<a class="del_name" href="javascript:;">删除</a>');
			html.push('</div>');
			$('#parentList').append(html.join(''));

			var select = initSelect('relateSelect_'+parentUuid,function(_this){
				var _code = _this.attr('data-code');
				var _name = _this.attr('data-name');
				select.attr({
					'data-code':_code,
					'data-name':_name
				});
				select.find('em').html(_name);
			});

			$('.nicescrollContainer').getNiceScroll().resize();
			$(".nicescrollContainer").getNiceScroll(0).doScrollTop(9999, 0);

		});

		//绑定删除按钮
		$('#parentList').off().on('click','.del_name',function(){
			var _this = $(this);
			_this.parent().remove();
			reOrderParent();
			updateScrollBar();
		}).on('blur','.input_txt_name1',function(){
			var _this = $(this);
			var _name = $.trim(_this.val());
			if(_name.indexOf('家长')>=0){
				_name = _name.replace('家长','');
				_this.val(_name);
			}
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

			var classCode = $('#classSelect').attr('data-classCode');

			if(!classCode){
				_common.tips('请选择学生所在班级');
				return;
			}

			var stuName = $.trim($('#stuName').val());
			if(!stuName){
				_common.tips('请输入学生姓名');
				return;
			}
            var stuCode = $.trim($('#stuCode').val());
            if(isNaN(stuCode)){
                _common.tips('请输入学生学号');
                return;
            }

			var parents = new Array();

			var parentdivs = $('#parentList [data-parent="1"]');
			var notPass = false;
			parentdivs.each(function(index,obj){
				var parent = parentdivs.eq(index);
				var name = $.trim(parent.find('.input_txt_name1').val());
				var phone = $.trim(parent.find('.input_txt_phone').val());
				var relationCode =1; // parent.find('.select_box').attr('data-code');
				if(!name){
					_common.tips('请输入家长'+(1+index)+'的姓名');
					notPass = true;
					return false;
				}
				if(name.indexOf('家长')>=0){
					_common.tips('家长'+(1+index)+'的姓名请不要包含‘家长’');
					notPass = true;
					return false;
				}
				if(!qt_valid.phone(phone)){
					_common.tips('请正确输入家长'+(1+index)+'的手机号码');
					notPass = true;
					return false;
				}
				if(!relationCode){
					_common.tips('请正确输入家长'+(1+index)+'与学生的亲属关系');
					notPass = true;
					return false;
				}
				name = _common.filterXss(name);
				parents.push({
					name : name,
					phone : phone,
					relationCode : relationCode
				});
			});
			if(notPass){
				return;
			}
			if(parents.length<=0){
				_common.tips('每个学生最少需要一个家长');
				return;
			}
			//stuName = _common.filterXss(stuName);
            //stuCode = _common.filterXss(steCode);
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'classCode' : classCode,
				'stuName' : stuName,
				'stuCode':stuCode,
				'parents': parents
			};

			applying = true;
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/personal/par/add',params,function(rtn){
				applying = false;
				_common.hideProgress();
				if('001' == rtn.resultCode){
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

	//家长索引重新排序
	function reOrderParent(){
		var h3s = $('#parentList h3');
		h3s.each(function(index,obj){
			h3s.eq(index).text('家长'+(1+index)+'信息');
		});
	}


	//查询关系列表
	var relationList = [];
	var relationListHtml = [];
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
					html.push('<li data-code="'+item.code+'" data-name="'+item.name+'" title="'+item.name+'">'+item.name+'</li>');
				}
				relationList = rtn.relationList;
				relationListHtml = html;
				$('#relateSelect_1').find('ul').html(html.join(''));
				var select = initSelect('relateSelect_1',function(_this){
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





	//查询所带班级
	function initClassList(){

		if(!_common.isAdmin() && !_common.isMaster()){
			//非管理员班主任
			var masterClassInfo = _common.getMasterClassInfo();
			var classSelect = $('#classSelect').attr('data-classCode',masterClassInfo.cid).css('cursor','default');
			classSelect.find('em').html(masterClassInfo.name);
			classSelect.find('b').remove();
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
			'schoolCode' : schoolCode
		};
		_common.post(_SERVICE+'/webapp/personal/tea/teachClass',params,function(rtn){
			if('001' == rtn.resultCode){
				//填充列表
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
					html.push('<li data-value="'+(item.code?item.code:item.id)+'" data-label="'+item.name+'">'+item.name+'</li>');
				}
				$('#classSelect ul').html(html.join(''));
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});

		//自定义下拉选择
		var select = initSelect('classSelect',function(li){
			var value = li.attr('data-value');
			var label = li.attr('data-label');
			select.attr({
				'data-classCode' : value
			}).find('em').html(''+label);
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
