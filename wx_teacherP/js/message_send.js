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
				autohidemode:1==index?false:true,
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
				/*
				$('#selectTargetBtn').val('请选择').attr({
					'data-uuid' : '',
					'data-cid' : '',
					'data-userType' : ''
				});
				*/
			});
		});
		//绑定选择学生
		$('#selectTargetFinishBtn').off().click(function(){
			_slideobj&&_slideobj.left();
			window.parent.untrace&&window.parent.untrace();

			var parSapn = $('#targetBox').find('.fs_list span.op-radied');
			if(parSapn.size() >0){
				var uuid = parSapn.attr('data-uuid');
				var cid = parSapn.attr('data-cid');
				var name = parSapn.attr('data-name');
				var userType = parSapn.attr('data-userType');
				$('#selectTargetBtn').val(name).attr({
					'data-uuid' : uuid,
					'data-cid' : cid,
					'data-userType' : userType
				});
			}else{
				$('#selectTargetBtn').val('请选择').attr({
					'data-uuid' : '',
					'data-cid' : '',
					'data-userType' : ''
				});
			}
		});

		//加载数据
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}
		//填充可以选择的家长教师数据
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'isRefresh' : 0
		};
		_common.showLoading();
		$('#targetBox').hide();
		_common.post(_SERVICE+'/webapp/linkman/list',params,function(rtn){
			_common.hideLoading();
			$('#targetBox').show();
			if('001' == rtn.resultCode){
				//填充联系人
				fillContact(rtn);
				updateScrollBar();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});

		//绑定大类点击事件
		$('.operate-all').off().on('click',function(){
			var _this = $(this);
			var span = _this.find('span').eq(1);
			var box = _this.parent().find('.classlist');
			if(span.hasClass('jt_up')){
				//原来已经打开
				span.removeClass('jt_up').addClass('jt_down');
				box.slideUp('fast',function(){
					updateScrollBar();
				});
			}else{
				//原来关闭
				span.removeClass('jt_down').addClass('jt_up');
				box.slideDown('fast',function(){
					updateScrollBar();
				});
			}
		});
	}

	//填充选择的人
	function fillContact(rtn){
		var items = rtn.linkmanParent;
		var html = new Array();

		//填充家长
		for(var i=0;i<items.length;i++){
			//逐个班添加
			var item = items[i];
			html.push(_getParentGroupHtml(item));
		}
		$('#studentBox .classlist').html(html.join('<hr/>'));


		//填充教师
		html = new Array();
		items = rtn.linkmanTeacher;
		for(var i=0;i<items.length;i++){
			var item = items[i];
			html.push(_getTeacherGroupHtml(item));
		}
		$('#teacherBox .classlist').html(html.join('<hr/>'));


		//绑定班级点击事件
		$('.operate-class').off().on('click',function(){
			var _this = $(this);
			var span = _this.find('span').eq(1);
			var box = _this.next();
			if(span.hasClass('jt_up')){
				//原来已经打开
				span.removeClass('jt_up').addClass('jt_down');
				box.slideUp('fast',function(){
					updateScrollBar();
				});
			}else{
				//原来关闭
				span.removeClass('jt_down').addClass('jt_up');
				box.slideDown('fast',function(){
					updateScrollBar();
				});
			}
		});

		//绑定单选
		var radios = $('.classlist .op-radio');
		var as = $('.classlist .operate-btn');
		as.off().click(function(){
			var _this = $(this);
			radios.removeClass('op-radied');
			_this.find('.op-radio').addClass('op-radied');
		});
	}

	//获取新的班级html
	function _getParentGroupHtml(item){
		var html = new Array();
		html.push('<a href="javascript:;" class="operate-class"><span class="op-radio" style="display:none;"></span>'+item.className+'<em>学生'+item.stuCount+'人/家长'+item.parentCount+'人</em><span class="jt_down"></span></a>');
		
		var childs = item.childs;
		var followed = new Array()
		var nofollow = new Array();
		for(var i=0;i<childs.length;i++){
			var child = childs[i];
			for(var j=0;j<child.parents.length;j++){
				var parent = child.parents[j];
				if('1' == parent.followed){
					//已经关注
					followed.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" data-userType="2" data-cid="'+item.cid+'" data-uuid="'+parent.uuid+'" data-name="'+parent.name+'('+child.stuName+' '+parent.tag+')'+'"></span>'+parent.name+'('+child.stuName+' '+parent.tag+')</a>');
				}else{
					//未关注
					nofollow.push(parent.name+'('+child.stuName+' '+parent.tag+')');
					//nofollow.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" style="display:none;" data-cid="'+item.cid+'" data-uuid="'+parent.uuid+'" data-name="'+parent.name+'"></span>'+parent.name+'('+child.stuName+' '+parent.tag+')</a>');
				}
			}
		}
		html.push('<div class="fs_list" style="display:none;">');
		html.push('	<div class="gz_tit">');
		html.push('		<p>已关注<em>'+followed.length+'人</em></p>');
		html.push('	    '+followed.join(''));
		html.push('	</div>');
		html.push('	<div class="wgz_tit">');
		html.push('		<p>未关注<em>'+nofollow.length+'人</em></p>');
		html.push('		'+nofollow.join('、'));
		html.push('	</div>');
		html.push('</div>');

		return html.join('');
	}

	//获取新的教师html
	function _getTeacherGroupHtml(item){
		var html = new Array();
		html.push('<a href="javascript:;" class="operate-class"><span class="op-radio" style="display:none;"></span>'+item.deptName+'<em>'+item.teaCount+'人</em><span class="jt_down"></span></a>');
		
		var teachers = item.teachers;
		var followed = new Array()
		var nofollow = new Array();
		for(var i=0;i<teachers.length;i++){
			var teacher = teachers[i];
			if('1' == teacher.followed){
				//已经关注
				followed.push('<a href="javascript:;" class="operate-btn"><span class="op-radio" data-userType="1" data-cid="'+item.deptId+'" data-uuid="'+teacher.uuid+'" data-name="'+teacher.name+'(教师)"></span>'+teacher.name+'</a>');
			}else{
				//未关注
				nofollow.push(teacher.name);
			}
		}
		html.push('<div class="fs_list" style="display:none;">');
		html.push('	<div class="gz_tit">');
		html.push('		<p>已关注<em>'+followed.length+'人</em></p>');
		html.push('	    '+followed.join(''));
		html.push('	</div>');
		html.push('	<div class="wgz_tit">');
		html.push('		<p>未关注<em>'+nofollow.length+'人</em></p>');
		html.push('		'+nofollow.join('、'));
		html.push('	</div>');
		html.push('</div>');
		return html.join('');
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
			server: _common.SERVICE+'/webapp/comm/upload?app=notice&uuid='+_common.getUuid()+'&schoolCode='+_common.getSchoolCode(),
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
					//do nothing
				} else {
					var html = new Array();
					html.push('<a href="javascript:;" class="filegrid up_img" data-name="'+file.name+'" data-id="'+file.id+'">');
					html.push('<div class="uploadprogress">');
					html.push('  <div class="uploadbg"></div>');
					html.push('  <div class="uploadnum">0%</div>');
					html.push('</div>');
					html.push('<span>删除</span><img src="'+ret+'"/>');
					html.push('</a>');
					$("#uploadPicBtn").parent().parent().before(html.join(''));
				}
			});
		});
		_picUploader.on('filesQueued',function(){
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

		//绑定删除图片
		$('#picList').off().on('click','.up_img',function(e){
			_picUploader.removeFile($(this).attr('data-id'));
			var _this = $(this);
			$(this).fadeOut(400,function(){
				_this.remove();
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
			var targetUuid = $('#selectTargetBtn').attr('data-uuid');
			var cid = $('#selectTargetBtn').attr('data-cid');
			var userType = $('#selectTargetBtn').attr('data-userType');

			if(!targetUuid){
				_common.showMsg('请选择发送对象');
				return false;
			}
			var content = $('#content').val();
			if(!content || '请输入' == content){
				_common.showMsg('请输入留言内容');
				return false;
			}

			applying = true;
			//修改样式
			$('#submitBtn').html('发布中').removeClass('btn_blue').addClass('btn_grey');
			$('#uploadPicBtn').parent().parent().css('visibility','hidden');


			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'content' : content,
				'targetUuid' : targetUuid,
				'classCode' : cid,
				'targetUserType' : parseInt(userType)
			};

			//添加附件
			var attachment = [];
			//标识图片是否已经上传
			var _picUploadedFlag = false;

			//处理图片上传
			var pics = $('#picList .up_img');
			if(pics.size() >0){
				//有图片
				//需要上传的图片数量
				var _picNumUpload = pics.size();
				//上传失败的图片数量
				var _picUploadErrNum = 0;

				$('#picList a > div .uploadnum').html('0%');
				$('#picList a > div').show();
				//$('#picList').off('click','.up_img');
				pics.find('span').hide();
				
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

							if(_picNumUpload <= _picUploadErrNum){
								//未上传的图片
								_picUploadedFlag = true;
								$('#picList a[data-url]').each(function(index,obj){
									var _obj = $(obj);
									attachment.push({
										type : 1,
										url : _obj.attr('data-url'),
										name : _obj.attr('data-name')
									});
								});
								params.attachment = attachment;

								if(_picUploadErrNum >0){
									//有上传失败的图片，需要确定
									_common.showMsg({
										msg : '部分图片上传失败，请确定是否继续提交留言？',
										okbtnText : '是',
										btnText : '否',
										okcallback : function(){
											_truesend(params);
										},
										callback : function(){
											_reset();
										}
									});
								}else{
									//没有失败图片，直接发送
									_truesend(params);
								}
							}
						}
					},1000);
					fileobj.data('upObj',_upObj);
				});

				//上传成功回调
				_picUploader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = $('#picList [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					var upObj = fileobj.data('upObj');
					upObj&&(upObj.finish = true);
				});

				//上传失败回调
				_picUploader.on('uploadError',function(file,response){
					_picUploadErrNum++;
				});

				//所有文件上传成功
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
				params.attachment = attachment;
				_truesend(params);
			}

			return false;
		});

		//真正发布
		function _truesend(params){
			_common.post(_SERVICE+'/webapp/words/send',params,function(rtn){
				applying = false;
				if('001' == rtn.resultCode){
					_common.showMsg({
						msg : '发布成功',
						callback : function(){
							switchToList();
						}
					});
					//message_shortcut
					// parent.callListener && parent.callListener({
					// 	id : 'message_shortcut',
					// 	data :{}
					// });
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					//$('#submitBtn').html('发布').removeClass('btn_grey').addClass('btn_blue');
					_reset();
					_common.showMsg(rtn.resultMsg);
				}
			});
		}

		//重置
		function _reset(){
			$('#picList .up_img span').show();
			_picUploader.reset();
			$('#submitBtn').html('发布').removeClass('btn_grey').addClass('btn_blue');
			$('#uploadPicBtn').parent().parent().css('visibility','visible');
		}

	}

	//发布成功后切换到列表
	function switchToList(){
		location.href = location.href.replace(/puuid=.*&/,'').replace(/pname=.*&/,'').replace(/cid=.*&/,'')
		//location.reload();
	}

	//更新滚动条
	function updateScrollBar(){
		var slides = $('.nicescrollContainer');
		slides.each(function(index,obj){
			$(obj).getNiceScroll().resize();
		});
	}



	//业务入口
	initSlide();
	initTargetSelect();
	initContent();
	initFileUpload();
	initSubmitBtn();

	var puuid = qt_util.P('puuid');
	var pname = qt_util.P('pname');
	var cid = qt_util.P('cid');
	var userType = qt_util.P('userType');

	if(puuid && pname && cid){
		$('#selectTargetBtn').val(''+decodeURIComponent(pname)).attr({
			'data-uuid' : decodeURIComponent(puuid),
			'data-cid' : decodeURIComponent(cid),
			'data-userType' : decodeURIComponent(userType)
		});
	}

	//----------------------------- 测试代码 --------------------------------//


	module.exports = qt_model;

});
