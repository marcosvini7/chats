import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import io from 'socket.io-client'
import mitt from 'mitt'

import Title from '@/components/comuns/Title'
import Message from '@/components/comuns/Message'

const app = createApp(App)

app.component('v-title', Title)
app.component('message', Message)

app.config.globalProperties.io = io
app.config.globalProperties.emitter = mitt()

app.use(router)
    .mount('#app')
