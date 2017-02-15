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
	var _targetselect = require('./targetselect');

	//json插件
	require('jquery/json');
	//滚动条美化插件
	require('jquery/nicescroll');
	//多文件上传插件
	var WebUploader = require('../plugin/webuploader/webuploader');
	 
	//服务
	var _SERVICE = _common.SERVICE;
	require('../plugin/wysiwyg/wysiwyg');
	require('../plugin/wysiwyg/wysiwyg-editor');


	//获取窗口大小
	var winSize = qt_util.getViewSize();
	var $richcontent = $('#richcontent');
	//入口
	function initPage(){
//		if(_common.getPermissions('notice') == 0){
//			$('#notice_admin').show();
//			$('#qtslide').hide();
//			return;
//		}
		initSlide();
		initTargetSelect();
		initContent();
		initFileUpload();
		initSubmitBtn();
		setTimeout(function(){
			initBoolbar();
		},1000)
		
	}
	//doc,docx,xls,xlsx,ppt,PDF,pdf
	var officeIcon = {
		'doc':'images/notice/file_doc.png',
		'docx':'images/notice/file_doc.png',
		'xls':'images/notice/file_xls.png',
		'xlsx':'images/notice/file_xls.png',
		'ppt':'images/notice/file_ppt.png',
		'pptx':'images/notice/file_ppt.png',
		'pdf':'images/notice/file_pdf.png',
		'PDF':'images/notice/file_pdf.png',
	}
	
	//初始化页面切换
	var _slideobj = null;
	function initSlide(){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		$('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		$('#loading').css({width:_width+'px',height:_height+'px',position:'relative'});
		
		var slides = $('.nicescrollContainer');
		//第二个要处理高度
		var footH = $('.targetselect_footer_fixed').outerHeight();
		slides.eq(1).css('height',(_height-footH)+'px');
		
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
			$('.targetselect_footer_fixed').show();
			window.parent.trace&&window.parent.trace(function(){
				//切换回原来的界面
				_slideobj&&_slideobj.left();
			});
		});

		$('#loading').show();
		$('#targetBox').hide();
		var type = _common.getPermissions('notice')==1?'1,2':'1';
		_targetselect.init({
			type : type,
			isSearch : true,
			isShowSelect : true,
			onReady : function(){
				//数据加载成功回调
				$('#loading').hide();
				$('#targetBox').show();
			},
			onHeightChange : function(){
				//高度发生变化回调
				updateScrollBar();
			},
			onChoose : function(data){
				//选择按钮回调
				_slideobj&&_slideobj.left();
				window.parent.untrace&&window.parent.untrace();

				var sendTarget = [];
				//暂时转换数据（后续接口统一规范）
				for(var i=0;i<data.sendTarget.length;i++){
					var target = data.sendTarget[i];
					if('2' == target.sendType || '4'==target.sendType){
						//分组
						sendTarget.push({
							type : target.sendType,
							pkuid : target.groupid,
							name : target.groupname,
						});
					}else{
						//个人
						sendTarget.push({
							type : target.sendType,
							pkuid : target.uuid,
							name : target.name,
						});
					}
				}
				$('#selectTargetBtn').val('(已选'+data.totalNum+'人)').data('sendTarget',sendTarget);
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
	
	//初始化编辑器bar
	function initBoolbar(){
		editor.init();
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
			//runtimeOrder : 'flash'
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
				_common.showMsg('图片文件大小受限，请选择添加小于3M的图片');
				_errorFileNum=0;
			}
		});
		_picUploader.on('error',function(type,max,file){
			if('F_EXCEED_SIZE' == type){
				_errorFileNum++;
			}
			if('Q_EXCEED_NUM_LIMIT' == type){
				_common.showMsg('图片文件数量受限,系统最大支持9张图片');
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
			accept: {
				title: 'files',
				extensions: 'doc,docx,xls,xlsx,ppt,pptx,PDF,pdf'
			},
			//上次并发数
			threads : 1,
			//队列上传数
			fileNumLimit: 1,
			//单个文件大小限制
			fileSingleSizeLimit: 5 * 1024 * 1024,
			//上传前是否压缩文件大小
			compress : false,
			// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			resize: false
		});
		_fileUPloader.on('fileQueued',function(file){
			var fileList = $('#fileList div.pic_box p');
			var sizeLabel='';
			if(file.size>1024*1024){
				sizeLabel = (parseFloat(file.size)/1024/1024).toFixed(1)+'MB';
			}else if(file.size>1024){
				sizeLabel = (parseFloat(file.size)/1024).toFixed(1)+'KB';
			}else{
				sizeLabel = file.size+'B';
			}
			var _fileType =	file.name.substring(file.name.lastIndexOf('.')+1);
    	    var _fileName = file.name.substring(0,file.name.lastIndexOf('.'));
			fileList.after('<a href="javascript:;" data-name="'+file.name+'" data-id="'+file.id+'" class="filegrid up_file"> <div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><span>删除</span> <img src="'+officeIcon[file.ext]+'" /><p>'+(_fileName.length>10?_fileName.substring(0,10)+'...'+_fileType:_fileName)+'<br /><b>'+sizeLabel+'</b></p> </a>');
			//绑定事件
			var item = $('#fileList div.pic_box').find('[data-id="'+file.id+'"]').off().click(function(){
			    	if(applying){
			    	    return false;
			    	}
				_fileUPloader.removeFile($(this).attr('data-id'));
				$(this).remove();
				return false;
			});
			
		});
		
		
		_fileUPloader.on('error',function(type,max,file){
			if(type == 'Q_TYPE_DENIED'){
				_common.showMsg('格式错误,请选择以下格式重试<br/>doc,docx,xls,xlsx,ppt,pptx,pdf');
				return;
			}
			if(type =='F_EXCEED_SIZE'){
				_common.showMsg('附件文件大小受限,请选择添加小于5M的文件');
				return;
			}
			if(type == 'Q_EXCEED_NUM_LIMIT'){
				_common.showMsg('文件数量受限，系统仅支持单个附件上传');
				return;
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
			if(!sendTarget || sendTarget.length<=0 ){
				_common.showMsg('请选择发送对象');
				return false;
			}
			var richcontent = $richcontent.wysiwyg('shell').getHTML();
			var content = richcontent;
			if(!content){
				_common.showMsg('请输入通知内容');
				return false;
			}
			var content_len = $richcontent.wysiwyg('shell').getElement().innerText.length;
			var contentVal = $richcontent.wysiwyg('shell').getElement().innerText;
			if(content_len > 500){
				_common.showMsg('通知内容不能超过500个文字');
				return false;
			}
			//处理xml字符过滤
			contentVal = contentVal.replace(/[^\u09\u0A\u0D\u20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/ig,'');
			contentVal = contentVal.replace(/\\u/ig,'u');

			applying = true;
			//修改样式
			$('#submitBtn').html('发布中').removeClass('btn_blue').addClass('btn_grey');
			$('#uploadPicBtn').parent().parent().css('visibility','hidden');
			$('#uploadFileBtn').parent().parent().css('visibility','hidden');
			
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'content' : content,
				'simpleContent':$.trim(contentVal),
				'sendTarget' : sendTarget
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
			var files = $('#fileList').find('a.up_file');
			if(files.length > 0){
				//有附件
				_fileUPloader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = $('#fileList [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					attachment.push({
						type : 2,
						url : rtn.url,
						name : fileobj.attr('data-name'),
						size:file.size
					});
				});
				_fileUPloader.on('uploadFinished',function(){
					//all is finished
					/*
					files.each(function(index,obj){
						attachment.push({
							type : 1,
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
				//上传过程中触发，携带上传进度。
				_fileUPloader.on( 'uploadProgress', function( file, percentage ) {
					
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
			//console.log(params);
			//console.log(JSON.stringify(params));
			_common.post(_SERVICE+'/webapp/notice/add',params,function(rtn){
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
					setTimeout(function(){
						switchToList();
					},1000)
				}
			//	isimpleContentStatus = false;
			});
			
			setTimeout(function(){
				if(applying){
					switchToList();
				}
			},1500 *10)
		}
	}

	//发布成功后切换到列表
	function switchToList(){
		parent.callListener&&parent.callListener({
			id : 'message_shortcut',
			data : {}
		});
		location.reload();
	}


	//更新滚动条
	function updateScrollBar(){
		 var slides = $('.nicescrollContainer');
		 slides.each(function(index,obj){
			var scrollobj = $(obj).getNiceScroll();
			scrollobj.each(function(){
				this.resize();
			})
		})
	}

	
	//----------------------------- 编辑器部分 --------------------------------//
	//var isimpleContentStatus=false;
	var editor = {
			init:editor_init,
			bold:editor_bold,
			italic:editor_italic,
			underline:editor_underline,
			strikethrough:editor_strikethrough,
			forecolor:editor_forecolor,
			backcolor:editor_backcolor,
			removeformat:editor_removeformat,
			fontsize:editor_fontsize,
			blockquote:editor_blockquote,
			insertunorderedlist:editor_insertunorderedlist,
			insertorderedlist:editor_insertorderedlist,
			justify_left:editor_justify_left,
			justify_right:editor_justify_right,
			justify_center:editor_justify_center
	}
	function editor_init(){
		$('body').on('click',function(){
			hidePop(0);
		})
		$richcontent.wysiwyg({
			 classes: 'some-more-classes',
			 buttons: {
				 //必须写此参数
			 }
		}).change(function(){
			var _curText = $richcontent.wysiwyg('shell').getElement();
			var _len = $(_curText).text().length;
			$('#maxNum').text(_len);
			if(_len > 500){// color:#f4342f;
				$('#maxNum').css('color','#f4342f');
			}else{
				$('#maxNum').css('color','#888');
			}
        });
		
		$('.editorwz ul li').each(function(){
			var _this = $(this);
			_this.on('click',function(){
				//isimpleContentStatus = true;
				var cmd = _this.attr('data-cmd');
				editor[cmd](_this);
				return false;
			});
		});
	}
	//加粗
	function editor_bold(ele){
		$richcontent.wysiwyg('shell').bold();
	}
	//斜体
	function editor_italic(ele){
		$richcontent.wysiwyg('shell').italic();
	}
	//下划线
	function editor_underline(ele){
		$richcontent.wysiwyg('shell').underline();
	}
	//删除线
	function editor_strikethrough(ele){
		$richcontent.wysiwyg('shell').strikethrough();
	}
	//字体颜色
	function editor_forecolor(ele){
		var $forecolor = $('.pop_forecolor');
		hidePop(1,ele);
		$forecolor.toggle();
		var colorStr = '';
		//自动的颜色,主题色, 标准色
		$forecolor.find('h2,ul li a').off().on('click',function(){
			colorStr = $(this).attr('data-color');
			if(colorStr!=''){
				$forecolor.find('h2 span i').css('background',colorStr);
				$richcontent.wysiwyg('shell').forecolor(colorStr);
			}
		});
	}
	//背景色
	function editor_backcolor(ele){
		var $backcolor = $('.pop_backcolor');
		hidePop(1,ele);
		$backcolor.toggle();
		var colorStr = '';
		$backcolor.find('h2,ul li a,h2 span i').off().on('click',function(){
			colorStr = $(this).attr('data-color');
			if(colorStr!=''){
				$richcontent.wysiwyg('shell').highlight(colorStr);
			}
		});
	}
	//清除样式
	function editor_removeformat(ele){
		$richcontent.wysiwyg('shell').removeFormat();
	}
	//字号大小
	function editor_fontsize(ele){
		var $fontsize = $('.pop_fontsize');
		hidePop(1,ele);
		$fontsize.toggle();
		var fsStr='';
		$fontsize.find('ul li').off().on('click',function(){
			fsStr = $(this).attr('data-fontsize');
			if(fsStr!=''){
				var intFsStr = parseInt((parseInt(fsStr)-8)/3);
				$richcontent.wysiwyg('shell').fontSize(intFsStr);
				ele.find('a span').text(fsStr+'px');
			}
		});
	}
	//引用块
	function editor_blockquote(ele){
		
	}
	//无序列表
	function editor_insertunorderedlist(ele){
		$richcontent.wysiwyg('shell').insertList();
	}
	//有序列表
	function editor_insertorderedlist(ele){
		$richcontent.wysiwyg('shell').insertList(true);
	}
	//左对齐
	function editor_justify_left(ele){
		$richcontent.wysiwyg('shell').align('left');
	}
	//右对齐
	function editor_justify_right(ele){
		$richcontent.wysiwyg('shell').align('right');
	}
	//中间对齐
	function editor_justify_center(ele){
		$richcontent.wysiwyg('shell').align('center');
	}
	//隐藏所有的pop  type:0所有,obj
	function hidePop(type,obj){
		if(type==0){
			$('.pop_forecolor').hide();
			$('.pop_backcolor').hide();
			$('.pop_fontsize').hide();
		}else{
			if(obj){
				var attrName = obj.attr('data-attrName');
				var arr = ['pop_forecolor','pop_backcolor','pop_fontsize'];
				for(var i=0;i<arr.length;i++){
					if(attrName != arr[i]){
						$('.'+arr[i]).hide();
					}
				}
			}
		}
	}
	
	//----------------------------- 编辑器部分 end--------------------------------//

	//业务入口
	initPage();

	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
