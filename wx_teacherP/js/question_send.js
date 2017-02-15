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
	var _config = require('./config');
	require('./copytext');
	var _targetselect = require('./targetselect');


	//多文件上传插件
	var WebUploader = require('../plugin/webuploader/webuploader');
	var layDate = require('../plugin/laydate/laydate');

	//json插件
	require('jquery/json');
	//滚动条美化插件
	require('jquery/nicescroll');

	//服务
	var _SERVICE = _common.SERVICE;
	//图片前缀
	var _IMG_PREFIX = _config.IMG_PREFIX;


	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//初始化页面切换
	var _slideobj = null;
	function initSlide(){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		
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
	function initTargetSelect(callback){
		//选择学生
		$('#selectTargetBtn').off().click(function(){
			_slideobj&&_slideobj.right();
			$('.targetselect_footer_fixed').show();
			$('#addTitleBtn').hide();
			window.parent.trace&&window.parent.trace(function(){
				//切换回原来的界面
				_slideobj&&_slideobj.left();
				setTimeout(function(){
					$('#addTitleBtn').fadeIn();
				},300);
				//没有选择内容
			});
		});

		$('#loading').show();
		$('#targetBox').hide();
		var type = _common.getPermissions('notice')==1?'1,2':'1';
		_targetselect.init({
			type : '1,2',
			isSearch : false,
			isShowSelect : false,
			isGroupTag:false,
			level:1,
			onReady : function(){
				//数据加载成功回调
				$('#loading').hide();
				$('#targetBox').show();
				callback && callback();
			},
			onHeightChange : function(){
				//高度发生变化回调
				updateScrollBar();
			},
			onChoose : function(data){
				//选择按钮回调
				_slideobj&&_slideobj.left();
				$('#addTitleBtn').fadeIn();
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
		$('#questionTheme,#content').off().focus(function(){
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

	//初始化问卷
	var alphabet = ['','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	//获取字母表索引，要传入总数则根据总数判断用数字还是字母
	function initQuestion(){
		var box = $('#question');
		var list = $('#titleList');
		//添加题目
		
		$('#addTitleBtn').on('click','a',function(){
			var _this = $(this);
			var type = _this.attr('data-type');
			addBlankTitle(type,function(unique){
				if('2' == type || '4' == type){
					initPicTitleUpload(unique);
				}
				updateScrollBar();
				var item = $('.qt-slide-wrap > div').eq(0);
				item.getNiceScroll(0).doScrollTop(item.find('.nicescrollWrapper').height()+1000,30);
			});
		});

		list.on('click','.question_title_deltitle',function(){
			//去掉本题点击处理
			var _unique = $(this).attr('data-unique');
			if(!_unique){
				return;
			}
			var titles = list.find('.question_title_index');
			if(titles.length<=1){
				_common.showMsg('每份问卷最少需要一个问题');
				return;
			}
			/**
			if(titles.length<=2 && $(this).parent().parent().attr('data-type')!='3' ){
				
				var hasPicQues = false;
				list.find('.ques_box').each(function(){
					var _this = $(this);
					if(_this.attr('data-type') == '3'){
						hasPicQues = true;
					}else{
						hasPicQues = false;
					}
				});
				if(hasPicQues){
					_common.showMsg('不能只有图文说明题，每份问卷最少需要一个问题');
					return ;
				}
			}
			**/
			//重新索引
			var table = list.find('div[data-unique="'+_unique+'"]');
			table.fadeOut('fast',function(){
				table.remove();
				list.find('.question_title_index').each(function(index,obj){
					$(this).html('问题'+(1+index));
				});
			});
		}).on('click','.question_title_additem',function(){
			//增加选项
			var _unique = $(this).attr('data-unique');
			if(!_unique){
				return;
			}
			addBlankItem(_unique);
		}).on('click','.bt_quss_del',function(){
			//删除选项
			var _unique = $(this).attr('data-unique');
			if(!_unique){
				return;
			}
			$(this).parent().fadeOut('fast',function(){
				var _this = $(this);
				var table = list.find('div[data-unique="'+_unique+'"]');
				if(_this.hasClass('question_title_imgcon')){
					//图片类型题目中的图片
					_this.hide().html('').removeAttr('data-name').removeAttr('data-url');
					var titleUploader = table.data('titleUploader');
					titleUploader && titleUploader.removeFile(_this.attr('data-id'));
				}else{
					_this.remove();
					//重新索引
					var items = table.find('.question_item_label');
					var itemsLength = items.length;
					var useNumIndex = itemsLength>=alphabet.length;
					items.each(function(index,obj){
						$(this).html('选项'+(useNumIndex?(1+index):alphabet[(1+index)]));
					});
					//处理图片类型的删除
					if('2' == table.attr('data-type')){
						var itemUploader = table.data('itemUploader');
						itemUploader && itemUploader.removeFile(_this.attr('data-id'));
					}
					if('3' == table.attr('data-type')){
						var picTitleUploader = table.data('picTitleUploader');
						picTitleUploader && picTitleUploader.removeFile(_this.attr('data-id'));
					}
				}
			});
		}).on('click','.add_type span',function(){
			//题目选型选择
			var _this = $(this);
			var checks = $(this).parent().find('.op-radio');
			checks.removeClass('op-radied');
			_this.addClass('op-radied');
			return false;
		}).on('click','.tit span',function(){
			//是否记名选择
			var _this = $(this);
			var checks = $(this).parent().find('.op-radio');
			checks.removeClass('op-radied');
			_this.addClass('op-radied');
			return false;
		}).on('click','.add_con a.ques-operate,.add_con1 a.ques-operate,.con a.ques-operate',function(){
			var _this = $(this);
			var spanCheck = _this.find('span');
			if(spanCheck.hasClass('op-check')){
				spanCheck.removeClass('op-check').addClass('op-checked');
			}else{
				spanCheck.removeClass('op-checked').addClass('op-check');
			}
			return false;
		});
		/*
		.on('focus','input',function(){
			//输入获取焦点
			var _val = $(this).val();
			if('请输入' == _val){
				$(this).val('');
			}
			return false;
		}).on('blur','input',function(){
			//输入失去焦点
			var _val = $(this).val();
			if(!_val){
				$(this).val('请输入');
			}
			return false;
		});
		*/
		
		//问卷时限 的单选框
		$('#ques_deadLine').off().on('click','a',function(){
			var _this = $(this);
			var spanCheck = _this.find('span');
			var index = _this.index();
			if(index =='0'){
				$('#ques_lastTime').hide();
			}else{
				$('#ques_lastTime').show();
			}
			if(spanCheck.hasClass('op-radio')){
				spanCheck.removeClass().addClass('op-radied');
				_this.siblings().find('span').removeClass().addClass('op-radio');
			}
		});
		//问卷时限时限选择
    	$('#lastTime').off().on('click',function(){
			_common.layDate({elem:"#lastTime",format:'YYYY-MM-DD hh:mm',min: laydate.now(),istime: true,event : 'click'},1);
		});
		//投票后结果可见单选框
		$('#ques_canSee').off().on('click','a',function(){
			var _this = $(this);
			var spanCheck = _this.find('span');
			if(spanCheck.hasClass('op-radio')){
				spanCheck.removeClass().addClass('op-radied');
				_this.siblings().find('span').removeClass().addClass('op-radio');
			}
		});
		
	}


	//增加空白选项
	function addBlankItem(_unique,callback){
		//去掉本题点击处理
		var title = $('#titleList').find('div[data-unique="'+_unique+'"]');
		var type = title.attr('data-type');

		var items = title.find('.question_title_item');
		
		//不限制选项个数，要限制的打开下面3行即可
		//if(items.length +1 >= alphabet.length){
		//	//限制选项个数
		//	return;
		//}

		var alphabetIndex = items.length+1;
		var useNumIndex = alphabetIndex>=alphabet.length;
		

		var html = new Array();
		if(1 == type){
			//文字题型
			html.push('<p class="question_title_item">');
			html.push('    <span class="question_item_label">选项'+(useNumIndex?alphabetIndex:alphabet[alphabetIndex])+'</span>：<input class="question_item_input" type="text" placeholder="请输入" maxlength="50"/><a href="javascript:;" class="bt_quss_del" data-unique="'+_unique+'">删除</a>');
			html.push('</p>');
		}else if(2 == type){
			//图片题型
			html.push('<div class="add_con_div question_title_item">');
			html.push('    <a href="javascript:;" class="bt_quss_del" data-unique="'+_unique+'">删除</a>');
			html.push('    <a href="javascript:;" class="bt_quss_img question_item_imgcon">');
			html.push('        <div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><img src=""/>');
			html.push('    </a>');
			html.push('    <span class="question_item_label">选项'+(useNumIndex?alphabetIndex:alphabet[alphabetIndex])+'</span><input class="question_item_input" type="text" placeholder="添加选项说明" maxlength="50"/>');
			html.push('</div>');
		}else{
			return;
		}
		title.find('.question_title_addimg,.question_title_additem').parent().before(html.join(''));
		var just = title.find('.question_title_addimg,.question_title_additem').parent().prev();

		//重新索引一次
		var items = title.find('.question_item_label');
		var itemsLength = items.length;
		var useNumIndex = itemsLength>=alphabet.length;
		items.each(function(index,obj){
			$(this).html('选项'+(useNumIndex?(1+index):alphabet[(1+index)]));
		});



		callback && callback(just);
	}

	//初始增加空白问题
	function addBlankTitle(type,callback){
		var list = $('#titleList');
		var titles = list.find('.ques_box');
		var unique = (new Date()).getTime();
		var html = new Array();
		/*
		附加class
		question_title_input : 标题输入
		question_item_input : 选项输入
		question_title_item : 每个选项标识
		question_title_additem : 添加选项按钮
		question_title_deltitle : 删除本题按钮
		question_title_index : 问题index
		question_title_addimg : 添加图片选项
		question_title_imgcon : 标题图片容器
		question_item_imgcon : 选项图片容器
		question_item_label : 选项字母表前缀
		*/
		if('1' == type){
			html.push('<div class="ques_box" data-unique="'+unique+'" data-type="1">');
			//			html.push('	<div class="tit"><b class="question_title_index">问题'+(titles.length+1)+'</b>（文字题型）：<span class="op-radio op-radied" data-sign="0"></span>不记名问题&nbsp;&nbsp;&nbsp;&nbsp;<span class="op-radio" data-sign="1"></span>记名问题<a href="javascript:;" class="fr_t question_title_deltitle" data-unique="'+unique+'"><img src="images/question/shanchu.png"/></a></a></div>');
			html.push('	<div class="tit"><b class="question_title_index">问题'+(titles.length+1)+'</b>（文字题型）：<a href="javascript:;" class="fr_t question_title_deltitle" data-unique="'+unique+'"><img src="images/question/shanchu.png"/></a></a></div>');
			html.push('	<div class="con">');
			html.push('		<div class="add_type">');
			html.push('			选&nbsp;&nbsp;型：<span class="op-radio op-radied" data-answerType="1"></span>单选&nbsp;&nbsp;&nbsp;&nbsp;<span class="op-radio" data-answerType="2"></span>多选');
			html.push('		</div>');
			html.push('		<div class="add_tit">题&nbsp;&nbsp;目：');
			html.push('			<input class="add_tit_input question_title_input" type="text" placeholder="请输入" maxlength="150"/>');
			html.push('		</div>');
			html.push('		<div class="add_con1">');
			html.push('			<p class="question_title_item">');
			html.push('				<span class="question_item_label">选项A</span>：<input class="question_item_input" type="text" placeholder="请输入" maxlength="50" />');
			html.push('			</p>');
			html.push('			<p class="question_title_item">');
			html.push('				<span class="question_item_label">选项B</span>：<input class="question_item_input" type="text" placeholder="请输入" maxlength="50"/>');
			html.push('			</p>');
			html.push('			<p style="text-align:right">');
			if(quesType !=2 ){
				html.push('				<a href="javascript:;" class="operate-btn ques-operate"><span class="op-check"></span>是否记名</a>');
			}
			html.push('				<a href="javascript:;" data-unique="'+unique+'" class="btn btn_grey question_title_additem">添加选项</a>');
			html.push('			</p>');
			html.push('		</div>');
			html.push('	</div>');
			html.push('</div>');
		}else if('2' == type){
			html.push('<div class="ques_box" data-unique="'+unique+'" data-type="2">');
			//			html.push('	<div class="tit"><b class="question_title_index">问题'+(titles.length+1)+'</b>（图片题型）：<span class="op-radio op-radied" data-sign="0"></span>不记名问题&nbsp;&nbsp;&nbsp;&nbsp;<span class="op-radio" data-sign="1"></span>记名问题<a href="javascript:;" class="fr_t question_title_deltitle" data-unique="'+unique+'"><img src="images/question/shanchu.png"/></a></div>');
			html.push('	<div class="tit"><b class="question_title_index">问题'+(titles.length+1)+'</b>（图片题型）：<a href="javascript:;" class="fr_t question_title_deltitle" data-unique="'+unique+'"><img src="images/question/shanchu.png"/></a></div>');
			html.push('	<div class="con">');
			html.push('		<div class="add_type">');
			html.push('			选&nbsp;&nbsp;型：<span class="op-radio op-radied" data-answerType="1"></span>单选&nbsp;&nbsp;&nbsp;&nbsp;<span class="op-radio" data-answerType="2"></span>多选 ');
			html.push('		</div>');
			html.push('		<div class="add_tit">');
			html.push('			<a href="javascript:;" class="add_tit_img">添加图片<div class="uploader">&nbsp;</div></a>');
			html.push('			题&nbsp;&nbsp;目：<input class="add_tit_input question_title_input" type="text" placeholder="请输入" maxlength="150"/>');
			html.push('			<span class="question_title_imgcon" style="display:none;">');
			//html.push('             <a href="javascript:;" class="bt_quss_bigimg"><img src="../images/ques_img1.jpg" /></a><a href="javascript:;" class="bt_quss_del">删除</a>')
			html.push('			</span>');
			html.push('		</div>');
			html.push('		<div class="add_con">');
			html.push('			<div class="add_con_div"><a href="javascript:;" class="bt_quss_addtd question_title_addimg">添加选项<div class="uploader">&nbsp;</div></a></div>');
			if(quesType !=2 ){
				html.push('			<div style="padding:0 0 0 15px;"><a href="javascript:;" class="operate-btn ques-operate"><span class="op-check"></span>是否记名</a> </div>')
			}
			html.push('		</div>');
			html.push('	</div>');
			html.push('</div>');
		}else if('3' == type){
			html.push('<div class="ques_box" data-unique="'+unique+'" data-type="1">');
			html.push('	<div class="tit"><b class="question_title_index">问题'+(titles.length+1)+'</b>（填空题型）：<a href="javascript:;" data-unique="'+unique+'" class="fr_t question_title_deltitle"><img src="images/question/shanchu.png"/></a></div>');
			html.push('	<div class="con">');
			html.push('		<div class="add_tit">题&nbsp;&nbsp;目：');
			html.push('			<input class="add_tit_input question_title_input" type="text" placeholder="请输入" maxlength="150"/>');
			html.push('		</div>');
			if(quesType !=2 ){
				html.push('		<a href="javascript:;" class="operate-btn ques-operate"><span class="op-check"></span>是否记名</a> ');
			}
			html.push('	</div>');
			html.push('</div>');
		}else if('4' == type){
			html.push('<div class="ques_box" data-unique="'+unique+'" data-type="3">');
			html.push('	<div class="tit"><b class="question_title_index">问题'+(titles.length+1)+'</b>（图文说明）：<a href="javascript:;" data-unique="'+unique+'" class="fr_t question_title_deltitle"><img src="images/question/shanchu.png"/></a></div>');
			
			html.push('	<div class="add_con_div add_con_div1" style="position: relative;"> ');
			html.push('		<a href="javascript:;" class="bt_quss_addimg" style="position: relative;"><div class="uploader">&nbsp;</div></a>');
			html.push('		</div>');
			html.push('				<div class="con">');
			html.push('				<div class="add_tit">说&nbsp;&nbsp;明：');
			html.push('				<input class="add_tit_input question_title_input" type="text" placeholder="请输入描述" maxlength="300"/>')
			html.push('		</div>');
			html.push('	</div>');
			html.push('</div>');
		}else{
			return;
		}
		list.append(html.join(''));
		callback && callback(unique);
	}


	//初始化每个图片类型题目的图片上传
	function initPicTitleUpload(unique){
		var title = $('#titleList').find('div[data-unique="'+unique+'"]');
		var itemDom = title.find('.question_title_addimg .uploader');
		var titleDom = title.find('.add_tit_img .uploader');
		var picTitle = title.find('.bt_quss_addimg .uploader');

		//错误文件数
		var _errorFileNum = 0;
		//初始化图片选择
		var _itemUploader = WebUploader.create({
			// swf文件路径
			swf: './plugin/webuploader/Uploader.swf',
			// 文件接收服务端。
			server: _common.UPLOADSERVICE+'/webapp/comm/upload?app=survey&uuid='+_common.getUuid()+'&schoolCode='+_common.getSchoolCode(),
			// 选择文件的按钮。可选。
			pick: itemDom[0],
			accept: {
				title: 'Images',
				extensions: 'gif,jpg,jpeg,bmp,png',
				mimeTypes: 'image/*'
			},
			//上次并发数
			threads : 9,
			//队列上传数
			fileNumLimit: 9999,
			//单个文件大小限制
			fileSingleSizeLimit: 3 * 1024 * 1024,
			thumb: {
				width: 98,
				height: 98,
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
		_itemUploader.on('uploadBeforeSend', function(object, data, headers){
			if('flash'==_itemUploader.predictRuntimeType()){
				headers['Accept'] = '*/*';
			}
		});
		_itemUploader.on('fileQueued',function(file){
			_itemUploader.makeThumb( file, function( error, ret ) {
				if ( error ) {
					
				} else {
					addBlankItem(unique,function(item){
						item.find('img').attr('src',ret);
						item.attr({
							'data-name' : file.name,
							'data-id' : file.id
						});
					});
				}
			});
		});
		_itemUploader.on('filesQueued',function(){
			if(_errorFileNum>0){
				_common.showMsg('部分文件大小受限，请选择小于3M的图片');
				_errorFileNum=0;
			}
		});
		_itemUploader.on('error',function(type,max,file){
			if('F_EXCEED_SIZE' == type){
				_errorFileNum++;
			}
			if('Q_EXCEED_NUM_LIMIT' == type){
				_common.showMsg('最多选择'+max+'张图片');
			}
			
		});

		//初始化题目图片选择
		var _titleUploader = WebUploader.create({
			// swf文件路径
			swf: './plugin/webuploader/Uploader.swf',
			// 文件接收服务端。
			server: _common.UPLOADSERVICE+'/webapp/comm/upload?app=survey&uuid='+_common.getUuid()+'&schoolCode='+_common.getSchoolCode(),
			// 选择文件的按钮。可选。
			pick: {
				id : titleDom[0],
				multiple : false
			},
			accept: {
				title: 'Images',
				extensions: 'gif,jpg,jpeg,bmp,png',
				mimeTypes: 'image/*'
			},
			//上次并发数
			threads : 1,
			//队列上传数
			fileNumLimit: 1,
			//单个文件大小限制
			fileSingleSizeLimit: 3 * 1024 * 1024,
			thumb: {
				width: 400,
				height: 200,
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
		_titleUploader.on('uploadBeforeSend', function(object, data, headers){
			if('flash'==_titleUploader.predictRuntimeType()){
				headers['Accept'] = '*/*';
			}
		});
		_titleUploader.on('fileQueued',function(file){
			_titleUploader.makeThumb( file, function( error, ret ) {
				if ( error ) {
					
				} else {
					var item = title.find('.question_title_imgcon');
					item.html('<a href="javascript:;" class="bt_quss_bigimg"><div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><img src="'+ret+'" /></a><a href="javascript:;" data-unique="'+unique+'" class="bt_quss_del">删除</a>');
					item.attr({
						'data-name' : file.name,
						'data-id' : file.id,
						'data-url' : ''
					}).show();
				}
			});
		});
		_titleUploader.on('filesQueued',function(){
			//do nothing
		});
		_titleUploader.on('error',function(type,max,file){
			if('F_EXCEED_SIZE' == type){
				_common.showMsg('你已经选择图片');
			}
			if('Q_EXCEED_NUM_LIMIT' == type){
				_common.showMsg('最多选择'+max+'张图片');
			}
			if(type =='F_EXCEED_SIZE'){
				_common.showMsg('部分文件大小受限，请选择小于3M的图片');
			}
		});
		
		//初始化图文题的选择
		var _picTitleUploader = WebUploader.create({
			// swf文件路径
			swf: './plugin/webuploader/Uploader.swf',
			// 文件接收服务端。
			server: _common.UPLOADSERVICE+'/webapp/comm/upload?app=survey&uuid='+_common.getUuid()+'&schoolCode='+_common.getSchoolCode(),
			// 选择文件的按钮。可选。
			pick: {
				id : picTitle[0],
				multiple : false
			},
			accept: {
				title: 'Images',
				extensions: 'gif,jpg,jpeg,bmp,png',
				mimeTypes: 'image/*'
			},
			//上次并发数
			threads : 1,
			//队列上传数
			fileNumLimit: 1,
			//单个文件大小限制
			fileSingleSizeLimit: 3 * 1024 * 1024,
			thumb: {
				width: 400,
				height: 200,
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
		_picTitleUploader.on('uploadBeforeSend', function(object, data, headers){
			if('flash'==_titleUploader.predictRuntimeType()){
				headers['Accept'] = '*/*';
			}
		});
		_picTitleUploader.on('fileQueued',function(file){
			_titleUploader.makeThumb( file, function( error, ret ) {
				if ( error ) {
					
				} else {
					var item = title.find('.add_con_div1 .bt_quss_addimg');
					var html = new Array();
					html.push('<div class="add_pic_tit" style="position:relative;display:inline-block;margin-right:25px;" data-id="'+file.id+'">');
					html.push('    <a href="javascript:;" class="bt_quss_del" data-unique="'+unique+'">删除</a>');
					html.push('    <a href="javascript:;" class="bt_quss_img question_item_imgcon">');
					html.push('        <div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><img src="'+ret+'" />');
					html.push('    </a>');
					html.push('</div>');
					item.before(html.join(''));
				}
			});
		});
		_picTitleUploader.on('filesQueued',function(){
			//do nothing
		});
		_picTitleUploader.on('error',function(type,max,file){
			if('F_EXCEED_SIZE' == type){
				_common.showMsg('你已经选择图片');
			}
			if('Q_EXCEED_NUM_LIMIT' == type){
				_common.showMsg('最多选择'+max+'张图片');
			}
			if(type =='F_EXCEED_SIZE'){
				_common.showMsg('部分文件大小受限，请选择小于3M的图片');
			}
		});

		title.data('itemUploader',_itemUploader);
		title.data('titleUploader',_titleUploader);
		title.data('picTitleUploader',_picTitleUploader);
	}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//提交前上传图片
	function submitUploadImgs(questions,callback){
		var titles = $('#titleList .ques_box');
		var uploaderNum = 2 * $('#titleList .ques_box[data-type=2]').size() + $('#titleList .ques_box[data-type=3]').size();

		if(uploaderNum <=0){
			//没有图片题目
			_checkFinish();
		}

		titles.each(function(index,obj){
			var _this = $(this);
			var title = _this;
			if('2' == questions[index].type){
				//图片类型题目
				var itemUploader = _this.data('itemUploader');
				var titleUploader = _this.data('titleUploader');

				var itemSize = itemUploader.getFiles().length;
				var titleSize = titleUploader.getFiles().length;

				_this.find('.uploadnum').html('0%');
				
				//http协议进度不可预计，纯粹为了交互，伪造上传进度
				itemUploader && itemUploader.on('uploadStart',function(file){
					var fileobj = title.find('.add_con [data-id="'+file.id+'"]');
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
						//console&&console.log('debug:progress:'+file.id +' : '+_upObj.now);
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
						console.log("_upObj.now:"+_upObj.now);
						if(_upObj.now>=100){
							_upObj.timer && clearInterval(_upObj.timer);
							fileobj.find('.uploadprogress').hide();
							_upObj = null;
							//这里检查提交
							itemSize--;
							if(itemSize <=0){
								_checkFinish();
							}
						}
					},1000);
					fileobj.data('upObj',_upObj);
				});
				itemUploader && itemUploader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = title.find('.add_con [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					var upObj = fileobj.data('upObj');
					upObj&&(upObj.finish = true);
				});
				itemUploader && itemUploader.on('uploadFinished',function(){
					//all is finished
				});

				titleUploader && titleUploader.on('uploadStart',function(file){
					var fileobj = title.find('.add_tit [data-id="'+file.id+'"]');
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
							'height' : (100-_upObj.now)+'%' ,
							'margin-top' : _upObj.now/2 +'%'
						});
						if(_upObj.now>=100){
							_upObj.timer && clearInterval(_upObj.timer);
							fileobj.find('.uploadprogress').hide();
							_upObj = null;
							//这里检查提交
							titleSize--;
							if(titleSize <=0){
								_checkFinish();
							}
						}
					},1000);
					fileobj.data('upObj',_upObj);
				});
				titleUploader && titleUploader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = title.find('.add_tit [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					var upObj = fileobj.data('upObj');
					upObj&&(upObj.finish = true);
				});
				titleUploader && titleUploader.on('uploadFinished',function(){
					//all is finished
				});

				//触发上传
				if(itemUploader && itemSize > 0){
					itemUploader.upload();
				}else{
					//理论上这里不会执行
					uploaderNum--;
				}
				if(titleUploader && titleSize > 0){
					titleUploader.upload();
				}else{
					uploaderNum--;
				}
				//理论上下面的代码不会执行
				if(uploaderNum <=0){
					_checkFinish();
				}

			}
			if('3' == questions[index].type){				
				//图文类型题目
				var titleUploader = _this.data('picTitleUploader');

				var titleSize = titleUploader.getFiles().length;
				_this.find('.uploadnum').html('0%');
				
				

				titleUploader && titleUploader.on('uploadStart',function(file){
					var fileobj = title.find('.add_con_div1 [data-id="'+file.id+'"]');
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
							'height' : (100-(_upObj.now/1.5))+'%' ,
							'margin-top' : _upObj.now/1.5 +'%'
						});
						console.log("_upObj.now:"+_upObj.now);
						if(_upObj.now>=100){
							_upObj.timer && clearInterval(_upObj.timer);
							fileobj.find('.uploadprogress').hide();
							_upObj = null;
							//这里检查提交
							titleSize--;
							if(titleSize <=0){
								_checkFinish();
							}
						}
						
					},1000);
					fileobj.data('upObj',_upObj);
				});
				titleUploader && titleUploader.on('uploadSuccess',function(file,response){
					var rtn = response;
					var fileobj = title.find('.add_con_div1 [data-id="'+file.id+'"]');
					fileobj.attr('data-url',rtn.url);
					var upObj = fileobj.data('upObj');
					upObj&&(upObj.finish = true);
				});
				titleUploader && titleUploader.on('uploadFinished',function(){
					//all is finished
				});

				//触发上传
				
				if(titleUploader && titleSize > 0){
					titleUploader.upload();
				}else{
					uploaderNum--;
				}
				//理论上下面的代码不会执行
				if(uploaderNum <=0){
					_checkFinish();
				}

				
			}
		});



		//检查是否上传完毕
		function _checkFinish(){
			uploaderNum--;
			if(uploaderNum>0){
				return;
			}
			//所有已经上传完毕，填充url
			titles.each(function(index,obj){
				var title = $(this);
				var question = questions[index];
				if('2' == question.type){
					//选项图片
					var opts = title.find('.add_con .question_title_item');
					opts.each(function(index2,obj2){
						var _opt = $(this);
						var _url = _opt.attr('data-url');
						if(_url){
							question.options[index2].attachPicUrl = _url;
						}
					});
					//题目图片
					var timuUrl = title.find('.add_tit .question_title_imgcon').attr('data-url');
					if(timuUrl){
						question.attachPicUrl = timuUrl;
					}
				}
				if('3' == question.type){
						question.attachPicUrl = title.find('.add_con_div1 .add_pic_tit').attr('data-url');
				}
			});

			//填充完毕，调用callback
			callback && callback(questions);
		}
	}


	//初始化发布
	var applying = false;
	function initSubmitBtn(){
		$('#submitBtn,#saveBtn').off().click(function(){
			if(applying){
				return;
			}

			var _this = $(this);

			var uuid =  _common.getUuid();
			if(!uuid){
				return;
			}
			var schoolCode = _common.getSchoolCode();
			if(!schoolCode){
				return;
			}
			var userName = _common.getUserName();
			if(!userName){
				return;
			}
			var surveyRang = quesType;
			var isLongTime ='1';
			$('#ques_deadLine a').each(function(){
				var _this = $(this);
				var spanCheck = _this.find('span');
				if(spanCheck.hasClass('op-radied')){
					isLongTime = spanCheck.attr('data-islongtime')
					return;
				}
			});
			
			var deadLine=isLongTime=='1'?'':(new Date($('#lastTime').html()).getTime());
			var canSeeResult = '1';
			$('#ques_canSee a').each(function(){
				var _this = $(this);
				var spanCheck = _this.find('span');
				if(spanCheck.hasClass('op-radied')){
					canSeeResult = spanCheck.attr('data-cansee')
					return;
				}
			});
			var sendTarget = $('#selectTargetBtn').data('sendTarget');
			if(quesType == '1'){
				if(!sendTarget || sendTarget.length<=0 ){
					_common.showMsg('请选择发送对象');
					return false;
				}
			}
			
			var subject = $('#questionTheme').val();
			if(!subject || '请输入' == subject){
				_common.showMsg('请输入问卷主题');
				return false;
			}
			subject = _common.filterXss(subject);
			var remark = $('#content').val();
			if(!remark || '请输入' == remark){
				_common.showMsg('请输入问卷介绍');
				return false;
			}
			remark = _common.filterXss(remark);
			//每个问题
			var flag = true;
			
			var titles = $('#titleList .ques_box');

			//隐藏删除/添加按钮
			stopHandle();

			var questions = new Array();

			titles.each(function(index,obj){
				var _this = $(obj);
				var question = {};
				var type = question.type = _this.attr('data-type');
				var answerType = question.answerType = _this.find('.add_type .op-radied').attr('data-answertype');
				//question.sign =  _this.find('.tit .op-radied').attr('data-sign');
				if(!answerType){
					if(type == 1){
						answerType = question.answerType = 3;
					}else if(type == 3){
						answerType = question.answerType = -1;
					}
				}
				if(_this.find('a.ques-operate span').length >0 ){
					//页面上有“是否记名”的按钮
					if(_this.find('a.ques-operate span').hasClass('op-check')){
						question.sign = '0';
					}else{
						question.sign = '1';
					}
				}else{
					//页面上无“是否记名”的按钮
					question.sign = '';
				}
				var title = _this.find('.question_title_input').val();
				if(!title || '请输入' == title){
					_common.showMsg('请输入问题'+(index+1)+'的题目');
					flag = false;
					return false;
				}
				title = _common.filterXss(title);
				question.questContent = title;

				//检查选项个数
				var _options = _this.find('.question_item_input');
				var _optvals = [];
				_options.each(function(index2,obj2){
					var opt = $(obj2).val();
					opt = _common.filterXss(opt);
					if('1' == type && opt && ''!=$.trim(opt) && '请输入' != opt){
						//文字题必须有字才算一个选项
						_optvals.push({'optContent':$.trim(opt)});
					}else if('2' == type){
						//图片题只要有则认为是正确选项，文字可不填
						_optvals.push({'optContent':$.trim(opt)});
					}
				});
				if(type == 1 || type == 2){
					if(answerType !=3){
						if(_optvals.length <2){
							_common.showMsg('问题'+(index+1)+'最少需要两个有效选项');
							flag = false;
							return false;
						}
					}
					
				}
				
				question.options = _optvals;

				//加入到问题列表
				questions.push(question);
			});

			if(!flag || questions.length<=0){
				resumeHandle();
				//前端校验不通过
				return;
			}
			if(applying){
				return;
			}
			
			applying = true;
			//修改样式
			$('#saveBtn,#submitBtn').hide();
			$('#savingBtn').show();
			_common.showProgress();

			//这里要上传图片
			submitUploadImgs(questions,function(questions){
				var params = {
					'uuid' : uuid,
					'schoolCode' : schoolCode,
					'sendTarget' : sendTarget,
					'subject' : subject,
					'remark' : remark,
					'questions' : questions,
					'userName' : userName,
					'publishState' : _this.attr('data-publishState'),
					'surveyUnique' : surveyUnique?surveyUnique:'',
					'surveyRang':parseInt(surveyRang),
					'isLongTime':parseInt(isLongTime),
					'deadLine':deadLine,
					'canSeeResult':parseInt(canSeeResult)
				};
				_common.post(_SERVICE+'/webapp/survey/add',params,function(rtn){
					applying = false;
					_common.hideProgress();
					if('001' == rtn.resultCode){
						//showCopyPop
						if(parseInt(surveyRang) == 2){
							if(params.publishState == '0'){
								_common.showMsg({
									msg :'保存成功',
									callback : function(){
										switchToList();
									}
								});
							}else{
								showCopyPop(rtn.surveyUnique,function(){
									_common.showMsg({
										msg : '复制成功',
										callback : function(){
											switchToList();
										}
									});
								});
							}
						}else{
							_common.showMsg({
								msg : '1'==params.publishState?'发布成功':'保存成功',
								callback : function(){
									switchToList();
								}
							});
						}
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_common.showMsg(rtn.resultMsg);
						$('#savingBtn').hide();
						$('#saveBtn,#submitBtn').show();
						resumeHandle();
					}
				});
				
			});
			return false;
		});
	}


	//发布禁用操早
	function stopHandle(){
		$('#titleList .ques_box').find('.bt_quss_del,.add_tit_img,.question_title_addimg,.question_title_additem,.question_title_deltitle').css({
			visibility : 'hidden'
		});
		$('#addTitleBtn').css({
			visibility : 'hidden'
		});
	}
	//重新允许处理
	function resumeHandle(){
		$('#titleList .ques_box').find('.bt_quss_del,.add_tit_img,.question_title_addimg,.question_title_additem,.question_title_deltitle').css({
			visibility : 'visible'
		});
		$('#addTitleBtn').css({
			visibility : 'visible'
		});
	}


	//发布成功后切换到列表
	function switchToList(){
		var _window = window;
		//窗口打开参数
		var options = {};
		options.key = 'questionlist';
		options.url = './question_list.html';
		options.title =  '问卷列表';
		options.callback = function(){
			//do nothing
		}
		window.parent.closeWin&&window.parent.closeWin({
			isSwitch : true,
			callback : function(){
				_window.parent.openWin&&_window.parent.openWin(options);
			}
		});
	}


	//查询中间状态
	function queryMiddleStatus(surveyUnique,callback){
		var params = {
			'uuid' : _common.getUuid(),
			'schoolCode' : _common.getSchoolCode(),
			'surveyUnique' : surveyUnique
		};
		_common.post(_SERVICE+'/webapp/survey/edit',params,function(rtn){
			applying = false;
			if('001' == rtn.resultCode){
				initMiddleStatus(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
			callback && callback()
		});
	}

	//根据草稿初始化数据
	function initMiddleStatus(data){
		//对象选择,实际只会有班级
		var number = 0;
		for(var i=0;i<data.sendTarget.length;i++){
			var item = data.sendTarget[i];
			if('2' == item.type || '4' == item.type){
				//班级
				var clas = $('.classlist a[data-classid="'+item.pkuid+'"]');
				//clas.find('span').trigger('click');
				clas.trigger('click');
				number += clas.next().find('a').size();
			}else{
				//do nothing
			}
		}
		$('#selectTargetBtn').data('sendTarget',data.sendTarget).val('(已选'+number+'人)');

		//主题
		$('#questionTheme').val(data.subject);
		//介绍
		$('#content').val(data.remark);
		//问卷时限
		if(data.isLongTime== 2){
			$('#ques_deadLine a').first().next().click();
			$('#lastTime').html(qt_util.formatDate(data.deadLine,'yyyy-MM-dd hh:mm'));
		}
		//投票可见
		if(data.canSeeResult == 2){
			$('#ques_canSee a').first().next().click();
		}

		//逐个问题处理
		for(var i=0;i<data.questions.length;i++){
			
			var question = data.questions[i];
			var type=question.type;
			if(question.type == 1 && question.answerType == 3){
				type = 3;
			}else if(question.type == 3 && question.answerType == -1){
				type=4;
			}
			addBlankTitle(type,function(unique){
				var title = $('#titleList [data-unique='+unique+']');
				title.find('.question_title_input').val(question.questContent);
				//插入空白选项
				var needLen = question.options.length;
				if('1' == question.type){
					needLen = needLen-2;
				}
				for(var j=0;j<needLen;j++){
					addBlankItem(unique);
				}

				//填充数据
				var iteminputs = title.find('.question_item_input');
				var itemimgs = title.find('.add_con img');
				itemimgs.on('load',function(){
					winFixImg(this);
				}).on('error',function(){
					winErrorImg(this);
				});
				for(var j=0;j<question.options.length;j++){
					var opt = question.options[j];
					iteminputs.eq(j).val(opt.optContent);
					itemimgs.eq(j).attr({
						'src':_IMG_PREFIX + opt.attachPicUrl,
						'data-url':opt.attachPicUrl
					});
					itemimgs.eq(j).parent().parent().attr({
						'data-name' : opt.attachPicUrl,
						'data-url':opt.attachPicUrl
					});

				}
				//处理问题,图文的 图片
				if(question.attachPicUrl){
					if(question.type == 3 && question.answerType ==-1){		
						var picParent = title.find('.add_con_div1');
						var item = title.find('.add_con_div1 .bt_quss_addimg');
						
						var html = new Array();
						html.push('<div class="add_pic_tit" style="position:relative;display:inline-block;margin-right:25px;" data-id="">');
						html.push('    <a href="javascript:;" class="bt_quss_del" data-unique="'+unique+'">删除</a>');
						html.push('    <a href="javascript:;" class="bt_quss_img question_item_imgcon">');
						html.push('        <div class="uploadprogress"><div class="uploadbg"></div><div class="uploadnum">0%</div></div><img src="'+_IMG_PREFIX+question.attachPicUrl+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/>');
						html.push('    </a>');
						html.push('</div>');
						item.before(html.join(''));
						picParent.find('.add_pic_tit').attr('data-url',question.attachPicUrl);
						
					}else{
						var span = title.find('.question_title_imgcon').html('<a href="javascript:;" class="bt_quss_bigimg"><img src="'+_IMG_PREFIX+question.attachPicUrl+'" onload="winFixImg(this);" onerror="winErrorImg(this);"></a><a href="javascript:;" data-unique="'+unique+'" class="bt_quss_del">删除</a>');
						span.attr('data-url',question.attachPicUrl).show();
					}
					
				}				

				//处理单选多选
				title.find('.add_type span[data-answertype='+question.answerType+']').trigger('click');

				//处理是否记名
				//title.find('.tit span[data-sign='+question.sign+']').trigger('click');
				if(question.sign == 1){
					title.find('.add_con a.ques-operate,.add_con1 a.ques-operate,.con a.ques-operate').trigger('click');
				}
				//图片类型，初始化上传控件
				if('2' == question.type || '3' == question.type){
					initPicTitleUpload(unique);
				}

			});
		}
	}



	//更新滚动条
	function updateScrollBar(){
		 var slides = $('.qt-slide-wrap > div');
		 slides.each(function(index,obj){
			var scrollobj = $(obj).getNiceScroll();
			scrollobj.each(function(){
				this.resize();
			})
		})
	}





	//业务入口
	initSlide();
	//initContent();
	initQuestion();
	initSubmitBtn();


	//判断是否处于编辑状态
	var surveyUnique = qt_util.P('surveyUnique');
	var quesType = qt_util.P('type');//问卷类型	
	window.parent.setWinTitle&&window.parent.setWinTitle('新建'+(quesType==1?'校内':'公开')+'问卷');
	if(quesType == '2'){
		$('#ques_sendTarget').hide();
	}
	if(surveyUnique){
		_common.showProgress();
		initTargetSelect(function(){
			queryMiddleStatus(surveyUnique,function(){
				_common.hideProgress();
			});
		});
	}else{
		initTargetSelect();
		addBlankTitle(1);
	}
	
	//弹出复制链接弹层
	function showCopyPop(targetUuid,cback){
		var box = $('#ques_copy_pop');
		var _SERVICE = 'https://'+location.hostname;
		$('#copy_content').val(_SERVICE +'/fronts/xywh/html/survey/note_open.html?nu=' + targetUuid);
		//关闭按钮
		box.off().on('click','.botton_guanbi',function(){
			box.popupClose();
			switchToList();
		});
		
		//确定按钮
		$('#copy_link').off().on('click',function(){
			setTimeout(function(){
				box.popupClose();
			},10);
			cback && cback();
		});
		box.popupOpen({
			maskOpacity : 0
		});
	}
	//----------------------------- 测试代码 --------------------------------//


	module.exports = qt_model;

});
