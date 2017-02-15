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


	//服务
	var _SERVICE = _common.SERVICE;


	//获取窗口大小
	var winSize = qt_util.getViewSize();


	//初始化页面切换
	var _slideobj = null;
	function initSlide(initIndex){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		_slideobj = qt_ui.slide({id:'qtslide',initIndex:(initIndex?initIndex:0)});
		//自定义滚动条
		var _nociscroll = null;
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
			if(!_nociscroll){
				_nociscroll = obj;
			}
		})
		//方便调试
		window.goLeft = function(){
			_slideobj.left();
		}
		window.goRight = function(){
			_slideobj.right();
		}

        //动态加载
		if(_nociscroll){
			var niceobj = $(_nociscroll).getNiceScroll(0);
			niceobj.onscrollend=function(info){
				//console.log(niceobj.page.maxh);
				//console.log($.toJSON(info));
				if(info.end.y + 100 >= niceobj.page.maxh ){
					loadNextPage();
				}
			}
		}
	}



	//获取通知列表（分页）
	var _PAGESIZE = 20;
	var _listCache = {};
	var _PAGENO = 0;
	var _listLoading = false;
	function getHomeworkList(pageno){
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
			'pageSize' : _PAGESIZE,
			'page' : pageno
		};
		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/homework/list',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					if(!_listCache[''+item.noticeUnique]){
						//没有加载过的才进行插入
						html.push('<li data-noticeid="'+item.noticeUnique+'">');
						html.push('<h2>'+item.createTime+'</h2>');
						html.push('<p>');
						html.push('<span><b>'+item.title+'</b><br/>');
						html.push('<a href="javascript:;" data-noticeid="'+item.noticeUnique+'">'+item.content+'</a>');
						if(item.attachment.length >0){
							//有图片
							html.push('<br/>');
							for(var j=0;j<item.attachment.length;j++){
								var img = item.attachment[j];
								if(1 == img.type){
									html.push('<a href="javascript:;" class="imgwrapper"><img src="'+img.url+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
								}
							}
						}
						html.push('</span>');

						var _subHtml = new Array();
						for(var j=0;j<item.sentTarget.length;j++){
							var target = item.sentTarget[j];
							_subHtml.push(target.name);
						}
						html.push('发给：'+_subHtml.join('、'));
						html.push('（共'+(item.doneNum+item.unDoneNum)+'人）<br/>');
						html.push('已读/未读：<em>'+item.readNum+'/'+item.unReadNum+'</em>');
						html.push('<a class="bt_det" href="javascript:;" data-noticeid="'+item.noticeUnique+'">详细</a>');
						html.push('</p>');
						html.push('</li>');
						_listCache[''+item.noticeUnique] = 1;
					}
				}
				$('#noticeList').append(html.join(''));

				//切换数据
				if(1 == pageno && items.length<=0){
					$('#noticeList').hide();
					$('#noData').show().find('a').off().click(function(){
						parent&&parent.setWinTitle&&parent.setWinTitle('发作业');
						location.href='./homework_send.html';
					});
					$('#mainPage').css({'background':'#fff'});
				}

				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_PAGENO = pageno;
				}

				//绑定点击事件
				$('#noticeList a').off().click(function(){
					var noticeid = $(this).attr('data-noticeid');
					if(!noticeid){
						return;
					}
					loadHomeworkDetail(noticeid);
				});



			
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	//加载下一页
	function loadNextPage(){
		if(_listLoading){
			return;
		}
		getHomeworkList((_PAGENO +1));
	}


	//加载并显示
	var _loading = false;
	function loadHomeworkDetail(noticeid,isNotSwitch){
		if(_loading){
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
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'noticeUnique' : noticeid
		};
		_loading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/homework/detail',params,function(rtn){
			_loading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				$('#detail_resend').attr('data-noticeid',noticeid);
				var item = rtn;

				$('#detail_time').html(_common.getUserName() + _common.getRoleName() + ' '+ item.createTime);
				$('#detail_subject').html(item.title);

				var html = new Array();
				html.push(item.content);
				html.push('<br/>');
				var imgs = [];
				var files = [];
				if(item.attachment.length >0){
					//有图片或者附件
					for(var j=0;j<item.attachment.length;j++){
						var img = item.attachment[j];
						if(1 == img.type){
							imgs.push(img);
						}else if(2 == img.type){
							files.push(img);
						}
					}
				}
				if(imgs.length >0){
					html.push('<p>');
					for(var i=0;i<imgs.length;i++){
						html.push('<a class="img_narrow" href="javascript:;"><img src="'+imgs[i].url+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
					}
					html.push('</p>');
				}
				if(files.length >0){
					for(var i=0;i<files.length;i++){
						html.push('<div class="down_file">');
						html.push('<img src="images/ico_word.gif" />'+files[i].name);
						html.push('<span><a href="'+files[i].url+'" target="_blank"class="btn btn_grey">下载</a></span>');
						html.push('</div>');
					}
				}
				$('#detail_info').html(html.join(''));


				html = new Array();
				var _subHtml = new Array();
				for(var j=0;j<item.sentTarget.length;j++){
					var target = item.sentTarget[j];
					_subHtml.push(target.name);
				}
				html.push('发给：'+_subHtml.join('、'));
				html.push('（共'+(item.doneNum+item.unDoneNum)+'人）');
				$('#detail_target').html(html.join(''));


				//填充未读
				var html = new Array();
				for(var i=0;i<item.unReadMen.length;i++){
					var student = item.unReadMen[i];
					html.push('<a href="javascript:;" class="operate-btn"><span class="op-check" data-suuid="'+student.suuid+'" data-name="'+student.name+'"></span>'+student.name+'</a>');
				}
				if(html.length <=0){
					$('#detail_unreadlist').html('<a href="javascript:;" class="operate-btn" style="height:21px;">全部人员已读</a>').hide();
				}else{
					$('#detail_unreadlist').html(html.join('')).show();
				}
				$('#detail_selectall').removeClass('op-checked').addClass('op-check').data('checked','0');
				$('#detail_unreadnum').html('未读（'+item.unReadNum+'人）');
				$('#detail_unread').data('fold','0').off().click(function(){
					var _this = $(this);
					var _list = $('#detail_unreadlist');
					if('1' == _this.data('fold')){
						/*
						$('#detail_unreadlist').slideDown('fast',function(){
							if(item.unReadNum > 0){
								$('#detail_resendBars').show();
							}
						});
						*/
						_list.css('height','0px').show();
						_list.animate({height:_list.attr('data-height')+'px'},200,function(){
							if(item.unReadNum > 0){
								$('#detail_resendBars').show();
							}
							updateScrollBar();
						});
						_this.data('fold','0');
						_this.find('.jt_down').removeClass('jt_down').addClass('jt_up');
					}else{
						$('#detail_resendBars').hide();
						//$('#detail_unreadlist').slideUp('fast');
						_list.animate({height:'0px'},200,function(){
							_list.hide();
							updateScrollBar();
						});
						_this.data('fold','1');
						_this.find('.jt_up').removeClass('jt_up').addClass('jt_down');
					}
				});

				//填充已读
				html = new Array();
				for(var i=0;i<item.readMen.length;i++){
					var student = item.readMen[i];
					html.push('<a href="javascript:;" class="operate-btn">'+student.name+'</a>');
				}
				if(html.length <=0){
					$('#detail_readlist').html('').hide();
				}else{
					$('#detail_readlist').html(html.join('')).show();
				}
				$('#detail_read').html('已读（'+item.readNum+'人）<span class="jt_down"></span>').data('fold','0');
				$('#detail_read').off().click(function(){
					var _this = $(this);
					var _list = $('#detail_readlist');
					if('1' == _this.data('fold')){
						//$('#detail_readlist').slideDown('fast');
						_list.css('height','0px').show();
						_list.animate({height:_list.attr('data-height')+'px'},200,function(){
							updateScrollBar();
						});
						_this.data('fold','0');
						_this.find('.jt_down').removeClass('jt_down').addClass('jt_up');
					}else{
						//$('#detail_readlist').slideUp('fast');
						_list.animate({height:'0px'},200,function(){
							_list.hide();
							updateScrollBar();
						});
						_this.data('fold','1');
						_this.find('.jt_up').removeClass('jt_up').addClass('jt_down');
					}
				});


				//填充已经完成
				html = new Array();
				for(var i=0;i<item.doneMen.length;i++){
					var student = item.doneMen[i];
					html.push('<a href="javascript:;" class="operate-btn">'+student.name+'</a>');
				}
				if(html.length <=0){
					$('#detail_donelist').html('').hide();
				}else{
					$('#detail_donelist').html(html.join('')).show();
				}
				$('#detail_done').html('已完成（'+item.doneNum+'人）<span class="jt_down"></span>').data('fold','0');
				$('#detail_done').off().click(function(){
					var _this = $(this);
					var _list = $('#detail_donelist');
					if('1' == _this.data('fold')){
						//$('#detail_donelist').slideDown('fast');
						_list.css('height','0px').show();
						_list.animate({height:_list.attr('data-height')+'px'},200,function(){
							updateScrollBar();
						});
						_this.data('fold','0');
						_this.find('.jt_down').removeClass('jt_down').addClass('jt_up');
					}else{
						//$('#detail_donelist').slideUp('fast');
						_list.animate({height:'0px'},200,function(){
							_list.hide();
							updateScrollBar();
						});
						_this.data('fold','1');
						_this.find('.jt_up').removeClass('jt_up').addClass('jt_down');
					}
				});
				
				//填充未完成
				html = new Array();
				for(var i=0;i<item.unDoneMen.length;i++){
					var student = item.unDoneMen[i];
					html.push('<a href="javascript:;" class="operate-btn">'+student.name+'</a>');
				}
				if(html.length <=0){
					$('#detail_undonelist').html('<a href="javascript:;" class="operate-btn" style="height:21px;">全部人员已完成</a>').hide();
				}else{
					$('#detail_undonelist').html(html.join('')).show();
				}
				$('#detail_undonenum').html('未完成（'+item.unDoneNum+'人）');
				$('#detail_undone').data('fold','0').off().click(function(){
					var _this = $(this);
					var _list = $('#detail_undonelist');
					if('1' == _this.data('fold')){
						//$('#detail_undonelist').slideDown('fast');
						_list.css('height','0px').show();
						_list.animate({height:_list.attr('data-height')+'px'},200,function(){
							updateScrollBar();
						});
						_this.data('fold','0');
						_this.find('.jt_down').removeClass('jt_down').addClass('jt_up');
					}else{
						//$('#detail_undonelist').slideUp('fast');
						_list.animate({height:'0px'},200,function(){
							_list.hide();
							updateScrollBar();
						});
						_this.data('fold','1');
						_this.find('.jt_up').removeClass('jt_up').addClass('jt_down');
					}
				});

				//兼容样式
				$('#readBox,#doneBox').find('.fs_list').each(function(){
					var _this = $(this);
					var as = _this.find('a');
					var len = as.size();
					var row = Math.ceil(len/3);
					var _height = row * 35;
					_this.css('height',_height+'px').attr('data-height',_height);
				});


				//绑定切换
				var tabs = $('.tb_tit a');
				tabs.attr('class','');
				tabs.eq(0).addClass('tb_l_sel');
				tabs.eq(1).addClass('tb_r');
				tabs.off().on('click',function(){
					var index = tabs.index(this);
					if(0 == index){
						//显示的是读取
						tabs.eq(0).attr('class','tb_l_sel');
						tabs.eq(1).attr('class','tb_r');
						$('#readBox').show();
						$('#doneBox').hide();
					}else{
						tabs.eq(0).attr('class','tb_l');
						tabs.eq(1).attr('class','tb_r_sel');
						$('#readBox').hide();
						$('#doneBox').show();
					}
				});
				$('#readBox').show();
				$('#doneBox').hide();

				//绑定勾选
				$('#detail_unreadlist .op-check').off().click(function(){
					var _this = $(this);
					if('1' == _this.data('checked')){
						_this.removeClass('op-checked').addClass('op-check').data('checked','0');
						//去掉全部的勾选
						$('#detail_selectall').removeClass('op-checked').addClass('op-check').data('checked','0');
					}else{
						_this.removeClass('op-check').addClass('op-checked').data('checked','1');
					}
				});


				//数据填充完成，切换界面
				(!isNotSwitch)&&switchToDetail();

			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}


	//切换到详情
	function switchToDetail(){
		_slideobj&&_slideobj.right();
		window.parent.setWinTitle&&window.parent.setWinTitle('作业详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('作业列表');
		});
	}


	//绑定重新发送
	function initResendBar(){
		//绑定全选
		$('#detail_selectall').off().click(function(){
			var _this = $(this);
			if('1' == _this.data('checked')){
				_this.removeClass('op-checked').addClass('op-check').data('checked','0');
				$('#detail_unreadlist span').removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				_this.removeClass('op-check').addClass('op-checked').data('checked','1');
				$('#detail_unreadlist span').removeClass('op-check').addClass('op-checked').data('checked','1');
			}
			return false;
		});
		//绑定重新发送
		$('#detail_resend').off().click(function(){
			var students = $('#detail_unreadlist .op-checked');
			if(students.size() <=0){
				return;
			}
			//获取数据，准备提交
			var uuid =  _common.getUuid();
			if(!uuid){
				return;
			}
			var schoolCode = _common.getSchoolCode();
			if(!schoolCode){
				return;
			}
			var noticeid = $('#detail_resend').attr('data-noticeid');
			if(!noticeid){
				return;
			}
			var sendTarget = [];
			students.each(function(index,obj){
				var _this = $(obj);
				sendTarget.push({
					Pkuid : _this.attr('data-suuid'),
					Name :_this.attr('data-name')
				});
			});
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'noticeUnique' : noticeid,
				'sendTarget' : sendTarget
			};
			
			_common.post(_SERVICE+'/webapp/homework/resend',params,function(rtn){
				if('001' == rtn.resultCode){
					_common.showMsg('重新提醒完成');
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
				}
			});
		
		});
	}

	//绑定预览大图
	function initShowImgs(){
		$('#noticeList').on('click','.imgwrapper',function(){
			var _this = $(this);
			var groups = _this.parent().find('.imgwrapper');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('src'));
			});
			_common.showImgs(urls,index);
		});

		$('#detail_info').on('click','.img_narrow',function(){
			var _this = $(this);
			var groups = _this.parent().find('.img_narrow');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('src'));
			});
			_common.showImgs(urls,index);
		});
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
	var detailid = qt_util.P('detailid');
	if(detailid){
		initSlide(1);
		loadHomeworkDetail(detailid,true);
		window.parent.setWinTitle&&window.parent.setWinTitle('作业详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('作业列表');
		});
	}else{
		initSlide();
	}
	getHomeworkList(1);
	initResendBar();
	initShowImgs();



	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
