# phoenix-redux-saga

Library adapter to use Phoenix.js as a saga.
Inspired by [@trixta/phoenix-to-redux](https://www.npmjs.com/package/@trixta/phoenix-to-redux)

## Known limitations

Library support only one socket at a time.

## Modules

<dl>
<dt><a href="#module_Channel">Channel</a></dt>
<dd><p>Phoenix.js Channel&#39;s adapter.</p>
</dd>
<dt><a href="#module_Socket">Socket</a></dt>
<dd><p>Phoenix.js Socket&#39;s adapter.</p>
</dd>
</dl>

<a name="module_Channel"></a>

## Channel
Phoenix.js Channel's adapter.


* [Channel](#module_Channel)
    * [.joinToChannelSaga(topic, [opts])](#module_Channel.joinToChannelSaga)
    * [.leaveChannelSaga(topic)](#module_Channel.leaveChannelSaga)
    * [.pushToChannelSaga(topic, event, [payload], [opts])](#module_Channel.pushToChannelSaga)

<a name="module_Channel.joinToChannelSaga"></a>

### Channel.joinToChannelSaga(topic, [opts])
Join to socket's channel
[Related Phoenix.js documentation.](https://hexdocs.pm/phoenix/js/index.html#channeljoin)

**Kind**: static method of [<code>Channel</code>](#module_Channel)  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>string</code> | Channel's topic name |
| [opts] | <code>Object</code> | Opts of socket's channel. |
| [opts.events] | <code>Array.&lt;Object&gt;</code> | Array of events to watch. |
| opts.events[].name | <code>string</code> | Event to listen to on current channel. |
| opts.events[].saga | <code>Generator</code> | Saga to trigger on event. |
| [opts.chanParams] | <code>Object</code> | Parameters for the channel, for example {token: roomToken}. |
| [opts.onErrorSaga] | <code>Generator</code> | Saga to trigger on error. |

<a name="module_Channel.leaveChannelSaga"></a>

### Channel.leaveChannelSaga(topic)
Leave socket's channel

**Kind**: static method of [<code>Channel</code>](#module_Channel)  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>string</code> | Channel's topic name |

<a name="module_Channel.pushToChannelSaga"></a>

### Channel.pushToChannelSaga(topic, event, [payload], [opts])
Push event to socket's channel

**Kind**: static method of [<code>Channel</code>](#module_Channel)  

| Param | Type | Description |
| --- | --- | --- |
| topic | <code>string</code> | Channel's topic name |
| event | <code>string</code> | Event name, for example "phx_join" |
| [payload] | <code>Object</code> | The payload, for example {user_id: 123} |
| [opts] | <code>Object</code> | Options of push event: |
| [opts.onReplySaga] | <code>Generator</code> | Callback saga to trigger on success response |
| [opts.onErrorSaga] | <code>Generator</code> | Callback saga to trigger on error response |
| [opts.onTimeoutSaga] | <code>Generator</code> | Callback saga to trigger on timeout |
| [opts.timeout] | <code>number</code> | The push timeout in milliseconds |

<a name="module_Socket"></a>

## Socket
Phoenix.js Socket's adapter.


* [Socket](#module_Socket)
    * [.connectToSocketSaga(endPoint, [opts])](#module_Socket.connectToSocketSaga)
    * [.disconnectSocketSaga([code], [reason])](#module_Socket.disconnectSocketSaga)

<a name="module_Socket.connectToSocketSaga"></a>

### Socket.connectToSocketSaga(endPoint, [opts])
Create socket connection saga
[Phoenix.js socket options](https://hexdocs.pm/phoenix/js/index.html#socket).

**Kind**: static method of [<code>Socket</code>](#module_Socket)  

| Param | Type | Description |
| --- | --- | --- |
| endPoint | <code>string</code> | The string WebSocket endpoint, ie, "ws://example.com/socket" , "wss://example.com" "/socket" (inherited host & protocol) |
| [opts] | <code>Object</code> | Opts on socket connection. |

<a name="module_Socket.disconnectSocketSaga"></a>

### Socket.disconnectSocketSaga([code], [reason])
Disconnect from socket saga.
[Phoenix.js disconnect socket documentation.](https://hexdocs.pm/phoenix/js/index.html#socketdisconnect)

**Kind**: static method of [<code>Socket</code>](#module_Socket)  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>integer</code> | A status code for disconnection (Optional) [See Mozilla documentation for valid status codes.](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes). |
| [reason] | <code>string</code> | A textual description of the reason to disconnect. |


## Installation

Add `...newPhoenixReducer` to your combineReducers functions;

```
import { phoenixReducer } from "@x-qdo/phoenix-redux-saga";
...

export const rootReducer = (history) => combineReducers({
    ...newPhoenixReducer,

    myOtherReducer,
    myOtherAmazingReducer,
})

```

* * *
&copy; 2021-2022 X-QDO OÜ
