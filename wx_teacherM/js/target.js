//服务
//var _SERVICE = 'http://xxxxx/webapp/msg/linkmanAll';

//初始化发送对象选择
function initTargetSelect(){

	//绑定选择学生
	$('#selectTargetFinishBtn').off().click(function(){
		//计算sendTarget，逐个班计算

		var sendTarget = [];
		var multiCache = {};

		var targetNum = 0;
		$('#targetBox').find('.operate-class').each(function(index,obj){
			var item = $(obj);
			//判断是否全班选择
			if('1' == item.find('span').eq(0).data('checked')){
				//选了全班
				sendTarget.push({
					pkuid : item.attr('data-classid'),
					name : item.attr('data-name'),
					type : item.attr('data-sendtype'),
				});
			}else{
				//要加单独的学生
				item.parent().next().find('.op-checked').each(function(index,sobj){
					var item = $(sobj);
					if(!multiCache[item.attr('data-uuid')]){
						sendTarget.push({
							pkuid : item.attr('data-uuid'),
							name : item.attr('data-name'),
							type : item.attr('data-sendtype'),
						});
						multiCache[item.attr('data-uuid')] = true;
					}
				});
			}
			targetNum = targetNum + item.parent().next().find('.op-checked').size();
		});

		console&&console.log('debug:'+JSON.stringify(sendTarget));

		if(targetNum <=0){
			//没有选择人，执行错误处理，这里暂时用alert
			alert('没有选择用户');
			return;
		}
		sessionStorage.setItem('sendTarget',JSON.stringify(sendTarget));
		sessionStorage.setItem('targetNum',targetNum);
		//跳转到最后一步
		location.href=ctx+'/wap/tea/notice/send/edit?'+'userId='+_context_uuid+'&cropId='+_cropId;

		//接口提交页，
		//sessionStorage.getItem('sendTarget')

	});

	//填充可以选择的学生数据
	var params = {
		uuid : _context_uuid,
		schoolCode : _context_schoolCode,
		'type' : 2,
		'dataType' : '1,2'
	};

	//loading与数据切换
	$('#loading').show();
	$('#targetBox').hide();

	$.post(_SERVICE,{
		'json' : JSON.stringify(params)
	},function(rtn){
		$('#loading').hide();
		$('#targetBox').show();
		if('001' == rtn.resultCode){
			fillData(rtn);
			checkData();
		}else{
			_common.showMsg(rtn.resultMsg);
		}
	});
	
}

//填充选择对象
function fillData(rtn){

	var html = new Array();

	var isHideClass = rtn.studentTargets.length>5 || rtn.teacherTargets.length>5;

	//填充学生
	var result = rtn.studentTargets;
	if(result.length >0){
		html.push('<p class="tz-tit"><a href="javascript:;" class="operate-all operate-btn1"><span class="op-check"></span>学生<span class="'+(isHideClass?'dy_more':'dy_some')+'">&nbsp;</span></a></p>');
	}else{
		$('#studentBox').hide();
	}
	html.push('<div class="classlist" '+(isHideClass?'stype="display:none;"':'')+'>');
	for(var i=0;i<result.length;i++){
		var item = result[i];
		//逐个班填充
		html.push('<p><a href="javascript:;" class="operate-class operate-btn1" data-classid="'+item.cid+'" data-sendtype="2" data-name="'+item.className+'"><span class="op-check"></span>'+item.className+'<span class="dy_more">&nbsp;</span></a></p>');

		//填充学生列表
		html.push('<div class="fs_list" style="display:none;">');
		var citems = item.citems;
		for(var j=0;j<citems.length;j++){
			var citem = citems[j];
			//html.push('<p class="tz-li"><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="1" data-name="'+citem.name+'"></span>'+citem.name+'<span title="已关注企业号" class="pay_us">'+('1' == citem.followed?'已关注':'未关注')+'</span></a></p>');
			html.push('<p class="tz-li"><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="1" data-name="'+citem.name+'"></span>'+citem.name+'</a></p>');

		}

		html.push('</div>');
		if(i < result.length -1){
			html.push('<hr/>');
		}
	}
	html.push('</div>');
	$('#studentBox').html(html.join(''));

	//填充教师
	html = new Array();
	result = rtn.teacherTargets;
	if(result.length >0){
		html.push('<p class="tz-tit"><a href="javascript:;" class="operate-all operate-btn1"><span class="op-check"></span>老师<span class="'+(isHideClass?'dy_more':'dy_some')+'">&nbsp;</span></a></p>');
	}else{
		$('#teacherBox').hide();
	}
	html.push('<div class="classlist" '+(isHideClass?'stype="display:none;"':'')+'>');
	for(var i=0;i<result.length;i++){
		var item = result[i];
		html.push('<p><a href="javascript:;" class="operate-class operate-btn1" data-classid="'+item.cid+'" data-sendtype="4" data-name="'+item.className+'"><span class="op-check"></span>'+item.className+'<span class="dy_more">&nbsp;</span></a></p>');
		
		html.push('<div class="fs_list" style="display:none;">');
		var citems = item.citems;
		for(var j=0;j<citems.length;j++){
			var citem = citems[j];
			//html.push('<p class="tz-li"><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="3" data-name="'+citem.name+'"></span>'+citem.name+'<span title="已关注企业号" class="pay_us">'+('1' == citem.followed?'已关注':'未关注')+'</span></a></p>');
			html.push('<p class="tz-li"><a href="javascript:;" class="operate-btn1"><span class="op-check" data-uuid="'+citem.uuid+'" data-sendtype="3" data-name="'+citem.name+'"></span>'+citem.name+'</a></p>');
			
		}
		html.push('</div>');
		if(i < result.length -1){
			html.push('<hr/>');
		}
	}
	html.push('</div>');
	$('#teacherBox').html(html.join(''));


	var targetBox = $('#targetBox');


	//绑定所有全选时间

	$('#allSelectBtn').off().click(function(){
		var item = $(this);
		var box = $('#targetBox');
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


	//绑定分类全选事件
	targetBox.find('.operate-all .op-check').off().click(function(){
		var item = $(this);
		var box = item.parent().parent().parent();
		if('1' == item.data('checked')){
			//已经勾选变成非勾选
			box.find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');
			item.data('checked','0');

			//取消全局勾选
			$('#allSelectBtn').removeClass('op-checked').addClass('op-check').data('checked','0');


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
		var _parent = item.parent();
		if('1' == item.data('fold')){
			//原来已经折叠
			item.data('fold','0');
			item.find('.dy_more').removeClass('dy_more').addClass('dy_some');
			_parent.next().css('height','0px').show();
			_parent.next().animate({height:_parent.next().attr('data-height')+'px'},200,function(){
				_parent.next().css('height','auto');
			});
		}else{
			//先保存当前的高度
			_parent.next().attr('data-height',_parent.next().height());

			item.data('fold','1');
			item.find('.dy_some').removeClass('dy_some').addClass('dy_more');
			_parent.next().animate({height:'0px'},200,function(){
				_parent.next().hide();
			});
		}
	}).data('fold',isHideClass?'1':'0');

	//绑定班级勾选
	targetBox.find('.operate-class .op-check').off().click(function(e){
		var item = $(this);
		var parent = $(this).parent();
		var box = parent.parent().parent().parent();
		if('1' == item.data('checked')){
			item.removeClass('op-checked').addClass('op-check').data('checked','0');
			parent.parent().next().find('.op-checked').removeClass('op-checked').addClass('op-check').data('checked','0');

			//同时修改为非全选
			box.find('.operate-all span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
			$('#allSelectBtn').removeClass('op-checked').addClass('op-check').data('checked','0');
		}else{
			item.removeClass('op-check').addClass('op-checked').data('checked','1');
			parent.parent().next().find('.op-check').removeClass('op-check').addClass('op-checked').data('checked','1');
		}
		return false;
	});
	//绑定班级详情切换展示
	targetBox.find('.operate-class').off().click(function(){
		var item = $(this);
		var _parent = item.parent();
		if('1' == item.data('fold')){
			//原来已经折叠
			item.data('fold','0');
			item.find('.dy_more').removeClass('dy_more').addClass('dy_some');
			//item.next().slideDown('fast');
			_parent.next().css('height','0px').show();
			_parent.next().animate({height:_parent.next().attr('data-height')+'px'},200,function(){
				
			});
		}else{
			item.data('fold','1');
			item.find('.dy_some').removeClass('dy_some').addClass('dy_more');
			//item.next().slideUp('fast');
			_parent.next().animate({height:'0px'},200,function(){
				_parent.next().hide();
				
			});
		}
	}).data('fold','1');

	//绑定单个学生勾选
	targetBox.find('.fs_list .op-check').off().click(function(){
		var item = $(this);
		var box = item.parent().parent().parent().parent().parent();
		if('1' == item.data('checked')){
			item.removeClass('op-checked').addClass('op-check').data('checked','0');

			//同时修改为非全选
			box.find('.operate-all span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
			$('#allSelectBtn').removeClass('op-checked').addClass('op-check').data('checked','0');
			//修改班级非全选
			item.parent().parent().parent().prev().find('span').eq(0).removeClass('op-checked').addClass('op-check').data('checked','0');
		}else{
			item.removeClass('op-check').addClass('op-checked').data('checked','1');
		}
	});

	//兼容样式
	targetBox.find('.fs_list').each(function(){
		var _this = $(this);
		var as = _this.find('a');
		var len = as.size();
		var _height = len * 49;
		_this.css('height',_height+'px').attr('data-height',_height);
	});

	targetBox.find('.classlist').each(function(){
		var _this = $(this);
		var as = _this.find('.operate-class');
		var len = as.size();
		var _height = len * 49;
		_this.attr('data-height',_height);
	});
}

//从返回按钮回来，重新勾选
function checkData(){
	var sendTarget = sessionStorage.getItem('sendTarget');
	sessionStorage.removeItem('sendTarget');
	if(!sendTarget){
		return;
	}
	sendTarget = JSON.parse(sendTarget);
	for(var i=0;i<sendTarget.length;i++){
		var item = sendTarget[i];
		if(2 == item.type || 4 == item.type){
			$('.classlist a[data-classid='+item.pkuid+']').find('span').eq(0).trigger('click');
		}else{
			$('.classlist span[data-uuid='+item.pkuid+']').trigger('click');
		}
	}
}




//初始化选择角色步骤
initTargetSelect();



//测试代码