define(function(require, exports, module) {
	/**
	 * @desc 
	 * @exports
	 * @version 1.9.1
	 * @author wxfront
	 * @copyright Copyright 2014-2015
	 * 
	 */
	var qt_model = {
        // wxAnimateCache : wxAnimateCache,
        wxClearAnimate : wxClearAnimate,
        wxAnimate : wxAnimate
    };

	var $ = require("jquery");

    //设置缓存
    // function wxAnimateCache(element) {
    //     var allBoxes = element && $(element).find('.wxani');
    //     for (var i = 0; i < allBoxes.length; i++) {
    //         allBoxes[i].attributes["style"] ? allBoxes[i].setAttribute("wxani-style-cache", allBoxes[i].attributes["style"].value) : allBoxes[i].setAttribute("wxani-style-cache", " ");
    //         allBoxes[i].style.visibility = "hidden";
    //     }
    // }

    //清除动画
    function wxClearAnimate(element) {
        var allBoxes = element && $(element).find('.wxani');
        for (var i = 0; i < allBoxes.length; i++) {
            allBoxes[i].attributes["wxani-style-cache"] && allBoxes[i].setAttribute("style", allBoxes[i].attributes["wxani-style-cache"].value);
            allBoxes[i].style.visibility = "hidden";
            allBoxes[i].className = allBoxes[i].className.replace("animated", " ");
            allBoxes[i].attributes["wxani-effect"] && (effect = allBoxes[i].attributes["wxani-effect"].value, allBoxes[i].className = allBoxes[i].className.replace(effect, " "))
        }
    }

    //做动画
    function wxAnimate(element) {
        wxClearAnimate(element);
        var anis = element && $(element).find('.wxani');
        for (var i = 0; i < anis.length; i++) {
            anis[i].style.visibility = "visible";
            var effect = anis[i].attributes["wxani-effect"] ? anis[i].attributes["wxani-effect"].value : "";
            anis[i].className = anis[i].className + "  " + effect + " " + "animated";
            var style = anis[i].attributes["style"].value;
            var duration = anis[i].attributes["wxani-duration"] ? anis[i].attributes["wxani-duration"].value : "";
            duration && (style = style + "animation-duration:" + duration + ";-webkit-animation-duration:" + duration + ";");
            var delay = anis[i].attributes["wxani-delay"] ? anis[i].attributes["wxani-delay"].value : "";
            delay && (style = style + "animation-delay:" + delay + ";-webkit-animation-delay:" + delay + ";");
            anis[i].setAttribute("style", style);
        }
    }

	module.exports = qt_model;
});