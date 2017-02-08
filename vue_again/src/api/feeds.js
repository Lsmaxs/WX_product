import { get, postObject } from './base';
/**
 * 获取文章列表
 * @param  {Function} options.dispatch store对象解构出来的函数，无需手动提供
 * @param  {String} topicTab         主题分类
 * @param  {Number} page             页数
 * @return {Promise}                  Promise
 */
export const fetchFeedsLists = ({ dispatch },uuid, page) => {
  const url = 'http://www.weixiao100.cn/tea/webapp/clazzcircle/index';
  console.log(uuid);
  const query = {"uuid":"427963f1da0011e58635fa163e0e90d3","schoolCode":"zscy001","pageSize":20,"page":1};
  return postObject(url, query)
    .then((json) => {
      console.log(2132124,json);
      dispatch('CUSTOM_HINT',{show: false});
      return json;
      // if (json.success) {
      //   return dispatch('CUSTOM_HINT', json.data, topicTab, page);
      // }
      // return Promise.reject(new Error('fetchTopicLists failure'));
    })
    .catch((error) => {
      dispatch('FETCH_TOPIC_LISTS_FAILURE', page);
      return Promise.reject(error);
    });
};
