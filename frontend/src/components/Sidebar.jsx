import { useState } from 'react'
import NewChannel from './NewChannel'

export default function Sidebar({ channels, messages, active, connected, onSelect }) {
  const [creating, setCreating] = useState(false)

  return (
    <aside className="sidebar">
      <div className="profile">
        <div className="profile-avatar">
          ME
          <span className={`dot ${connected ? 'on' : ''}`} />
        </div>
        <div>
          <strong>You</strong>
          <p>{connected ? 'UI Developer · online' : 'Reconnecting…'}</p>
        </div>
      </div>

      <div className="sidebar-label">
        <span>Channels</span>
        <button
          className="add-btn"
          onClick={() => setCreating(true)}
          disabled={!connected}
          aria-label="Create channel"
          title="Create channel"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <ul>
        {channels.map(({ name }) => (
          <li key={name}>
            <button className={name === active ? 'active' : ''} onClick={() => onSelect(name)}>
              <span className="hash">#</span>
              <span className="name">{name}</span>
              {messages[name]?.length > 0 && <small>{messages[name].length}</small>}
            </button>
          </li>
        ))}
      </ul>

      {creating && (
        <NewChannel
          onClose={() => setCreating(false)}
          onCreated={(name) => {
            setCreating(false)
            onSelect(name)
          }}
        />
      )}
    </aside>
  )
}
