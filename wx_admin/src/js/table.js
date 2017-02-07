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


	/**
	 * @desc 表格简单封装类
	 * @param {Object} options 参数对象
	 * @param {String} options.selector 表格css选择器
	 * @param {Number} [options.pageSize] 分页大小
	 * @param {Number} [options.pageSizes] 分页大小下拉
	 * @param {Function} [options.onPagenoChange] 页码变化回调，会传入目标页码
	 * @param {Function} [options.onPagenoJumpOver] 页码跳转溢出回调，会传入目标页码，以及最大页码
	 * @param {Function} [options.onPagesizeChange] 分页大小变化回调，会传入目标页码
	 * @return 
	 */
	function Table(options){
		if(!options){
			options = {};
		}
		this.options = options;
		//页码
		this.pageNo = 1;
		//分页大小
		this.pageSize = options.pageSize?options.pageSize:10;
		this.pageSizes = options.pageSizes?options.pageSizes:[10,20,30,50];
		
		//最大页码
		this.pageMax = 9999;
		//表格对象
		this.table = $(''+options.selector);
		this.thead = this.table.find('thead');
		this.tbody = this.table.find('tbody');
		//表格列数
		this.colsNum = this.thead.find('tr').eq(0).find('th,td').size();

		this.tfoot= this.table.find('tfoot');
		this._initTfoot();
		this.pager = this.tfoot.find('ul');
		this.pageJump = this.tfoot.find('input');
		this.sizeSelect = this.tfoot.find('select');
		this.recordTotal = this.tfoot.find('[data-total]');

		var selectedIndex = 0;
		for(var i=0;i<this.pageSizes.length;i++){
			if(this.pageSize == this.pageSizes[i]){
				selectedIndex = i;
				break;
			}
		}
		if(this.sizeSelect.size() >0){
			this.sizeSelect[0].selectedIndex = selectedIndex
		}
		this._bindEvent();
	}
	Table.prototype = {
		/**
		 * @desc 初始化footer
		 * @return 
		 */
		_initTfoot : function(){

			if(this.tfoot.size() <=0){
				this.table.append('<tfoot></tfoot>');
				this.tfoot.find('tfoot');
			}

			var html = new Array();

			html.push('<tr>');
			html.push('	<td colspan="'+this.colsNum+'" class="table_pager">');
			html.push('		<div class="pager_wrapper">');
			html.push('			<ul data-pager="1" class="pagination pagination-sm">');
			html.push('				<li class="disabled"><a href="javascript:;"><span class="glyphicon glyphicon-triangle-left"></span>上一页</a></li>');
			html.push('				<li class="active"><a href="javascript:;">1</a></li>');
			html.push('				<li><a href="javascript:;">下一页<span class="glyphicon glyphicon-triangle-right"></span></a></li>');
			html.push('			</ul><div class="pager_tools">');
			html.push('					第<input data-jump="1" class="form-control" type="text">页 ');
			html.push('					每页');
			if(this.pageSizes.length>1){
				html.push('					<select data-sizes="1" class="form-control">');
				for(var i=0;i<this.pageSizes.length;i++){
					var size = this.pageSizes[i];
					html.push('						<option value="'+size+'" data-value="'+size+'">'+size+'</option>');
				}
				html.push('					</select>条');
			}else{
				html.push(this.pageSizes[0]+'条');
			}
			html.push('/共<span data-total="1">0</span>条');
			html.push('			</div>');
			html.push('		</div>');
			html.push('	</td>');
			html.push('</tr>');
			this.tfoot.html(html.join(''));
		},
		/**
		 * @desc 绑定事件
		 * @return 
		 */
		_bindEvent : function(){
			var _this = this;

			//绑定分页点击
			this.pager.on('click','li',function(){
				var target = $(this).attr('data-target');
				if(!target){
					return;
				}
				_this.options.onPagenoChange && _this.options.onPagenoChange(parseInt(target));
			});

			//绑定页码跳转
			this.pageJump.on('keyup',function(e){
				var _val = _this.pageJump.val();
				if(/[^\d]+/.test(_val)){
					_val = _val.replace(/[^\d]+/ig,'');
					 _this.pageJump.val(_val);
				}
				if(13 == e.keyCode){
					_val = parseInt(_val.replace(/^0+/,''));
					if(_val>_this.pageMax){
						_this.options.onPagenoJumpOver && _this.options.onPagenoJumpOver(_val,_this.pageMax);
						return;
					}
					_this.options.onPagenoChange && _this.options.onPagenoChange(_val);
				}
			});

			//绑定分页大小
			this.sizeSelect.on('change',function(){
				var _val = parseInt($(this).val());
				_this.pageSize = _val;
				_this.options.onPagesizeChange && _this.options.onPagesizeChange(_val);
			});
		},
		
		/**
		 * @desc 更新表格tfoot
		 * @param {Object} info 参数对象
		 * @param {Number} info.pageNo 
		 * @param {Number} info.pageMax 最大页码
		 * @param {Number} info.totalRecord 总记录数
		 * @return 
		 */
		updateTfoot : function(info){
			var _pageNo = info.pageNo;
			var _pageMax = info.pageMax;
			var _total = info.totalRecord;

			//填充分页
			var _begin = 0;
			var _end = 0;

			if(_pageMax <=5){
				_begin = 1;
				_end = _pageMax;
			}else{
				if(_pageNo<=3){
					_begin = 1;
					_end = 5;
				}else if(_pageNo >= _pageMax-2){
					_begin = _pageMax - 4;
					_end = _pageMax;
				}else{
					_begin = _pageNo - 2;
					_end = _pageNo + 2;
				}
			}
			html = new Array();
			html.push('<li '+(1 == _pageNo?'class="disabled"':('data-target="'+(_pageNo-1)+'"'))+'><a href="javascript:;"><span class="glyphicon glyphicon-triangle-left"></span>上一页</a></li>');
			for(var i=_begin;i<=_end;i++){
				html.push('<li data-target="'+i+'" '+(i == _pageNo?'class="active"':'')+'><a href="javascript:;">'+i+'</a></li>');
			}
			html.push('<li '+(_pageMax == _pageNo?'class="disabled"':('data-target="'+(_pageNo+1)+'"'))+'><a href="javascript:;">下一页<span class="glyphicon glyphicon-triangle-right"></span></a></li>');

			//真正更新
			this.pager.html(html.join(''));
			this.pageJump.val('');
			this.recordTotal.html(_total);

			//更新页码
			this.pageNo = _pageNo;
			this.pageMax = _pageMax;
		},
		/**
		 * @desc 显示表格tfoot
		 * @return 
		 */
		showTfoot : function(){
			this.tfoot.show();
		},
		/**
		 * @desc 隐藏表格tfoot
		 * @return 
		 */
		hideTfoot : function(){
			this.tfoot.hide();
		},
		/**
		 * @desc 清空表格数据
		 * @return 
		 */
		clearTbody : function(){
			this.tbody.html('');
			this.hideTfoot();
		},
		/**
		 * @desc 显示没有数据
		 * @return 
		 */
		setNoData : function(){
			this.tbody.html('<tr><td colspan="'+this.colsNum+'" style="text-align:center;">暂无数据</td></tr>');
			this.hideTfoot();
		},
		/**
		 * @desc 设置body的html
		 * @return 
		 */
		setTbody : function(htmlstr){
			this.tbody.html(''+htmlstr);
		}
		
	}

	qt_model.initTable = function(options){
		return new Table(options);
	}

	module.exports = qt_model;

});
