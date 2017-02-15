seajs.config({
	alias: {
		'jquery' : 'jquery/jquery/2.1.4/jquery',
		'zepto' : 'jquery/jquery/2.1.4/jquery',
		'jquery/popup' : 'jquery/popup/1.0.0/popup',
		'qt/cookie' : 'qt/cookie/1.0.0/cookie', // cookie操作 
		'qt/util' : 'qt/util/1.0.0/util', // 工具模块
		'qt/md5' : 'qt/md5/1.0.0/md5', // MD5
		'qt/sha' : 'qt/sha/2.0.1/sha', // SHA
		'm/iscroll' : 'm/iscroll/5.1.3/iscroll',//iscroll触摸滚动
		'm/swipe' : 'm/swipe/2.0.0/swipe',//swipe触摸转场
		'm/ui' : 'm/ui/1.0.0/ui', // ui库
		'm/wx' : 'm/wx/1.0.0/wx' //微信api支持库
	},
	charset: 'utf-8',
	timeout: 20000
});