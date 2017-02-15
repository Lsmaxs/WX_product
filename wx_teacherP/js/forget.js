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
	var qt_util = require('qt/util');
	var qt_cookie = require('qt/cookie');
	var MD5 = require('qt/md5');
	var qt_valid = require('qt/valid');

	//服务
	var _SERVICE = _config.SERVICE;
	
	/**
	 * @desc 初始化用户信息
	 * @return 
	 */
	function initPage(){
		//手机号码
		$('#phone').on('focus',function(){
			var _this = $(this);
			_this.next().hide();
		}).on('blur',function(){
			var _this = $(this);
			var _val = _this.val();
			if(!_val){
				_this.next().hide();
				return;
			}
			if(!qt_valid.phone(_this.val())){
				$('#phone_check').html('手机号码格式错误').removeClass('ok').show();
				$('#phone_warn').show();
				$('#phone_yes').hide();
			}else{
				$('#phone_check').html('手机号码格式正确').addClass('ok').show();
				$('#phone_warn').hide();
				$('#phone_yes').show();
			}
			_this.next().show();
		});

		$("#pwdCode").on('focus',function(){
			var _this = $(this);
			$('#pwdCode_check').hide();
		});

		//获取验证码
		var codeSendTimer = null;
		var canSendSms = true;
		var count = 120;
		$('#pwdCodeBtn').on('click',function(){
			if(!canSendSms){
				return;
			}
			var _this = $(this);
			var phone = $('#phone').val();
			if(!qt_valid.phone(phone)){
				$('#phone_check').html('手机号码格式错误').removeClass('ok').show();
				$('#phone_warn').show();
				$('#phone_yes').hide();
				$('#phone').next().show();
				return;
			}
			var params = {
				"phone":phone,
				"type":1
			};
			canSendSms = false;
			count = 120;
			codeSendTimer && clearInterval(codeSendTimer);
			codeSendTimer = setInterval(function(){
				count--;
				if(count<=0){
					canSendSms = true;
					codeSendTimer && clearInterval(codeSendTimer);
					_this.html('获取验证码');
					return;
				}
				_this.html(count+'s后重新获取');
			},1000);
			// params = JSON.stringify(params);


			_common.post(_SERVICE+'/passcode',params,function(rtn){				
				if(rtn.resultCode == '0001'){
				}else if(rtn.resultCode=='0002'){
					_common.tips(rtn.resultMsg);
				}else{
					$('#phone_check').html('该手机号码为非教师用户').removeClass('ok').show();
					$('#phone_warn').show();
					$('#phone_yes').hide();
					$('#phone').next().show();
				}
			});
		});

		//密码
		$('#password').on('focus',function(){
			var _this = $(this);
			$('#password_check').hide();
		}).on('change',function(){
			var _this = $(this);
			var _val = _this.val();
			if(!_val){
				$('#password_check').hide();
				return;
			}
			if(!/^[0-9a-zA-Z\!\@\#\$\%\^\&\*\(\)\_\+]{6,}$/.test(_val)){
				$('#password_check').html('密码格式错误').show();
			}else{
				$('#password_check').hide();
			}
		});
		//确认密码
		$('#password_again').on('focus',function(){
			var _this = $(this);
			$('#password_again_check').hide();
		}).on('change',function(){
			var _this = $(this);
			var _val = _this.val();
			var _orgVal = $('#password').val();
			if(!_val){
				$('#password_again_check').hide();
				return;
			}
			if(_orgVal != _val ){
				$('#password_again_check').html('两次密码不一致').show();
			}else{
				$('#password_again_check').hide();
			}
		});

		var applying = false
		$('#resetBtn').on('click',function(){
			if(applying){
				return;
			}
			var phone = $("#phone").val();
			var code = $("#pwdCode").val();
			var password = $("#password").val();
			var password_again = $("#password_again").val();
			if(!qt_valid.phone(phone)){
				$('#phone_check').html('手机号码格式错误').removeClass('ok').show();
				$('#phone_warn').show();
				$('#phone_yes').hide();
				$("#phone").next().show();
				 return;
			}
			 if(!code){
				$('#pwdCode_check').show();
				return;
			 }
			if(!/^[0-9a-zA-Z\!\@\#\$\%\^\&\*\(\)\_\+]{6,}$/.test(password)){
				$('#password_check').html('密码格式错误').show();
				return;
			}
			if(password != password_again){
				$('#password_again_check').html('两次密码不一致').show();
				return;
			}
			applying = true;
			var params = {
				"phone":phone,
				"code":code,
				"newpsw":password
			};
			_common.post(_SERVICE+'/pswreset',params,function(rtn){
				applying = false;
				if(rtn.resultCode == '0001'){
					showSuc();
				}else{
					alert(rtn.resultMsg);
				}
			});
		});
	}
	//显示修改成功
	function showSuc(){
		$('#bg,#sugg').show();
		$('#sugg .close_sugg').off().click(function(){
			$('#bg,#sugg').hide();
		});
	}


	//业务入口
	initPage();



	/*
	_common.post(_SERVICE+'/webapp/xxxx',params,function(rtn){
		if('001' == rtn.resultCode){
		
		}else if('202' == rtn.resultCode){
			_common.lostLogin();
		}else{
			showMsg(rtn.resultMsg);
		}
	});
	*/
	module.exports = qt_model;

});
