/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

declare global {
  interface WorkerGlobalScope {
    __WB_MANIFEST: Array<any | string>;
  }
}

declare const self: ServiceWorkerGlobalScope;
/* eslint-disable no-restricted-globals */
const ignored = self.__WB_MANIFEST;

// Any other custom service worker logic can go here.

console.log("CUSTOM SERVICE WORKER REGISTERED");
// export something
export const a = "webpack please dont cry";

self.addEventListener('push', function(e) {
  try {
    const promiseChain = self.registration.showNotification('Hello, World.');
    e.waitUntil(promiseChain);

  } catch (err) {
    console.error(err);
    throw err;
  }
});
