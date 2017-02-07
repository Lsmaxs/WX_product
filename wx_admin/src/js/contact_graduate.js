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
		var pSchoolCode = qt_util.P('schoolCode');
		var pAreaAddr = qt_util.P('areaAddr');
		var sessioinFilled = initSessionRegionSearch();

		if(sessioinFilled){
			initRegionSearch(false);
			$('#schoolSelect').trigger('change');
		}else if(pSchoolCode && pAreaAddr){
			pSchoolCode = decodeURIComponent(pSchoolCode);
			pAreaAddr = decodeURIComponent(pAreaAddr);
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
		_common.post(_SERVICE+'/school/getAllBindSchoolList?areaCode='+areaCode,{},function(rtn){
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
		//这里要做几次调用
		queryProvince(function(){
			var flag = _selectAsLabel('provinceSelect',areaAddr[0]);
			var areacode = $('#provinceSelect').val();
			if(!areacode){
				$('#citySelect').hide();
			}else{
				$('#citySelect').show();
				queryCity(areacode,function(){
					var flag = _selectAsLabel('citySelect',areaAddr[1]);
					var areacode = $('#citySelect').val();
					if(!areacode){
						$('#areaSelect').hide();
					}else{
						$('#areaSelect').show();
						queryArea(areacode,function(){
							var flag = _selectAsLabel('areaSelect',areaAddr[2]);
							var areacode = $('#areaSelect').val();
							queryBindSchool(areacode,function(){
								var flag = _selectAsValue('schoolSelect',schoolCode);
								$('#schoolSelect').trigger('change');
							});
						});
					}
				});
			}
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

	//根据学校编码刷新通讯录信息
	function refreshContactData(schoolCode){
		if(schoolCode||treeSchoolCode){
			queryTree(schoolCode||treeSchoolCode);
		}
	}

	//查询通讯录树
	function queryTree(schoolCode,callback){
		
		var tbTotalTop = $('#tbTotalTop');
		tbTotalTop.html(tbTotalTop.attr('data-label')+'(0)');
		
		treeSchoolCode = schoolCode;
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryAddressOfGraduateGrade',{schoolCode:schoolCode},function(rtn){
			if('0000000' == rtn.rtnCode){
				var lists = rtn.bizData;
				var isShow = false;
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
				//console.log(tbNodeid);
				treeRoot = lists[0];
				
				//修改表格查询的各个条件
				departmentType = 5;
				$('#searchContent').val('');
				
				for(var listIndex=0 ; listIndex<lists.length; listIndex++) {
					var listItem = lists[listIndex];
					if(listItem.departmentType == 5) {
						//获取到首个班级节点
						tbNodeid = lists[listIndex].id;
						
						//获取上一个年级节点,并修改为打开样式
						lastNodeid = lists[listIndex-1].id;
						var lastNode = $('#leftTree').find('[data-nodeid="'+lastNodeid+'"]');
						
						lastNode.find('.tree_fold').eq(0).removeClass('fold').addClass('unfold');
						lastNode.find('.tree_list').css({ overflow: 'visible', display: 'block'});
						
						$('#leftTree').find('[data-id="'+tbNodeid+'"]').click();
						
						queryMember(1);
						
						isShow = true;
						
						break;
					}
				}

				//显示数据
				if(!isShow) {
					$('#tbBody').html('<tr><td colspan="5" style="text-align:center">暂无数据</td></tr>');
				}
				$('.main').show();
				_common.hideLoading();
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
		//是否父节点
		var isparent = true;


		//子列表
		var subList = treeDataSubMap[item.id];

		if(0 == level || 1== level){
			//一级和二级节点直接打开
			isunflod = true;
		}
		if(subList&&subList.length<=0){
			//判断当前节点是否父节点
			isparent = false;
		}
		//优先采用别名
		var nodename = item.clazzAlias && item.clazzAlias!='' ? item.clazzAlias : item.name;
		
		html.push('<div class="tree_node">');
		html.push('		<div class="tree_nav tree_folder">');
		html.push('			<span class="tree_fold '+(isunflod?'unfold':'fold')+'" '+ (isparent?'':'style="visibility:hidden;"') +'></span><span class="tree_label" data-id="'+item.id+'" data-departmentType="'+item.departmentType+'" title="'+nodename+'">'+nodename+'</span>');
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

		//绑定表格查询
		leftTree.on('click','.tree_label',function(){
			var _this = $(this);
			var _id = _this.attr('data-id');
			var _departmentType = _this.attr('data-departmentType');
			if(_departmentType != 5) {
				return;
			}
			tbNodeid = _id;
			leftTree.find('.up').removeClass('up');
			_this.addClass('up');
			queryMember(1);
			return false;
		});

		//避免a标签虚线框问题
		leftTree.on('focus','.tree_more',function(){
			var _this = $(this);
			_this.blur();
			return false;
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
	function queryMember(pageno){
		hideDetailInfo();
		var params = {
			schoolCode: treeSchoolCode,
			page: pageno, 
			pageSize: mainTable.pageSize,
			groupid: tbNodeid,
			departmentType :5,
			userStatus :tbUserStatus,//关注状态
			searchContent : $.trim($('#searchContent').val())
		};
		_common.showLoading();
		_common.post(_SERVICE+'/addressBook/queryAddressOfGraduateMembers',params,function(rtn){
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
		//填充表格数据
		tableDataCache = {};
		var html = new Array();
		var lists = result.rows;
		for(var i=0;i<lists.length;i++){
			var item = lists[i];
			html.push('<tr data-userid="'+item.uid+'">');
			html.push('    <td>'+('1'==item.status?'':'<input type="checkbox" data-userid="'+item.uid+'"/>')+'</td>');
			html.push('    <td>'+ item.usDisplayName +'</td>');
			html.push('    <td>家长</td>');
			html.push('    <td>'+_common.fillStar(item.phone?item.phone:'')+'</td>');
			html.push('    <td>'+('1'==item.status?'已关注':'未关注')+'</td>');
			html.push('</tr>');
			tableDataCache[item.uid]=item;
		}

		var tbTotalTop = $('#tbTotalTop');
		tbTotalTop.html(tbTotalTop.attr('data-label')+'('+result.records+')');

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
		$('#rsyncBtn').on('click',function(){
			if(!treeSchoolCode){
				_common.tips('请先选择学校');
				return;
			}
			var params = {
				schoolCode : treeSchoolCode
			}
			_common.showLoading();
			_common.post(_SERVICE+'/addressBook/syncAddressBook?schoolCode='+treeSchoolCode,params,function(rtn){
				_common.hideLoading();
				if('0000000' == rtn.rtnCode){
					_common.tips('success','正在同步中，请稍等几分钟再刷新通讯录');
				}else{
					_common.tips(rtn.msg);
				}
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
			deleteUsers(uids,null,function(){
				mainTable && queryMember(mainTable.pageNo);
			});
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
			uid: userid
		};

		//单角色，直接查询
		queryDetailInfo(params,function(result){
			var students = result.childrenInfo;
			if('1' == item.attention){
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
			}
			win.css({'right':'-'+win.width()+'px'}).show();
			win.find('.popbox_con').css({
					'overflow-y':'auto',
					'max-height':win.height()-_title.outerHeight() - _btns.outerHeight()
				});
			win.animate({right:'0px'},300);
		});
		

		//关闭
		win.find('.close').off().on('click',function(){
			hideDetailInfo();
		});
		//删除
		win.find('.btn_grey').off().on('click',function(){
			var sid = win.data('sid');
			deleteUsers([userid],sid,function(){
				hideDetailInfo();
				mainTable && queryMember(mainTable.pageNo);
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
		
		_common.post(_SERVICE+'/addressBook/detailOfGradMembers?schoolCode='+treeSchoolCode+'&userId='+params.uid,{},function(rtn){
			_common.hideLoading();
			if('0000000' == rtn.rtnCode){
				var result = rtn.bizData;
				var students = result.childrenInfo;
				var _role = '';
				
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
					html.push('		<label class="control-label col-md-3">学生ID</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.uid?item.uid:'')+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3">学生姓名</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+item.studentName+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3">学生学号</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.studentNo?item.studentNo:'')+'</p></div>');
					html.push('	</div>');
					html.push('	<div class="form-group form-group-sm">');
					html.push('		<label class="control-label col-md-3">班级</label>');
					html.push('		<div class="col-md-9"><p class="form-control-static">'+(item.className?item.className:'')+'</p></div>');
					html.push('	</div>');
					html.push('</div>');
				}
				if(students.length >0){
					html.push('<hr/>');
				}
				var item = result.userInfo;
				
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">姓名</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+item.name+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">用户ID</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+item.userid+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">手机</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+item.mobile+'</p></div>');
				html.push('</div>');
				html.push('<div class="form-group form-group-sm">');
				html.push('	<label class="control-label col-md-3">微信号</label>');
				html.push('	<div class="col-md-9"><p class="form-control-static">'+(item.weixinid?item.weixinid:'')+'</p></div>');
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
				} else {
					$('#detailBox').data('sid',$('#detailBox .popbox_nav_con').eq(0).attr('data-uid'));
				}
				callback && callback(result);
			}else{
				_common.tips(rtn.msg);
			}
		});
	}

	//删除用户
	function deleteUsers(uids,sids,callback){
		if(!uids || uids.length<=0){
			return;
		}
		var params = {
			schoolCode : treeSchoolCode,
			ids : uids.join(','),
			stuId : ''+sids
		}

		_common.showMsg({
			msg : '确定执行删除？',
			//okbtnText : '确定删除',
			okcallback : function(){
				_common.showLoading();
				_common.post(_SERVICE+'/addressBook/removeGradMembers',params,function(rtn){
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
	
	module.exports = qt_model;

});