/**
 * Phoenix.js Socket's adapter.
 * @module Socket
 */

import { Socket } from "phoenix";
import { put, select } from "redux-saga/effects";
import { selectors, setSocket } from "./phoenixSlice";


/**
 * Create socket connection saga
 * {@link https://hexdocs.pm/phoenix/js/index.html#socket Phoenix.js socket options}.
 * @param {string} endPoint - The string WebSocket endpoint, ie, "ws://example.com/socket" , "wss://example.com" "/socket" (inherited host & protocol)
 * @param {Object} [opts] - Opts on socket connection.
 */
export function* connectToSocketSaga(endPoint, opts) {
  const existingSocker = yield select(selectors.socket());
  if (existingSocker?.isConnected()) {
    return;
  }
  const socket = new Socket(endPoint, opts);
  yield put(setSocket(socket));
  yield new Promise((resolve) => {
    socket.onOpen(() => {
      resolve();
    })
    socket.connect();
  });
}

/**
 * Disconnect from socket saga.
 * {@link https://hexdocs.pm/phoenix/js/index.html#socketdisconnect Phoenix.js disconnect socket documentation.}
 * @param {integer} [code] - A status code for disconnection (Optional)
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes See Mozilla documentation for valid status codes.}.
 * @param {string} [reason] - A textual description of the reason to disconnect.
 */
export function* disconnectSocketSaga(code, reason) {
  const socket = yield select(selectors.socket());

  yield new Promise((resolve) => {
    socket.disconnect(resolve, code, reason)
  });
}
