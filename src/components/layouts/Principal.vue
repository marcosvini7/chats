<template>
  <nav class="navbar navbar-expand-lg text-light">
    <div class="container-fluid">
        <div @click="$router.push({name: 'principal'})" class="navbar-brand">
          <i class="bi bi-chat-dots"></i> Chats 
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
            <router-link :to="{name: 'home'}" exact-active-class="nav-link active" class="nav-link" aria-current="page">Home</router-link>
            <router-link  v-if="!name" :to="{name: 'login'}" exact-active-class="nav-link active" class="nav-link" aria-current="page">Login</router-link>
            <router-link  v-if="name" :to="{name: 'home'}" exact-active-class="nav-link active" class="nav-link" aria-current="page">
              <i class="bi bi-person-circle"></i> {{name}}
            </router-link>
            <router-link  v-if="name" to="#" @click="logout()"  class="nav-link" aria-current="page">
              Sair
            </router-link>
        </div>
        </div>
    </div>
  </nav>

  <div class="container-fluid">
    <router-view v-if="$route.name != 'principal' " ></router-view>
    <div v-else>
      <v-title>Bem vindo ao chats!</v-title>
    </div>
  </div>
  
</template>

<script>
export default {
  data: () => ({
    name: ''
  }),
  methods: {
    logout(){     
      let socket = this.io(process.env.VUE_APP_WS_URL)
      socket.on('connect', () => {
        socket.emit('logout', {
          id: JSON.parse(localStorage.getItem('user')).id, 
          time: this.getTime()
        })
      })

      socket.on('logout', () => {
        localStorage.removeItem('user')
        localStorage.removeItem('logged')
        this.name = ''
        this.$router.push({name: 'principal'})
      })

    },
    getTime(){
        let timestamp = Date.now()            
        let time = new Date(timestamp) 
        return time.getHours() + ':' + time.getMinutes() 
      }
  },
  created(){
    this.name = JSON.parse(localStorage.getItem('user'))?.name
    this.emitter.on('logged', name => {
      this.name = name
    })
  }
}
</script>

<style scoped>
    .navbar {
        background: #7274E8       
    }
    .navbar-brand {
      color: white;
      font-size: 1.4em;
    }
    .navbar-brand:hover {
      color: #B2B3EA;
      cursor: pointer
    }
    .navbar-nav a {
      color: white;
      font-size: 1.1em;
    }
    .nav-link:hover {
      color: #B2B3EA
    }
    #user {
      margin-left: auto;
    }
</style>