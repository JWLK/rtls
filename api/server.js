const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
app.set('trust proxy', true) // 프록시 뒤에서 실행되는 경우
app.use(cors())

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})

app.get('/', (req, res) => {
    res.send('WebSocket Server Running!')
})

io.on('connection', (socket) => {
    console.log('a user connected')

    let ips =
        socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress
    const clientIp = ips.split(',')[0]

    socket.on('share location', (location) => {
        // console.log(`${clientIp} - [${location.lat}, ${location.lng}]`)
        io.emit('update location', { ...location, ip: clientIp })
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000')
})
