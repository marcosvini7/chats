import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/components/views/Home.vue'
import Login from '@/components/views/Login.vue'
import Principal from '@/components/layouts/Principal.vue'
import Online from '@/components/views/Online.vue'

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
          if(localStorage.getItem('name')){
            return {name: 'home'}
          }
        }
      },
      {
        path: 'home',
        name: 'home', 
        component: Home,
        beforeEnter: () => {
          if(!localStorage.getItem('name')){
            return {name: 'login'}
          }
        },
        children: [
          {
            path: 'online',
            name: 'online',
            component: Online
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
