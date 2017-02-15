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
	var _config = require('./config');
	//服务
	var _SERVICE = _common.SERVICE;

	//window引用，防止回掉中指针出错
	var _window = window;

	function initPage(){
		
		queryStatus();
		initTeacherChangeClass();
		
		queryTeacherPremission();
		initTeacherChangeInfoEvent();
	}


	//查询当前状态
	function queryStatus(){
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
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/linkman/purview/query',params,function(rtn){
			_common.hideProgress();
			if('001' == rtn.resultCode){
				//逐个权限设置
				var rights = rtn.purview;
				if(1 == rights.teaEditTeach){
					$('#teacherChangeClass').addClass('ipt_cked');
				}
				_common.hideLoading();
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	
	}


	//初始化教师权限设置
	function initTeacherChangeClass(){
		$('#teacherChangeClass').off().on('click',function(){
			if(applying){
				return;
			}
			var _this = $(this);
			var hasRight = 0;
			if(_this.hasClass('ipt_cked')){
				//原来已经勾选
				//_this.removeClass('ipt_cked');
				hasRight = 0;
			}else{
				//原来未勾选
				//_this.addClass('ipt_cked');
				hasRight = 1;
			}
			_updateRight('teaEditTeach',hasRight,function(){
				_this.toggleClass('ipt_cked');
			});
		});
	}


	//修改
	var applying = false;
	var applyTimer = null;
	function _updateRight(right,hasAdmin,callback){
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
			"purview":{}
		};
		params.purview[right] = hasAdmin;

		applying = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/linkman/purview/update',params,function(rtn){
			applyTimer && clearTimeout(applyTimer);
			applying = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				_common.tips('success','设置成功');
				callback && callback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
		applyTimer && clearTimeout(applyTimer);
		applyTimer = setTimeout(function(){
			applyTimer && clearTimeout(applyTimer);
			applying = false;
		});
	}
	
	//查询当前状态
	function queryTeacherPremission(){
		
		var isAdmin = _common.isAdmin();
		if(isAdmin) {
			$('.teacherChangeRight').show();
		} else {
			$('.teacherChangeRight').hide();
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
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/school/getModifyTeaInfoPermiss',params,function(rtn){
			_common.hideProgress();
			if('001' == rtn.resultCode){
				//逐个权限设置
				var permiss = rtn.permiss;
				if(0 == permiss ){
					//标识允许修改
					$('#teacherChangeInfo').addClass('ipt_cked');
				} else {
					$('#teacherChangeInfo').removeClass('ipt_cked');
				}
				$('.school_set').css({
					visibility : 'visible'
				});
				_common.hideLoading();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	
	}
	
	//初始化修改教师资料权限设置事件
	function initTeacherChangeInfoEvent(){
		
		$('#teacherChangeInfo').off().on('click',function(){
			if(applying){
				return;
			}
			var _this = $(this);
			var hasRight = 0;
			if(_this.hasClass('ipt_cked')){
				//原来已经勾选
				//_this.removeClass('ipt_cked');
				hasRight = 1;
			}else{
				//原来未勾选
				//_this.addClass('ipt_cked');
				hasRight = 0;
			}
			//更新资料
			_updateInfoRight(hasRight,function(){
				_this.toggleClass('ipt_cked');
			});
		});
	}
	
	//更新权限
	var submitPremiss = false;
	function _updateInfoRight(hasRight , callback){
		if(submitPremiss) {
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
			"uuid" : uuid,
			"schoolCode" : schoolCode,
			"permiss": hasRight,
			"userName": _common.getUserName()
		};

		submitPremiss = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/school/updateModifyTeaInfoPermiss',params,function(rtn){
			
			submitPremiss = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				_common.tips('success','设置成功');
				callback && callback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
		
	}


	initPage();

	module.exports = qt_model;

});
