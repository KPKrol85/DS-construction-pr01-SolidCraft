module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
        "color-mix": true,
      },
    },
    autoprefixer: {},
    cssnano: {
      preset: ["default", { discardComments: { removeAll: true } }],
    },
  },
};
