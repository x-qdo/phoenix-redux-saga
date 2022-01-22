export const TIMEOUT_ERROR_REASON = "timeout";

export function* defaultErrorHandlerSaga(error, topic) {
  console.error(error, topic);
}

export function* defaultResponseHandlerSaga(response) {
  console.log("phoenix reply", response);
}

export function* defaultTimeoutHandlerSaga(error, topic) {
  console.log("phoenix timeout", error, topic);
}
