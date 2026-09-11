module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // @react-navigation (and its screens/safe-area-context peers) ship ESM in
  // node_modules, which the default preset ignores transforming. Without
  // this, Jest chokes on their `export` syntax.
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context)',
  ],
};
