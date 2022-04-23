var api = {};
//@ts-ignore
import admin from './files/admin'
Object.assign(api, {
    ...admin
})
export function axios(request: { funName: any; pramas: any; headers: any; }, sender: any, callback = () => { }) {
    let { funName, pramas, headers } = request;
    //@ts-ignore
    if (funName in api) api[funName](pramas, (...pramas) => callback(pramas), headers)
    else throw new Error('未找到对应的chrome方法')
}
export const serve = api