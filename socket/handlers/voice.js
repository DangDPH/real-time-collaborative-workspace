const EVENTS = require('../../utils/eventTypes');

/**
 * Voice / WebRTC signaling handler.
 *
 * The server is a pure signaling relay — audio data never touches it.
 * All signaling messages are forwarded to a SPECIFIC peer (io.to(target_socket_id)),
 * NOT broadcast to the room. Broadcasting SDP offers to the whole room causes
 * every peer to answer simultaneously, creating SDP state machine conflicts.
 *
 * Signaling flow for a new joiner:
 *   1. New peer emits voice_join → server notifies existing peers
 *   2. Each existing peer sends voice_offer → new peer (targeted)
 *   3. New peer responds with voice_answer → each offerer (targeted)
 *   4. Both sides exchange voice_ice_candidate until P2P connection forms
 *   5. Audio streams directly peer-to-peer — server is no longer involved
 */
module.exports = (io, socket) => {

  // ── Join voice channel ──────────────────────────────────────────
  socket.on(EVENTS.VOICE_JOIN, ({ board_id, user_id }) => {
    if (!board_id) return;

    // Notify existing peers — each will send an offer back to socket.id
    socket.to(board_id).emit(EVENTS.VOICE_JOIN, {
      board_id,
      user_id,
      from_socket_id: socket.id,
    });
  });

  // ── Leave voice channel ─────────────────────────────────────────
  socket.on(EVENTS.VOICE_LEAVE, ({ board_id, user_id }) => {
    if (!board_id) return;

    socket.to(board_id).emit(EVENTS.VOICE_LEAVE, {
      board_id,
      user_id,
      from_socket_id: socket.id,
    });
  });

  // ── Offer: caller → specific callee ────────────────────────────
  // payload: { target_socket_id, sdp }
  socket.on(EVENTS.VOICE_OFFER, ({ board_id, user_id, payload }) => {
    const { target_socket_id, sdp } = payload || {};
    if (!target_socket_id || !sdp) return;

    io.to(target_socket_id).emit(EVENTS.VOICE_OFFER, {
      board_id,
      user_id,
      payload: { sdp, from_socket_id: socket.id },
    });
  });

  // ── Answer: callee → specific caller ───────────────────────────
  // payload: { target_socket_id, sdp }
  socket.on(EVENTS.VOICE_ANSWER, ({ board_id, user_id, payload }) => {
    const { target_socket_id, sdp } = payload || {};
    if (!target_socket_id || !sdp) return;

    io.to(target_socket_id).emit(EVENTS.VOICE_ANSWER, {
      board_id,
      user_id,
      payload: { sdp, from_socket_id: socket.id },
    });
  });

  // ── ICE candidates: both directions, targeted ───────────────────
  // payload: { target_socket_id, candidate }
  socket.on(EVENTS.VOICE_ICE_CANDIDATE, ({ board_id, user_id, payload }) => {
    const { target_socket_id, candidate } = payload || {};
    if (!target_socket_id || !candidate) return;

    io.to(target_socket_id).emit(EVENTS.VOICE_ICE_CANDIDATE, {
      board_id,
      user_id,
      payload: { candidate, from_socket_id: socket.id },
    });
  });

  // ── Mute/unmute: broadcast to room (UI indicator only) ──────────
  socket.on(EVENTS.TOGGLE_MUTE, ({ board_id, user_id, payload }) => {
    if (!board_id) return;
    socket.to(board_id).emit(EVENTS.TOGGLE_MUTE, { board_id, user_id, payload });
  });
};
