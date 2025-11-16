const createPubSub = function () {
  const events = new Map();

  function subscribe(event, callback) {
    if (!events.has(event)) {
      events.set(event, []);
    }
    events.get(event).push(callback);
  }

  function publish(event, data) {
    if (events.has(event)) {
      events.get(event).forEach((callback) => {
        callback(data);
      });
    }
  }

  function unsubscribe(event, callback) {
    if (events.has(event)) {
      events.set(
        event,
        events.get(event).filter((cb) => cb !== callback)
      );
    }
  }

  function unsubscribeAll(event) {
    if (events.has(event)) {
      events.set(event, []);
    }
  }

  return { subscribe, publish, unsubscribe, unsubscribeAll };
};

export { createPubSub };
