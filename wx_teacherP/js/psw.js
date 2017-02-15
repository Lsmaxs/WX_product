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

	//绑定设置密码按钮
	$('#changeBtn').click(function(){
		var oldpsw = $('#oldPsw').val();
		var newpsw = $('#newPsw').val();
		var surepsw =  $('#surePsw').val();
		
		if(!oldpsw){
			_common.showMsg('请填入原密码');
			return false;
		}
		if(!newpsw){
			_common.showMsg('请输入新密码');
			return false;
		}
		if(newpsw != surepsw){
			_common.showMsg('两次密码输入不一致');
			return false;
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
			'oldPsw' : oldpsw,
			'newPsw' : newpsw
		};

		_common.post(_SERVICE+'/webapp/comm/pwsm',params,function(rtn){
			if('001' == rtn.resultCode){
				_common.showMsg({
					msg : '密码修改成功',
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



	module.exports = qt_model;

});
