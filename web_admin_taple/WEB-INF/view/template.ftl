<!DOCTYPE html>
<html lang="en">
<head>
<#include "head.html">
</head>

<body class="no-skin">
<!-- #section:basics/navbar.layout -->
    <#include "nav_bar.ftl">
<!-- /section:basics/navbar.layout -->
<div class="main-container" id="main-container">
<script type="text/javascript">
    try{ace.settings.check('main-container' , 'fixed')}catch(e){}
</script>

<!-- #section:basics/sidebar -->
    <#include "sidebar.ftl">

<!-- /section:basics/sidebar -->
<div class="main-content">
    <!-- #section:basics/content.breadcrumbs -->
    <#include "breadcrumbs.ftl">

    <!-- /section:basics/content.breadcrumbs -->
    <div class="page-content">
        <#include "page_grid.ftl">
    </div><!-- /.page-content -->
</div><!-- /.main-content -->

    <#include "footer.html">

<a href="#" id="btn-scroll-up" class="btn-scroll-up btn btn-sm btn-inverse">
    <i class="ace-icon fa fa-angle-double-up icon-only bigger-110"></i>
</a>
</div><!-- /.main-container -->
    <#include "biz_script.ftl">
</body>
</html>
