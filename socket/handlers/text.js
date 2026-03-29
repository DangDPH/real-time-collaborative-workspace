const EVENTS = require('../../utils/eventTypes');

/**
 * Text handler — relays Quill Delta-compatible OT ops to other collaborators.
 * The sender is excluded (optimistic UI — they applied the op locally already).
 *
 * Expected payload:
 * {
 *   board_id: "abc",
 *   user_id:  "u1",
 *   payload: {
 *     doc_id:  "uuid",         // which document inside the board
 *     ops:     [...],          // array of OT ops: { retain }, { insert }, { delete }
 *     version: 14              // client's known doc version (for future OT conflict resolution)
 *   }
 * }
 *
 * Note: for production-grade conflict resolution, layer a full OT or CRDT
 * library (e.g. ShareDB, Yjs) on top of this relay.
 */
module.exports = (socket) => {
  socket.on(EVENTS.TEXT_UPDATE, (data) => {
    const { board_id, user_id, payload } = data;

    if (!board_id || !payload?.doc_id || !Array.isArray(payload?.ops)) {
      return socket.emit(EVENTS.ERROR, { message: 'text_update: missing board_id, doc_id, or ops array' });
    }

    socket.to(board_id).emit(EVENTS.TEXT_UPDATE, {
      type: EVENTS.TEXT_UPDATE,
      board_id,
      user_id,
      payload,
      timestamp: Date.now(),
    });
  });
};
