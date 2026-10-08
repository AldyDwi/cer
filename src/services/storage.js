export const localStorageAsync = {
  getItem: async (key) => {
    return window.localStorage.getItem(key);
  },

  setItem: async (key, value) => {
    window.localStorage.setItem(key, value);
  },

  removeItem: async (key) => {
    window.localStorage.removeItem(key);
  },
};