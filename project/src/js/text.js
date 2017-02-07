;(function ($) {
    let lazyloadPlugin = function (ele, opt) {
        this.elements=ele? ele:$('.loading');
        this.defaults = {
            "bengiinHeight":0,
            'howToload':"fadeIn",
            "loadingBgClass":"loading",
            "whenToLoad":'allIn'
        };
        this.options = $.extend({},this.defaults,opt);


    };
    lazyloadPlugin.prototype = {
        constructor: lazyloadPlugin,
        bindLazy: function () {
            var bengiinHeight = this.options.bengiinHeight;
            var elements = this.elements;
            var loadingBgClass = this.options.loadingBgClass;
            var whenToLoad = this.options.whenToLoad;
            $(window).scroll(function () {
                var srcTop = this.scrollTop();
                if (srcTop >= bengiinHeight) {
                    elements.trigger("lazyme", $(window).scrollTop());
                }
            });
            elements.bind("lazyme", function (e, scrTop) {
                var url = $(this).attr("request-url");
                var offset = $(this).offset().top;
                var interval = $(window).height() - $(this).height();
                var max = 0;
                var min = 0;
                if (whenToLoad == 'allIn') {
                    max = offset;
                    min = offset - interval;
                } else if (whenToLoad == "someIn") {
                    max = offset + $(this).height();
                    min = offset - $(window).height();
                }
                if (scrTop >= min && scrTop <= max) {
                    $(this).load(url, function (responseTxt, statusTxt, xhr) {
                        if (statusTxt == "success") {
                            $(this).removeClass(loadingBgClass);
                            $(this).unbind("lazyme");
                        }
                    });
                }
            })
        }
    };
    $.fn.lazyLoadDiv_cc = function (options) {
        var llp = new lazyloadPlugin();
        return llp.bindLazy();
    }
})(jQuery);