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
        <div class="border chat" :style="chatHeightStyle">
            <div v-for="msg,i in messages" :key="i" :class="messageMargin(msg)"> 
                <div :class="messagePosition(msg)">
                    <div :class="messageColor(msg)">           
                        <b v-if="msg.id != socket.id" >
                            <span v-if="!msg.name">
                               <i class="bi bi-person-fill" :class="userColor(msg)" ></i> {{msg.sender}}:
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
      socket: null,
      message: '',
      messages: [],
      chatHeightStyle: '',
      user: {}
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
      userColor(msg){
          return msg.gender == 'Masculino' ? 'blueUser' : 'pinkUser'
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
            this.socket.emit('sendMessage', message)
            this.message = ''
          }         
      },
      scrollChat(){
        let chat = document.getElementsByClassName('chat')[0]
        setTimeout(() => {
            chat?.scrollTo(0, chat?.scrollHeight)
        }, 200)
      }
  },
  created(){       
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
      window.addEventListener('resize', () => {
          let chatHeight = window.innerHeight - 270
          this.chatHeightStyle = 'height: ' + chatHeight + 'px'
      })
  }
      
  }

</script>

<style>
    .chat {
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
    .blueUser {
        color:dodgerblue
    }

    .pinkUser {
        color:hotpink
    }
    .bi-send {
        font-size: 1.4em;
        color:cadetblue;
        cursor:pointer
    }
    .bi-person-fill {
        font-size: 1.2em
    }
</style>
