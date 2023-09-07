require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const PORT = process.env.PORT || 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const crypto = require('crypto')

const app = express()
app.set('trust proxy', true) // 프록시 뒤에서 실행되는 경우
app.use(cors())

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: false,
    },
})

const usersLocation = new Map()

app.get('/', (req, res) => {
    res.send('WebSocket Server Running!')
})

io.on('connection', (socket) => {
    const hash = crypto.randomBytes(8).toString('hex')
    socket.emit('client-hash', hash) // 연결된 클라이언트에게 자신의 hash 값을 전송

    console.log('a user connected :: ' + hash)

    let clientIp =
        socket.request.headers['x-forwarded-for'] ||
        socket.request.connection.remoteAddress
    if (clientIp.substr(0, 7) == '::ffff:') {
        clientIp = clientIp.substr(7)
    }

    socket.on('share-location', (location) => {
        const userData = {
            ...location,
            ip: clientIp,
            hash,
        }
        usersLocation.set(hash, userData)

        io.emit('update-location', Array.from(usersLocation.values()))
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        usersLocation.delete(hash)
    })
})

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`)
})
