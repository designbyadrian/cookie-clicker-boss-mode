module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-prefix-selector": {
      prefix: "#boss-mode-overlay",
      transform(prefix, selector, prefixedSelector) {
        // Do not prefix keyframes or root
        if (/^html\b|^body\b/.test(selector)) {
          return selector.replace(/^html\b/, prefix).replace(/^body\b/, prefix);
        }
        return prefixedSelector;
      },
    },
  },
};
