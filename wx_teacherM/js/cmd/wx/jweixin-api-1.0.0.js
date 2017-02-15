/**
 * author:yonson
 * data:2015-08-07
 */
define(function(require, exports, module) {
	
	var qt_model={};
	var $ = require("jquery");
	var sign = require('sign');
	var wx = require("wx");
	var common = require('common');
	
	var jsApiList = ['previewImage'];
	var httpUrl = window.location.href;
	
qt_model.wxConfig = function (cropId,jsApiList,httpUrl,func){
		
		$.post(common.produsUrl+"/info/getJsTicket",
				{
					cropId:cropId
				},
				function(result){
					if(result.resultCode == '001'){  //请求成功
						var configObj = sign(result.ticket,httpUrl);
						wx.config(
							{
								debug: false,
							    appId: cropId,
							    timestamp: configObj.timestamp,
							    nonceStr: configObj.nonceStr,
							    signature: configObj.signature,
							    jsApiList: jsApiList	
							}
						);
						
						wx.ready(function () {
							qt_model.checkJsApi(jsApiList);
							if(func){
								func();
							}
						});
						wx.error(function(res){
							
						});
					}
				}
		);
		
	}
	
	/////////////////////////js-基础接口////////////////////////////
	/**
	 * 判断当前版本是否支持指定 JS 接口，支持批量判断
	 */
	qt_model.checkJsApi = function (p_js_apiList) {
	  wx.checkJsApi({
	    jsApiList: p_js_apiList,
	    success: function (res) {
	      //alert(JSON.stringify(res));
	    }
	  });
	}
	/////////////////////////js-基础接口////////////////////////////
	
	////////////////////////js-图片接口////////////////////////////
	qt_model.images = {
	  localId: [],
	  serverId: []
	};
	
	/**
	 * 选择图片
	 */
	qt_model.chooseImage = function (num,func) {
	  wx.chooseImage({
		count: num,
	    success: function (res) {
	      qt_model.images.localId = qt_model.images.localId.concat(res.localIds);
	      for(var i=0;i<res.localIds.length;i++){
	    	  func(res.localIds[i]);
	      }
	    }
	  });
	};
	
	/**
	 * 图片预览
	 * @param p_current:当前显示图片
	 * @param p_urls:预览图片列表
	 */
	qt_model.previewImage = function (p_current,p_urls) {
	  wx.previewImage({
	    current: p_current,
	    urls: p_urls
	  });
	};
	
	/**
	 * 上传图片
	 * @returns {Array}
	 */
	qt_model.uploadImage = function (postWords) {
	  if (qt_model.images.localId.length == 0) {
	    alert('请先选择你要上传的图片');
	    return;
	  }
	  var i = 0, length = qt_model.images.localId.length;
	  qt_model.images.serverId = [];
	  function upload() {
	    wx.uploadImage({
	      localId: qt_model.images.localId[i],
	      success: function (res) {
	        i++;
	        qt_model.images.serverId.push(res.serverId);
	        if (i < length) {
	          upload();
	        }else{
	        	postWords(qt_model.images.serverId)
	        }
	      },
	      fail: function (res) {
	        //alert(JSON.stringify(res));
	    	  alert("图片上传失败");
	      }
	    });
	  }
	  upload();
	};
	
	/**
	 * 下载图片
	 * @returns {Array}
	 */
	qt_model.downloadImage = function () {
	  if (qt_model.images.serverId.length === 0) {
	    alert('请先上传图片');
	    return;
	  }
	  var i = 0, length = qt_model.images.serverId.length;
	  qt_model.images.localId = [];
	  function download() {
	    wx.downloadImage({
	      serverId: qt_model.images.serverId[i],
	      success: function (res) {
	        i++;
	        qt_model.images.localId.push(res.localId);
	        if (i < length) {
	          download();
	        }
	      }
	    });
	  }
	  download();
	  return qt_model.images.localId;
	};
	
	////////////////////////js-图片接口////////////////////////////
	
	
	////////////////////////js-分享接口(分享接口只作注册使用)////////////////////////////
	//监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
	qt_model.onMenuShareAppMessage = function (pTitle,pDesc,pLink,pImgUrl,callBackFun) {
		wx.onMenuShareAppMessage({
	      title: pTitle,
	      desc: pDesc,
	      link: pLink,
	      imgUrl: pImgUrl,
	      trigger: function (res) {
	    	  
	      },
	      success: function (res) {
	        callBackFun(res);
	      },
	      cancel: function (res) {
	    	  
	      },
	      fail: function (res) {
	        //alert(JSON.stringify(res));
	      }
	    });
	};
	
	//监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
	qt_model.onMenuShareTimeline = function (pTitle,pLink,pImgUrl,callBackFun) {
	  wx.onMenuShareTimeline({
	    title: pTitle,
	    link: pLink,
	    imgUrl: pImgUrl,
	    trigger: function (res) {
	      // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
	    	
	    },
	    success: function (res) {
	      callBackFun(res);
	    },
	    cancel: function (res) {
	    	
	    },
	    fail: function (res) {
	      //alert(JSON.stringify(res));
	    }
	  });
	};
	
	//监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
	qt_model.onMenuShareQQ = function(pTitle,pDesc,pLink,pImgUrl,callBackFun) {
	  wx.onMenuShareQQ({
	    title: pTitle,
	    desc: pDesc,
	    link: pLink,
	    imgUrl: pImgUrl,
	    trigger: function (res) {
	    	
	    },
	    complete: function (res) {
	    	
	    },
	    success: function (res) {
	    	callBackFun(res);
	    },
	    cancel: function (res) {
	    	
	    },
	    fail: function (res) {
	      //alert(JSON.stringify(res));
	    }
	  });
	};
	
	//监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
	qt_model.onMenuShareWeibo = function (pTitle,pDesc,pLink,pImgUrl,callBackFun) {
	  wx.onMenuShareWeibo({
	    title: pTitle,
	    desc: pDesc,
	    link: pLink,
	    imgUrl: pImgUrl,
	    trigger: function (res) {
	    	
	    },
	    complete: function (res) {
	      //alert(JSON.stringify(res));
	    },
	    success: function (res) {
	      callBackFun(res);
	    },
	    cancel: function (res) {
	    	
	    },
	    fail: function (res) {
	      //alert(JSON.stringify(res));
	    }
	  });
	};
	
	//监听“分享到QZone”按钮点击、自定义分享内容及分享接口
	qt_model.onMenuShareQZone = function(pTitle,pDesc,pLink,pImgUrl,callBackFun) {
	  wx.onMenuShareQZone({
	    title: pTitle,
	    desc: pDesc,
	    link: pLink,
	    imgUrl: pImgUrl,
	    trigger: function (res) {
	    	
	    },
	    complete: function (res) {
	      //alert(JSON.stringify(res));
	    },
	    success: function (res) {
	      callBackFun(res);
	    },
	    cancel: function (res) {
	    	
	    },
	    fail: function (res) {
	      //alert(JSON.stringify(res));
	    }
	  });
	};
	////////////////////////js-分享接口////////////////////////////
	
	////////////////////////js-界面接口////////////////////////////
	qt_model.hideAllNonBaseMenuItem = function (){
		wx.hideAllNonBaseMenuItem();
	}
	////////////////////////js-界面接口////////////////////////////

	//声明模块提供的接口，如：当前模块提供sayHello和formateDate两个接口
	module.exports = qt_model;

});
