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
                let timestamp = Date.now()            
                let date = new Date(timestamp)
                let time = date.toLocaleTimeString('pt-br')

                logs[i].time = time
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
        io.emit('sendMessage', data)
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

    function position(id, list, key){ 
        let index = -1
        for(let i = 0; i < list.length; i++){
            if(list[i][key] == id) index = i
        }

        return index
    }

    function getTime(){
        let timestamp = Date.now()            
        let time = new Date(timestamp) 
        if(time.getMinutes() > 9){
            return time.getHours() + ':' + time.getMinutes()
        } else {
            return time.getHours() + ':' + '0' + time.getMinutes() 
        }         
      }

})

server.listen(port, () => {
    console.log('server running on port ' + port);
});

