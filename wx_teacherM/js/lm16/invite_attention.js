/**
 * Created by Administrator on 2017/1/22/022.
 */
/**
 * 加入分享
 * yonson
 */
define(function(require, exports, module) {

    var qt_model={};

    var $ = require("jquery");
    var common = require('common');
    var tip = require('widget/tip');
    var storage = require('storage');
    var wxApi = require('wxApi');

    var SERVER_INDEX_URL = common.ctx + '/wap/html/joinex/join_index.html';
    var SERVER_CODE_GET_URL = common.ctx + '/info/getCorpWxqrcode';
    var SERVER_AT_LOG_URL = common.ctx + '/inner/joinex/shareLogger';
    var SERVER_ENTER_SH_URL = common.ctx + '/inner/joinex/enterShare';

    init();

    function init(){

        var schoolCode = common.getUrlParam("schoolCode");
        var schoolName = decodeURI(common.getUrlParam("schoolName"));
        var cropId = common.getUrlParam("cropId");
        var userId = common.getUrlParam("userId");
        var userType = common.getUrlParam("userType");
        $("#schoolCode").val(schoolCode);
        $("#schoolName").val(schoolName);
        $("#cropId").val(cropId);

        $("#schoolName").html(schoolName);
        logShare(schoolCode,cropId);
        genCropCodeHtml(cropId,schoolCode,schoolName,userType,userId);


    }

    //生成二维码信息
    function genCropCodeHtml(cropId,schoolCode,schoolName,userType,userId){

        var corpInfoStr = storage.getSessionStorage('corpInfo_'+cropId);
        var shareUrl = SERVER_INDEX_URL + '?schoolCode='+schoolCode+"&schoolName="+encodeURI(schoolName)+"&cropId="+cropId;
        if(!corpInfoStr){
            $.ajax({
                url: SERVER_CODE_GET_URL,
                data : {schoolCode:schoolCode},
                dataType :'jsonp',
                success : function(rtn){
                    $("#qrCode").attr("src",rtn.joinAddCodeLineUrl);
                    storage.setSessionStorage('corpInfo_'+cropId,JSON.stringify(rtn));
                    wxApi.wxConfig(cropId,['showAllNonBaseMenuItem','onMenuShareAppMessage','onMenuShareTimeline','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone'],window.location.href,function(){
                        wxApi.showAllNonBaseMenuItem();
                        wxApi.onMenuShareAppMessage('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,rtn.weixinImageUrl,function(){
                            if(userType == '1' && userId != ''){
                                ativityLogger(schoolCode,cropId,userId,userType);
                            }
                        });
                        wxApi.onMenuShareTimeline('诚邀您加入'+schoolName,shareUrl,rtn.weixinImageUrl,function(){
                            if(userType == '1' && userId != ''){
                                ativityLogger(schoolCode,cropId,userId,userType);
                            }
                        });
                        wxApi.onMenuShareQQ('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,rtn.weixinImageUrl,function(){
                            if(userType == '1' && userId != ''){
                                ativityLogger(schoolCode,cropId,userId,userType);
                            }
                        });
                        wxApi.onMenuShareWeibo('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,rtn.weixinImageUrl,function(){
                            if(userType == '1' && userId != ''){
                                ativityLogger(schoolCode,cropId,userId,userType)
                            }
                        });
                        wxApi.onMenuShareQZone('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,rtn.weixinImageUrl,function(){
                            if(userType == '1' && userId != ''){
                                ativityLogger(schoolCode,cropId,userId,userType)
                            }
                        });
                    });   //js-sdk验证
                }
            });
        }else{
            var corpInfo = JSON.parse(corpInfoStr);
            $("#qrCode").attr("src",corpInfo.joinAddCodeLineUrl);
            wxApi.wxConfig(cropId,['showAllNonBaseMenuItem','onMenuShareAppMessage','onMenuShareTimeline','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone'],window.location.href,function(){
                wxApi.showAllNonBaseMenuItem();
                wxApi.onMenuShareAppMessage('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,corpInfo.weixinImageUrl,function(){
                    if(userType == '1' && userId != ''){
                        ativityLogger(schoolCode,cropId,userId,userType);
                    }
                });
                wxApi.onMenuShareTimeline('诚邀您加入'+schoolName,shareUrl,corpInfo.weixinImageUrl,function(){
                    if(userType == '1' && userId != ''){
                        ativityLogger(schoolCode,cropId,userId,userType);
                    }
                });
                wxApi.onMenuShareQQ('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,corpInfo.weixinImageUrl,function(){
                    if(userType == '1' && userId != ''){
                        ativityLogger(schoolCode,cropId,userId,userType);
                    }
                });
                wxApi.onMenuShareWeibo('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,corpInfo.weixinImageUrl,function(){
                    if(userType == '1' && userId != ''){
                        ativityLogger(schoolCode,cropId,userId,userType);
                    }
                });
                wxApi.onMenuShareQZone('诚邀您加入'+schoolName,'随时随地关注学校动态，不再错过孩子在学校的每一个精彩瞬间',shareUrl,corpInfo.weixinImageUrl,function(){
                    if(userType == '1' && userId != ''){
                        ativityLogger(schoolCode,cropId,userId,userType);
                    }
                });
            });   //js-sdk验证
        }

    }

    //发送分享日志信息
    function ativityLogger(schoolCode,cropId,userId,userType){
        $.post(SERVER_AT_LOG_URL,
            {
                schoolCode:schoolCode,
                cropId:cropId,
                userId:userId,
                userType:userType
            },
            function(result){

            }
        );
    }

    //进入分享页面日志记录
    function logShare(schoolCode,cropId){
        $.post(SERVER_ENTER_SH_URL,
            {
                schoolCode:schoolCode,
                cropId:cropId
            },
            function(result){

            }
        );
    }



});
