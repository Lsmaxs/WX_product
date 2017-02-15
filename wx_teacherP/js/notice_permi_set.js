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
	var _targetselect = require('./targetselect');

	//json插件
	require('jquery/json');
	//滚动条美化插件
	require('jquery/nicescroll');
	//服务
	var _SERVICE = _common.SERVICE;

	//window引用，防止回调中指针出错
	var _window = window;
	
	//获取窗口大小
	var winSize = qt_util.getViewSize();
	
	//请求url
	var requestUrl = {
				 //通讯录的详细信息/webapp/linkman/list
				 linkmanAll : _SERVICE+'/webapp/linkman/list',
				 //查找学校开放审核通知权限的教师名单
				 getReviewTeaList : _SERVICE+'/webapp/nreview/getEnabledTeacher',
				  //查找学校开放发送通知权限的教师名单
				 getEnabledTeacher:_SERVICE+'/webapp/npermiss/getEnabledTeacher',
				 //新增具有发通知权限的教师名单
				 enablTeacher : _SERVICE+'/webapp/npermiss/enableTeacher',
				 //删除具有发通知权限的教师
				 disableTeacher : _SERVICE+'/webapp/npermiss/disableTeacher',
				 // 新增具有审核通知权限的教师名单
				 enableReview : _SERVICE+'/webapp/nreview/enableTeacher',
				 //删除具有审核通知权限的教师
				 disableReview: _SERVICE+'/webapp/nreview/disableTeacher'
	}

	/**
	 * 业务总入口
	 */
	function initPage(){
		initSlide();
		initPermiTeaList(function(){
			initTeacherDeleteEvent();
			switchChangePage(function(){
				initSelectTargetFinish();
			});
		});
	}

	//初始化页面切换
	var _slideobj = null;
	function initSlide(){
		var _width = winSize.width;
		var _height = winSize.height;
		$('.qt-slide').css({width:_width+'px'});
		$('.qt-slide-wrap > div').css({width:_width+'px',height:_height+'px'}).show();
		$('#loading').css({width:_width+'px',height:_height+'px'});
		// $('#admin_loading').css({width:_width+'px',height:_height+'px',position:'relative'});
		var slides = $('.nicescrollContainer');
		//第二个要处理高度
		var footH = $('.targetselect_footer_fixed').outerHeight();
		slides.eq(1).css('height',(_height-footH)+'px');
		
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
			_slideobj.right();
		}
	}

	/**
	 * 初始化权限列表
	 */
	var teaReviewList = [];//缓存消息同步教师名单
	var teaPermissList = [];
	function initPermiTeaList(cback){
		var params = {
				uuid : _common.getUuid(),
				schoolCode : _common.getSchoolCode()
			};
		ajaxPost(requestUrl.getEnabledTeacher, params, function(data){
			var teacherHtml = [];
			var adminHtml = [];
			var result = data.items;
			teaPermissList = result;
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
			$('#addPermissTea').before(adminHtml.join(''));
			$('#addPermissTea').before(teacherHtml.join(''));


			// 请求通知权限的列表
			ajaxPost(requestUrl.getReviewTeaList, params, function(data){
			var reviewTea = [];
			var reviewData = data.items;
			teaReviewList = reviewData;
			if(reviewData){
				var len = reviewData.length;
				for(var i=0;i<len;i++){
					var teaInfo = reviewData[i];
					reviewTea.push('<dl>');
					reviewTea.push('<a href="javascript:;" class="del_user" data-teacherId ="'+teaInfo.userId+'"></a>');
					reviewTea.push('<dt><img src="'+(teaInfo.icon?teaInfo.icon:"images/ico_qzx.png")+'" /></dt>');
					reviewTea.push('<dd class="name">'+teaInfo.name+'</dd>');
					reviewTea.push('<dd class="phone">'+teaInfo.phone+'</dd>');
					reviewTea.push('</dl>');
				}	
			}
			$('#addReviewTea').before(reviewTea.join(''));
			$('#loading').hide();
			$('#pageMain').css('visibility','visible');
			cback && cback();
			});
		});	
	}

	function ajaxPost(url,param,cback){
		$('#loading').show();
		_common.post(url,param,function(rtn){
			if('001' == rtn.resultCode){
				cback && cback(rtn);
			}else if('202' == rtn.resultCode){
				$('#loading').hide();
				_common.lostLogin();
			}else{
				$('#loading').hide();
				_common.showMsg(rtn.resultMsg);
			}
		})
	}

	function initTeacherDeleteEvent(){
		$('#reviewlist').on('click','a.del_user',function(){
			var _this = $(this);
			var _teacherId =_this.attr('data-teacherId');
			_common.showMsg({
				title:"提示",
				msg:"是否删除"+"老师的审核权限!",
				btnText:"取消",
				okcallback :function(){
					var params = {
							userId : _common.getUuid(),
							userName:_common.getUserName(),
							schoolCode : _common.getSchoolCode(),
							teacherUUID  : _teacherId
						};
					ajaxPost(requestUrl.disableReview,params,function(){
						for(var i=0;i<teaReviewList.length;i++){
							var _teacherList = teaReviewList[i];
							if(_teacherId == _teacherList.userId){
								teaReviewList.splice(i,1);
							}
						}
						$('#loading').hide();
						_this.parent().fadeOut();
					})
				}
			},true)
		});

		$('#permisslist').on('click','a.del_user',function(){
			var _this = $(this);
			var _teacherId =_this.attr('data-teacherId');
			_common.showMsg({
				title:"提示",
				msg:"是否删除"+"老师的通知权限!",
				btnText:"取消",
				okcallback :function(){
					var params = {
							userName:_common.getUserName(),
							userId : _common.getUuid(),
							schoolCode : _common.getSchoolCode(),
							teacherUUID : _teacherId
						};
					ajaxPost(requestUrl.disableTeacher,params,function(){
						for(var i=0;i<teaPermissList.length;i++){
							var _teacherList = teaPermissList[i];
							if(_teacherId == _teacherList.userId){
								teaPermissList.splice(i,1);
							}
						}
						$('#loading').hide();
						_this.parent().fadeOut();
					})
				}
			},true)
		})
	}

	function switchChangePage(cback){
		// 绑定添加通知同步权限教师列表
		$('#addReviewTea').on('click',function(){
			_slideobj&&_slideobj.right();
			$('.targetselect_footer_fixed').show();
			window.parent.trace&&window.parent.trace(function(){
				//切换回原来的界面
				_slideobj&&_slideobj.left();
			});

			// 初始化教师选择列表
			$('#loading').show();
			$('#targetBox').hide();	
			var type = _common.getPermissions('notice')==1?'2':'';
			_targetselect.init({
			isGroupTag:false,
			isShowFollwed:false,
			isSelectPer:true,
			filterListArry:teaReviewList,
			type : type,
			onReady : function(){
				//数据加载成功回调
				$('#loading').hide();
				$('#targetBox').show();
			},
			onHeightChange : function(){
				//高度发生变化回调
				updateScrollBar();
			},
			onChoose : function(data){
				//选择按钮回调
				_slideobj&&_slideobj.left();
				window.parent.untrace&&window.parent.untrace();
	
				var sendTarget = [];
				var html = [];
				var icon = [];
				//暂时转换数据（后续接口统一规范）
				var totalTarget = data.sendTarget;
				for(var i=0;i<totalTarget.length;i++){
					var target = totalTarget[i];
					//个人
					sendTarget.push({
						phone : target.phone,
						userId : target.uuid,
						name : target.name,
					});
					icon.push(target.icon);
				}
				var unique = {};
				var uniqueicon = {};
				sendTarget.forEach(function(gpa){ unique[ JSON.stringify(gpa) ] = gpa });
				sendTarget = Object.keys(unique).map(function(u){return JSON.parse(u) }); 
				$.unique(icon);
				for(var j=0,len=sendTarget.length;j<len;j++){
					html.push('<dl><a href="javascript:;" class="del_user" data-teacherid="'+sendTarget[j].uuid+'"></a><dt><img src="'+(icon[j]?icon[j]:"images/ico_qzx.png")+'"></dt><dd class="name">'+sendTarget[j].name+'</dd><dd class="phone">'+sendTarget[j].phone+'</dd></dl>') ;
				}
				var params={
					schoolCode:_common.getSchoolCode(),
					uuid:_common.getUuid(),
					userName:_common.getUserName(),
					teaList:sendTarget
				};
				ajaxPost(requestUrl.enableReview,params,function(result){
					$('#addReviewTea').before(html.join(''));
					$('#loading').hide();
					_slideobj&&_slideobj.left();
				})
			}
			});
		});


		// 绑定添加通知同步权限教师列表
		$('#addPermissTea').on('click',function(){
			_slideobj&&_slideobj.right();
			$('.targetselect_footer_fixed').show();
			window.parent.trace&&window.parent.trace(function(){
				//切换回原来的界面
				_slideobj&&_slideobj.left();
			});

			// 初始化教师选择列表
			$('#loading').show();
			$('#targetBox').hide();	
			var type = _common.getPermissions('notice')==1?'2':'';
			_targetselect.init({
			isGroupTag:false,
			isShowFollwed:false,
			isSelectPer:true,
			filterListArry:teaPermissList,
			type : type,
			onReady : function(){
				//数据加载成功回调
				$('#loading').hide();
				$('#targetBox').show();
			},
			onHeightChange : function(){
				//高度发生变化回调
				updateScrollBar();
			},
			onChoose : function(data){
				//选择按钮回调
				_slideobj&&_slideobj.left();
				window.parent.untrace&&window.parent.untrace();
				
				var sendTarget = [];
				var html = [];
				var icon=[];
				//暂时转换数据（后续接口统一规范）
				var totalTarget = data.sendTarget;
				for(var i=0;i<totalTarget.length;i++){
					var target = totalTarget[i];
					//个人
					sendTarget.push({
						phone : target.phone,
						userId : target.uuid,
						name : target.name,
					});
					icon.push(target.icon);
				}
				var unique = {};
				sendTarget.forEach(function(gpa){ unique[ JSON.stringify(gpa) ] = gpa });
				sendTarget = Object.keys(unique).map(function(u){return JSON.parse(u) }); 
				$.unique(icon);
				for(var j=0,len=sendTarget.length;j<len;j++){
					html.push('<dl><a href="javascript:;" class="del_user" data-teacherid="'+sendTarget[j].uuid+'"></a><dt><img src="'+(icon[j]?icon[j]:"images/ico_qzx.png")+'"></dt><dd class="name">'+sendTarget[j].name+'</dd><dd class="phone">'+sendTarget[j].phone+'</dd></dl>') ;
				}
				var params={
					schoolCode:_common.getSchoolCode(),
					uuid:_common.getUuid(),
					userName:_common.getUserName(),
					teaList:sendTarget
				};
				ajaxPost(requestUrl.enablTeacher,params,function(result){
					if(result.resultCode == '001'){
						$('#addPermissTea').before(html.join(''));
						$('#loading').hide();
						_slideobj&&_slideobj.left();
					}else{
						_common.showMsg(result.resultMsg);
					}
				})
			}
			});
		})
	}

	//更新滚动条
	function updateScrollBar(){
		 var slides = $('.nicescrollContainer');
		 slides.each(function(index,obj){
			var scrollobj = $(obj).getNiceScroll();
			scrollobj.each(function(){
				this.resize();
			})
		})
	}

	initPage();
	module.exports=qt_model;
})