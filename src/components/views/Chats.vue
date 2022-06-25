<template>
    <v-title>Chats</v-title>
    <ul class="list-group">
        <li class="list-group-item pointer" v-for="chat,i in chats" :key="i" @click="openChat(chat)">
            <h6>  
                <i class="bi bi-person-fill" :class="userColor(chat.gender)" ></i> 
                {{ chat.sender }}
            </h6>
            <p> {{ chat.owner }}: {{chat.text}}</p>
            <div class="text-end time"> <i class="bi bi-clock"></i> {{chat.time}}</div>
        </li>
    </ul>
</template>

<script>
export default {
    data: () => ({
        chats: [],
        user: {},
        socket: null
    }),
    methods: {
        userColor(gender){
            return gender == 'Masculino' ? 'blueUser' : 'pinkUser'
        },
        openChat(chat){
            this.$router.push({name: 'chat', params: {socket: chat.socket, name: chat.sender}})       
        },
    },
    created(){
        this.user = JSON.parse(localStorage.getItem('user'))

        this.socket = this.io(process.env.VUE_APP_WS_URL)
        this.socket.on('connect', () => {
            this.socket.emit('getChats', this.user.id)
        })

        this.socket.on('getChats', data => {
            console.log(data)
            this.chats = data
        })
    }
}
</script>

<style>
    .pointer {
        cursor: pointer
    }
    .blueUser {
        color:dodgerblue
    }

    .pinkUser {
        color:hotpink
    }
    .time {
        font-size: 0.8em;
    }
</style>