const createPubSub = function () {
  const events = new Map();

  function subscribe(event, callback) {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(callback);
  }

  function publish(event, data) {
    if (events[event]) {
      events[event].forEach((callback) => {
        callback(data);
      });
    }
  }

  function unsubscribe(event, callback) {
    if (events[event]) {
      events[event] = events[event].filter((cb) => cb !== callback);
    }
  }

  function unsubscribeAll(event) {
    if (events[event]) {
      events[event] = [];
    }
  }

  return { subscribe, publish, unsubscribe, unsubscribeAll };
};

export { PubSub };
