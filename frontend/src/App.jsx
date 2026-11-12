import { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Message from './components/Message'
import ChatInput from './components/ChatInput'
import { socket } from './socket'

export default function App() {
  const [users, setUsers] = useState([])
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState({})
  const [active, setActive] = useState('general')
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 700)
  const [connected, setConnected] = useState(socket.connected)
  const [online, setOnline] = useState(0)
  const bottomRef = useRef(null)

  const thread = messages[active] ?? []
  const channel = channels.find((c) => c.name === active)
  const participants = new Set(thread.map((m) => m.user)).size

  useEffect(() => {
    const updateChannel = (channel, fn) =>
      setMessages((prev) => ({ ...prev, [channel]: fn(prev[channel] ?? []) }))

    const handlers = {
      connect: () => setConnected(true),
      disconnect: () => setConnected(false),
      init: (data) => {
        setUsers(data.users)
        setChannels(data.channels)
        setMessages(data.messages)
      },
      'channel:created': (c) => {
        setChannels((prev) => [...prev, c])
        setMessages((prev) => ({ ...prev, [c.name]: [] }))
      },
      online: setOnline,
      'message:new': ({ channel, message }) => updateChannel(channel, (list) => [...list, message]),
      'message:liked': ({ channel, id, likes }) =>
        updateChannel(channel, (list) => list.map((m) => (m.id === id ? { ...m, likes } : m))),
    }

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn))
    return () => Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.length, active])

  const sendMessage = useCallback(
    (text) => socket.emit('message:send', { channel: active, text }),
    [active]
  )

  const likeMessage = useCallback(
    (id) => socket.emit('message:like', { channel: active, id }),
    [active]
  )

  const openChannel = (channel) => {
    setActive(channel)
    if (window.innerWidth <= 700) setSidebarOpen(false)
  }

  return (
    <div className="app">
      {sidebarOpen && (
        <Sidebar
          channels={channels}
          messages={messages}
          active={active}
          connected={connected}
          onSelect={openChannel}
        />
      )}

      <div className="chat">
        <header className="chat-header">
          <button
            className="toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle conversations"
          >
            ☰
          </button>
          <div className="channel-title">
            <h1>
              <span className="hash">#</span> {active}
            </h1>
            {channel?.description && <p>{channel.description}</p>}
          </div>

          <div className="stats">
            <span className="chip" title="People online right now">
              <span className="dot-sm" /> {online} online
            </span>
            <span className="chip" title="People who posted in this channel">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.5c2.2.7 3.5 2.7 3.5 5.5" />
              </svg>
              {participants} {participants === 1 ? 'member' : 'members'}
            </span>
          </div>
        </header>

        <main className="thread">
          {thread.length === 0 && (
            <p className="empty">No messages in #{active} yet. Start the conversation 👋</p>
          )}
          {thread.map((m) => (
            <Message key={m.id} message={m} onLike={likeMessage} />
          ))}
          <div ref={bottomRef} />
        </main>

        <ChatInput users={users} onSend={sendMessage} disabled={!connected} />
      </div>
    </div>
  )
}
