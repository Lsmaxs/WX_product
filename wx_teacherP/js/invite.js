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

		var slides = $('#mainPage').css({width:_width+'px',height:_height+'px'}).show();

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

        //动态加载
		var niceobj = slides.eq(0).getNiceScroll(0);
		niceobj.onscrollend=function(info){
			if(info.end.y + 100 >= niceobj.page.maxh ){
				loadNextBatch();
			}
		}
	}

	//------------------------------列表相关 begin------------------------------//
	
	//获取批次列表（分页）
	var _batchCache = {};
	var _PAGESIZE = 20;
	var _PAGENO = 0;
	var _listLoading = false;
	function getBatchList(options){
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
			'pageSize' : options.pageSize,
			'page' : options.pageNo
		};

		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/msg/getInvited',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				options.callback && options.callback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	//加载下一页
	function loadNextBatch(){
		if(_listLoading){
			return;
		}
		getBatchList({
			pageNo : (_PAGENO +1),
			pageSize : _PAGESIZE,
			callback : function(rtn){
				fillBatchData(rtn.inviteProceList,(_PAGENO +1),_PAGESIZE);
			}
		});
	}

	function fillBatchData(items,pageNo,pageSize){
		var html = new Array();

		var _urlPrefix = 'http://ks3.weixiao100.cn/';

		for(var i=0;i<items.length;i++){
			var item = items[i];

			var _state = '<span class="nohandle">排队等待处理</span>';
			if(1 == item.status){
				_state = '<span class="handling">邀请指令已提交</span>';
			}else if(2 == item.status){
				_state = '<span class="handling">等待回显结果</span>';
			}else if(3 == item.status){
				_state = '<span class="handled">已完成</span>';
			}else if(-1 == item.status){
				_state = '<span class="handleerror">处理失败</span>';
			}
			if(!_batchCache[''+item.inviteUnique]){
				html.push('<tr id="data_'+item.inviteUnique+'">');
				html.push('	<td>'+qt_util.formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss')+'</td>');
				html.push('	<td>'+_state+'</td>');
				html.push('	<td>'+(item.invitedMembers?item.invitedMembers:'')+'</td>');
				html.push('	<td>'+(item.resultFile?'<a href="'+_urlPrefix+item.resultFile+'" target="_blank" download>下载</a>':'')+'</td>');
				html.push('</tr>');
				//没有加载过的才进行插入
				_batchCache[''+item.inviteUnique] = 1;
			}else{
				var _temp = new Array();
				_temp.push('	<td>'+qt_util.formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss')+'</td>');
				_temp.push('	<td>'+_state+'</td>');
				_temp.push('	<td>'+item.invitedMembers+'</td>');
				_temp.push('	<td>'+(item.resultFile?'<a href="'+_urlPrefix+item.resultFile+'" target="_blank" download>下载</a>':'')+'</td>');
				$('#data_'+item.inviteUnique).html(_temp.join(''));
			}
		}
		$('#listData').append(html.join(''));

		//切换数据
		if(1 == pageNo && items.length<=0){
			$('#listData').html('<tr><td colspan="4">暂无数据</td></tr>');
		}
		if(items.length == pageSize){
			//只有填满的时候才会触发页码增加
			_PAGENO = pageNo;
		}
	}

	//------------------------------列表相关 end--------------------------------//

	//绑定各种按钮
	var applying = false;
	function bindBtns(){
		//一键邀请
		$('#onekeyInvite').off().on('click',function(){
			var uuid =  _common.getUuid();
			if(!uuid){
				return;
			}
			var schoolCode = _common.getSchoolCode();
			if(!schoolCode){
				return;
			}
			if(applying){
				return;
			}
			_common.showMsg({
				msg : '1、全校邀请会对全校未关注人员发起邀请；<br/>2、为避免造成骚扰，微信限制全校邀请功能每周只可以使用一次；<br/><br/>确定现在使用吗？',
				okcallback : function(){
					applying = true;
					var params = {
						'uuid' : uuid,
						'schoolCode' : schoolCode
					};
					_common.showProgress();
					_common.post(_SERVICE+'/webapp/msg/invite',params,function(rtn){
						applying = false;
						_common.hideProgress();
						if('001' == rtn.resultCode){
							_batchCache = {};
							_PAGENO = 0;
							$('#listData').html('');
							loadNextBatch();
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.showMsg(rtn.resultMsg);
						}
					});
				},
				textAlign : 'left'
			});
		});

		//刷新
		$('#refreshInvite').off().on('click',function(){
			_batchCache = {};
			_PAGENO = 0;
			$('#listData').html('');
			loadNextBatch();
		});
	}


	//业务入口
	initSlide();
	bindBtns();
	loadNextBatch();

	if(!_common.isAdmin()){
		parent && parent.closeWin();
	}
	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
