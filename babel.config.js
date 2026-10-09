module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Required by @amazon-devices/react-native-w3cmedia — without the
    // automatic JSX runtime the W3C media components throw
    // "ReferenceError: Property 'React' doesn't exist" at runtime.
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    // Resolves the @sidekick/* path alias used across the app source.
    [
      'module-resolver',
      {
        root: ['./'],
        alias: { '@sidekick': './src' },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
  ],
};
