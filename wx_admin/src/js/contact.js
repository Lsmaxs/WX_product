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

	var _import = require('./contact_import');
	var _batmove = require('./contact_batmove');
	var _export = require('./contact_export');
	var _verify = require('./contact_verify');
	var _invite = require('./contact_invite');


	//多文件上传插件
	var WebUploader = require('../plugin/webuploader/webuploader');

	//服务
	var _SERVICE = _config.SERVICE;

	//视口尺寸
	var _vs = qt_util.getViewSize();

	//禁用回退
	_common.stopBackspace();

	/**
	 * @desc 初始页面
	 * @return
	 */
	function initPage(){
		resetDimention();
		initTree();
		/*var pSchoolCode = qt_util.P('schoolCode');
		var pAreaAddr = qt_util.P('areaAddr');*/
		   var  pSchoolCode = "test001";
		   var  pAreaAddr = "100000";
		var sessioinFilled = initSessionRegionSearch();
		if(sessioinFilled){
			initRegionSearch(false);
			$('#schoolSelect').trigger('change');
		}else if(pSchoolCode && pAreaAddr){
			/*pSchoolCode = decodeURIComponent(pSchoolCode);
			pAreaAddr = decodeURIComponent(pAreaAddr);*/
			initRegionSearch(false);
			initSearchBySchoolCode(pSchoolCode,pAreaAddr);
		}else{
			initRegionSearch(true);
		}

		initTable();
		$(window).on('resize',function(){
			resetDimention();
		});

		$('#graduateSelect').change(function() {
			var _value = $(this).val();
			if(_value == '1') {
				location.href = './contact.html';
			} else if(_value == '2') {
				location.href = './contact_graduate.html';
			} else if(_value == '3') {
				location.href = './contact_outschool.html';
			}
			var _regionHtml = $('#regionSearch').html();
			_common.sessionSet('wxadmin_contact_regionhtml',_regionHtml);
			_common.sessionSet('wxadmin_contact_province_index',$('#provinceSelect')[0].selectedIndex);
			_common.sessionSet('wxadmin_contact_city_index',$('#citySelect')[0].selectedIndex);
			_common.sessionSet('wxadmin_contact_area_index',$('#areaSelect')[0].selectedIndex);
			_common.sessionSet('wxadmin_contact_school_index',$('#schoolSelect')[0].selectedIndex);
		});

		//initBatchBox();
		//initMoveClassBox();
		//initExportBox();
		//initVerifyBox();
		//initInviteBox();
	}

	//计算尺寸
	function resetDimention(){
		_vs = qt_util.getViewSize();
		var winH=_vs.height;

		var _contact =  $('.contact');
		var _top = $('.top');
		var _main = $('.main');

		var tH = _top.outerHeight();
		_main.css({
			'height' : (_vs.height - tH) + 'px'
		});
		var barH = $('.bar').outerHeight();
		var typeBarH = $('.typebar').outerHeight();
		$('.mainleft_scroll').css({
			'height' : (_vs.height - tH - barH - typeBarH) + 'px',
			'overflow' : 'auto'
		});
		$('.mainright_scroll').css({
			'height' : (_vs.height - tH - barH) + 'px',
			'overflow' : 'auto'
		});
		_contact.css('visibility','visible');
	}




	//--------------------------------------------------------------------------//
	//------------------------------区域选择 begin------------------------------//
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

	//根据areaCode查询学校并填充
	function queryBindSchool(areaCode,callback){
		if(!areaCode){
			var cityCode = $('#citySelect').val();
			var provinceCode = $('#provinceSelect').val();
			//逐级提高,区镇>城市>省份
			areaCode = cityCode||provinceCode;
		}
		_common.get('/api/school/getByAreaCode.do?areaCode='+areaCode,{},function(rtn){
			if('0000000' == rtn.rtnCode){
				var lists = rtn.bizData;
				var html = new Array();
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					html.push('<option value="'+item.schoolCode+'" data-schoolName="'+item.schoolName+'" data-id="'+item.id+'" data-areaCode="'+item.areaCode+'" data-areaAddr="'+item.areaAddr+'">'+item.schoolName+'</option>');
				}
				if(lists.length<=0){
					html.push('<option value="" data-schoolName="" data-id="" data-areaCode="" data-areaAddr="">暂无学校</option>');
				}
				$('#schoolSelect').html(html.join(''));
				callback&&callback();
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//初始化各个地区选择下拉框
	function initRegionSearch(search){
		$('#provinceSelect').on('change',function(){
			var areacode = $(this).val();
			if(!areacode){
				$('#citySelect').hide();
			}else{
				$('#citySelect').show();
			}
			$('.main').hide();
			_common.showLoading();
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
			$('.main').hide();
			_common.showLoading();
			queryArea(areacode,function(){
				$('#areaSelect').trigger('change');
			});
		});
		$('#areaSelect').on('change',function(){
			var areacode = $(this).val();
			$('.main').hide();
			_common.showLoading();
			queryBindSchool(areacode,function(){
				$('#schoolSelect').trigger('change');
			});
		});
		$('#schoolSelect').on('change',function(){
			var schoolCode = $(this).val();
			$('.main').hide();
			if(!schoolCode){
				$('.nodata').show();
				_common.hideLoading();
			}else{
				$('.nodata').hide();
				refreshContactData(schoolCode);
			}
		});
		//触发查询省份
		if(search){
			_common.showLoading();
			queryProvince(function(){
				$('#provinceSelect').trigger('change');
			})
		}
	}

	//根据学校码初始化
	function initSearchBySchoolCode(schoolCode,areaAddr){
		var areaAddr = areaAddr.split('-');
		// var flag = _selectAsLabel('areaSelect',areaAddr[2]);
		var areacode = areaAddr;
		queryBindSchool(areacode,function(){
			$('#schoolSelect').trigger('change');
		});

	}

	//根据缓存数据初始化,已经初始化
	function initSessionRegionSearch(){
		var _regionHtml = _common.sessionGet('wxadmin_contact_regionhtml');
		var provinceIndex = _common.sessionGet('wxadmin_contact_province_index');
		var cityIndex = _common.sessionGet('wxadmin_contact_city_index');
		var areaIndex = _common.sessionGet('wxadmin_contact_area_index');
		var schoolIndex = _common.sessionGet('wxadmin_contact_school_index');
		if(_regionHtml){
			$('#regionSearch').html(_regionHtml);
			$('#provinceSelect')[0].selectedIndex = parseInt(provinceIndex);
			$('#citySelect')[0].selectedIndex = parseInt(cityIndex);
			$('#areaSelect')[0].selectedIndex = parseInt(areaIndex);
			$('#schoolSelect')[0].selectedIndex = parseInt(schoolIndex);
			_common.sessionDel('wxadmin_contact_regionhtml');
			return true;
		}else{
			return false;
		}
	}




	//根据label进行选择
	function _selectAsLabel(selectid,label){
		var opts = $('#'+selectid).find('option');
		var selectedIndex = -1;
		opts.each(function(index,obj){
			if($(obj).html() == label){
				selectedIndex = index;
				return false;
			}
		});
		$('#'+selectid)[0].selectedIndex = -1 == selectedIndex?0:selectedIndex;
		return -1 != selectedIndex;
	}
	//根据value进行选择
	function _selectAsValue(selectid,value){
		var opts = $('#'+selectid).find('option');
		var selectedIndex = -1;
		opts.each(function(index,obj){
			if($(obj).attr('value') == value){
				selectedIndex = index;
				return false;
			}
		});
		$('#'+selectid)[0].selectedIndex = -1 == selectedIndex?0:selectedIndex;
		return -1 != selectedIndex;
	}

	//------------------------------区域选择 end--------------------------------//
	//--------------------------------------------------------------------------//



	//--------------------------------------------------------------------------//
	//------------------------------树形结构 begin------------------------------//

	//树节点索引缓存
	var treeDataMap = {};
	//树子节点索引缓存
	var treeDataSubMap = {};
	//当前通讯录对应的全局学校编码
	var treeSchoolCode = '';
	//根节点对象
	var treeRoot = {};
    //当前通讯录对应的全局教育局编码
    var treeBureauCode = '';

	//根据学校编码刷新通讯录信息
	function refreshContactData(schoolCode){
		if(schoolCode||treeSchoolCode){
			queryTree(schoolCode||treeSchoolCode);
		}
	}

	//查询通讯录树
	function queryTree(schoolCode,callback){
		treeSchoolCode = schoolCode;
        treeBureauCode = 'jyj01';
		_common.showLoading();
        $('.main').show();
		_common.post('/api/department/getBySchool.do',{schoolCode:schoolCode},function(rtn){
			if('0000000' == rtn.rtnCode){
				var lists = rtn.bizData;
				treeDataMap = {};
				treeDataSubMap = {};
				treeRoot = {};
				//数据转换，进行子节点关联
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					if(!treeDataSubMap[item.id]){
						//避免自己的子节点索引不存在
						treeDataSubMap[item.id] = [];
					}
					if(!treeDataSubMap[item.parentid]){
						//避免父节点索引不存在
						treeDataSubMap[item.parentid] = [];
					}
					//关联到父节点索引
					treeDataSubMap[item.parentid].push(item);
					//缓存自己
					treeDataMap[item.id] = item;
				}
				//触发填充树
				$('#leftTree').html(getTreeNode(lists[0].id));
				//触发查表格第一次查询
				tbNodeid = lists[0].id;
				treeRoot = lists[0];

				//修改表格查询的各个条件
				departmentType = lists[0].departmentType;
				$('#searchContent').val('');
				queryMember(1,departmentType);

				//查询当前学校的申请加入验证信息
				queryNeedVerfyNum();

				//显示数据
				// $('.main').show();
				callback && callback();
			}else{
				_common.hideLoading();
				_common.tips(rtn.msg);
			}
		});
	}

	//递归填充树节点
	function getTreeNode(nodeid,level){
		if(!level){
			level = 0;
		}
		var html = new Array();
		//departmentType: 1:学校根节点，2教师组，可能是子分组，3家长组，4家长子分组（一般是n年级），5班级叶子

		var item = treeDataMap[nodeid];
		if(!item){
			return '';
		}
		//是否展开该节点
		var isunflod = false;
		//是否可以添加子节点
		var issub = true;
		//是否默认菜单
		var isdefault = false;
		//是否可以重命名
		var isRename = true;
		//是否父节点
		var isparent = true;
		//节点是否可以有操作菜单
		var isOp = true;


		//子列表
		var subList = treeDataSubMap[item.id];

		if(0 == level || 1== level){
			//一级和二级节点直接打开
			isunflod = true;
			isdefault = true;
		}
		if(0 == level || 4 < item.departmentType){
			//树根没有操作按钮，学生分组没有操作按钮
			isOp = false;
		}
		if(5 == item.departmentType || (2== item.departmentType && 2==level) || level>=3){
			//叶子节点，或者教师分组节点或者班节点不再有子节点
			issub = false;
		}
		if(5 == item.departmentType){
			//年级不能删除
			isdefault = true;
		}

		if(subList&&subList.length<=0){
			//判断当前节点是否父节点
			isparent = false;
		}
		//优先采用别名
		var nodename = item.clazzAlias && item.clazzAlias!='' ? item.clazzAlias : item.name;

		html.push('<div class="tree_node">');
		html.push('		<div class="tree_nav tree_folder">');
		html.push('			<span class="tree_fold '+(isunflod?'unfold':'fold')+'" '+ (isparent?'':'style="visibility:hidden;"') +'></span><span class="tree_label" data-id="'+item.id+'" data-departmentType="'+item.departmentType+'" title="'+nodename+'">'+nodename+'</span>'+(isOp?'<span class="tree_more">&nbsp;</span>':''));
		if(isOp){
			html.push('			<ul class="tree_pop">');
			if(issub){
				html.push('				<li data-action="addsub" data-id="'+item.id+'">' + ((item.departmentType == 2) ? '添加分组' : '添加班级') + '</li>');
			}
			if(!isdefault){
				html.push('				<li data-action="rename" data-id="'+item.id+'" data-name="'+nodename+'">重命名</li>');
				html.push('				<li data-action="delete" data-id="'+item.id+'" data-name="'+nodename+'">删除</li>');
			}
			html.push('			</ul>');
		}
		html.push('		</div>');
		if(isparent){
			html.push('		<ul class="tree_list" style="'+(isunflod?'display:block;':'display:none;')+'">');
			for(var i=0;i<subList.length;i++){
				var subitem = subList[i];
				html.push('			<li data-nodeid="'+subitem.id+'" data-level="'+(1+level)+'">');
				html.push(getTreeNode(subitem.id,(level+1)));
				html.push('			</li>')
			}
			html.push('		</ul>');
		}
		html.push('</div>');
		return html.join('');
	}


	//绑定目录树点击
	function initTree(){
		var leftTree = $('.mainleft .tree');
		//绑定折叠打开
		leftTree.on('click','.tree_fold',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _ul = _parent.next();
			if(_this.hasClass('unfold')){
				//现在是打开，要转换为折叠
				_this.addClass('fold').removeClass('unfold');
				_ul.slideUp(200,function(){
					_ul.css({overflow:'visible'});
				});
			}else{
				//现在是折叠，要转换为打开
				_this.addClass('unfold').removeClass('fold');
				_ul.slideDown(200,function(){
					_ul.css({overflow:'visible'});
				});
			}
			return false;
		});

		//绑定显示操作菜单
		leftTree.on('click','.tree_more',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _ul = _parent.find('.tree_pop');

			_ul.fadeIn(200);
			_parent.on('mouseleave.treepopup',function(){
				_ul.fadeOut(200);
				_parent.off('mouseleave.treepopup');
			});
			_ul.off('click').on('click','li',function(){
				var _this = $(this);
				_ul.fadeOut(200);
				var _this = $(this);
				var action = _this.attr('data-action');
                var info = {
                    nodeid: _this.attr('data-id'),
                    name: _this.attr('data-name'),
                    departmenttype: _this.attr('data-departmenttype')
                };
				var treeInfo = treeDataMap[info.nodeid];
				info.deptType = treeInfo.departmentType;
				if('addsub' == action){
					addSubNode(info,function(){
						refreshContactData();
					});
				}else if('rename' == action){
					renameNode(info,function(){
						refreshContactData();
					});
				}else if('delete' == action){
					deleteNode(info,function(){
						var node = treeDataMap[info.nodeid];
						var parent = treeDataMap[node.parentid];

						treeDataMap[info.nodeid]=null;
						treeDataSubMap[info.nodeid] = null;

						var li = leftTree.find('li[data-nodeid='+node.id+']');
						var parli = leftTree.find('li[data-nodeid='+parent.id+']');
						var subList = treeDataSubMap[parent.id];
						var _newList = new Array();
						for(var i=0;i<subList.length;i++){
							var item = subList[i];
							if(item.id != node.id){
								_newList.push(item);
							}
						}
						treeDataSubMap[parent.id] = _newList;
						var changeTb = li.find('.tree_label').eq(0).hasClass('up');
						li.remove();
						if(_newList.length<=0){
							//只有一个子节点，关闭
							parli.find('.tree_fold').trigger('click').css('visibility','hidden');
						}
						if(changeTb){
							//原本表格数据是当前节点，删除后要刷新表格
							tbNodeid = parent.id;
							parli.find('.tree_label').eq(0).trigger('click');
						}
						//refreshContactData();
					});
				}else{
					//do nothing
				}
				return false;
			});
			return false;
		});

		//绑定表格查询
		leftTree.on('click','.tree_label',function(){
			var _this = $(this);
			var _id = _this.attr('data-id');
			var _departmentType = _this.attr('data-departmentType');
			tbNodeid = _id;
			departmentType = _departmentType;
			leftTree.find('.up').removeClass('up');
			_this.addClass('up');
			queryMember(1,departmentType);
			return false;
		});

		//避免a标签虚线框问题
		leftTree.on('focus','.tree_more',function(){
			var _this = $(this);
			_this.blur();
			return false;
		});

		//绑定新增弹出浮层
		$('.mainleft .bar .bar_op').on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _ul = _parent.find('.bar_pop');

			_ul.fadeIn(200);
			_parent.on('mouseleave.treepopup',function(){
				_ul.fadeOut(200);
				_parent.off('mouseleave.treepopup');
			});
			_ul.off('click').on('click','li',function(){
				var _this = $(this);
				_ul.fadeOut(200);
				var _this = $(this);
				var action = _this.attr('data-action');
				if('addTeacher' == action){
					addTeacher();
				}else if('addParent' == action){
					addParent();
				}else if('batchImport' == action){
					_import.showImport({
						schoolCode : treeSchoolCode,
						schoolName : treeRoot.name
					});
				}else if('batchInvite' == action ){
					_invite.showInvite({
						schoolCode : treeSchoolCode,
						schoolName : treeRoot.name
					});
				}else if('batMoveClass' == action){
					_batmove.showBatmove({
						schoolCode : treeSchoolCode,
						schoolName : treeRoot.name
					});
				}else if('exportContact' == action){
					_export.showExport({
						schoolCode : treeSchoolCode,
						schoolName : treeRoot.name
					});
				}else{
					//do nothing
				}
				return false;
			});
			return false;
		});

		//绑定验证消息
		$('.mainleft .bar .bar_tips').on('click',function(){
			var _this = $(this);
			_verify.showVerify({
				schoolCode : treeSchoolCode,
				schoolName : treeRoot.name
			});
			return false;
		});
	}

	//新增子分组节点
	function addSubNode(info,callback){
		// /addressBook/insertDepartment?schoolCode=20002000
		//{schoolCode: "20002000", parentid: "10000", name: "语文组"}
		if(!info || !info.nodeid){
			return;
		}
		var win = $('#nameBox');
		var applying = false;
		var div_newAliasName = win.find('#namebox_aliasname_div');
		win.find('#namebox_name').val('');
		win.find('#namebox_aliasname').val('');
		div_newAliasName.hide();
		var tip_name = '分组名称';

		win.find('.form-group input,.form-group textarea').parent().removeClass('has-error');
		if(info.deptType == 5 || info.deptType == 4) {
			div_newAliasName.show();
			win.find('.namebox-node-title').html('<em>*</em>班级名称');
			win.find('#namebox_name').attr('placeholder' , '请输入班级名称');
			win.find('.popbox_title').html('添加班级');
			tip_name = '班级名称';
		} else {
			win.find('.namebox-node-title').html('<em>*</em>分组名称');
			win.find('#namebox_name').attr('placeholder' , '请输入分组名称');
			win.find('.popbox_title').html('添加分组');
			tip_name = '分组名称';
		}
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		win.find('.form-group input,.form-group textarea').off('focus').on('focus',function(){
			$(this).parent().removeClass('has-error');
		});
		win.find('.btn_blue').off().on('click',function(){

			if(applying){
				return;
			}

			var name = $('#namebox_name').val();
			var aliasName = $('#namebox_aliasname').val();
			if(!name){
				$('#namebox_name').parent().addClass('has-error');
				_common.tips(tip_name + '不可为空');
				return;
			}
			applying = true;
			var params = {
				schoolCode: treeSchoolCode,
				parentid: Number(info.nodeid),
				name:name,
				clazzAlias:aliasName,
				bureauCode:treeBureauCode,
                parentDepartType:info.deptType
			};
			_common.post('/api/department/add.do',params,function(rtn){
				applying = false;
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','添加成功');
					callback && callback();
				}else{
					_common.tips(rtn.msg);
				}
			});
		});
		$('#nameBox').popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}
	//重命名分组节点
	function renameNode(info,callback){

		if(!info || !info.nodeid){
			return;
		}
		var item = treeDataMap[info.nodeid];
		if(!item){
			return;
		}
		//初始化选中班级名称
		var win = $('#renameBox');
		var applying = false;
		var input_name = win.find('#renamebox_name');
		var input_aliasname = win.find('#renamebox_aliasname');
		win.find('.edit-alias').hide();
		input_name.val(item.name);

		input_aliasname.change(function() {
			if(this.value == '') {
				this.value = item.name;
			}
		});

		if(info.deptType == 2 || info.deptType == 3 || info.deptType == 4) {
			//编辑教师子节点
			win.find('.popbox_title').html('重命名分组');
			win.find('.renamebox-node-title').html('<em>*</em>分组名称');
			win.find('.edit-alias').hide();
			input_name.removeAttr('disabled');
		} else if(info.deptType == 5) {
			//编辑家长字节点
			input_aliasname.val(item.clazzAlias);
			win.find('.edit-alias').show();
			win.find('.renamebox-node-title').html('班级名称');
			input_name.attr('disabled' , 'disabled');
			win.find('.popbox_title').html('重命名班级');
		}
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		win.find('.form-group input,.form-group textarea').off('focus').on('focus',function(){
			$(this).parent().removeClass('has-error');
		});

		win.find('.btn_blue').off().on('click',function(){
			if(applying){
				return;
			}

			applying = true;
			var params = {
				'departmentAlias' : input_name.val(),
				'id' : info.nodeid
			}

			_common.post('/api/department/rename.do',params,function(rtn){
				applying = false;
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','重命名成功');
					callback && callback();
				}else{
					_common.tips(rtn.msg);
					return;
				}
			});
		});
		$('#renameBox').popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});

	}
	//删除分组节点
	function deleteNode(info,callback){
		if(!info || !info.nodeid){
			return;
		}
		var item = treeDataMap[info.nodeid];
		_common.showMsg({
			msg : '确定要删除"'+info.name+'"吗？',
			okcallback : function(){
				var params = {
					id: info.nodeid
				};
				_common.post('/api/department/delete.do',params,function(rtn){
					if('0000000' == rtn.rtnCode){
						_common.tips('success','删除成功');
						callback && callback();
					}else{
						_common.tips(rtn.msg);
					}
				});
			}
		});
	}





	//获取填充教师/家长浮层选择节点(目前只支持两级，所以不用递归,直接写两级算了)
	function getSelectTreeNode(treeRoot){
		var html = new Array();
		html.push('<div class="tree_node">');
		html.push('		<div class="tree_nav tree_folder" data-parent="1" data-id="'+treeRoot.id+'" data-name="'+treeRoot.name+'">');
		html.push('			<span class="tree_fold unfold"></span><span class="tree_label">全部</span><span class="tree_more">&nbsp;</span>');
		html.push('		</div>');
		html.push('		<ul class="tree_list" >');
		var lists = treeDataSubMap[treeRoot.id];
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			//子列表
			var subList = treeDataSubMap[item.id];
			var isparent = false;
			if(subList && subList.length>=1){
				isparent = true;
			}
			var nodeName = (item.clazzAlias && item.clazzAlias!='') ? item.clazzAlias : item.name;
			html.push('<div class="tree_node">');
			html.push('		<div class="tree_nav tree_folder" '+(isparent?'data-parent="1"':'data-leaf="1"')+' data-id="'+item.id+'" data-name="'+nodeName+'">');
			html.push('			<span class="tree_fold fold" '+(isparent?'':'style="visibility:hidden;"')+'></span><span class="tree_label">'+nodeName+'</span><span class="tree_more">&nbsp;</span>');
			html.push('		</div>');
			if(isparent){
				var subNodeName = "";
				html.push('		<ul class="tree_list" style="display:none;" data-parent="'+item.id+'">');
				for(var j=0;j<subList.length;j++){
					var subitem = subList[j];
					subNodeName = (subitem.clazzAlias && subitem.clazzAlias!='') ? subitem.clazzAlias : subitem.name;
					html.push('			<li>');
					html.push('			    <div class="tree_node">');
					html.push('			    		<div class="tree_nav tree_leaf" data-leaf="1" data-id="'+subitem.id+'" data-name="'+subNodeName+'">');
					html.push('			    			<span class="tree_fold" style="visibility:hidden;"></span><span class="tree_label">'+subNodeName+'</span><span class="tree_more">&nbsp;</span>');
					html.push('			    		</div>');
					html.push('			    </div>');
					html.push('			</li>')
				}
				html.push('		</ul>');
			}
			html.push('</div>');
		}
		html.push('		</ul>');
		html.push('</div>');

		return html.join('');
	}

	//新增教师
	function addTeacher(editInfo){

		var win = $('#teacherBox');
		var applying = false;
		var clazzMaster = -1;
		//清空原来选择的东西
		win.find('.popbox_title').html(editInfo?'修改老师':'添加老师');
		win.find('input,textarea').val('');
		win.find('.form-group').removeClass('has-error');
		win.find('.clsspan').remove();
		$('#teacherBox_add_dept,#teacherBox_add_clss').show();
		$('#teacherBox_close_dept,#teacherBox_close_clss,#teacherBox_remove_clss').hide();
		$('#teacherBox_admin')[0].selectedIndex=0;
		win.find('.point-admin').hide();
		win.find('.point-admin-tips').hide();
		$('#teacherBox_mobile').attr('disabled' , false);
		$('#teacherBox_pointadmin')[0].selectedIndex = 0;

		//填充部门以及班级
		var deptRoot = treeDataSubMap[treeRoot.id][0];
		var clssRoot = treeDataSubMap[treeRoot.id][1];
		//标识是否有教师分组
		var hasClassGroup = treeDataSubMap[deptRoot.id].length>=1;

		//重置班主任下拉框内容
		function reloadMainClassSelect() {
			$('#teacherBox_main_cls').html('<option value="">请选择班级</option>'); //重置下拉框内容
			win.find('.mainselect').find('.clsspan').each(function(index , obj) {
				//扫描已添加班级列表
				var _id = $(obj).attr('data-id');
				var _name = $(obj).attr('data-name');

				$('#teacherBox_main_cls').append('<option value="' + _id + '" ' + (clazzMaster == _id ? 'selected' : '') + '>' + _name +'</option>');
			});
		}
		/*
		if(treeDataSubMap[deptRoot.id].length<=0){
			//_common.tips('请先添加教师分组');
			//return;
		}
		if(treeDataSubMap[clssRoot.id].length<=0){
			_common.tips('请先添加家长分组');
			return;
		}
		*/

		//初始化部门 和 班级下拉选择
		$('#teacherBox_tree_dept').hide().html(getSelectTreeNode(deptRoot));
		$('#teacherBox_tree_clss').hide().html(getSelectTreeNode(clssRoot));
		//限制班级一级节点的点击
		//$('#teacherBox_tree_clss').find('.tree_folder .tree_more').remove();
		$('#teacherBox_tree_clss').find('.tree_folder .tree_label').css({cursor:'default'});

		if(!hasClassGroup && !editInfo){
			//新增且没有教师分组，填充不可修改的默认分组
			$('#teacherBox_add_dept').hide().before('<span class="clsspan" data-id="'+deptRoot.id+'" data-name="'+deptRoot.name+'"><span class="clsspan_icon"></span>'+deptRoot.name+'</span>');
		}

		$('#teacherBox_admin').change(function() {
			//判断是否管理员，显示积分特定管理员选项
			var _val = $(this).val();
			if(_val == '2') {
				win.find('.point-admin').show();
				win.find('.point-admin-tips').show();
				win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
			} else {
				win.find('.point-admin').hide();
				win.find('.point-admin-tips').hide();

			}
		});


		if(editInfo){
			//重置班主任带班变量
			clazzMaster = editInfo.clazzMaster;

			//如果是修改状态，根据信息初始化
			$('#teacherBox_name').val(editInfo.teacherName);
			$('#teacherBox_mobile').val(editInfo.phoneNum);
			if(editInfo.status == 1) {
				$('#teacherBox_mobile').attr('disabled' , 'disabled');
			}
			$('#teacherBox_email').val(editInfo.email);
			$('#teacherBox_weixin').val(editInfo.weixin);

			//填充已选择的部门
			var _editAttr = JSON.parse(editInfo.deptIds);
			for(var i=0;i<_editAttr.length;i++){
				var item = treeDataMap[_editAttr[i]];
				if(item){
					if(!hasClassGroup && item.id == deptRoot.id){
						$('#teacherBox_add_dept').hide().before('<span class="clsspan" data-id="'+item.id+'"  data-name="'+item.name+'"><span class="clsspan_icon"></span>'+item.name+'</span>');
					}else{
						$('#teacherBox_add_dept').before('<span class="clsspan" data-id="'+item.id+'"  data-name="'+item.name+'"><span class="clsspan_icon"></span>'+item.name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
					}
				}
			}
			//编辑状态下，填充已选择的班级;
			_editAttr = JSON.parse(editInfo.classCodes);
			var selected_cls = [];
			for(var i=0;i<_editAttr.length;i++){
				var item = treeDataMap[_editAttr[i]];
				var _clsname = (item.clazzAlias && item.clazzAlias!='') ? item.clazzAlias : item.name;
				if(item){
					$('#teacherBox_add_clss').before('<span class="clsspan" data-id="'+item.id+'"  data-name="'+_clsname+'"><span class="clsspan_icon"></span>'+_clsname+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
				}
			}

			if(_editAttr.length>0){
				$('#teacherBox_remove_clss').show();
			}

			if(editInfo.teacherJob){
				var _index = 0;
				var _opts = $('#teacherBox_admin option');
				var _targetOpt = $('#teacherBox_admin option[value='+editInfo.teacherJob+']');
				_index = _opts.index(_targetOpt);
				$('#teacherBox_admin')[0].selectedIndex = _index>=0?_index:0;

				if(editInfo.teacherJob == '2') {
					win.find('.point-admin').show();
					win.find('.point-admin-tips').show();
					win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});

					var _point_index = -1;
					var _point_ops = $('#teacherBox_pointadmin option');
					var _point_targetOpt = $('#teacherBox_pointadmin option[value='+editInfo.pointadmin+']');
					_point_index = _point_ops.index(_point_targetOpt);
					$('#teacherBox_pointadmin')[0].selectedIndex = _point_index>=0?_point_index:0;
				}
			}
		}

		//初始化重置班主任带班列表
		////传入已设置的班主任带班，以便下拉框判断选中哪个option
		reloadMainClassSelect();

		//绑定折叠打开
		$('#teacherBox_tree_dept,#teacherBox_tree_clss').off().on('click','.tree_fold',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _ul = _parent.next();
			if(_this.hasClass('unfold')){
				//现在是打开，要转换为折叠
				_this.addClass('fold').removeClass('unfold');
				_ul.slideUp(200,function(){
					_ul.css({overflow:'visible'});
				});
			}else{
				//现在是折叠，要转换为打开
				_this.addClass('unfold').removeClass('fold');
				_ul.slideDown(200,function(){
					_ul.css({overflow:'visible'});
				});
			}
			return false;
		});

		//绑定部门点击
		$('#teacherBox_tree_dept').on('click','.tree_more',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _id = _parent.attr('data-id');
			var _name = _parent.attr('data-name');
			if('1' == _parent.attr('data-parent')){
				var leafs = _parent.next().find('[data-leaf="1"]');
				//绑定时新增
				leafs.each(function(index,obj){
					var _id = $(obj).attr('data-id');
					var _name = $(obj).attr('data-name');
					var _box =  $('#teacherBox_tree_dept').prev();
					var exist = _box.find('[data-id="'+_id+'"]');
					if(exist.size()<=0){
						//还没有添加过，所以要添加
						$('#teacherBox_add_dept').before('<span class="clsspan" data-id="'+_id+'"  data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
					}
				});
			}else{
				var _box =  $('#teacherBox_tree_dept').prev();
				var exist = _box.find('[data-id="'+_id+'"]');
				if(exist.size()<=0){
					//还没有添加过，所以要添加
					$('#teacherBox_add_dept').before('<span class="clsspan" data-id="'+_id+'"  data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
				}
			}
			//$('#teacherBox_tree_dept').hide();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
			return false;
		});

		//绑定班级点击
		$('#teacherBox_tree_clss').on('click','.tree_more',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _id = _parent.attr('data-id');
			var _name = _parent.attr('data-name');

			if('1' == _parent.attr('data-parent')){
				var leafs = _parent.next().find('[data-leaf="1"]');
				leafs.each(function(index,obj){
					var _id = $(obj).attr('data-id');
					var _name = $(obj).attr('data-name');
					var _box =  $('#teacherBox_tree_clss').prev();
					var exist = _box.find('[data-id="'+_id+'"]');
					if(exist.size()<=0){
						//还没有添加过，所以要添加
						$('#teacherBox_add_clss').before('<span class="clsspan" data-id="'+_id+'"  data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
					}
				});
			}else{
				var _box =  $('#teacherBox_tree_clss').prev();
				var exist = _box.find('[data-id="'+_id+'"]');
				if(exist.size()<=0){
					//还没有添加过，所以要添加
					$('#teacherBox_add_clss').before('<span class="clsspan" data-id="'+_id+'"  data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
				}
			}
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
			return false;
		});

		//绑定显示树形选择区
		win.find('.addspan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_parent.find('.minusspan,.removespan').show();
			_this.hide();
			//_this.hide().next().show();

			_parent.parent().parent().removeClass('has-error');
			_parent.next().show();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
		});
		//点击所带班级 “确认选择”
		win.find('.minusspan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			//_this.hide().prev().show();
			_parent.find('.minusspan').hide();//隐藏“确认”
			_parent.find('.addspan').show();//显示“添加选择”
			if(_parent.find('.clsspan_del').size() <=0){
				//没有选择，清空
				_parent.find('.removespan').hide();
			}
			reloadMainClassSelect();
			_parent.parent().parent().removeClass('has-error');
			_parent.next().hide();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
		});
		win.find('.removespan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_parent.find('.clsspan_del').parent().remove();
			if(_this.prev().is(':hidden')){
				_this.hide();
			}
			reloadMainClassSelect();
		});

		//绑定删除
		win.find('.depselect').off().on('click','.glyphicon-remove',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_parent.remove();
			reloadMainClassSelect();
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
			var _name = $('#teacherBox_name').val();
			if(!_name){
				$('#teacherBox_name').parent().parent().addClass('has-error');
				_common.tips('老师姓名不可为空');
				return;
			}
			var _deptIds = [];
			$('#teacherBox_add_dept').parent().find('.clsspan').each(function(index,obj){
				_deptIds.push($(obj).attr('data-id'));
				/*
				var _tempid = $(obj).attr('data-id');
				if(deptRoot.id != _tempid ){
					_deptIds.push(_tempid);
				}
				*/
			});
			/*
			if(_deptIds.length<=0){
				$('#teacherBox_tree_dept').parent().parent().addClass('has-error');
				_common.tips('请选择部门');
				return;
			}
			*/
			var _classCodes = [];
			$('#teacherBox_add_clss').parent().find('.clsspan').each(function(index,obj){
				_classCodes.push($(obj).attr('data-id'));
			});
			/*
			if(_classCodes.length<=0){
				$('#teacherBox_tree_clss').parent().parent().addClass('has-error');
				_common.tips('请选择班级');
				return;
			}
			*/
			var _teacherJob = $('#teacherBox_admin').val();
			if(!_teacherJob){
				$('#teacherBox_admin').parent().parent().addClass('has-error');
				_common.tips('请选择是否管理员');
				return;
			}
			var _phone = field = $('#teacherBox_mobile').val();
			if(!qt_valid.phone(_phone)){
				$('#teacherBox_mobile').parent().parent().addClass('has-error');
				_common.tips(_phone?'手机格式错误':'请输入手机');
				return;
			}
			var _email = $('#teacherBox_email').val();
			if(_email && !qt_valid.email(_email)){
				$('#teacherBox_email').parent().parent().addClass('has-error');
				_common.tips('email格式错误');
				return;
			}
			var _weixinid = $('#teacherBox_weixin').val();
			var _clazzMaster = '0';
			if($.trim($('#teacherBox_main_cls').val()) != '') {
				_clazzMaster = $('#teacherBox_main_cls').val();
			}

			var _pointadmin = -1;
			if($('#teacherBox_pointadmin').val() != '') {
				_pointadmin = parseInt($('#teacherBox_pointadmin').val());
			}

			applying = true;
			var params = {
				schoolCode : treeSchoolCode,
				classCodes : _classCodes,
				deptIds : _deptIds,
				phoneNum : _phone,
				teacherName : _name,
				clazzMaster : _clazzMaster,
                parentIds:_deptIds
			};
			if(_teacherJob){
				params.teacherJob = _teacherJob;
			}
			if(_email){
				params.email = _email;
			}
			if(_weixinid){
				params.weixinid = _weixinid;
			}
			if(editInfo){
				//for edit
				params.uid = editInfo.uid;
			}
			if(_pointadmin > -1) {
				params.pointadmin = _pointadmin;
			}

			_common.showLoading();
			_common.post('/api/contract/addTeacher.do',params,function(rtn){
				_common.hideLoading();
				applying = false;
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','添加或修改成功');
					queryMember(1);
				} else {
					_common.tips(rtn.msg);
				}
			});
		});

		//效果处理
		win.find('.form-group input,.form-group textarea,.form-group select').off('click.check').on('click.check',function(){
			$(this).parent().parent().removeClass('has-error');
		});

		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}
	//新增家长
	function addParent(){
		var win = $('#parentBox');
		var applying = false;

		//清空原来选择的东西
		//win.find('form')[0].reset();
		win.find('input,textarea').val('');
		win.find('.form-group').removeClass('has-error');
		win.find('.clsspan').remove();
		$('#parentBox_multi').hide();

		//填充班级
		var clssRoot = treeDataSubMap[treeRoot.id][1];
		if(treeDataSubMap[clssRoot.id].length<=0){
			_common.tips('请先添加家长分组');
			return;
		}
		$('#parentBox_tree_clss').hide().html(getSelectTreeNode(clssRoot));
		//限制班级一级节点的点击
		//$('#parentBox_tree_clss').find('.tree_folder .tree_more').remove();
		$('#parentBox_tree_clss').find('.tree_folder .tree_label').css({cursor:'default'});

		//绑定折叠打开
		$('#parentBox_tree_clss').off().on('click','.tree_fold',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _ul = _parent.next();
			if(_this.hasClass('unfold')){
				//现在是打开，要转换为折叠
				_this.addClass('fold').removeClass('unfold');
				_ul.slideUp(200,function(){
					_ul.css({overflow:'visible'});
				});
			}else{
				//现在是折叠，要转换为打开
				_this.addClass('unfold').removeClass('fold');
				_ul.slideDown(200,function(){
					_ul.css({overflow:'visible'});
				});
			}
			return false;
		});

		//绑定班级点击
		$('#parentBox_tree_clss').on('click','.tree_more',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _id = _parent.attr('data-id');
			var _name = _parent.attr('data-name');
			if('1' == _parent.attr('data-parent')){
				//为子节点添加父部门id
				var _parentID = _parent.attr('data-id');
				var leafs = _parent.next().find('[data-leaf="1"]');
				leafs.each(function(index,obj){
					var _id = $(obj).attr('data-id');
					var _name = $(obj).attr('data-name');
					var _box =  $('#parentBox_tree_clss').prev();
					var exist = _box.find('[data-id="'+_id+'"]');
					if(exist.size()<=0){
						//还没有添加过，所以要添加
						$('#parentBox_add_clss').before('<span class="clsspan" data-id="'+_id+'" data-parent="'+_parentID+'" data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
					}
				});
			}else{
                //为子节点添加父部门id
                var _parentMore = _parent.closest('ul').attr('data-parent');
				var _box =  $('#parentBox_tree_clss').prev();
				var exist = _box.find('[data-id="'+_id+'"]');
				if(exist.size()<=0){
					//还没有添加过，所以要添加
					$('#parentBox_add_clss').before('<span class="clsspan" data-id="'+_id+'" data-parent="'+_parentMore+'" data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
				}
			}
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
			return false;
		});
		//绑定显示树形选择区
		win.find('.addspan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_this.hide().next().show();
			_parent.parent().parent().removeClass('has-error');
			_parent.next().show();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
		});
		win.find('.minusspan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_this.hide().prev().show();
			_parent.parent().parent().removeClass('has-error');
			_parent.next().hide();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
		});
		//绑定删除
		win.find('.depselect').off().on('click','.glyphicon-remove',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_parent.remove();
		});

		//绑定关系选择
		if($('#parentBox_relation option').size()<=0){
			queryRelationS(0,function(lists){
				var html = new Array();
				html.push('<option value="">请选择</option>');
				for(var i=0;i<lists.length;i++){
					var item = lists[i];
					html.push('<option value="'+item.code+'">'+item.name+'</option>');
				}
                $('#parentBox_relation').html(html.join(''));
				/*$('#parentBox_relation').html(html.join('')).on('change',function(){
					var _this = $(this);
					var parentCode = _this.val();
					if(!parentCode){
						$('#parentBox_relation2').html('').hide();
					}else{
						queryRelation(parentCode,function(lists){
							var html = new Array();
							for(var i=0;i<lists.length;i++){
								var item = lists[i];
								html.push('<option value="'+item.code+'">'+item.name+'</option>');
							}
							$('#parentBox_relation2').html(html.join('')).show();
						});
					}
				});*/
			});
		}else{
			$('#parentBox_relation')[0].selectedIndex = 0;
			$('#parentBox_relation').trigger('change');
		}

		//已经通过校验的家长
		var _parents = {};
		_parentsNumber = 0;

		//检验家长内部辅助方法,通过校验，返回一个家长信息对象，不通过返回false
		var _validParent = function(){
			var _name = $('#parentBox_parname').val();
			if(!_name){
				$('#parentBox_parname').parent().parent().addClass('has-error');
				_common.tips('家长姓名不可为空');
				return false;
			}
			var _relation = $('#parentBox_relation').val();
			if(!_relation){
				$('#parentBox_relation').parent().parent().addClass('has-error');
				_common.tips('请选择亲属关系');
				return false;
			}
			var _phone = field = $('#parentBox_parphone').val();
			if(!qt_valid.phone(_phone)){
				$('#parentBox_parphone').parent().parent().addClass('has-error');
				_common.tips(_phone?'手机格式错误':'请输入手机');
				return false;
			}
			var _email = $('#parenBox_paremail').val();
			if(_email && !qt_valid.email(_email)){
				$('#parenBox_paremail').parent().parent().addClass('has-error');
				_common.tips('email格式错误');
				return false;
			}
			var _weixin = $('#parentBox_parweixin').val();

			var rtn = {
				parentName: _name,
				phoneNum: _phone,
				relationCode: _relation,
				relation :{code : _relation}
			};
			if(_email){
				rtn.email = _email;
			}
			if(_weixin){
				rtn.weixin = _weixin;
			}
			return rtn;
		}
		//绑定添加家长
		$('#parentBox_addparent').off().on('click',function(){
			var _one = _validParent();
			if(!_one){
				//_common.tips('请先完善一位家长信息后再进行新增家长的操作。');
			}else{
				if(_parents[_one.parentName]){
					_common.tips('已经存在同名家长');
					return;
				}else{
					_parents[_one.parentName] = _one;
					_parentsNumber++;
					$('#parentBox_multi').show().find('.depselect').append('<span class="clsspan" data-name="'+_one.parentName+'"><span class="clsspan_icon"></span>'+_one.parentName+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
					$('#parentBox_parname,#parentBox_parphone,#parenBox_paremail,#parentBox_parweixin').val('');
					$('#parentBox_relation')[0].selectedIndex=0;
					$('#parentBox_relation').trigger('change');
				}
			}
		});
		//绑定删除家长
		win.find('#parentBox_multi .depselect').off().on('click','.glyphicon-remove',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _name = _parent.attr('data-name');
			if(_parents[_name]){
				_parents[_name] = null;
				_parentsNumber--;
				_parent.remove();
			}
			if(_parentsNumber<=0){
				$('#parentBox_multi').hide();
			}
		});

		//绑定关闭
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		//绑定提交
		win.find('.btn_blue').off().on('click',function(){
			if(applying){
				return;
			}
			var _classCodes = [];
			var _classParentCode= [];
			$('#parentBox_add_clss').parent().find('.clsspan').each(function(index,obj){
				_classCodes.push($(obj).attr('data-id'));
                _classParentCode.push($(obj).attr('data-parent'));
			});
			if(_classCodes.length<=0){
				$('#parentBox_tree_clss').parent().parent().addClass('has-error');
				_common.tips('请选择班级');
				return;
			}
			if(_classCodes.length>1){
				$('#parentBox_tree_clss').parent().parent().addClass('has-error');
				_common.tips('每个学生只能属于一个班级');
				return;
			}
			var _studentName = $('#parentBox_stuname').val();
			if(!_studentName){
				$('#parentBox_stuname').parent().parent().addClass('has-error');
				_common.tips('学生姓名不可为空');
				return;
			}
			var _studentNo = $('#parentBox_stuno').val();
			/*不再检查学号
			if(!_studentNo){
				$('#parentBox_stuno').parent().parent().addClass('has-error');
				_common.tips('学号不可为空');
				return;
			}
			*/
			var _stuphone = $('#parentBox_stuphone').val();
			var _stuemail = $('#parentBox_stuemail').val();
			var _one = _validParent();
			if(!_one){
				return;
			}
			var _parentList = [];
			for(var key in _parents){
				if(_parents[key]){
					_parentList.push(_parents[key]);
				}
			}
			_parentList.push(_one);
			applying = true;
			var params = {
				'schoolCode' : treeSchoolCode,
				'studentName' : _studentName,
				'departId':_classCodes.join(','),
				'departParentId':_classParentCode.join(','),
				'parentList' : _parentList
			}
			if(_studentNo){
				params.studentNo = _studentNo;
			}
			if(_stuphone){
				params.phoneNum = _stuphone;
			}
			if(_stuemail){
				params.email = _stuemail;
			}
			_common.showLoading();
			_common.post('/api/contract/addParent.do',params,function(rtn){
				_common.hideLoading();
				applying = false;
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','添加成功');
					queryMember(1);
				}else{
					_common.tips(rtn.msg);
				}
			});
		});

		//效果处理
		win.find('.form-group input,.form-group textarea,.form-group select').off('click.check').on('click.check',function(){
			$(this).parent().parent().removeClass('has-error');
		});

		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}

	//修改家长
	function editParent(editInfo){
		var win = $('#editParBox');
		var applying = false;

		//清空原来选择的东西
		win.find('input,textarea').val('');
		win.find('.form-group').removeClass('has-error');
		win.find('.clsspan').remove();
		//填充修改的信息
		var html = new Array();

		var _students = {};
		var _nowStudent = null;

		if(editInfo.childrenInfo.length >1){
			//超过一个学生
			for(var i=0;i<editInfo.childrenInfo.length;i++){
				var student = editInfo.childrenInfo[i];
				html.push('<span '+(0==i?'class="up"':'')+' data-uid="'+student.uid+'">学生'+(i+1)+'</span>');
				_students[student.uid] = student;

			}
			win.find('.popbox_nav').html(html.join('')).show();
		}else{
			var _student = editInfo.childrenInfo[0];
			_students[_student.uid] = _student;
			win.find('.popbox_nav').hide();
		}
		_nowStudent = editInfo.childrenInfo[0];
		//切换学生填充信息
		function switchStudent(){
			$('#editParBox_stuname').val(_nowStudent.studentName);
			$('#editParBox_stuno').val(_nowStudent.studentNo?_nowStudent.studentNo:'');
			$('#editParBox_stuphone').val(_nowStudent.phoneNum?_nowStudent.phoneNum:'');
			$('#editParBox_stuemail').val(_nowStudent.email?_nowStudent.email:'');

			win.find('.clsspan').remove();
			/*
			var _editAttr = JSON.parse(_nowStudent.classWeixinId);
			for(var i=0;i<_editAttr.length;i++){
				var item = treeDataMap[_editAttr[i]];
				if(item){
					$('#editParBox_add_clss').before('<span class="clsspan" data-id="'+item.id+'"  data-name="'+item.name+'"><span class="clsspan_icon"></span>'+item.name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
				}
			}
			*/
			var item = treeDataMap[_nowStudent.classWeixinId];
			if(item){
				var _clsname = (item.clazzAlias && item.clazzAlias!='') ? item.clazzAlias : item.name;
				$('#editParBox_add_clss').before('<span class="clsspan" data-id="'+item.id+'"  data-name="'+_clsname+'"><span class="clsspan_icon"></span>'+_clsname+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
			}
		}
		//填充第一个学生
		switchStudent();
		//填充家长
		var userInfo = editInfo.userInfo;
		userInfo.attention = 0;

		$('#editParBox_uid').val(userInfo.uid);
		$('#editParBox_parname').val(userInfo.parentName);
		$('#editParBox_parphone').val(userInfo.phoneNum);
		if(userInfo.status == 1) {
			$('#editParBox_parphone').attr('disabled' , 'disabled');
		}
		$('#editParBox_paremail').val(userInfo.email?userInfo.email:'');
		$('#editParBox_parweixin').val(userInfo.weixin?userInfo.weixin:'');


		//填充班级
		var clssRoot = treeDataSubMap[treeRoot.id][1];
		if(treeDataSubMap[clssRoot.id].length<=0){
			_common.tips('请先添加家长分组');
			return;
		}
		$('#editParBox_tree_clss').hide().html(getSelectTreeNode(clssRoot));
		//限制班级一级节点的点击
		$('#editParBox_tree_clss').find('.tree_folder .tree_label').css({cursor:'default'});

		//绑定折叠打开
		$('#editParBox_tree_clss').off().on('click','.tree_fold',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _ul = _parent.next();
			if(_this.hasClass('unfold')){
				//现在是打开，要转换为折叠
				_this.addClass('fold').removeClass('unfold');
				_ul.slideUp(200,function(){
					_ul.css({overflow:'visible'});
				});
			}else{
				//现在是折叠，要转换为打开
				_this.addClass('unfold').removeClass('fold');
				_ul.slideDown(200,function(){
					_ul.css({overflow:'visible'});
				});
			}
			return false;
		});

		//绑定班级点击
		$('#editParBox_tree_clss').on('click','.tree_more',function(){
			var _this = $(this);
			var _parent = _this.parent();
			var _id = _parent.attr('data-id');
			var _name = _parent.attr('data-name');

			if('1' == _parent.attr('data-parent')){
				var leafs = _parent.next().find('[data-leaf="1"]');
				leafs.each(function(index,obj){
					var _id = $(obj).attr('data-id');
					var _name = $(obj).attr('data-name');
					var _box =  $('#editParBox_tree_clss').prev();
					var exist = _box.find('[data-id="'+_id+'"]');
					if(exist.size()<=0){
						//还没有添加过，所以要添加
						$('#editParBox_add_clss').before('<span class="clsspan" data-id="'+_id+'"  data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
					}
				});
			}else{
				var _box =  $('#editParBox_tree_clss').prev();
				var exist = _box.find('[data-id="'+_id+'"]');
				if(exist.size()<=0){
					//还没有添加过，所以要添加
					$('#editParBox_add_clss').before('<span class="clsspan" data-id="'+_id+'"  data-name="'+_name+'"><span class="clsspan_icon"></span>'+_name+'<span class="clsspan_del glyphicon glyphicon-remove"></span></span>');
				}
			}
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
			return false;
		});
		//绑定显示树形选择区
		win.find('.addspan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_this.hide().next().show();
			_parent.parent().parent().removeClass('has-error');
			_parent.next().show();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
		});
		win.find('.minusspan').off().on('click',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_this.hide().prev().show();
			_parent.parent().parent().removeClass('has-error');
			_parent.next().hide();
			win.popupOpen({maskColor:'#333',maskOpacity : '0.8'});
		});
		//绑定删除
		win.find('.depselect').off().on('click','.glyphicon-remove',function(){
			var _this = $(this);
			var _parent = _this.parent();
			_parent.remove();
		});

		//绑定多个学生时候的点击切换
		var spans = win.find('.popbox_nav span');
		spans.off().on('click',function(){
			var _this = $(this);
			var uid = _this.attr('data-uid');
			if(_validStudent() && _students[uid]){
				//通过检验
				spans.removeClass('up');
				_this.addClass('up');
				_nowStudent = _students[uid];
				switchStudent();
			}
		});

		//检验当前学生内部辅助方法,通过校验修改当前学生信息并返回true，不通过返回false
		var _validStudent = function(){
			var _classCodes = [];
			$('#editParBox_add_clss').parent().find('.clsspan').each(function(index,obj){
				_classCodes.push($(obj).attr('data-id'));
			});
			if(_classCodes.length<=0){
				$('#editParBox_tree_clss').parent().parent().addClass('has-error');
				_common.tips('请选择班级');
				return false;
			}
			if(_classCodes.length>1){
				$('#editParBox_tree_clss').parent().parent().addClass('has-error');
				_common.tips('每个学生只能属于一个班级');
				return false;
			}

			var _studentName = $('#editParBox_stuname').val();
			if(!_studentName){
				$('#editParBox_stuname').parent().parent().addClass('has-error');
				_common.tips('学生姓名不可为空');
				return false;
			}
			var _studentNo = $('#editParBox_stuno').val();
			/*
			if(!_studentNo){
				$('#editParBox_stuno').parent().parent().addClass('has-error');
				_common.tips('学号不可为空');
				return false;
			}
			*/
			var _stuphone = $('#editParBox_stuphone').val();
			var _stuemail = $('#editParBox_stuemail').val();

			_nowStudent.studentName = _studentName;
			_nowStudent.classWeixinId = _classCodes[0];
			if(_studentNo){
				_nowStudent.studentNo = _studentNo;
			}else{
				delete _nowStudent.studentNo;
			}
			if(_stuphone){
				_nowStudent.phoneNum = _stuphone;
			}else{
				delete _nowStudent.phoneNum;
			}
			if(_stuemail){
				_nowStudent.email = _stuemail;
			}else{
				delete _nowStudent.email;
			}
			return true;
		}

		//绑定关闭
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		//绑定提交
		win.find('.btn_blue').off().on('click',function(){
			if(applying){
				return;
			}
			if(!_validStudent()){
				return;
			}
			var _studentList = [];
			for(var key in _students){
				if(_students[key]){
					_studentList.push(_students[key]);
				}
			}
			var _name = $('#editParBox_parname').val();
			if(!_name){
				$('#editParBox_parname').parent().parent().addClass('has-error');
				_common.tips('家长姓名不可为空');
				return false;
			}
			/* 暂时屏蔽
			var _relation = $('#editParBox_relation').val();
			if(!_relation){
				$('#editParBox_relation').parent().parent().addClass('has-error');
				_common.tips('请选择亲属关系');
				return false;
			}
			*/
			var _phone = field = $('#editParBox_parphone').val();
			if(!qt_valid.phone(_phone)){
				$('#editParBox_parphone').parent().parent().addClass('has-error');
				_common.tips(_phone?'手机格式错误':'请输入手机');
				return false;
			}
			var _email = $('#editParBox_paremail').val();
			if(_email && !qt_valid.email(_email)){
				$('#editParBox_paremail').parent().parent().addClass('has-error');
				_common.tips('email格式错误');
				return false;
			}
			var _weixin = $('#editParBox_parweixin').val();

			applying = true;
			var params = {
				parentName: _name,
				phoneNum: _phone,
				studentList : _studentList,
				uid : $('#editParBox_uid').val()
			}
			if(_email){
				params.email = _email;
			}
			if(_weixin){
				params.weixin = _weixin;
			}
			_common.showLoading();
			_common.post(_SERVICE+'/school/updateParent?schoolCode='+treeSchoolCode,params,function(rtn){
				_common.hideLoading();
				applying = false;
				if('0000000' == rtn.rtnCode){
					win.popupClose();
					_common.tips('success','更新成功');
					queryMember(1);
				}else{
					_common.tips(rtn.msg);
				}
			});
		});

		//效果处理
		win.find('.form-group input,.form-group textarea,.form-group select').off('click.check').on('click.check',function(){
			$(this).parent().parent().removeClass('has-error');
		});

		win.popupOpen({
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}

	//查询关系
	function queryRelation(parentCode,callback){
		var params = {
			'parentCode' : parentCode
		};
		_common.post(_SERVICE+'/school/getRelations',params,function(rtn){
			if('0000000' == rtn.rtnCode){
				var lists = rtn.bizData.lists;
				callback && callback(lists);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}
    //查询关系(伪)
    function queryRelationS(parentCode,callback){
        $.getJSON("./js/parent.json",function(data){
            callback && callback(data);
        });
    }

	//查询申请加入
	function queryNeedVerfyNum(callback){
		$('.bar_tips').hide();
		var params = {
			schoolCode: treeSchoolCode
		};
		_common.post(_SERVICE+'/addressBook/queryNeedVerfyNum',params,function(rtn){
			if('0000000' == rtn.rtnCode){
				var needVerfyNum = rtn.bizData.needVerfyNum;
				$('.bar_tips').text((needVerfyNum?needVerfyNum:0)+'条验证消息').css('color',(needVerfyNum>0?'#f33':'#999')).show();
				callback && callback();
			}else{
				_common.tips(rtn.msg);
			}
		});
	}



	//通讯录表格
	var mainTable = null;
	//当前查询的类型
	var tbUserStatus = '0';
	//当前表格关联的分组id
	var tbNodeid = '';
	//当前查询数节点的departmentType
	var departmentType = '1';
	//当前显示的表格数据cache
	var tableDataCache = {};

	//根据分组节点查询详细用户
	function queryMember(pageno,departmentType){
		hideDetailInfo();
		var _departmentType = departmentType || 1;
		var params = {
			schoolCode: treeSchoolCode,
			page: pageno,
			pageSize: mainTable.pageSize,
            departmentId: tbNodeid,
            departmentType:_departmentType,
           // teachParentFlag: "2",
            attention :tbUserStatus,//关注状态
            keyword : $.trim($('#searchContent').val())
		};
		_common.showLoading();
		_common.post('/api/contract/queryPageUsers.do',params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				fillTableData(rtn.bizData);
			}else{
				_common.tips(rtn.msg);
				mainTable && mainTable.setNoData();
			}
		});
	}
	//填充表格数据
	function fillTableData(result){
		/*
		attention: "4"
		mobile: "15900088291"
		name: "林嘉强"
		synchro: "1"
		teachParentFlag: "1"
		userid: "0cf55c77843011e5be87fa163e33daaa"
		*/
		//填充表格数据
		tableDataCache = {};
		var html = new Array();
		var lists = result.rows;
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			var _role = '';
			switch(item.departmentSize){
				case 1 :_role = '家长';break;
				case 2 :_role = '老师';break;
				case 3 :_role = '老师/家长';break;
				default:;
			}
			var _name = item.name;
			if("2" == item.teachParentFlag){
				_name = item.name;
			}else if('1' == item.teachParentFlag){
				_name = item.usDisplayName;
			}else if('3' == item.teachParentFlag){
				if('2' == departmentType){
					_name = item.name;
				}else{
					_name = item.usDisplayName;
				}
			}
			html.push('<tr data-userid="'+item.userid+'">');
			html.push('    <td>'+('1'==item.attention? '' : '<input type="checkbox" data-userid="'+item.userid+'"/>')+'</td>');
			html.push('    <td>'+_name+'</td>');
			html.push('    <td>'+_role+'</td>');
			html.push('    <td>'+_common.fillStar(item.mobile?item.mobile:'')+'</td>');
			html.push('    <td>'+('1'==item.attention?'已关注':'未关注')+'</td>');
			html.push('</tr>');
			tableDataCache[item.userid]=item;
		}

		var tbTotalTop = $('#tbTotalTop');
		tbTotalTop.html(tbTotalTop.attr('data-label')+'('+result.records+')<span></span>');

		if(lists.length<=0){
			mainTable && mainTable.setNoData();
			return;
		}
		//填入数据
		mainTable && mainTable.setTbody(html.join(''));
		//更新表格脚部
		mainTable && mainTable.updateTfoot({
			pageNo : result.page,
			pageMax : result.total,
			totalRecord : result.records
		});
		mainTable && mainTable.showTfoot();

	}

	//初始化搜索条件
	function initTable(){
		//创建表格对象
		mainTable = _table.initTable({
			selector : '#mainTable',
			pageSize : 10,
			onPagenoChange : function(pageNo){
				queryMember(pageNo);
			},
			onPagesizeChange : function(){
				queryMember(1);
			},
			onPagenoJumpOver : function(pageNo,pageMax){
				_common.tips('请输入'+pageMax+'以内的数字');
			}
		});
		mainTable.hideTfoot();

		//绑定显示详情
		$('#tbBody').on('click','tr',function(){
			var _this = $(this);
			var userid = _this.attr('data-userid');
			showDetailInfo(userid);
		});
		//防止勾选冒泡
		$('#tbBody').on('click','input',function(e){
			e.stopPropagation();
			if(!this.checked){
				$('#tbHead input')[0].checked = false;
			}
		});

		//绑定同步通讯录
		var applying = false;
		$('#rsyncBtn').on('click',function(){
			if(applying){
				return;
			}
			if(!treeSchoolCode){
				_common.tips('请先选择学校');
				return;
			}
			var params = {
				schoolCode : treeSchoolCode
			}
			applying = true;
			_common.showLoading();
			_common.post(_SERVICE+'/addressBook/syncAddressBook?schoolCode='+treeSchoolCode,params,function(rtn){
				applying = false;
				_common.hideLoading();
				if('0000000' == rtn.rtnCode){
					_common.tips('success','正在同步中，请稍等几分钟再刷新通讯录');
				}else{
					_common.tips(rtn.msg);
				}
			},function(){
				applying = false;
				_common.hideLoading();
				_common.tips('syncAddressBook服务异常，请稍后再试');
			});
		});
		//绑定批量邀请
		$('#batchInviteBtn').on('click',function(){
			if(!treeSchoolCode){
				_common.tips('请先选择学校');
				return;
			}
			/*切换为表格方式，保留代码*/
			var uids = [];
			var checkboxs = $('#tbBody input[type="checkbox"]');
			checkboxs.each(function(index,obj){
				if(obj.checked){
					uids.push($(obj).attr('data-userid'));
				}
			});
			if(uids.length<=0){
				_common.tips('请先选择邀请对象');
				return;
			}
			var params = {
				schoolCode : treeSchoolCode,
				uid : uids.join(',')
			}
			_common.showLoading();
			_common.post(_SERVICE+'/addressBook/inviteMembers',params,function(rtn){
				_common.hideLoading();
				if('0000000' == rtn.rtnCode){
					_common.tips('success','发出邀请成功');
				}else{
					_common.tips(rtn.msg);
				}
			});
		});
		//绑定一键邀请
		$('#oneKeyInviteBtn').on('click',function(){
			if(!treeSchoolCode){
				_common.tips('请先选择学校');
				return;
			}
			_invite.showInvite({
				schoolCode : treeSchoolCode,
				schoolName : treeRoot.name
			});
		});

		//绑定批量删除
		$('#batchDelBtn').on('click',function(){
			if(!treeSchoolCode){
				_common.tips('请先选择学校');
				return;
			}
			var uids = [];
			var checkboxs = $('#tbBody input[type="checkbox"]');
			checkboxs.each(function(index,obj){
				if(obj.checked){
					uids.push($(obj).attr('data-userid'));
				}
			});
			if(uids.length<=0){
				_common.tips('请先选择删除对象');
				return;
			}
			deleteUsers(true , uids,null,function(){
				mainTable && queryMember(mainTable.pageNo);
			});
		});
		//绑定表格全选
		$('#tbHead input').on('click',function(){
			var _this = this;
			//进行了勾选
			var checkboxs = $('#tbBody input[type="checkbox"]');
			checkboxs.each(function(index,obj){
				obj.checked = _this.checked;
			});
		});

		//绑定搜索
		$('#searchContent').on('keyup',function(e){
			if(13 == e.keyCode){
				queryMember(1);
			}
		});
		$('#searchContentBtn').on('click',function(e){
			queryMember(1);
		});

		//绑定过滤关注状态
		$('#tbTotalTop').on('click',function(){
			$('#tbUserStatus').fadeIn();
			$(window).on('click.tbTotalTop',function(){
				$(window).off('click.tbTotalTop');
				$('#tbUserStatus').fadeOut();
			});
			return false;
		});
		$('#tbUserStatus').on('click','li',function(){
			var _this = $(this);
			var type = _this.attr('data-type');
			var label = _this.html();
			$('#tbTotalTop').attr('data-label',label);
			tbUserStatus = type;
			_this.parent().fadeOut();
			queryMember(1);
			return false;
		});
	}

	//根据用户id显示详细信息
	function showDetailInfo(userid){
		if(!userid){
			return;
		}
		var win = $('#detailBox');
		var _title = win.find('.popbox_title');
		var _btns = win.find('.popbox_btns');

		var item = tableDataCache[userid];
		if(!item){
			return;
		}
		var params = {
			schoolCode: treeSchoolCode,
			synchro: item.synchro,
			teachParentFlag: item.teachParentFlag,
			uid: userid
		};
		if('3' == item.teachParentFlag){
			//双角色，要选择
			win.css({'right':'-'+win.width()+'px'}).show();
			showRoleBox(function(teachParentFlag){
				params.teachParentFlag = teachParentFlag;
				queryDetailInfo(params,function(result){
					//win.css({'right':'-'+win.width()+'px'}).show();
					/**var students = result.childrenInfo;
					if('1' == item.attention){

						//已经关注，判断是否能够删除
						if(students && students.length>1){
							//超过两个学生才允许删除
							$('#detailBox .btn_grey').show();
						}else{
							$('#detailBox .btn_grey').hide();
						}
						$('#detailBox .btn_grey').show();
					}else{
						//为关注可以随时删除
						$('#detailBox .btn_grey').show();
					} **/
					$('#detailBox .btn_grey').show();
					win.find('.popbox_con').css({
						'overflow-y':'auto',
						'max-height':win.height()-_title.outerHeight() - _btns.outerHeight()
					});
					win.animate({right:'0px'},300);
				});
			})
		}else{
			//单角色，直接查询
			queryDetailInfo(params,function(result){
				var students = result.childrenInfo;
				/**if('1' == item.attention){
					//已经关注，判断是否能够删除
					if(students && students.length>1){
						//超过两个学生才允许删除
						$('#detailBox .btn_grey').show();
					}else{
						$('#detailBox .btn_grey').hide();
					}
				}else{
					//为关注可以随时删除
					$('#detailBox .btn_grey').show();
				}**/
				$('#detailBox .btn_grey').show();
				win.css({'right':'-'+win.width()+'px'}).show();
				win.find('.popbox_con').css({
						'overflow-y':'auto',
						'max-height':win.height()-_title.outerHeight() - _btns.outerHeight()
					});
				win.animate({right:'0px'},300);
			});
		}

		//关闭
		win.find('.close').off().on('click',function(){
			hideDetailInfo();
		});
		//删除
		win.find('.btn_grey').off().on('click',function(){
			var sid = win.data('sid');
			deleteUsers(false , [userid],sid,function(){
				hideDetailInfo();
				mainTable && queryMember(mainTable.pageNo);
			});
		});
		//修改
		win.find('.btn_blue').off().on('click',function(){
			queryDetailEditInfo(params,function(editInfo){
				hideDetailInfo();
				if('2' == params.teachParentFlag){
					//修改教师
					addTeacher(editInfo.userInfo);
				}else if('1' == params.teachParentFlag){
					//修改家长
					editParent(editInfo);
				}else{
					//do nothing
				}
			});
		});
	}
	function hideDetailInfo(fast){
		var win = $('#detailBox');
		if(fast){
			win.css({right:'-'+win.width()+'px'}).hide();
		}else{
			win.animate({right:'-'+win.width()+'px'},300,function(){
				win.hide();
			});
		}
	}

	//显示类型选择
	function showRoleBox(callback){
		var win = $('#roleBox');
		$('#roleBox_type')[0].selectedIndex = 0;
		win.find('.btn_grey').off().on('click',function(){
			win.popupClose();
		});
		win.find('.btn_blue').off().on('click',function(){
			var _type = $('#roleBox_type').val();
			if(!_type){
				_common.tips('请选择要查看的身份');
				return;
			}
			win.popupClose();
			callback && callback(_type);
		});
		$('#roleBox').popupOpen({
			mask:false,
			maskColor:'#333',
			maskOpacity : '0.8'
		});
	}

	//查询个人详细信息
	function queryDetailInfo(params,callback){
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/getUserDetail?schoolCode='+treeSchoolCode+'&uid='+params.uid,params,function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var result = rtn.bizData;
				var students = result.childrenInfo;
				var classInfo = result.classInfo;
				var deptInfo = result.deptInfo;

				var html = new Array();
				if(students.length >1){
					//超过一个学生
					html.push('<div class="popbox_nav">');
					for(var i=1;i<=students.length;i++){
						html.push('<span '+(1==i?'class="up"':'')+'>学生'+i+'</span>');
					}
					html.push('</div>');
				}
				for(var i=0;i<students.length;i++){
					var item = students[i];
					html.push('<div class="popbox_nav_con" '+(i!=0?'style="display:none;"':'')+' data-uid="'+students[i].uid+'">');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3"><em>*</em>学生ID</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.uid?item.uid:'')+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3"><em>*</em>学生姓名</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+item.studentName+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3"><em>*</em>学生学号</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.studentNo?item.studentNo:'')+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3"><em>*</em>所属班级</label>');
					var _cls = treeDataMap[item.classWeixinId];
					html.push('		<div class="col-md-9"><p class="form-control-static">'+( _cls ? ( _cls.clazzAlias ? _cls.clazzAlias : _cls.name ) :'')+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3">手机号码</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.phoneNum?item.phoneNum:'')+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3">邮箱</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.email?item.email:'')+'</p></div>');
					html.push('	</div>');
					html.push('</div>');
				}
				if(students.length >0){
					html.push('<hr/>');
				}
				var item = result.userInfo;
				switch(item.teachParentFlag){
					case '1' :_role = '家长';break;
					case '2' :_role = '老师';break;
					case '3' :_role = '老师/家长';break;
					default:;
				}
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3"><em>*</em>姓名</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+item.name+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3"><em>*</em>用户ID</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+item.userid+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3" style="padding-left:0;"><em>*</em>身份</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+_role+'</p></div>');
				html.push('</div>');
				if('2' == item.teachParentFlag || '3'== item.teachParentFlag){
					html.push('<div class="form-group form-group-sm">');
					html.push('	<label class="control-label col-md-3"><em>*</em>所属部门</label>');
					html.push('	<div class="col-md-9"><p class="form-control-static">'+deptInfo.join(',')+'</p></div>');
					html.push('</div>');
					//教师新增版主任带班
					if(result.clazzMaster && treeDataMap[result.clazzMaster]) {
						var _maincls = treeDataMap[result.clazzMaster];
						html.push('<div class="form-group form-group-sm">');
						html.push('	<label class="control-label col-md-3">班主任带班</label>');
						html.push('	<div class="col-md-9"><p class="form-control-static">' + ( _maincls.clazzAlias ? _maincls.clazzAlias : _maincls.name ) + '</p></div>');
						html.push('</div>');
					}
				}
				var _clsLabel = '班级'
				if('2' == item.teachParentFlag){
					_clsLabel = '所带班级';
				}
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3"><em>*</em>'+_clsLabel+'</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+classInfo.join(',')+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3"><em>*</em>手机</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+item.mobile+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">微信号</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+(item.weixinid?item.weixinid:'')+'</p></div>');
				html.push('</div>');

				//var listDetail = tableDataCache[item.userId];
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">关注状态</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+('1'==item.status?'已关注':'未关注')+'</p></div>');
				html.push('</div>');

				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">邮箱</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+(item.email?item.email:'')+'</p></div>');
				html.push('</div>');

				$('#detailBox form').html(html.join(''));
				if(students.length >1){
					qt_ui.tabs({
						jqBtns : $('#detailBox .popbox_nav span'),
						jqDivs : $('#detailBox .popbox_nav_con'),
						onTab : function(index){
							$('#detailBox').data('sid',$('#detailBox .popbox_nav_con').eq(index).attr('data-uid'));
						}
					});
				}
				if('1' == item.teachParentFlag){
					$('#detailBox').data('sid',$('#detailBox .popbox_nav_con').eq(0).attr('data-uid'));
				}else{
					$('#detailBox').data('sid',null);
				}
				callback && callback(result);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//查询个人修改信息
	function queryDetailEditInfo(params,callback){
		_common.post(_SERVICE+'/addressBook/getUserData?schoolCode='+treeSchoolCode+'&uid='+params.uid+'&teachParentFlag='+params.teachParentFlag,params,function(rtn){
			if('0000000' == rtn.rtnCode){
				var result = rtn.bizData;
				callback && callback(result);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//删除用户
	//新增参数isMulti, 标识是否批量删除
	function deleteUsers(isMulti , uids,sids,callback){

		if(!uids || uids.length<=0){
			return;
		}
		var params = {
			schoolCode : treeSchoolCode,
			uid : uids.join(',')
		}

		if(sids && sids.length>0){
			params.stuUserId = sids;
			params.role='par';
		} else if(!isMulti) {
			//非批量删除，要带上role参数
			params.role='tea';
		}

		_common.showMsg({
			msg : '确定执行删除？',
			//okbtnText : '确定删除',
			okcallback : function(){
				_common.showLoading();
				_common.post('/api/user/delete.do',params,function(rtn){
					_common.hideLoading();
					if('0000000' == rtn.rtnCode){
						_common.tips('success','删除成功');
						callback && callback();
					}else{
						_common.tips(rtn.msg);
					}
				});
			}
		});
	}















	//------------------------------window方法 begin------------------------------//
	//------------------------------window方法 end--------------------------------//



	//业务入口
	initPage();



	//测试代码
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
