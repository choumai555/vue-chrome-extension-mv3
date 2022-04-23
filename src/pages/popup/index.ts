import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
let app
function render() {
  app = createApp(App)
  app.use(ElementPlus)
  app.mount('#popup')
}
render()