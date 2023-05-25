const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        path.join(path.dirname(require.resolve("@fern-api/ui")), "../src/**/*.{ts,tsx}"),
    ],
    theme: {
        extend: {},
        colors: ({ colors }) => {
            return {
                ...colors,
                accentPrimary: "rgb(var(--accent-primary))",
                accentHighlight: "rgba(var(--accent-primary), 10%)",
            };
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
