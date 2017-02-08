<template>
  <div class="content">
    <div class="panel">
      <c-hint v-if="hint.show"></c-hint>
      <div class="inner"  v-else>
        <div class="topic-list">
          <div class="cell" v-for="feeds in items">

            <div class="photo_box" data-batchid={{ feeds.batchId }}>
              <div class="photo_list">
                <a href="javascript:;" data-batchid={{ feeds.batchId }} data-num="0" class="bt_zan">
                  <span></span>0</a>
                <div class="pt_tit">
                  <span class="face_pic">
                    <img src={{feeds.icon}}></span>
                  <b>{{ feeds.createName}}</b>
                  <br>2016-06-08 14:24&nbsp;&nbsp;&nbsp;上传了{{ feeds.picNum}}张图片到{{ feeds.className}}&nbsp;&nbsp;&nbsp;
                  <a data-classid="14594751449353813" href="javascript:;">查看全部&gt;</a></div>
              </div>
              <div class="imgwrapperRoot">
                <a class="imgwrapper" href="javascript:;" style="overflow:hidden;" v-for="pic in feeds.picUrls">
                  <img src="{{pic.url}}@base@tag=imgScale&amp;w=500&amp;h=500" data-src={{pic.url}} onload="winFixImg(this);" onerror="winErrorImg(this);" style="width: 115px; height: 115px; transform: translate(0px, 0px);"></a>
              </div>
              <div class="zan_name" style="display:none;"></div>
            </div>

          </div>
        </div>
        <c-pagination v-if="items[0].author_id"></c-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  /* eslint-disable max-len */
  import cHint from '../components/hint';
  import cList from '../components/list';
  import cSiderbar from '../components/siderbar';
  import { fetchTopicLists, changeUser, fetchUser, checkToken, fetchMsgCount, fetchCollection, showHint, initHint, changeLoginUser } from '../vuex/actions';
  import { getTopicTabs, getCurrentTab, getTopicLists, getHint, getLoginUser } from '../vuex/getters';
  import { fetchFeedsLists} from '../api/feeds';
  export default {
    components: {
      cHint,
      cList,
      cSiderbar,
    },
    vuex: {
      actions: {
        fetchFeedsLists,
        fetchUser,
        changeUser,
        checkToken,
        fetchCollection,
        fetchMsgCount,
        showHint,
        initHint,
        changeLoginUser,
      },
      getters: {
        topicTabs: getTopicTabs,
        currentTab: getCurrentTab,
        topicLists: getTopicLists,
        hint: getHint,
        loginUser: getLoginUser,
      },
    },
    ready() {
      if (this.loginUser) {
        this.changeUser(this.loginUser);
      }
    },
    data() {
      return {
        items:[],
      };
    },
 
    route: {
      data({ to: { params: { page = 1 } } }) {
        // 初始化hint
        this.initHint();
        // 显示hint
        this.showHint();
        const currentPage = page;
        // 获取文章列表
        this.fetchFeedsLists(this.loginUser.uuid, currentPage).then((feeds) => {
          this.items = feeds.items;
        }).catch((e) => console.log(e));
      },
    },
  };

</script>

<style lang="scss">
  .content {
    float: left;
    width: 100%;
    min-height: 1px
  }

  .sider {
    float: left;
    width: 30%;
    box-sizing: border-box;
    padding-left: 20px;
  }

  @media (max-width: 512px) {
    .content {
      float: none;
      width: 100%;
    }
    .sider {
      float: none;
      width: 100%;
      padding-left: 0;
    }
  }

</style>
