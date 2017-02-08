<template>
  <div class="content">
    <div class="panel">
      <div class="panel-header">
        <a v-link="{name: 'index'}" class="home">主页</a>
        <span class="c">/ </span>
        <span class="c"> 登入</span>
      </div>
      <div class="inner padding login">
       <!--  <p v-show="!tokenAvail" class="prompt">请输入有效的token</p> -->
        <p class="prompt"><c-hint v-if="hint.show"></c-hint></p>
        <div class="login-form">
          <label for="token">用户名:</label>
          <input type="text" id="username" v-model="tmpUserName" >
        </div>
        <div class="login-form">
          <label for="token">密码:</label>
          <input type="text" id="token" maxlength="36" v-model="tmpToken">
        </div>
        <a href="#" class="btn btn-primary" @click.prevent.stop="login">登入</a>
      </div>
    </div>
  </div>
  <div class="sider" v-if="0">
    <c-siderbar></c-siderbar>
  </div>
</template>

<script>
  /* eslint-disable max-len */
  import { getToken, getHint } from '../vuex/getters';
  import { changeTokenAvail, initHint, changeLoginUser } from '../vuex/actions';
  import { checkToken,fetchUser,changeToken,fetchUserDetail } from '../api/user';
  import cSiderbar from '../components/siderbar';
  import cHint from '../components/hint';
  import md5 from '../3rd/md5';
  import {setToken,setUserId} from '../3rd/cookie';

  export default {
    data() {
      return {
        tmpUserName:'18720909815',
          tmpToken: 'ly521012',
      };
    },
    vuex: {
      getters: {
        token: getToken,
        hint: getHint,
      },
      actions: {
        changeTokenAvail,
        changeToken,
        checkToken,
        fetchUser,
        fetchUserDetail,
        initHint,
        changeLoginUser,
      },
    },
    components: {
      cSiderbar,
      cHint,
    },
    /* eslint-disable max-len */
    methods: {
      // 简单检测用户输入的token长度
      simCheck() {
        if (this.tmpToken.length !== 36) {
          this.changeTokenAvail(true);
        }
      },
       // 登入
      login1() {
        this.tmpUserName = "13123435434565765786879";
      },
      // 登入
      login() {
        this.checkToken(this.tmpUserName, md5(this.tmpToken).toLowerCase())
        .then((bizData) => {
          setToken(bizData.value);
          this.changeToken(bizData.value);
          return this.fetchUser();
        }).then((userId) => {
            setUserId(userId);
            return this.fetchUserDetail(userId);
        }).then((userDetail) => {
            console.log("userName",userDetail.userName)
            this.changeLoginUser(userDetail);
            const redirect = decodeURIComponent(this.$route.query.redirect || '/');
            this.$route.router.go(redirect);
          })
        .catch((e) => console.log(e));
      },
    },
    route: {
      data() {
        // 初始化hint
        this.initHint();
      },
    },
  };
</script>

<style lang="scss">
  a.home {
    margin: 0;
  }

  .login {
    text-align: center;
    padding: 70px 0;
    position: relative;

    label {
      cursor: pointer;
      margin-right: 15px;
    }

  }

  .c {
    color: #999;
  }

  .prompt {
    position: absolute;
    left: 10px;
    top: 0;
    right: 10px;
    padding: 0 10px;
  }

  .login-form {
    margin-bottom: 25px;
  }

  #token {
    border-radius: 5px;
    padding: 5px;
    width: 200px;
    border: 1px solid #CCC;
    outline: none;
    transition: all .2s;

    &:focus {
      box-shadow: 0 1px 1px rgba(0, 0, 0, .1) inset, 0 0 8px rgba(49, 176, 213, .9);
    }

  }
</style>
