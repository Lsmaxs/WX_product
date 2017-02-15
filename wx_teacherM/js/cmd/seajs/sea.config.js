seajs.config({
	alias: {
		'jquery' : 'jquery/jquery/1.11.3/jquery',
		'qt/cookie' : 'qt/cookie/1.0.0/cookie', 
		'wx' : 'wx/jweixin-1.0.0${wx_min}.js?v=${wx_version}',
		'jssha' : 'wx/sign/sha',
		'sign' : 'wx/sign/sign',
		'zepto' : 'zepto/zepto.min.js',
		'common' : 'common-1.0.0${wx_min}.js?v=${wx_version}',
		'widget/tip' : 'qt/widget/tip-1.0.0${wx_min}.js?v=${wx_version}',
		'widget/progress' : 'qt/widget/progress-1.0.0${wx_min}.js?v=${wx_version}',
		'widget/toast' : 'qt/widget/toast-1.0.0${wx_min}.js?v=${wx_version}',
		'widget/iscroll' : 'qt/widget/iscroll-1.0.0${wx_min}.js?v=${wx_version}',
		'wxApi' : 'wx/jweixin-api-1.0.0${wx_min}.js?v=${wx_version}',
		'storage' : 'qt/storage/storage-1.0.0${wx_min}.js?v=${wx_version}',
		'base64' : 'qt/base64/base64.js?v=${wx_version}'
	},
	charset: 'utf-8',
	timeout: 20000
});