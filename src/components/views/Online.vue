<template>
    <v-title>Pessoas Online</v-title>
    <ul class="list-group">
        <li class="list-group-item" v-for="user,i in users" :key="i">
            <div class="d-flex align-items-center">
                <img src="/ligar.png" alt="" id="img-on" >
                <div style="margin-left: 10px"></div>
                <h5> 
                    <i class="bi bi-person-fill" :class="userColor(user)" ></i> {{ user.name }}
                </h5>
            </div>            
        </li>
    </ul>
</template>

<script>
export default {
    data: () => ({
        users: [],
        socket: null
    }),
    methods: {
        userColor(user){
          return user.gender == 'Masculino' ? 'blueUser' : 'pinkUser'
        },
    },
    created(){
        this.socket = this.io(process.env.VUE_APP_WS_URL)
        this.socket.on('connect', () => {
            this.socket.emit('getLogs')
        })

        this.socket.on('getLogs', (data) => {
            this.users = data
        })
    }
    
}
</script>

<style>
    #img-on {
        width: 50px
    }
    .blueUser {
        color:dodgerblue
    }

    .pinkUser {
        color:hotpink
    }
    .bi-person-fill {
        font-size: 1.2em
    }
</style>