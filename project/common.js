/**
 * Created by Administrator on 2016/12/5/005.
 */
/**
 * 获取当前
 */
function getCurYear(){
    var now = new Date().getYear();
    now += (now<2000)?1900:0;
    return now
}

/**
 * 获取当前月
 */
function getCurMonth(){
    return  new Date().getMonth()+1
}

/**
 * 获取当前日
 */
function getCurDay(){
    return new Date().getDay();
}

/**
 * 获取当前年-月-日
 */
function getCurFullDay() {
    return getCurYear()+"-"+getCurMonth()+"-"+getCurDay()
}

/**
 * 调用公共方法解决跨域
 */
function excu(url, callback) {
    var sessionid = getsessionid();
    if (sessionid!==null&&url.indexOf("session_id")<0){
        if(url.indexOf("?")>=0){
            url=url+"&session_id="+getsessionid();
        }else{
            url=url+"?session_id="+getsessionid();
        }
    }
    $.ajax({
        async:false,
        url:url,
        type:"get",
        dataType:"jsonp",//注意解决跨域只能写该类型
        jsonp:"pCallback",
        timeout:50000,//ms
        beforeSend:function(){
            
        },
        success:function (json) {
            if(json.hasOwnProperty("IdentityAuthentication")&&json.IdentityAuthentication=="fail"){
                alert("登陆信息已经失效，请重新登陆")
                return false;
            }
            callback(json);
        },
        complete:function (xhr, status) {

        },
        error:function (xhr, status) {
            var loginUrl = getParam("loginUrl");//只有微信用户有这个
            var loginAction=getParam("loginAction");
            clearParam("loginUrl");
            clearParam("loginAction");
            Alert("平台访问出错，请稍后尝试或联系管理员!");
        }
    })
}

/**
 * 设置查询条件，通常用于页面之间参数的传递
 * @param {Object} key
 * @param {Object} val
 */
function setParam(key, val) {
    if(window.localStorage){
        window.localStorage.setItem(key,val);
    }
}

/**
 * 通过key获取查询条件,通常用于页面间参数的传递
 * @param {Object} key
 */
function getParam(key){
    var val = null;
    if(window.localStorage){
        val = window.localStorage.getItem(key);
    }
    return val;
}
