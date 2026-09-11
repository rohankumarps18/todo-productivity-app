/* eslint-env jest */
// The package's `exports` map doesn't expose the shipped mock file at a
// path Jest's resolver can reach, so we inline the same shape ourselves:
// an in-memory Map backing the same methods the real module exposes
// (getItem/setItem/removeItem/getMany/setMany/removeMany/getAllKeys/clear).
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
    getMany: async (keys) =>
      keys.reduce((result, key) => {
        result[key] = store.get(key) ?? null;
        return result;
      }, {}),
    setMany: async (entries) => {
      for (const [key, value] of Object.entries(entries)) {
        store.set(key, value);
      }
    },
    removeMany: async (keys) => {
      for (const key of keys) {
        store.delete(key);
      }
    },
    getAllKeys: async () => Array.from(store.keys()),
    clear: async () => {
      store.clear();
    },
  };
});
