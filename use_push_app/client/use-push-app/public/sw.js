self.addEventListener('push', function(e) {
  try {
    const promiseChain = self.registration.showNotification('Hello, World.');
    e.waitUntil(promiseChain);

  } catch (err) {
    console.error(err);
    throw err;
  }
});
