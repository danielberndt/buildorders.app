const {getBabelLoader} = require("customize-cra");

module.exports = function override(config, env) {
  const loader = getBabelLoader(config);
  loader.options.presets.push(require.resolve("@emotion/babel-preset-css-prop"));
  return config;
};
