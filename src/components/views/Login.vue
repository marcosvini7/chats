<template>
  <v-title>Login</v-title>
  <div class="d-flex justify-content-center">
    <div class="col col-md-8 col-lg-6">
      <form @submit.prevent="login" class="form-control">
        <div class="form-group">
          <label for="name" class="form-label">Nome</label>
          <input required v-model="name" id="name" type="text" class="form-control" maxlength="15">
        </div>      
        <label class="form-label">Gênero</label>
        <div class="d-flex">
          <div class="form-check">           
            <input v-model="gender" type="radio" class="form-check-input" id="radio-m" value="Masculino">
            <label class="form-check-label" for="radio-m">Masculino</label>
          </div>
          <div style="margin-left: 10px"></div>
          <div class="form-check">
            <input v-model="gender" type="radio" class="form-check-input" id="radio-f" value="Femenino">
            <label class="form-check-label" for="radio-f">Femenino</label>
          </div> 
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
    gender: '',
    error: ''
  }),
  methods: {
    login(){
      if(this.gender){
        let user = {
          name: this.name,
          gender: this.gender
        }
        localStorage.setItem('user', JSON.stringify(user))
        this.emitter.emit('logged', this.name)       
        this.$router.push({name: 'home'})
      } else {
        this.error = 'Selecione o gênero'
      }
    }
  },
  created(){
    this.socket = this.io(process.env.VUE_APP_WS_URL)
  }
}
</script>

<style>

</style>