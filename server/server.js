import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'


const db = await open({
 filename: 'chat.db',
 driver: sqlite3.Database
})

await db.exec(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT
  client_offset TEXT UNIQUE
  content TEXT
 );`)

const app = express()
const server = createServer(app)
const io = new Server(server, {
 connectionStateRecovery: {}
})

const __dirname = dirname(fileURLToPath('file:///Users/user/Desktop/websocket/server'))


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'client/index.html'))
})

io.on('connection', (socket) => {
  console.log('A user connected')
  socket.on('disconnect', () => {
   console.log('A user disconnected')
  })

  socket.on('chat message', async(message) => {
   let result
   try{
    result = await db.run('INSERT INTO messages (content) VALUES (?)', message)
   }catch(e){
    console.log('Error: ', e)
    return
   }

   io.emit('chat message', message, result.lastID)
   console.log('Message: ', message)
  })
})


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})