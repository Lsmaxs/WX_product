
<!-- basic scripts -->

<!--[if !IE]> -->
<script type="text/javascript">
    window.jQuery || document.write("<script src='${path}/assets/js/jquery.min.js'>"+"<"+"/script>");
    window.onload=function(){
        $("#ace-settings-sidebar").trigger("click");//固定左侧菜单
        $("#ace-settings-navbar").trigger("click");//固定头部导航栏
        $("#ace-settings-breadcrumbs").trigger("click");//固定子菜单

    };
</script>

<!-- <![endif]-->

<!--[if IE]>
<script type="text/javascript">
    window.jQuery || document.write("<script src='${path}/assets/js/jquery1x.min.js'>"+"<"+"/script>");
</script>
<![endif]-->
<script type="text/javascript">
    if('ontouchstart' in document.documentElement) document.write("<script src='${path}/assets/js/jquery.mobile.custom.min.js'>"+"<"+"/script>");
</script>
<#--<script src="${path}/assets/js/require.js" defer async="true" ></script>-->
<script src="${path}/assets/js/bootstrap.min.js"></script>

<!-- page specific plugin scripts -->
<script src="${path}/assets/js/date-time/bootstrap-datepicker.min.js"></script>
<script src="${path}/assets/js/jqGrid/jquery.jqGrid.min.js"></script>
<#--<script src="${path}/assets/js/uncompressed/jqGrid/jquery.jqGrid.js"></script>-->
<script src="${path}/assets/js/jqGrid/i18n/grid.locale-en.js"></script>

<!-- ace scripts -->
<script src="${path}/assets/js/ace-elements.min.js"></script>
<script src="${path}/assets/js/ace.min.js"></script>
<script src="${path}/assets/js/fuelux/jquery.ztree.core-3.5.min.js"></script>
<script src="${path}/assets/js/fuelux/jquery.ztree.excheck-3.5.min.js"></script>

<!-- inline scripts related to this page -->
<script type="text/javascript">

    jQuery(function($) {
        var currentGridId;
        $('.input-daterange').datepicker({autoclose:true});
        $(".close-btn").click(function () {
            var $this = $(this);
            var pt = $this.closest(".treeFixed");
            pt.hide();
        });

        var grid_selector = "#grid-table";
        var pager_selector = "#grid-pager";

        //resize to fit page size
        $(window).on('resize.jqGrid', function () {
            $(grid_selector).jqGrid( 'setGridWidth', $(".page-content").width() );
        })
        //resize on sidebar collapse/expand
        var parent_column = $(grid_selector).closest('[class*="col-"]');
        $(document).on('settings.ace.jqGrid' , function(ev, event_name, collapsed) {
            if( event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed' ) {
                $(grid_selector).jqGrid( 'setGridWidth', parent_column.width() );
            }
        })

        var gridUrl = '/admin/${bizSys}/${mainObj}s';
        if (isExitsFunction("initGridUrl")) {
            gridUrl = initGridUrl();
        }
        jQuery(grid_selector).jqGrid({
            //direction: "rtl",
            url: gridUrl,
//            url: '',
            datatype: "json",
            //json格式处理，集成统一协议格式
            jsonReader: {
                root: "bizData.rows",
                page: "bizData.page",
                total: "bizData.total",
                records: "bizData.records",
                id: "id"
            },
            //根据统一协议格式做处理
            beforeProcessing: function (data) {
                if ("0000000" != data.rtnCode) {
                    //TODO
                    alert("请求远程数据失败！" + data.msg)
                }
            },
            loadComplete: function (data) { //完成服务器请求后，回调函数
                var table = this;
                setTimeout(function () {
                    styleCheckbox(table);

                    updateActionIcons(table);
                    updatePagerIcons(table);
                    enableTooltips(table);
                }, 0);
            },
            onSelectRow: function (id, status) {
                //当前行id
                console.log(id);
                if (status) {
                    currentGridId = id;
                }
                else {
                    currentGridId = null;
                }

            },
            height: 320,

            colNames: [//' ',
            <#list cols as col>
                '${col.displayName}'
                <#if col_has_next>
                    ,
                </#if>
            </#list>
            ],

            //colNames:[' ', 'ID','名称','编码', '父组织', '长编码','顺序','描述','负责人'],
            colModel: [
//            {name:'myac',index:'', width:80, fixed:true, sortable:false, resize:false,
//                formatter:'actions',
//                formatoptions:{
//                    keys:true,
//
//                    delOptions:{recreateForm: true, beforeShowForm:beforeDeleteCallback},
//                    //editformbutton:true, editOptions:{recreateForm: true, beforeShowForm:beforeEditCallback}
//                }
//            },

            <#list cols as col>
                {name: '${col.colId}', index: '${col.colId}', width:${col.width}, sortable: false, editable: ${col.editable}, edittype: "${col.edittype}",
                    editrules:${col.editrules}, editoptions:${col.editoptions}, formatter:${col.formatter}, formatoptions:${col.formatoptions},
                    hidden:${(col.hide==1)?string('true','false')}
                }

                <#if col_has_next>
                    ,
                </#if>
            </#list>
            ],

            viewrecords: true,
            rowNum: 10,
            rowList: [10, 20, 30],
            pager: pager_selector,
            altRows: true,
            //toppager: true,

            multiselect: true,
            //multikey: "ctrlKey",
            multiboxonly: true,

            editurl: "/admin/${bizSys}/commonsave/${mainObj}",//nothing is saved
        <#--delurl: "/admin/commondel/${mainObj}",//nothing is saved-->
        <#--addurl: "/admin/commonadd/${mainObj}",//nothing is saved-->
            caption: "${title}"

            //,autowidth: true,title


            /**
             ,
             grouping:true,
             groupingView : {
						 groupField : ['name'],
						 groupDataSorted : true,
						 plusicon : 'fa fa-chevron-down bigger-110',
						 minusicon : 'fa fa-chevron-up bigger-110'
					},
             caption: "Grouping"
             */

        });
//    } else {
//        initGrid();
//    }
        $(window).triggerHandler('resize.jqGrid');//trigger window resize to make the grid get the correct size



        //enable search/filter toolbar
        //jQuery(grid_selector).jqGrid('filterToolbar',{defaultSearch:true,stringResult:true})
        //jQuery(grid_selector).filterToolbar({});


        //switch element when editing inline
        function aceSwitch( cellvalue, options, cell ) {
            setTimeout(function(){
                $(cell) .find('input[type=checkbox]')
                        .addClass('ace ace-switch ace-switch-5')
                        .after('<span class="lbl"></span>');
            }, 0);
        }
        //enable datepicker
        function pickDate( cellvalue, options, cell ) {
            setTimeout(function(){
                $(cell) .find('input[type=text]')
                        .datepicker({format:'yyyy-mm-dd' , autoclose:true});
            }, 0);
        }

        $(".ui-jqgrid-titlebar").hide();
        //navButtons
            jQuery(grid_selector).jqGrid('navGrid',pager_selector,
                    { 	//navbar options
                        edit: ${actions?seq_contains("edit")?string("true", "false")}, //决定是否显示true
                        editicon : 'ace-icon fa fa-pencil blue',
                        add: ${actions?seq_contains("add")?string("true", "false")},
                        addicon : 'ace-icon fa fa-plus-circle purple',
                        del: ${actions?seq_contains("del")?string("true", "false")},
                        delicon : 'ace-icon fa fa-trash-o red',
                        search: true,
                        searchicon : 'ace-icon fa fa-search orange',
                        refresh: true,
                        refreshicon : 'ace-icon fa fa-refresh green',
                        view: true,
                        viewicon : 'ace-icon fa fa-search-plus grey'
                    },
                    {
                        //edit record form
                        closeAfterEdit: true,
                        width: 700,
                        recreateForm: true,
                        beforeShowForm : function(e) {
                            var form = $(e[0]);
                            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
                            style_edit_form(form);
                            if(isExitsFunction("enhanceBeforeShowForm")) { //如果有定义，执行之增强
                                enhanceBeforeShowForm(form);
                            }
                        },
                        onclickSubmit:function(params, postdata){
                            if(isExitsFunction("enhancePostData")) { //如果有定义，执行之增强
                                postdata = enhancePostData(params, postdata);
                            }
                            return postdata;
                        },
                        afterSubmit:function(response,postdata){
                            var rst = response.responseText;
                            if(null!=rst&&rst!=undefined&&rst!=''){
                                var result = response.responseJSON;
                                if(result.rtnCode!="0000000"){
                                    return [false,result.msg];
                                }
                            }else{
                                return [false,'服务器内部错误!'];
                            }
                            return [true,''] ;
                        }
                    },
                    {
                        //new record form
                        width: 700,
                        closeAfterAdd: true,
                        recreateForm: true,
                        viewPagerButtons: false,
                        beforeShowForm : function(e) {
                            var form = $(e[0]);
                            //console.log(form);
                            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
                                    .wrapInner('<div class="widget-header" />')
                            style_edit_form(form);
                            if(isExitsFunction("newBeforeShowForm")) { //如果有定义，执行之增强
                                newBeforeShowForm(form);
                            }
                        },
                        onclickSubmit:function(params, postdata){
                            if(isExitsFunction("enhancePostData")) { //如果有定义，执行之增强
                                postdata = enhancePostData(params, postdata);
                            }
                            return postdata;
                        },
                        afterSubmit:function(response,postdata){
                            var rst = response.responseText;
                            if(null!=rst&&rst!=undefined&&rst!=''){
                                var result = response.responseJSON;
                                if(result.rtnCode!="0000000"){
                                    return [false,result.msg];
                                }
                            }else{
                                return [false,'服务器内部错误!'];
                            }
                            return [true,''] ;
                        }
                    },
                    {
                        //delete record form
                        recreateForm: true,
                    <#--url:"/admin/commondel/${mainObj}",-->
                        beforeShowForm : function(e) {
                            var form = $(e[0]);
                            //console.log(form);
                            if(form.data('styled')) return false;

                            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
                            style_delete_form(form);

                            form.data('styled', true);
                        },
                        onClick : function(e) {
                            alert(1);
                        },
                        afterSubmit:function(response,postdata){
                            var rst = response.responseText;
                            if(null!=rst&&rst!=undefined&&rst!=''){
                                var result = response.responseJSON;
                                if(result.rtnCode!="0000000"){
                                    return [false,result.msg];
                                }
                            }else{
                                return [false,'服务器内部错误!'];
                            }
                            return [true,''] ;
                        }
                    },
                    {
                        //search form
                        recreateForm: true,
                        afterShowSearch: function(e){
                            var form = $(e[0]);
                            form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
                            style_search_form(form);
                        },
                        afterRedraw: function(){
                            style_search_filters($(this));
                        }
                        ,
                        multipleSearch: true,
                        /**
                         multipleGroup:true,
                         showQuery: true
                         */
                    },
                    {
                        //view record form
                        recreateForm: true,
                        beforeShowForm: function(e){
                            var form = $(e[0]);
                            form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
                        }
                    }
                    ,
                    {
                        //import record form
                        recreateForm: true,
                        beforeShowForm: function(e){
                            var form = $(e[0]);
                            form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
                        }
                    }
            )

    <#if actions?seq_contains("import")>
            .navButtonAdd(pager_selector,{
                id:"import-action",
                title:"Import Records",
                caption:"",
                buttonicon:"ace-icon fa fa-search-plus grey",
                onClickButton: function(){
                    alert("Deleting Row");
                },
                position:"last"
            })
    </#if>

    <#if actions?seq_contains("export")>
            .navButtonAdd(pager_selector,{
                id:"export-action",
                title:"Export template",
                caption:"",
                buttonicon:"ace-icon fa fa-search-plus grey",
                onClickButton: function(){
                    alert("Deleting Row");
                },
                position:"last"
            })
    </#if>

    <#if actions?seq_contains("resource_assign")>
            .navButtonAdd(pager_selector, {
                id: "add-resource-action",
                title: "分配资源",
                caption: "",
                buttonicon: "ace-icon fa fa-pencil blue",
                onClickButton: function () {
                    if (!currentGridId) {
                        alert("请选择一行！");
                        return;
                    }

                    var resourceUrl2 = "/admin/${bizSys}/${mainObj}/getAllResources?roleId=" + currentGridId;
                    $.get(resourceUrl2, {}, function (result) {
                        var setting = {
                            check: {
                                enable: true
                            },
                            data: {
                                simpleData: {
                                    enable: true
                                },
                                key: {
                                    name: "resourceName",
                                    children: "resourceInfos"
                                }

                            }
                        };
                        if("0000000" != result.rtnCode){
                            alert("远程访问数据失败!");
                            return ;
                        }
                        result = result.bizData;
                        var zNodes = result;

                        for (var i = 0; i < result.length; i++) {
                            var obj = result[i];
                            if (obj.resourceInfos) {
                                result[i].open = true;
                            }

                            var chidrens = obj.resourceInfos;
                            for (var m = 0; m < chidrens.length; m++) {
                                var third = chidrens[m].resourceInfos;
                                for (var n = 0; n < third.length; n++) {
                                    if (third[n].roleId > 0) {
                                        third[n].checked = true;
                                        chidrens[m].checked = true;
                                        result[i].checked = true
                                    }
                                }


                            }

                        }
                        var code;

                        function setCheck() {
                            var zTree = $.fn.zTree.getZTreeObj("tree1"),
                                    py = $("#py").attr("checked") ? "p" : "",
                                    sy = $("#sy").attr("checked") ? "s" : "",
                                    pn = $("#pn").attr("checked") ? "p" : "",
                                    sn = $("#sn").attr("checked") ? "s" : "",
                                    type = { "Y": py + sy, "N": pn + sn};
                            zTree.setting.check.chkboxType = type;
                            showCode('setting.check.chkboxType = { "Y" : "' + type.Y + '", "N" : "' + type.N + '" };');
                            var checked = zTree.getNodes()[0].checked;
                            alert(checked)
                        }

                        function showCode(str) {
                            if (!code) code = $("#code");
                            code.empty();
                            code.append("<li>" + str + "</li>");
                        }


                        var treeObj = $.fn.zTree.init($("#tree1"), setting, zNodes);
                        $("#sn").bind("change", setCheck);


                        $("#treeFixed-01").find("#sData").click(function () {
                            var array = [];

                            var nodes = treeObj.getCheckedNodes(true);
                            for (var i = 0; i < nodes.length; i++) {
                                var pid = nodes[i].parentResourceId;
                                var resourceId = nodes[i].resourceId;
                                var obj = {
                                    "parentResourceId": pid,
                                    "resourceId": resourceId
                                }

                                array.push(obj);

                            }
                            var resource_submit_url = "/admin/${bizSys}/${mainObj}/assign";
                            $.post(resource_submit_url, {
                                        objId: currentGridId,
                                        resources: JSON.stringify(array)
                                    }, function (result) {
                                        alert(result)
                                        $("#treeFixed-01").hide();
                                    }
                            );

                        });
                        $("#treeFixed-01").show();

                    });


                },
                position: "last"
            })
    </#if>

        function style_edit_form(form) {
            //enable datepicker on "sdate" field and switches for "stock" field
            form.find('input[name=sdate]').datepicker({format:'yyyy-mm-dd' , autoclose:true})
                    .end().find('input[name=stock]')
                    .addClass('ace ace-switch ace-switch-5').after('<span class="lbl"></span>');
            //don't wrap inside a label element, the checkbox value won't be submitted (POST'ed)
            //.addClass('ace ace-switch ace-switch-5').wrap('<label class="inline" />').after('<span class="lbl"></span>');

            //update buttons classes
            var buttons = form.next().find('.EditButton .fm-button');
            buttons.addClass('btn btn-sm').find('[class*="-icon"]').hide();//ui-icon, s-icon
            buttons.eq(0).addClass('btn-primary').prepend('<i class="ace-icon fa fa-check"></i>');
            buttons.eq(1).prepend('<i class="ace-icon fa fa-times"></i>')

            buttons = form.next().find('.navButton a');
            buttons.find('.ui-icon').hide();
            buttons.eq(0).append('<i class="ace-icon fa fa-chevron-left"></i>');
            buttons.eq(1).append('<i class="ace-icon fa fa-chevron-right"></i>');
        }

        function style_delete_form(form) {
            var buttons = form.next().find('.EditButton .fm-button');
            buttons.addClass('btn btn-sm btn-white btn-round').find('[class*="-icon"]').hide();//ui-icon, s-icon
            buttons.eq(0).addClass('btn-danger').prepend('<i class="ace-icon fa fa-trash-o"></i>');
            buttons.eq(1).addClass('btn-default').prepend('<i class="ace-icon fa fa-times"></i>')
        }

        function style_search_filters(form) {
            form.find('.delete-rule').val('X');
            form.find('.add-rule').addClass('btn btn-xs btn-primary');
            form.find('.add-group').addClass('btn btn-xs btn-success');
            form.find('.delete-group').addClass('btn btn-xs btn-danger');
        }
        function style_search_form(form) {
            var dialog = form.closest('.ui-jqdialog');
            var buttons = dialog.find('.EditTable')
            buttons.find('.EditButton a[id*="_reset"]').addClass('btn btn-sm btn-info').find('.ui-icon').attr('class', 'ace-icon fa fa-retweet');
            buttons.find('.EditButton a[id*="_query"]').addClass('btn btn-sm btn-inverse').find('.ui-icon').attr('class', 'ace-icon fa fa-comment-o');
            buttons.find('.EditButton a[id*="_search"]').addClass('btn btn-sm btn-purple').find('.ui-icon').attr('class', 'ace-icon fa fa-search');
        }

        function beforeDeleteCallback(e) {
            var form = $(e[0]);
            if(form.data('styled')) return false;

            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
            style_delete_form(form);

            form.data('styled', true);
        }

        function beforeEditCallback(e) {
            var form = $(e[0]);
            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
            style_edit_form(form);
        }



        //it causes some flicker when reloading or navigating grid
        //it may be possible to have some custom formatter to do this as the grid is being created to prevent this
        //or go back to default browser checkbox styles for the grid
        function styleCheckbox(table) {
            /**
             $(table).find('input:checkbox').addClass('ace')
             .wrap('<label />')
             .after('<span class="lbl align-top" />')


             $('.ui-jqgrid-labels th[id*="_cb"]:first-child')
             .find('input.cbox[type=checkbox]').addClass('ace')
             .wrap('<label />').after('<span class="lbl align-top" />');
             */
        }


        //unlike navButtons icons, action icons in rows seem to be hard-coded
        //you can change them like this in here if you want
        function updateActionIcons(table) {
            /**
             var replacement =
             {
                 'ui-ace-icon fa fa-pencil' : 'ace-icon fa fa-pencil blue',
                 'ui-ace-icon fa fa-trash-o' : 'ace-icon fa fa-trash-o red',
                 'ui-icon-disk' : 'ace-icon fa fa-check green',
                 'ui-icon-cancel' : 'ace-icon fa fa-times red'
             };
             $(table).find('.ui-pg-div span.ui-icon').each(function(){
						var icon = $(this);
						var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
						if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
					})
             */
        }

        //replace icons with FontAwesome icons like above
        function updatePagerIcons(table) {
            var replacement =
            {
                'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
                'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
                'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
                'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
            };
            $('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
                var icon = $(this);
                var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

                if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
            })
        }

        function enableTooltips(table) {
            $('.navtable .ui-pg-button').tooltip({container:'body'});
            $(table).find('.ui-pg-div').tooltip({container:'body'});
        }

        //var selr = jQuery(grid_selector).jqGrid('getGridParam','selrow');


    });
</script>

<link rel="stylesheet" href="${path}/assets/css/ace.onpage-help.css" />
<link rel="stylesheet" href="${path}/docs/assets/js/themes/sunburst.css" />

<script type="text/javascript"> ace.vars['base'] = '..'; </script>
<script src="${path}/assets/js/ace/ace.onpage-help.js"></script>
<script src="${path}/docs/assets/js/rainbow.js"></script>
<script src="${path}/docs/assets/js/language/generic.js"></script>
<script src="${path}/docs/assets/js/language/html.js"></script>
<script src="${path}/docs/assets/js/language/css.js"></script>
<script src="${path}/docs/assets/js/language/javascript.js"></script>
<!-- biz js引入 -->
<script src="${path}/assets/js/biz/biz-common.js"></script>
<#--<script src="${path}/assets/js/biz/jpgrid-common.js"></script>-->
<script src="${path}/assets/js/biz/module/formatter.js"></script>