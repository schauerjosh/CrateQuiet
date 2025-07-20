
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Adds support for `.bin` files under `android/app/src/main/assets/custom`
  'bin',
  'wav',
  'mp3',
  'm4a'
);

module.exports = config;
