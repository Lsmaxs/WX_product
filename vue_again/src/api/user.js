import { get, post } from './base';

/**
 * 改变token的值
 * @param  {Function} options.dispatch store对象解构出来的函数，无需手动提供
 * @param  {String} accesstoken            accesstoken的值
 */
export const changeToken = ({ dispatch }, accesstoken) => dispatch('CHANGE_TOKEN', accesstoken);

/**
 * 验证账号信息
 * @param  {Function} options.dispatch store对象解构出来的函数，无需手动提供
 * @param  {String} accesstoken      accesstoken的值
 * @return {Promise}                  Promise
 */
export const checkToken = ({ dispatch }, username,password) => {
  const url = 'http://uww-pro.qtonecloud.cn/v2/oauth/token';
  const query = `client_id=wx_jxhd&client_secret=wx_jxhd&grant_type=password&scope=read&username=${username}&password=${password}`;
  return get({ url, query })
  .then((json) => {
    if (json.bizData) {
      dispatch('CHECK_TOKEN_SUCCESS');
      return json.bizData;
    }
    return Promise.reject(new Error('checkToken failure'));
  })
  .catch((error) => {
    dispatch('CHECK_TOKEN_FAILURE');
    return Promise.reject(error);
  });
};
/**
 * 跳转发照片
 */
/*export const checkPhoto = ({ dispatch }, username,password) => {
	  const url = 'https://www.weixiao100.cn/xywh/wap/html/classcircle/album_par_edit.html';
	  const query = `?userId=bf2e0883c63511e58635fa163e0e90d3&cropId=wx29a48dfc48fb3877&classIdStr=14444711746489774&classNameStr=%E5%B0%8F%E4%B8%80(56)%E7%8F%AD&userName=%E6%A2%81%E5%86%B0`;
	  https://www.weixiao100.cn/fronts/xywh/html/classcircle/album_send.html?roleType=1&userId=427963f1da0011e58635fa163e0e90d3&cropId=wx29a48dfc48fb3877&classIdStr=14682138645244269&classNameStr=%E5%B0%8F%E4%B8%80(999)%E7%8F%AD&userName=%E8%B5%96%E5%8B%87&ia=1
	  return get({ url, query })
	  .then((json) => {
	    if (json.bizData) {
	      dispatch('CHECK_TOKEN_SUCCESS');
	      return json.bizData;
	    }
	    return Promise.reject(new Error('checkToken failure'));
	  })
	  .catch((error) => {
	    dispatch('CHECK_TOKEN_FAILURE');
	    return Promise.reject(error);
	  });
	};*/

/**
 * 获取用户信息
 * @param  {Function} options.dispatch store对象解构出来的函数，无需手动提供
 * @param  {String} loginName        用户名
 * @return {Promise}                  Promise
 */
export const fetchUser = ({ dispatch }) => {
  const url = "http://www.weixiao100.cn/tea/getLoginUserInfo";
  return post(url)
  .then((json) => {
    if (json.userId) {
      dispatch('FETCH_USER_SUCCESS', json.userId);
      return json.userId;
    }
    return Promise.reject(new Error('fetchUser failure'));
  })
  .catch((error) => {
    dispatch('FETCH_USER_FAILURE');
    return Promise.reject(error);
  });
};

/**
 * 获取用户信息
 * @param  {Function} options.dispatch store对象解构出来的函数，无需手动提供
 * @param  {String} loginName        用户名
 * @return {Promise}                  Promise
 */
export const fetchUserDetail = ({ dispatch },userId) => {
  const url = `http://www.weixiao100.cn/tea/info/${userId}`;
  return post(url)
  .then((json) => {
    if (json.resultCode=="001") {
      dispatch('FETCH_USER_SUCCESS', json);
      return json;
    }
    return Promise.reject(new Error('fetchUserDetail failure'));
  })
  .catch((error) => {
    dispatch('FETCH_USER_FAILURE');
    return Promise.reject(error);
  });
};
