import putApi from '../putApi'
var api = {};
putApi(api, "test", "https://fanyi.baidu.com/pc/config", {
  method: 'get'
});

export default api;