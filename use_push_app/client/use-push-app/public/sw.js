self.addEventListener('push', function(e) {
  try {
    const data = e.data.json();
    const { title = 'New incoming message', message } = data;

    const promiseChain = self.registration.showNotification(title, {
      body: message
    });
    e.waitUntil(promiseChain);

  } catch (err) {
    console.error(err);
    throw err;
  }
});
