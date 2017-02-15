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
		//绑定选择学生
		$('#selectTargetFinishBtn').off().click(function(){
			_slideobj&&_slideobj.left();
			window.parent.untrace&&window.parent.untrace();
			//计算sendTarget，逐个班计算

			var sendTarget = [];

			var targetNum = 0;
			$('#targetBox').find('.operate-class').each(function(index,obj){
				var item = $(obj);
				//判断是否全班选择
				if('1' == item.find('span').eq(0).data('checked')){
					//选了全班
					sendTarget.push({
						pkuid : item.attr('data-classid'),
						name : item.attr('data-name'),
						type : 2
					});
					targetNum = (targetNum+1);
				}

			});

			$('#selectTargetBtn').val('(已选'+targetNum+'个班)').data('sendTarget',sendTarget);
			console&&console.log('debug:'+$.toJSON(sendTarget));

		});
		//填充可以选择的学生数据
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
				if(result.length >0){
					html.push('<a href="javascript:;" class="operate-all"><span class="op-check"></span>全选</a>');
				}

				for(var i=0;i<result.length;i++){
					var item = result[i];
					html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.cid+'" data-name="'+item.name+'"><span class="op-check"></span>'+item.name+'<span class="jt_up" style="display:none;"></span></a>');
					html.push('<hr/>')
				}

				var targetBox = $('#targetBox').prepend(html.join(''));

				//绑定全选事件
				targetBox.find('.operate-all .op-check').off().click(function(){
					var item = $(this);
					if('1' == item.data('checked')){
						//已经勾选变成非勾选
						targetBox.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
						item.data('checked','0');
					}else{
						//非勾选变成已经勾选
						targetBox.find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
						item.data('checked','1');
					}
				});

				//绑定班级勾选
				targetBox.find('.operate-class .op-check').off().click(function(e){
					var item = $(this);
					var parent = $(this).parent();
					if('1' == item.data('checked')){
						item.removeClass('op-checked').addClass('op-check').data('checked','0');
						//同时修改为非全选
						parent.parent().find('.operate-all span').removeClass('op-checked').addClass('op-check').data('checked','0');
					}else{
						item.removeClass('op-check').addClass('op-checked').data('checked','1');
					}
					return false;
				});


				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	//初始化内容输入
	function initContent(){
		$('#content').off().focus(function(){
			var val = $(this).val();
			if('请输入' == val){
				$(this).val('');
			}
		}).blur(function(){
			var val = $(this).val();
			if(!val){
				$(this).val('请输入');
			}
		});
	}


	//初始化文件上传
	var _picUploader = null;
	var _fileUPloader = null;
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
			threads : 9,
			//队列上传数
			fileNumLimit: 9,
			//单个文件大小限制
			fileSingleSizeLimit: 3 * 1024 * 1024,
			thumb: {
				width: 72,
				height: 72,
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
		_picUploader.on('uploadBeforeSend ', function(object, data, headers){
			if('flash'==_picUploader.predictRuntimeType()){
				headers['Accept'] = '*/*';
			}
		});
		_picUploader.on('fileQueued',function(file){
			_picUploader.makeThumb( file, function( error, ret ) {
				if ( error ) {
					
				} else {
					$("#uploadPicBtn").parent().parent().before('<a href="javascript:;" class="filegrid up_img" data-name="'+file.name+'" data-id="'+file.id+'"><div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><span>删除</span><img src="'+ret+'"/></a>');
				}
			});
		});
		_picUploader.on('filesQueued',function(){
			$('#picList').off().on('click','.up_img',function(e){
				_picUploader.removeFile($(this).attr('data-id'));
				var _this = $(this);
				$(this).fadeOut(400,function(){
					_this.remove();
				});
			});
			if(_errorFileNum>0){
				_common.showMsg('部分文件大小受限，请选择小于1M的图片');
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

		//初始化文件选择
		_fileUPloader = WebUploader.create({
			// swf文件路径
			swf: './plugin/webuploader/Uploader.swf',
			// 文件接收服务端。
			server: _common.UPLOADSERVICE+'/webapp/comm/upload?app=notice&uuid='+_common.getUuid()+'&schoolCode='+_common.getSchoolCode(),
			// 选择文件的按钮。可选。
			pick: {
				id : '#uploadFileBtn',
				multiple : true
			},
			accept: null,
			//上次并发数
			threads : 10,
			//队列上传数
			fileNumLimit: 10,
			//单个文件大小限制
			fileSingleSizeLimit: 3 * 1024 * 1024,
			//上传前是否压缩文件大小
			compress : false,
			// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			resize: false
		});
		_fileUPloader.on('fileQueued',function(file){
			var fileList = $('#fileList');
			fileList.append('<a href="javascript:;" class="up_file" data-type="'+file.type+'" data-id="'+file.id+'" data-name="'+file.name+'"><img src="./images/ico_word.gif"/><span class="del" data-id="'+file.id+'">删除</span><span class="text">'+file.name+'</span></a>');

			//绑定事件
			var item = fileList.find('[data-id="'+file.id+'"]').off().click(function(){
				_fileUPloader.removeFile($(this).attr('data-id'));
				$(this).parent().remove();
			});
			
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

			var subject = $('#subjectList .op-radied');
			if(subject.size() <=0){
				_common.showMsg('请选择作业所属科目');
				return false;
			}
			var subjectname = subject.attr('data-subjectname');

			var sendTarget = $('#selectTargetBtn').data('sendTarget');
			if(!sendTarget || sendTarget.length<=0 ){
				_common.showMsg('请选择发送对象');
				return false;
			}
			var content = $('#content').val();
			if(!content || '请输入' == content){
				_common.showMsg('请输入通知内容');
				return false;
			}
			content = _common.filterXss(content);
			applying = true;
			$('#submitBtn').html('发布中').removeClass('btn_blue').addClass('btn_grey');
			$('#uploadPicBtn').parent().parent().css('visibility','hidden');

			
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'content' : content,
				'sendTarget' : sendTarget,
				'subject' : subjectname
			};
			//添加附件
			var attachment = [];
			//标识图片是否已经上传
			var _picUploadedFlag = false;
			//标识文件是否已经上传
			var _fileUploadedFlag = false;

			//处理图片上传
			var pics = $('#picList .up_img');
			if(pics.size() >0){
				//有图片

				//需要上传的图片数量
				var _picNumUpload = pics.size();
				$('#picList a > div .uploadnum').html('0%');
				$('#picList a > div').show();
				$('#picList').off('click','.up_img');
				pics.find('span').remove();

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
							_upObj = null;

							if(_picNumUpload <=0){
								_picUploadedFlag = true;
								if(_picUploadedFlag && _fileUploadedFlag){
									$('#picList a[data-url]').each(function(index,obj){
										var _obj = $(obj);
										attachment.push({
											type : 1,
											url : _obj.attr('data-url'),
											name : _obj.attr('data-name')
										});
									});
									params.attachment = attachment;
									_truesend(params);
								}
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
				//没有图片
				_picUploadedFlag = true;
				if(_picUploadedFlag && _fileUploadedFlag){
					params.attachment = attachment;
					_truesend(params);
				}
			}

			//处理文件上传
			var files = $('#fileList .up_file');
			if(files.length > 0){
				//有附件
				_fileUPloader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = $('#fileList [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					attachment.push({
						type : 2,
						url : rtn.url,
						name : fileobj.attr('data-name')
					});
				});
				_fileUPloader.on('uploadFinished',function(){
					//all is finished
					/*
					files.each(function(index,obj){
						attachment.push({
							type : 2,
							url : $(this).attr('data-url'),
							name : $(this).attr('data-name')
						});
					});
					*/
					_fileUploadedFlag = true;
					if(_picUploadedFlag && _fileUploadedFlag){
						params.attachment = attachment;
						_truesend(params);
					}
				});
				_fileUPloader.upload();
			}else{
				_fileUploadedFlag = true;
				//没有文件，马上上传
				if(_picUploadedFlag && _fileUploadedFlag){
					params.attachment = attachment;
					_truesend(params);
				}
			}
			
			return false;
		});

		//真正发布
		function _truesend(params){
			_common.post(_SERVICE+'/webapp/homework/add',params,function(rtn){
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

	//初始化科目选择
	function initSubject(){
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

		//_common.post(_SERVICE+'/webapp/comm/bdtsbj',params,function(rtn){
		_common.post(_SERVICE+'/webapp/comm/bdsbj',params,function(rtn){
			if('001' == rtn.resultCode){
				var items = rtn.items;

				var html = new Array();
				for(var i=0;i<items.length;i++){
					var item = items[i];
					html.push('<a href="javascript:;" class="operate-btn1"><span class="op-radio" data-subjectid="'+item.id+'" data-subjectname="'+item.name+'" ></span>'+item.name+'</a>');
				}
				$('#subjectList').html(html.join(''));

				//处理交互
				var rsdioes = $('#subjectList').find('.op-radio');
				rsdioes.off().click(function(){
					rsdioes.removeClass('op-radied').addClass('op-radio');
					$(this).removeClass('op-radio').addClass('op-radied');
				});

			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	//发布成功后切换到列表
	function switchToList(){
		parent.callListener&&parent.callListener({
			id : 'message_shortcut',
			data : {}
		});
		location.reload();
	}


	//业务入口
	initSlide();
	initTargetSelect();
	initContent();
	initFileUpload();
	initSubject();
	initSubmitBtn();


	//----------------------------- 测试代码 --------------------------------//

	/*
	var rsdioes = $('#subjectList').find('.op-radio');
	rsdioes.off().click(function(){
		rsdioes.removeClass('op-radied').addClass('op-radio');
		$(this).removeClass('op-radio').addClass('op-radied');
	});
	
	var targetBox = $('#targetBox');
	//绑定全选事件
	targetBox.find('.operate-all .op-check').off().click(function(){
		var item = $(this);
		if('1' == item.data('checked')){
			//已经勾选变成非勾选
			targetBox.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
			item.data('checked','0');
		}else{
			//非勾选变成已经勾选
			targetBox.find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
			item.data('checked','1');
		}
	});

	//绑定班级勾选
	targetBox.find('.operate-class .op-check').off().click(function(e){
		var item = $(this);
		var parent = $(this).parent();
		if('1' == item.data('checked')){
			item.removeClass('op-checked').addClass('op-check').data('checked','0');
			parent.next().find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');

			//同时修改为非全选
			targetBox.find('.operate-all span').removeClass('op-checked').addClass('op-check').data('checked','0');
		}else{
			item.removeClass('op-check').addClass('op-checked').data('checked','1');
			parent.next().find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
		}
		return false;

	});
	//绑定班级详情切换展示
	targetBox.find('.operate-class').off().click(function(){
		var item = $(this);
		if('1' == item.data('fold')){
			//原来已经折叠
			item.data('fold','0');
			item.next().slideDown();
			item.find('.jt_down').removeClass('jt_down').addClass('jt_up');
		}else{
			item.data('fold','1');
			item.next().slideUp();
			item.find('.jt_up').removeClass('jt_up').addClass('jt_down');
		}
	});

	//绑定单个学生勾选
	targetBox.find('.fs_list .op-check').off().click(function(){
		var item = $(this);
		if('1' == item.data('checked')){
			item.removeClass('op-checked').addClass('op-check').data('checked','0');

			//同时修改为非全选
			targetBox.find('.operate-all span').removeClass('op-checked').addClass('op-check').data('checked','0');
			//修改班级非全选
			item.parent().parent().prev().find('span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
		}else{
			item.removeClass('op-check').addClass('op-checked').data('checked','1');
		}
	});
	*/	

	


	module.exports = qt_model;

});
