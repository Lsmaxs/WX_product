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

	function initQrcode(){
		var uuid = _common.getUuid();
		var schoolCode = _common.getSchoolCode();

		if(!schoolCode){
			return;
		}

		_common.showProgress();

		var _url = 'http://'+(_config.isDev?'dev.weixiao100.cn':'www.weixiao100.cn')+'/prods/info/getCorpWxqrcode';
		$.ajax({
			url: _url,
			data : {schoolCode:schoolCode},
			dataType :'jsonp',
			success : function(rtn){
				_common.hideProgress();
				var _qrCodeUrl = rtn.weixinCodeUrl;
				$('#qrcodeUrl').attr('src',_qrCodeUrl);
				$('#schoolName').html(''+_common.getSchoolName());

				$('#downlink').attr({
					'href':_qrCodeUrl,
					'download' : _common.getSchoolName()
				});

				$('#qrcodeUrl2').attr('src',rtn.joinAddCodeUrl);
				$('#downlink2').attr({
					'href':rtn.joinAddCodeUrl,
					'download' : '申请加入'+_common.getSchoolName()
				});
				
			}
		});
	}
	initQrcode();

	module.exports = qt_model;

});
