const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        path.join(path.dirname(require.resolve("@fern-api/ui")), "../src/**/*.{ts,tsx}"),
    ],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/typography")],
};
