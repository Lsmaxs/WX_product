function () {
if (!dataId) {
alert("请选择一行！");
return;
}

var resourceUrl2 = "/admin/${bizSys}/${mainObj}/getAllResources?roleId=" + dataId;
$.get(resourceUrl2, {}, function (result) {
var setting = {
check: {
enable: true
},
data: {
simpleData: {
enable: true
},
key: {
name: "resourceName",
children: "resourceInfos"
}

}
};
if("0000000" != result.rtnCode){
alert("远程访问数据失败!");
return ;
}
result = result.bizData;
var zNodes = result;

for (var i = 0; i < result.length; i++) {
var obj = result[i];
if (obj.resourceInfos) {
result[i].open = true;
}

var chidrens = obj.resourceInfos;
for (var m = 0; m < chidrens.length; m++) {
var third = chidrens[m].resourceInfos;
for (var n = 0; n < third.length; n++) {
if (third[n].roleId > 0) {
third[n].checked = true;
chidrens[m].checked = true;
result[i].checked = true
}
}


}

}
var code;

function setCheck() {
var zTree = $.fn.zTree.getZTreeObj("tree1"),
py = $("#py").attr("checked") ? "p" : "",
sy = $("#sy").attr("checked") ? "s" : "",
pn = $("#pn").attr("checked") ? "p" : "",
sn = $("#sn").attr("checked") ? "s" : "",
type = { "Y": py + sy, "N": pn + sn};
zTree.setting.check.chkboxType = type;
showCode('setting.check.chkboxType = { "Y" : "' + type.Y + '", "N" : "' + type.N + '" };');
var checked = zTree.getNodes()[0].checked;
alert(checked)
}

function showCode(str) {
if (!code) code = $("#code");
code.empty();
code.append("<li>" + str + "</li>");
}


var treeObj = $.fn.zTree.init($("#tree1"), setting, zNodes);
$("#sn").bind("change", setCheck);


$("#treeFixed-01").find("#sData").click(function () {
var array = [];

var nodes = treeObj.getCheckedNodes(true);
for (var i = 0; i < nodes.length; i++) {
var pid = nodes[i].parentResourceId;
var resourceId = nodes[i].resourceId;
var obj = {
"parentResourceId": pid,
"resourceId": resourceId
}

array.push(obj);

}
var resource_submit_url = "/admin/${bizSys}/${mainObj}/assign";
$.post(resource_submit_url, {
objId: dataId,
resources: JSON.stringify(array)
}, function (result) {
alert(result.bizData)
$("#treeFixed-01").hide();
}
);

});
$("#treeFixed-01").show();

});


}