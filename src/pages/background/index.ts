import { axios } from '@/api/useAxios'
//调用chrome事件
function chromeEvent(request: { funName: any; pramas: any; }, sender: any, callback: (arg0: any[]) => any) {
  let { funName, pramas } = request;
  let funCode = funName.split('.');
  let chromeFun = chrome;
  const chromeCallback = (...arr: any[]) => callback(arr)
  funCode.forEach((item: string, index: number) => {
    if (typeof chromeFun[item] !== 'undefined')
      //最后一个参数
      if (index + 1 === funCode.length) {
        if (typeof chromeFun[item] === 'function') {
          let callbackindex = pramas.findIndex((item: any) => typeof item === 'object' && 'callback' in item && item['callback'])
          if (callbackindex != -1) pramas[callbackindex] = chromeCallback;
          chromeFun[item](...pramas)
        } else throw new Error('未找到对应的chrome方法')
      } else {
        chromeFun = chromeFun[item]
      }
  })
}
chrome.runtime.onMessage.addListener(function (request: any, sender: any, sendResponse: any) {
  switch (request.funType) {
    case 'chrome': //代理执行chrome方法
      chromeEvent(request, sender, sendResponse)
      break;
    case 'axios': //代理执行chrome方法
      axios(request, sender, sendResponse)
      break;
  }
  //处理异步响应
  return true
});