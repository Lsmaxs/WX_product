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
	//多文件上传插件
	//require('../plugin/uploadify/uploadify');
	var WebUploader = require('../plugin/webuploader/webuploader');
	//服务
	var _SERVICE = _common.SERVICE;

	//window引用，防止回调中指针出错
	var _window = window;
	
	//获取窗口大小
	var winSize = qt_util.getViewSize();
	var TAG = "通知权限";
	var outputState = false;
	//请求url
	var requestUrl = {
				 //通讯录的详细信息/webapp/linkman/list
				 linkmanAll : _SERVICE+'/webapp/linkman/list',
				 //查找学校开放发送通知权限的教师名单
				 getEnabledTeacher : _SERVICE+'/webapp/npermiss/getEnabledTeacher',
				 //新增具有发通知权限的教师名单
				 enablTeacher : _SERVICE+'/webapp/npermiss/enableTeacher',
				 
				 //删除具有发通知权限的教师名单
				 disableTeacher : _SERVICE+'/webapp/npermiss/disableTeacher'
	}
	
	/*************************************业务层*****************************************/
	
	/**
	 * 业务总入口
	 */
	function initPage(){
		initSlide();
		initEnabledTeacher(function(){
			initTeacherDeleteEvent();
			switchChangePage(function(){
				initSelectTargetFinish();
			});
		});
	}
	
	/**
	 * 初始化权限列表
	 */
	var teacherDataList = new Array();//缓存老师列表
	function initEnabledTeacher(cback){
		var params = {
				uuid : _common.getUuid(),
				schoolCode : _common.getSchoolCode()
			};
		$('#admin_loading').show();
		queryEnabledTeacher(params, function(data){
			var teacherHtml = new Array();
			var adminHtml = new Array();
			var result = data.items;
			teacherDataList = result;
			if(result){
				var len = result.length;
				for(var i=0;i<len;i++){
					var item = result[i];
					var isAdmin = "1" == item.isAdmin;
					if(isAdmin){
						adminHtml.push('<dl>');
						adminHtml.push('<dt><img src="'+(item.icon?item.icon:"images/ico_qzx.png")+'" /></dt>');
						adminHtml.push('<dd class="name">'+item.name+'</dd>');
						adminHtml.push('<dd class="phone">'+item.phone+'</dd>');
						adminHtml.push('</dl>');
					}else{
						teacherHtml.push('<dl>');
						teacherHtml.push('<a href="javascript:;" class="del_user" data-teacherId ="'+item.userId+'"></a>');
						teacherHtml.push('<dt><img src="'+(item.icon?item.icon:"images/ico_qzx.png")+'" /></dt>');
						teacherHtml.push('<dd class="name">'+item.name+'</dd>');
						teacherHtml.push('<dd class="phone">'+item.phone+'</dd>');
						teacherHtml.push('</dl>');
					}
					
				}	
			}
			
			$('#addTeacher').before(teacherHtml.join(''));
			if(adminHtml.length > 0){
				$('#notice_admin').append(adminHtml.join(''));
			}else{
				$('#notice_admin p').show();
			}
			$('#admin_loading').hide();
			cback && cback();
		});
	}
	
	/**
	 * 初始化权限列表删除按钮
	 */
	function initTeacherDeleteEvent(){
		$('.notice_set a.del_user').click(function(){
			var _this = $(this);
			var _teacherId =_this.attr('data-teacherId');
			_common.showMsg({
				title:"提示",
				msg:"是否删除"+"老师的通知权限!",
				btnText:"取消",
				okcallback : function(){
					var params = {
							userName:_common.getUserName(),
							userId : _common.getUuid(),
							schoolCode : _common.getSchoolCode(),
							teacherUUID : _teacherId
						};
					deleteTeacher(params, function(){
						//删除缓存对象中对应的值
						conTag("删除某个老师长度1", teacherDataList.length, 131);
						for(var i=0;i<teacherDataList.length;i++){
							var _teacherList = teacherDataList[i];
							if(_teacherId == _teacherList.userId){
								conTag("找到一样的", "找到一样的", 134);
								teacherDataList.splice(i,1);
							}
						}
						conTag("删除某个老师长度2", teacherDataList.length, 131);
						_this.parent().fadeOut();
					});
				}
			},true)
			
		});
	}
	
	/**
	 * 初始化跳转选择老师列表
	 */
	var isHideClass=0;
	function switchChangePage(cback){
		$('#addTeacher').off().click(function(){
			var params = {
					uuid : _common.getUuid(),
					schoolCode : _common.getSchoolCode(),
					'type' : 1,
					'dataType' : '1'
				};
			_slideobj&&_slideobj.right();
			queryLinkManAll(params, function(data){
				var arr = filterTeacherList(teacherDataList, data.linkmanTeacher);
				//填充教师
				html = new Array();
				isHideClass = data.linkmanTeacher.length>5;
				result = arr;
				if(result.length >0){
					html.push('<a href="javascript:;" class="operate-all"><span class="op-check"></span>教师<span class="'+(isHideClass?'jt_down':'jt_up')+'"></span></a>');
				}else{
					$('#teacherBox').hide();
				}
				html.push('<div class="classlist" '+(isHideClass?'style="display:none;"':'')+'>');
				for(var i=0;i<result.length;i++){
					var item = result[i];
					html.push('<a href="javascript:;" class="operate-class" data-classid="'+item.cid+'" data-sendtype="4" data-name="'+item.deptName+'"><span class="op-check"></span>'+item.deptName+'<span class="jt_down"></span></a>');
					html.push('<div class="fs_list" style="display:none;">');
					var citems = item.teachers;
					teachersData = item.teachers;
					for(var j=0;j<citems.length;j++){
						if(!isNullObj(citems[j])){
							var citem = citems[j];
							html.push('<a href="javascript:;" class="operate-btn"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="3" data-phone="'+citem.phone+'" data-name="'+citem.name+'"></span>'+citem.name+'</a> ');
						}
						
					}
					html.push('</div>');
					if(i < result.length -1){
						html.push('<hr/>');
					}
				}
				html.push('</div>');
				$('#teacherBox').html(html.join(''));
				$('#loading').hide();
				
				initCheckBox();
				
			});
			
			
			window.parent.trace&&window.parent.trace(function(){
				//切换回原来的界面
				$('#targetBox').find('.operate-all').each(function(){
					var item = $(this);
						item.next().attr('data-height',item.next().height());

						item.data('fold','1');
						item.find('.jt_up').removeClass('jt_up').addClass('jt_down');
						item.next().animate({height:'0px'},200,function(){
							item.next().hide();
							updateScrollBar();
						});
//					}
				}).data('fold',isHideClass?'1':'0');
				
				_slideobj&&_slideobj.left();
				//没有选择内容
			});
			cback && cback();
		});
	}
	
	/**
	 * 初始化选项框按钮
	 */
	function initCheckBox(){
		var targetBox = $('#targetBox');

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
		}).data('fold',isHideClass?'1':'0');

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
		}).data('fold','1');

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
			var as = _this.find('a');
			var len = as.size();
			var row = Math.ceil(len/3);
			var _height = row * 35;
			_this.css('height',_height+'px').attr('data-height',_height);
		});

		targetBox.find('.classlist').each(function(){
			var _this = $(this);
			var as = _this.find('.operate-class');
			var len = as.size();
			var _height = len * 54;
			_this.attr('data-height',_height);
		});
	}
	
	/**
	 * 初始化选择按钮
	 */
	function initSelectTargetFinish(){
		//绑定选中老师
		$('#selectTargetFinishBtn').off().click(function(){
			window.parent.untrace&&window.parent.untrace();
			//计算sendTarget，逐个班计算
			var sendTarget = [];
			var multiCache = {};

			var targetNum = 0;
			$('#targetBox').find('.operate-class').each(function(index,obj){
				var item = $(obj);
				item.next().find('.op-checked').each(function(index,sobj){
					var item = $(sobj);
					if(!multiCache[item.attr('data-uuid')]){
						sendTarget.push({
							userId : item.attr('data-uuid'),
							name : item.attr('data-name'),
							phone : item.attr('data-phone'),
						});
						multiCache[item.attr('data-uuid')] = true;
					}
				});
				
			});

			if(sendTarget.length <= 0){
				_slideobj&&_slideobj.left();
			}else{
				var params = {
						schoolCode:_common.getSchoolCode(),
						uuid:_common.getUuid(),
						userName:_common.getUserName(),
						teaList:sendTarget
				}
				_common.post(requestUrl.enablTeacher,params,function(rtn){
					if('001' == rtn.resultCode){
						//窗口打开参数
						var options = {};
						options.key = 'noticepermission';
						options.url = './notice_permission.html';
						options.title =  '权限设置';
						options.callback = function(){
							//do nothing
						}
						window.parent.closeWin&&window.parent.closeWin({
							isSwitch : true,
							callback : function(){
								_window.parent.openWin&&_window.parent.openWin(options);
							}
						});
					}else if('202' == rtn.resultCode){
						_common.lostLogin();
					}else{
						_common.showMsg(rtn.resultMsg);
					}
				});
			}
		});
	}
	//更新滚动条
	/**
	 * 
	 */
	function updateScrollBar(){
		 var slides = $('.qt-slide-wrap > div');
		 slides.each(function(index,obj){
			var scrollobj = $(obj).getNiceScroll();
			scrollobj.each(function(){
				this.resize();
			})
		})
	}
	
	/**
	 * 初始化页面切换
	 */
	function initSlide(){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		var slides = $('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		$('#loading').css({width:_width+'px',height:_height+'px',position:'relative'});
		//$('#admin_loading').css({width:_width+'px',height:_height+'px',position:'relative'});
		_slideobj = qt_ui.slide({id:'qtslide'});

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
			console.log("跳转到右边");
			_slideobj.right();
		}
	}
	
	/*************************************业务层 end*****************************************/
	
	
	/*************************************服务层*****************************************/
	
	/**
	 * 通讯录的详细信息
	 * @params params
	 * 			uuid :用户id
	 * 			schoolCode : 学校id
	 * 			type: 1:通讯录数据  2:发送对象数据
	 * 			dataType:1:教师数据 2:学生或家长数据
	 */
	function queryLinkManAll(params,cback){
		$('#loading').show();
		_common.post(requestUrl.linkmanAll,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
				$('#loading').hide();
			}
		});
			
	}
	
	/**
	 * 新增具有发通知权限的教师名单
	 * @params params
	 * 			uuid :用户id
	 * 			schoolCode : 学校id
	 * 			teaList : 所选择的对象列表
	 */
	function addEnablTeacher(params,cback){
		_common.post(requestUrl.enablTeacher,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
			
	}
	
	/**
	 * 查找学校开放发送通知权限的教师名单
	 * @params params
	 * 			uuid :用户id
	 * 			schoolCode : 学校id
	 */
	function queryEnabledTeacher(params,cback){
		_common.post(requestUrl.getEnabledTeacher,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
			$('#admin_loading').hide();
		});
			
	}
	
	/**
	 * 删除具有发通知权限的教师名单
	 * @params params
	 * 			userName : 操作人姓字
	 * 			uuid :用户id
	 * 			schoolCode : 学校id
	 * 			teacherUUID :教师id
	 */
	function deleteTeacher(params,cback){
		_common.post(requestUrl.disableTeacher,params,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback(rtn);
			}else if('202' == rtn.resultCode){
				_common.lostLogin();
			}else{
				_common.showMsg(rtn.resultMsg);
			}
		});
			
	}
	
	/**
	 * 过滤教师列表
	 * @param arr1 : 要过滤的值的数组
	 * @param arr2 : 被过滤的数组
	 * 			
	 */
	function filterTeacherList(arr1, arr2) {
		var useridArr = new Array();
		var newArr = new Array();
		// 遍历已选择的人员userId
		for (var i = 0; i < arr1.length; i++) {
			useridArr.push(arr1[i].userId);
		}

		// 遍历教师名单中uuid
		for (var item = 0; item < arr2.length; item++) {
			newArr.push(arr2[item]);
			var teachers = arr2[item].teachers;
			if (teachers.length > 0) {
				for (var j = 0; j < teachers.length; j++) {
					var _uuid = teachers[j].uuid;
					if (useridArr.indexOf(_uuid) > -1) {
						newArr[item].teachers[j] = {};
					}
				}
			}
		}
		return newArr;
	}
	
	/*************************************服务层 end*****************************************/
	
	/*******************************其他*************************************/
	//调试输出的信息
	function conTag(msg,tag,lineNum){
		if(tag == undefined || tag==''){
			tag = TAG;
		}
//		lineNum == undefined?"":("第"+lineNum+"行,");
		var lineStr='';
		if(lineNum == undefined){
			lineStr="";
		}else{
			lineStr = "第"+lineNum+"行,";
		}
		if(outputState){
			console.log(lineStr+tag+':'+JSON.stringify(msg));
		}
		
	}
	
	 function isNullObj(obj){
		    for(var i in obj){
		        if(obj.hasOwnProperty(i)){
		            return false;
		        }
		    }
		    return true;
		}
	
	//业务入口
	initPage();
	module.exports = qt_model;

});
