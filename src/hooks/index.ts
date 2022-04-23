
export function useChrome(funName: string, ...pramas: any) {
    let callback = function () { }
    let callbackindex = pramas.findIndex((item: any) => typeof item === 'function')
    if (callbackindex != -1) {
        callback = pramas[callbackindex]
        pramas[callbackindex] = { callback: true }
    }
    chrome.runtime.sendMessage({
        funType: 'chrome',
        funName: funName,
        pramas,
        //@ts-ignore
    }, (pramas) => callback(...pramas));
}
export function axios(funName: string, pramas: any, callback: (arg0: any) => any, headers = {}) {
    chrome.runtime.sendMessage({
        funType: 'axios',
        funName,
        pramas,
        headers
        //@ts-ignore
    }, (pramas) => callback(...pramas));
}