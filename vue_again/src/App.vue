<template>
  <c-header></c-header>
  <div id="app">
    <div class="main">
      <router-view></router-view>
    </div>
    <c-back></c-back>
  </div>
</template>

<script>
import cHeader from './components/header';
import cBack from './components/backTop';
import store from './vuex/store';

export default {
  components: {
  cHeader,
    cBack,
  },
  store,
};
</script>

<style lang="scss">
  html,
  #app {
    height: 100%;
  }

  body {
    height: 100%;
    font: 16px 'Microsoft YaHei', 微软雅黑, STHeiti, 'WenQuanYi Micro Hei', SimSun, sans-serif;
    background-color: #E1E1E1;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
  }

  a {
    color: #CCC;
    text-decoration: none;
  }

  img {
    vertical-align: middle;
    max-width: 100%;
  }

  .main {
    overflow: hidden;
    padding: 0 5%;
    min-height: 100%;
  }


</style>
