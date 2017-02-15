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
	var qt_ui = require('qt/ui');
	var _common = require('./common');

	//json插件
	require('jquery/json');
	//滚动条美化插件
	require('jquery/nicescroll');
	//多文件上传插件
	//require('../plugin/uploadify/uploadify');
	var WebUploader = require('../plugin/webuploader/webuploader');


	//服务
	var _SERVICE = _common.SERVICE;


	//获取窗口大小
	var winSize = qt_util.getViewSize();


	//初始化页面切换
	var _slideobj = null;
	function initSlide(){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		$('#loading').css({width:_width+'px',height:_height+'px',position:'relative'});
		
		_slideobj = qt_ui.slide({id:'qtslide'});

		//自定义滚动条
		slides.each(function(index,obj){
			$(obj).niceScroll($(obj).find('.nicescrollWrapper'),{
				cursorcolor:'#ccc',
				cursorwidth:'8px',
				cursorminheight:100,
				scrollspeed:60,
				mousescrollstep:60,
				autohidemode:true,
				bouncescroll:false
			});
		})
		//方便调试
		window.goLeft = function(){
			_slideobj.left();
		}
		window.goRight = function(){
			_slideobj.right();
		}
	}


	//初始化发送对象选择
	function initTargetSelect(){
		//选择学生
		$('#selectTargetBtn').off().click(function(){
			_slideobj&&_slideobj.right();
			window.parent.trace&&window.parent.trace(function(){
				//切换回原来的界面
				_slideobj&&_slideobj.left();
				//没有选择内容
				$('#selectTargetBtn').val('请选择');
			});
		});
		//绑定选择班级
		$('#selectTargetFinishBtn').off().click(function(){
			_slideobj&&_slideobj.left();
			window.parent.untrace&&window.parent.untrace();
			//计算sendTarget，逐个班计算

			var classSpan = $('#targetBox').find('.operate-class span.op-checked');
			var classItem = classSpan.parent();
			if(classItem.size() >0){
				var name = classItem.attr('data-name');
				var classid = classItem.attr('data-classid');
				$('#selectTargetBtn').val(name).data('sendTarget',classid).data('className',name);
			}else{
				$('#selectTargetBtn').val('请选择').data('sendTarget','').data('className','');
			}
		});
		//填充可以选择的班级数据
		var params = {
			uuid : _common.getUuid(),
			schoolCode : _common.getSchoolCode()
		};
		$('#loading').show();
		$('#targetBox').hide();
		_common.post(_SERVICE+'/webapp/comm/bddb',params,function(rtn){
			$('#loading').hide();
			$('#targetBox').show();
			if('001' == rtn.resultCode){
				var result = rtn.items;

				var html = new Array();

				for(var i=0;i<result.length;i++){
					var item = result[i];
					html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.cid+'" data-name="'+item.name+'"><span class="op-check"></span>'+item.name+'<span class="jt_up" style="display:none;"></span></a>');
					html.push('<hr/>')
				}

				var targetBox = $('#targetBox').prepend(html.join(''));

				//绑定班级勾选
				var classItems = targetBox.find('.operate-class .op-check');
				classItems.off().click(function(e){
					classItems.removeClass('op-checked');
					$(this).addClass('op-checked');
					return false;
				});
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}



	//初始化文件上传
	function initFileUpload(){
		//图片选择
		var _width = $('#uploadPicBtn').width();
		var _height = $('#uploadPicBtn').height();
		var _errorFileNum = 0;

		//初始化图片选择
		_picUploader = WebUploader.create({
			// swf文件路径
			swf: './plugin/webuploader/Uploader.swf',
			// 文件接收服务端。
			server: _common.UPLOADSERVICE+'/webapp/comm/upload?app=notice&uuid='+_common.getUuid()+'&schoolCode='+_common.getSchoolCode(),
			// 选择文件的按钮。可选。
			pick: '#uploadPicBtn',
			accept: {
				title: 'Images',
				extensions: 'gif,jpg,jpeg,bmp,png',
				mimeTypes: 'image/*'
			},
			//上次并发数
			threads : 100,
			//队列上传数
			fileNumLimit: 1000,
			//单个文件大小限制
			fileSingleSizeLimit: 3 * 1024 * 1024,
			thumb: {
				width: 115,
				height: 115,
				// 图片质量，只有type为`image/jpeg`的时候才有效。
				quality: 70,
				// 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
				allowMagnify: false,
				// 是否允许裁剪。
				crop: true,
				// 为空的话则保留原有图片格式。
				// 否则强制转换成指定的类型。
				type: 'image/jpeg'
			},
			//上传前是否压缩文件大小
			compress : false,
			// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			resize: false
		});
		_picUploader.on('uploadBeforeSend', function(object, data, headers){
			if('flash'==_picUploader.predictRuntimeType()){
				headers['Accept'] = '*/*';
			}
		});
		_picUploader.on('fileQueued',function(file){
			_picUploader.makeThumb( file, function( error, ret ) {
				if ( error ) {
					
				} else {
					var html = new Array();
					html.push('<li data-name="'+file.name+'" data-id="'+file.id+'">');
					html.push('<div class="ph_l" href="javascript:;"><div style="position:relative;"><div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><img src="'+ret+'" /></div><input class="edit_name" maxlength="10" value="'+(file.name.length>10?file.name.substring(0,10):file.name)+'" data-name="'+(file.name.length>10?file.name.substring(0,10):file.name)+'"/></div>');
					html.push('<div class="photo_op"><span><a href="javascript:;" class="photo_edit" style="display:none;">编辑</a><a href="javascript:;" class="photo_det">删除</a></span></div>');
					html.push('<div class="pt_op_bg"><span></span></div>');
					html.push('</li>');
					$("#uploadPicBtn").parent().parent().before(html.join(''));
				}
			});
		});
		_picUploader.on('filesQueued',function(){
			//删除操作
			$('#picList').off().on('click','.photo_det',function(e){
				var _this = $(this).parent().parent().parent();
				console.log(_this.attr('data-id'));
				_picUploader.removeFile(_this.attr('data-id'));
				_this.fadeOut(400,function(){
					_this.remove();
				});
			}).on('blur','input',function(){
				var _this = $(this);
				var val = _this.val();
				if(!val){
					_this.val(_this.attr('data-name'));
				}
			});
			if(_errorFileNum>0){
				_common.showMsg('部分文件大小受限，请选择小于3M的图片');
				_errorFileNum=0;
			}
		});
		_picUploader.on('error',function(type,max,file){
			if('F_EXCEED_SIZE' == type){
				_errorFileNum++;
			}
			if('Q_EXCEED_NUM_LIMIT' == type){
				_common.showMsg('最多上传'+max+'张图片');
			}
		});

	}


	//初始化发布
	var applying = false;
	function initSubmitBtn(){
		$('#submitBtn').off().click(function(){
			if(applying){
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

			var sendTarget = $('#selectTargetBtn').data('sendTarget');
			var className = $('#selectTargetBtn').data('className');
			if(!sendTarget){
				_common.showMsg('请选择发送班级');
				return false;
			}
			
			applying = true;
			$('#submitBtn').html('发布中').removeClass('btn_blue').addClass('btn_Grey');
			$('#uploadPicBtn').parent().parent().css('visibility','hidden');


			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'classCode' : sendTarget,
				'className': className
			};

			//标识图片是否已经上传
			var _picUploadedFlag = false;
			var attachment = [];

			//处理图片上传
			var pics = $('#picList li[data-name]');
			if(pics.size() >0){
				//有图片

				//需要上传的图片数量
				var _picNumUpload = pics.size();
				$('#picList  div .uploadnum').html('0%');
				//$('#picList .uploadprogress').show();

				//http协议进度不可预计，纯粹为了交互，伪造上传进度
				_picUploader.on('uploadStart',function(file){
					var fileobj = $('#picList [data-id="'+file.id+'"]');
					fileobj.find('.uploadprogress').show();
					var _bg = fileobj.find('.uploadbg');
					var _num = fileobj.find('.uploadnum');
					var _wait = 60 + Math.ceil(10*Math.random());
					var _upObj = {
						now : Math.ceil(10*Math.random()),
						step : 1+Math.ceil(1000*Math.random())%3,
						wait : _wait,
						finish : false,
						timer : null
					}
					_upObj.timer = setInterval(function(){
						console&&console.log('debug:progress:'+file.id +' : '+_upObj.now);
						var _now = _upObj.now;
						_upObj.now = _upObj.finish?(_upObj.now+5):_upObj.now;
						_upObj.now = !_upObj.finish&&_upObj.now>=_upObj.wait?_upObj.wait:(_upObj.now+_upObj.step);
						if(_upObj.now>=100){
							_upObj.now = 100;
						}
						_num.html(_upObj.now+'%');
						_bg.css({
							'height' : (100-_upObj.now) +'%' ,
							'margin-top' : _upObj.now +'%'
						});
						if(_upObj.now>=100){
							_upObj.timer && clearInterval(_upObj.timer);
							_picNumUpload--;
							fileobj.find('.uploadprogress').hide();
							fileobj.find('.photo_op,.pt_op_bg').remove();
							_upObj = null;

							if(_picNumUpload <=0){
								_picUploadedFlag = true;
								$('#picList li[data-url]').each(function(index,obj){
									var _obj = $(obj);
									attachment.push({
										picUrl : _obj.attr('data-url'),
										picDesc : _obj.find('.edit_name').val()
									});
								});


								params.items = attachment;
								_truesend(params);
							}
						}
					},1000);
					fileobj.data('upObj',_upObj);
				});

				_picUploader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = $('#picList [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					var upObj = fileobj.data('upObj');
					upObj&&(upObj.finish = true);
				});
				_picUploader.on('uploadFinished',function(){
					//all is finished
					/*
					_picUploadedFlag = true;
					if(_picUploadedFlag && _fileUploadedFlag){
						params.attachment = attachment;
						_truesend(params);
					}
					*/
				});
				_picUploader.upload();
			}else{
				_common.showMsg('请选择上传的图片');
			}
			return false;
		});

		//真正发布
		function _truesend(params){
			_common.post(_SERVICE+'/webapp/clazzcircle/add',params,function(rtn){
				applying = false;
				if('001' == rtn.resultCode){
					_common.showMsg({
						msg : '发布成功',
						callback : function(){
							switchToList();
						}
					});
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
				}
			});
		}
	}


	//发布成功后切换到列表
	function switchToList(){
		//location.href='./homework_list.html';
		location.reload();
	}


	//业务入口
	initSlide();
	initTargetSelect();
	initFileUpload();
	initSubmitBtn();


	//----------------------------- 测试代码 --------------------------------//


	module.exports = qt_model;

});
