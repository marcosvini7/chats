<template>
   
    <div class="d-flex justify-content-center nav-area"  v-if="!notification">
        <div id="icons" class="d-flex justify-content-around col col-lg-4 mt-3" >
            <button :class="buttons[0]" @click="$router.push({name: 'home'})">
                <i class="bi bi-globe"></i>
            </button>
            <button :class="buttons[1]" @click="$router.push({name: 'online'})">
                <i class="bi bi-people"></i>
            </button>
            <button :class="buttons[2]"  @click="$router.push({name: 'chats'})">
                <i class="bi bi-chat-left-text"></i>
            </button>
        </div>       
    </div>

    <div class="d-flex align-items-center nav-area" v-if="notification">        
        <div class="bg-success mt-2 col rounded p-1">
            <div class="d-flex justify-content-center align-items-center"> 
                <h6 class="text-white text-center pointer" @click="$router.push({name: 'chat', params: {socket: notifMsg.id, name: notifMsg.sender}})"> 
                    <i class="bi bi-chat-dots"></i> {{ notifMsg.sender + ': ' + notifMsg.text}} 
                </h6> 
                <div class="divider"></div>                  
                <i class="bi bi-x-circle text-white pointer" @click="closeNotification()" ></i>                                                                
            </div>          
        </div>       
    </div>        

    <div v-if="$route.name == 'home' || $route.name == 'chat' ">
        <v-title>{{title}}</v-title>
        <div class="border chat" :style="chatHeightStyle">
            <div v-for="msg,i in messages" :key="i" :class="messageMargin(msg)"> 
                <message :msg="msg" :socket="socket"></message>                              
            </div>
        </div>
        <div class="d-flex mt-2 align-items-end">           
            <textarea v-model="message" class="form-control" ></textarea>
            <div class="divider"></div>
            <div @click="sendMessage">
                <i class="bi bi-send"></i>
            </div>              
        </div>
    </div>
    <div v-else>
        <router-view></router-view>
    </div>
</template>

<script>


export default {
  data: () => ({
      buttons: ['btn btn-light', 'btn btn-light', 'btn btn-light'],
      title: 'Home',
      notification: false,
      notifMsg: '',
      timeOut: null,
      socket: null,
      message: '',
      messages: [],
      chatHeightStyle: '',
      user: {}
  }),
  watch: {
    notifMsg(){     
        this.notification = true
        clearTimeout(this.timeOut)

        this.timeOut = setTimeout(() => {
            this.notification = false
        }, 5000)        
    }
  },
  methods: {
      messageMargin(msg){
        return msg.id == this.socket.id ? 'message-left' : 'message-right'
      },
      getTime(){
        let timestamp = Date.now()            
        let time = new Date(timestamp) 
        if(time.getMinutes() > 9){
            return time.getHours() + ':' + time.getMinutes()
        } else {
            return time.getHours() + ':' + '0' + time.getMinutes() 
        }         
      },
      sendMessage(){        
          if(this.message != ''){          
            let message = {
                id: this.socket.id,
                text: this.message,
                time: this.getTime(),
                timestamp: Date.now(),
                sender: this.user.name,
                gender: this.user.gender
            }
            if(this.$route.name == 'chat'){
                message.to = this.$route.params.socket
                message.from = this.socket.id
            }

            this.socket.emit('sendMessage', message)
            this.message = ''
          }         
      },
      scrollChat(){
        let chat = document.getElementsByClassName('chat')[0]
        setTimeout(() => {
            chat?.scrollTo(0, chat?.scrollHeight)
        }, 300)
      }, 
      closeNotification(){
        this.notification = false 
        clearTimeout(this.timeOut)
      }
  },
  created(){     
    switch(this.$route.name){
        case 'home':
            this.buttons[0] = 'btn btn-info' 
            break
        case 'online':
            this.buttons[1] = 'btn btn-info'
            break
        case 'chats':
            this.buttons[2] = 'btn btn-info'
            break
        default:
            this.buttons[0] = 'btn btn-info'
    }
    
    let chatHeight = window.innerHeight - 270
    this.chatHeightStyle = 'height: ' + chatHeight + 'px'

    this.socket = this.io(process.env.VUE_APP_WS_URL)
    this.socket.on('connect', () => {
        let user = JSON.parse(localStorage.getItem('user'))
        if(!user.id){
            user.id = this.socket.id
            localStorage.setItem('user', JSON.stringify(user))
        }
        let log = {
            id: user.id,
            time: this.getTime(),
            timestamp: Date.now(),
            name: user.name,
            gender: user.gender
        }                     
        this.user = user              
        this.socket.emit('log', log)
    })

    this.socket.on('getMessages', data => {
        this.messages = data
        this.scrollChat()
    })

    this.socket.on('log', data => {
        this.messages.push(data)
        this.scrollChat()
    })

    this.socket.on('sendMessage', data => {
        if(this.$route.name == 'home' && !data.to){
            this.messages.push(data)
            this.scrollChat()
        } 
        if(this.$route.name == 'chat' && data.to){
            this.messages.push(data)
            this.scrollChat()
        }
                       
    })

    this.socket.on('notification', data => {
        if(this.$route.params?.socket != data.from){
            this.notifMsg = data 
        }     
    })

  },

  mounted(){
      window.addEventListener('resize', () => {
          let chatHeight = window.innerHeight - 270
          this.chatHeightStyle = 'height: ' + chatHeight + 'px'
      })
  },

  beforeRouteUpdate(to){
    for(let i = 0; i < this.buttons.length; i++){
        this.buttons[i] = 'btn btn-light'
    }
    switch(to.name){
        case 'home':
            this.buttons[0] = 'btn btn-info' 
            break
        case 'online':
            this.buttons[1] = 'btn btn-info'
            break
        case 'chats':
            this.buttons[2] = 'btn btn-info'
            break
        default:
            this.buttons[0] = 'btn btn-info'
    }

    this.title = to.params.name || 'Home'
    this.messages = []
    if(to.name == 'home') {
        this.socket.emit('getMessages')
    } else if(to.name == 'chat') {
        this.socket.emit('getPrivateMessages', {socket1: this.socket.id, socket2: to.params.socket})
    } 
  }     
  }

</script>

<style scoped>
    .chat {
        overflow-y: scroll;
        background: #EBF2F5;
    }
    .divider {
        margin-left: 5px;
        margin-right: 5px;
    }
    
    #icons i{
        font-size: 1.3em;
        
    }
    
    .bi-send {
        font-size: 1.4em;
        color:cadetblue;
        cursor:pointer
    }

    .nav-area {
        height: 60px;
    }
    .bi-x-circle {
        font-size: 1.2em;
    }
    .pointer {
        cursor: pointer
    }
    
</style>
