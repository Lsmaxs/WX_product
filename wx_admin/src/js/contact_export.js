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
	//------------------------------批量导出 begin------------------------------//

	//批量表格
	var exportTable = null;
	
	//初始化批量邀请
	var inited = false;
	function initExportBox(){
		if(inited){
			//避免重复初始化
			return;
		}
		//创建表格对象
		exportTable = _table.initTable({
			selector : '#exportTable',
			pageSize : 10,
			onPagenoChange : function(pageNo){
				queryExport(pageNo);
			},
			onPagesizeChange : function(){
				queryExport(1);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		exportTable.hideTfoot();

		//绑定一键邀请按钮
		$('#exportDoBtn').on('click',function(){
			if(!schoolInfo.schoolCode){
				_common.tips('请先选择学校');
				return;
			}
			_common.showMsg({
				msg : '你正在导出'+schoolInfo.schoolName+'的通讯录，<br/>请注意资料的保密性。',
				okcallback : function(){
					var params = {
						schoolCode: schoolInfo.schoolCode,
						userStatus:0
					};
					_common.showLoading();
					_common.post(_SERVICE+'/addressBook/exportMembers',params,function(rtn){
						_common.hideLoading();
						if('0000000' == rtn.rtnCode){
							queryExport(1);
						}else{
							_common.tips(rtn.msg);
						}
					});
				},
				okbtnText : '导出'
			});
		});

		//绑定返回
		$('#exportBackBtn').on('click',function(){
			$('#exportbox').hide();
			$('#contactbox').fadeIn(400);
		});

		//绑定刷新按钮
		$('#exportRefreshBtn').on('click',function(){
			queryExport(exportTable.pageNo);
		});
		
	}

	//查询批量邀请
	function queryExport(pageno){
		var params = {
			schoolCode: schoolInfo.schoolCode,
			page: pageno, 
			pageSize: exportTable.pageSize,
			dataType:'export_attention'
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryAsyncTaskStatus',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillExportTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//填充表格数据
	function fillExportTableData(result){
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
			html.push('	<td>'+_state+'</td>');
			html.push('	<td>'+(item.impResultUrl?'<a href="'+_urlPrefix+item.impResultUrl+'" download="1" target="_blank">下载</a>':'')+'</td>');
			html.push('</tr>');
		}

		if(lists.length<=0){
			exportTable && exportTable.setNoData();
			return;
		}
		//填入数据
		exportTable && exportTable.setTbody(html.join(''));
		//更新表格脚部
		exportTable && exportTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		exportTable && exportTable.showTfoot();

	}

	//------------------------------批量导出 end--------------------------------//
	//--------------------------------------------------------------------------//

	/**
	 * @desc 
	 * @param {Object} options  
     * @param {String} schoolCode
	 * @param {String} schoolName
	 * @return 
	 */
	qt_model.showExport = function(options){
		initExportBox();

		schoolInfo = options;

		$('#contactbox').hide();
		$('#exportbox').fadeIn(400);
		$('#exportTitle').html('导出通讯录('+schoolInfo.schoolName+')');
		queryExport(1);

	}

	module.exports = qt_model;


});
