export const TIMEOUT_ERROR_REASON = "timeout";

function* defaultErrorHandlerSaga(error, topic, payload) {
    console.error(error, topic, payload);
}

function* defaultResponseHandlerSaga(response) {
    console.log("phoenix reply", response);
}

class GlobalChannelHandlers {
    constructor() {
        this.onError = defaultErrorHandlerSaga;
        this.onReply = defaultResponseHandlerSaga;
    }

    setHandlers(globalHandlers) {
        this.onError = globalHandlers?.onErrorSaga || this.onError;
        this.onReply = globalHandlers?.onReplySaga || this.onReply;
        this.onTimeout = globalHandlers?.onTimeoutSaga || this.onTimeout;
    }
}

export const globalChannelHandlers = new GlobalChannelHandlers();
