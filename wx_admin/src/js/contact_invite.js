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
	//------------------------------批量邀请 begin------------------------------//

	//批量表格
	var inviteTable = null;
	
	//初始化批量邀请
	var inited = false;
	function initInviteBox(){
		if(inited){
			//避免重复初始化
			return;
		}

		//创建表格对象
		inviteTable = _table.initTable({
			selector : '#inviteTable',
			pageSize : 10,
			onPagenoChange : function(pageNo){
				queryInvite(pageNo);
			},
			onPagesizeChange : function(){
				queryInvite(1);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		inviteTable.hideTfoot();

		//绑定一键邀请按钮 inviteAddBtn_click
		$('#inviteAddBtn').on('click',function(){
			var _this = $(this);
			if(!schoolInfo.schoolCode){
				_common.tips('请先选择学校');
				return;
			}
			var disable = _this.attr('data-disabled');
			if('1' == disable){
				return;
			}
			showInvitePop();
		});

		//绑定返回
		$('#inviteBackBtn').on('click',function(){
			$('#invitebox').hide();
			$('#contactbox').fadeIn(400);
		});

		//绑定刷新按钮
		$('#inviteRefreshBtn').on('click',function(){
			queryInvite(inviteTable.pageNo);
		});
		
	}

	//查询批量邀请
	function queryInvite(pageno){
		var params = {
			schoolCode: schoolInfo.schoolCode,
			page: pageno, 
			pageSize: inviteTable.pageSize
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryInviteStatus',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillInviteTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//填充表格数据
	function fillInviteTableData(result){
		//填充表格数据
		var html = new Array();
		var lists = result.rows;
		var _urlPrefix = 'https://ks3.weixiao100.cn/';
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			var _state = '<span class="nohandle">排队等待处理</span>';
			if(1 == item.status){
				_state = '<span class="handling">邀请指令已提交</span>';
			}else if(2 == item.status){
				_state = '<span class="handling">等待回显结果</span>';
			}else if(3 == item.status){
				_state = '<span class="handled">已完成</span>';
			}else if(-1 == item.status){
				_state = '<span class="handleerror">发生异常</span>';
			}
			var _inviteSrc = '未知';
			if(1 == item.inviteType){
				_inviteSrc = '后台';
			}else if(2 == item.inviteType){
				_inviteSrc = '前台';
			}
			html.push('<tr>');
			html.push('	<td>'+_common.formateDate(item.createTime)+'</td>');
			html.push('	<td>'+(item.creatorName?item.creatorName:'')+'</td>');
			html.push('	<td>'+_inviteSrc+'</td>');
			html.push('	<td>'+(item.invitedMembers?item.invitedMembers:'')+'</td>');
			html.push('	<td>'+(1==item.dxNotice?'是':'否')+'</td>');
			html.push('	<td>'+_state+'</td>');
			//html.push('	<td>'+item.inviteSucNum+'</td>');
			//html.push('	<td>'+item.inviteFailNum+'</td>');
			html.push('	<td>'+( item.invitedMember ? item.invitedMember : 0)+'%</td>');
			html.push('	<td>'+(item.resultFile?'<a href="'+_urlPrefix+item.resultFile+'" target="_blank">下载</a>':'')+'</td>');
			html.push('</tr>');
		}

		if(lists.length<=0){
			inviteTable && inviteTable.setNoData();
			//$('#inviteboxTips').hide();
			return;
		}else{
			//$('#inviteboxTips').show();
		}
		//填入数据
		inviteTable && inviteTable.setTbody(html.join(''));
		//更新表格脚部
		inviteTable && inviteTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		inviteTable && inviteTable.showTfoot();

	}


	//显示邀请弹层
	//改动取消两个复选框，和相关事件处理
	function showInvitePop() {
		var win = $('#invitePop');
		//判断是否点击了“确认邀请”的按钮
		var isSure = false;
		
		//初始化弹出短信模版
		_invitePop_init(win);
		
		var _templateCode = '';
		var applying = false;
		
		//取消邀请/取消二次发送
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
			//窗口关闭，还原初始化
			isSure = false;
		});
		
		if(isInStopTime) {
			//判断是否暑假期间禁止发送
			$('#invitepop_title').html('提示');
			win.find('.other_con').html('暑假期间暂停使用此功能，请耐心等待开放');
			win.find('.btn_grey').html('确定');
			win.find('.btn_blue,.sure_con,.confirm_con').hide();
			win.find('.btn_grey,.other_con').show();
		}
		
		//确认邀请
		win.find('.btn_blue').off().on('click',function(){
			
			if(!isSure) {
				//获取模版选择值
				var invitesms_check = win.find('input[name="invitesms_check"]:checked');
				if(invitesms_check) {
					_templateCode = invitesms_check.val();
				}
				//判断是否选中短信模版
				if( _templateCode=='' || !_templateCode) {
					_common.tips('请选择短信模板');
					return;
				}
				
				//第一次点击“确认”按钮,
				isSure = true;
				
				 $('#invitepop_title').html('提示');
				 				 
				//没有二次确认的情况
				_invitePop_confirm(win);
				
			} else {
				if(applying){
					return;
				}
				_invitePop_send(win , _templateCode);
			}
			
		});
		
		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}	
	
	//初始化弹出短信模版
	function _invitePop_init(win) {
		
		win.find('.invitepop_smswrap').show();
		
		//短信模版默认优先显示
		win.find('.sure_con').show();
		//短信二次确认隐藏
		win.find('.confirm_con').hide();
		//初始化按钮文本
		win.find('.btn_blue').html('确定邀请');
		win.find('.btn_grey').html('取消');
		win.find('.btn_blue').show();
		win.find('.btn_grey').show();
		
	}
	
	//点确认，显示二次确认页面
	function _invitePop_confirm(win) {
		//短信模版隐藏
		win.find('.sure_con').hide();
		//短信二次确认显示
		win.find('.confirm_con').show();		
		//修改按钮文本为二次确认的按钮文本
		win.find('.btn_blue').html('我已设置，确认发送');
		win.find('.btn_grey').html('尚未设置，取消发送');
	}
	
	//经过二次确认发送邀请短信
	function _invitePop_send(win, _templateCode ) {
		
		var params = {
			schoolCode: schoolInfo.schoolCode,
			autoOn : 0, //($('#invitepop_seven')[0].checked?1:0),
			smsNotice : 1, //($('#invitepop_sms')[0].checked?1:0)
			templateCode : _templateCode
		};
		
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/excinvite',params,function(rtn){
			applying = false;
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				queryInvite(1);
				win.popupClose();
				_common.tips('success','发出邀请成功');
				checkInviteStatus();
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//查询邀请状态
	var isInStopTime = false;
	var restChance = 0;
	function checkInviteStatus(callback){
		var params = {
			schoolCode: schoolInfo.schoolCode
		};
		//隐藏提示区域
		$('#inviteboxTips').hide();
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/excinvite_check',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var info = rtn.bizData;
				var isTime = true; //是否在发送时间段
				isInStopTime = info.isInStopTime;
				//已发送次数
				var tipMsg = '';
				restChance = info.restChance;
				if(restChance && restChance == -1) {
					tipMsg = '没有到规定的发送时间段09：00-20：00';
					isTime = false;
				}
				
				if(1 == info.btnOpen && isTime){
					$('#inviteAddBtn').removeAttr('disabled').attr('data-disabled','0').html('<span class="glyphicon glyphicon-envelope"></span>全校邀请');
				} else {
					//0 == info.btnOpen || !isTime 
					//禁止发送的要按照剩余次数的情况分别处理
					if(!isTime) {
						//到发送时间
						$('#inviteAddBtn').attr('disabled','disabled').attr('data-disabled','1').html('<span class="glyphicon glyphicon-envelope"></span>全校邀请');
					} else if(info.coolDays > 0){
						//大于0 , 提示下次发送的时间点
						$('#inviteAddBtn').attr('disabled','disabled').attr('data-disabled','1').html('<span class="glyphicon glyphicon-envelope"></span>全校邀请('+info.coolDays+'天后可邀请)');
					} else if(restChance == 0) {
						//已发送
						$('#inviteAddBtn').attr('disabled','disabled').attr('data-disabled','1').html('<span class="glyphicon glyphicon-envelope"></span>全校邀请(已邀请)');
					}
				}
				if(tipMsg != '') {
					$('#inviteboxTips').html(tipMsg).show();
				}
				
				//判断是否为空，为空则填充内容
				var template_list_html = [];
				if(info.smsContent) {
					var template_lists = info.smsContent.invites;
					for(var template_index=0; template_index<template_lists.length; template_index++) {
						template_list_html.push('<div class="invitepop_smswrap">');
						template_list_html.push('	<div class="invitepop_sms"><input name="invitesms_check" type="radio" value="' + template_lists[template_index].templateCode +'"> ' + template_lists[template_index].template + '</div>');
						template_list_html.push('</div>');
					}
				}
				$('#invitepop_template_list').html(template_list_html.join(''));
				
				
				callback && callback();
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
	
	//弹出通知
	function popNotice() {
		
		var win = $('#noticePop');
		
		//确认邀请
		win.find('.btn_blue').off().on('click',function(){
			win.popupClose();
		});
		
		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}


	//------------------------------批量邀请 end--------------------------------//
	//--------------------------------------------------------------------------//

	/**
	 * @desc 
	 * @param {Object} options  
     * @param {String} schoolCode
	 * @param {String} schoolName
	 * @return 
	 */
	qt_model.showInvite= function(options){
		initInviteBox();

		schoolInfo = options;

		checkInviteStatus(function(){
			$('#contactbox').hide();
			$('#invitebox').fadeIn(400);
			$('#inviteTitle').html('全校邀请('+schoolInfo.schoolName+')');
			$('#invitepop_title').html('全校邀请(<em>'+schoolInfo.schoolName+'</em>)');
			queryInvite(1);
			
			popNotice();
		});
	}

	module.exports = qt_model;


});
