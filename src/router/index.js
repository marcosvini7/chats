import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/components/views/Home.vue'
import Login from '@/components/views/Login.vue'
import Principal from '@/components/layouts/Principal.vue'
import Online from '@/components/views/Online.vue'
import Chats from '@/components/views/Chats.vue'

const routes = [
  {
    path: '/',
    name: 'principal',
    component: Principal,
    children: [
      {
        path: 'login',
        name: 'login', 
        component: Login,
        beforeEnter: () => {
          if(localStorage.getItem('user')){
            return {name: 'home'}
          }
        }
      },
      {
        path: 'home',
        name: 'home', 
        component: Home,
        beforeEnter: () => {
          if(!localStorage.getItem('user')){
            return {name: 'login'}
          }
        },
        children: [
          {
            path: 'chat/:name/:socket',
            name: 'chat',
            component: Home
          },
          {
            path: 'online',
            name: 'online',
            component: Online
          },
          {
            path: 'chats',
            name: 'chats',
            component: Chats
          }
        ]
      }
    ]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
