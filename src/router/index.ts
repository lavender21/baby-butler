import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecordView from '../views/RecordView.vue'
import RecordCreateView from '../views/RecordCreateView.vue'
import RecordEditView from '../views/RecordEditView.vue'
import HistoryView from '../views/HistoryView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/record', name: 'record', component: RecordView },
  { path: '/record/create', name: 'record-create', component: RecordCreateView },
  { path: '/record/edit/:id', name: 'record-edit', component: RecordEditView },
  { path: '/history', name: 'history', component: HistoryView },
  { path: '/profile', name: 'profile', component: ProfileView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
