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
	var _common = require('./common');

	//服务
	var _SERVICE = _common.SERVICE;

	//window引用，防止回掉中指针出错
	var _window = window;


	//获取自己本身已经勾选的科目
	var _mySubject = {};
	function initMySubject(){
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
			'schoolCode' : schoolCode
		};

		_common.post(_SERVICE+'/webapp/comm/bdtsbj',params,function(rtn){
			if('001' == rtn.resultCode){
				var html = new Array();
				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					_mySubject[item.id] = item;
				}
				//查询学校所有的科目
				initSubjectList();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}


	//初始化可以选择的科目
	function initSubjectList(){
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
			'schoolCode' : schoolCode
		};

		_common.post(_SERVICE+'/webapp/comm/bdsbj',params,function(rtn){
			if('001' == rtn.resultCode){
				var html = new Array();
				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					html.push('<a href="javascript:;" class="operate-btn1"><span class="'+(_mySubject[item.id]?'op-checked':'op-check')+'" data-id="'+item.id+'"></span>'+item.name+'</a>');
				}
				$('#subjectList').html(html.join(''));
				$('#subjectList .op-checked').data('checked','1');
				//绑定勾选
				$('#subjectList span').off().click(function(){
					var _this = $(this);
					if('1' == _this.data('checked')){
						_this.removeClass('op-checked').addClass('op-check').data('checked','0');
					}else{
						_this.removeClass('op-check').addClass('op-checked').data('checked','1');
					}
				});
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}


	//绑定设置科目
	$('#sureBtn').click(function(){
		var subjectids = new Array();
		$('#subjectList .op-checked').each(function(index,obj){
			var subjectid = $(obj).attr('data-id');
			if(subjectid){
				subjectids.push(subjectid);
			}
		});
		if(subjectids.length <=0){
			_common.showMsg('请勾选科目');
			return;
		}

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
			'subjectIdsStr' : ''+subjectids.join(',')
		};
		_common.post(_SERVICE+'/webapp/comm/setsbj',params,function(rtn){
			if('001' == rtn.resultCode){
				_common.showMsg({
					msg : '科目设置成功',
					callback : function(){
						window.parent.closeWin&&window.parent.closeWin({
							isSwitch : true,
							callback : function(){
								//do nothing
							}
						});
					}
				});
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	});



	//业务入口
	initMySubject();



	module.exports = qt_model;

});
