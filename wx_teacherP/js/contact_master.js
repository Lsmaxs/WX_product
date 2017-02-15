define(function(require, exports, module) {

	/**
	 * @desc 
	 * @exports
	 * @version 1.8.2
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
	var _stat = require('./stat');
	_stat.init('wxpt');
	//学校是否开通留言模块
	var isWordsFun = _common.getFuncs('words')

	//初始化通讯录
	var _classCache = [];
	var _deptList = [];
	var _classListCache = {};
	var refreshCallback = 1;
	
	// 项目版本
	var _version = seajs.data.project_version;

	/**
	* 获取分组管理/班级管理
	*/
	function initPage() {
		_getGradeList();
		_getTeacherGroup();
	}
	
	function _getGradeList() {
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
			uuid : uuid,
			schoolCode : schoolCode,
		};
		
		_common.post(_SERVICE+'/webapp/school/grade/qry',params,function(rtn){
			
			if('001' == rtn.resultCode){
				if(rtn.gradeList) {
					_fillGradeList(rtn.gradeList);
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
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
		
		_common.post(_SERVICE+'/webapp/linkman/list',params,function(rtn){
			
			if('001' == rtn.resultCode){
				if(rtn.linkmanTeacher) {
					_deptList = rtn.linkmanTeacher;
					_fillDeptList(rtn.linkmanTeacher , false);
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	function _fillDeptList(deptList , isSearch) {
		if(deptList.length==0) {
			$('#masterBox').find('.list_content').html('找不到该教师，请先去录入教师信息，谢谢！');
			return;
		}

		var depthtml = new Array();
		for(var deptIndex=0; deptIndex<deptList.length; deptIndex++) {
			var deptitem = deptList[deptIndex];
			if(deptitem.teachers.length == 0) {
				continue;
			}
			var open_style = '';
			var show_style = ''
			if(isSearch) {
				open_style = 'group_open';
				show_style = 'style="display:block;"';
			} else {
				open_style = deptIndex==0 ? 'group_open' : '';
				show_style = deptIndex==0 ? 'style="display:block;"' : '';
			}
			depthtml.push('<div class="list_group '+open_style+'">');
			depthtml.push(' <a href="javascript:;" class="group_title">' + deptitem.deptName + '</a>');
			depthtml.push(' <ul class="user_list" '+show_style+'>');
			var _teacherList = deptitem.teachers;
			if(isSearch) {
				_teacherList = deptitem.searchList;
			}
			for(var tIndex=0;tIndex<_teacherList.length; tIndex++) {
				var _item = _teacherList[tIndex];
				depthtml.push('  <li><a href="javascript:;" data-uid="'+(_item.uuid ? _item.uuid : '')+'" class="user_noselected">'+_item.name.substring(0,6)+'<span class="phone">'+_item.phone+'</span></a></li>');
			}
			depthtml.push(' </ul>');
			depthtml.push('</div>')
		}
		
		$('#masterBox').find('.list_content').html('').html(depthtml.join(''));
		
		//折叠效果
		$('#masterBox').find('.group_title').off().click(function() {
			var _this = $(this);
			if(_this.parent().hasClass('group_open')) {
				_this.parent().find('.user_list').hide();
				_this.parent().removeClass('group_open');
			} else {
				_this.parent().find('.user_list').show();
				_this.parent().addClass('group_open');
			}
			
		});
		
		$('#masterBox').find('.user_list a').off().click(function() {
			var _this = $(this);
			$('#masterBox').find('.user_list a').removeClass('user_selected').addClass('user_noselected');
			_this.removeClass('user_noselected').addClass('user_selected');
			$('#masterBox').find('.quesclass_btn_blue').removeClass('quesclass_btn_gray');
		});
	}
	
	
	//基本事件绑定
	function initPageEvent() {
		var groupWin = $('#groupBox');

		
		groupWin.find('.grade_text, .arrow').off().click(function() {
			$('#grade_list').show();
		});
		
		//设置班主任弹窗 master_setting
		var masterWin = $('#masterBox');
		groupWin.find('.quesclass_setup').off().click(function() {
			_hideGradeList();
			var itemChecked = _getListCheckedItem();
			if(!itemChecked) {
				return;
			}
			
			var _classCode = itemChecked.attr('data-classCode');
			if(_classListCache[''+_classCode]) {
				var classItem = _classListCache[''+_classCode];
				masterWin.find('.quesclass_h1').html('<p>'+classItem.className+'班主任</p>');
				
				if(classItem.masterId) {
					masterWin.find('[data-uid="'+classItem.masterId+'"]').removeClass('user_noselected').addClass('user_selected');
				}
			}
			
			var winWidth = $(window).width();
			var showWidth = Math.round((winWidth - 320)/2);
			
			masterWin.css({ display:'block', left:showWidth + 'px'});
			$('#master_search').val('');
			$('#masterBox').find('.quesclass_btn_blue').addClass('quesclass_btn_gray');
			
			_fillDeptList(_deptList , false);
			$('#cover').show();
		});

		//设置新加班级
		var winAddBox = $('#addClassGroup');
        groupWin.find('.addclass_setup ').off().click(function() {
            _setWinBox();
        })
        winAddBox.find('.op-reminder-a').off().on("click",function(){
            var _this = $(this),
				pos = _this.offset(),
				width = $('.editclass_hlep_2').width(),
				height = $('.editclass_hlep_2').height() + 60;
            	console.log(width,height,pos.top,pos.left);
            $('.editclass_hlep_2').fadeIn()
		}).on('mouseleave',function () {
			$('.editclass_hlep_2').fadeOut();
        }),
		winAddBox.find('.quesclass_btn_gray,.quesclass_close').off().click(function(){
            _hideAddCover();
		})
		winAddBox.find('.quesclass_btn_blue').off().click(function(){
            var _gradeCode = $('#groupBox').find('.grade_text').attr('data-code');
			var classNum = $("#classNum").val();
			var classAlias = $("#classAlias").val();
			var _code = $('#gradeName').attr('data-classcode');
            _common.showProgress();
			if(''== classNum){
				_common.showMsg('请填写班级号');
				return;
			}
			if(!/\d/g.test(classNum)){
                _common.showMsg('请用数字1~999来填写班级号');
                return;
			}
			if(classNum<1 || classNum>999){
                _common.showMsg('请用数字1~999来填写班级号');
                return;
			}
			var AddClass = $('#groupBox').find(".grade_text").text().replace(/年级/g,'')+'('+classNum+')班';
			var sameAlias = false;
			var sameClass = false;
			for(var i=0;i< _classListCache.length;i++){
				var item = _classListCache[i];
				if(item.className == AddClass){
                    sameClass = true;
                    break
				}
				if(item.className == classAlias ){
                    sameAlias = true;
                    break
				}
			}
			if(sameClass){
                _common.showMsg('已存在相同的班级');
                return;
			}
			if(sameAlias){
                _common.showMsg('班级别名已存在');
                return;
			}
            var _this = $(this);
            var gradeId = $('#groupBox').find('.grade_text').attr('data-gradeId');
            if(_code){
                var params = {
                    schoolCode: _common.getSchoolCode(),
                    classOtherName: classAlias,
                    className: AddClass,
                    gradeCode: _gradeCode,
                    gradeId:gradeId,
					classCode:_code
                };
                _common.post(_SERVICE + '/webapp/school/class/update',params,function(rtn){
                    _common.hideProgress();
                    if('001'== rtn.resultCode){
                        //自己写
                        _getClassList(_gradeCode);
                        _hideAddCover();
                        _common.tips('success','修改成功');
                    }else if('002'== rtn.resultCode){
                        _common.lostLogin();
                    }else{
                        _this.show();
                        masterWin.find('.quesclass_msg').hide();
                        _common.showMsg(rtn.resultMsg);
                    }

                })

			}else{
                var params = {
                    schoolCode: _common.getSchoolCode(),
                    classOtherName: classAlias,
                    className: AddClass,
                    gradeCode: _gradeCode,
                    gradeId:gradeId
                };
                _common.post(_SERVICE + '/webapp/school/class/add',params,function(rtn){
                    _common.hideProgress();
                    if('001'== rtn.resultCode){
                        //自己写
                        _getClassList(_gradeCode);
                        _hideAddCover();
                        _common.tips('success','修改成功');
                    }else if('002'== rtn.resultCode){
                        _common.lostLogin();
                    }else{
                        _this.show();
                        masterWin.find('.quesclass_msg').hide();
                        _common.showMsg(rtn.resultMsg);
                    }

                })
			}


		})
		//修改班级弹窗
		groupWin.find('.addclass_update').off().click(function(){
            var itemChecked = _getListCheckedItem();
            if(!itemChecked){
                return;
            }
            var params = {
                schoolCode: _common.getSchoolCode(),
                uuid: _common.getUuid(),
                code: itemChecked.attr('data-classcode')
            };
            _common.post(_SERVICE +"/webapp/personal/class/detail",params,function(rtn){
                if('001'==rtn.resultCode){
                    _setWinBox(rtn);
                }else if('002'== rtn.resultCode){
                    _common.lostLogin();
                }else{
                    _common.showMsg(rtn.resultMsg);
                }

			})
		})

		//删除班级
		var deling = false;
        groupWin.find('.quesclass_del').off().click(function(){
            if(deling) {
                return;
            }
            var itemChecked = _getListCheckedItem();
			if(!itemChecked){
				return;
			}
            var params = {
                schoolCode: _common.getSchoolCode(),
                uuid: _common.getUuid(),
                classCode: itemChecked.attr('data-classcode')
            };

            deling = true;
			_common.showMsg({
				msg:'确定要删除“'+itemChecked.text()+'”班级吗？',
                btnText:'取消',
                okcallback:function(){
					_common.post(_SERVICE+'/webapp/school/class/del',params,function(rtn){
                        deling = false;
						if('001'==rtn.resultCode){
                            itemChecked.remove();
                            _reseNavFrame('contactFrame');
                            _disableBtmBtns();
						}else if('002'== rtn.resultCode){
                            _common.lostLogin();
						}else{
                            _common.showMsg(rtn.resultMsg);
						}
					})
				},
				callback:function(){
                    deling = false;
				}
			})

		})


		//绑定设置班主任
		var masterSet = false;
		var canPost = true;
		masterWin.find('.quesclass_btn_blue').off().click(function() {
			
			if(masterSet || !canPost) {
				return;
			}
			
			_hideGradeList();
			var _this = $(this);
			var itemChecked = _getListCheckedItem();
			
			var userselected = masterWin.find('.user_selected')
			if(userselected.size() == 0) {
				_common.showMsg('请选择教师');
				return;
			}
			
			var _classCode = itemChecked.attr('data-classCode');
			if(_classListCache[''+_classCode]) {
				var classItem = _classListCache[''+_classCode];
				var post_oldMasterUid = classItem.masterId ? classItem.masterId : '';
				var params = {
					schoolCode: _common.getSchoolCode(),
					oldMasterUid : post_oldMasterUid,    //可以为空
					newMasterUid : userselected.attr('data-uid'),
					classCode : classItem.classCode
				}
				_this.hide();
				masterWin.find('.quesclass_msg').show();
				masterSet = true;
				_common.post(_SERVICE+'/webapp/school/class/master/set' ,params,function(rtn){
					masterSet = false;
					if('001' == rtn.resultCode){
						//设置班主任成功埋点
						//_stat.track('teacher_contact_classmaster_success');
						_hideMasterCover();
						var _gradecode = $('#groupBox').find('.grade_text').attr('data-code');
						_getClassList(_gradecode);
						_this.show();
						masterWin.find('.quesclass_msg').hide();
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_this.show();
						masterWin.find('.quesclass_msg').hide();
						_common.showMsg(rtn.resultMsg);
					}
				});
			} else {
				_common.showMsg('获取班级信息失败');
			}
			
		});
		
		//隐藏弹窗
		groupWin.find('.master_close').off().click(function() {
			_hideMasterCover();
		});
		//弹出框搜索
		masterWin.find('.searchbt').off().click(function() {
			var searchKey = $('#master_search').val();
			$('#masterBox').find('.quesclass_btn_blue').addClass('quesclass_btn_gray');
			canPost = false;
			if(searchKey == '') {
				_common.showMsg('请输入姓名或手机号');
				return;
			}
			var _tempList = [];
			for(var deptIndex=0; deptIndex<_deptList.length; deptIndex++) {
				var _deptitem = _deptList[deptIndex];
				var _teacherList = _deptitem.teachers;
				var _newTeacherList = new Array();
				for(var tindex=0; tindex<_teacherList.length; tindex++) {
					var _teacheritem = _teacherList[tindex];
					if((''+_teacheritem.name).indexOf(searchKey) != -1 || (''+_teacheritem.phone).indexOf(searchKey) != -1) {
						_newTeacherList.push(_teacheritem);
					}
				}
				if(_newTeacherList.length > 0) {
					_deptitem.searchList = _newTeacherList;
					_tempList.push(_deptitem);
				}
			}
			if(_tempList.length > 0) {
				canPost = true;
			}
			_fillDeptList(_tempList , true);
		});
	}
	
	function _hideAddCover() {
		$('#classNum').val('');
		$('#classAlias').val('');
		$('#addClassGroup').hide();
		$('#cover').hide();
	}
	
	function _hideMasterCover() {
		$('#masterName').val('');
		$('#masterBox').hide();
		$('#cover').hide();
	}
	
	// //刷新导航iframe
	// function _reseNavFrame(id){
	// 	var _frame = parent.document.getElementById(id);
	// 	_frame = $(_frame);
	// 	var h = _frame.attr('data-h');
	// 	var _src =  _frame.attr('data-src')+'?v='+_version;
	// 	_frame.attr('src',_src+(h?('&h='+h):'')).attr('init','1');
	// }
	
	//判断是否有选中的元素
	function _getListCheckedItem() {
		var groupWin = $('#groupBox');
		var plist = groupWin.find('.quesclass_list_class').find('p');
		var listChecked = groupWin.find('.quesclass_list_class').find('.checked');
		if(!listChecked.length) {
			return false;
		}
		return listChecked;
	}
	
	//填充年级列表
	var _gradeCache = {};
	function _fillGradeList(gradeList) {
		var groupWin = $('#groupBox');
		
		var gradeHtml = new Array();
		for(var gradeIndex=0; gradeIndex<gradeList.length; gradeIndex++) {
			var gradeItem = gradeList[gradeIndex];
			if(gradeIndex == 0) {
				groupWin.find('.grade_text').html(gradeItem.name);
				groupWin.find('.grade_text').attr({'data-code':gradeItem.code , 'data-gradeid':gradeItem.id});
				_getClassList(gradeItem.code,gradeItem.id);
				_gradeCache[gradeItem.code] = gradeItem;
			}
			gradeHtml.push('<li data-code="'+gradeItem.code+'" data-gradeId="'+gradeItem.id+'">'+gradeItem.name+'</li>');
		}
		
		$('#grade_list').html(gradeHtml.join(''));
		
		_gradeListEvent();
	}
	//绑定年级列表事件
	function _gradeListEvent() {
		$('#grade_list').find('li').click(function() {
			var _this = $(this);
			$('#groupBox').find('.grade_text').html(_this.text());
			$('#groupBox').find('.grade_text').attr({'data-code': _this.attr('data-code'),'data-gradeid':_this.attr('data-gradeid')});
			_hideGradeList();
			_disableBtmBtns();
			_getClassList(_this.attr('data-code'));
		});
	}
	
	//加载教师分组数据
	function _getClassList(gradeCode,id) {
		//加载数据
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}
		
		$('#groupBox').find('.quesclass_list_class').html('数据加载中，请稍候...');
        var gradeId = id ? id: $('#groupBox').find('.grade_text').attr('data-gradeId');

		var params = {
			schoolCode: _common.getSchoolCode(),
			uuid: _common.getUuid(),
			gradeCode: gradeCode,
			gradeId:gradeId
		};
		
		_common.post(_SERVICE+'/webapp/school/class/master/qry' ,params,function(rtn){
		
			if('001' == rtn.resultCode){
				
				if(rtn.classMasters) {
					_classCache = rtn.classMasters;
					_fillClassList(rtn.classMasters);
				}
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	function _fillClassList(classList) {
		
		var classHtml = new Array();
		if(classList.length > 0) {
			for(var cIndex=0;  cIndex<classList.length; cIndex++) {
				var classItem = classList[cIndex];
				_classListCache[classItem.classCode] = classItem;
				classHtml.push('<p data-classCode="'+(classItem.classCode ? classItem.classCode : '')+'" data-order="'+(classItem.classOrder? classItem.classOrder:(cIndex+1) )+'" class="quesclass_list_item">'+classItem.className+'<em>'+(classItem.masterName ? classItem.masterName : '') +'</em></p>');
			}
		} else {
			classHtml.push('暂无数据');
		}
		
		$('#groupBox').find('.quesclass_list_class').html(classHtml.join(''));
		
		_classListEvent();
	}
	
	//记录当前已选择的项
	var _startIndex = -1;
	var _isMoved = false;
	function _classListEvent() {
		_isMoved = false;
		var groupWin = $('#groupBox');
		var personalList = groupWin.find('.quesclass_list_class').find('p');
		
		//选项点击
		groupWin.find('.quesclass_list_class p').off().click(function() {
			_hideGradeList();
			groupWin.find('.quesclass_list_class p').removeClass('checked');
			$(this).addClass('checked');
            groupWin.find('.quesclass_setup').removeClass('check_no');
            groupWin.find('.quesclass_del').removeClass('check_no');
            groupWin.find('.addclass_update').removeClass('check_no');
			if(personalList.length > 1) {
				
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
			}
		});
		
		//上移
		groupWin.find('.moveup').off().click(function() {
			var _this = $(this);
			_hideGradeList();
			var listWrap = $('#list_wrap');
			var listWin = groupWin.find('.quesclass_list_class');
			//listChecked -- 当前选中的节点
			var listChecked = _getListCheckedItem();
			if(!listChecked) {
				return;
			}
			
			var itemIndex = personalList.index(listChecked);
			var moveIndex = (itemIndex-1 <= 0) ? 0 : (itemIndex-1);
			if(_startIndex != moveIndex) {
				_isMoved = true;
				groupWin.find('.btn_blue').removeClass('btn_gray');
			} else {
				_isMoved = false;
				groupWin.find('.btn_blue').addClass('btn_gray');
			}
			if(moveIndex == 0) {
				_this.addClass('moveup_no');
			} else {
				_this.removeClass('moveup_no');
				groupWin.find('.movedown').removeClass('movedown_no');
			}
			groupWin.find('.quesclass_list_class p').removeClass('checked');
			
			//要编辑替换的节点
			var current = personalList.eq(moveIndex);
			var current_classcode = current.attr('data-classcode');
			var current_order = current.attr('data-order');
			var current_text = current.html();
			
			//替换内容
			current.attr('data-classcode' , listChecked.attr('data-classcode'));
			current.html(listChecked.html());
			
			listChecked.attr('data-classcode' , current_classcode);
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
			_hideGradeList();
			var _this = $(this);
			var listWrap = $('#list_wrap');
			var listWin = groupWin.find('.quesclass_list_class');
			var listChecked = _getListCheckedItem();
			if(!listChecked) {
				return;
			}
			var itemIndex = personalList.index(listChecked);
			var moveIndex = (itemIndex+1 >= (personalList.length-1)) ? (personalList.length-1) : (itemIndex+1);
			if(moveIndex == (personalList.length-1)) {
				_this.addClass('movedown_no');
			} else {
				_this.removeClass('movedown_no');
				groupWin.find('.moveup').removeClass('moveup_no');
			}
			if(_startIndex != moveIndex) {
				_isMoved = true;
				groupWin.find('.btn_blue').removeClass('btn_gray');
			} else {
				_isMoved = false;
				groupWin.find('.btn_blue').addClass('btn_gray');
			}
			groupWin.find('.quesclass_list_class p').removeClass('checked');
			var current = personalList.eq(moveIndex);
			var current_classcode = current.attr('data-classcode');
			var current_order = current.attr('data-order');
			var current_text = current.html();
			
			//替换内容
			current.attr('data-classcode' , listChecked.attr('data-classcode'));
			current.html(listChecked.html());
			
			listChecked.attr('data-classcode' , current_classcode);
			listChecked.html(current_text);
			
			current.addClass('checked');
			var curroffset = current.position();
			
			//计算偏移的高度（注意要算上已偏移的高度）
			var offtop = (curroffset.top + listWrap.scrollTop()) - listWrap.height();
			if(offtop > 0) {
				listWrap.scrollTop(offtop+4+current.height() + listWrap.scrollTop());
			}
			
		});
		
		//排序确认修改
		var ordering = false;
		groupWin.find('.btn_blue').off().click(function() {
			if(ordering || !_isMoved) {
				return;
			}
			_hideGradeList();
			var groupWin = $('#groupBox');
			var personalList = groupWin.find('.quesclass_list_class').find('p');
			if(personalList.length == 0) {
				_common.showMsg('无排序数据');
				return;
			}
			
			var _gradecode = $('#groupBox').find('.grade_text').attr('data-code');
			var params = {
				schoolCode: _common.getSchoolCode(),
				uuid: _common.getUuid(),
				groupCode: _gradecode
			};
			
			var orders = {};
			for(var perIndex=0; perIndex<personalList.length; perIndex++) {
				var personal = $(personalList[perIndex]);
				var _classCode = personal.attr('data-classcode');
				var _deptOrder = personal.attr('data-order')
				orders[''+_classCode] = _deptOrder;
			}
			params.orders = orders;
			
			ordering = true;
			groupWin.find('.btn_blue').addClass('btn_gray');
			_common.post(_SERVICE+'/webapp/school/class/order/set' ,params,function(rtn){
				ordering = false;
				if('001' == rtn.resultCode){
					//_getClassList(_gradecode);
                    _reseNavFrame('contactFrame');
					parent.closeWin();
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
				}
			});
		});
	}
    //设置弹窗
	function _setWinBox(rtn) {
        var winAddBox = $('#addClassGroup');
        var gradeName  = '';
		var data = rtn;
        var winWidth = $(window).width();
        var showWidth = Math.round((winWidth - 320)/2);
		var classNum = 0;

        winAddBox.find('.quesclass_btn_blue,.quesclass_btn_gray').show();
        winAddBox.css({ display:'block', left:showWidth + 'px'});
        winAddBox.find('.quesclass_zhuyi').html('');
        winAddBox.find('.quesclass_zhuyi').hide();
        gradeName = $('#groupBox').find(".grade_text").text();
        $('#gradeName').html(gradeName);
		if(data){
            winAddBox.find('.quesclass_h1 p').text('修改班级');
            classNum = data.className.substring(3).replace(/班/g,'');
			$('#classNum').val(classNum);
			$('#classAlias').val(data.classOtherName);
            $('#gradeName').attr('data-classcode',data.classCode);
        }else{
            winAddBox.find('.quesclass_h1 p').text('新建班级');
        }
        $('#cover').show();
    }
	function _hideGradeList() {
		$('#grade_list').hide();
	}
	
	function _disableBtmBtns() {
		var groupWin = $('#groupBox');
		groupWin.find('.moveup').addClass('moveup_no');
		groupWin.find('.movedown').addClass('movedown_no');
		groupWin.find('.btn_blue').addClass('btn_gray');
		groupWin.find('.quesclass_setup').addClass('check_no');
		groupWin.find('.quesclass_del').addClass('check_no');
		groupWin.find('.addclass_update').addClass('check_no');
		_isMoved = false;
	}

    //刷新导航iframe
    function _reseNavFrame(id){
        parent.callListener({id:'contact_shortcut'});
    }
	
	//业务入口
	initPage();
	initPageEvent();
	//测试代码

	module.exports = qt_model;

});
