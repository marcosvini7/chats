const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const port = process.env.PORT || 3000
const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origins: 'https://chats-online.herokuapp.com ws://localhost:3000'
    }
})

app.use(express.static(__dirname + '/dist/'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html')
})

let logs = []
let messages = []

io.on('connection', socket => {

    socket.on('log', data => {      
        let foundId = false
        for(let i = 0; i < logs.length; i++){
            if(logs[i].id == data.id){ 
                logs[i].socket = socket.id
                foundId = true
            }
        }
        if(!foundId) {
            data.text = data.name + ' entrou no chat'
            data.socket = socket.id
            logs.push(data)
            io.emit('getLogs', logs)
            socket.broadcast.emit('log', data)
        }     
        
        io.to(socket.id).emit('getMessages', getMessages())  
    })

    socket.on('getMessages', () => {
        io.to(socket.id).emit('getMessages', getMessages())
    })

    socket.on('getPrivateMessages', (data) => {
        io.to(socket.id).emit('getMessages', messages.filter(msg => 
            (msg.to == data.socket1 && msg.from == data.socket2)
            || (msg.to == data.socket2 && msg.from == data.socket1)
        ))
    })

    socket.on('getChats', (data) => {
        let chats = []
        let verifiedChats = []
        let id = getLog(data).socket
        for(let i = messages.length - 1; i >= 0; i--){
            if(messages[i].to == id || messages[i].from == id){
                let exist = false
                verifiedChats.forEach(n => {
                    if((n.to == messages[i].to && n.from == messages[i].from)
                        || (n.to == messages[i].from && n.from == messages[i].to)){
                        exist = true
                    }
                })
                if(!exist){
                    let log = {}
                    if(messages[i].to == id){
                        log = getLog(messages[i].from)
                    } else {
                        log = getLog(messages[i].to)
                    }
                    let message = {
                        owner: getLog(messages[i].id).socket == id ? 'Você' : log.name,
                        sender: log.name,
                        gender: log.gender,
                        socket: log.socket,
                        text: messages[i].text,
                        time: messages[i].time
                    }
                    verifiedChats.push(messages[i])
                    chats.push(message)
                }
            }
        }
        io.to(socket.id).emit('getChats', chats)
    })

    socket.on('getLogs', () => {
        io.to(socket.id).emit('getLogs', logs)
    })

    socket.on('logout', (data) => {
        for(let i = 0; i < logs.length; i++){
            if(logs[i].id == data.id) {
                logs[i].time = data.time
                logs[i].timestamp = Date.now()
                logs[i].text = logs[i].name + ' saiu do chat'
                io.emit('log', logs[i])     
                io.to(socket.id).emit('logout')          
                logs.splice(i, 1)
                socket.broadcast.emit('getLogs', logs)              
            }
        }
    })

    socket.on('disconnect', () => {
        for(let i = 0; i < logs.length; i++){
            if(logs[i].socket == socket.id) {
                logs[i].time = getTime()
                logs[i].timestamp = Date.now()
                logs[i].text = logs[i].name + ' saiu do chat'
                socket.broadcast.emit('log', logs[i])               
                logs.splice(i, 1)
                socket.broadcast.emit('getLogs', logs)
            }
        }
    })

    socket.on('sendMessage', data => {
        messages.push(data)
        if(!data.to){
            io.emit('sendMessage', data)
        } else {
            io.to([data.to, socket.id]).emit('sendMessage', data)
            io.to(data.to).emit('notification', data)
        }
    })

    socket.on('verifyLogs', id => {
        io.to(socket.id).emit('verifyLogs', verifyLogs(id))
    })

    function verifyLogs(id){
        let result = true

        for(let i = 0; i < logs.length; i++){
            if(logs[i].id == id || id == null){ 
                result = false
            }
        }
        return result    
    }

    function getMessages(){
        let msgs = []
        for(let i = messages.length - 20; i < messages.length; i++ ){
            if(i >= 0 && !messages[i].to){
                msgs.push(messages[i])
            }
        }

        return msgs
    }

    function position(id, list, key){ 
        let index = -1
        for(let i = 0; i < list.length; i++){
            if(list[i][key] == id) index = i
        }

        return index
    }

    function getLog(socket1){

        let v_log = false

        logs.forEach(log => {
            if(log.id == socket1){
                v_log = log
            }
        })

        if(!v_log){
            logs.forEach(log => {
                if(log.socket == socket1){
                    v_log = log
                }
            })
        }

        return v_log
    }

    function getTime(){
        let timestamp = Date.now()            
        timeBr = new Date(timestamp).toLocaleTimeString('pt-br', {
            hour: '2-digit',
            minute:'2-digit'
          })  

        return timeBr  
    }
})

server.listen(port, () => {
    console.log('server running on port ' + port);
});

