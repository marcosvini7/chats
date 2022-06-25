<template>
    <div :class="messagePosition()">
        <div :class="messageColor()">           
            <b v-if="msg.id != socket.id" >
                <span id="chat-span" v-if="!msg.name" @click="openChat()" >
                    <i class="bi bi-person-fill" :class="userColor()" ></i> {{msg.sender}}:
                </span>

                <span v-else>
                    <i  class="bi bi-info-circle"></i>
                </span>                        
            </b> 
            {{msg.text}}                   
        </div>
    </div>
    <div :class="timePosition()"><i class="bi bi-clock"></i> {{msg.time}}</div> 
</template>

<script>
    export default {
        props: ['msg', 'socket'],
        data: () => ({
            
        }),
        methods: {
            messagePosition(){
                return this.msg.id == this.socket.id ? 'd-flex justify-content-end' 
                    : 'd-flex justify-content-start'
            },           
            messageColor(){
                return this.msg.id == this.socket.id ? 'message-owner' : 'message'
            },
            timePosition(){
                return this.msg.id == this.socket.id ? 'time text-end' : 'time text-start'
            },
            userColor(){
                return this.msg.gender == 'Masculino' ? 'blueUser' : 'pinkUser'
            },
            openChat(){
                if(this.socket.id != this.msg.id){
                    this.$router.push({name: 'chat', params: {socket: this.msg.id, name: this.msg.sender}})
                    this.emitter.emit('enterChat')
                }                
            }
        },
        created() {
            
        }
    }
</script>

<style scoped>
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

    .bi-person-fill {
        font-size: 1.2em
    }
    
    .blueUser {
        color:dodgerblue
    }

    .pinkUser {
        color:hotpink
    }

    #chat-span {
        cursor: pointer
    }
</style>