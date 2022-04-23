import axios from './axios'
export default function (api: { [x: string]: (body: any, callback: (arg0: any) => any, headers?: {}) => void }, name: string | number, url: string, {
    method = 'get',
} = {}) {
    api[name] = (body: any, callback: (arg0: any) => any, headers = {}) => {
        Object.assign(axios.defaults.headers.common, headers)
        if (method == 'get') {
            axios[method](url, { params: body }).then(callback).catch((res) => {
                throw new Error(res)
            })
        } else {
            //@ts-ignore
            axios[method](url, body).then(callback).catch((res: any) => {
                throw new Error(res)
            })
        }
    }
};