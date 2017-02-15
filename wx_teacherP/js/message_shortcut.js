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

	var $ = require('jquery');
	var qt_util = require('qt/util');
	var _common = require('./common');
	require('jquery/nicescroll');
	require('jquery/json');


	//服务
	var _SERVICE = _common.SERVICE;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//window引用，防止回掉中指针出错
	var _window = window;


	//查询本地缓存
	var _cache = [];
	//_cache的map映射，key是唯一id
	var _cacheMap = {};
	function handleLocalStorage(){
		if(!window.localStorage){
			return;
		}
		//填入原来的数据
		var _local = localStorage.getItem("message_shortcut"+_common.getUuid());
		if(_local){
			//如果有记录
			_cache = $.evalJSON(_local);
			if(!_cache){
				_cache = [];
			}
			var html = new Array();
			for(var i=0;i<_cache.length;i++){
				var word = _cache[i];
				_cacheMap[word.noticeUnique] = word;
				html.push('<dl data-messageid="'+word.noticeUnique+'">');
				html.push('<dt><img src="'+(word.icon?word.icon:_common.getDefaultHeadUrl())+'" onerror="this.src=\'./images/user_pace.png\';"/>'+word.name+'</dt>');
				html.push('<dd class="tit">'+word.content+'</dd>');
				html.push('<dd class="con"><span class="font_r"><b>未回复</b></span>'+word.createTime+'</dd>');
				html.push('</dl>');
			}
			$('#messageList').append(html.join(''));
		}
		
		//绑定unload事件，写缓存
		window.onunload = function(){
			localStorage.removeItem("message_shortcut"+_common.getUuid());
			var _temp = [];
			for(var i=0;i<_cache.length;i++){
				var word = _cache[i];
				if(_cacheMap[word.noticeUnique]){
					_temp.push(word);
				}
			}
			if(_temp.length >0){
				localStorage.setItem("message_shortcut"+_common.getUuid(),''+$.toJSON(_temp));
			}
		}
	}

	//标识接口是否没有数据
	var noDataFlag = {
		'leave':false,//标识请假是否没有数据
		'msg' :false//标识消息是否没有数据
	};

	
	//初始化通知
	function initNotice(){
		//绑定通知按钮
		$('#noticeList').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'noticelist';
			options.url = './notice_list.html';
			options.title =  '通知列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			return false;
		});

		$('#noticeLatest').click(function(){
			var detailid = $(this).attr('data-detailid');
			//窗口打开参数
			var options = {};
			options.key = 'noticelist';
			options.url = './notice_list.html?detailid='+detailid;
			options.title =  '通知详情';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			return false;
		});
	}
	//初始化作业
	function initHomework(){
		//绑定作业按钮
		$('#homeworkList').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'homeworklist';
			options.url = './homework_list.html';
			options.title =  '作业列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			return false;
		});
		$('#homeworkLatest').click(function(){
			var detailid = $(this).attr('data-detailid');
			//窗口打开参数
			var options = {};
			options.key = 'homeworklist';
			options.url = './homework_list.html?detailid='+detailid;
			options.title =  '作业详情';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			return false;
		});
	}
	//初始化请假
	function initLeave(){
		if(!_common.getFuncs('qingjia')){
			noDataFlag.leave=true;
			return;
		}
		//绑定作业按钮
		$('#leaveLatest').click(function(){
			//窗口打开参数
			var options = {};
			options.key = 'leavelist';
			options.url = './leave_list.html';
			options.title =  '请假列表';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			return false;
		});


		//查询最近请假
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
		_common.post(_SERVICE+'/webapp/leave/getUnconfirmedLeaveinfo',params,function(rtn){
			noDataFlag.leave = true;
			if('001' == rtn.resultCode){
				var item = rtn;

				if(0 == item.state){
					$('#leave_content').html(item.content);
					$('#leave_info').html('<span class="font_r"><b>未处理</b></span>'+item.createTime);
					$('#leaveLatest').show();
					noDataFlag.leave = false;
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
			checkNoData();
		});
	}

	//初始化消息
	function initMsg(){
		$('#messageList').on('click','[data-messageid]',function(){
			var detailid = $(this).attr('data-messageid');
			//窗口打开参数
			var options = {};
			options.key = 'messagelist';
			options.url = './message_list.html?detailid='+detailid;
			options.title =  '留言详情';
			options.callback = function(){
				//do nothing
			}
			window.parent.closeWin&&window.parent.closeWin({
				isSwitch : true,
				callback : function(){
					_window.parent.openWin&&_window.parent.openWin(options);
				}
			});
			$(this).remove();
			_cacheMap[detailid] = null;

			var msgs = $('#messageList [data-messageid]');
			if(msgs.size()<=0){
				_cache = [];
				_getLatestInfo();
			}
			return false;
		});
	}

	//初始化最新消息（定时轮询）
	function initLatestMsg(){
		setInterval(function(){
			_getLatestInfo();
		},45000);
		_getLatestInfo();
	}

	//真正查询最新信息
	function _getLatestInfo(){
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
		_common.post(_SERVICE+'/webapp/msg/renewal',params,function(rtn){
			if('001' == rtn.resultCode){
				var tz = rtn.tz;
				if(tz && _common.getFuncs('notice')){
					$('#notice_content').html(tz.content);
					$('#notice_info').html('<span>已读/未读：<b>'+tz.readed+'/'+tz.unRead+'</b></span>'+tz.createTime);
					$('#noticeLatest').attr('data-detailid',tz.noticeUnique).show();
				}
				var hw = rtn.hw;
				if(hw && _common.getFuncs('homework')){
					$('#homework_content').html(hw.content);
					$('#homework_info').html('<span>已读/未读：<b>'+hw.readed+'/'+hw.unRead+'</b></span>'+hw.createTime);
					$('#homeworkLatest').attr('data-detailid',hw.noticeUnique).show();
				}

				var words = rtn.words;
				if(words){
					//清除之前的
					//$('#messageList [data-messageid]').remove();
					//插入最近的
					var html = new Array();
					var newsArr = new Array();
					for(var i=0;i<words.length;i++){
						var word = words[i];
						//消息未添加过才添加
						//var exist = $('#messageList dl[data-messageid="'+word.noticeUnique+'"]');
						//if(exist.size() <=0){
						var exist = _cacheMap[word.noticeUnique];
						if(!exist){
							_cacheMap[word.noticeUnique] = word;
							newsArr.push(word);

							html.push('<dl data-messageid="'+word.noticeUnique+'">');
							html.push('<dt><img src="'+(word.icon?word.icon:_common.getDefaultHeadUrl())+'" onerror="this.src=\'./images/user_pace.png\';"/>'+word.name+'</dt>');
							html.push('<dd class="tit">'+word.content+'</dd>');
							html.push('<dd class="con"><span class="font_r"><b>未回复</b></span>'+word.createTime+'</dd>');
							html.push('</dl>');
						}
					}
					if(newsArr.length>0){
						_cache = newsArr.concat(_cache);
					}
					//$('#messageList').append(html.join(''));
					$('#leaveLatest').after(html.join(''));
				}

				/*
				if((!_cache || _cache.length<=0) && (!tz || !_common.getFuncs('notice')) && (!hw || !_common.getFuncs('homework')) && (!words ||words.length<=0)){
					noDataFlag['msg'] = true;
				}else{
					noDataFlag['msg'] = false;
				}
				*/

				if((_cache && _cache.length>0) || (_common.getFuncs('notice') && tz) || (_common.getFuncs('homework') && hw) || (words && words.length>0)){
					noDataFlag['msg'] = false;
				}else{
					noDataFlag['msg'] = true;
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
			checkNoData();
		});
	}

	//向父窗口注册监听函数
	function regListener(){
		parent.regListener&&parent.regListener({
			id : 'message_shortcut',
			callback : function(data){
				_getLatestInfo();
			}
		});
	}


	//检查是否没有数据
	function checkNoData(){
		var showNoData = true;
		for(var key in noDataFlag){
			showNoData = showNoData && noDataFlag[key];
		}
		if(true === showNoData){
			$('#messageList').hide();
			$('#noData').show();
		}
		updateScrollBar();
	}

	//业务入口
	handleLocalStorage();
	initNotice();
	initHomework();
	initLeave();
		//initLatestMsg();
	initMsg();
	regListener();
	initScrollBar();


	//初始化滚动条
	function initScrollBar(){
		var viewport = $('.nicescrollContainer');
		viewport.css({
			'height':qt_util.P('h')+'px',
			'overflow':'hidden'
		});
		viewport.niceScroll(viewport.find('.nicescrollWrapper'),{
			cursorcolor:'#ccc',
			cursorwidth:'8px',
			cursorminheight:100,
			scrollspeed:60,
			mousescrollstep:60,
			autohidemode:'leave',
			bouncescroll:false
		});
	}
	
	//更新滚动条
	function updateScrollBar(){
		$('.nicescrollContainer').getNiceScroll().resize();
	}

	module.exports = qt_model;

});
