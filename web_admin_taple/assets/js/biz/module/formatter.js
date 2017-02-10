/**
 * 此文件主要是写展示页面中需要对某个字段进行数据格式化的js
 * 相应的，该js对应的是数据库中video_resource_grid表中的 formatter字段
 */
/**
 * 状态格式化
  * @param cellvalue
 * @param options
 * @param rowObject
 * @returns {string}
 */
function formatExpertState(cellvalue, options, rowObject){
        if("1" == cellvalue){
            return "显示";
        } else if("2" == cellvalue){
            return "隐藏";
        } else { //3
            return "冻结";
        }
    }
/**
 * 公司名称格式化
 * @param cellvalue
 * @param options
 * @param rowObject
 * @returns {string}
 */
    function formatExpertType(cellvalue, options, rowObject){
        if("2000" == cellvalue){
            return "习悦";
        } else if("2001" == cellvalue){
            return "全通";
        }
    }
    /**
     * 隐藏 undefined
     * @param cellvalue
     * @returns {*}
     * @author yhwang
     */
    function undefinedHide(cellvalue){
        if(cellvalue==undefined){
            return "";
        }else{
            return cellvalue;
        }
    }
    /**
     * 输入毫秒 输出 xx时xx分xx秒
     * @param cellvalue
     * @returns {string}
     * @author yhwang
     */
    function formatSeconds(cellvalue) {
        var theTime = parseInt(cellvalue);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if(theTime > 60) {
            theTime1 = parseInt(theTime/60);
            theTime = parseInt(theTime%60);
            if(theTime1 > 60) {
                theTime2 = parseInt(theTime1/60);
                theTime1 = parseInt(theTime1%60);
            }
        }
        var result = ""+parseInt(theTime)+"秒";
        if(theTime1 > 0) {
            result = ""+parseInt(theTime1)+"分"+result;
        }
        if(theTime2 > 0) {
            result = ""+parseInt(theTime2)+"小时"+result;
        }
        return result;
    }
    /**
     * 日期 long 显示为 yyyy-MM-dd hh:mm:ss
     * @param cellvalue
     * @returns {string}
     */
    function formatdate(cellvalue){
        if(cellvalue == null || cellvalue=='' ||cellvalue ==0){
            return "";
        }
        var date= new Date(cellvalue);
        var month = (date.getMonth()+1);
        var dates = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        if(month < 10){
            month = "0"+month;
        }
        if(dates < 10){
            dates = "0"+dates;
        }
        if(hour < 10){
            hour = "0"+hour;
        }
        if(minutes < 10){
            minutes = "0"+minutes;
        }
        if(seconds < 10){
            seconds = "0"+seconds;
        }


        return date.getFullYear()+"-"+month+"-"+dates+" "+hour+":"+minutes+":"+seconds;
    }