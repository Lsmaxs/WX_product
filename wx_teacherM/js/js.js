function g(i){return document.getElementById(i);}
function WH(){return document.documentElement.clientHeight;}
function WW(){return document.documentElement.clientWidth;}
window.onload=function(){ document.getElementsByTagName('html')[0].style.fontSize=WW()+'px';}
window.onresize=function(){ document.getElementsByTagName('html')[0].style.fontSize=WW()+'px';}
function hide(i){g(i).style.display="none"}
function show(i){g(i).style.display="block"}
function SelectAll(o,n) {
 var checkboxs=document.getElementsByName(n);
 for (var i=0;i<checkboxs.length;i++) {
  var e=checkboxs[i];
  e.checked=o.checked?true:false;
 }
}
function selectTag(showContent,selfObj){
	
	var tag = document.getElementById("tags").getElementsByTagName("li");
	var taglength = tag.length;
	for(i=0; i<taglength; i++){
		tag[i].className = "";
	}
	selfObj.parentNode.className = "selectTag";
	
	for(i=0; j=document.getElementById("tagContent"+i); i++){
		j.style.display = "none";
	}
	document.getElementById(showContent).style.display = "block";
	
	
}

