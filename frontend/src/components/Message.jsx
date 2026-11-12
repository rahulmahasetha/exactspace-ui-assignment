import { memo } from 'react'

const COLORS = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8', '#4db6ac', '#f06292', '#7986cb']

const colorFor = (name) => COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length]

const renderText = (text) =>
  text.split(/(@\w+)/g).map((part, i) =>
    part.startsWith('@') ? <span key={i} className="mention">{part}</span> : part
  )

function Message({ message, onLike }) {
  const { id, user, text, time, likes } = message

  return (
    <div className="message">
      <div className="avatar" style={{ background: colorFor(user) }}>
        {user[0]}
      </div>

      <div className="message-body">
        <div className="message-meta">
          <strong>{user}</strong>
          <time>{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
        </div>
        <p>{renderText(text)}</p>
      </div>

      <button className="like" onClick={() => onLike(id)} aria-label="Like message">
        👍 <span>{likes}</span>
      </button>
    </div>
  )
}

export default memo(Message)
