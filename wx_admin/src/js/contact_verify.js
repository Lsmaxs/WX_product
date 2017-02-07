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
	//--------------------------验证申请加入导出 begin--------------------------//

	//批量表格
	var verifyTable = null;

	//初始化验证申请
	var inited = false;
	function initVerifyBox(){
		if(inited){
			//避免重复初始化
			return;
		}
		//创建表格对象
		verifyTable = _table.initTable({
			selector : '#verifyTable',
			pageSize : 10,
			onPagenoChange : function(pageNo){
				queryVerify(pageNo);
			},
			onPagesizeChange : function(){
				queryVerify(1);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		verifyTable.hideTfoot();

		//绑定返回
		$('#verifyBackBtn').on('click',function(){
			$('#verifybox').hide();
			$('#contactbox').fadeIn(400);
		});

		//绑定全选
		$('#verifyTableAll').off().on('click',function(){
			if(this.checked){
				//当前勾选
				$('#verifyBody input[data-id]').each(function(index,obj){
					this.checked = true;
				});
			}else{
				//当前未勾选
				$('#verifyBody input[data-id]').each(function(){
					this.checked = false;
				});
			}
			//return false;
		});
		$('#verifyBody').off().on('click','input[data-id]',function(){
			//绑定表格内勾选
			if(!this.checked){
				//当前未勾选,全选要去掉
				$('#verifyTableAll')[0].checked = false;
			}
		}).on('click','.btn',function(){
			//绑定单个通过or不通过
			var _this = $(this);
			var id = _this.parent().attr('data-id');
			if(!id){
				return;
			}
			if(_this.hasClass('btn_green')){
				//点击的是通过
				verifyBatchHandle([id],3);
			}else{
				verifyBatchHandle([id],4);
			}
			return false;
		});

		//绑定批量通过or不通过
		$('#verifybox .bar_btns a').off().on('click',function(){
			var _this = $(this);
			var ids = new Array();
			$('#verifyBody input').each(function(){
				if(this.checked){
					ids.push($(this).attr('data-id'));
				}
			});
			if(ids.length<=0){
				_common.tips('请先选择申请加入的人');
				return;
			}
			if(_this.hasClass('btn_green')){
				//点击的是通过
				verifyBatchHandle(ids,3);
			}else{
				verifyBatchHandle(ids,4);
			}
			return false;
		});
	}

	//查询验证申请的表格
	function queryVerify(pageno){
		var params = {
			schoolCode: schoolInfo.schoolCode,
			page: pageno, 
			pageSize: verifyTable.pageSize
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryUserAskReqList',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillVerifyTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//填充表格数据
	function fillVerifyTableData(result){
		//填充表格数据
		var html = new Array();
		var lists = result.rows;
		var _urlPrefix = 'https://ks3.weixiao100.cn/';
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			html.push('<tr>');
			html.push('	<td><input type="checkbox" '+(1==item.status?('data-id="'+item.uniqueCode+'"'):'disabled="disabled"')+'/></td>');
			html.push('	<td>'+item.name+'</td>');
			html.push('	<td>'+item.phone+'</td>');
			html.push('	<td>'+_common.formateDate(item.createTime)+'</td>');
			html.push('	<td data-id="'+item.uniqueCode+'">');

			if(1 == item.status){
				//申请中
				html.push('<a class="btn btn_green" href="javascript:;">&nbsp;通过&nbsp;</a>&nbsp;&nbsp;');
				html.push('<a class="btn btn_blue" href="javascript:;">不通过</a>');
			}else if(2 == item.status){
				html.push('审核中');
			}else if(3 == item.status){
				html.push('审核通过');
			}else if(4 == item.status){
				html.push('不通过');
			}else{
				// do nothing
			}
			html.push('	</td>');
			html.push('	<td>'+(item.dealName?item.dealName:'')+'</td>');
			html.push('	<td>'+(item.dealTime?_common.formateDate(item.dealTime):'')+'</td>');
			html.push('</tr>');
		}

		if(lists.length<=0){
			verifyTable && verifyTable.setNoData();
			return;
		}
		//填入数据
		verifyTable && verifyTable.setTbody(html.join(''));
		//更新表格脚部
		verifyTable && verifyTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		verifyTable && verifyTable.showTfoot();
	}

	//处理通过还是不通过
	function verifyBatchHandle(ids,flag){
		var params = {
			schoolCode: schoolInfo.schoolCode,
			uniqueCodes : ids.join(','),
			flag : flag
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/dealUserAskReq ',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				_common.tips('success','处理成功');
				queryVerify(verifyTable.pageNo);
				queryNeedVerfyNum();
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
	//--------------------------验证申请加入导出 end----------------------------//
	//--------------------------------------------------------------------------//

	/**
	 * @desc 
	 * @param {Object} options  
     * @param {String} schoolCode
	 * @param {String} schoolName
	 * @return 
	 */
	qt_model.showVerify = function(options){
		initVerifyBox();

		schoolInfo = options;

		$('#contactbox').hide();
		$('#verifybox').fadeIn(400);
		$('#verifyTitle').html('验证申请加入('+schoolInfo.schoolName+')');
		queryVerify(1);
	}

	module.exports = qt_model;


});
