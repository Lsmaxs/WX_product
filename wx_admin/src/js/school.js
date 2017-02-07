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

	//插件
	require('../plugin/icheck/icheck');
	var copy = require('../plugin/copy/copy');
	//多文件上传插件
	var WebUploader = require('../plugin/webuploader/webuploader');
	//
	var imgserver = "https://ks3.weixiao100.cn/";

	//服务
	var _SERVICE = _config.SERVICE;

	//视口尺寸
	var _vs = qt_util.getViewSize();

	//禁用回退
	_common.stopBackspace();

	//客户经理列表
	var managerList = {};

	/**
	 * @desc 初始页面
	 * @return
	 */
	function initPage(){
		resetDimention();
		initBindBox();
		initFindBox();
		$(window).on('resize',function(){
			resetDimention();
		});

		initCompanys();
	}

	//计算尺寸
	function resetDimention(){
		_vs = qt_util.getViewSize();
		var winH=_vs.height;
		var _root = $('#rootwrapper');
		/*
		_root.css({
			'height' : _vs.height + 'px',
			'overflow' : 'auto'
		});
		*/
		_root.attr('data-height', _vs.height);
	}


	//------初始化公司----///
	function initCompanys() {
		$.getJSON("./js/companys.json",function(data){
			managerList = data;
		});


	}

	//----------------------------地区查询相关 begin----------------------------//


	//根据地区父节点code查询子节点列表
	function queryRegion(parentCode,callback){
		_common.post(_SERVICE+'/school/getAreas',{areaCode:parentCode},function(rtn){
			if('0000000' == rtn.rtnCode){
				var lists = rtn.bizData.lists;
				callback && callback(lists);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
	//获取并填充省份
	function queryProvince(callback){
		queryRegion(0,function(lists){
			var html = new Array();
			html.push('<option value="">请选择</option>');
			for(var i=0;i<lists.length;i++){
				var item = lists[i];
				html.push('<option value="'+item.code+'" data-id="'+item.id+'">'+item.name+'</option>');
			}
			$('#provinceSelect').html(html.join(''));
			callback&&callback();
		});
	}

	//获取并填充城市
	function queryCity(provinceid,callback){
		if(!provinceid){
			$('#citySelect').html('<option value="" data-id="">暂无城市信息</option>');
			callback&&callback();
			return;
		}
		queryRegion(provinceid,function(lists){
			var html = new Array();
			if(!lists || lists.length<=0){
				html.push('<option value="" data-id="">暂无城市信息</option>');
			}else{
				html.push('<option value="" data-id="">请选择</option>');
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					if(item.code == provinceid){
						//服务接口有bug，会返回父亲节点，暂时这样屏蔽
						continue;
					}
					html.push('<option value="'+item.code+'" data-id="'+item.id+'">'+item.name+'</option>');
				}
			}
			$('#citySelect').html(html.join(''));
			callback&&callback();
		});
	}

	//获取并填充区镇
	function queryArea(cityid,callback){
		if(!cityid){
			$('#areaSelect').html('<option value="" data-id="">暂无区镇信息</option>');
			callback&&callback();
			return;
		}
		queryRegion(cityid,function(lists){
			var html = new Array();
			if(!lists || lists.length<=0){
				html.push('<option value="" data-id="">暂无区镇信息</option>');
			}else{
				html.push('<option value="" data-id="">请选择</option>');
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					if(item.code == cityid){
						//服务接口有bug，会返回父亲节点，暂时这样屏蔽
						continue;
					}
					html.push('<option value="'+item.code+'" data-id="'+item.id+'">'+item.name+'</option>');
				}
			}
			$('#areaSelect').html(html.join(''));
			callback&&callback();
		});
	}

	//----------------------------地区查询相关 end------------------------------//


	//------------------------------已经绑定 begin------------------------------//

	//初始化绑定应用模块
	function initBindBox(){
		$('#provinceSelect').on('change',function(){
			var areacode = $(this).val();
			if(!areacode){
				$('#citySelect').hide();
			}else{
				$('#citySelect').show();
			}
			queryCity(areacode,function(){
				$('#citySelect').trigger('change');
			});
		});
		$('#citySelect').on('change',function(){
			var areacode = $(this).val();
			if(!areacode){
				$('#areaSelect').hide();
			}else{
				$('#areaSelect').show();
			}
			queryArea(areacode,function(){
				$('#areaSelect').trigger('change');
			});
		});
		$('#areaSelect').on('change',function(){
			var areacode = $(this).val();
			querySchool(1);

		});
		$('#searchBtn').on('click',function(){
			querySchool(1);
		});
		$('#switchFindBtn').on('click',function(){
			$('#bindBox').hide();
			$('#findBox').fadeIn(200);
		});
		$('#searchName').on('keyup',function(e){
			if(13 == e.keyCode){
				querySchool(1);
			}
		});
		initTable();

		//触发查询省份
		//_common.showLoading();
		// queryProvince(function(){
		// 	$('#provinceSelect').trigger('change');
		// });
		querySchool(1);


		//绑定tips
		var tips = $('.focusTips');
		$('#tipsAttach').on('mouseenter',function(){
			var _this = $(this);
			var offset = _this.offset();
			tips.css({
				top : (offset.top-33)+'px',
				left : (offset.left+30)+'px'
			}).fadeIn();
		}).on('mouseleave',function(){
			tips.hide();
		});

		//绑定stat tips
		var statTips = $('.statTips');
		$('#statTipsAttach').on('mouseenter',function(){
			var _this = $(this);
			var offset = _this.offset();
			statTips.css({
				top : (offset.top-33)+'px',
				left : (offset.left+30)+'px'
			}).fadeIn();
		}).on('mouseleave',function(){
			statTips.hide();
		});

		//绑定stat tips
		var masetrTips = $('.masetrTips');
		$('#masterTipsAttach').on('mouseenter',function(){
			var _this = $(this);
			var offset = _this.offset();
			masetrTips.css({
				top : (offset.top-33)+'px',
				left : (offset.left+30)+'px'
			}).fadeIn();
		}).on('mouseleave',function(){
			masetrTips.hide();
		});
	}


	//学校信息缓存
	var schoolInfoCache = {};
	//表格对象
	var bindTable = null;

	//根据分组节点查询详细学校
	function querySchool(pageno){
		hideDetailInfo();

		var areaCode = $('#areaSelect').val();
		var cityCode = $('#citySelect').val();
		var provinceCode = $('#provinceSelect').val();
		var _pageNo = pageno;
		var _pageSize = bindTable.pageSize;


		if(!areaCode){
			//逐级提高,区镇>城市>省份
			areaCode = cityCode||provinceCode||'0';
		}
		var name = $('#searchName').val();

		var params = {
            areaCode:areaCode,
			page: _pageNo,
			pageSize: _pageSize
		};
		_common.showLoading();

		_common.post('/api/school/getBindSchoolList.do?areaCode='+areaCode+'&page='+_pageNo+'&pageSize='+_pageSize+'&schoolName='+(name?encodeURIComponent(name):''),params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//填充表格数据
	function fillTableData(result){
		//填充表格数据
		schoolInfoCache = {};
		var html = new Array();
		var lists = result.rows;
		for(var i=0;i<lists.length;i++){
			var statData = null;
			var item = lists[i];
			var _verify = '未知'
			var _verifyCls = 'unknow';
			if('verified' == item.corpType){
				_verify = '已认证';
				_verifyCls = 'verified';
			}else if('unverified' == item.corpType){
				_verify = '未认证';
				_verifyCls = 'unverified';
			}
			if(item.statData) {
				statData = item.statData;
			}
			html.push('<tr data-schoolCode="'+item.schoolCode+'">');
			html.push('	<td>'+item.areaAddr+'</td>');
			html.push('	<td>'+item.schoolName+'</td>');
			//html.push('	<td>'+(item.managerName?item.managerName:'')+'</td>');
			html.push('	<td>'+(item.relatedManager?item.relatedManager:'')+'</td>');
			html.push('	<td><span class="'+_verifyCls+'">'+_verify+'</span></td>');
			html.push('	<td>');
			if(statData) {
				html.push('	'+statData.schoolTotal+'/'+statData.userMax);
			}
			html.push(' </td>');
			html.push('	<td>');
			if(statData) {
				statData.inschoolFollowed == statData.inschoolFollowed?'-':statData.inschoolFollowed;
				statData.inschoolTotal == statData.inschoolTotal?'-':statData.inschoolTotal;
				statData.teacherFollowed == statData.teacherFollowed?'-':statData.teacherFollowed;
				statData.teacherTotal == statData.teacherTotal?'-':statData.teacherTotal;
				statData.parentFollowed == statData.parentFollowed?'-':statData.parentFollowed;
				statData.parentTotal == statData.parentTotal?'-':statData.parentTotal;
				html.push('	<div class="bolder">总数：'+statData.inschoolFollowed+'/'+statData.inschoolTotal+'</div>');
				html.push('	<div>教师：'+statData.teacherFollowed+'/'+statData.teacherTotal+'</div>');
				html.push('	<div>家长：'+statData.parentFollowed+'/'+statData.parentTotal+'</div>');
			}
			html.push('	</td>');
			html.push(' <td>');
			if(statData) {
				html.push('	 <div>班级数：'+statData.classCount+'</div>');
				html.push('	 <div>班主任数：'+statData.masterCount+'</div>');
				html.push('	 <div>班主任关注数：'+statData.masterFollowed+'</div>');
			}
			html.push(' </td>');
			html.push('	<td>');
			item.appInfoList = item.appInfoList||[];
			for(var j=0;j<item.appInfoList.length;j++){
				var app = item.appInfoList[j];
				app.appName = app.appName||"";
				if(app.appName.indexOf('微官网') != -1){
					var _wgwurl = 'http://'+(_config.isDev?'dev.':'')+'official.weixiao100.cn/admin/v3/index.html?schoolCode='+item.schoolCode+'&access_token='+_common.getToken();
					html.push('<a href="'+_wgwurl+'" class="appicon"><img src="'+app.appLogo+'" title="'+app.appName+'-'+app.appDesc+'"/></a>');
				}else if(app.appName.indexOf('通讯录') != -1){
					html.push('<a href="javascript:;" class="appicon" onclick="goContact(\''+item.schoolCode+'\',\''+item.areaAddr+'\');"><img src="'+app.appLogo+'" title="'+app.appName+'-'+app.appDesc+'"/></a>');
				}else{
					html.push('<a href="'+(app.appAdminAddr?app.appAdminAddr:'javascript:;')+'" '+(app.appAdminAddr?'target="blank"':'')+' class="appicon"><img src="'+app.appLogo+'" title="'+app.appName+'-'+app.appDesc+'"/></a>');
				}
				//http://dev.official.weixiao100.cn/admin/index.html?${schoolCode}&${access_token}
			}
			html.push(' </td>');
			html.push('	<td><a class="btn btn_blue" href="javascript:;">安装应用</a><a class="btn btn_grey" href="javascript:;">查看详情</a></td>');
			html.push('</tr>');
			schoolInfoCache[item.schoolCode] = item;
		}

		if(lists.length<=0){
			bindTable && bindTable.setNoData();
			return;
		}

		bindTable && bindTable.setTbody(html.join(''));
		bindTable && bindTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		bindTable && bindTable.showTfoot();
	}

	//初始化搜索条件
	function initTable(){
		bindTable = _table.initTable({
			selector : '#bindTable',
			pageSize : 20,
			pageSizes : [20],
			onPagenoChange : function(pageNo){
				querySchool(pageNo);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		bindTable.hideTfoot();

		//绑定显示详情
		$('#tbBody').on('click','.btn_grey',function(){
			var _this = $(this);
			var _tr = _this.parent().parent();
			var schoolCode = _tr.attr('data-schoolCode');
			showDetailInfo(schoolCode);
		});
		//绑定安装应用
		$('#tbBody').on('click','.btn_blue',function(){
			var _this = $(this);
			var _tr = _this.parent().parent();
			var schoolCode = _tr.attr('data-schoolCode');
			bindApp(schoolCode);
		});

	}



	//根据学校编码显示详细信息
	function showDetailInfo(schoolCode){
		if(!schoolCode){
			return;
		}
		var win = $('#detailBox');

		//关闭
		win.find('.close').off().on('click',function(){
			hideDetailInfo();
		});
		//解绑
		win.find('.btn_grey').off().on('click',function(){
			_common.showMsg({
				msg : '确定要解绑吗？',
				okcallback : function(){
					deleteSchool(schoolCode,function(){
						hideDetailInfo();
						querySchool(pageNo);
					});
				}
			});

		});
		//安装应用
		win.find('#detailBox_install').off().on('click',function(){
			bindApp(schoolCode);
		});

		//企业号设置
		win.find('#detailBox_corp').off().on('click',function(){
			showCropBox(schoolInfoCache[schoolCode]);
		});

		//学校二维码
		win.find('#detailBox_qrcode').off().on('click',function(){
			showQrcode(schoolInfoCache[schoolCode]);
		});

		//申请加入二维码
		win.find('#detailBox_invite').off().on('click',function(){
			showInviteQrPop(schoolInfoCache[schoolCode]);
		});
		//所属客户经理
		win.find('#detailBox_relatedManager').off().on('click',function(){
			showRelatedManagerBox(schoolInfoCache[schoolCode]);
		});
		//海报
		win.find('#detailBox_poster').off().on('click',function(){
			showPoster(schoolInfoCache[schoolCode]);
		});


		var item = schoolInfoCache[schoolCode];
		if(!item){
			return;
		}
		var html = new Array();
		//填充信息
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4"><em>*</em>学校名称</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+item.schoolName+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4" style="padding-left:0;"><em>*</em>办学类型</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+(item.bxlxName?item.bxlxName:'')+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4"><em>*</em>学校办别</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+(item.xxbbName?item.xxbbName:'')+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">所属区域</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+item.areaAddr+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">创建人</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+item.managerName+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">所属客户经理</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+(item.relatedManager?item.relatedManager:'')+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">所属公司</label>');
		var _firmInfo = getManagerCompanyItem(item.relatedFirmCode);
		html.push('	<div class="col-md-8"><p class="form-control-static">'+(_firmInfo ? _firmInfo.relatedFirm:'')+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">企业号Secret</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+(item.secret?item.secret:'未设置')+'</p></div>');
		html.push('</div>');
		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">企业号cropID</label>');
		html.push('	<div class="col-md-8"><p class="form-control-static">'+(item.corpId?item.corpId:'未设置')+'</p></div>');
		html.push('</div>');

		html.push('<div class="form-group">');
		html.push('	<label class="control-label col-md-4">已安装应用</label>');
		html.push('	<div class="col-md-8">');
		for(var j=0;j<item.appInfoList.length;j++){
			var app = item.appInfoList[j];
			html.push('<a href="'+(app.appAdminAddr?app.appAdminAddr:'javascript:;')+'" '+(app.appAdminAddr?'target="blank"':'')+' class="appicon"><img src="'+app.appLogo+'" title="'+app.appName+'-'+app.appDesc+'"/></a>');
		}
		html.push(' </div>');
		html.push('</div>');

		win.find('form').html(html.join(''));


		if(item.corpId){
			$('#detailBox_poster').show().parent().css('text-align','right');
		}else{
			$('#detailBox_poster').hide().parent().css('text-align','center');
		}

		//样式兼容，避免出现双滚动条
		var _root = $('#rootwrapper');
		var _scrollTop = $(window).scrollTop();
		_root.css({
			'height' : _root.attr('data-height') + 'px',
			'overflow' : 'auto'
		}).scrollTop(_scrollTop);


		win.css({'right':'-'+win.width()+'px'}).show();
		win.animate({right:'0px'},300);
	}

	function hideDetailInfo(fast){
		var win = $('#detailBox');
		if(fast){
			win.css({right:'-'+win.width()+'px'}).hide();
			//样式兼容，避免出现双滚动条
			var _root = $('#rootwrapper');
			var _scrollTop = _root.scrollTop();
			_root.css({
				'height' :'auto',
				'overflow' : 'auto'
			});
			$(window).scrollTop(_scrollTop);

		}else{
			win.animate({right:'-'+win.width()+'px'},300,function(){
				win.hide();
				//样式兼容，避免出现双滚动条
				var _root = $('#rootwrapper');
				var _scrollTop = _root.scrollTop();
				_root.css({
					'height' :'auto',
					'overflow' : 'auto'
				});
				$(window).scrollTop(_scrollTop);
			});
		}
	}

	//查询所有应用
	function queryAppList(callback){
		_common.showLoading();
		_common.post(_SERVICE+'/suiteApp/queryAllSuitAppList',{},function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var suitList = rtn.bizData;
				callback && callback(suitList);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//绑定app
	function bindApp(schoolCode){
		var item = schoolInfoCache[schoolCode];
		if(!item){
			return;
		}
		queryAppList(function(suitList){

			var win = $('#appBox');
			//关闭
			win.find('.close').off().on('click',function(){
				win.popupClose();
			});

			//安装应用
			win.find('.appbox_suitlist').off().on('click','.appbox_group_onekey,.appbox_group_install',function(){
				var _this = $(this);
				var suiteId = _this.attr('data-suiteId');
				var appId = _this.attr('data-appId');
				_common.showLoading();
				var params = {
					schoolCode: schoolCode,
					suiteId: suiteId
				}
				if(appId){
					params.appId = appId;
				}
				_common.post(_SERVICE+'/author/getPreAuthCode',params,function(rtn){
					_common.hideLoading();
					if('0000000' == rtn.rtnCode){
						var result = rtn.bizData;
						var _suiteId = encodeURIComponent(suiteId);
						var _pre_auth_code = encodeURIComponent(result.pre_auth_code);
						var _redirect_uri = encodeURIComponent('http://'+location.host + decodeURIComponent(result.redirect_uri));
						var url = 'https://qy.weixin.qq.com/cgi-bin/loginpage?suite_id='+_suiteId+'&pre_auth_code='+_pre_auth_code+'&redirect_uri='+_redirect_uri+'&state=1';
						window.top.location.href=url;
					}else{
						_common.tips(rtn.msg);
					}
				});
				return false;
			});

			var html = new Array();
			var installedCache = {};
			var item = schoolInfoCache[schoolCode];
			//填充已经安装的应用
			for(var j=0;j<item.appInfoList.length;j++){
				var app = item.appInfoList[j];
				html.push('<a href="'+(app.appAdminAddr?app.appAdminAddr:'javascript:;')+'" '+(app.appAdminAddr?'target="blank"':'')+'><img src="'+app.appLogo+'" title="'+app.appName+'-'+app.appDesc+'"/></a>');
				installedCache[app.suiteId+'-'+app.appId] = true;
			}
			if(html.length>0){
				win.find('.appbox_list').html(html.join(''));
			}else{
				win.find('.appbox_list').html('无');
			}

			//填充套件app
			win.find('.appbox_group').remove();
			html = new Array();
			for(var i=0;i<suitList.length;i++){
				var item = suitList[i];
				html.push('<div class="appbox_group">');
				html.push('    <div class="appbox_group_title">'+item.suitName+'<a class="btn appbox_group_onekey" href="javascript:;" data-suiteId="'+ item.suiteId+'">一键安装</a></div>');
				html.push('    <ul class="appbox_group_list">');
				for(var j=0;j<item.appInfoVoList.length;j++){
					var app = item.appInfoVoList[j];
					html.push('		<li>');
					html.push('			<div><a href="'+(app.appAdminAddr?app.appAdminAddr:'javascript:;')+'" '+(app.appAdminAddr?'target="blank"':'')+'><img src="'+app.appLogo+'" title="'+app.appName+'-'+app.appDesc+'"/></a></div>');
					html.push('			<div class="appbox_group_name">'+app.appName+'</div>');
					if(installedCache[app.suiteId+'-'+app.appId]){
						//已经安装
						html.push('		<div><a class="btn appbox_group_installed" href="javascript:;" data-suiteId="'+app.suiteId+'" data-appId="'+app.appId+'">已安装</a></div>');
					}else{
						//未安装
						html.push('		<div><a class="btn appbox_group_install" href="javascript:;" data-suiteId="'+app.suiteId+'" data-appId="'+app.appId+'">安装</a></div>');
					}
					html.push('		</li>');
				}
				html.push('    </ul>');
				html.push('</div>');
			}
			win.find('.appbox_suitlist').append(html.join(''));
			win.popupOpen();
		});
	}

	//解绑学校
	function deleteSchool(schoolCode,callback){
		if(!schoolCode){
			return;
		}
		var params = {
			schoolCode : schoolCode
		}
		_common.showLoading();
		_common.post(_SERVICE+'/school/removeBindSchool',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				_common.tips('success','解绑成功');
				callback && callback();
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//企业号设置
	var _fileUploader = null;
	function showCropBox(item){

		var win = $('#cropBox');

		//初始化复制功能
		var copyObj = win.data('copyObj');
		if(!copyObj){
			copyObj = copy.clipboard($('#cropBoxCopyBtn')[0],{
				text : $('#cropBoxLink')[0],
				success : function(){
					$('#cropBoxCopyBtn').blur();
					_common.tips('success','复制成功');
				},
				empty : function(){
					_common.tips('复制失败');
				},
				zeroConfig : {
					zIndex : 9999
				}
			});
			win.data('copyObj',copyObj);
		}

		//填充数据
		$('#cropBoxScrcet').val((item.secret?item.secret:''));
		$('#cropBoxCropId').val((item.corpId?item.corpId:''));
		$('#cropBoxLink').html('http://www.weixiao100.cn/prods/inner/transfer/oauthCheck?cropId='+encodeURIComponent(_cropId)+'&key=invite_join');

		var _cropId = item.corpId;
		var _secret = item.secret;
		/*
		if(_secret && _cropId){
			//有值
			$('#cropBoxLink').html('http://www.weixiao100.cn/prods/inner/transfer/oauthCheck?cropId='+encodeURIComponent(_cropId)+'&key=invite_join');
			$('#cropBoxLinkRow').show();
		}else{
			$('#cropBoxLink').html('');
			$('#cropBoxLinkRow').hide();
		}
		*/
		//暂时要隐藏
		$('#cropBoxLinkRow').hide();
		var gzhType = item.serviceType?item.serviceType:0;
		var gzhAppId = item.serviceAppid;
		var gzhScrcet = item.serviceSecret;
		var radios = win.find('.cropBoxSub [type="radio"]');
		var radio = radios.filter('[value="'+gzhType+'"]');
		win.find('[data-gzh=1]').removeAttr('disabled','disabled');

		if(radio.size() >0){
			radio[0].checked = true;
		}else{
			radios.eq(0)[0].checked = true;
		}
		if(gzhType!=1 && gzhType!=2){
			win.find('[data-gzh=1]').val('').attr('disabled','disabled');
		}

		//根据需要显示图片
		_showQrCode(gzhType);

		/*
		if(gzhType > 0 && _fileImageurl == '' && !item.serviceQrcode) {
			$('#cropBox_fileselect').show();
		} else if(gzhType == 0){
			$('#cropBox_fileselect').hide();
			$('#cropBox_serviceQrcode').hide();
		}
		_showQrCode(item);
		*/

		radios.off().click(function(){
			var _this = $(this);
			var _val = parseInt(_this.val());
			if(0 == _val){
				win.find('[data-gzh=1]').attr('disabled','disabled');
			}else{
				win.find('[data-gzh=1]').removeAttr('disabled','disabled');
			}
			_showQrCode(_val);
		});
		$('#cropBoxGzhAppId').val(gzhAppId?gzhAppId:'');
		$('#cropBoxGzhScrcet').val(gzhScrcet?gzhScrcet:'');

		//初始化上传----start
		var schoolCode = item.schoolCode;
		$('#cropBox_fileselected,#cropBox_progress').hide();
		$('#cropBox_progressbar').html('0%').css('width','0%');
		_fileUploader && _fileUploader.reset();
		//本次上传的图片地址
		var imgurlUploaded = null;

		if(!_fileUploader){
			//初始化图片选择
			_fileUploader = WebUploader.create({
				// swf文件路径
				swf: './plugin/webuploader/Uploader.swf',
				// 文件接收服务端。
				server: _SERVICE+'/addressBook/uploadQRCode',
				// 选择文件的按钮。可选。
				pick: {
					id :'#uploadPicBtn',
					multiple :false
				},
				accept:{
					title: 'Image File',
					extensions: 'png,jpg',
					mimeTypes:'image/*'
				},
				//上次并发数
				threads : 1,
				//队列上传数
				fileNumLimit: 1,
				//单个文件大小限制,1M
				fileSingleSizeLimit: 1 * 1024 * 1024,
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
				$('#cropBox_fileselect').hide();
				$('#cropBox_fileselected').show();
				$('#cropbox_uploadfile').html(file.name).attr('data-id',file.id);
			});
			_fileUploader.on('filesQueued',function(){

			});
			_fileUploader.on('error',function(type,max,file){
				if('Q_EXCEED_NUM_LIMIT' == type){
					_common.tips('最多上传'+max+'张图片');
				}
			});

			_fileUploader.on('uploadError',function(){
				//all is finished
				$('#cropBox .btn_blue').show();
				$('#cropBox .btn_grey').show();
				//_common.tips('图片上传失败');
			});

			_fileUploader.on('uploadSuccess',function(file,response){
				var rtn = response;
				var bizData = rtn.bizData;
				imgurlUploaded = bizData.url;
				var _bar = $('#cropBox_progressbar').show();
				var upObj = _bar.data('upObj');
				upObj&&(upObj.finish = true);
				_bar.data('rtn',rtn);
			});
			_fileUploader.on('beforeFileQueued' , function(file) {
				if(file.size > 1 * 1024 * 1024) {
					_common.tips("文件过大，请重新选择");
					file = null;
					return;
				}
			});
		}
		_fileUploader && _fileUploader.option( 'server', _SERVICE+'/addressBook/uploadQRCode?schoolCode='+schoolCode);

		//绑定删除文件
		win.find('.importremove').off().on('click',function(){
			var _this = $(this);
			var _fileid = $('#cropbox_uploadfile').attr('data-id');
			_fileid&&_fileUploader.removeFile(_fileid,true);
			_fileUploader.reset();
			$('#cropBox_fileselect').show();
			$('#cropBox_fileselected').hide();
			$('#cropbox_uploadfile').html('').attr('data-id','');
		});

		//切换上传
		win.find('.btn_changecode').off().on('click' , function() {
			$('#cropBox_serviceQrcode').hide();
			$('#cropBox_fileselect').show();
			_fileUploader && _fileUploader.reset();
		});

		//上传文件-----end-----------

		//处理保存
		var applying = false;
		win.find('.btn_blue').off().on('click',function(){
			if(applying){
				return;
			}
			/*
			var curType = win.find('.cropBoxSub [type="radio"]:checked').val();
			if(curType == 0) {
				return;
			}
			*/
			var secret = $('#cropBoxScrcet').val();
			if(!$.trim(secret)){
				$('#cropBoxScrcet').parent().addClass('has-error');
				_common.tips('企业号Sercet码不可为空');
				return;
			}
			var _gzhType = '0';
			radios.each(function(index,obj){
				var _this = $(obj);
				if(_this[0].checked){
					_gzhType = _this.val();
				}
			});

			var _gzhAppId = $.trim($('#cropBoxGzhAppId').val());
			var _gzhScrcet = $.trim($('#cropBoxGzhScrcet').val());

			if('0'!= _gzhType && !_gzhAppId){
				_common.tips('公众号AppId不可为空');
				return;
			}
			if('0'!= _gzhType && !_gzhScrcet){
				_common.tips('公众号Sercet码不可为空');
				return;
			}

			var params = {
				schoolCode : item.schoolCode,
				secret : secret,
				serviceType : _gzhType,
				serviceAppid : _gzhAppId,
				serviceSecret : _gzhScrcet,
				serviceQrcode : imgurlUploaded?imgurlUploaded:item.serviceQrcode
			}

			if(_fileUploader && _fileUploader.getFiles().length > 0){
				//http协议进度不可预计，纯粹为了交互，伪造上传进度
				_fileUploader.off('uploadStart').on('uploadStart',function(file){
					$('#cropBox_fileselected').hide();
					$('#cropBox_progress').show();
					var _bar = $('#cropBox_progressbar').html('0%').css('width','0%');

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
							_trueSend(params);
						}
					},1000);
					_bar.data('upObj',_upObj);
				});

				//
				_fileUploader.upload();
			} else {
				_trueSend(params);
			}
		});
		//保存函数，用于回调
		function _trueSend(params) {
			if(applying) {
				return;
			}
			//params.serviceQrcode = imgurlUploaded?imgurlUploaded:item.serviceQrcode;
			_common.showLoading();
			_common.post(_SERVICE+'/school/updateSchoolSecret',params,function(rtn){
				applying = false;
				_common.hideLoading();
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					applying = true;
					_common.tips('success','设置成功');
					item.secret = params.secret;
					item.serviceType = params.serviceType;
					item.serviceAppid = params.serviceAppid;
					item.serviceSecret = params.serviceSecret;
					item.serviceQrcode = imgurlUploaded?imgurlUploaded:item.serviceQrcode;
					showDetailInfo(item.schoolCode);
					return;
				}else{
					_common.tips(rtn.msg);
				}
			});
		}

		//显示二维码
		function _showQrCode(gzhType) {
			if(0 == gzhType){
				//没有关联
				$('#cropBox_fileselect,#cropBox_fileselected,#cropBox_serviceQrcode').hide();
				//清空选过的文件，避免上传选了但又不在需要的情况
				_fileUploader && _fileUploader.reset();
			}else if(gzhType > 0){
				//有绑定，需要判断历史值是否有值，有值的填入历史值
				if(item.serviceQrcode){
					//历史有值
					$('#cropBox_fileselect,#cropBox_fileselected').hide();
					var _url = imgserver + item.serviceQrcode+'?t='+(new Date()).getTime();
					$('#cropBox_serviceQrcode').find('.qrcode-image').attr('src',''+_url);
					$('#cropBox_serviceQrcode').show();
				}else{
					//历史无值，直接显示上传
					$('#cropBox_fileselected').hide();
					$('#cropBox_serviceQrcode').find('.qrcode-image').attr('src','');
					$('#cropBox_serviceQrcode').hide();
					$('#cropBox_fileselect').show();
				}
			}
		}

		//处理取消
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});

		//弹出
		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}

	//客户经理设置
	function showRelatedManagerBox(item){
		var win = $('#relativeManagerBox');
		$('#relativeManagerBoxName').val(item.relatedManager?item.relatedManager:'');

		$('#relativeManagerBoxCompany').html(getManagerCompanyOptions(item));

		//处理保存
		var applying = false;
		win.find('.btn_blue').off().on('click',function(){
			if(applying){
				return;
			}
			var relatedManager = $('#relativeManagerBoxName').val();
			if(!$.trim(relatedManager)){
				$('#relativeManagerBoxName').parent().addClass('has-error');
				_common.tips('客户经理名字不可为空');
				return;
			}
			var _relatedFirmCode = $('#relativeManagerBoxCompany').val();
			if(!_relatedFirmCode) {
				$('#relativeManagerBoxCompany').parent().parent().addClass('has-error');
				_common.tips('请选择所属公司');
				return;
			}
			var _companyItem = getManagerCompanyItem(_relatedFirmCode);
			var _relatedFirm = _companyItem.relatedFirm;

			var relatedManager = $('#relativeManagerBoxName').val();
			applying = true;
			var params = {
				schoolCode : item.schoolCode,
				relatedManager : relatedManager,
				relatedFirmCode : _relatedFirmCode,
				relatedFirm : _relatedFirm
			}
			_common.showLoading();

			_common.post(_SERVICE+'/school/updateRelatedManager',params,function(rtn){
				applying = false;
				_common.hideLoading();
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','设置成功');
					item.relatedManager = relatedManager;
					//showDetailInfo(item.schoolCode);
					bindTable && querySchool(bindTable.pageNo);
				}else{
					_common.tips(rtn.msg);
				}
			});

		});

		//处理取消
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});

		//弹出
		win.popupOpen();
	}


	//展示二维码
	var qrcodeLoading = false;
	function showQrcode(item){
		if(qrcodeLoading){
			return false;
		}
		var win = $('#qrcodeBox');

		$('#qrcodeBoximg').hide();
		$('#qrcodeBoximgdef').show();

		//处理保存
		var params = {
			schoolCode : item.schoolCode
		}
		qrcodeLoading = true;
		_common.showLoading();
		_common.post(_SERVICE+'/school/loadCorpQRCode',params,function(rtn){
			qrcodeLoading = false;
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var _qrCodeUrl = rtn.bizData.qrCodeUrl;
				if(!_qrCodeUrl){
					_common.tips('学校二维码获取失败');
					return;
				}
				$('#qrcodeBoximg').attr('src',_qrCodeUrl).off().on('load',function(){
					$('#qrcodeBoximgdef').hide();
					$('#qrcodeBoximg').show();
				});
				$('#qrcodeBoxName').html(''+item.schoolName);

				win.find('.btn_blue').attr({
					'href':_qrCodeUrl,
					'download' : item.schoolName
				});

				//弹出
				win.popupOpen();
			}else{
				_common.tips(rtn.msg);
			}
		});

		//处理取消
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
	}

	//申请加入二维码
	function showInviteQrPop(item){
		if(qrcodeLoading){
			return;
		}
		var win = $('#inviteQrPop');

		//初始化复制功能
		var copyObj = win.data('copyObj');
		if(!copyObj){
			copyObj = copy.clipboard($('#inviteQrPopCopyBtn')[0],{
				text : $('#inviteQrPopLink')[0],
				success : function(){
					$('#inviteQrPopCopyBtn').blur();
					_common.tips('success','复制成功');
				},
				empty : function(){
					_common.tips('复制失败');
				},
				zeroConfig : {
					zIndex : 9999
				}
			});
			win.data('copyObj',copyObj);
		}

		//处理取消
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
			$('.inviteQrPop_qrwrap img').attr('src','./images/default.jpg');
		});

		var _url = 'http://'+(_config.isDev?'dev.weixiao100.cn':'www.weixiao100.cn');

		//处理保存
		var params = {
			schoolCode : item.schoolCode
		}
		qrcodeLoading = true;
		_common.showLoading();

		_common.jsonp(_url+'/prods/info/getCorpWxqrcode',params,function(rtn){
			var temp = $('.inviteQrPop_qrwrap img');
			$('.inviteQrPop_qrwrap img').attr('src',rtn.joinAddCodeUrl);
			$('.inviteQrPop_qrwrap a').attr({
				'href':rtn.joinAddCodeUrl,
				'download' : item.schoolName
			});

			var  _joinurl = 'http://'+(_config.isDev?'dev.weixiao100.cn':'www.weixiao100.cn')+'/prods/inner/transfer/dr?key=invite_join_ex&schoolCode='+item.schoolCode;
			var parmas = {
				sourceUrl : _joinurl
			}
			_common.jsonp(_url+'/prods/info/getShortUrl',parmas,function(rtn){
				_common.hideLoading();
				$('#inviteQrPopLink').html(rtn.shortUrl);
				//弹出
				if(qrcodeLoading){
					win.popupOpen();
				}
				qrcodeLoading = false;
			});
		});
		//8s不响应，重新开放接口
		setTimeout(function(){
			qrcodeLoading = false;
			_common.hideLoading();
		},8000);
	}

	//展示海报
	//查询海报定时器
	var posterTimer = null;
	//生成检测
	var posterGenImg = null;
	//尝试加载次数
	var posterGenTryTime = 0;
	var posterTargetUrl = '';
	var posterGenSchoolCode = '';
	function showPoster(item){

		posterTargetUrl = 'https://ks3.weixiao100.cn/yyhd/shenqing/'+(_config.isDev?'dev/':'')+item.schoolCode+'.jpg';
		posterGenSchoolCode = item.schoolCode;
		var pop = $('#posterBox');
		pop.find('.posterbox_school').find('span').text(item.schoolName);

		$('#posterBoxFrontImg').attr('src','').hide();
		$('#posterBoximgdef').show();

		$('#posterBoxFrontBtn').hide().attr('href',posterTargetUrl).attr('download',item.schoolName+'_正面.jpg');
		$('#posterBoxGenBtn').html('加载中').show();

		var img = new Image();
		img.onerror = function(){
			//设置错误图片
			$('#posterBoxFrontImg').attr('src','./images/school/noposter.png').show();
			$('#posterBoximgdef').hide();
			$('#posterBoxGenBtn').html('生成');
		}
		img.onload = function(){
			$('#posterBoximgdef').hide();
			$('#posterBoxFrontBtn').show();
			$('#posterBoxGenBtn').html('生成');
			$('#posterBoxFrontImg').attr('src',posterTargetUrl).show();
		}
		img.src=posterTargetUrl;
		//绑定关闭
		pop.find('.close').off().on('click',function(){
			pop.popupClose();
		});
		//弹出
		pop.popupOpen();

		//绑定事件
		if(!posterGenImg){
			posterGenImg = new Image();
			//标识是否正在生成
			var gening = false;
			posterGenImg.onerror = function(){
				posterGenTryTime--;
				if(posterGenTryTime>0){
					setTimeout(function(){
						_common.showLoading();
						$('#posterBoxGenBtn').html('生成中');
						posterGenImg.src = posterTargetUrl;
					},3000);
				}else{
					gening = false;
					_common.hideLoading();
					$('#posterBoximgdef').hide();
					$('#posterBoxFrontImg').attr('src','./images/school/noposter.png').show();
					$('#posterBoxGenBtn').html('生成').removeClass('btn_grey').addClass('btn_blue');
					_common.tips('生成失败，请稍后重新生成');
				}
			}
			posterGenImg.onload = function(){
				gening = false;
				_common.hideLoading();
				$('#posterBoximgdef').hide();
				$('#posterBoxGenBtn').html('生成').removeClass('btn_grey').addClass('btn_green');
				$('#posterBoxFrontBtn').show();
				$('#posterBoxFrontImg').attr('src',posterTargetUrl).show();
			}
			$('#posterBoxGenBtn').off().click(function(){
				if(gening){
					return;
				}
				gening = true;
				posterGenTryTime = 40;

				_common.tips('info','生成单张需要1~2分钟时间，请耐心等待',{timeOut:8000});

				$('#posterBoxGenBtn').html('生成中').removeClass('btn_green').addClass('btn_grey');
				$('#posterBoximgdef').show();
				$('#posterBoxFrontImg').hide();
				var genUrl = 'http://'+(_config.isDev?'dev':'www')+'.weixiao100.cn/appmsg/api/leaflet/gen?sc='+posterGenSchoolCode;
				_common.showLoading();
				_common.jsonp(genUrl,{},function(rtn){
					if('001' == rtn.resultCode){
						posterGenImg.src = posterTargetUrl;
					}else{
						_common.hideLoading();
						gening = false;
						_common.tips(rtn.resultMsg);
						$('#posterBoximgdef').hide();
						$('#posterBoxFrontImg').attr('src','./images/school/noposter.png').show();
						$('#posterBoxGenBtn').html('生成').removeClass('btn_grey').addClass('btn_green');
					}
				});
			});

			var posters = $('.posterbox_poster');
			posters.off().click(function(){
				var _this = $(this);
				var _src = _this.attr('src');
				if(_src.indexOf('noposter')>0){
					$('#posterBoxGenBtn').trigger('click');
					return;
				}
				var index = posters.index(this);
				var urls = [];
				urls.push(posters.eq(0).attr('src'));
				urls.push(posters.eq(1).attr('src'));
				_common.showImgs(urls,index);
			});
		}
	}


	//------------------------------已经绑定 end--------------------------------//
	//获取客户经理列表
	function getManagerCompanyOptions(editInfo) {
		var html = new Array();
		html.push('<option value="" data-id="">请选择</option>');
		for(var i=0;i<managerList.length;i++){
			var item = managerList[i];
			var selected = '';
			if(editInfo && editInfo.relatedFirmCode==item.relatedFirmCode) {
				selected = 'selected';
			}
			html.push('<option value="'+item.relatedFirmCode+'" data-id="'+item.relatedFirmCode+'" ' + selected + '>'+item.relatedFirm+'</option>');
		}

		return html.join('');
	}

	//获取单个公司
	function getManagerCompanyItem(relatedFirmCode) {
		var manageItem = null;
		for(var i=0;i<managerList.length;i++){
			if(relatedFirmCode && managerList[i].relatedFirmCode==relatedFirmCode) {
				manageItem = managerList[i];
				break;
			}
		}
		return manageItem;
	}


	//新增或修改学校
	function addSchool(editInfo){
		var win = $('#addBox');
		var applying = false;

		//清空原来选择的东西
		win.find('input,textarea').val('');
		win.find('.form-group').removeClass('has-error');
		$('#addboxBxlx').html('');

		//绑定下拉选项
		$('#addboxProvince').off().html($('#provinceSelect').html()).on('change',function(){
			var areacode = $(this).val();
			if(!areacode){
				//$('#addboxCity').hide();
				$('#addboxCity').html('<option value="" data-id="">请选择</option>').trigger('change');
			}else{
				//$('#addboxCity').show();
				queryRegion(areacode,function(lists){
					var html = new Array();
					if(!lists || lists.length<=0){
						html.push('<option value="" data-id="">请选择</option>');
					}else{
						html.push('<option value="" data-id="">请选择</option>');
						for(var i=0;i<lists.length;i++){
							var item = lists[i];
							html.push('<option value="'+item.code+'" data-id="'+item.id+'">'+item.name+'</option>');
						}
					}
					$('#addboxCity').html(html.join(''));
					$('#addboxCity').trigger('change');
				});
			}
			//win.popupOpen();
		});
		$('#addboxCity').off().on('change',function(){
			var areacode = $(this).val();
			if(!areacode){
				//$('#addboxArea').hide();
				$('#addboxArea').html('<option value="" data-id="">请选择</option>').trigger('change');
			}else{
				//$('#addboxArea').show();
				queryRegion(areacode,function(lists){
					var html = new Array();
					if(!lists || lists.length<=0){
						html.push('<option value="" data-id="">请选择</option>');
					}else{
						html.push('<option value="" data-id="">请选择</option>');
						for(var i=0;i<lists.length;i++){
							var item = lists[i];
							html.push('<option value="'+item.code+'" data-id="'+item.id+'">'+item.name+'</option>');
						}
					}
					$('#addboxArea').html(html.join(''));
				});
			}
			//win.popupOpen();
		});

		//绑定客户经理公司

		$('#addboxRelatedCompany').html(getManagerCompanyOptions(editInfo));

		$('#addboxProvince')[0].selectedIndex = 0;
		$('#addboxProvince').trigger('change');

		//美化勾选配置参数
		var icheckConfig = {
			checkboxClass: 'icheckbox_minimal-blue',
			radioClass: 'iradio_minimal-blue'
		}

		getSchoolXxlb(function(lists){
			var html = new Array();
			for(var i=0;i<lists.length;i++){
				var item = lists[i];
				html.push('<label class="checkbox-inline"><input type="radio" name="xxlb" data-code="'+item.code+'"> '+item.name+'</label>');
			}
			$('#addboxXxlb').html(html.join(''));
			//绑定点击
			$('#addboxXxlb').find('input').iCheck(icheckConfig).on('ifChecked', function(e){
				var _this = $(this);
				var code = _this.attr('data-code');
				getSchoolBxlx(code,function(lists){
					var html = new Array();
					for(var i=0;i<lists.length;i++){
					var item = lists[i];
						html.push('<label class="checkbox-inline"><input type="radio" name="bxlx" data-code="'+item.code+'"> '+item.name+'</label>');
					}
					$('#addboxBxlx').html(html.join('')).find('input').iCheck(icheckConfig).on('ifChecked',function(){
						$('#addboxBxlx').parent().parent().removeClass('has-error');
					});
					if(editInfo){
						$('#addboxBxlx input[data-code="'+editInfo.bxlx+'"]').iCheck('check');
						//判断cj
						if('1' == editInfo.isCj){
							$('#addboxXxlb input[data-code]').iCheck('disable');
							$('#addboxXxbb input[data-code]').iCheck('disable');
							$('#addboxBxlx input[data-code]').iCheck('disable');
						}
					}
				});
				$('#addboxXxlb').parent().parent().removeClass('has-error');
			});
			getSchoolXxbb(function(lists){
				var html = new Array();
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					html.push('<label class="checkbox-inline"><input type="radio" name="xxbb" data-code="'+item.code+'"> '+item.name+'</label>');
				}
				$('#addboxXxbb').html(html.join('')).find('input').iCheck(icheckConfig).on('ifChecked',function(){
					$('#addboxXxbb').parent().parent().removeClass('has-error');
				});


				//处理修改的情况
				if(editInfo){
					$('#addBoxAddzone').hide();
					$('#addBoxEditzone').show();
					//填入数据
					$('#addBoxZoneLabel').html(editInfo.areaAddr);
					$('#addboxCode').val(editInfo.schoolCode).attr('disabled','disabled');
					$('#addboxName').val(editInfo.schoolName);
					$('#addboxRelatedManager').val(editInfo.relatedManager);
					$('#addboxXxlb input[data-code="'+editInfo.xxlb+'"]').iCheck('check');
					$('#addboxXxbb input[data-code="'+editInfo.xxbb+'"]').iCheck('check');
					win.find('.popbox_title').html('学校详情');
				}else{
					$('#addBoxAddzone').show();
					$('#addBoxEditzone').hide();
					$('#addboxCode').removeAttr('disabled');
					win.find('.popbox_title').html('创建新学校');
				}

				//需要的信息全部初始化完成，弹出窗体
				win.popupOpen({
					maskColor:'#333',
					maskOpacity : '0.8'
				});
			});
		});

		//绑定关闭
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		//绑定保存
		win.find('.btn_blue').off().on('click',function(){
			if(applying){
				return;
			}
			var _areaCode = $('#addboxArea').val();
			if(!editInfo && !_areaCode){
				//不是处于修改状态，需要检查地区码
				$('#addboxArea').parent().parent().addClass('has-error');
				_common.tips('地区信息不可为空');
				return;
			}
			var _xxlb = '';
			$('#addboxXxlb input').each(function(index,obj){
				if(obj.checked){
					_xxlb = $(obj).attr('data-code');
				}
			});
			if(!_xxlb){
				$('#addboxXxlb').parent().parent().addClass('has-error');
				_common.tips('请选择类型');
				return;
			}

			var _bxlx = '';
			$('#addboxBxlx input').each(function(index,obj){
				if(obj.checked){
					_bxlx = $(obj).attr('data-code');
				}
			});
			if(!_bxlx){
				$('#addboxBxlx').parent().parent().addClass('has-error');
				_common.tips('请选择办学类型');
				return;
			}
			var _xxbb = '';
			$('#addboxXxbb input').each(function(index,obj){
				if(obj.checked){
					_xxbb = $(obj).attr('data-code');
				}
			});
			if(!_xxbb){
				$('#addboxXxbb').parent().parent().addClass('has-error');
				_common.tips('请选择学校办别');
				return;
			}
			var _code = $('#addboxCode').val();
			if(!/^[a-zA-Z0-9\-]+$/.test(_code)){
				$('#addboxCode').parent().parent().addClass('has-error');
				_common.tips('学校编码错误');
				return;
			}
			var _name = $('#addboxName').val();
			if(!_name){
				$('#addboxName').parent().parent().addClass('has-error');
				_common.tips('学校全称不可为空');
				return;
			}

			var relatedManager = $('#addboxRelatedManager').val();
			if(!relatedManager) {
				$('#addboxRelatedManager').parent().parent().addClass('has-error');
				_common.tips('请输入客户经理');
				return;
			}
			var _relatedFirmCode = $('#addboxRelatedCompany').val();
			if(!_relatedFirmCode) {
				$('#addboxRelatedCompany').parent().parent().addClass('has-error');
				_common.tips('请选择所属公司');
				return;
			}
			var _companyItem = getManagerCompanyItem(_relatedFirmCode);
			var _relatedFirm = _companyItem.relatedFirm;

			applying = true;
			var params = {
				areaCode: _areaCode,
				bxlxCode: _bxlx,
				schoolCode: _code,
				schoolName: _name,
				xxbbCode: _xxbb,
				xxlbCode: _xxlb,
				relatedManager : relatedManager,
				relatedFirmCode : _relatedFirmCode,
				relatedFirm : _relatedFirm
			};
			if(editInfo){
				//修改
				params = {
					id : editInfo.id,
					isCj : editInfo.isCj,
					schoolName : _name,
					relatedManager : relatedManager,
					schoolCode: _code,
					bxlx : _bxlx,
					xxbb : _xxbb,
					xxlb : _xxlb,
					binding : editInfo.isbind,
					relatedFirmCode : _relatedFirmCode,
					relatedFirm : _relatedFirm
				};
			}
			_common.showLoading();
			_common.post(_SERVICE+(editInfo?'/school/updateSchoolDetail':'/school/addSchool'),params,function(rtn){
				_common.hideLoading();
				applying = false;
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','保存成功');
					setTimeout(function(){
						if(editInfo){
							//修改
							$('#findTbBosy').html('');
							$('#findBtn').trigger('click');
						}else{
							//新增
							$('#switchBindBtn').trigger('click');
							$('#searchName').val('');
							$('#provinceSelect')[0].selectedIndex = 0;
							$('#provinceSelect').trigger('change');
						}
					},1000);
				}else{
					_common.tips(rtn.msg);
				}
			});
		});

		//效果处理
		win.find('.form-group input,.form-group textarea,.form-group select').off('click.check').on('click.check',function(){
			$(this).parent().parent().removeClass('has-error');
		});
	}

	//获取学校类型(小学，初中等)
	function getSchoolXxlb(callback){
		_common.post(_SERVICE+'/school/getSchoolXxlb',{},function(rtn){
			if('0000000' == rtn.rtnCode){
				 //{code: "11", id: 249, name: "幼儿园"}
				callback && callback(rtn.bizData.lists);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
	//获取学校办学类型(具体性质)
	function getSchoolBxlx(xxlbCode,callback){
		_common.post(_SERVICE+'/school/getSchoolBxlx',{xxlbCode:xxlbCode},function(rtn){
			if('0000000' == rtn.rtnCode){
				 //{code: "11", id: 249, name: "幼儿园"}
				callback && callback(rtn.bizData.lists);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
	//获取学校办别(公办，私办)
	function getSchoolXxbb(callback){
		_common.post(_SERVICE+'/school/getSchoolXxbb',{},function(rtn){
			if('0000000' == rtn.rtnCode){
				//{code: "21", id: 251, name: "公办"}
				callback && callback(rtn.bizData.lists);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	function queryRelatedCompany(callback) {
		/*_common.post(_SERVICE+'/school/getSchoolXxbb',{},function(rtn){
			if('0000000' == rtn.rtnCode){
				//{code: "21", id: 251, name: "公办"}
				callback && callback(rtn.bizData.lists);
			}else{
				_common.tips(rtn.msg);
			}
		}); */
	}




	//初始化检索功能
	function initFindBox(){
		$('#switchBindBtn').on('click',function(){
			$('#findBox').hide();
			$('#bindBox').fadeIn(200);
		});
		$('#addSchoolBtn').on('click',function(){
			addSchool();
		});

		$('#findBtn').on('click',function(){
			findSchool();
		});
		$('#findName').on('keyup',function(e){
			if(13 == e.keyCode){
				findSchool();
			}
		});
		//绑定绑定点击(合并到详情中去)
		/*
		$('#findTbBosy').on('click','.btn_blue',function(){
			var _this = $(this);
			var _tr = _this.parent().parent();
			var schoolCode = _tr.attr('data-schoolCode');
			var schoolName = _tr.attr('data-schoolName');
			if(schoolCode&&schoolName){
				bindSchool(schoolCode,schoolName);
			}
		});
		*/
		//
		$('#findTbBosy').on('click','.btn_blue',function(){
			var _this = $(this);
			var _tr = _this.parent().parent();
			var schoolCode = _tr.attr('data-schoolCode');
			var schoolName = _tr.attr('data-schoolName');
			if(schoolCode&&schoolName){
				getSchoolDetail(schoolCode,function(editInfo){
					if(!editInfo){
						_common.tips('学校信息查询出错');
						return;
					}
					addSchool(editInfo);
				});
			}
		});
	}

	//学校检索
	function findSchool(){
		var name = $('#findName').val();
		if(name.length<4){
			_common.tips('学校名称最少输入4个字符');
			return;
		}
		var params = {
			searchSchoolName : name
		}
		_common.showLoading();
		_common.post(_SERVICE+'/school/getSchoolLikeName',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var result = rtn.bizData;
				var html = new Array();
				var lists = result.lists;
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					html.push('<tr data-schoolCode="'+item.code+'" data-schoolName="'+item.name+'">');
					html.push('	<td>'+item.code+'</td>');
					html.push('	<td>'+item.name+'</td>');
					html.push('	<td>'+(item.address?item.address:'')+'</td>');
					if(1 == item.isbind){
						//已经绑定
						html.push('	<td>负责人：'+item.managerName+'</td>');
					}else{
						//未绑定
						//html.push('	<td><a class="btn btn_blue" href="javascript:;">绑定</a><a class="btn btn_grey" href="javascript:;">详情</a></td>');
						html.push('<td><a class="btn btn_blue" href="javascript:;">查看详情</a></td>');
					}
					html.push('</tr>');
				}
				if(lists.length<=0){
					$('#findTbBosy').html('<tr><td colspan="4" style="text-align:center;">暂无数据</td></tr>');
					return;
				}
				$('#findTbBosy').html(html.join(''));
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//绑定学校
	function bindSchool(schoolCode,schoolName){
		_common.showLoading();
		var params = {
			schoolCode: schoolCode,
			schoolName: schoolName
		}
		_common.post(_SERVICE+'/school/bindSchool',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				_common.tips('success','绑定成功');
				$('#findTbBosy').html('');
				$('#findBtn').trigger('click');
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//查询学校详细信息
	function getSchoolDetail(schoolCode,callback){
		var params = {
			schoolCode: schoolCode,
		};
		_common.showLoading();
		_common.post(_SERVICE+'/school/getSchoolDetail',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				callback && callback(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
	//------------------------------window方法 begin------------------------------//

	//跳转到通讯录
	window.goContact = function(schoolCode,areaAddr){
		var data = {
			cmd : 'contact',
			params:{
				schoolCode : schoolCode,
				areaAddr : areaAddr
			}
		};
		parent.handleFrameCall && parent.handleFrameCall(data);
	}



	//------------------------------window方法 end--------------------------------//

	//业务入口
	initPage();


	//测试代码
	//$('#detailBox').show();

	/*
	layer.tips('我是另外一个tips，只不过我长得跟之前那位稍有些不一样。', '#tipsAttach', {
	  tips: [2, '#c00'],
	  area : ['400px','300px'],
	  offset : ['0px','100px'],
	  time: 30000
	});
	*/

	/*
	_common.post(_SERVICE+'/webapp/xxxx',params,function(rtn){
		if('001' == rtn.resultCode){

		}else if('202' == rtn.resultCode){
			_common.lostLogin();
		}else{
			showMsg(rtn.resultMsg);
		}
	});
	*/
	module.exports = qt_model;



});
