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
		var slides = $('.nicescrollContainer').css({width:_width+'px',height:_height+'px'}).show();
		_slideobj = qt_ui.slide({id:'qtslide',initIndex:(initIndex?initIndex:0)});
		//自定义滚动条
		var _nociscroll = slides.eq(0);
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
		});
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
				if(info.end.y + 100 >= niceobj.page.maxh ){
					loadNextPage();
				}
			}
		}
	}


	//------------------------------列表相关 begin------------------------------//
	//初始化消息列表
	function initMessageList(){
		//绑定点击事件
		$('#msgList').off().on('click','[data-id]',function(){
			var messageid = $(this).attr('data-id');

			console.log(messageid);
			if(!messageid){
				return;
			}
			loadMessageDetail(messageid);
		});
	}



	//获取留言列表（分页）
	var _PAGETYPE = 1;//页面类型，1别人给我的留言，2我给别人留言
	var _PAGESIZE = 20;
	var _listCache = {};
	var _PAGENO = 0;
	var _listLoading = false;
	function getMessageList(pageno){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'pageSize' : _PAGESIZE,
			'page' : pageno,
			'type' : _PAGETYPE
		};
		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/words/list',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				fillMessageList(items);

				//没有任何数据
				if(1 == pageno && items.length<=0){
					$('#msgList').hide();
					$('#noData').show();
					$('#mainPage').css('background','#ffffff');
				}else{
					$('#msgList').show();
					$('#noData').hide();
					$('#mainPage').css('background','#f5f5f5');
				}
				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_PAGENO = pageno;
				}

				updateScrollBar();
			
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	//填充消息列表
	function fillMessageList(items){
		var html = new Array();
		for(var i=0;i<items.length;i++){
			var item = items[i];
			if(!_listCache[''+item.wordsUnique]){
				html.push('<div class="mess_box" id="msglist_'+item.wordsUnique+'">');
				//用户信息
				html.push('    <div class="from">');
				html.push('        <div class="title fl">');
				html.push('            '+(2==_PAGETYPE?'<span class="mess_for">给</span>':'')+'<span class="face_pic"><img src="'+(item.headPortraitUrl?item.headPortraitUrl:_common.getDefaultHeadUrl())+'"  /></span><b>'+item.name+'</b><br/>');
				if(2 == item.userType){
					//家长的留言
					html.push('            '+(item.className?item.className:'')+item.stuName+' 家长');
				}else{
					//教师的留言
					html.push('            教师');
				}
				html.push('        </div>');
				html.push('        <div class="time fl text_r">'+item.createTime+'</div>');
				html.push('    </div>');
				//留言内容
				html.push('    <div class="mess_tit"><a href="javascript:;" data-id="'+item.wordsUnique+'">'+item.content+'</a></div>');
				//图片列表
				if(item.attachment && item.attachment.length >0){
					//有图片
					html.push('<div class="imgwrapperRoot">');
					for(var j=0;j<item.attachment.length;j++){
						var img = item.attachment[j];
						if(1 == img.type){
							html.push('<a class="imgwrapper" href="javascript:;"><img src="'+img.url+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
						}
					}
					html.push('</div>');
				}
				//来源分析
				if(item.fromTopic){
					html.push('    <div class="mess_from"><b>'+item.fromTopic+'</b>'+item.from+'</div>');
				}
				//回复状态
				html.push('    <div class="mess_state">');
				html.push('        <span class="fl" style="display:none">');
				html.push('            <div class="mess_ip_box">');
				html.push('                <input class="input_mess" type="text" />');
				html.push('                <a href="javascript:;" class="mess_bt_blue">回复</a>');
				html.push('            </div>');
				html.push('        </span>');
				html.push('        <span data-id="'+item.wordsUnique+'" data-replyNum="'+item.replyNum+'"><a href="javascript:;" class="bt_mess">（'+item.replyNum+'）</a></span>');
				html.push('    </div>');

				html.push('    <a class="bt_det" href="javascript:;" data-id="'+item.wordsUnique+'">详细</a>');
				html.push('</div>');

				_listCache[''+item.wordsUnique] = 1;
			}
		}
		$('#msgList').append(html.join(''));
	}

	//加载下一页
	function loadNextPage(){
		if(_listLoading){
			return;
		}
		getMessageList((_PAGENO +1));
	}

	//------------------------------列表相关 end--------------------------------//


	//------------------------------详情相关 begin------------------------------//
	//加载并显示
	var _loading = false;
	function loadMessageDetail(messageid,isNotSwitch){
		if(_loading){
			return;
		}
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'wordsUnique' : messageid
		};
		_loading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/words/detail',params,function(rtn){
			_loading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){

				var detail = rtn.detail;
				$('#replyBtn').attr('data-messageid',detail.wordsUnique);
				$('#detail_time').html(''+detail.createTime);

				//填充信息
				var info = '<span class="face_pic"><img src="'+(detail.headPortraitUrl?detail.headPortraitUrl:_common.getDefaultHeadUrl())+'" /></span><b>'+detail.name+'</b><br/>';
				if(2 == detail.userType){
					//家长
					info = info + (detail.className?detail.className:'')+detail.stuName+' 家长';
				}else{
					//老师
					info = info +'教师';
				}
				$('#detail_info').html(info);

				$('#detail_content').html(detail.content);
				$('#detail_replynum').html('（'+detail.replyNum+'）');
				$('#detail_myicon').attr('src',_common.getHeadUrl());
				var html = new Array();

				if(detail.attachment && detail.attachment.length >0){
					//有图片
					for(var j=0;j<detail.attachment.length;j++){
						var img = detail.attachment[j];
						if(1 == img.type){
							html.push('<a href="javascript:;" class="imgwrapper"><img src="'+img.url+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
						}
					}
					$('#detail_imgs').html(html.join('')).show();
				}else{
					$('#detail_imgs').html('').hide();
				}
				html = new Array();
				for(var i=0;i<rtn.items.length;i++){
					var item = rtn.items[i];
					if(1 == item.iSaid){
						html.push('<p><span><img src="'+_common.getHeadUrl()+'"/></span><span '+(item.content.length>42?'class="multiline"':'')+'>'+item.content+'<br/><em>'+item.createTime+'</em></span></p>');
					}else{
						html.push('<p><span><img src="'+(item.headPortraitUrl?item.headPortraitUrl:_common.getDefaultHeadUrl())+'"/></span><span '+(item.content.length>42?'class="multiline"':'')+'>'+item.content+'<br/><em>'+item.createTime+'</em></span></p>');
					}
				}
				$('#list_state').find('p').remove();
				$('#list_state').find('hr').remove();
				$('#list_state').append(html.join('<hr/>'));

				updateScrollBar();
				
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
		window.parent.setWinTitle&&window.parent.setWinTitle('留言详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('留言列表');
		});
	}


	//初始化回复
	function initReply(){
		$('#replyBtn').off().click(function(){
			var reply = $('#replyText').val();
			if(!reply){
				return;
			}
			var messageid = $(this).attr('data-messageid');
			if(!messageid){
				return;
			}
			_realReply(messageid,reply,function(){
				$('#replyText').val('');
				loadMessageDetail(messageid,true);
			})
		});
	}

	//真正的回复
	function _realReply(messageid,content,callback){
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}
		if(!messageid){
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'wordsUnique' : messageid,
			'content' : content
		};
		_common.post(_SERVICE+'/webapp/words/reply',params,function(rtn){
			if('001' == rtn.resultCode){
				callback&&callback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	//------------------------------详情相关 end--------------------------------//


	//绑定预览大图
	function initShowImgs(){
		$('#msgList,#detail_imgs').on('click','.imgwrapper',function(){
			var _this = $(this);
			var groups = _this.parent().find('.imgwrapper');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('src'));
			});
			_common.showImgs(urls,index);
		});
	}

	//初始化留言类型切换
	function initTypeSwitch(){
		var type = qt_util.P('type');
		if('2' === type){
			//只有指明是我给家长时候才修改类型
			_PAGETYPE = 1
		}

		var tabs = 	$('#typetab a');
		tabs.click(function(){
			tabs.removeClass('sel');
			$(this).addClass('sel');

			var index = tabs.index(this)
			_PAGETYPE = 0==index?1:2;
			//清空状态
			var _PAGENO = 0;
			_listCache = {};
			$('#msgList').html('');
			updateScrollBar();
			getMessageList(1);
		});
	}

	//更新滚动条
	function updateScrollBar(){
		var slides = $('.nicescrollContainer');
		slides.each(function(index,obj){
			$(obj).getNiceScroll().resize();
		});
	}


	//业务入口
	var detailid = qt_util.P('detailid');
	if(detailid){
		initSlide(1);
		loadMessageDetail(detailid,true);
		window.parent.setWinTitle&&window.parent.setWinTitle('留言详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('留言列表');
		});
	}else{
		initSlide();
	}
	initMessageList();
	getMessageList(1);
	initReply();
	initShowImgs();
	initTypeSwitch();


	module.exports = qt_model;

});
