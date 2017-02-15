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
	var qt_valid  = require('qt/valid');

	//服务
	var _vs = qt_util.getViewSize();
	var _SERVICE = _config.SERVICE;
	var _APPLY_SERVICE = 'http://'+location.hostname+':'+(location.port?location.port:'80');



	function initPage(){
		initArea(function(){
			// 初始化省份城市乡镇选择绑
			bindCheckBox($('#provinceSelect'), $('#province'), function(data){
				// $('#city').html('<li data-areaCode="" data-name="市">市</li>');
				// $('#county').html('<li data-areaCode="" data-name="区县">区县</li>');
				
				// $('#citySelect').find('em').html('');
				// $('#countrySelect').find('em').html('');
				
				var proData = data;
				var firstParams = {
						areaCode : 	proData.areaCode
				}
				selectArea(firstParams, function(data){
					var _cityData = data;
					var _dataLength = _cityData.length;
					if(_dataLength <= 0){
						$("#citySelect").find('em').html('');
						$('#city').html('');
						$('#countrySelect').find('em').html('');
						$('#county').html('');
						$('#citySelect').find('em').attr('data-areaCode','');
						$('#countrySelect').find('em').attr('data-areaCode','');
						return false;
					}
					$("#citySelect").find('em').html(_cityData[0].name);
					var cityHtml = new Array();
					for(var i=0;i<_dataLength;i++){
						var item = _cityData[i];
						cityHtml.push('<li data-areaCode="'+item.code+'" data-name="'+item.name+'">'+item.name+'</li>');
					}
					$('#city').html(cityHtml.join(''));
					var firstCityParams = {
							areaCode : 	_cityData[0].code
					}
					selectArea(firstCityParams, function(data){
						var _countyData = data;
						var _dataLength = _countyData.length;
						if(_dataLength<=0){
							$('#countrySelect').find('em').html('');
							$('#countrySelect').find('em').attr('data-areaCode','');
							return false;
						}
						$("#countrySelect").find('em').html(_countyData[0].name);
						var countyHtml = new Array();
						for(var i=0;i<_dataLength;i++){
							var item = _countyData[i];
							countyHtml.push('<li data-areaCode="'+item.code+'" data-name="'+item.name+'">'+item.name+'</li>');
						}
						$('#county').html(countyHtml.join(''));
					});
				});
			});
			bindCheckBox($("#citySelect"),$("#city"),function(data){
				var firstCityParams = {
						areaCode : 	data.areaCode
				}
				selectArea(firstCityParams, function(data){
					var _countyData = data;
					var _dataLength = _countyData.length;
					if(_dataLength <= 0){
						$('#countrySelect').find('em').html('');
						$('#countrySelect').find('em').attr('data-areaCode','');
						return false;
					}
					$("#countrySelect").find('em').html(_countyData[0].name);
					var countyHtml = new Array();
					for(var i=0;i<_dataLength;i++){
						var item = _countyData[i];
						countyHtml.push('<li data-areaCode="'+item.code+'" data-name="'+item.name+'">'+item.name+'</li>');
					}
					$('#county').html(countyHtml.join(''));
				});
			});
			bindCheckBox($("#countrySelect"),$("#county"),function(data){
				countryCode = data.areaCode;
			});
		});
		bindCheckBox($('#typeSelect'),$('#schoolType'));
		initQQkefu();

		//收藏
		$('#addFavBtn').click(function(){
			var _title = document.title;
			var _url = location.href;
			try{
				window.external.addFavorite(_url, _title);
			}catch (e){
				try{
					window.sidebar.addPanel(_title,_url,"");
				}catch (e){
					_common.tips("加入收藏失败，请使用Ctrl+D进行添加");
				}
			}
		});

		

		// 提交成功关闭按钮返回申请表单
		$('#pop_box_close').off().on('click',function(){
			// $('#submitSuccess').hide();
			// $('.m_warp').show();
			location.href='./apply.html';
		});

		// 学校规模点击事件绑定
		$('#schoolSize span').on('click',function(){
			var _this = $(this);
			_this.addClass('frm_radied').removeClass('frm_radio');
			_this.siblings().removeClass('frm_radied').addClass('frm_radio');
			schoolSize = parseInt(_this.attr('data-schoolSize'));
		});

		// 学校名称输入校验
		$('#schoolName').on('blur input',function(){
			var _schoolName = $.trim($(this).val());
			if(!_schoolName){
				$('#schoolNameError').hide();
				$('#schoolNameNoneError').show();
				formItemsCheck.checkSchoolName=false;
				return;
			}else{
				$('#schoolNameNoneError').hide();
			}
			if(!qt_valid.length(_schoolName,255,1)){
				$('#schoolNameNoneError').hide();
				$('#schoolNameError').show();
				formItemsCheck.checkSchoolName=false;
			}else{
				$('#schoolNameError').hide();
				formItemsCheck.checkSchoolName=true;
			}
		});

		// 联系人地址输入校验
		$('#contactAddress').on('blur input',function(){
			var _address = $.trim($(this).val());
			if(_address.length>255){
				$('#addressError').show();
				formItemsCheck.checkAddress=false;
			}else{
				$('#addressError').hide();
				formItemsCheck.checkAddress=true;
			}
		});

		// 联系人输入校验
		$('#contact').on('blur input',function(){
			var _contact = $.trim($(this).val());
			if(!_contact){
				$('#contactError').hide();
				$('#contactNoneError').show();
				formItemsCheck.checkContact=false;
				return;
			}else{
				$('#contactNoneError').hide();
			}
			if(!qt_valid.length(_contact,40,1)){
				$('#contactNoneError').hide();
				$('#contactError').show();
				formItemsCheck.checkContact=false;
			}else{
				$('#contactError').hide();
				formItemsCheck.checkContact=true;
			}
		});

		// 邮箱地址输入校验
		$('#contactEmail').on('blur input',function(){
			var _contactEmail = $.trim($(this).val());
			if(!_contactEmail){
				$('#emailError').hide();
				formItemsCheck.checkEmail=true;
			}else if(!qt_valid.email(_contactEmail)|| _contactEmail.length>40){
				$('#emailError').show();
				formItemsCheck.checkEmail=false;
			}else {
				$('#emailError').hide();
				formItemsCheck.checkEmail=true;
			}
		});

		// 联系人电话输入校验
		$('#contactPhoneNum').on('blur input',function(){
			var _contactPhoneNum = $.trim($(this).val());
			var patternPhone =qt_valid.tel(_contactPhoneNum);
			var patternMobile =qt_valid.phone(_contactPhoneNum);
			if(!_contactPhoneNum){
				$('#phoneNumberError').hide();
				$('#phoneNumberNoneError').show();
				formItemsCheck.checkPhoneNum=false;
				return;
			}else{
				$('#phoneNumberNoneError').hide();
			}
			if(!(patternPhone ||patternMobile)){
				$('#phoneNumberNoneError').hide();
				$('#phoneNumberError').show();
				formItemsCheck.checkPhoneNum=false;
			}else{
				$('#phoneNumberError').hide();
				formItemsCheck.checkPhoneNum=true;
			}
		});
		

		//绑定提交按钮
		var applying = false;
		$('#applySubmit').off().on('click' , function() {
			var _this = $(this);
			var provinceCode = $('#provinceSelect').find('em').attr('data-areaCode');
			if(!formItemsCheck.checkSchoolName||!formItemsCheck.checkPhoneNum||!formItemsCheck.checkContact||!provinceCode){
				_common.tips('请填写完必填项才能提交');
				return false;
			}else if(!formItemsCheck.checkEmail||!formItemsCheck.checkAddress){
				return false;
			}
			if(applying){
				return;
			}
			var provinceName = $('#provinceSelect').find('em').text();
			var cityName = $('#citySelect').find('em').text();
			var countryName = $('#countrySelect').find('em').text();
			var _contactEmail = $.trim($('#contactEmail').val());
			var _contactMoble = $.trim($('#contactPhoneNum').val());
			var _schoolName = $.trim($('#schoolName').val());
			var _contact = $.trim($('#contact').val());
			var _address = $.trim($('#contactAddress').val());
			var cityCode = $('#citySelect').find('em').attr('data-areaCode');
			var countryCode =$('#countrySelect').find('em').attr('data-areaCode');
			var _params = {
					name : _schoolName,
					type : typeCode,
					size : schoolSize,
					provinceCode : provinceCode,
					provinceName : provinceName ,
					cityCode:cityCode,
					cityName: cityName,
					countryCode: countryCode,
					countryName: countryName,
					contact: _contact ,
					mobile: _contactMoble,
					address:  _address,
					email: _contactEmail,
			};
			_params =JSON.stringify(_params);
			applying = true;
			_this.html('提交中');
			_common.showProgress();
			var _requestUrl_table = _APPLY_SERVICE+'/appmsg/api/apply/save';
			$.ajax(_requestUrl_table,{
				data : _params,
				type:'post',
				dataType:'json',
				success : function(rtn){
					applying =false;
					_common.hideProgress();
					if('001' == rtn.resultCode){
						$('#submitSuccess').css('height',_vs.height);
						// $('#contactEmail').val('');
						// $('#contactPhoneNum').val('');
						// $('#schoolName').val('');
						// $('#contact').val('');
						// $('#contactAddress').val('');
						$('.m_warp').hide();
						$('#submitSuccess').show();
					}else{
						_common.tips(rtn.resultMsg);
					}
					_this.html('提交');
				},
				error : function(XMLHttpRequest, textStatus, errorThrown){
					applying = false;
					_common.hideProgress();
					_common.tips('保存异常，请稍后再试');
					_this.html('提交');
				}
			});
		});

		//表单项检测标识符
		var formItemsCheck = {checkSchoolName:false,checkEmail:true,checkContact:false,checkPhoneNum:false,checkAddress:true};
	}

	//	/**
	//	 * 初始化地区
	//	 */
	function initArea(cback){
		//省
		var provParams = {
				areaCode : "0"
		}
		selectArea(provParams, function(data){
			var html = new Array();
			for(var i=0;i<data.length;i++){
				var item = data[i];
				html.push('<li data-areaCode="'+item.code+'" data-name="'+item.name+'">'+item.name+'</li>');
			}
			$('#province').html(html.join(''));
			$("#provinceSelect").find('em').html(data[0].name);
			$('#provinceSelect').find('em').attr('data-areaCode',data[0].code);
			var firstParams = {
					areaCode : 	data[0].code
			}
			selectArea(firstParams, function(data){
				var _cityData = data;
				$("#citySelect").find('em').html(_cityData[0].name);
				$('#citySelect').find('em').attr('data-areaCode',data[0].code);
				var cityHtml = new Array();
				for(var i=0;i<_cityData.length;i++){
					var item = _cityData[i];
					cityHtml.push('<li data-areaCode="'+item.code+'" data-name="'+item.name+'">'+item.name+'</li>');
				}
				$('#city').html(cityHtml.join(''));
				var firstCityParams = {
						areaCode : 	_cityData[0].code
				}
				selectArea(firstCityParams, function(data){
					var _countyData = data;
					$("#countrySelect").find('em').html(_countyData[0].name);
					$('#countrySelect').find('em').attr('data-areaCode',data[0].code);
					var countyHtml = new Array();
					for(var i=0;i<_countyData.length;i++){
						var item = _countyData[i];
						countyHtml.push('<li data-areaCode="'+item.code+'" data-name="'+item.name+'">'+item.name+'</li>');
					}
					$('#county').html(countyHtml.join(''));
				});
			})
			
		});
		cback && cback();
	}

	/**
	 * 绑定下拉列表框
	 * @param selectElememt 下拉框元素
	 * @param listElemtnt 下拉列表元素
	 */
	var typeCode = 1;
	var schoolSize = 1;
	function bindCheckBox(selectElememt,listElememt,callback,type){
		selectElememt.off().click(function(){
			$(this).focus().find("ul").show();
			return false;
		}).mouseleave(function(){
			$(this).find("ul").hide();
			return false;
		});
		
		//绑定列表点击
		listElememt.off().on('click','li',function(){
			var _this = $(this);
			var _areaCode = _this.attr('data-areaCode');
			typeCode = parseInt(_this.attr('data-typeCode'))?parseInt(_this.attr('data-typeCode')) : typeCode;
			var _name = _this.text();
			selectElememt.find('em').html(_name);
			_areaCode && selectElememt.find('em').attr('data-areaCode',_areaCode);
			listElememt.hide();
			//当选择完具体的值后,回调
//			console.log("arecCode:"+_areaCode);
			callback && callback({name:_name,areaCode:_areaCode});
			return false;
		}).on('mouseenter','li',function(){
			$(this).addClass('hover');
		}).on('mouseleave','li', function(){
			$(this).removeClass('hover');
		});
		
	}
	
	/**
	 * 选择地区
	 * @param params 地区参数
	 */
	function selectArea(params,cback){
		_common.showProgress();
		var _params = JSON.stringify(params);
		var _requestUrl_area = _APPLY_SERVICE+'/xxts/weixiao/area/getArea';
		$.ajax(_requestUrl_area,{
			type : 'POST',
			data : _params,
			contentType : 'application/json;charset=UTF-8',
			dataType :'json',
			success : function(rtn){
				// callback && callback(rtn);
				_common.hideProgress();
				if('001' == rtn.resultCode){
					var _lists = rtn.items;
					cback&&cback(_lists);
				}else{
					_common.tips(rtn.resultMsg);
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				_common.hideProgress();
			}
		});
		// _common.post(requestUrl.area,params,function(rtn){
		// 	_common.hideProgress();
		// 	if('001' == rtn.resultCode){
		// 		var _lists = rtn.items;
		// 		if(_lists.length > 0){
		// 			cback && cback(_lists);
		// 		}
		// 	}else if('009' == rtn.resultCode){
		// 		_common.lostLogin();
		// 	}else{
		// 		_common.tips(rtn.resultMsg);
		// 	}
		// });
	}

	

	

	//初始化QQ客服
	function initQQkefu(){
		/*转为七鱼客服
		try{
			BizQQWPA && BizQQWPA.addCustom({
				nameAccount : '800105253',
				selector : 'qqkefu',
				aty :0
			});
			BizQQWPA && BizQQWPA.visitor({
				nameAccount : '800105253'
			});
		}catch(e){
			//do nothing
		}
		*/
		// 展示微信二维码
		var wxTimer = null;
		$('#add_qrcode').hover(function(){
			wxTimer && clearTimeout(wxTimer);
			$('.scan_cade').fadeIn(200);
		},function(){
			wxTimer && clearTimeout(wxTimer);
			wxTimer = setTimeout(function(){
				$('.scan_cade').fadeOut(200);
			},150);
		});

		//获取与客服的用户信息
		var dataJson = window.localStorage.getItem("customerInfo");
		if(dataJson && dataJson.length >0){
    		dataJson = JSON.parse(dataJson);
    	}else{
			dataJson = {};
    		dataJson.qyuid = new Date();
    		dataJson.data = [];
    	}
		ysf && ysf.on({
			'onload': function(){
			   ysf.config({
				   uid:dataJson.qyuid,
				   data:JSON.stringify(dataJson.data)
			   });
			}
		});
		$('#float_winR').css('display','block');
	}

	//业务入口
	initPage();
	
	module.exports = qt_model;
});
