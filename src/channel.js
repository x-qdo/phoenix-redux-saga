/**
 * Phoenix.js Channel's adapter.
 * @module Channel
 */

import { eventChannel } from "redux-saga";
import { call, fork, put, select, spawn, take } from "redux-saga/effects";

import { removeChannel, selectors, setChannel } from "./phoenixSlice";
import { globalChannelHandlers, TIMEOUT_ERROR_REASON } from "./defaultErrorHandlers";

function createEventChannel(channel, events) {
  return eventChannel(emitter => {
    events.forEach(event => {
      channel.on(event.name, payload => {
        emitter({
          saga: event.saga,
          payload,
        })
      })
    })
    return () => {
      console.log('channel cancelled')
      // channel.close()
    }
  })
}

function* watchEventsSaga(channel, events) {
  const eventsChannel = yield call(createEventChannel, channel, events);

  while (true) {
    try {
      const {saga, payload} = yield take(eventsChannel);
      yield fork(saga, payload);
    } catch (err) {
      globalChannelHandlers.onError(err, channel.topic, "js error", {});
    }
  }
}

/**
 * Join to socket's channel
 * {@link https://hexdocs.pm/phoenix/js/index.html#channeljoin Related Phoenix.js documentation.}
 * @generator
 * @param {string} topic - Channel's topic name
 * @param {Object} [opts] - Opts of socket's channel.
 * @param {Object[]} [opts.events] - Array of events to watch.
 * @param {string} opts.events[].name - Event to listen to on current channel.
 * @param {Generator} opts.events[].saga - Saga to trigger on event.
 * @param {Object} [opts.chanParams] - Parameters for the channel, for example {token: roomToken}.
 * @param {Generator} [opts.onErrorSaga] - Saga to trigger on error.
 * @param {Generator} [opts.onReplySaga] - Saga to trigger on reply.
 */
export function* joinToChannelSaga(topic, opts = {}) {
  const {events = [], chanParams = {}, onErrorSaga, onReplySaga} = opts;
  const socket = yield select(selectors.socket());
  const channel = socket.channel(topic, chanParams);

  yield spawn(watchEventsSaga, channel, events);
  try {
    yield new Promise((resolve, reject) => {
      channel
        .join()
        .receive("ok", ({messages}) => resolve(messages))
        .receive("error", (error) => reject(error))
        .receive("timeout", () => reject({code: "timeout"}))
    });
    yield put(setChannel(channel));
    const isHandled = onReplySaga
        ? yield call(onReplySaga, "ok", topic, "join")
        : false;
    if (!isHandled) {
      yield call(globalChannelHandlers.onReply, "ok", topic, "join", {});
    }
  } catch (err) {
    const isHandled = onErrorSaga
        ? yield call(onErrorSaga, err, topic, "join")
        : false;
    if (!isHandled) {
      yield call(globalChannelHandlers.onError, err, topic, "join", {});
    }
  }
}

/**
 * Leave socket's channel
 * @generator
 * @param {string} topic - Channel's topic name
 */
export function* leaveChannelSaga(topic) {
  const channel = yield select(selectors.channel(topic));

  if (channel) {
    yield new Promise((resolve) => {
      channel
        .leave()
        .receive("ok", resolve)
    });
    yield put(removeChannel(channel));
  }
}

/**
 * Push event to socket's channel
 * @generator
 * @param {string} topic - Channel's topic name
 * @param {string} event - Event name, for example "phx_join"
 * @param {Object} [payload] - The payload, for example {user_id: 123}
 * @param {Object} [opts] - Options of push event:
 * @param {Generator} [opts.onReplySaga] - Callback saga to trigger on success response
 * @param {Generator} [opts.onErrorSaga] - Callback saga to trigger on error response
 * @param {?number} [opts.timeout] - The push timeout in milliseconds
 */
export function* pushToChannelSaga(topic, event, payload, {
  onReplySaga,
  onErrorSaga,
  timeout = null
} = {}) {
  const channel = yield select(selectors.channel(topic));

  try {
    const response = yield new Promise((resolve, reject) => {
      channel
        .push(event, payload, timeout ? timeout : channel.timeout)
        .receive("ok", resolve)
        .receive("error", (error) => reject(error))
        .receive("timeout", () => reject({code: TIMEOUT_ERROR_REASON}))
    });
    const isHandled = onReplySaga
        ? yield call(onReplySaga, response, topic, event)
        : false;
    if (!isHandled) {
      yield call(globalChannelHandlers.onReply, response, topic, event, payload);
    }
  } catch (err) {
    const isHandled = onErrorSaga
        ? yield call(onErrorSaga, err, topic, event)
        : false;
    if (!isHandled) {
      yield call(globalChannelHandlers.onError, err, topic, event, payload);
    }
  }
}
