import putApi from '../putApi'
var api = {};
import apiUrl from '@/config'
putApi(api, "Authenticate", apiUrl.api + "/api/TokenAuth/Authenticate", {
  method: 'post'
});

putApi(api, "UpLoadResumeBySource", apiUrl.api + "/api/services/app/ResumeAnalysis/BuYuAnalysis", {
  method: 'post'
});

putApi(api, "CheckIsExist", "https://yzp.api.sharegoo.cn/api/services/app/Upload/CheckIsExists", {
  method: 'post'
});

putApi(api, "GetAllResumeCatchLogs", "https://yzp.api.sharegoo.cn/api/services/app/ResumeCatchLogs/GetAll", {
  method: 'get'
});

putApi(api, "test", "https://fanyi.baidu.com/pc/config", {
  method: 'get'
});

export default api;