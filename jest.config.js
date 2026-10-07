module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@react-native-firebase|@react-native-vector-icons|@rneui|react-native-.*|@notifee|@invertase|galio-framework|redux-persist|react-redux|@reduxjs|redux|immer|reselect)/)',
  ],
  moduleNameMapper: {
    '\\.(png|jpe?g|gif|webp|ttf|otf)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
