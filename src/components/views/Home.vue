<template>
    <div class="d-flex justify-content-center">
        <div id="icons" class="d-flex justify-content-around col col-lg-4 mt-3">
            <button class="btn btn-light" @click="$router.push({name: 'home'})">
                <i class="bi bi-globe"></i>
            </button>
            <button class="btn btn-light" @click="$router.push({name: 'online'})">
                <i class="bi bi-people"></i>
            </button>
            <button class="btn btn-light">
                <i class="bi bi-chat-left-text"></i>
            </button>
        </div>
    </div>

    <div v-if="$route.name == 'home' ">
        <v-title>Home</v-title>
        <div class="border chat">
            <div v-for="msg,i in messages" :key="i" :class="messageMargin(msg)"> 
                <div :class="messagePosition(msg)">
                    <div :class="messageColor(msg)">           
                        <b v-if="msg.id != socket.id" >
                            <span v-if="!msg.name">
                                <i  class="bi bi-person"></i> {{msg.sender}}:
                            </span>

                            <span v-else>
                                <i  class="bi bi-info-circle"></i>
                            </span>                        
                        </b> 
                        {{msg.text}}                   
                    </div>
                </div>
                <div :class="timePosition(msg)"><i class="bi bi-clock"></i> {{msg.time}}</div>                               
            </div>
        </div>
        <div class="d-flex mt-2">
            <input v-model="message" type="text" class="form-control">
            <div class="divider"></div>
            <button @click="sendMessage" class="btn btn-primary">Enviar</button>
        </div>
    </div>
    <div v-else>
        <router-view></router-view>
    </div>
</template>

<script>


export default {
  data: () => ({
      socket: null,
      message: '',
      messages: []
  }),
  methods: {
      messagePosition(msg){
        return msg.id == this.socket.id ? 'd-flex justify-content-end' 
            : 'd-flex justify-content-start'
      },
      messageMargin(msg){
          return msg.id == this.socket.id ? 'message-left' : 'message-right'
      },
      messageColor(msg){
          return msg.id == this.socket.id ? 'message-owner' : 'message'
      },
      timePosition(msg){
          return msg.id == this.socket.id ? 'time text-end' : 'time text-start'
      },
      getTime(){
        let timestamp = Date.now()            
        let date = new Date(timestamp)
        let time = date.toLocaleTimeString('pt-br')
        return time
      },
      sendMessage(){          
          if(this.message != ''){          
            let message = {
                id: this.socket.id,
                text: this.message,
                time: this.getTime(),
                timestamp: Date.now(),
                sender: localStorage.getItem('name')
            }
            this.socket.emit('sendMessage', message)
          }         
      },
      scrollChat(){
        setTimeout(() => {
            let chat = document.getElementsByClassName('chat')[0]
            chat.scrollTo(0, chat.scrollHeight)
        }, 100)
      }
  },
  created(){      
    this.socket = this.io(process.env.VUE_APP_WS_URL)
    this.socket.on('connect', () => {
        let log = {
            id: this.socket.id,
            time: this.getTime(),
            timestamp: Date.now(),
            name: localStorage.getItem('name')
        }
        this.socket.emit('log', log)
    })

    this.socket.on('log', data => {
        this.messages.push(data)
        this.scrollChat()
    })

    this.socket.on('sendMessage', data => {
        this.messages.push(data)
        this.scrollChat()              
    })
  },
  mounted(){
      let pessoas = [
          { id: 1, name: 'marcos'},
          { id: 2, name: 'cezar'},
          { id: 3, name: 'pedro'}
      ]
    }
      
  }

</script>

<style>
    .chat {
        height: 400px;
        overflow-y: scroll;
        background: #EBF2F5;

    }
    .divider {
        margin-left: 5px;
        margin-right: 5px;
    }
    .message-right {
        margin-right: 60px;
        margin-left: 10px;
        margin-top: 10px;
    }
    .message-left {
        margin-left: 60px;
        margin-right: 10px;
        margin-top: 10px;
    }
    #chat b {
        color:cornflowerblue
    }
    .bi-person {
        font-size: 1.2em;
    }
    .message-owner {
        background: #C2E3F5;
        border-radius: 30px;
        padding: 7px;
    }
    .message {
        background: #F4E0FA;
        border-radius: 30px;
        padding: 7px;
    }
    .time {
        font-size: 0.8em;
    }
    #icons i{
        font-size: 1.3em
    }
</style>
