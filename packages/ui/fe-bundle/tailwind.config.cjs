const path = require("path");

module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        path.join(path.dirname(require.resolve("@fern-api/ui")), "**/*.js"),
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
