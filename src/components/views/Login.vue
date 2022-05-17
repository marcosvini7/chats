<template>
  <v-title>Login</v-title>
  <div class="d-flex justify-content-center">
    <div class="col col-md-8 col-lg-6">
      <form @submit.prevent="login" class="form-control">
        <div class="form-group">
          <label for="name" class="form-label">Nome</label>
          <input required v-model="name" type="text" class="form-control" maxlength="15">
        </div>       
        <button class="btn btn-success mt-2">Entrar</button>        
      </form>
    </div>
  </div>
  <div class="text-center text-danger">{{error}}</div>
</template>

<script>
export default {
  data: () => ({
    name: '',
    socket: null,
    error: ''
  }),
  methods: {
    login(){
      this.socket.emit('verifyLogs', this.name)
    }
  },
  created(){
    this.socket = this.io(process.env.VUE_APP_WS_URL)
    this.socket.on('verifyLogs', (data) => {
      if(data){
        localStorage.setItem('name', this.name)
        this.emitter.emit('logged', this.name)
        this.$router.push({name: 'home'})
      } else {
        this.error = 'Ops...já existe alguém logado com esse nome'
      }
    })
  }
}
</script>

<style>

</style>