<template>
  <div>
  <form enctype="multipart/form-data">
  <div>
    <div>
      <p name="selectClass">请选择图片<input type="file"  value=""  /></p>
    </div>
    <div>
      <p>
         <textarea id="content" name="content" placeholder="输入你想说的话…"></textarea>
      </p>
      <input type = "text" name="content"></input>
    </div>
	<div>允许评论<input type="radio" name="radio" value=1></radio></div>
    <div><input id="uploadbutton" type="button" value="发布" @change="upimage" @click.prevent.stop="post"> </div></form>
</div>
</template>

<script>
import jquery from '../3rd/jquery';
export default {
  methods:{
	  upimage(){
	  var filename = $("#file").val();
	    $.ajax({
	      type: "POST",
	      url: "http://www.weixiao100.cn/uploadSer/webapp/comm/upload?app=notice&uuid=427963f1da0011e58635fa163e0e90d3&schoolCode=zscy001",
	      enctype: 'multipart/form-data',
	      data: {
	        file: filename
	      },
	      success: function () {
	        alert("Data Uploaded: ");
	      }
	    });
	  }
  }
};
  
</script>

<style lang="scss">
  .not-found {
    text-align: center;
    margin-top: 150px;

    div {
      font-size: 4em;
      color: #80BD01;
      text-shadow: 2px 2px 5px rgba(0, 0, 0, .6);
    }

    p {
      color: lighten(#000, 35%);
    }
  }
</style>
