const EVENTS = require('../../utils/eventTypes');

/**
 * Chat handler — broadcasts a message to ALL users in the room,
 * including the sender (io.to vs socket.to).
 *
 * Why include the sender?
 *   The server is the single source of truth for the chat log. The sender's
 *   message only appears in their UI once the server confirms it (with a
 *   server-assigned timestamp), preventing duplicates and ordering issues.
 *
 * Expected payload:
 * {
 *   board_id: "abc",
 *   user_id:  "u1",
 *   payload: {
 *     message_id: "uuid",   // client-generated, used for deduplication
 *     text:       "Hello!",
 *     username:   "Alice"
 *   }
 * }
 */
module.exports = (io, socket) => {
  socket.on(EVENTS.SEND_MESSAGE, (data) => {
    const { board_id, user_id, payload } = data;

    if (!board_id || !payload?.text) {
      return socket.emit(EVENTS.ERROR, { message: 'send_message: missing board_id or text' });
    }

    // Broadcast to everyone including sender — server timestamp is the source of truth
    io.to(board_id).emit(EVENTS.RECEIVE_MESSAGE, {
      type:     EVENTS.RECEIVE_MESSAGE,
      board_id,
      user_id,
      payload: {
        ...payload,
        sent_at: Date.now(),
      },
    });
  });
};
