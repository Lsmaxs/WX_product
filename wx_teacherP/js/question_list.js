define(function(require, exports, module) {

	/**
	 * @desc 
	 * @exports
	 * @version 1.8.5
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model={};

	var $ = require("jquery");
	var qt_util = require('qt/util');
	var qt_ui = require('qt/ui');
	var _common = require('./common');
	var _config = require('./config');
	require('./copytext');

	//json插件
	require('jquery/json');
	//滚动条美化插件
	require('jquery/nicescroll');


	//服务
	var _SERVICE = _common.SERVICE;
	//图片前缀
	var _IMG_PREFIX = _config.IMG_PREFIX;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//初始化页面切换
	var _slideobj = null;
	function initSlide(initIndex){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		_slideobj = qt_ui.slide({id:'qtslide',initIndex:(initIndex?initIndex:0)});
		//自定义滚动条
		var _nociscroll = null;
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
			if(!_nociscroll){
				_nociscroll = obj;
			}
		})
		//方便调试
		window.goLeft = function(){
			_slideobj.left();
		}
		window.goRight = function(){
			_slideobj.right();
		}

        //动态加载
		if(_nociscroll){
			var niceobj = $(_nociscroll).getNiceScroll(0);
			niceobj.onscrollend=function(info){
				if(info.end.y + 100 >= niceobj.page.maxh ){
					loadNextPage();
				}
			}
		}
	}

	//------------------------列表相关 begin---------------------------//

	//获取通知列表（分页）
	var _PAGESIZE = 20;
	var _listCache = {};
	var _PAGENO = 0;
	var curPageNo=0;
	var _listLoading = false;
	var wholeSurveyRang = -1;//全局的surveyRang,
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
			'pageSize' : _PAGESIZE,
			'page' : pageno,
			'surveyRang' : wholeSurveyRang
		};

		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/survey/list',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					if(!_listCache[''+item.surveyUnique]){
						//没有加载过的才进行插入
						html.push('<div class="queslist_box" id="'+item.surveyUnique+'">');
						html.push('	<div class="dy_tit">');
						if(1 == item.status){
							html.push('<span class="edit_ok">进行中</span><a href="javascript:;" class="btn_offdy" data-uniqueid="'+item.surveyUnique+'">关闭问卷</a>');
						}else if(0 == item.status){
							html.push('	    <span class="edit_ing">编辑中</span>');
						}else if(2 == item.status){
							html.push('	    <span class="edit_void">已关闭</span>');
						}else{
							//no status show
						}
						if(item.surveyRang == 2 && item.status!=0){
							html.push('<a href="javascript:;" data-surveyunique ="'+item.surveyUnique+'" class="btn_copylink">复制链接</a>');
						}
						html.push('<span class="'+(item.surveyRang==1?"neibu":"gongkai")+'">'+(item.surveyRang==1?"内":"开")+'</span>');
						html.push('	    <a href="javascript:;" data-surveyRang="'+item.surveyRang+'" data-uniqueid="'+item.surveyUnique+'" data-publishState="'+item.publishState+'">'+item.subject+'</a>');
						html.push('	</div>');
						html.push('	<div class="dy_con">'+(item.remark?item.remark:'&nbsp;')+'</div>');
						html.push('	<div class="queslist_from">');
						html.push('<a href="javascript:;" class="del_ques" data-surveyUnique="'+item.surveyUnique+'" ></a>')
						var waitStr='';
						var _numUnit='';
						if(item.objectName){
							waitStr = (item.countNum>1?'等':waitStr);
							if(item.countNum>1){
								waitStr = '等';
								_numUnit = item.countNum+'个群组';
							}
							html.push('		<div class="dy_ans fl">'+item.objectName+waitStr+'<b>'+_numUnit+'</b></div>');
						}else{
							if(item.surveyRang == 2){
								html.push('		<div class="dy_ans fl">回答人数：<b>'+item.answerNum+'</b></div>');
							}else{
								html.push('		<div class="dy_ans fl">调研人数/回答人数：<b>'+item.countNum+'/'+item.answerNum+'</b></div>');
							}
						}
						
						html.push('		<div class="time fl text_r">'+item.createTime+'</div>');
						html.push('	</div>');
						html.push('</div>');

						_listCache[''+item.surveyUnique] = 1;
					}
				}
				$('#questionList').append(html.join(''));

				//切换数据
				if(1 == pageno && items.length<=0){
					$('#questionList').hide();
					$('#noData').show();
					//$('.quesbar').hide();
					$('#mainPage').css({'background':'#fff'});
				}else{
					$('#questionList').show();
					$('.quesbar').show();
					$('#noData').hide();
				}
				curPageNo = pageno;
				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_PAGENO = pageno;
				}

				//绑定点击事件
				$('#questionList').off().on('click','a[data-uniqueid]',function(){
					//绑定点击
					var _this = $(this);
					var uniqueid = _this.attr('data-uniqueid');
					if(!uniqueid){
						return;
					}
					var publishState = _this.attr('data-publishstate');
					if('0' == publishState){
						//编辑中
						var rang = _this.attr('data-surveyRang');
						gotoSendPage(uniqueid,rang);
					}else if('1' == publishState){
						//已经发布
						loadDetail(uniqueid);
					}else{
						//废弃等，do nothing
					}
				}).on('click','.btn_offdy',function(){
					//绑定废弃按钮  关闭问卷
					var _this = $(this);
					var uniqueid = _this.attr('data-uniqueid');
					if(!uniqueid){
						return;
					}
					cancelSurvey(uniqueid,function(){
						_this.hide();
						_this.prev().attr('class','edit_void').html('已关闭');
						_this.prev().next().attr('data-publishstate','-1');
					});
					return false;
				}).on('click','.del_ques',function(){
					//绑定删除按钮
					var _this = $(this);
					var surveyunique = _this.attr('data-surveyunique');
					showDelPop(surveyunique);
				}).on('click','.btn_copylink',function(){
					var _this = $(this);
					var surveyunique = _this.attr('data-surveyunique');
					showCopyPop(surveyunique);
					
				});
				
				
				
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


	//停止该问卷
	function cancelSurvey(surveyUnique,callback){
		_common.showMsg({
			msg : '您确认要关闭问卷吗?',
			btnText:'取消',
			okcallback : function(){
				var params = {
					'uuid' : _common.getUuid(),
					'schoolCode' : _common.getSchoolCode(),
					'surveyUnique' : surveyUnique,
					'status' : 3
				};
				_common.showProgress();
				_common.post(_SERVICE+'/webapp/survey/close',params,function(rtn){
					_common.hideProgress();
					if('001' == rtn.resultCode){
						_common.showMsg('问卷已经关闭');
						callback && callback();
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_common.showMsg(rtn.resultMsg);
					}
				});
			}
		});
	}

	//------------------------列表相关 end-----------------------------//

	
	//------------------------详情相关 begin---------------------------//

	//是否加载中
	var _loading = false;

	//字母表
	var alphabet = ['','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

	//当次详情
	var _detailCache = null;

	//加载并显示
	function loadDetail(uniqueid,isNotSwitch){
		if(_loading){
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
			'surveyUnique' : uniqueid
		};
		_loading = true;
		_detailCache = null;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/survey/detail',params,function(rtn){
			_loading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				//保存临时状态便于查看名单
				_detailCache = rtn;

				$('#detail_theme').html(rtn.subject);
				$('#detail_remark').html(rtn.remark);
				var _num='';
				if(rtn.objectName){
					_num = rtn.surveyNum;
				}else{
					_num = rtn.countNum;
				}
				var html_title = new  Array();
				if(rtn.surveyRang == 2){
					html_title.push('<img src="'+_common.getHeadUrl()+'"/> '+rtn.createTime+' &nbsp;&nbsp;&nbsp;&nbsp;回答人数：<b>'+rtn.answerNum+'</b>');
				}else{
					html_title.push('<img src="'+_common.getHeadUrl()+'"/> '+rtn.createTime+' &nbsp;&nbsp;&nbsp;&nbsp;调研人数/回答人数：<b>'+_num+'/'+rtn.answerNum+'</b>');
				}
				html_title.push('<span class="quesdetail_botton">');
				html_title.push('<a data-status="'+rtn.status+'" data-surveyUnique="'+rtn.surveyUnique+'" class="btn_gray" href="javascrit:;">导出本题表格</a>');
				if(rtn.status !=2){
					html_title.push('<a data-surveyUnique="'+rtn.surveyUnique+'" href="javascrit:;" class="botton_guanbi">关闭问卷</a>');
				}
				html_title.push('</span>');
				if(rtn.status == 0){
					html_title.push('<em class="edit_ing" style="color:#ff3f42;">编辑中</em>');
				}else if(rtn.status == 1){
					html_title.push('<em>进行中</em>');
				}else if(rtn.status == 2){
					html_title.push('<em class="edit_void" style="color: #999;">已关闭</em>');
				}else if(rtn.status == 3){
					html_title.push('<em class="edit_void">已删除</em>');
				}
				html_title.push('<div class="ts_offwenjuan" style="display:none;"></div>');
				$('#detail_info').html(html_title.join(''));
				
				var html = new Array();
				html.push('<ul>');

				for(var i=0;i<rtn.questions.length;i++){
					var item = rtn.questions[i];

					var answerType = '文字单选';
					if(2 == item.answerType){
						answerType = '文字多选';
					}
					if(3 == item.answerType){
						answerType = '填空';
					}

					var useNumIndex = item.options.length>=alphabet.length;
					if(1 == item.type){
						var sign = 1 == item.sign;
						//文字类型
						html.push('	<li>');
						if(rtn.surveyRang == 2){
							//公开问卷
																																																															//item.answerType
							html.push('		<div class="h2">'+(1+i)+'、'+item.questContent+'<span>（'+answerType+'题，回答人数：<b>'+rtn.answerNum+'</b>）</span>'+(item.answerType==3?'<a href="javascript:;" data-questionSeq="'+item.questionSeq+'"  class="bt_quesname">查看结果</a>':'')+'</div>');
						}else{
							//内部问卷
							html.push('		<div class="h2">'+(1+i)+'、'+item.questContent+'<span>（'+(sign?'记名':'不记名')+' | '+answerType+'题，回答人数：<b>'+rtn.answerNum+'</b>）</span>'+(sign?'<a href="javascript:;" data-questionSeq="'+item.questionSeq+'"  class="bt_quesname">查看名单</a>':'')+'</div>');
						}
						for(var j=0;j<item.options.length;j++){
							var opt = item.options[j];
							var percent = rtn.answerNum>0?(Math.floor(10000*opt.checkNum/rtn.answerNum)/100):0;
//							html.push('		<div class="txt_li">'+(useNumIndex?(1+j):alphabet[(1+j)])+'、'+opt.optContent+'<b>（'+percent+'%）</b>'+(sign?'<a href="javascript:;" class="bt_quesname"  data-questionSeq="'+(1+i)+'" data-optionsSeq="'+(1+j)+'" >查看名单</a>':'')+'</div>');
							html.push('		<div class="txt_li">'+(useNumIndex?(1+j):alphabet[(1+j)])+'、'+opt.optContent+'<b>（'+percent+'%）</b></div>');
						}
						html.push('	</li>');
					}else if(2 == item.type){
						//图片类型
						var sign = 1 == item.sign;
						html.push('<li>');
						html.push('	<div class="h2">');
						if(rtn.surveyRang == 2){
							html.push('		'+(1+i)+'、'+item.questContent+'<span>（ 图片'+answerType+'题，回答人数：<b>'+rtn.answerNum+'</b>）</span><br/>');
						}else{
							html.push('		'+(1+i)+'、'+item.questContent+'<span>（'+(sign?'记名':'不记名')+' | 图片'+answerType+'题，回答人数：<b>'+rtn.answerNum+'</b>）</span>'+(sign?'<a href="javascript:;" data-questionSeq="'+(item.questionSeq)+'" class="bt_quesname">查看名单</a>':'')+'<br/>');
						}
						
						if(item.attachPicUrl){
							//问题有背景图
							html.push('		<a href="javascript:;"><img src="'+_IMG_PREFIX+item.attachPicUrl+'"  onerror="winErrorImg(this);" /></a>');
						}
						html.push('	</div>');
						for(var j=0;j<item.options.length;j++){
							var opt = item.options[j];
							var percent = rtn.answerNum>0?(Math.floor(10000*opt.checkNum/rtn.answerNum)/100):0;
							html.push('	<div class="tu_li">');
							html.push('		<a href="javascript:;" class="tu_li_imgwrap"><img src="'+_IMG_PREFIX+opt.attachPicUrl+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
							html.push('		<span class="tu_li_opt">'+(useNumIndex?(1+j):alphabet[(1+j)])+(opt.optContent?'、'+opt.optContent:'')+'</span>');
							html.push('		<b>（'+percent+'%）</b>');
							if(sign){
								//html.push('		<a href="javascript:;" class="bt_quesname" data-questionSeq="'+(1+i)+'" data-optionsSeq="'+(1+j)+'">查看名单</a>');
							}
							html.push('	</div>');
						}
						html.push('</li>');
					}else if(3 == item.type){
						//图文类型
						var sign = 1 == item.sign;
						html.push('<li>');
						html.push('	<div class="h2">');
						if(rtn.surveyRang == 2){
							html.push('		'+(1+i)+'、'+item.questContent+'<span>（ 图文说明题）</span><br/>');
						}else{
							html.push('		'+(1+i)+'、'+item.questContent+'<span>（  图文说明题）</span><br/>');
						}
						
						
						html.push('	</div>');
						html.push('<div class="tu_li_mayun">');
						html.push('<a href="javascript:;" class="tu_li_imgwrap"><img src="'+_IMG_PREFIX+item.attachPicUrl+'" onload="winFixImg(this);" onerror="winErrorImg(this);" /></a>');
						html.push('</div>');
						
						html.push('</li>');
					}else{
						//do nothing
					}
				}
				html.push('</ul>');

				//去除上次的内存数据
				$('.bt_quesname').off();

				$('#detail_questionlist').html(html.join(''));

				//绑定查看名单
				$('.bt_quesname').off().on('click',function(){
					var _this = $(this);
					var questionSeq = _this.attr('data-questionSeq');
					//var optionsSeq = _this.attr('data-optionsSeq');
					load2Names(uniqueid,questionSeq);
				});
				
				$('#detail_questionlist').off().on('click','.tu_li_imgwrap img',function(){
					var _this = $(this); 
					var _src = _this.attr('src');
					_common.showImgs([_src]);
					return false;
				}).on('click','.h2 img',function(){
					var _this = $(this);
					var _this = $(this); 
					var _src = _this.attr('src');
					_common.showImgs([_src]);
					return false;
				});
				
				//绑定关闭问卷按钮
				var isexport = false;
				$('#detail_info').off().on('click','.botton_guanbi',function(){
					var _this = $(this);
					var surveyUnique = _this.attr('data-surveyUnique');
					cancelSurvey(surveyUnique,function(){
						_this.hide();
						_this.parent().next().css('color','#999').html('已关闭');
						_this.prev().attr('data-status',2);
						//同时修改列表中的状态。
						$('#'+surveyUnique).find('.dy_tit .btn_offdy').hide().next().attr('data-publishstate','-1');
						$('#'+surveyUnique).find('.dy_tit .edit_ok,.dy_tit .edit_ing').attr('class','edit_void').html('已关闭');
					});

					
				}).on('click','.btn_gray',function(){
					if(isexport){
						return false;
					}
					var _this = $(this);
					var surveyUnique = _this.attr('data-surveyUnique');
					var status = _this.attr('data-status');
					if(status != 2){
						$('.ts_offwenjuan').fadeIn().fadeOut(1000);
						return false;
					}
					var params = {
							'uuid' : _common.getUuid(),
							'schoolCode' : _common.getSchoolCode(),
							'surveyUnique' : surveyUnique,
						};
					isexport = true;
					_common.showProgress();
					_common.post(_SERVICE+'/webapp/survey/export',params,function(rtn){
						isexport = false;
						_common.hideProgress();
						if('001' == rtn.resultCode){
							if(rtn.fileUrl){
								window.location.href = rtn.fileUrl;
							}else{
								_common.showMsg('问卷未有用户回答，暂时无法下载');
							}
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.showMsg(rtn.resultMsg);
						}
					});
					
				});
				//绑定导出问卷按钮
				

				//数据填充完成，切换界面
				(!isNotSwitch)&&switchToDetail();

			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}


	//切换到详情
	function switchToDetail(){
		_slideobj&&_slideobj.right();
		$('.quesbar').hide();
		window.parent.setWinTitle&&window.parent.setWinTitle('问卷详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			$('.quesbar').show();
			window.parent.setWinTitle&&window.parent.setWinTitle('问卷列表');
		});
	}
	//------------------------详情相关 end-----------------------------//


	//------------------------名单相关 begin---------------------------//

	//加载名单并切换
	function loadNames(uniqueid,questionSeq,optionsSeq){
		if(_loading){
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
			'surveyUnique' : uniqueid,
			'questionSeq' : questionSeq,
			'optionsSeq' : optionsSeq
		};
		_loading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/survey/optdetial',params,function(rtn){
			_loading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var title = _detailCache.questions[parseInt(questionSeq)-1];
				var opt = title.options[parseInt(optionsSeq)-1];

				var useNumIndex = title.options.length>=alphabet.length;

				$('#quesNameTitle').html('对于问题<b>“'+title.questContent+'”</b>他们选择了<em>'+(useNumIndex?optionsSeq:alphabet[optionsSeq])+'</em>：');

				var html = new Array();
				if('2' == title.type){
					html.push('<a href="javascript:;"><img src="'+_IMG_PREFIX+opt.attachPicUrl+'" onload="winFixImg(this);" onerror="winErrorImg(this);" /></a>');
				}
				var percent = _detailCache.answerNum>0?(Math.floor(10000*opt.checkNum/_detailCache.answerNum)/100):0;
				html.push((useNumIndex?optionsSeq:alphabet[optionsSeq])+(opt.optContent?'. '+opt.optContent:'')+'<br/><b>('+opt.checkNum+'人/'+percent+'%)</b>');
				$('#quesNameOpt').html(html.join(''));

				if(opt.checkNum <=0){
					//没人选择
					$('#quesNameNodata').show();
					$('#quesNameUl,#quesNamePager').hide();
				}else{
					//有人选择
					//填充数据
					var datas = rtn.items;
					var pageSize = 12;
					fillNames(datas,1,pageSize);
					$('#quesNamePager').off().on('click','a',function(){
						var _this = $(this);
						var pageNo = _this.attr('data-pageNo');
						if(pageNo){
							fillNames(datas,pageNo,pageSize);
						}
					});
					//显示数据
					$('#quesNameUl,#quesNamePager').show();
					$('#quesNameNodata').hide();
				}
				$('#quesName').css({
					'min-height':(winSize.height -50)+'px'
				});
				updateScrollBar();
				//切换到实名
				switchToNames();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	//切换到名单2
	function load2Names(uniqueid,questionSeq){
		if(_loading){
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
			'surveyUnique' : uniqueid,
			'questionSeq' : questionSeq,
		};
		_loading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/survey/detail',params,function(rtn){
			_loading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var question = rtn.questions[0];
				$('#quesNameTitle').html('对于问题<b>“'+question.questContent+'”</b>的问题，选择了各个答案的用户：');
				if(rtn.surveyRang == 2){
					$('.quesname_botton').hide();
					var params = {
							'uuid' : uuid,
							'schoolCode' : schoolCode,
							'surveyUnique' : uniqueid,
							'questionSeq' : questionSeq
					};
					_common.showProgress();
					_common.post(_SERVICE+'/webapp/survey/optdetial',params,function(rtn){
						_common.hideProgress();
						if('001' == rtn.resultCode){
							if(rtn.items.length >0){
								var datas = rtn.items;
								var pageSize = 12;

								fillNames(datas,1,pageSize,2);
								$('#quesNamePager').off().on('click','a',function(){
									var _this = $(this);
									var pageNo = _this.attr('data-pageNo');
									if(pageNo){
										fillNames(datas,pageNo,pageSize,2);
									}
								});
								$('#quesNameNodata,#quesNameUl').hide();
								$('#quesName_table,#quesNamePager').show();
								

							}else{
								$('#quesNameNodata').show();
								$('#quesName_table,#quesNamePager,#quesNameUl').hide();
							}
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.showMsg(rtn.resultMsg);
						}
					});
				}else{
					//选择列表
					var html = new Array();
					if( rtn.questions.length == 1 && rtn.questions[0].answerType == 3){
						//填空题。
						$('.quesname_botton').hide();
						var params = {
								'uuid' : uuid,
								'schoolCode' : schoolCode,
								'surveyUnique' : uniqueid,
								'questionSeq' : questionSeq
						};
						_common.showProgress();
						_common.post(_SERVICE+'/webapp/survey/optdetial',params,function(rtn){
							_common.hideProgress();
							if('001' == rtn.resultCode){
								if(rtn.items.length >0){
									var datas = rtn.items;
									var pageSize = 12;

									fillNames(datas,1,pageSize,2);
									$('#quesNamePager').off().on('click','a',function(){
										var _this = $(this);
										var pageNo = _this.attr('data-pageNo');
										if(pageNo){
											fillNames(datas,pageNo,pageSize,2);
										}
									});
									$('#quesNameNodata,#quesNameUl').hide();
									$('#quesName_table,#quesNamePager').show();
									

								}else{
									$('#quesNameNodata').show();
									$('#quesName_table,#quesNamePager,#quesNameUl').hide();
								}
							}else if('202' == rtn.resultCode){
								_common.lostLogin();
							}else{
								_common.showMsg(rtn.resultMsg);
							}
						});
						
					}else{
						//其他题型。
						var useNumIndex = question.options.length>=alphabet.length;
						console.log("len:"+ question.options.length);
						for(var i=0;i<question.options.length;i++){
							var item = question.options[i];
							var percent = rtn.answerNum>0?(Math.floor(10000*item.checkNum/rtn.answerNum)/100):0;
							html.push('<a  data-questionSeq="'+item.questionSeq+'" data-optionsSeq="'+(item.optionSeq)+'" href="javascrit:;" class="'+(i==0?'':'botton_guanbi')+'">'+(useNumIndex?(i+1):(alphabet[1+i]))+'、'+percent+'%</a>')
						}
						$('.quesname_botton').html(html.join('')).show();
						
						//绑定选项按钮事件
						$('.quesname_botton').off().on('click','a',function(){
							var _this = $(this);//
							_this.removeClass('botton_guanbi').siblings().addClass('botton_guanbi');
							var questionSeq = _this.attr('data-questionSeq');
							var optionsSeq = _this.attr('data-optionsSeq');
							
							var params = {
									'uuid' : uuid,
									'schoolCode' : schoolCode,
									'surveyUnique' : uniqueid,
									'questionSeq' : questionSeq,
									'optionsSeq' : optionsSeq
							};
							_common.showProgress();
							_common.post(_SERVICE+'/webapp/survey/optdetial',params,function(rtn){
								_common.hideProgress();
								if('001' == rtn.resultCode){
									if(rtn.items.length >0){
										//有人选择
										var datas = rtn.items;
										var pageSize = 12;

										fillNames(datas,1,pageSize,1);
										$('#quesNamePager').off().on('click','a',function(){
											var _this = $(this);
											var pageNo = _this.attr('data-pageNo');
											if(pageNo){
												fillNames(datas,pageNo,pageSize,1);
											}
										});
										//显示数据
										$('#quesNameUl,#quesNamePager').show();
										$('#quesNameNodata,#quesName_table').hide();
									}else{
										$('#quesNameNodata').show();
										$('#quesNameUl,#quesNamePager,#quesName_table').hide();
									}
									$('#quesName').css({
										'min-height':(winSize.height -50)+'px'
									});
									updateScrollBar();
								}else if('202' == rtn.resultCode){
									_common.lostLogin();
								}else{
									_common.showMsg(rtn.resultMsg);
								}
							});
							
						});
						//查询第一个选项的人员列表
						$('.quesname_botton a').first().click();						
					}
					
				}
				
				updateScrollBar();
				//切换到实名页面。
				switchToNames();
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}

	//切换到名单
	function switchToNames(){
		_slideobj&&_slideobj.right();
		window.parent.setWinTitle&&window.parent.setWinTitle('名单详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('问卷详情');
		});
	}

	//根据数据填充第n页用户
	function fillNames(data,pageNo,pageSize,questionType){
		var begin = (pageNo-1)*pageSize;
		//因为for循环是小于，所以不减1
		var end = pageNo*pageSize;
		if(begin <0){
			begin = 0;
		}
		if(end >data.length){
			end = data.length;
		}
		var html = new Array();
		if(questionType == 1){
			for(var i=begin;i<end;i++){
				var item = data[i];
				html.push('<li><img src="'+item.userPic+'" onerror="this.src=\'./images/user_pace.png\';"/>'+item.name+'<b>'+item.remark+'</b><br/><em>'+item.phone+'</em></li>');
			}
			$('#quesNameUl').html(html.join(''));
		}else if(questionType == 2){
			for(var i=begin;i<end;i++){
				
				var item = data[i];
				html.push('<tr>	<td>'+(item.name?item.name:'游客')+'</td><td>'+item.optionCountent+'</td><td>'+(item.createTime?qt_util.formatDate(item.createTime,'yyyy-MM-dd'):qt_util.formatDate(new Date(),'yyyy-MM-dd'))+'</td> </tr>');
			}
			$('#quesName_table tbody').html(html.join(''));
		}
		
		
		//填充页码
		var pageTotal = Math.ceil(data.length/pageSize);
		var pageBegin = pageNo - 2;
		var pageEnd = pageNo + 2;
		if(pageTotal <=5 ){
			pageBegin = 1;
			pageEnd = pageTotal;
		}else{
			//大于5页
			if(pageBegin<=0){
				//溢出0端
				var pageBegin = 1;
				var pageEnd = 5;
			}else if(pageEnd > pageTotal){
				//溢出末端
				var pageBegin = pageTotal-5 +1;
				var pageEnd = pageTotal;
			}else{
				//do nothing
			}
		}
		//计算好边界值，插入数据
		html = new Array();
		html.push('<a href="javascript:;" data-pageNo="'+(pageBegin>1?1:(parseInt(pageNo)-1))+'">&lt;</a>');

		for(var i=pageBegin;i<=pageEnd;i++){
			html.push('<a href="javascript:;" class="'+(pageNo == i?'sel':'')+'" data-pageNo="'+i+'">'+i+'</a>');
		}
		html.push('<a href="javascript:;" data-pageNo="'+(pageBegin<=pageTotal?(parseInt(pageNo)+1):'')+'">&gt;</a>');
		$('#quesNamePager').html(html.join(''));
	}

	//------------------------名单相关 end-----------------------------//


	//更新滚动条
	function updateScrollBar(){
		 var slides = $('.qt-slide-wrap > div');
		 slides.each(function(index,obj){
			var scrollobj = $(obj).getNiceScroll();
			scrollobj.each(function(){
				this.resize();
			})
		})
	}

	//发布问卷按钮
	$('#questionsendBtn').click(function(){
		//窗口打开参数
		//gotoSendPage();
		showAddPop();
	});

	//跳转到发送页
	function gotoSendPage(surveyUnique,type){
		var options = {};
		options.key = 'questionsend';
		options.url = './question_send.html'+(surveyUnique?('?surveyUnique='+surveyUnique)+'&':'')+"" +(type?('?type='+type):'');
		options.title =  '新建问卷';
		options.callback = function(){
			//do nothing
		}
		window.parent.closeWin&&window.parent.closeWin({
			isSwitch : true,
			callback : function(){
				window.parent.openWin&&window.parent.openWin(options);
			}
		});
	}


	//业务入口
	var detailid = qt_util.P('detailid');
	if(detailid){
		initSlide(1);
		loadDetail(detailid,true);
		window.parent.setWinTitle&&window.parent.setWinTitle('问卷详情');
		$('.quesbar').hide();
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			$('.quesbar').show();
			window.parent.setWinTitle&&window.parent.setWinTitle('问卷列表');
		});
	}else{
		initSlide();
	}
	//查询第一页数据
	getList(1);

	//~~~~~~~~~~~~~~~~~~~新增需求部分~~~~~~~~~~~~~~~~~~~~~~~~~//
	function initSelectEvent(){
		//选择 校内，校外问卷
		var $selectQuestion = $('#select_question');
		$selectQuestion.off().on('click',function(){
			$selectQuestion.focus().find('ul').show();
			return false;
		}).mouseleave(function(){
			$selectQuestion.find('ul').hide();
			return false;
		});
		
		//下拉列表的事件
		$selectQuestion.find('ul').off().on('click','li',function(){
			var _this = $(this);
			var name = _this.html();
			var surveyRang = _this.attr('data-value');
			wholeSurveyRang = surveyRang;
			//TODO 查询列表
			var uuid =  _common.getUuid();
			if(!uuid){
				return;
			}
			var schoolCode = _common.getSchoolCode();
			if(!schoolCode){
				return;
			}
			var pageno = 1;
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'pageSize' : _PAGESIZE,
				'page' : pageno,
				'surveyRang':surveyRang
			};

			if(_listLoading){
				return;
			}
			_listLoading = true;
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/survey/list',params,function(rtn){
				_listLoading = false;
				_common.hideProgress();
				if('001' == rtn.resultCode){
					var html = new Array();
					_listCache={};//清空列表缓存。
					var items = rtn.items;
					for(var i=0;i<items.length;i++){
						var item = items[i];
						if(!_listCache[''+item.surveyUnique]){
							//没有加载过的才进行插入
							html.push('<div class="queslist_box" id="'+item.surveyUnique+'">');
							html.push('	<div class="dy_tit">');
							if(1 == item.status){
								html.push('<span class="edit_ok">进行中</span><a href="javascript:;" class="btn_offdy" data-uniqueid="'+item.surveyUnique+'">关闭问卷</a>');
							}else if(0 == item.status){
								html.push('	    <span class="edit_ing">编辑中</span>');
							}else if(2 == item.status){
								html.push('	    <span class="edit_void">已关闭</span>');
							}else{
								//no status show
							}
							if(item.surveyRang == 2 && item.status!=0){
								html.push('<a href="javascript:;"data-surveyunique ="'+item.surveyUnique+'" class="btn_copylink">复制链接</a>');
							}
							html.push('<span class="'+(item.surveyRang==1?"neibu":"gongkai")+'">'+(item.surveyRang==1?"内":"开")+'</span>');
							html.push('	    <a href="javascript:;" data-surveyRang="'+item.surveyRang+'" data-uniqueid="'+item.surveyUnique+'" data-publishState="'+item.publishState+'">'+item.subject+'</a>');
							html.push('	</div>');
							html.push('	<div class="dy_con">'+(item.remark?item.remark:'&nbsp;')+'</div>');
							html.push('	<div class="queslist_from">');
							html.push('<a href="javascript:;" class="del_ques" data-surveyUnique="'+item.surveyUnique+'" ></a>')
							var waitStr='';
							var _numUnit='';
							if(item.objectName){
								waitStr = (item.countNum>1?'等':waitStr);
								if(item.countNum>1){
									waitStr = '等';
									_numUnit = item.countNum+'个群组';
								}
								html.push('		<div class="dy_ans fl">'+item.objectName+waitStr+'<b>'+_numUnit+'</b></div>');
							}else{
								if(item.surveyRang == 2){
									html.push('		<div class="dy_ans fl">回答人数：<b>'+item.answerNum+'</b></div>');
								}else{
									html.push('		<div class="dy_ans fl">调研人数/回答人数：<b>'+item.countNum+'/'+item.answerNum+'</b></div>');
								}
							}
							
							html.push('		<div class="time fl text_r">'+item.createTime+'</div>');
							html.push('	</div>');
							html.push('</div>');

							_listCache[''+item.surveyUnique] = 1;
						}
					}
					$('#questionList').html(html.join(''));

					//切换数据
					if(1 == pageno && items.length<=0){
						$('#questionList').hide();
						$('#noData').show();
						$('#mainPage').css({'background':'#fff'});
					}else{
						$('#questionList').show();
						$('.quesbar').show();
						$('#noData').hide();
					}
					curPageNo = pageno;
					if(items.length == _PAGESIZE){
						//只有填满的时候才会触发页码增加
						_PAGENO = pageno;
					}

					//绑定点击事件
					$('#questionList').off().on('click','a[data-uniqueid]',function(){
						//绑定点击
						var _this = $(this);
						var uniqueid = _this.attr('data-uniqueid');
						if(!uniqueid){
							return;
						}
						var publishState = _this.attr('data-publishstate');
						if('0' == publishState){
							//编辑中
							var rang = _this.attr('data-surveyRang');
							gotoSendPage(uniqueid,rang);
						}else if('1' == publishState){
							//已经发布
							loadDetail(uniqueid);
						}else{
							//废弃等，do nothing
						}
					}).on('click','.btn_offdy',function(){
						//绑定废弃按钮  关闭问卷
						var _this = $(this);
						var uniqueid = _this.attr('data-uniqueid');
						if(!uniqueid){
							return;
						}
						cancelSurvey(uniqueid,function(){
							_this.hide();
							_this.prev().attr('class','edit_void').html('已关闭');
							_this.prev().next().attr('data-publishstate','-1');
						});
						return false;
					}).on('click','.del_ques',function(){
						//绑定删除按钮
						var _this = $(this);
						var surveyunique = _this.attr('data-surveyunique');
						showDelPop(surveyunique);
					}).on('click','.btn_copylink',function(){
						var _this = $(this);
						var surveyunique = _this.attr('data-surveyunique');
						showCopyPop(surveyunique);
						
					});
					
					$selectQuestion.find('em').html(name);
					$selectQuestion.find('ul').hide();
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
				}
			});
			
			
		});
		
	}
	initSelectEvent();
	
	//弹出删除问卷弹层
	function showDelPop(surveyUnique){
		var box = $('#ques_del_pop');
		//关闭按钮
		box.off().on('click','.botton_guanbi',function(){
			box.popupClose();
		});
		
		//确定按钮
		$('#delete_question').off().on('click',function(){
			var _this = $(this);
			var params = {
					'uuid' : _common.getUuid(),
					'schoolCode' : _common.getSchoolCode(),
					'surveyUnique' : surveyUnique,
				};
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/survey/delete',params,function(rtn){
				_common.hideProgress();
				if('001' == rtn.resultCode){
					_common.showMsg('问卷已删除了');
					$('#'+surveyUnique).remove();
					box.popupClose();
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.showMsg(rtn.resultMsg);
				}
			});
		});
		box.popupOpen({
			maskOpacity : 0
		});
	}
	//弹出复制链接弹层
	function showCopyPop(targetUuid){
		var box = $('#ques_copy_pop');
		var _SERVICE = 'https://'+location.hostname;
		$('#copy_content').val(_SERVICE+'/fronts/xywh/html/survey/note_open.html?nu=' + targetUuid);
		//关闭按钮
		box.off().on('click','.botton_guanbi',function(){
			box.popupClose();
		});
		
		//确定按钮
		$('#copy_link').off().on('click',function(){
			setTimeout(function(){box.popupClose();},800);
		});
		box.popupOpen({
			maskOpacity : 0
		});
	}
	//
	//弹出新建问卷弹层
	function showAddPop(targetUuid){
		var box = $('#ques_add_pop');
		//关闭按钮
		box.off().on('click','.close',function(){
			box.popupClose();
		});
		
		//校内按钮
		$('#ques_xiaonei').off().on('click',function(){
			gotoSendPage(null,1);
			return false;
		});
		//公开按钮
		$('#ques_gongkai').off().on('click',function(){
			gotoSendPage(null,2);
			return false;
		});
		box.popupOpen({
			maskOpacity : 0
		});
	}
	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
