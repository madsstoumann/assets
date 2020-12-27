/**
 * fetch22
 * @module /fetch22.mjs
 * @version 0.9.5
 * @author Mads Stoumann
 * @description Wrapper for fetch with timeout, custom error-, parser- and start/stop-callbacks.
 */

/**
 * Extends Error Object with FetchError, including http-status-code and full response
 * @module FetchError
 */
class FetchError extends Error {
  constructor(message, response) {
    super(message);
    this.name = 'FetchError';
    this.message = message;
    this.response = response;
    this.status = response.status;
  }
}

/**
 * @function fetch22
 * @param {String} url
 * @param {Object} options
 * @description Wrapper for fetch with default options and custom callbacks
 */
export default function fetch22(url, options) {
  const settings = Object.assign(
    {
      errorHandler: error => { return console.error(`%c ${error.name} %c ${error.message} %c ${error.status} `, "background:#333333 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#e60032 ; padding: 1px; color: #fff", "background:#ccc ; padding: 1px; border-radius: 0 3px 3px 0;  color: #222")},
      errorList: [],
      parser: setResponse,
      parserArgs: [],
      callback: bool => {return bool},
      timeout: 9999
    },
    options
  );

  /* Clean up settings before fetch() */
  const errorHandler = settings.errorHandler;
  delete settings.errorHandler;

  const errorList = Array.isArray(settings.errorList) ? settings.errorList : [];
  delete settings.errorList;

  const parser = settings.parser;
  delete settings.parser;

  const parserArgs = settings.parserArgs;
  delete settings.parserArgs;

  const callback = settings.callback;
  delete settings.callback;

  const timeout = settings.timeout;
  delete settings.timeout;

  Object.entries(settings).forEach(([key, value]) => {
    if (!value) {
      delete settings[key];
    }
  });

  /* Set callback */
  callback(true);

  /* Handle timeout / AbortController */
  if ('AbortController' in window) {
    const controller = new AbortController();
    const signal = controller.signal;
    settings.signal = signal;
    setTimeout(() => {return controller.abort()}, timeout);
  }

  return fetch(url, settings)
    .then(response => {return handleErrors(response, errorList)})
    .then(response => {return parser(response, ...parserArgs)})
    .then(result => {return result})
    .catch(error => {
      if (error.name === 'AbortError') {
        errorHandler({
          name: 'FetchError',
          message: `Timeout after ${timeout} milliseconds.`,
          response: '',
          status: 524
        });
      } else {
        errorHandler(error);
      }
    })
    .finally(() => {
      callback(false);
    });
}

/**
 * @function handleErrors
 * @param {Object} response Response Object from fetch()
 * @param {Array} [errorList] Optional array of status-codes, that will trigger an error
 * @description Throws a new ApiError if response !== ok
 */
function handleErrors(response, errorList = []) {
  if (!response.ok || errorList.includes(response.status)) {
    throw new FetchError(response.statusText, response);
  }
  return response;
}

/**
 * @function setResponse
 * @param {Object} response Response Object from fetch()
 * @description Depending on contentType, returns json or text
 */
function setResponse(response) {
  const contentType = response.headers.get('content-type');
  return contentType.includes('application/json')
    ? response.json()
    : response.text();
}
