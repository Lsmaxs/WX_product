define(function(require, exports, module) {

	/**
	 * @desc 
	 * @exports
	 * @version 2.7.5
	 * @author 
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var qt_cookie = require('qt/cookie');
	var qt_ui = require('qt/ui');
	var qt_valid = require('qt/valid');
	var _common = require('./common');
	var _config = require('./config');
	var _table = require('./table');
	
	//多文件上传插件
	var WebUploader = require('../plugin/webuploader/webuploader');

	//服务
	var _SERVICE = _config.SERVICE;

	//学校信息
	var schoolInfo = {};

	//--------------------------------------------------------------------------//
	//------------------------------批量调班 begin------------------------------//

	//批量表格
	var moveClassTable = null;

	//初始化批量邀请
	var inited = false;
	function initMoveClassBox(){
		if(inited){
			//避免重复初始化
			return;
		}
		//创建表格对象
		moveClassTable = _table.initTable({
			selector : '#batmoveTable',
			pageSize : 10,
			onPagenoChange : function(pageNo){
				queryMoveClass(pageNo);
			},
			onPagesizeChange : function(){
				queryMoveClass(1);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		moveClassTable.hideTfoot();

		//绑定新增调班按钮
		$('#batmoveAddBtn').on('click',function(){
			if(!schoolInfo.schoolCode){
				_common.tips('请先选择学校');
				return;
			}
			showMoveClassBox();
		});

		//绑定返回
		$('#batmoveBackBtn').on('click',function(){
			$('#batmovebox').hide();
			$('#contactbox').fadeIn(400);
		});

		//绑定刷新按钮
		$('#batmoveRefreshBtn').on('click',function(){
			queryMoveClass(moveClassTable.pageNo);
		});
		
	}

	//查询批量邀请
	function queryMoveClass(pageno){
		var params = {
			schoolCode: schoolInfo.schoolCode,
			page: pageno, 
			pageSize: moveClassTable.pageSize,
			dataType:'stuClassChange'
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryAsyncTaskStatus',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillMoveClassTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//填充表格数据
	function fillMoveClassTableData(result){
		//填充表格数据
		var html = new Array();
		var lists = result.rows;
		var _urlPrefix = 'https://ks3.weixiao100.cn/';
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			var _state = '<span class="nohandle">排队等待处理</span>';
			if(1 == item.state){
				_state = '<span class="handling">处理中</span>';
			}else if(2 == item.state){
				_state = '<span class="handled">处理成功</span>';
			}else if(-1 == item.state){
				_state = '<span class="handleerror">处理失败</span>';
			}
			html.push('<tr>');
			html.push('	<td>'+_common.formateDate(item.createTime)+'</td>');
			html.push('	<td>'+(item.creator?item.creator:'')+'</td>');
			html.push('	<td>'+item.fileName+'</td>');
			html.push('	<td>'+_state+'</td>');
			html.push('	<td>'+(item.srcDownUrl?'<a href="'+_urlPrefix+item.srcDownUrl+'" download="download" target="_blank">下载</a>':'')+'</td>');
			html.push('	<td>'+(item.impResultUrl?'<a href="'+_urlPrefix+item.impResultUrl+'" download="download" target="_blank">下载</a>':'')+'</td>');
			html.push('</tr>');
		}

		if(lists.length<=0){
			moveClassTable && moveClassTable.setNoData();
			return;
		}
		//填入数据
		moveClassTable && moveClassTable.setTbody(html.join(''));
		//更新表格脚部
		moveClassTable && moveClassTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		moveClassTable && moveClassTable.showTfoot();
	}


	//初始化批量导入
	var _moveClassUploader = null;
	//显示调班浮层
	function showMoveClassBox(){
		var win = $('#moveClassBox');
		$('#moveClassBox_select').show();
		$('#moveClassBox_selected,#moveClassBox_progress').hide();
		$('#moveClassBox_progressbar').html('0%').css('width','0%');
		_moveClassUploader && _moveClassUploader.reset();
		win.find('.btn_grey,.btn_blue').show();

		if(!_moveClassUploader){
			//初始化图片选择
			_moveClassUploader = WebUploader.create({
				// swf文件路径
				swf: './plugin/webuploader/Uploader.swf',
				// 文件接收服务端。
				server: _SERVICE+'/addressBook/importAsyncTask?schoolCode='+schoolInfo.schoolCode,
				// 选择文件的按钮。可选。
				pick: {
					id :'#moveClassBox_uploadBtn',
					multiple :false
				},
				accept:{
					title: 'MS Excel File',
					extensions: 'xls,xlsx',
					mimeTypes:'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				},
				//上次并发数
				threads : 1,
				//队列上传数
				fileNumLimit: 1,
				//单个文件大小限制,100M
				fileSingleSizeLimit: 100 * 1024 * 1024,
				//上传前是否压缩文件大小
				compress : false,
				// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
				resize: false
				//runtimeOrder : 'flash'
			});
			_moveClassUploader.on('uploadBeforeSend', function(object, data, headers){
				if('flash'==_moveClassUploader.predictRuntimeType()){
					headers['Accept'] = '*/*';
				}
			});
			_moveClassUploader.on('fileQueued',function(file){
				$('#moveClassBox_select').hide();
				$('#moveClassBox_selected').show();
				$('#moveClassBox_importfile').html(file.name).attr('data-id',file.id);
			});
			_moveClassUploader.on('filesQueued',function(){
				
			});
			_moveClassUploader.on('error',function(type,max,file){
				if('Q_EXCEED_NUM_LIMIT' == type){
					_common.tips('最多上传'+max+'张图片');
				}
			});

			//http协议进度不可预计，纯粹为了交互，伪造上传进度
			_moveClassUploader.on('uploadStart',function(file){
				$('#moveClassBox_progress').show();
				var _bar = $('#moveClassBox_progressbar').html('0%').css('width','0%');

				var _wait = 60 + Math.ceil(10*Math.random());
				var _upObj = {
					now : Math.ceil(10*Math.random()),
					step : 5+Math.ceil(1000*Math.random())%3,
					wait : _wait,
					finish : false,
					timer : null
				}
				_upObj.timer = setInterval(function(){
					var _now = _upObj.now;
					_upObj.now = _upObj.finish?(_upObj.now+8):_upObj.now;
					_upObj.now = !_upObj.finish&&_upObj.now>=_upObj.wait?_upObj.wait:(_upObj.now+_upObj.step);
					_upObj.now = !_upObj.finish&&_upObj.now>=_upObj.wait?_upObj.wait:_upObj.now;

					if(_upObj.now>=100){
						_upObj.now = 100;
					}
					_bar.html(_upObj.now+'%');
					_bar.css({
						'width' : (_upObj.now) +'%'
					});
					if(_upObj.now>=100){
						_upObj.timer && clearInterval(_upObj.timer);
						_upObj = null;
						_common.tips('success','上传成功');
						$('#moveClassBox').popupClose();
						$('#batmoveRefreshBtn').trigger('click');
					}
				},1000);
				_bar.data('upObj',_upObj);
			});

			_moveClassUploader.on('uploadSuccess',function(file,response){
				var rtn = response;
				var _bar = $('#moveClassBox_progressbar').show();
				var upObj = _bar.data('upObj');
				upObj&&(upObj.finish = true);
				_bar.data('rtn',rtn);
			});
			_moveClassUploader.on('uploadFinished',function(){
				//all is finished
			});
			_moveClassUploader.on('uploadError',function(){
				//all is finished
				$('#moveClassBox .btn_blue').show();
				$('#moveClassBox .btn_grey').show();
			});

		}

		//绑定删除文件
		win.find('.importremove').off().on('click',function(){
			var _this = $(this);
			var _fileid = $('#importfile').attr('data-id');
			_fileid&&_fileUploader.removeFile(_fileid,true);
			_fileUploader.reset();
			$('#moveClassBox_select').show();
			$('#moveClassBox_selected').hide();
			$('#moveClassBox_importfile').html('').attr('data-id','');
		});

		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		win.find('.btn_blue').off().on('click',function(){
			if(_moveClassUploader.getFiles().length<=0){
				//没有选择文件
				_common.tips('请选择要导入的文件');
				return;
			}
			win.find('.btn_blue,.btn_grey').hide();
			_moveClassUploader && _moveClassUploader.option( 'server', _SERVICE+'/addressBook/importAsyncTask?schoolCode='+schoolInfo.schoolCode+'&dataType=stuClassChange');
			_moveClassUploader.upload();
		});
		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}

	//------------------------------批量调班 end--------------------------------//
	//--------------------------------------------------------------------------//

	/**
	 * @desc 
	 * @param {Object} options  
     * @param {String} schoolCode
	 * @param {String} schoolName
	 * @return 
	 */
	qt_model.showBatmove = function(options){
		initMoveClassBox();

		schoolInfo = options;

		$('#contactbox').hide();
		$('#batmovebox').fadeIn(400);
		$('#batmoveTitle').html('批量调班('+schoolInfo.schoolName+')');
		$('#moveClassBox_schoolName').html(schoolInfo.schoolName);
		queryMoveClass(1);

	}
	
	module.exports = qt_model;



});
