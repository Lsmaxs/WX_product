!function(){var a=window.UEDITOR_HOME_URL||b();window.UEDITOR_CONFIG={UEDITOR_HOME_URL:a,serverUrl:a+"php/controller.php",toolbars:[["fullscreen","source","|","undo","redo","|","bold","italic","underline","fontborder","strikethrough","superscript","subscript","removeformat","formatmatch","autotypeset","blockquote","pasteplain","|","forecolor","backcolor","insertorderedlist","insertunorderedlist","selectall","cleardoc","|","rowspacingtop","rowspacingbottom","lineheight","|","customstyle","paragraph","fontfamily","fontsize","|","directionalityltr","directionalityrtl","indent","|","justifyleft","justifycenter","justifyright","justifyjustify","|","touppercase","tolowercase","|","link","unlink","anchor","|","imagenone","imageleft","imageright","imagecenter","|","simpleupload","insertimage","emotion","scrawl","insertvideo","music","attachment","map","gmap","insertframe","insertcode","webapp","pagebreak","template","background","|","horizontal","date","time","spechars","snapscreen","wordimage","|","inserttable","deletetable","insertparagraphbeforetable","insertrow","deleterow","insertcol","deletecol","mergecells","mergeright","mergedown","splittocells","splittorows","splittocols","charts","|","print","preview","searchreplace","help","drafts"]]};function b(a,b){return d(a||self.document.URL||self.location.href,b||c())}function c(){var a=document.getElementsByTagName("script");return a[a.length-1].src}function d(a,b){var c=b;return/^(\/|\\\\)/.test(b)?c=/^.+?\w(\/|\\\\)/.exec(a)[0]+b.replace(/^(\/|\\\\)/,""):/^[a-z]+:/i.test(b)||(a=a.split("#")[0].split("?")[0].replace(/[^\\\/]+$/,""),c=a+""+b),e(c)}function e(a){var b=/^[a-z]+:\/\//.exec(a)[0],c=null,d=[];for(a=a.replace(b,"").split("?")[0].split("#")[0],a=a.replace(/\\/g,"/").split(/\//),a[a.length-1]="";a.length;)".."===(c=a.shift())?d.pop():"."!==c&&d.push(c);return b+d.join("/")}window.UE={getUEBasePath:b}}();