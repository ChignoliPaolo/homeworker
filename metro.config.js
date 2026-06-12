// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// `markdown-it` (used by react-native-markdown-display) imports Node's
// deprecated built-in `punycode`, which doesn't exist in React Native. Point it
// at the userland `punycode` package instead so Metro can resolve it.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  punycode: require.resolve('punycode/'),
};

module.exports = config;
