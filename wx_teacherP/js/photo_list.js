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
				loadNextBatch();
			}
		}
		var niceobj2 = slides.eq(1).getNiceScroll(0);
		niceobj2.onscrollend=function(info){
			if(info.end.y + 100 >= niceobj2.page.maxh ){
				loadNextAlbum();
			}
		}
	}

	//------------------------------列表相关 begin------------------------------//

	//填充班级，一个班级一个相册
	function initClassList(){
		//填充可以选择的班级数据
		var params = {
			uuid : _common.getUuid(),
			schoolCode : _common.getSchoolCode()
		};
		_common.post(_SERVICE+'/webapp/comm/bddb',params,function(rtn){
			if('001' == rtn.resultCode){
				var result = rtn.items;

				var html = new Array();

				var perline = 4;
				for(var i=0;i<result.length;i++){
					var item = result[i];
					if(0 == i%perline){
						html.push('<a class="bd_r_l '+(1==result.length?'bd_r_r':'')+'" href="javascript:;" data-classid="'+item.cid+'" data-name="'+item.name+'">'+item.name+'</a>');
					}else if(3 == i%perline || i==result.length-1){
						html.push('<a class="bd_r_r" href="javascript:;" data-classid="'+item.cid+'" data-name="'+item.name+'">'+item.name+'</a><br/>');
					}else{
						html.push('<a href="javascript:;" data-classid="'+item.cid+'" data-name="'+item.name+'">'+item.name+'</a>');
					}
				}
				$('#classtab').html(html.join(''));
				if(result.length<perline){
					$('#classtab').css({'text-align':'center'});
				}

				//绑定班级点击
				$('#classtab').find('a').click(function(){
					var _this = $(this);
					var classcode = _this.attr('data-classid');
					loadDetail(classcode);
				});
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	

	//获取批次列表（分页）
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
		_common.post(_SERVICE+'/webapp/clazzcircle/index',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					if(!_batchCache[''+item.batchId]){
						
						var _zanmum = item.zanPenson.length;
						var _isZan = false;
						var zanNames = new Array();
						for(var j=0;j<item.zanPenson.length;j++){
							var _item = item.zanPenson[j];
							zanNames.push('<b data-uuid="'+_item.userId+'">'+_item.userName+'</b>');
							if(uuid == _item.userId){
								_isZan = true;
							}
						}

						html.push('<div class="photo_box" data-batchid="'+item.batchId+'">');
						html.push('	<div class="photo_list">');
						html.push('		<a href="javascript:;" data-batchid="'+item.batchId+'" data-num="'+_zanmum+'" class="'+(_isZan?'bt_zan_sel':'bt_zan')+'"><span></span>'+_zanmum+'</a>');
						html.push('		<div class="pt_tit">');
						html.push('			<span class="face_pic"><img src="'+(item.icon?item.icon:_common.getDefaultHeadUrl())+'" onerror="this.src=\'./images/user_pace.png\'"/></span><b>'+item.createName+' '+(1==item.creatorType?'老师':(2==item.creatorType?'家长':''))+'</b><br/>');
						html.push('			'+item.createTime+'&nbsp;&nbsp;&nbsp;上传了'+item.picNum+'张图片到'+item.className+'&nbsp;&nbsp;&nbsp;<a data-classid="'+item.classCode+'" href="javascript:;">查看全部></a>');
						html.push('		</div>');
						html.push('	</div>');
						html.push('	<div class="imgwrapperRoot">');
						//理论上picUrls必不为空，所以不做空值处理
						for(var j=0;j<item.picUrls.length;j++){
							var pic = item.picUrls[j];
							var _picUrl = _common.imgCrop(pic.url,{w:500,h:500});
							html.push('<a class="imgwrapper" href="javascript:;" style="overflow:hidden;"><img src="'+_picUrl+'" data-src="'+pic.url+'" onload="winFixImg(this);" onerror="winErrorImg(this);"/></a>');
						}
						html.push('	</div>');
						html.push('	<div class="zan_name" '+(_zanmum >0?'':'style="display:none;"')+'>'+zanNames.join('，')+'</div>');
						html.push('</div>');
						//没有加载过的才进行插入
						_batchCache[''+item.batchId] = 1;
					}
				}
				$('#batchList').append(html.join(''));

				//切换数据
				if(1 == pageno && items.length<=0){
					$('#batchList').hide();
					$('#noData').show().find('a').off().click(function(){
						parent&&parent.setWinTitle&&parent.setWinTitle('发照片');
						location.href='./photo_send.html';
					});
					$('#mainPage').css({'background':'#fff'});
				}

				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_PAGENO = pageno;
				}

				//绑定点击事件
				$('#batchList a[data-classid]').off().click(function(){
					var classid = $(this).attr('data-classid');
					if(!classid){
						return;
					}
					loadDetail(classid);
				});

				//点赞与取消点赞
				$('#batchList a[data-batchid]').off().click(function(){
					handleZan.apply(this);
				});


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
		getBatchList((_PAGENO +1));
	}

	//处理点赞
	var zanApplying = false;
	function handleZan(){
		if(zanApplying){
			return;
		}
		var _this = $(this);

		var isZan = false;
		if(_this.hasClass('bt_zan_sel')){
			//原来已经点过赞,
			isZan = false;
		}else{
			isZan = true;
		}

		var uuid = _common.getUuid();
		var schoolCode = _common.getSchoolCode();
		var userName =  _common.getUserName();
		var batchid = _this.attr('data-batchid');
		
		if(!uuid){
			return;
		}
		if(!batchid){
			return;
		}
		zanApplying = true;
		var params = {
			'uuid' : uuid,
			'schoolCode' : schoolCode,
			'batchid' : batchid,
			'type' : isZan?1:2,
			'userName' : userName
		};
		_common.post(_SERVICE+'/webapp/clazzcircle/opt',params,function(rtn){
			zanApplying = false;
			if('001' == rtn.resultCode){
				var zanname = _this.parent().parent().find('.zan_name');
				if(isZan){
					_this.removeClass('bt_zan').addClass('bt_zan_sel');
					var bs = zanname.find('b');
					if(bs.length>0){
						zanname.prepend('<b data-uuid="'+uuid+'">'+userName+'</b>，');
					}else{
						zanname.prepend('<b data-uuid="'+uuid+'">'+userName+'</b>');
					}
					_this.html('<span></span>'+(bs.size()+1));
					zanname.show();
				}else{
					_this.removeClass('bt_zan_sel').addClass('bt_zan');
					zanname.find('[data-uuid="'+uuid+'"]').remove();

					var _html = zanname.html();
					zanname.html(_html.replace(/^，/,''));
					var bs = zanname.find('b');
					_this.html('<span></span>'+bs.size());
					if(bs.length<=0){
						zanname.hide();
					}
				}
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	
	}

	//------------------------------列表相关 end--------------------------------//



	//------------------------------相册详细 begin------------------------------//
	//获取相册列表
	var _ALBUM_PAGESIZE = 20;
	var _albumCache = {};
	var _ALBUM_PAGENO = 0;
	var _ALBUM_CLASSCODE = 0;
	function getAlbumList(pageno,callback){
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
			'classCode' : _ALBUM_CLASSCODE,
			'pageSize' : _ALBUM_PAGESIZE,
			'page' : pageno
		};

		if(_listLoading){
			return;
		}
		_listLoading = true;
		_common.showProgress();
		_common.post(_SERVICE+'/webapp/clazzcircle/list',params,function(rtn){
			_listLoading = false;
			_common.hideProgress();
			if('001' == rtn.resultCode){
				var html = new Array();

				var items = rtn.items;
				for(var i=0;i<items.length;i++){
					var item = items[i];
					if(!_albumCache[''+item.albumId]){
						var _name = item.picUrl;
						if(_name){
							_name = _name.lastIndexOf('/');
							_name = item.picUrl.substring(_name+1);
						}
						
						var _picUrl = _common.imgCrop(item.picUrl,{w:500,h:500});
						var _picDesc = (item.picDesc?item.picDesc:_name);
						html.push('<li data-albumid="'+item.albumId+'">');
						html.push('    <div class="ph_l" href="javascript:;">');
						html.push('        <a class="imgwrapper" href="javascript:;" style="overflow:hidden;"><img src="'+_picUrl+'" data-src="'+item.picUrl+'" onload="winFixImg(this);" onerror="winErrorImg(this);"></a>');
						html.push('        <span>'+_picDesc+'</span><input maxlength="10" style="display:none;" type="text" class="edit_name"  data-name="'+_picDesc+'" value="'+_picDesc+'" />');
						html.push('    </div>');
						html.push('    <span>'+item.creatorName+' '+(1==item.creatorType?'老师':(2==item.creatorType?'家长':''))+'</span>');
						html.push('    <div class="photo_op"><span><a href="javascript:;" class="photo_edit">编辑</a><a href="javascript:;" class="photo_det">删除</a></span></div>');
						html.push('    <div class="pt_op_bg"><span></span></div>');
						html.push('</li>');
						//没有加载过的才进行插入
						_albumCache[''+item.albumId] = 1;
					}
				}
				$('#albumlist').append(html.join(''));

				//切换数据
				if(1 == pageno && items.length<=0){
					$('#albumlist').hide();
					$('#noData2').show().find('a').off().click(function(){
						parent&&parent.setWinTitle&&parent.setWinTitle('发照片');
						location.href='./photo_send.html';
					});
					$('#mainPage').css({'background':'#fff'});
				}

				if(items.length == _PAGESIZE){
					//只有填满的时候才会触发页码增加
					_ALBUM_PAGENO = pageno;
				}

				callback&&callback();
				
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
	}
	//加载下一页
	function loadNextAlbum(){
		if(_listLoading){
			return;
		}
		getAlbumList((_ALBUM_PAGENO +1));
	}

	//绑定编辑
	function bindDetailOp(){
		//绑定事件
		$('#albumlist').on('click','.photo_edit',function(){
			var _this = $(this);
			var li = _this.parent().parent().parent();
			li.find('.ph_l span').hide();
			li.find('.ph_l input').show().off().blur(function(){
				var _this = $(this);
				var val = _this.val();
				var _def = _this.attr('data-name');
				if(!val || val == _def){
					return;
				}
				var albumid = li.attr('data-albumid');

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
					'classCode' : _ALBUM_CLASSCODE,
					'albumId' : albumid,
					'picDesc':val
				};
				_common.post(_SERVICE+'/webapp/clazzcircle/edds',params,function(rtn){
					if('001' == rtn.resultCode){
						_this.hide();
						_this.prev().html(''+val).show();
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_common.showMsg(rtn.resultMsg);
					}
				});
			});
		}).on('click','.photo_det',function(){
			var _this = $(this);

			_common.showMsg({
				'msg' : '确定要删除该相片吗？',
				'okcallback' : function(){
					var li = _this.parent().parent().parent();
					var albumid = li.attr('data-albumid');
					if(!albumid){
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
						'classCode' : _ALBUM_CLASSCODE,
						'albumId' : albumid
					};
					_common.post(_SERVICE+'/webapp/clazzcircle/dele',params,function(rtn){
						if('001' == rtn.resultCode){
							li.remove();
						}else if('202' == rtn.resultCode){
							_common.lostLogin();
						}else{
							_common.showMsg(rtn.resultMsg);
						}
					});
				}
			});
		});
	}


	//加载并显示
	function loadDetail(classcode,isNotSwitch){
		var uuid =  _common.getUuid();
		if(!uuid){
			return;
		}
		var schoolCode = _common.getSchoolCode();
		if(!schoolCode){
			return;
		}
		if(!classcode){
			return;
		}

		_ALBUM_CLASSCODE = classcode;
		_albumCache = {};
	    _ALBUM_PAGENO = 0;

		$('#albumlist').html('').show();
		$('#noData2').hide();
		getAlbumList(1,function(){
			//数据填充完成，切换界面
			(!isNotSwitch)&&switchToDetail();
		});
	}

	//切换到详情
	function switchToDetail(){
		_slideobj&&_slideobj.right();
		window.parent.setWinTitle&&window.parent.setWinTitle('相册详情');
		window.parent.trace&&window.parent.trace(function(){
			//切换回原来的界面
			_slideobj&&_slideobj.left();
			window.parent.setWinTitle&&window.parent.setWinTitle('班级相册');
		});
	}

	//------------------------------相册详细 end--------------------------------//

	//绑定预览大图
	function initShowImgs(){
		$('#batchList').on('click','.imgwrapper',function(){
			var _this = $(this);
			var groups = _this.parent().find('.imgwrapper');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('data-src'));
			});
			_common.showImgs(urls,index);
		});

		$('#albumlist').on('click','.imgwrapper',function(){
			var _this = $(this);
			var groups = $('#albumlist').find('.imgwrapper');
			var index = groups.index(this);
			var urls = [];
			groups.find('img').each(function(){
				urls.push($(this).attr('data-src'));
			});
			_common.showImgs(urls,index);
		});
	}


	//业务入口
	initSlide();
	initClassList();
	getBatchList(1);
	initShowImgs();
	bindDetailOp();



	//----------------------------- 测试代码 --------------------------------//
	


	module.exports = qt_model;

});
