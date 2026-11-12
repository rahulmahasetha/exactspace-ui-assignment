# Team Chat

My solution to the Exactspace React chat assignment. It's a small real-time chat app with a React frontend and an Express + Socket.IO backend.

## Features

- Type a message and hit **Send** (or Enter) to post it to the thread.
- Every message is posted as a random user: Alan, Bob, Carol, Dean or Elin.
- Each message has a 👍 button with a like counter.
- Channels live in a sidebar (toggle it with ☰). Use **+** to create a new one.
- **Emoji:** the 😊 button opens a full emoji picker with categories and search.
- **Mentions:** type `@` to pick a user. Mentions are highlighted in the message.
- **Socket.IO:** messages, likes and new channels sync live across every open tab.

## Running locally

```bash
npm run install:all
npm run dev
```

The backend runs on port 3001 and the frontend on http://localhost:5173. Open it in two tabs to see messages sync.

## Deploying

The backend goes on Render and the frontend on Vercel.

1. **Render:** create a new Blueprint from this repo. It picks up `render.yaml`. Copy the service URL once it's live.
2. **Vercel:** import the repo, set the root directory to `frontend` and add `VITE_SOCKET_URL` with the Render URL.
3. **Back on Render:** set `CLIENT_URL` to the Vercel URL so only your frontend can connect.

Render's free plan sleeps when idle, so the first load can take up to a minute. Messages are kept in memory, so they reset whenever the server restarts.

## Socket events

| Event             | Direction       | Payload                         |
|-------------------|-----------------|---------------------------------|
| `init`            | server → client | `{ users, channels, messages }` |
| `online`          | server → all    | number of connected clients     |
| `channel:create`  | client → server | `{ name, description }`         |
| `channel:created` | server → all    | `{ name, description }`         |
| `message:send`    | client → server | `{ channel, text }`             |
| `message:new`     | server → all    | `{ channel, message }`          |
| `message:like`    | client → server | `{ channel, id }`               |
| `message:liked`   | server → all    | `{ channel, id, likes }`        |

## Project structure

```
backend/
  server.js            Express + Socket.IO server
frontend/
  src/
    App.jsx            app state and socket listeners
    socket.js          Socket.IO client
    components/
      Sidebar.jsx      profile, channel list, create button
      NewChannel.jsx   create channel dialog
      Message.jsx      a single message
      ChatInput.jsx    input, emoji picker, mentions
    index.css
```
