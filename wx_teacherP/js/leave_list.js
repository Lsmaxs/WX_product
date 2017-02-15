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


	//查询所有待处理的假条
	function queryLeave(){
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
			'flag' : 0,
			'pageSize' : 10000,
			'page' : 1
		};
		_common.post(_SERVICE+'/webapp/leave/list',params,function(rtn){
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					html.push('<div class="mess_box">');
					html.push('    <div class="from">');
					html.push('        <div class="title fl">');
					html.push('            <span class="face_pic"><img src="'+(item.icon?item.icon:_common.getDefaultHeadUrl())+'" onerror="this.src=\'./images/user_pace.png\'"/></span><b>'+item.parName+' 家长</b><br/>');
					html.push('            '+item.className+' '+item.stuName);
					html.push('        </div>');
					html.push('        <div class="time fl text_r">'+item.createTime+'</div>');
					html.push('    </div>');
					html.push('    <div class="mess_tit">');
					html.push('        <span>'+item.content+'</span>');
					html.push('        <p>');
					html.push('            开始时间：'+item.leaveStartTime+'('+item.weekStart+') <br/>');
					html.push('            结束时间：'+item.leaveEndTime+'('+item.weekEnd+')');
					html.push('            <span><b>'+item.number+'</b></span> ');
					html.push('        </p>');
					html.push('    </div>');
					html.push('    <div class="leave_bt" data-unique="'+item.leaveUnique+'">');
					html.push('        <a href="javascript:;" class="btn btn_blue">批准</a><a href="javascript:;" class="btn btn_blue_n">不批准</a>');
					html.push('    </div>');
					html.push('</div>');
				}
				$('#noHandleList').append(html.join(''));

				if(items.length <=0){
					$('#noHandleList_no').show();
				}else{
					$('#noHandleList_no').hide();
				}
				updateScrollBar();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});



		//绑定批阅按钮
		$('#noHandleList').on('click','.btn_blue',function(){
			var _this = $(this);
			var unique = _this.parent().attr('data-unique');
			if(!unique){
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
				'leaveUnique' : unique,
				'state' : 1
			};
			_common.post(_SERVICE+'/webapp/leave/updateState',params,function(rtn){
				if('001' == rtn.resultCode){
					location.reload();
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
				}
			});
		}).on('click','.btn_blue_n',function(){
			var _this = $(this);
			var unique = _this.parent().attr('data-unique');
			if(!unique){
				return;
			}
			showRejectBox(function(reason){
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
					'leaveUnique' : unique,
					'state' :2,
					'reason' : reason
				};
				_common.post(_SERVICE+'/webapp/leave/updateState',params,function(rtn){
					if('001' == rtn.resultCode){
						location.reload();
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_common.showMsg(rtn.resultMsg);
					}
				});
			});
		});

	}



	//获取通知列表（分页）
	var _PAGESIZE = 20;
	var _listCache = {};
	var _PAGENO = 0;
	var _listLoading = false;
	function getList(pageno){
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
			'flag' : 1,
			'pageSize' : _PAGESIZE,
			'page' : pageno
		};

		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/leave/list',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					if(!_listCache[''+item.leaveUnique]){
						var pass = 1 == item.state;
						//没有加载过的才进行插入
						html.push('<div class="mess_box">');
						html.push('    <div class="from">');
						html.push('        <div class="title fl">');
						html.push('            <span class="face_pic"><img src="'+(item.icon?item.icon:_common.getDefaultHeadUrl())+'" onerror="this.src=\'./images/user_pace.png\'"/></span><b>'+item.parName+' 家长</b><br/>');
						html.push('            '+item.className+' '+item.stuName);
						html.push('        </div>');
						html.push('        <div class="time fl text_r">'+item.createTime+'</div>');
						html.push('    </div>');
						html.push('    <div class="mess_tit1">'+item.content);
						html.push('        <p>');
						html.push('            开始时间：'+item.leaveStartTime+'('+item.weekStart+') <br/>');
						html.push('            结束时间：'+item.leaveEndTime+'('+item.weekEnd+')');
						html.push('            <span><b>'+item.number+'</b></span> ');
						html.push('        </p>');
						html.push('    </div>');
						html.push('    <div class="mess_state" >');
						html.push('        <div class="reftext_t">');
						html.push('            <span class="'+(pass?'pass_t':'nopass_t')+'">'+(pass?'已批准':'不批准')+'</span>'+(pass?'':item.reason));
						html.push('            <span class="time">'+item.dealTime+'</span>');
						html.push('        </div>');
						html.push('    </div>');
						html.push('</div>');

						_listCache[''+item.leaveUnique] = 1;
					}
				}
				$('#handleList').append(html.join(''));


				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_PAGENO = pageno;
				}

				//没有已经处理的数据
				if(1 == pageno && items.length<=0){
					$('#handleList_no').show();
				}else{
					$('#handleList_no').hide();
				}


				updateScrollBar();
				
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
		getList((_PAGENO +1));
	}



	//显示拒绝弹窗
	function showRejectBox(callback){
		var box = $('#rejectBox');
		var tips = '请输入不批准的理由';
		box.find('.btn_grey').off().on('click',function(){
			box.popupClose();
		});
		box.find('.btn_ok').off().on('click',function(){
			var reason = $('.pop_leave').val();
			if(!reason || tips == reason ){
				_common.showMsg('请输入不批准的理由');
				return;
			}
			callback&&callback(reason);
			box.popupClose();
		});
		$('.pop_leave').val(tips).off().on('focus',function(){
			var val = $(this).val();
			if(tips == val){
				$(this).val('');
			}
		}).on('blur',function(){
			var val = $(this).val();
			if(!val){
				$(this).val(''+tips);
			}
		});
		box.popupOpen();
	}




	//自定义滚动条
	function initScrollBar(){
		//自定义滚动条
		$('body').niceScroll({
			cursorcolor:'#ccc',
			cursorwidth:'8px',
			cursorminheight:100,
			scrollspeed:60,
			mousescrollstep:60,
			autohidemode:true,
			bouncescroll:false
		});

		var niceobj = $('body').getNiceScroll(0);
		niceobj.onscrollend=function(info){
			if(info.end.y + 100 >= niceobj.page.maxh ){
				loadNextPage();
			}
		}
	}

	//更新滚动条
	function updateScrollBar(){
		var scrollobj = $('body').getNiceScroll();
		scrollobj.each(function(){
			this.resize();
		})
	}
	


	//业务入口
	queryLeave();
	getList(1);
	initScrollBar();



	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
