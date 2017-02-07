seajs.config({
	alias: {
		'jquery' : 'jquery/jquery/1.11.3/jquery',
		'jquery/popup' : 'jquery/popup/1.0.0/popup', //对jq的扩展，弹窗，关闭弹窗等
		'jquery/nicescroll' : 'jquery/nicescroll/3.6.0/nicescroll', //滚动条插件
		'jquery/json' : 'jquery/json/2.5.1/json', //json插件
		'qt/cookie' : 'qt/cookie/1.0.0/cookie', // cookie操作 
		'qt/md5' : 'qt/md5/1.0.0/md5', // MD5
		'qt/sha' : 'qt/sha/2.0.1/sha', // SHA
		'qt/util' : 'qt/util/1.0.3/util', // 工具模块
		'qt/ui' : 'qt/ui/1.0.0/ui', // 常用ui
		'qt/valid' : 'qt/valid/1.0.0/valid' // 常用检验
	},
	charset: 'utf-8',
	timeout: 20000
});