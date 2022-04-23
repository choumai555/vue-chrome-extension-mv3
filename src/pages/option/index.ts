import { createApp } from 'vue'
import App from './App.vue'
// import store from "./store";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
let app
function render() {
    app = createApp(App)
    //   app.use(store)
    app.use(ElementPlus)
    app.mount('#option')
}
render()