/**
 * Phoenix.js Channel's adapter.
 * @module Channel
 */

import { eventChannel } from "redux-saga";
import { call, fork, put, select, spawn, take } from "redux-saga/effects";

import { removeChannel, selectors, setChannel } from "./phoenixSlice";
import {
  defaultErrorHandlerSaga,
  defaultResponseHandlerSaga,
  defaultTimeoutHandlerSaga,
  TIMEOUT_ERROR_REASON
} from "./defaultErrorHandlers";

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
      console.error(err)
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
 */
export function* joinToChannelSaga(topic, opts = {}) {
  const {events = [], chanParams = {}, onErrorSaga = defaultErrorHandlerSaga} = opts;
  const socket = yield select(selectors.socket());
  const channel = socket.channel(topic, chanParams);

  yield spawn(watchEventsSaga, channel, events);
  try {
    yield new Promise((resolve, reject) => {
      channel
        .join()
        .receive("ok", ({messages}) => resolve(messages))
        .receive("error", ({reason}) => reject(reason))
        .receive("timeout", () => reject({reason: "timeout"}))
    });
    yield put(setChannel(channel));
  } catch (err) {
    yield call(onErrorSaga, err, topic)
  }
}

/**
 * Leave socket's channel
 * @generator
 * @param {string} topic - Channel's topic name
 */
export function* leaveChannelSaga(topic) {
  const channel = yield select(selectors.channel(topic));

  yield new Promise((resolve, reject) => {
    channel
      .leave()
      .receive("ok", resolve)
  });
  yield put(removeChannel(channel));
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
 * @param {Generator} [opts.onTimeoutSaga] - Callback saga to trigger on timeout
 * @param {?number} [opts.timeout] - The push timeout in milliseconds
 */
export function* pushToChannelSaga(topic, event, payload, {
  onReplySaga = defaultResponseHandlerSaga,
  onErrorSaga = defaultErrorHandlerSaga,
  onTimeoutSaga = defaultTimeoutHandlerSaga,
  timeout = null
} = {}) {
  const channel = yield select(selectors.channel(topic));

  try {
    const response = yield new Promise((resolve, reject) => {
      channel
        .push(event, payload, timeout ? timeout : channel.timeout)
        .receive("ok", resolve)
        .receive("error", ({reason}) => reject(reason))
        .receive("timeout", () => reject({reason: TIMEOUT_ERROR_REASON}))
    });
    yield call(onReplySaga, response);
  } catch (err) {
    if (err?.reason === TIMEOUT_ERROR_REASON) {
      yield call(onTimeoutSaga, err, topic)
    } else {
      yield call(onErrorSaga, err, topic)
    }
  }
}
