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
	// var _noticeListService = 'http://'+location.hostname;

	//获取窗口大小
	var winSize = qt_util.getViewSize();

	//初始化页面切换
	var _slideobj = null;
	function initSlide(initIndex){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.nicescrollContainer').css({width:_width+'px',height:_height+'px'}).show();
		_slideobj = qt_ui.slide({id:'qtslide',initIndex:(initIndex?initIndex:0)});
		//自定义滚动条
		var _nociscroll = slides.eq(0);
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
		if(_nociscroll){
			var niceobj = $(_nociscroll).getNiceScroll(0);
			niceobj.onscrollend=function(info){
				if(info.end.y + 100 >= niceobj.page.maxh ){
					loadNextPage();
				}
			}
		}
	}


	//------------------------------列表相关 begin------------------------------//

	//初始化消息列表
	function initNoticeList(){
		//绑定点击事件
		$('#noticeList').off().on('click','[data-detail="1"]',function(){
			//跳转到详情
			var _this = $(this);
			var noticeUnique = _this.attr('data-noticeUnique');
			if(!noticeUnique){
				return;
			}
			loadNoticeDetail(noticeUnique);
		}).on('click','.func_del',function(){
			//绑定删除
			var _this = $(this);
			var noticeUnique = _this.attr('data-noticeUnique');
			if(!noticeUnique){
				return;
			}
			delNotice(noticeUnique,function(){
				$('#noticeList li[data-noticeUnique="'+noticeUnique+'"]').remove();
				updateScrollBar();
			});
		});
	}
	
	//获取通知列表（分页）
	var _PAGESIZE = 10;
	var _listCache = {};
	var _PAGENO = 0;
	var _listLoading = false;
	function getNoticeList(pageno){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'pageSize' : _PAGESIZE,
			'page' : pageno
		};

		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/notice/list',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var items = rtn.items;
				fillNoticeList(items);

				//切换数据
				if(1 == pageno && items.length<=0){
					$('#noticeList').hide();
					$('#noData').show().find('a').off().click(function(){
						parent&&parent.setWinTitle&&parent.setWinTitle('发通知');
						location.href='./notice_send.html';
					});
					$('#mainPage').css({'background':'#fff'});
				}

				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_PAGENO = pageno;
				}
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	//填充列表数据
	function fillNoticeList(items) {
    	var html = new Array();
    	for (var k = 0; k < items.length;k++) {
    	    var item = items[k];
    		if (!_listCache['' + item.noticeUnique]) {
    	        var imgs = [];
    	    	var files = [];
    	        html.push('<li data-noticeUnique="' + item.noticeUnique + '">');
    	        html.push('<h2>' + item.createTime + '</h2>');
    	        html.push('<div class="tb_con"><div class="tb_txt">');
    	        html.push('<p>');
    	        html.push('<a href="javascript:;" data-detail="1" data-noticeUnique="' + item.noticeUnique + '">' +_deCoding(item.content)+ '</a></p>');
    	        if (item.attachment.length > 0) {
    	            for (var j = 0; j < item.attachment.length; j++) {
    	                var _attachment = item.attachment[j];
    	                if (1 == _attachment.type) {
    	                    imgs.push(_attachment);
    	                } else if (2 == _attachment.type) {
    	                    files.push(_attachment);
    	                }
    	            }
    	            if (imgs.length > 0) {
    	                html.push('<p>');
    	                for (var i = 0; i < imgs.length; i++) {
    	                    html.push('<a href="javascript:;" class="imgwrapper"><img src="' + imgs[i].url + '" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>')
    	                }
    	                html.push('</p>');
    	            }
    	            if (files.length > 0) {
    	                html.push('<div class="fj_tit">');
    	                for (var i = 0; i < files.length; i++) {
    	                    var _type = '';
    	                    if(files[i].fileName){
    	                    	var _fileType =	files[i].fileName.substring(files[i].fileName.lastIndexOf('.')+1);
    	                  	 	var _fileName = files[i].fileName.substring(0,files[i].fileName.lastIndexOf('.'));
    	                    }else{
    	                    	 var _holeName = files[i].url.substring(files[i].url.lastIndexOf('/')+1);
    	                    	 _fileType = _holeName.split('.')[1];
    	                    	 _fileName = _holeName.split('.')[0];
    	                    }
    	                    if (_fileType == 'ppt' || _fileType == 'pptx') {
    	                        _type = 'ppt';
    	                    } else if (_fileType == 'doc' || _fileType == 'docx') {
    	                        _type = 'doc';
    	                    } else if (_fileType == 'xls' || _fileType == 'xlsx') {
    	                        _type = 'xls';
    	                    }else if(_fileType == 'pdf'){
    	                   		_type= 'pdf';
    	                   	}
    	                    html.push('<span><i class="file_' + _type + '"></i>' + (_fileName.length > 15 ? _fileName.substring(0, 15) + '...' : _fileName) + '.' + _fileType);
    	                    html.push('</span>');
    	                }
    	                html.push('</div>');
    	            }
    	        }
    	        html.push('</div>共发给' + (item.readNum + item.unReadNum) + '人');
    	        html.push('（已读' + item.readNum + '人，' + '未读<em>' + item.unReadNum + '</em>人）');
    	        html.push('<a class="bt_det" href="javascript:;" data-detail="1" data-noticeUnique="' + item.noticeUnique + '">详细</a>');
    	        html.push('<span class="func_box">');
    	        html.push('	<a class="func_del" href="javascript:;" data-noticeUnique="' + item.noticeUnique + '">删除</a>| ');
    	        html.push('	<a class="func_mess" href="javascript:;" data-detail="1" data-noticeUnique="' + item.noticeUnique + '">'+(item.newUserCommNum?'留言(' + item.newUserCommNum + ')':'无未读留言')+'</a>');
    	        html.push('</span>');
    	        html.push('</div>');
    	        html.push('</li>');
    	        _listCache['' + item.noticeUnique] = 1;
    	    }
    	}
    	$('#noticeList').append(html.join(''));
    }

    // 服务器端已过滤富文内容的html标签，但未过滤&nbsp;等字符，现对富文本内容中的&nbsp;等字符进行反转义
    function _deCoding(str) {
        var REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
        var HTML_DECODE = {
            // "&lt;": "<",
            // "&gt;": ">",
            "&amp;": "&",
            "&nbsp;": " ",
            "&quot;": "\"",
            "&copy;": "",
            "&ensp;":" ",
           	"&emsp;":" "
             // Add more  
         };
        str=str.replace(REGX_HTML_DECODE,  
            function($0,$1){  
                var c = HTML_DECODE[$0];  
                if(c == undefined){  
                    // Maybe is Entity Number  
                    if(!isNaN($1)){  
                        c = String.fromCharCode(($1==160)?32:$1);  
                    }else{  
                        c = $0;  
                    }  
                }  
            return c;  
        });  
    	return str; 
    }


	//加载下一页
	function loadNextPage(){
		if(_listLoading){
			return;
		}
		getNoticeList((_PAGENO +1));
	}

	//------------------------------列表相关 end--------------------------------//


	//------------------------------详情相关 begin------------------------------//

	//加载并显示
	var _loading = false;
	function loadNoticeDetail(noticeUnique,isNotSwitch){
		if(_loading){
			return;
		}
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'noticeUnique' : noticeUnique
		};
		_loading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/notice/detail',params,function(rtn){
			_loading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				//填充详情
				var item = rtn;
				$('#detail_time').html(item.createTime);
				$('#detail_del').attr('data-noticeUnique',item.noticeUnique);
				var html = new Array();
				html.push('<div class="det_text" style="word-break:break-all;">'+item.content+'</div>');
				html.push('<br/>');
				var imgs = [];
				var files = [];
				if (item.attachment.length > 0) {
    	           //有附件
    	           for (var j = 0; j < item.attachment.length; j++) {
    	               var _attachment = item.attachment[j];
    	               if (1 == _attachment.type) {
    	                   imgs.push(_attachment);
    	                   // html.push('<a href="javascript:;" class="imgwrapper"><img src="'+_attachment.url+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
    	               } else if (2 == _attachment.type) {
    	                   files.push(_attachment);
    	                   // attachHtml = '<br style="clear:left;"/><span class="ach_file"><i class="imgattach">&nbsp;</i>附件</span>';						}
    	               }
    	           }
    	           if (imgs.length > 0) {
    	               html.push('<p>');
    	               for (var i = 0; i < imgs.length; i++) {
    	                   html.push('<a href="javascript:;" class="img_narrow"><img src="' + imgs[i].url + '" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>')
    	               }
    	               html.push('</p>');
    	           }
    	           if (files.length > 0) {
    	               html.push('<div class="fj_tit">');
    	               for (var i = 0; i < files.length; i++) {
    	                   var _type = '';
    	                	if(files[i].fileName){
    	                    	var _fileType =	files[i].fileName.substring(files[i].fileName.lastIndexOf('.')+1);
    	                  	 	var _fileName = files[i].fileName.substring(0,files[i].fileName.lastIndexOf('.'));
    	                    }else{
    	                    	 var _holeName = files[i].url.substring(files[i].url.lastIndexOf('/')+1);
    	                    	 _fileType = _holeName.split('.')[1];
    	                    	 _fileName = _holeName.split('.')[0];
    	                    }
    	                   if (_fileType == 'ppt' || _fileType == 'pptx') {
    	                       _type = 'ppt';
    	                   } else if (_fileType == 'doc' || _fileType == 'docx') {
    	                       _type = 'doc';
    	                   } else if (_fileType == 'xls' || _fileType == 'xlsx') {
    	                       _type = 'xls';
    	                   } else if(_fileType == 'pdf'){
    	                   		_type= 'pdf';
    	                   }
    	                   html.push('<span><i class="file_' + _type + '"></i>' + (_fileName.length > 15 ? _fileName.substring(0, 15) + '...' : _fileName) + '.' + _fileType);
    	                   html.push('<b>'+_readablizeBytes(files[i].size)+'</b><a href="'+files[i].url+'" target="_blank" download="1">下载</a></span>');
    	               }
    	               html.push('</div>');
    	           }
    	        }
				$('#detail_info').html(html.join(''));


				//发送对象描述
				html = new Array();
				html.push('共发给'+(item.readNum+item.unReadNum)+'人');
				$('#detail_target').html(html.join(''));

				//已经读取，未读取
				$('#detail_readlabel').text(item.readNum);
				$('#detail_unreadlabel').text(item.unReadNum);


				//详情与重发
				$('#detail_resend').attr('data-noticeUnique',noticeUnique);
				fillDetailList(item);
				// 根据未读和未关注来隐藏重新发送按钮
				// $('#targetBox').find('.op-checked,.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
				// var _sendTargets = $('.fs_list .op-checked');
				if(!resendFlag){
					$('#resend').hide();
				}else{
					$('#resend').show();
				}
				// $('#targetBox').find('.op-checked,.op-check').removeClass('op-checked').addClass('op-check').data('checked','0');


				//还要填充回复消息
				fillCommont(item);


				//数据填充完成，切换界面
				(!isNotSwitch)&&switchToDetail();
				

			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	// 附件尺寸大小转换(bytes->KB,MB,GB,TB,PB)
	function _readablizeBytes(bytes) {
		var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
		var e = Math.floor(Math.log(bytes)/Math.log(1024));
		return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
	} 


 	
	// 填充阅读情况
	//填充具体的详细人员列表
	function fillDetailList(rtn){
		//填充未读
		var html = new Array();
		$('#detail_total').html('共发给'+(rtn.readNum+rtn.unReadNum)+'人');
		$('#detail_unread').text(rtn.unReadNum);
		$('#detail_read').text(rtn.readNum);
		var classNum = rtn.unReadMen.classItems.length
		var isHideClass = !!(classNum<3);
		//填充学生
		var result = rtn.unReadMen.classItems;
		if(classNum >0){
			html.push('<a href="javascript:;" class="operate-all"><span class="op-check"></span>学生<span class="jt_up"></span></a>');
			html.push('<div class="classlist">');
			for(var i=0;i<classNum;i++){
				var item = result[i];
				var childs = item.students;
				var wgzList=new Array();
				var stuGzCount=0;
				var wgzCount=0;
				var isFollow='';
				var noFollow='';
				var isFollowStr='';
				for(var j=0;j<childs.length;j++){
					var _curStufollow = childs[j].followed;
					var child = childs[j];
					if(1 ==_curStufollow){
						//有关注
						stuGzCount++;
						isFollowStr+='<a href="javascript:;" class="operate-btn"><span class="op-check" data-uuid="'+child.userId+'" data-userType=3 data-name="'+child.name+'"></span>'+child.name+'</a>';
					}else{
						//没关注
						wgzCount++;
						wgzList.push(child.name);
						// noFollowStr+='<a href="javascript:;" class="operate-btn"><span class="op-check" data-uuid="'+child.userId+'" data-sendtype="1" data-name="'+child.name+'"></span>'+child.name+'</a>';
					}
				}
				html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.classCode+'" data-name="'+item.className+'">'+(stuGzCount?'<span class="op-check"></span>':'')+item.className+'<em>共'+(childs.length?childs.length:'0')+'人</em><span class="jt_up"></span></a>');
				html.push('<div class="fs_list" >');
				isFollow='<div class="gz_tit" style="display:block"><p>已关注<em>'+stuGzCount+'人</em></p>'+isFollowStr;
				noFollow=' <div class="wgz_tit" style="display:block"><p>未关注<em>'+wgzCount+'人</em></p> <div class="unread_list">';
				noFollow+=wgzList.join('、');
				noFollow+='</div></div>';
				isFollow+='</div>';
				html.push(isFollow);
				html.push(noFollow);
				html.push('</div>');
				if(result[i+1]){
					html.push('<hr/>');
				}
			}
			html.push('</div>');
			$('#studentBox').html(html.join(''));
			var gzClassCount = $('.classlist').find('.op-check');
			if(gzClassCount.size()<=0){
				$('#studentBox').show();
				$('#studentBox').find('.operate-all .op-check').remove();
			}
		}else{
			$('#studentBox').html('').hide();
		}

		//填充教师
		html = new Array();
		result = rtn.unReadMen.teaItems;
		var wgzList=new Array();
		var teaGzCount=0;
		var wgzCount=0;
		if(result.length >0){
			html.push('<a href="javascript:;" class="operate-all"><span class="op-check"></span>教师<span class="jt_up"></span></a>');
			var isFollow='';
			var noFollow='';
			var isFollowStr='';
			html.push('<div class="fs_list">');
			for(var i=0;i<result.length;i++){
				var item = result[i];
				var _curTeafollow = item.followed;
				if(_curTeafollow== 1){
					//有关注
					teaGzCount++;
					isFollowStr+='<a href="javascript:;" class="operate-btn"><span class="op-check" data-uuid="'+item.userId+'" data-userType=1 data-name="'+item.name+'"></span>'+item.name+'</a>';
				}else{
					//没关注
					wgzCount++;
					wgzList.push(item.name);
				}
			}
			isFollow='<div class="gz_tit" ><p>已关注<em>'+teaGzCount+'人</em></p>'+isFollowStr;
			noFollow=' <div class="wgz_tit"><p>未关注<em>'+wgzCount+'人</em></p><div class="unread_list">'+wgzList.join('、');
			noFollow+='</div></div>';
			isFollow+='</div>';
			html.push(isFollow);
			html.push(noFollow);
			html.push('</div>');
			html.push('</div>');
			$('#teacherBox').html(html.join(''));
		}else{
			$('#teacherBox').html('').hide();
		}
		stuGzCount=stuGzCount?stuGzCount:0;
			if((teaGzCount+stuGzCount)>0){
				resendFlag = true;
				$('#teacherBox').show();
			}else{
				resendFlag=false;
				$('#detail_unreadBtn') && $('#detail_unreadBtn').hide();
				$('#teacherBox').find('.op-check').remove();
		}
		

		// 填充已读列表
		var classNum = rtn.readMen.classItems.length
		html = new Array();
		//填充学生
		var result = rtn.readMen.classItems;
		if(classNum >0){
			html.push('<a href="javascript:;" class="operate-all">学生<span class="jt_up"></span></a>');
			html.push('<div class="classlist")>');
			for(var i=0;i<classNum;i++){
				var item = result[i];
				var childs = item.students;
				var stuReadList=new Array();
				html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.classCode+'" data-sendtype="2" data-name="'+item.className+'">'+item.className+'<em>共'+(childs.length?childs.length:'0')+'人</em><span class="jt_up"></span></a>');
				html.push('<div class="read_list">');
				for(var j=0;j<childs.length;j++){
					var child = childs[j];
					stuReadList.push(child.name);
				}
				html.push(stuReadList.join('、'));
				html.push('</div>');
				if(result[i+1]){
					html.push('<hr/>');
				}
			}
			html.push('</div>');
			$('#readStudentBox').html(html.join(''));
			$('#readStudentBox').show();
		}else{
			$('#readStudentBox').hide();
		}
		

		// 填充教师
		html = new Array();
		result = rtn.readMen.teaItems;
		var readTeaList=new Array();
		if(result.length >0){
			html.push('<a href="javascript:;" class="operate-all">教师<span class="jt_up"></span></a>');
			html.push('<div class="read_list">');
			for(var i=0;i<result.length;i++){
				var item = result[i];
				readTeaList.push(item.name);
			}
			html.push(readTeaList.join('、'));
			html.push('</div>');
			$('#readTeacherBox').html(html.join(''));
			$('#readTeacherBox').show();
		}else{
			$('#readTeacherBox').hide();
		}
		

		// 已读未读切换
		var tabs = 	$('#detailTab a');
		tabs.off().click(function(){
			tabs.removeClass('sel');
			var item=$(this);
			var index = tabs.index(this);
			item.addClass('sel');
			if(0 == index){
				$('#targetBox').show();
				$('#readTargetBox').hide();
				// var sendTarget = $('.fs_list').find('.op-checked, .op-check');
				if(resendFlag){
					$('#detail_unreadBtn').show();
				}
			}else if(1 ==index){
				$('#targetBox').hide();
				$('#readTargetBox').show();
				$('#detail_unreadBtn').hide();
			}
		});

		var targetBox = $('#targetBox,#readTargetBox');
		//绑定全选事件
		targetBox.find('.operate-all .op-check').off().click(function(){
			var item = $(this);
			var box = item.parent().parent();
			if('1' == item.data('checked')){
				//已经勾选变成非勾选
				box.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
				item.data('checked','0');
			}else{
				//非勾选变成已经勾选
				box.find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
				item.data('checked','1');
			}
			return false;
		});
		//绑定全选切换显示
		targetBox.find('.operate-all').off().click(function(){
			var item = $(this);
			if('1' == item.data('fold')){
				//原来已经折叠
				item.data('fold','0');
				item.find('.jt_down').removeClass('jt_down').addClass('jt_up');
				item.next().css('height','0px').show();
				item.next().animate({height:item.next().attr('data-height')+'px'},200,function(){
					item.next().css('height','auto');
					updateScrollBar();
				});
			}else{
				//先保存当前的高度
				item.next().attr('data-height',item.next().height());

				item.data('fold','1');
				item.find('.jt_up').removeClass('jt_up').addClass('jt_down');
				item.next().animate({height:'0px'},200,function(){
					item.next().hide();
					updateScrollBar();
				});
			}
		}).data('fold','0');

		//绑定班级勾选
		targetBox.find('.operate-class .op-check').off().click(function(e){
			var item = $(this);
			var parent = $(this).parent();
			var box = parent.parent().parent();
			if('1' == item.data('checked')){
				item.removeClass('op-checked').addClass('op-check').data('checked','0');
				parent.next().find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');

				//同时修改为非全选
				box.find('.operate-all span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				item.removeClass('op-check').addClass('op-checked').data('checked','1');
				parent.next().find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
			}
			return false;
		});
		//绑定班级详情切换展示
		targetBox.find('.operate-class').off().click(function(){
			var item = $(this);
			if('1' == item.data('fold')){
				//原来已经折叠
				item.data('fold','0');
				item.find('.jt_down').removeClass('jt_down').addClass('jt_up');
				//item.next().slideDown('fast');
				item.next().css('height','0px').show();
				item.next().animate({height:item.next().attr('data-height')+'px'},200,function(){
					updateScrollBar();
				});
			}else{
				item.data('fold','1');
				item.find('.jt_up').removeClass('jt_up').addClass('jt_down');
				//item.next().slideUp('fast');
				item.next().animate({height:'0px'},200,function(){
					item.next().hide();
					updateScrollBar();
				});
			}
		}).data('fold','0');

		//绑定单个学生勾选
		targetBox.find('.fs_list .op-check').off().click(function(){
			var item = $(this);
			var box = item.parent().parent().parent().parent();
			if('1' == item.data('checked')){
				item.removeClass('op-checked').addClass('op-check').data('checked','0');

				//同时修改为非全选
				box.find('.operate-all span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
				//修改班级非全选
				item.parent().parent().prev().find('span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				item.removeClass('op-check').addClass('op-checked').data('checked','1');
			}
		});


		//兼容样式
		targetBox.find('.fs_list').each(function(){
			var _this = $(this);
			var as = _this.find('.gz_tit');
			var aw = _this.find('.wgz_tit');
			var len = as.height()+10;
			var len2 = aw.height()+10;
			// var row = Math.ceil(len/4);
			var _height =Math.ceil(len2+len);
			_this.css({'height':_height+'px'}).attr('data-height',_height);
		});

		targetBox.find('.classlist').each(function(){
			var _this = $(this);
			var as = _this.find('.operate-class');
			var len = as.size();
			var _height = len * 54;
			_this.attr('data-height',_height);
		});

		targetBox.find('.read_list').each(function(){
			var _this = $(this);
			var _height = _this.height()+15;
			_this.attr('data-height',_height);
		})
	}

	//填充评论
	function fillCommont(rtn){

		var html = new Array();

		var commentTabList = rtn.commentTabList;
		for(var i=0;i<commentTabList.length;i++){
			//逐个人填充

			var item = commentTabList[i];
			var commentList = item.commentList;
			var first = commentList[0];

			html.push('<div class="mess_box">');
			html.push('	<a href="javascript:;" class="mess_close"></a>');
			html.push('	<div class="clea_F" data-senderRead="'+item.senderRead+'" data-uuid="'+item.uuid+'" data-noticeUnique="'+rtn.noticeUnique+'">');
			html.push('     <div class="mess_new" '+ (0 != item.senderRead?'style="display:none;"':'') +'></div>');
			html.push('		<div class="mess_head"><img src="'+item.icon+'" /></div>');
			html.push('		<div class="mess_R"><span class="mess_time">'+first.createTime+'</span><span class="mess_name">'+first.commentator+'</span><span class="mess_class">'+item.tag+'</span>');
			html.push('			<p class="mess_infor">'+first.content+'</p>');
			html.push('			<span class="dy_some"></span>');
			html.push('		</div>');
			html.push('	</div>');
			html.push('	<div style="display:none;">');
			for(var j=1;j<commentList.length;j++){
				var commont = commentList[j];
				html.push('		<div class="mess_reply">');
				html.push('			<p class="mess_infor"><span class="mess_name">'+commont.commentator+'：</span>'+commont.content+'</p>');
				html.push('			<p class="mess_time">'+commont.createTime+'</p>');
				html.push('		</div>');
			}
			html.push('		<div class="reply_box">');
			html.push('			<input class="reply_input" placeholder="回复'+item.userName+item.tag+'：" />');
			html.push('			<a href="javascript:;" data-uuid="'+item.uuid+'" data-noticeUnique="'+rtn.noticeUnique+'">发送</a>');
			html.push('		</div>');
			html.push('	</div>');
			html.push('</div>');
		}
		if(html.length>0){
			$('#detail_reply').html(html.join(''));
		}else{
			$('#detail_reply').html('<div style="text-align:center;padding-top:5px;">暂无留言</div>');
		}
		$('#detail_reply').find('.mess_box').last().css('border-bottom','none');

		//人数
		$('#commentNum').text(''+commentTabList.length);
	}


	//初始化详情相关的事件绑定
	function initDetail(){
		//阅读情况
		$('#detail_goDetailList').off().on('click',function(){
				switchToDetailList();
		});

		$('#resend').off().on('click',function(e){
			e.stopPropagation();
			$('#targetBox').find('.op-checked,.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
			var _sendTargets = $('.fs_list .op-checked');
			_common.showMsg({
				msg : '确定要提醒未阅读用户吗？',
				okbtnText : '确定',
				okcallback : function(){
				//获取数据，准备提交
					var uuid =  _common.getUuid();
					if(!uuid){
						_common.lostLogin();
						return;
					}
					var schoolCode = _common.getSchoolCode();
					if(!schoolCode){
						_common.lostLogin();
						return;
					}
					var noticeUnique = $('#detail_resend').attr('data-noticeUnique');
					if(!noticeUnique){
						return;
					}
					var sendTarget = [];
					_sendTargets.each(function(index,obj){
						var _this = $(obj);
						sendTarget.push({
							pkuid : _this.attr('data-uuid'),
							Name :_this.attr('data-name'),
							userType:parseInt(_this.attr('data-userType'))
						});
					});
					var params = {
						'uuid' : uuid,
						'schoolCode' : schoolCode,
						'noticeUnique' : noticeUnique,
						'sendTarget' : sendTarget,
						'simpleContent':$('.det_text').text()
					};
					resending = true;
					_common.showProgress();
					_common.post(_SERVICE+'/webapp/notice/resend',params,function(rtn){
						resending = false;
						_common.hideProgress();
						if('001' == rtn.resultCode){
							_common.tips('success','再次发送完成');
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.tips(rtn.resultMsg);
						}
					});	
				}
			});
			$('#targetBox').find('.op-checked,.op-check').removeClass('op-checked').addClass('op-check').data('checked','0');				
		});

		//删除
		$('#detail_del').off().on('click',function(){
			var noticeUnique = $('#detail_del').attr('data-noticeUnique');
			delNotice(noticeUnique,function(){
				_slideobj&&_slideobj.left(); 
				window.parent.setWinTitle&&window.parent.setWinTitle('通知列表');
				$('#noticeList li[data-noticeunique]').each(function(){
					if($(this).attr('data-noticeunique')==noticeUnique){
						$(this).remove();
						return false;
					}
				})
			});
		});

		//绑定展开留言
		$('#detail_reply').on('click','.clea_F',function(){
			var _this = $(this);
			var flag = _this.parent().find('a').eq(0);
			var box = _this.next();
			if(flag.hasClass('mess_open')){
				//原来已经展开
				box.slideUp('fast',function(){
					updateScrollBar();
				});
				flag.removeClass('mess_open').addClass('mess_close');
			}else{
				box.slideDown('fast',function(){
					updateScrollBar();
				});
				flag.removeClass('mess_close').addClass('mess_open');
			}

			//上报
			var senderRead = _this.attr('data-senderRead');
			if('0' === senderRead){
				//未读取过，要上报已经读取
				_this.find('.mess_new').hide();
				//执行上报
				var commUuid = _this.attr('data-uuid');
				var noticeUnique = _this.attr('data-noticeUnique');
				submitReaded(noticeUnique,commUuid);
				_this.attr('data-senderRead','1');
			}
		});

		//绑定留言回复
		$('#detail_reply').on('click','.reply_box a',function(){
			var _this = $(this);
			var input = _this.prev();
			var _val = $.trim(input.val());
			if(!_val){
				_common.tips('请输入回复内容');
				return;
			}
			if(_val.length>120){
				_common.tips('回复内容请限制在120个字符内');
				return;
			}
			_val = _common.filterXss(_val);
			// console.log('过滤val'+JSON.stringify(_val));
			var noticeUnique = _this.attr('data-noticeUnique');
			var commUuid = _this.attr('data-uuid');
			var params = {
				"noticeUnique":noticeUnique,
				"replyUuid":commUuid,
				"content" : _val
			}
			reply(params,function(rtn){
				var html = new Array();
				html.push('<div class="mess_reply">');
				html.push('	<p class="mess_infor"><span class="mess_name">'+rtn.userName+'：</span>'+rtn.content+'</p>');
				html.push('	<p class="mess_time">'+rtn.createTime+'</p>');
				html.push('</div>');
				_this.parent().before(html.join(''));
				input.val('');
			});
		});

	}

	//上报留言状态
	function submitReaded(noticeUnique,commUuid){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}
		var params = {
			"uuid":uuid,
			"schoolCode":schoolCode,
			"noticeUnique":noticeUnique,
			"commUuid":commUuid
		}
		_common.post(_SERVICE+'/webapp/notice/comment/read',params,function(rtn){
			if('001' == rtn.resultCode){
				//do nothing
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}

	//回复发送对象的留言
	function reply(params,callback){
		var uuid =  _common.getUuid();
		if(!uuid){
			_common.lostLogin();
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			_common.lostLogin();
			return;
		}

		params.uuid = uuid;
		params.schoolCode = schoolCode;
		
		_common.post(_SERVICE+'/webapp/notice/comment/add',params,function(rtn){
			if('001' == rtn.resultCode){
				//do nothing
				callback && callback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.tips(rtn.resultMsg);
			}
		});
	}



	//切换到详情
	function switchToDetail(){
		_slideobj&&_slideobj.right(); 
		window.parent.setWinTitle&&window.parent.setWinTitle('通知详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('通知列表');
		});
	}

	//切换到阅读情况名单
	// 全局重发按钮是否显示 标识
	var resendFlag = false;
	function switchToDetailList(){
		// 默认显示未阅读
		var tabs = $('#detailTab a');
		tabs.removeClass('sel');
		tabs.eq(0).addClass('sel');
		$('#targetBox').show();
		$('#readTargetBox').hide();
		// 根据未读和未关注来显示重新发送按钮
		if(resendFlag){
				$('#detail_unreadBtn')&&$('#detail_unreadBtn').show();
				$('#detail_unreadBtn').css('position','absolute');
		}
		// console.log('阅读详情'+$('#detail_unreadBtn').css('display'));
		_slideobj&&_slideobj.right();
		window.parent.setWinTitle&&window.parent.setWinTitle('阅读情况');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			$('#targetBox').find('.op-checked,.op-check').removeClass('op-checked').addClass('op-check').data('checked','0');
			$('#detail_selectall').removeClass('op-checked').addClass('op-check').data('checked','0');
			$('#detail_unreadBtn')&&$('#detail_unreadBtn').hide();
			// console.log('返回'+$('#detail_unreadBtn').css('display'));
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('通知详情');
		});
	}

	//------------------------------详情相关 end--------------------------------//



	//删除通知
	function delNotice(noticeUnique,callback){
		if(!noticeUnique){
			return;
		}
		_common.showMsg({
			msg : '确定要删除这条通知吗？',
			okbtnText : '是',
			btnText : '否',
			okcallback : function(){
				//获取数据，准备提交
				var uuid =  _common.getUuid();
				if(!uuid){
					_common.lostLogin();
					return;
				}
				var schoolCode = _common.getSchoolCode();
				if(!schoolCode){
					_common.lostLogin();
					return;
				}
				var params = {
					uuid : uuid,
					schoolCode : schoolCode,
					noticeUnique : noticeUnique
				}
				_common.post(_SERVICE+'/webapp/notice/del',params,function(rtn){
					if('001' == rtn.resultCode){
						callback && callback();
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_common.tips(rtn.resultMsg);
					}
				});
			}
		});
	}


	//绑定重新发送
	function initResendBar(){
		//绑定全选
		$('#detail_selectall').off().click(function(){
			var _this = $(this);
			if('1' == _this.data('checked')){
				_this.removeClass('op-checked').addClass('op-check').data('checked','0');
				$('#targetBox').find('.op-checked,.op-check').removeClass('op-checked').addClass('op-check').data('checked','0');
			}else{
				_this.removeClass('op-check').addClass('op-checked').data('checked','1');
				$('#targetBox').find('.op-checked,.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
			}
			return false;
		});

		var resending = false;
		//绑定重新发送
		$('#detail_resend').off().on('click',function(){
			if(resending){
				return;
			}
			var _sendTargets = $('.fs_list .op-checked');
			if(_sendTargets.size() <=0){
				return;
			}
			//获取数据，准备提交
			var uuid =  _common.getUuid();
			if(!uuid){
				_common.lostLogin();
				return;
			}
			var schoolCode = _common.getSchoolCode();
			if(!schoolCode){
				_common.lostLogin();
				return;
			}
			var noticeUnique = $('#detail_resend').attr('data-noticeUnique');
			if(!noticeUnique){
				return;
			}
			var sendTarget = [];
			_sendTargets.each(function(index,obj){
				var _this = $(obj);
				sendTarget.push({
					pkuid : _this.attr('data-uuid'),
					Name :_this.attr('data-name'),
					userType:parseInt(_this.attr('data-userType'))
				});
			});
			var params = {
				'uuid' : uuid,
				'schoolCode' : schoolCode,
				'noticeUnique' : noticeUnique,
				'sendTarget' : sendTarget,
				'simpleContent':$('.det_text').text()
			};
			resending = true;
			_common.showProgress();
			_common.post(_SERVICE+'/webapp/notice/resend',params,function(rtn){
				resending = false;
				_common.hideProgress();
				if('001' == rtn.resultCode){
					_common.tips('success','再次发送完成');
				}else if('202' == rtn.resultCode){
					_common.lostLogin();
				}else{
					_common.tips(rtn.resultMsg);
				}
			});
		
		});
	}


	//绑定预览大图
	function initShowImgs(){
		$('#noticeList').on('click','.imgwrapper',function(){
			var _this = $(this);
			var groups = _this.parent().find('.imgwrapper');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('src'));
			});
			_common.showImgs(urls,index);
		});

		$('#detail_info').on('click','.img_narrow',function(){
			var _this = $(this);
			var groups = _this.parent().find('.img_narrow');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('src'));
			});
			_common.showImgs(urls,index);
		});
	}


	//更新滚动条
	function updateScrollBar(){
		var slides = $('.nicescrollContainer');
		slides.each(function(index,obj){
			$(obj).getNiceScroll().resize();
		});
	}
	


	//业务入口
	var detailid = qt_util.P('detailid');
	if(detailid){
		initSlide(1);
		loadNoticeDetail(detailid,true);
		window.parent.setWinTitle&&window.parent.setWinTitle('通知详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('通知列表');
		});
	}else{
		initSlide();
	}

	initNoticeList();
	getNoticeList(1);
	initResendBar();
	initShowImgs();
	initDetail();
	//_common.getPermissions('notice') == 0?$('#detail_resend').hide():$('#detail_resend').show();
		



	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
