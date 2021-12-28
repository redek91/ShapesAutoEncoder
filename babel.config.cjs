module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env", {
        useBuiltIns: "usage",
        corejs: 3,
        debug: true
      }
    ]
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties"
  ]
}