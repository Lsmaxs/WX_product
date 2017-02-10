jQuery(function($) {
    var grid_selector = "#grid-table";
    var pager_selector = "#grid-pager";

    function buildRules() {
        var userName = $('#userName').val();
        var userType = $('#userType').val();
        var phone = $('#phone').val();
        var areaId = $('#areaId').val();
        var status = $('#status').val();

        var rules = [];
        if (userName != '') {
            var rule3 = {
                'field': 'userName',
                'op': 'eq',
                'data': userName
            }
            rules.push(rule3);
        }
        if (userType != '') {
            var rule5 = {
                'field': 'userType',
                'op': 'ge',
                'data': userType
            }
            rules.push(rule5);
        }
        if (phone != '') {
            var rule6 = {
                'field': 'phone',
                'op': 'le',
                'data': phone
            }
            rules.push(rule6);
        }
        if (areaId != '') {
            var rule7 = {
                'field': 'areaId',
                'op': 'eq',
                'data': areaId
            }
            rules.push(rule7);
        }
        if (status != '') {
            var rule8 = {
                'field': 'status',
                'op': 'eq',
                'data': status
            }
            rules.push(rule8);
        }
        return rules;
    }

    $("#search").click(function () {
        //debugger;
        var url = "/admin/${bizSys}/${mainObj}s";

        var rules = buildRules();

        var filters = {
            'groupOp': 'AND',
            "rules": rules
        };

        var search_url = url + "?filters=" + JSON.stringify(filters);

        $("#grid-table").jqGrid('setGridParam', {url: search_url, page: 1}).trigger("reloadGrid");
    });

    $("#export").click(function () {
        //debugger;
        var url = "/admin/${bizSys}/export/${mainObj}";

        var rules = buildRules();

        var filters = {
            'groupOp': 'AND',
            "rules": rules
        };

        var search_url = url + "?filters=" + JSON.stringify(filters);
        var form = $("<form>");   //定义一个form表单
        form.attr('style', 'display:none');   //在form表单中添加查询参数
        form.attr('target', '');
        form.attr('method', 'post');
        form.attr('action', "/admin/${bizSys}/export/${mainObj}");
        var input = $("<input>");
        input.attr("name", "filters");
        input.val(JSON.stringify(filters));
        var fileName = $("<input>");
        input.attr("name", "fileName");
        input.val("专家信息");
        form.append(input);
        form.append(fileName);
        //将表单放置在web中
        $('body').append(form);
        form.submit();
        form.remove();
    });

    $("#addAccount").click(function () {
        $(".ui-jqgrid .ui-jqgrid-pager .ui-pg-button")[0].click();

        //$(grid_selector).jqGrid('add',"new");
    });

    $("#changePwd").click(function () {
        //$(grid_selector).jqGrid().trigger("edit");
        var rowData = jQuery(grid_selector).jqGrid('getGridParam', 'selarrrow');
        if (rowData === '' || rowData === null || rowData === undefined || rowData.length <= 0 || rowData.length > 1) {
            alert("请选择一行");
            return false;
        }
        $('#edit_password_modal').find('form')[0].reset();
        $('#edit_password_modal').modal('show');
    });

    $("#assign_submit").click(function () {
        var rowId = $(grid_selector).jqGrid('getGridParam', 'selrow');
        var rowData = $(grid_selector).jqGrid('getRowData', rowId);
        var userId = rowData.userId;
        var form = $(this).parent().parent().find("form");
        var jsonData = form.serializeArray();
        var userIdJson = {"name": "id", "value": userId};
        jsonData.push(userIdJson);
        $.ajax({
            url: "/admin/op/ex/expertuser/updatePassword",
            data: jsonData,
            dataType: "json",
            type: "post",
            success: function (data) {
                if (data.rtnCode === "0000000") {
                    $('#edit_password_modal').modal('hide');
                } else {
                    alert(data.msg);
                }
            }
        });
    });

    function enhancePostData(params, postdata) {
        var elems = $("#FrmGrid_grid-table input#tags");
        var tags = "";
        for (var i in elems) {
            if (elems[i].checked) {
                tags += elems[i].value + ",";
            }
        }
        if (tags.length > 0) {
            tags = tags.substr(0, tags.length - 1);
        }
        postdata.tags = tags;

        return postdata;
    }
});
