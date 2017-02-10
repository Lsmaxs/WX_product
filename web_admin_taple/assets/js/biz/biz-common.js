    //用于列表页面id列显示别名  这里存在一个约定规则，例如：expertId会去找expertIdName列内容
    function labelFormatter(cellvalue, options, rowObject){
        //debugger;
        var labelKey = options.colModel.name;
        var labelName = labelKey + "Name";
        var labelVal = rowObject[labelName];
        if(labelVal !== undefined){
            return labelVal;
        } else {
            return "";
        }
    }

    function showLinkEditModel(cellvalue, options, rowObject) {
        if (cellvalue !== undefined) {
            return "<a href='javascript:void(0)' onclick='showEditModel(" + rowObject["id"] + ",\"" + options.colModel.name + "\",\"" + cellvalue + "\")'>" + cellvalue + "</a>";
        } else {
            var addAnswer = "添加答案";
            return "<a href='javascript:void(0)' onclick='showEditModel(" + rowObject["id"] + ",\"" + options.colModel.name + "\",\"" + addAnswer + "\")'>" + addAnswer + "</a>";
        }
    }

    function showEditModel(editId, editCtlId, editVal){
        $('#editId').val(editId);
        $("textarea[id='" + editCtlId + "']").val(editVal);
        $('#edit_modal').modal('show');
    }

    /**
     * 同步获取 jqgrid编辑页面 select 组件值
     * @param ajaxUrl 请求地址
     * @param isAddBlank 是否添加空项 true 添加 false 不添加
     * @returns {string}
     * @author yhwang
     */
    function dynGetData(ajaxUrl,isAddBlank){
        if(isAddBlank  === true){
            var returnStr = "0"+":"+"请选择"+";";
        }else{
            var returnStr = "";
        }
        $.ajaxSettings.async = false;
        $.getJSON(ajaxUrl, function(result){
            //debugger;
            if("0000000" == result.rtnCode){
                for(i = 0; i < result.bizData.rows.length; i++){
                    if(i < result.bizData.rows.length - 1) {
                        returnStr += result.bizData.rows[i].id + ":" + result.bizData.rows[i].name + ";";
                    } else {
                        returnStr += result.bizData.rows[i].id + ":" + result.bizData.rows[i].name;
                    }
                }

            } else {
                alert("request error");
            }

        });
        $.ajaxSettings.async = true;
        return returnStr;
    }
    //对一个字段多个属性值组合的列进行显示
    function multiValsShow(cellvalue, options, rowObject){
        if(cellvalue == null || cellvalue=='' ||cellvalue ==0){
            return "";
        }
        if(tempVals == undefined){
            dynGetData2Map(options.colModel.formatoptions.ajaxUrl);
        }

        var returnStr = "";
        var vals = cellvalue.split(',');
        for(i = 0; i < vals.length; i++){
            if(i < vals.length - 1) {
                returnStr += tempVals[vals[i]] + ",";
            } else {
                returnStr += tempVals[vals[i]];
            }
        }

        return returnStr;
    }

    var tempVals;
    function dynGetData2Map(ajaxUrl){
        tempVals = new Object();
        $.ajaxSettings.async = false;
        $.getJSON(ajaxUrl, function(result){
            //debugger;
            if("0000000" == result.rtnCode){
                for(i = 0; i < result.bizData.rows.length; i++){
                    tempVals[result.bizData.rows[i].id] = result.bizData.rows[i].name;
                }

            } else {
                alert("request error");
            }

        });
        $.ajaxSettings.async = true;
    }



    //multi checkbox 编辑控件渲染
    function MultiCheckElem( value, options )
    {
        //———-
        // for each checkbox in the list
        //   build the input element
        //   set the initial "checked" status
        // endfor
        //———-
        value = value + ",";
        var ctl = '';
        var ckboxAry = options.list.split(';');

        for ( var i in ckboxAry )
        {
            var item = ckboxAry[i].split(':');

            ctl += '<input type="checkbox" ';

            if ( value.indexOf(item[1] + ',') != -1 )
                ctl += 'checked="checked" ';
            ctl += 'value="' + item[0] + '"> ' + item[1] + '</input><br />&nbsp;';
        }

        //ctl = ctl.replace( /<br />&nbsp;$/, '' );
        return ctl;
    }

