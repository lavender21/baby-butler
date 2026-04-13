import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Button, Cell, CellGroup, ConfigProvider, DatePicker, Dialog, Empty, Field, Form, Icon, NavBar, NoticeBar, Popup, Tabbar, TabbarItem, Tag } from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(ConfigProvider)
app.use(DatePicker)
app.use(Dialog)
app.use(Empty)
app.use(Field)
app.use(Form)
app.use(Icon)
app.use(NavBar)
app.use(NoticeBar)
app.use(Popup)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Tag)

app.mount('#app')
