define(function(require, exports, module) {

	/**
	 * @desc 
	 * @exports
	 * @version 1.9.1
	 * @author huangkai
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var _common = require('./common');

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

	//初始化通讯录
	var _groupCache = {};
	var addList = {};
	var delList = {};
	
	// 项目版本
	var _version = seajs.data.project_version;

	/**
	* 获取分组管理/班级管理
	* type 获取数据标识: dept=分组; class=班级
	*/
	function initPage() {
		_getTeacherGroup();
	}
	
	//加载教师分组数据
	function _getTeacherGroup() {
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
			'isRefresh' : 1
		};
		
		$('#groupBox').find('.quesclass_list_class').html('数据加载中，请稍候...');
		_common.post(_SERVICE+'/webapp/linkman/list',params,function(rtn){
			
			if('001' == rtn.resultCode){
				if(rtn.linkmanTeacher) {
					_fillDeptList(rtn.linkmanTeacher);
					_disableBtmBtns();
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	//基本事件绑定
	function initPageEvent() {
		
		var groupWin = $('#groupBox');
		var winAddBox = $('#addBox');
		
		//绑定新增弹窗
		var _deptId = 0;
		groupWin.find('.quesclass_add').off().click(function() {
			_deptId = 0;
			var winWidth = $(window).width();
			var showWidth = Math.round((winWidth - 320)/2);
			
			winAddBox.find('.quesclass_btn_blue,.quesclass_btn_gray').show();
			winAddBox.css({ display:'block', left:showWidth + 'px'});
			winAddBox.find('.quesclass_zhuyi').html('');
			winAddBox.find('.quesclass_zhuyi').hide();
			
			$('#cover').show();
		});
		
		//绑定重命名弹窗
		groupWin.find('.quesclass_update').off().click(function() {
			
			var listChecked = _getListCheckedItem();
			if(!listChecked) {
				return;
			}
			
			$('#groupName').val(listChecked.text());
			_deptId = listChecked.attr('data-deptId');
			
			var winWidth = $(window).width();
			var showWidth = Math.round((winWidth - 320)/2);
			
			winAddBox.css({ display:'block', left:showWidth + 'px'});
			winAddBox.find('.quesclass_zhuyi').html('');
			winAddBox.find('.quesclass_zhuyi').hide();
			
			$('#cover').show();
		});
		
		//关闭窗口
		winAddBox.find('.quesclass_close, .quesclass_btn_gray').off().click(function() {
			_hideCover();
		});
		
		//保存
		var saving = false;
		winAddBox.find('.quesclass_btn_blue').off().click(function() {
			
			if(saving) {
				return;
			}
			
			var groupName = $('#groupName').val();
			if(groupName == '') {
				winAddBox.find('.quesclass_zhuyi').html('名称不能为空');
				winAddBox.find('.quesclass_zhuyi').show();
				return;
			}
			
			for(var deptIndex in _groupCache) {
				var deptItem = _groupCache[deptIndex];
				if(deptItem.deptName == groupName) {
					_common.showMsg('已存在相同名称的教师分组！');
					return;
				}
			}
			
			var params = {
				schoolCode: _common.getSchoolCode(),
				uuid: _common.getUuid(),
				deptName: groupName,
				order:''
			};
			var posturl = _SERVICE+'/webapp/school/dept/add';
			var _ordertype = 1;
			if(_deptId > 0) {
				posturl = _SERVICE+'/webapp/school/dept/update';
				params.deptId = _deptId;
				_ordertype = 2;
			}
			saving = true;
			winAddBox.find('.quesclass_btn_blue,.quesclass_btn_gray').hide();
			winAddBox.find('.quesclass_zhuyi').html('正在提交...');
			winAddBox.find('.quesclass_zhuyi').show();
			_common.post(posturl ,params,function(rtn){
				saving = false;
				if('001' == rtn.resultCode){
					_hideCover();
					if(_isMoved) {
						//已排序，保存后再调用排序接口
						_saveOrder(_ordertype);
					} else if(!_isMoved) {
						//未排序，保存后直接刷新
						_getTeacherGroup();
						_reseNavFrame('contactFrame');
					}
					winAddBox.find('.quesclass_btn_blue,.quesclass_btn_gray').show();
					
					
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
					winAddBox.find('.quesclass_btn_blue,.quesclass_btn_gray').show();
					winAddBox.find('.quesclass_zhuyi').html('');
					winAddBox.find('.quesclass_zhuyi').hide();
				}
			});
		});
				
		//删除
		var deling = false;
		groupWin.find('.quesclass_del').off().click(function() {
			
			if(deling) {
				return;
			}
			
			var listChecked = _getListCheckedItem();
			if(!listChecked) {
				return;
			}
			
			var params = {
				schoolCode: _common.getSchoolCode(),
				uuid: _common.getUuid(),
				deptId: listChecked.attr('data-deptId')
			};
			
			var groupname = '';
			if(_groupCache[params.deptId]) {
				var groupitem = _groupCache[params.deptId];
				if(groupitem) {
					groupname = groupitem.deptName;
					if(groupitem.teachers.length > 0) {
						_common.showMsg('组内还有其他教师，请先把这些教师移到其他分组，再删除该分组');
						return;
					}
				}
			}
			
			deling = true;
			_common.showMsg({
				msg: '确定要删除“'+groupname+'”分组吗？',
				btnText:'取消',
				okcallback:function() {
					_common.post(_SERVICE+'/webapp/school/dept/del' ,params,function(rtn){
						deling = false;
						if('001' == rtn.resultCode){
							if(_groupCache[params.deptId]) {
								delete _groupCache[params.deptId];
							}
							listChecked.remove();
							_reseNavFrame('contactFrame');
							_disableBtmBtns();
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.showMsg(rtn.resultMsg);
						}
					});
				},
				callback:function() {
					deling = false;
				}
			});
		});
		
		//排序确认修改
		groupWin.find('.btn_blue').off().click(function() {
			if(!_isMoved) {
				return;
			}
			_saveOrder(0);
		});
	}
	
	/**
	* isedit 是否保存后再调用
	*/
	function _saveOrder(isedit) {
		
		var groupWin = $('#groupBox');
		var personalList = groupWin.find('.quesclass_list_class').find('p');
		if(personalList.length == 0) {
			return;
		}
		
		var params = {
			schoolCode: _common.getSchoolCode(),
			uuid: _common.getUuid()
		};
		var orders = {};
		for(var perIndex=0; perIndex<personalList.length; perIndex++) {
			var personal = $(personalList[perIndex]);
			var _deptId = personal.attr('data-deptId');
			var _deptOrder = personal.attr('data-order')
			orders[''+_deptId] = _deptOrder;
		}
		params.orders = orders;
		
		ordering = true;
		_common.post(_SERVICE+'/webapp/school/dept/order/set' ,params,function(rtn){
			ordering = false;
			if('001' == rtn.resultCode){
				if(isedit == 1 || isedit==2) {
					var _msg = isedit==1 ? '添加分组成功，由于您修改了分组排序，系统已默认帮您保存排序。' : '重命名成功，由于您修改了分组排序，系统已默认帮您保存排序。';
					_common.showMsg({
						msg: _msg,
						callback: function() {
							_getTeacherGroup();
							_reseNavFrame('contactFrame');
							groupWin.find('.btn_blue').addClass('btn_gray');
							_isMoved = false;
						}
					});
			} else {
				_getTeacherGroup();
				_reseNavFrame('contactFrame');
				parent.closeWin();
			}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	function _hideCover() {
		$('#groupName').val('');
		$('#addBox').hide();
		$('#cover').hide();
	}
	
	function _hideMasterCover() {
		$('#masterName').val('');
		$('#masterBox').hide();
		$('#cover').hide();
	}
	
	function _fillDeptList(deptList) {
		
		var deptHtml = new Array();
		for(var deptIndex=0;  deptIndex<deptList.length; deptIndex++) {
			var deptItem = deptList[deptIndex];
			_groupCache[deptItem.deptId] = deptItem;
			if(deptItem.deptId == '10000') {
				continue;
			}
			deptHtml.push('<p data-deptId="'+deptItem.deptId+'" data-order="'+(deptIndex+1)+'" class="quesclass_list_item">'+deptItem.deptName+'</p>');
		}
		
		$('#groupBox').find('.quesclass_list_class').html(deptHtml.join(''));
		
		_deptListEvent();
	}
	
	//绑定部门列表事件
	//记录选择初始值
	var _startIndex = -1;
	var _isMoved = false;
	function _deptListEvent() {
		
		var groupWin = $('#groupBox');
		var winAddBox = $('#addBox');
		
		//选项点击
		groupWin.find('.quesclass_list_class p').off().click(function() {
			
			var personalList = groupWin.find('.quesclass_list_class').find('p');
			groupWin.find('.quesclass_list_class p').removeClass('checked');
			$(this).addClass('checked');
			
			var itemIndex = personalList.index($(this));
			_startIndex = itemIndex;
			if(itemIndex==0) {
				groupWin.find('.movedown').removeClass('movedown_no');
				groupWin.find('.moveup').addClass('moveup_no');
			} else if(itemIndex == (personalList.length-1)) {
				groupWin.find('.movedown').addClass('movedown_no');
				groupWin.find('.moveup').removeClass('moveup_no');
			} else {
				groupWin.find('.movedown').removeClass('movedown_no');
				groupWin.find('.moveup').removeClass('moveup_no');
			}
			
			_enableBtmBtns();
		});
		
		//上移
		groupWin.find('.moveup').off().click(function() {
			var _this = $(this);
			var listWrap = $('#list_wrap');
			var listWin = groupWin.find('.quesclass_list_class');
			//listChecked -- 当前选中的节点
			var listChecked = _getListCheckedItem();
			if(!listChecked) {
				return;
			}
			var personalList = groupWin.find('.quesclass_list_class').find('p');
			var itemIndex = personalList.index(listChecked);
			var moveIndex = (itemIndex-1 <= 0) ? 0 : (itemIndex-1);
			if(_startIndex != moveIndex) {
				_isMoved = true;
				groupWin.find('.btn_blue').removeClass('btn_gray');
			} else {
				_isMoved = false;
				groupWin.find('.btn_blue').addClass('btn_gray');
			}
			
			groupWin.find('.quesclass_list_class p').removeClass('checked');
			
			if(moveIndex == 0) {
				_this.addClass('moveup_no');
			} else {
				_this.removeClass('moveup_no');
				groupWin.find('.movedown').removeClass('movedown_no');
			}
			
			//要编辑替换的节点
			var current = personalList.eq(moveIndex);
			var current_deptId = current.attr('data-deptId');
			var current_order = current.attr('data-order');
			var current_text = current.html();
			
			//替换内容
			current.attr('data-deptId' , listChecked.attr('data-deptId'));
			current.html(listChecked.html());
			
			listChecked.attr('data-deptId' , current_deptId);
			listChecked.html(current_text);
			
			current.addClass('checked');
			var curroffset = current.position();
			
			if(curroffset.top  < 0) {
				var offtop = listWrap.scrollTop() + curroffset.top -4;
				listWrap.scrollTop(offtop);
			}
			
		});
		
		//下移
		groupWin.find('.movedown').off().click(function() {
			var _this = $(this);
			var listWrap = $('#list_wrap');
			var listWin = groupWin.find('.quesclass_list_class');
			var listChecked = _getListCheckedItem();
			if(!listChecked) {
				return;
			}
			var personalList = groupWin.find('.quesclass_list_class').find('p');
			var itemIndex = personalList.index(listChecked);
			var moveIndex = (itemIndex+1 >= (personalList.length-1)) ? (personalList.length-1) : (itemIndex+1);
			groupWin.find('.quesclass_list_class p').removeClass('checked');
			if(_startIndex != moveIndex) {
				_isMoved = true;
				groupWin.find('.btn_blue').removeClass('btn_gray');
			} else {
				_isMoved = false;
				groupWin.find('.btn_blue').addClass('btn_gray');
			}
			
			if(moveIndex == (personalList.length-1)) {
				_this.addClass('movedown_no');
			} else {
				_this.removeClass('movedown_no');
				groupWin.find('.moveup').removeClass('moveup_no');
			}
			
			var current = personalList.eq(moveIndex);
			var current_deptId = current.attr('data-deptId');
			var current_order = current.attr('data-order');
			var current_text = current.html();
			
			//替换内容
			current.attr('data-deptId' , listChecked.attr('data-deptId'));
			current.html(listChecked.html());
			
			listChecked.attr('data-deptId' , current_deptId);
			listChecked.html(current_text);
			
			current.addClass('checked');
			var curroffset = current.position();
			
			//计算偏移的高度（注意要算上已偏移的高度）
			var offtop = (curroffset.top + listWrap.scrollTop()) - listWrap.height();
			if(offtop > 0) {
				listWrap.scrollTop(offtop+4+current.height() + listWrap.scrollTop());
			}
			
		});
	}
	
	//刷新导航iframe
	function _reseNavFrame(id){
		parent.callListener({id:'contact_shortcut'});
	}
	
	//判断是否有选中的元素
	function _getListCheckedItem() {
		var groupWin = $('#groupBox');
		var plist = groupWin.find('.quesclass_list_class').find('p');
		var listChecked = groupWin.find('.quesclass_list_class').find('.checked');
		if(!listChecked.length) {
			//_common.showMsg('请先选中分组，再操作');
			return false;
		}
		return listChecked;
	}
	
	//启用底部按钮
	function _enableBtmBtns() {
		$('#groupBox').find('.quesclass_update').removeClass('quesclass_pic1_no').addClass('quesclass_pic1');
		$('#groupBox').find('.quesclass_del').removeClass('quesclass_pic2_no').addClass('quesclass_pic2');
	}
	
	//禁用所有按钮
	function _disableBtmBtns() {
		var groupWin = $('#groupBox');
		groupWin.find('.moveup').addClass('moveup_no');
		groupWin.find('.movedown').addClass('movedown_no');
		groupWin.find('.quesclass_update').removeClass('quesclass_pic1').addClass('quesclass_pic1_no');
		groupWin.find('.quesclass_del').removeClass('quesclass_pic2').addClass('quesclass_pic2_no');
		groupWin.find('.btn_blue').addClass('btn_gray');
		_isMoved = false;
	}

	//业务入口
	initPage();
	initPageEvent();
	//测试代码

	module.exports = qt_model;

});
