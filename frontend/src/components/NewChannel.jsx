import { useState } from 'react'
import { socket } from '../socket'

export default function NewChannel({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    socket.emit('channel:create', { name, description }, (res) =>
      res.error ? setError(res.error) : onCreated(res.name)
    )
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-channel-title"
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div className="modal-head">
          <h2 id="new-channel-title">Create a channel</h2>
          <button type="button" className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="modal-sub">Channels are where your team talks about a topic.</p>

        <label>
          Name
          <div className={`field ${error ? 'invalid' : ''}`}>
            <span className="hash">#</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="e.g. UI Developer"
              maxLength={24}
              autoFocus
            />
          </div>
        </label>
        {error && <p className="error">{error}</p>}

        <label>
          Description <span className="optional">(optional)</span>
          <div className="field">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              maxLength={80}
            />
          </div>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="send" disabled={!name.trim()}>
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
