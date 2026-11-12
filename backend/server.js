import express from 'express'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 3001
const USERS = ['Alan', 'Bob', 'Carol', 'Dean', 'Elin']

const channels = [
  { name: 'general', description: 'Company wide announcements and chatter' },
  { name: 'random', description: 'Anything and everything off-topic' },
]
const messages = Object.fromEntries(channels.map((c) => [c.name, []]))

const randomUser = () => USERS[Math.floor(Math.random() * USERS.length)]

const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL?.split(',').map((u) => u.trim()) || '*' },
})

app.get('/health', (_req, res) => res.send('ok'))

const broadcastOnline = () => io.emit('online', io.engine.clientsCount)

io.on('connection', (socket) => {
  socket.emit('init', { users: USERS, channels, messages })
  broadcastOnline()
  socket.on('disconnect', broadcastOnline)

  socket.on('channel:create', (data, reply) => {
    if (typeof reply !== 'function') return
    const name = slugify(data?.name)
    const description = String(data?.description ?? '').trim().slice(0, 80)

    if (!name) return reply({ error: 'Please enter a channel name.' })
    if (messages[name]) return reply({ error: `#${name} already exists.` })

    const channel = { name, description }
    channels.push(channel)
    messages[name] = []
    io.emit('channel:created', channel)
    reply({ name })
  })

  socket.on('message:send', ({ channel, text }) => {
    const body = String(text ?? '').trim().slice(0, 2000)
    if (!messages[channel] || !body) return

    const message = { id: randomUUID(), user: randomUser(), text: body, time: Date.now(), likes: 0 }
    messages[channel].push(message)
    io.emit('message:new', { channel, message })
  })

  socket.on('message:like', ({ channel, id }) => {
    const message = messages[channel]?.find((m) => m.id === id)
    if (!message) return

    message.likes += 1
    io.emit('message:liked', { channel, id, likes: message.likes })
  })
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
