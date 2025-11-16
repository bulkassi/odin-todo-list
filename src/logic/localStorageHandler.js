const createLocalStorageHandler = function () {
  const type = "localStorage";

  function isAvailable() {
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }

  function getItem(itemKey) {
    if (isAvailable()) {
      const item = localStorage.getItem(itemKey);
      if (item) {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
    }
    return {};
  }

  function getItems() {
    if (isAvailable()) {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            items[key] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            items[key] = localStorage.getItem(key);
          }
        }
      }
      return items;
    }
    return {};
  }

  function populate(dataItemsMap) {
    if (isAvailable()) {
      for (const [key, item] of Object.entries(dataItemsMap)) {
        localStorage.setItem(key, JSON.stringify(item));
      }
    }
  }

  function removeItem(itemKey) {
    if (isAvailable()) {
      localStorage.removeItem(itemKey);
    }
  }

  function clear() {
    if (isAvailable()) {
      localStorage.clear();
    }
  }

  return {
    getItem,
    getItems,
    populate,
    removeItem,
    clear,
  };
};

export { createLocalStorageHandler };
