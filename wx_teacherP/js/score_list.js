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
	var WebUploader = require('../plugin/webuploader/webuploader');
	require('../plugin/laydate/laydate');
//	require("../plugin/underscore/underscore");
	//json插件
	require('jquery/json');
	//滚动条美化插件
	require('jquery/nicescroll');
	

	//服务
	//var _SERVICE = 'http://'+location.hostname+':'+(location.port?location.port:'80');
	var _SERVICE = _common.SERVICE;
	//获取窗口大小
	var winSize = qt_util.getViewSize();
	//请求地址url
	var requestUrl = {
			//模板url
			templateUrl :"http://ks3.weixiao100.cn/exam/demo/成绩发送模板v1.4.xlsx",
			addExamBatch :_SERVICE + "/webapp/exam/score/import/addExamBatch",
			//获取考试批次
			getExamBatch : _SERVICE+"/webapp/exam/score/import/getExamBatch",
			//成绩发送
			pushScore : _SERVICE + "/webapp/exam/score/import/push",
			//成绩上传 
			uploadScore:_SERVICE + "/webapp/exam/score/ftp/upload",
			//删除批次
			delExamBatch : _SERVICE + "/webapp/exam/score/import/delExamBatch",
			//修改批次
			editExamBatch : _SERVICE + "/webapp/exam/score/import/editExamBatch"
	}
	
	/************************************业务相关************************************/
	//初始化页面
	function initPage(){
		
		initSlide();
		initExamBatch(1);
		initEvent(function(){
			
		});
		
		setTimeout(function(){
		
		},1000)
	}
	
	//初始化页面切换
	var _slideobj = null;
	function initSlide(initIndex){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		_slideobj = qt_ui.slide({id:'qtslide',initIndex:(initIndex?initIndex:0)});
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
		//方便调试
		window.goLeft = function(){
			_slideobj.left();
		}
		window.goRight = function(){
			_slideobj.right();
		}

        //动态加载
		var niceobj = slides.eq(0).getNiceScroll(0);
		niceobj.onscrollend=function(info){
			if(info.end.y + 100 >= niceobj.page.maxh ){
				if(scoreListSize >=_PAGESIZE){
					loadNextBatch();
				}
			}
		}
	}
	
	
	//初始化新建成绩
	var isClick = false;
	function initEvent(cback){
		var $examName = $('#examName');
		var $examTime = $('#examTime');
		var $createScore = $('#noData .bt_create');
		var scoreType = 1;//默认分数制
		$('#scoAdd').off().on('click',function(){
			$examName.val("");
			$examTime.val("");
			$("#popAddScore").fadeIn();
			$('#popAddScore .line_none span').eq(0).find('i').addClass('tp_radied').removeClass('tp_radio').parent('span').siblings().find('i').removeClass('tp_radied').addClass('tp_radio');
			scoreType = 1;//重新打开后，默认是1
		});
		$('#cenecl').off().on('click',function(){
			$("#popAddScore").fadeOut();
			$('#popAddScore .line_none span i').removeClass('tp_radied').addClass('tp_radio');
		});
		
		$examTime.off().on('click',function(){
			_common.layDate('#examTime',1);
		});
		
		
		$('#popAddScore .line_none span').on('click',function(){
			var _this = $(this);
			var child = _this.find('i');
			scoreType = child.attr('data-scoreType');
			child.addClass('tp_radied').removeClass('tp_radio').parent('span').siblings().find('i').removeClass('tp_radied').addClass('tp_radio');
		});
		
		$('#ok').off().on('click',function(){
			
			var examName = $examName.val();
			var examTime = $examTime.val();
			if(examName==''){
				_common.showMsg("考试名称不能为空!");
				return;
			}
			if( examTime == ''){
				_common.showMsg("考试时间不能为空!");
				return;
			}
			//成绩类型
			if(scoreType == -1){
				_common.showMsg('成绩类型不能为空!');
				return;
			}
			examName = _common.filterXss(examName);
			var params = {
					userId : _common.getUuid(),
					schoolCode : _common.getSchoolCode(),
					examDate : (new Date(examTime).getTime())+'',
					pcName : examName,
					scoreType : parseInt(scoreType)
				};
			if(isClick){
				return;
			}
			isClick = true;
//			console.log('参数：'+JSON.stringify(params));
				addExamBatch(params, function(){
					var params = {
							userId : _common.getUuid(),
							schoolCode : _common.getSchoolCode(),
							"pageNo" : 1,
						    "pageSize" : 20
						};
						getExamBatch(params,function(result){
							initScoreList(result,function(){
								initPageEvent();
								
							},1)
						});
						
						$("#popAddScore").fadeOut(200,function(){
							isClick = false;
						});
				});
				
		});
		
		$createScore.off().on('click',function(){
			$examName.val("");
			$examTime.val("");
			$("#popAddScore").fadeIn();
		})
	}
	
	/**
	 * 初始化编辑按钮
	 * @param pcId 批次id
	 * @param pcName 批次名
	 * @param examDate 批次考试时间
	 * @param pcEbUnique 批次业务Id
	 */
	function initEditExam(pcId,pcName,examDate,pcEbUnique,scoreType){
		var _pcId = pcId;
		var $editCenecl = $('#editCenecl');
		var $editExamTime = $('#editExamTime');
		var $editExamName = $('#editExamName');
		var $editOk = $('#editOk');
		console.log('编辑:'+scoreType);
		if(scoreType==-1){
			//没有选过
			$('#popEditScore .line_none span i').removeClass('tp_radied').addClass('tp_radio');
		}else if(scoreType == 1){
			$('#popEditScore .line_none span').eq(0).find('i').addClass('tp_radied').removeClass('tp_radio').parent('span').siblings().find('i').removeClass('tp_radied').addClass('tp_radio');
			//$('#popEditScore .line_none span').eq(0).find('i').addClass('tp_radio').remove('tp_radied');
		}else if(scoreType == 2){
			$('#popEditScore .line_none span').eq(1).find('i').addClass('tp_radied').removeClass('tp_radio').parent('span').siblings().find('i').removeClass('tp_radied').addClass('tp_radio');
			//$('#popEditScore .line_none span').eq(1).find('i').addClass('tp_radio').remove('tp_radied');
		}
		$editCenecl.off().on('click',function(){
			$('#popEditScore').fadeOut();
			//$('#popEditScore .line_none span i').removeClass('tp_radied').addClass('tp_radio');
		});
		$editExamTime.val(examDate);
		$editExamName.val(pcName);
		
		
		$editExamTime.off().on('click',function(){
			_common.layDate('#editExamTime',1);
		});
		
//		$('#popEditScore .line_none span').on('click',function(){	
//			var _this = $(this);
//			var child = _this.find('i');
//			scoreType = child.attr('data-scoreType');
//			child.addClass('tp_radied').removeClass('tp_radio').parent('span').siblings().find('i').removeClass('tp_radied').addClass('tp_radio');
//		});
		
		$editOk.off().on('click',function(){
			if(isClick){
				return;
			}
			var _examName = _common.filterXss($editExamName.val());
			var params = {
					userId : _common.getUuid(),
					schoolCode : _common.getSchoolCode(),
					pcId : _pcId,
				    pcName : _examName,
				    scoreType:parseInt(scoreType),
				    examDate :new Date($editExamTime.val()).getTime()+""
				};
//			return;
			editExamBatch(params, function(){
				$('#popEditScore').fadeOut();
				//刷新单条批次 
				var _params = {
						userId : _common.getUuid(),
						schoolCode : _common.getSchoolCode(),
						pageNo :1,
						pageSize:1,
						pcId:_pcId
				}
				isClick = true;
				getExamBatch(_params, function(data){
					var json = data[0];
					$('#'+json.pcId).find('.tit_time').html(qt_util.formatDate(json.examDate,'yyyy-MM-dd'));
					$('#'+json.pcId).find('span[data-pcName]').html(json.pcName);
					isClick = false;
					initPageEvent();
				});
			})
		});
	}

	/**
	 * 初始化成绩列表
	 */
	function initExamBatch(pageNo){
		var params = {
			userId : _common.getUuid(),
			schoolCode : _common.getSchoolCode(),
			pageNo : pageNo,
		    pageSize : 20
		};
		getExamBatch(params,function(data){
			initScoreList(data,function(){
				initPageEvent();
			},pageNo);
		})
	}
	
	/**
	 * 初始化成绩列表页面
	 * @param result 成绩的数据
	 * @param pageno 页码
	 */
	function initScoreList(result,cback,pageno){
		var html = new Array();
		for(var i=0;i<result.length;i++){
			var item = result[i];
			html.push('<div id="'+item.pcId+'" class="scorlist_box">');
			var scoreType=-1;
			if(item.scoreType){
				scoreType = item.scoreType
			}
			html.push('<div class="dy_tit"><a href="javascript:;" class="bt_del" data-pcId="'+item.pcId+'" data-pcEbUnique="'+item.pcEbUnique+'" >删除</a><a href="javascript:;" class="bt_edit" data-pcId="'+item.pcId+'" data-pcName="'+item.pcName+'" data-examDate="'+item.examDate+'" data-pcEbUnique="'+item.pcEbUnique+'" data-scoreType="'+scoreType+'" >编辑</a><span data-pcName='+item.pcName+'>'+item.pcName+'</span><span class="tit_time">'+qt_util.formatDate(item.examDate,'yyyy-MM-dd')+'</span></div>')
			html.push('<div class="dy_con">');
			html.push('<ul>');
			if(item.importFileList.length>0){
				var _len = item.importFileList.length;
				for(var j=0;j<_len;j++){
					var list = item.importFileList[j];
					var _fileName = (list.importFileName.length>=20)?(list.importFileName.substr(0,20) + "..."):(list.importFileName);
					if(list.importState == 2){
						html.push('<li> <span class="li_tit">'+_fileName+'</span> <span class=" li_state"><a href="'+list.importSuccessResult+'">查看处理结果</a></span> <span class="li_time">'+(list.importFile?qt_util.formatDate(list.importDate,'yyyy-MM-dd hh:mm:ss'):'')+'</span> </li>');
					}else{
						//(file.name.length<=20?file.name:(file.name.substr(0,17) + '...'))
						html.push('<li> <span class="li_tit">'+_fileName+'</span> <span class=" li_state"><b class="ing">处理中...</b><a href="javascript:;" class="bt_ref" data-pcId="'+item.pcId+'" data-pcEbUnique="'+list.pcEbUnique+'" style="text-decoration: none;color:#5C7894;">刷新</a></span> <span class="li_time">'+(list.importFile?qt_util.formatDate(list.importDate,'yyyy-MM-dd hh:mm:ss'):'')+'</span> </li>');
					}
				}
			}
			html.push('</ul>');
			html.push('<div class="import_box"><a href="javascript:;" class="bt_import a_upload">导入成绩<div id="'+item.pcId+'_import" class="import_file" data-pcEbUnique="'+item.pcEbUnique+'" >&nbsp;</div></a><a class="txt_down" href="'+requestUrl.templateUrl+'">点击下载模板</a>,按照模板格式填入学生成绩信息</div>');
			html.push('</div>');
			html.push('<div class="scorlist_from"><span class="tip_txt">温馨提示：重复导入会覆盖之前的成绩记录</span>已导入<b>'+(item.importSuccessCount?item.importSuccessCount:"0")+'</b>个学生成绩信息，<a href="javascript:;" data-importSuccessResult="'+item.importSuccessDetail+'" data-importSuccessCount="'+item.importSuccessCount+'" class="detailed">查看明细</a><a href="javascript:;" class="bt_send" data-isImport="false" data-pcId="'+item.pcId+'" data-importSuccessCount="'+item.importSuccessCount+'">成绩发送</a></div>')
			html.push('</div>');
			
		}
		$('#scoreList').html(html.join(''));
		if(result.length == _PAGESIZE){
			//只有填满的时候才会触发页码增加
			_PAGENO = pageno;
		}
		cback && cback();
	}
	
	/**
	 * 初始化页面的按钮事件
	 */
	function initPageEvent(){
		var targetListBox = $('#scoreList');
		//绑定导入事件
		var $bindList = $('.scorlist_box .dy_con .import_box .bt_import .import_file');
		$bindList.each(function(){
			var _this = $(this);
			var id = _this.attr('id');
			var pcEbUnique = _this.attr('data-pcEbUnique');
//			$('#'+id).off().on('click',function(){
//				console.log('id-->'+id);
//			})
			initFileUpload(id,pcEbUnique);
		});
		//绑定成绩发布
		var isClick = false;
		targetListBox.find('.scorlist_box .scorlist_from .bt_send').off().on('click',function(){
			var _this = $(this);
			var pcId = _this.attr('data-pcId');
			var isPromt = _this.attr('data-isImport');
			if(isPromt == 'true'){
				_common.showMsg('正上传文件中，请稍后再试。');
				return ;
			}
			var num = _this.parent().find('b').html();
			if(parseInt(num) <=0){
				_common.showMsg('没有学生,不能发布成绩!');
				return;
			}
			var params = {
					userId : _common.getUuid(),
					schoolCode : _common.getSchoolCode(),
					pcId :pcId
			}
			
			if(isClick){
				return;
			}
			isClick = true;
			_common.showMsg({
				title : "提示",
				msg:"是否发送该条成绩批次。",
				btnText:"取消",
				okcallback : function(){
					pushScore(params, function(){
						_common.showMsg('成功发布了成绩！');
						isClick = false;
					});
				},
				callback : function(){
					isClick = false;
				}
			},true);
			
			
		});
		//绑定删除批次
		targetListBox.find('.scorlist_box .dy_tit a.bt_del').off().on('click',function(){
			var _this = $(this);
			_common.showMsg({
				title : "提示",
				msg:"是否删除该条成绩批次。",
				btnText:"取消",
				okcallback : function(){
					var pcId = _this.attr('data-pcId');
					var pcEbUnique = _this.attr('data-pcEbUnique');
					var params = {
							userId : _common.getUuid(),
							schoolCode : _common.getSchoolCode(),
							pcId :pcId,
							pcEbUnique:pcEbUnique
					}
					delExamBatch(params, function(){
						//刷新页面
						var pageNo = 1;
						var params = {
								userId : _common.getUuid(),
								schoolCode : _common.getSchoolCode(),
								pageNo :pageNo,
								pageSize:20
						}
						getExamBatch(params, function(data){
							initScoreList(data,function(){
								initPageEvent();
							},pageNo);
						});
					});
				}
			},true)
		});
		//绑定明细
		targetListBox.find('.scorlist_box .scorlist_from a.detailed').off().on('click',function(){
			var _this = $(this);
			var importSuccessCount = _this.attr('data-importSuccessCount');
			//window.location.href
			if(importSuccessCount > 0){
				var importSuccessResult = _this.attr('data-importSuccessResult');
				if(importSuccessResult == "undefined"){
					_common.showMsg('联接地址无效!');
					return;
				}
				window.location.href = importSuccessResult;
//				window.location.href = 'http://ks3.weixiao100.cn/exam/excelfile/demo/%E6%88%90%E7%BB%A9%E5%8F%91%E9%80%81%E6%A8%A1%E6%9D%BF2.xlsx';
			}else{
				_common.showMsg('没有学生,没有下载地址!');
			}
		});
		//绑定修改
		targetListBox.find('.scorlist_box .dy_tit a.bt_edit').off().on('click',function(){
			var _this = $(this);
			$('#popEditScore').fadeIn();
			var pcId = _this.attr('data-pcId');
			var pcName = $('#'+pcId).find('span[data-pcName]').text();
			var examDate = $('#'+pcId).find('.tit_time').text();
			var pcEbUnique = _this.attr('data-pcEbUnique');
			var scoreType = _this.attr('data-scoreType');
			initEditExam(pcId,pcName, examDate,pcEbUnique,scoreType);
		});
		
		//绑定刷新
		targetListBox.find('.scorlist_box .dy_con .li_state a.bt_ref').off().on('click',function(){
			var _this = $(this);
			var _pcId = _this.attr('data-pcId');
			var pcEbUnique = _this.attr('data-pcEbUnique');
			var params = {
					userId : _common.getUuid(),
					schoolCode : _common.getSchoolCode(),
					pageNo :1,
					pageSize:1,
					pcId : _pcId
			}
			getExamBatch(params, function(data){
				var json = data[0];
				var html = new Array();
				for(var i=0;i<data.length;i++){
					var item = data[i];
					html.push('<div class="dy_tit"><a href="javascript:;" class="bt_del" data-pcId="'+item.pcId+'" data-pcEbUnique="'+item.pcEbUnique+'" >删除</a><a href="javascript:;" class="bt_edit" data-pcId="'+item.pcId+'" data-pcName="'+item.pcName+'" data-examDate="'+item.examDate+'" data-pcEbUnique="'+item.pcEbUnique+'"  data-scoreType="'+item.scoreType+'" >编辑</a><span data-pcName='+item.pcName+'>'+item.pcName+'</span><span class="tit_time">'+qt_util.formatDate(item.examDate,'yyyy-MM-dd')+'</span></div>')
					html.push('<div class="dy_con">');
					if(item.importFileList.length>0){
						html.push('<ul>');
						var _len = item.importFileList.length;
						for(var j=0;j<_len;j++){
							var list = item.importFileList[j];
							var _fileName = ((list.importFileName.length<=20)?list.importFileName:(list.importFileName.substr(0,20) + '...'));
							if(list.importState == 2){
								html.push('<li> <span class="li_tit">'+_fileName+'</span> <span class=" li_state"><a href="'+list.importSuccessResult+'">查看处理结果</a></span> <span class="li_time">'+(list.importFile?qt_util.formatDate(list.importDate,'yyyy-MM-dd hh:mm:ss'):'')+'</span> </li>');
							}else{
								html.push('<li> <span class="li_tit">'+_fileName+'</span> <span class=" li_state"><b class="ing">处理中...</b><a href="javascript:;" class="bt_ref" data-pcId="'+item.pcId+'" data-pcEbUnique="'+list.pcEbUnique+'" style="text-decoration: none;color:#5C7894;">刷新</a></span> <span class="li_time">'+(list.importFile?qt_util.formatDate(list.importDate,'yyyy-MM-dd hh:mm:ss'):'')+'</span> </li>');
							}
						}
						html.push('</ul>');
					}
					html.push('<div class="import_box"><a href="javascript:;" class="bt_import a_upload">导入成绩<div id="'+item.pcId+'_import" class="import_file" data-pcEbUnique="'+item.pcEbUnique+'" >&nbsp;</div></a><a class="txt_down" href="'+requestUrl.templateUrl+'">点击下载模板</a>,按照模板格式填入学生成绩信息</div>');
					html.push('</div>');
					html.push('<div class="scorlist_from"><span class="tip_txt">温馨提示：重复导入会覆盖之前的成绩记录</span>已导入<b>'+(item.importSuccessCount?item.importSuccessCount:"0")+'</b>个学生成绩信息，<a href="javascript:;" data-importSuccessResult="'+item.importSuccessDetail+'" data-importSuccessCount="'+item.importSuccessCount+'" class="detailed">查看明细</a><a href="javascript:;" data- class="bt_send" data-isImport="false" data-pcId="'+item.pcId+'" data-importSuccessCount="'+item.importSuccessCount+'">成绩发送</a></div>')
				}
				$('#'+json.pcId).html(html.join(''));
				initPageEvent();
			});
		});
	}

	/**
	 * 获取批次列表（分页）
	 * @param pageno 页码
	 */
	var _PAGESIZE = 20;
	var _batchCache = {};
	var _PAGENO = 0;
	var _listLoading = false;
	function getBatchList(pageno){
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}
		var params = {
			'userId' : uuid,
			'schoolCode' : schoolCode,
			'pageSize' : _PAGESIZE,
			'page' : pageno
		};

		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		getExamBatch(params,function(data){
			_listLoading = false;
			_common.hideProgress();
			initScoreList(data,function(){
				initPageEvent();
			},pageno);
		});
	}
	//加载下一页
	function loadNextBatch(){
		if(_listLoading){
			return;
		}
		getBatchList((_PAGENO +1));
	}
	/************************************业务相关 end************************************/
	
	/************************************服务层相关************************************/
	/**
	 * 获取成绩批次
	 * @param	params 传入参数
	 * 			userId :用户id
	 * 			schoolCode : 学校id
	 * 			pcEbUnique : 批次的业务id (为空获取所有批次,用于页面获取单个批次所)
	 * 			pageNo : 查询的分页 (整型)
	 * 			pageSize : 分页大小,每页记录数 (整型) 
	 */
	var scoreListSize = 0;
	function getExamBatch(params,callback){
		_common.post2(requestUrl.getExamBatch,params,function(rtn){
			if('001' == rtn.resultCode){
				var result = rtn.items;
				scoreListSize = result.length;
				
				if(result.length <= 0){
					$('#noData').show();
					$('#mainPage .nicescrollWrapper').hide();
				}else{
					$('#noData').hide();
					$('#mainPage .nicescrollWrapper').show();
				}
				
				callback && callback(result);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	/**
	 * 添加批次
	 * @param   params 传入参数
	 * 			userId :用户id
	 * 			schoolCode : 学校id
	 *          examDate :考试时间 (毫秒值的字符串)
	 *          pcName : 批次名
	 */
	function addExamBatch(params,cback){
		_common.post2(requestUrl.addExamBatch,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	/**
	 * 修改批次
	 * @param 	params 传入参数
	 * 			userId :用户id
	 * 			schoolCode : 学校id
	 *          pcId :批次id 
	 *          pcName : 批次名
	 *          examDate : 考试时间(毫秒值的字符串)
	 */
	function editExamBatch(params,cback){
		_common.post2(requestUrl.editExamBatch,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	/**
	 * 删除批次
	 * @param 	params 传入参数
	 * 			userId :用户id
	 * 			schoolCode : 学校id
	 *          pcId :批次id 
	 */
	function delExamBatch(params,cback){
		_common.post2(requestUrl.delExamBatch,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	
	/**
	 * 成绩发送
	 * @param 	params 传入参数
	 * 	 		userId :用户id
	 * 			schoolCode : 学校id
	 *          pcId :批次id 
	 */
	function pushScore(params,cback){
		_common.post2(requestUrl.pushScore,params,function(rtn){
			if('001' == rtn.resultCode){
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
			cback && cback();
		});
	}
	
	
	/**
	 * 初始化文件上传
	 * @param id 需要打开上传的控件id
	 */
	var isImport = false;
	function initFileUpload(id,pcEbUniqueId){
		var importId = '#'+id;
		var userId = _common.getUuid();
		var schoolCode = _common.getSchoolCode();
		var uploader = WebUploader.create({
			auto: true,
		    // swf文件路径
			swf: './plugin/webuploader/Uploader.swf',
			method:'POST',
		    // 文件接收服务端。
			server: requestUrl.uploadScore,
			formData:{pcEbUnique:pcEbUniqueId,schoolCode:schoolCode,userId:userId},
		    // 选择文件的按钮。可选。
		    pick: importId,
		    resize: false
		});
		// 当有文件被添加进队列的时候
		var _id=id.split("_import");
		
		var html = new Array();
		html.push('#');
		html.push(_id[0]);
		var textId = $(html.join(''));
		var fileName = textId.find('.dy_con .li_tit');
		var _listId='';
		uploader.on( 'fileQueued', function( file ) {
			isImport = true;
			    _listId=new Date().getTime();
				var str = new Array();
				str.push('<li id="'+_listId+'">');
				str.push('<span class="li_tit">'+(file.name.length<=20?file.name:(file.name.substr(0,20) + '...'))+'</span> ');
				str.push('<span class=" li_state"><b class="ing" data-pcEbUniqueId="'+pcEbUniqueId+'" >处理中...</b><a href="javascript:;" class="bt_ref" data-pcId="'+_id[0]+'" data-pcEbUnique="'+pcEbUniqueId+'" style="text-decoration: none;color:#5C7894;">刷新</a></span>');
				str.push('<span class="li_time">'+qt_util.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')+'</span>');
				str.push('</li>');
				textId.find('.dy_con ul').prepend(str.join(''));
				
				//定时刷新该条批次
				var re = textId.find(' .dy_con ul a.bt_ref');
				var _pcId = re.attr('data-pcId');
				var pcEbUnique = re.attr('data-pcEbUnique');
				var params = {
						userId : _common.getUuid(),
						schoolCode : _common.getSchoolCode(),
						pageNo :1,
						pageSize:1,
						pcId : _pcId
				}
				
				textId.find('.scorlist_from b').html('0');
				textId.find('.scorlist_from a.bt_send').attr('data-isImport',"true");
				var ref = setInterval(function(){
					getExamBatch(params, function(rtn){
						var data = rtn;
						var _firstData = data[0].importFileList[0];
						//更新该条批次信息。
						textId.find('.scorlist_from b').html(data[0].importSuccessCount);
						textId.find('.scorlist_from a.detailed').attr('data-importSuccessCount',data[0].importSuccessCount);
						textId.find('.scorlist_from a.detailed').attr('data-importSuccessResult',data[0].importSuccessDetail);

						if(_firstData.importState == 2){
							var firstFile = textId.find(' .dy_con ul li').first();
							textId.find('.scorlist_from a.bt_send').attr('data-isImport',"false");
							isImport = false;
							firstFile.html('<li> <span class="li_tit">'+_firstData.importFileName+'</span> <span class=" li_state"><a href="'+_firstData.importSuccessResult+'">查看处理结果</a></span> <span class="li_time">'+(_firstData.importFile?qt_util.formatDate(_firstData.importDate,'yyyy-MM-dd hh:mm:ss'):'')+'</span> </li>');
							clearInterval(ref);
							var pcName = textId.find('.dy_tit span[data-pcname]').html();
							_common.tips('success','导入成绩批次【'+pcName+'】成功');
						}
					});
				},3000);
		});
		
		// 文件上传过程中进度。
		uploader.on( 'uploadProgress', function( file, percentage ) {
			console.log('uploadProgress');
		});

		// 文件上传成功，
		uploader.on( 'uploadSuccess', function( file ) {
			console.log('uploadSuccess');
		});

		// 文件上传失败，显示上传出错。
		uploader.on( 'uploadError', function( file ) {
			console.log('uploadError');
			var idHtml = new Array();
			idHtml.push('#');
			idHtml.push(_listId);
			var _Id = $(idHtml.join(''));
			$('#'+_listId).find('.li_state').html('<b class="ing">fail,请检查文件类型</b></span>');
		});
		
		//文件上传到服务端响应后
		uploader.on('uploadAccept',function(object,ret){
			console.log('uploadAccept');
			//已有文件正上传中
			if(ret.resultCode == '002'){
				_common.showMsg("已有文件正上传中,请稍后再试!");
				setTimeout(function(){
					$('#'+_listId).remove();
				},1000)
			}else if(ret.resultCode == '000'){
				$('#'+_listId).find('.li_state').html('<b class="ing">fail,请检查文件类型</b></span>');
			}
			initPageEvent();
		})
		// 完成上传完了，成功或者失败，
		uploader.on( 'uploadComplete', function( file ) {
		});
		
	}
	
	/************************************服务层相关end************************************/
	
	//切换到详情
	function switchToDetail(){
		_slideobj&&_slideobj.right();
		window.parent.setWinTitle&&window.parent.setWinTitle('成绩列表');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('成绩列表');
		});
	}

	//业务入口
	initPage();
	
	module.exports = qt_model;

});
