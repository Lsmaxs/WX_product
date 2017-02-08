export default (router) => router.map({
  '/': {
    name: 'index',
    component: require('./views/menu'),
  },
  '/noticeList/:tab/page/:page': {
    name: 'noticeList',
    component: require('./views/noticeList'),
    auth: true,
  },
  '/feedsList/page/:page': {
    name: 'feedsList',
    component: require('./views/feedsList'),
    auth: true,
  },
  '/post/:id': {
    name: 'post',
    component: require('./views/post'),
  },

  '/login': {
    name: 'login',
    component: require('./views/login'),
  },

  '/user/:name': {
    name: 'user',
    component: require('./views/user'),
  },

  '/create': {
    name: 'create',
    component: require('./views/create'),
    auth: true,
  },
  
  '/photo': {
	    name: 'photo',
	    component: require('./views/photo'),
	    auth: true,
	  },
  
  '/messages': {
    name: 'messages',
    component: require('./views/message'),
    auth: true,
  },
  '*': {
    component: require('./views/404'),
  },
});
