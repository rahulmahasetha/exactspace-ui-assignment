import { lazy, Suspense, useRef, useState } from 'react'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

export default function ChatInput({ users, onSend, disabled }) {
  const [text, setText] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const inputRef = useRef(null)

  const query = text.match(/@(\w*)$/)?.[1]
  const mentions =
    query === undefined
      ? []
      : users.filter((u) => u.toLowerCase().startsWith(query.toLowerCase()))

  const pickMention = (user) => {
    setText(text.replace(/@\w*$/, `@${user} `))
    inputRef.current.focus()
  }

  const pickEmoji = ({ emoji }) => {
    const input = inputRef.current
    const start = input.selectionStart ?? text.length
    const end = input.selectionEnd ?? text.length
    setText(text.slice(0, start) + emoji + text.slice(end))
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    setShowEmojis(false)
  }

  return (
    <form
      className="chat-input"
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === 'Escape' && setShowEmojis(false)}
    >
      {mentions.length > 0 && (
        <ul className="popup mentions">
          {mentions.map((u) => (
            <li key={u}>
              <button type="button" onClick={() => pickMention(u)}>@{u}</button>
            </li>
          ))}
        </ul>
      )}

      {showEmojis && (
        <div className="popup emoji-popup">
          <Suspense fallback={<p className="loading">Loading emojis…</p>}>
            <EmojiPicker
              onEmojiClick={pickEmoji}
              emojiStyle="native"
              lazyLoadEmojis
              width={340}
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </Suspense>
        </div>
      )}

      <button
        type="button"
        className={`icon-btn ${showEmojis ? 'active' : ''}`}
        onClick={() => setShowEmojis((s) => !s)}
        aria-label="Emoji picker"
      >
        😊
      </button>

      <input
        className="message-field"
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message… (@ to mention)"
        autoFocus
      />

      <button type="submit" className="send" disabled={!text.trim() || disabled}>
        Send
      </button>
    </form>
  )
}
