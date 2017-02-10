<!-- 页面主体内容 -->
<!-- #section:settings.box -->
<div class="ace-settings-container" id="ace-settings-container">
    <div class="btn btn-app btn-xs btn-warning ace-settings-btn" id="ace-settings-btn">
        <i class="ace-icon fa fa-cog bigger-150"></i>
    </div>

    <div class="ace-settings-box clearfix" id="ace-settings-box">
        <div class="pull-left width-50">
            <!-- #section:settings.skins -->
            <div class="ace-settings-item">
                <div class="pull-left">
                    <select id="skin-colorpicker" class="hide">
                        <option data-skin="no-skin" value="#438EB9">#438EB9</option>
                        <option data-skin="skin-1" value="#222A2D">#222A2D</option>
                        <option data-skin="skin-2" value="#C6487E">#C6487E</option>
                        <option data-skin="skin-3" value="#D0D0D0">#D0D0D0</option>
                    </select>
                </div>
                <span>&nbsp; Choose Skin</span>
            </div>

            <!-- /section:settings.skins -->

            <!-- #section:settings.navbar -->
            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-navbar" />
                <label class="lbl" for="ace-settings-navbar"> Fixed Navbar</label>
            </div>

            <!-- /section:settings.navbar -->

            <!-- #section:settings.sidebar -->
            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-sidebar" />
                <label class="lbl" for="ace-settings-sidebar"> Fixed Sidebar</label>
            </div>

            <!-- /section:settings.sidebar -->

            <!-- #section:settings.breadcrumbs -->
            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-breadcrumbs" />
                <label class="lbl" for="ace-settings-breadcrumbs"> Fixed Breadcrumbs</label>
            </div>

            <!-- /section:settings.breadcrumbs -->

            <!-- #section:settings.rtl -->
            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-rtl" />
                <label class="lbl" for="ace-settings-rtl"> Right To Left (rtl)</label>
            </div>

            <!-- /section:settings.rtl -->

            <!-- #section:settings.container -->
            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-add-container" />
                <label class="lbl" for="ace-settings-add-container">
                    Inside
                    <b>.container</b>
                </label>
            </div>

            <!-- /section:settings.container -->
        </div><!-- /.pull-left -->

        <div class="pull-left width-50">
            <!-- #section:basics/sidebar.options -->
            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-hover" />
                <label class="lbl" for="ace-settings-hover"> Submenu on Hover</label>
            </div>

            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-compact" />
                <label class="lbl" for="ace-settings-compact"> Compact Sidebar</label>
            </div>

            <div class="ace-settings-item">
                <input type="checkbox" class="ace ace-checkbox-2" id="ace-settings-highlight" />
                <label class="lbl" for="ace-settings-highlight"> Alt. Active Item</label>
            </div>

            <!-- /section:basics/sidebar.options -->
        </div><!-- /.pull-left -->
    </div><!-- /.ace-settings-box -->
</div><!-- /.ace-settings-container -->

<!-- /section:settings.box -->
<div class="page-header">
    <h1>
        jqGrid
        <small>
            <i class="ace-icon fa fa-angle-double-right"></i>
            Dynamic tables and grids using jqGrid plugin
        </small>
    </h1>
</div><!-- /.page-header -->


<div class="row">
    <div class="col-xs-12">
        <!-- PAGE CONTENT BEGINS -->

        <!--导入测试-->
        <div class="well well-sm" id="import-form">
            <button type="button" class="close line-height-0" data-dismiss="alert">
                <i class="ace-icon fa fa-times smaller-75"></i>
            </button>

            <form action="/admin/import/${mainObj}" method="post" enctype="multipart/form-data">
                选择文件:<input type="file" name="file">
                <input type="submit" value="提交">
            </form>

            <form action="/admin/export/${mainObj}" method="post">
                <table width="100%" border="0" cellpadding="0" cellspacing="0"
                       bgcolor="b5d6e6">
                    <tr>
                        <td width="10%" align="right">
                            <input type="submit" value="导出模板" />&nbsp;&nbsp;
                        </td>
                    </tr>
                </table>
            </form>
        </div>


        <table id="grid-table"></table>

        <div id="grid-pager"></div>

        <script type="text/javascript">
            var $path_base = "..";//this will be used for editurl parameter
        </script>

        <!-- PAGE CONTENT ENDS -->
    </div><!-- /.col -->
</div><!-- /.row -->