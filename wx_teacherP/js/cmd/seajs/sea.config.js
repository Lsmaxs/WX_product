seajs.config({
	alias: {
		'jquery' : 'jquery/jquery/1.7.2/jquery',
		'jquery/popup' : 'jquery/popup/1.0.0/popup', //对jq的扩展，弹窗，关闭弹窗等
		'jquery/nicescroll' : 'jquery/nicescroll/3.6.0/nicescroll', //滚动条插件
		'jquery/json' : 'jquery/json/2.5.1/json', //json插件
		'qt/cookie' : 'qt/cookie/1.0.0/cookie', // cookie操作 
		'qt/util' : 'qt/util/1.0.0/util', // 工具模块
		'qt/ui' : 'qt/ui/1.0.0/ui' // 常用ui
	},
	charset: 'utf-8',
	timeout: 20000
});