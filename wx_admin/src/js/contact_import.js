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
	//------------------------------批量导入 begin------------------------------//

	//批量导入表格
	var importTable = null;

	//查询批量导入
	function queryBatImport(pageno){
		var params = {
			schoolCode: schoolInfo.schoolCode,
			page: pageno, 
			pageSize: importTable.pageSize
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryDataImpstatus',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillBatTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//填充表格数据
	function fillBatTableData(result){
		//填充表格数据
		var html = new Array();
		var lists = result.rows;
		var _urlPrefix = 'https://ks3.weixiao100.cn/';
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			var _state = '<span class="nohandle">未处理</span>';
			if(1 == item.state){
				_state = '<span class="handling">处理中</span>';
			}else if(2 == item.state){
				_state = '<span class="handled">已处理</span>';
			}else if(-1 == item.state){
				_state = '<span class="handleerror">处理失败</span>';
			}
			html.push('<tr>');
			html.push('	<td>'+_common.formateDate(item.createTime)+'</td>');
			html.push('	<td>'+('parent'==item.tranType?'家长':'老师')+'</td>');
			html.push('	<td>'+item.name+'</td>');
			html.push('	<td>'+_state+'</td>');
			html.push('	<td>'+(item.srcUrl?'<a href="'+_urlPrefix+item.srcUrl+'" target="_blank">下载</a>':'')+'</td>');
			html.push('	<td>'+(item.impResultUrl?'<a href="'+_urlPrefix+item.impResultUrl+'" target="_blank">下载</a>':'')+'</td>');
			html.push('	<td>'+(item.difResultUrl?'<a href="'+_urlPrefix+item.difResultUrl+'" target="_blank">下载</a>':'')+'</td>');
			html.push('</tr>');
		}

		if(lists.length<=0){
			importTable && importTable.setNoData();
			return;
		}
		//填入数据
		importTable && importTable.setTbody(html.join(''));
		//更新表格脚部
		importTable && importTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		importTable && importTable.showTfoot();
	}

	//初始化批量导入
	var _fileUploader = null
	var inited = false;
	function initBatchBox(){
		if(inited){
			//避免重复初始化
			return;
		}
		inited = true;
		//创建表格对象
		importTable = _table.initTable({
			selector : '#importTable',
			pageSize : 10,
			onPagenoChange : function(pageNo){
				queryBatImport(pageNo);
			},
			onPagesizeChange : function(){
				queryBatImport(1);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		importTable.hideTfoot();


		//绑定导入按钮
		$('#batAddBtn').on('click',function(){
			if(!schoolInfo.schoolCode){
				_common.tips('请先选择学校');
				return;
			}
			showImportPop();
		});

		//绑定返回
		$('#batBackBtn').on('click',function(){
			$('#batchbox').hide();
			$('#contactbox').fadeIn(400);
		});

		//绑定刷新按钮
		$('#batRefreshBtn').on('click',function(){
			queryBatImport(importTable.pageNo);
		});
		
	}

	//显示导入浮层
	function showImportPop(){
		var win = $('#importPop');
		$('#importPop_type')[0].selectedIndex = 0;
		$('#demoLink').hide();
		$('#importPop_select').show();
		$('#importPop_selected,#importPop_progress').hide();
		$('#importPop_progressbar').html('0%').css('width','0%');
		_fileUploader && _fileUploader.reset();
		win.find('.btn_grey,.btn_blue').show();

		if(!_fileUploader){
			//初始化图片选择
			_fileUploader = WebUploader.create({
				// swf文件路径
				swf: './plugin/webuploader/Uploader.swf',
				// 文件接收服务端。
				server: _SERVICE+'/addressBook/importFileNew',
				// 选择文件的按钮。可选。
				pick: {
					id :'#uploadPicBtn',
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
			_fileUploader.on('uploadBeforeSend', function(object, data, headers){
				if('flash'==_fileUploader.predictRuntimeType()){
					headers['Accept'] = '*/*';
				}
			});
			_fileUploader.on('fileQueued',function(file){
				$('#importPop_select').hide();
				$('#importPop_selected').show();
				$('#importfile').html(file.name).attr('data-id',file.id);
			});
			_fileUploader.on('filesQueued',function(){
				
			});
			_fileUploader.on('error',function(type,max,file){
				if('Q_EXCEED_NUM_LIMIT' == type){
					_common.tips('最多上传'+max+'张图片');
				}
			});

			//http协议进度不可预计，纯粹为了交互，伪造上传进度
			_fileUploader.on('uploadStart',function(file){
				$('#importPop_progress').show();
				var _bar = $('#importPop_progressbar').html('0%').css('width','0%');

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
						$('#importPop').popupClose();
						$('#batRefreshBtn').trigger('click');
					}
				},1000);
				_bar.data('upObj',_upObj);
			});

			_fileUploader.on('uploadSuccess',function(file,response){
				var rtn = response;
				var _bar = $('#importPop_progressbar').show();
				var upObj = _bar.data('upObj');
				upObj&&(upObj.finish = true);
				_bar.data('rtn',rtn);
			});
			_fileUploader.on('uploadFinished',function(){
				//all is finished
			});
			_fileUploader.on('uploadError',function(){
				//all is finished
				$('#importPop .btn_blue').show();
				$('#importPop .btn_grey').show();
			});

		}
		//绑定改变类型
		$('#importPop_type').off().on('change',function(){
			var _this = $(this);
			var _val = _this.val();
			if(!_val){
				$('#demoLink').hide();
			}else{
				//家长样例地址
				var _url = './assets/excel/parentdemo.xlsx';
				if('teachers' == _val){
					//教师样例地址
					_url = './assets/excel/teacherdemo.xlsx';
				}
				$('#demoLink').show().attr('href',_url);
				_fileUploader && _fileUploader.option( 'server', _SERVICE+'/addressBook/importFileNew?schoolCode='+schoolInfo.schoolCode+'&importType='+_val);
			}
		});

		//绑定删除文件
		win.find('.importremove').off().on('click',function(){
			var _this = $(this);
			var _fileid = $('#importfile').attr('data-id');
			_fileid&&_fileUploader.removeFile(_fileid,true);
			_fileUploader.reset();
			$('#importPop_select').show();
			$('#importPop_selected').hide();
			$('#importfile').html('').attr('data-id','');
		});

		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		win.find('.btn_blue').off().on('click',function(){
			var _type = $('#importPop_type').val();
			if(!_type){
				_common.tips('请选择要导入类型');
				return;
			}
			if(_fileUploader.getFiles().length<=0){
				//没有选择文件
				_common.tips('请选择要导入的文件');
				return;
			}
			win.find('.btn_blue,.btn_grey').hide();
			_fileUploader.upload();
		});
		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}

	//------------------------------批量导入 end--------------------------------//
	//--------------------------------------------------------------------------//

	/**
	 * @desc 
	 * @param {Object} options  
     * @param {String} schoolCode
	 * @param {String} schoolName
	 * @return 
	 */
	qt_model.showImport = function(options){
		initBatchBox();

		schoolInfo = options;
		$('#contactbox').hide();
		$('#batchbox').fadeIn(400);
		$('#batTitle').text('批量导入('+schoolInfo.schoolName+')');
		$('#importPop_schoolName').text(schoolInfo.schoolName);
		queryBatImport(1);
	}





	
	module.exports = qt_model;



});
