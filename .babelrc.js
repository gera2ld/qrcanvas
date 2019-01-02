module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', {
      modules: false,
      exclude: [
        'transform-typeof-symbol',
      ],
    }],
  ],
  plugins: [
    // stage-2
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',

    // stage-3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-json-strings',

    ['module-resolver', {
      alias: {
        '#': './src',
      },
    }],
  ].filter(Boolean),
};
