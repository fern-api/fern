/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../app/src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {},
        colors: ({ colors }) => {
            return {
                accentPrimary: withOpacity("--accent-primary"),
                accentHighlight: "rgba(var(--accent-primary), 10%)",
                background: "#111418",
                "gray-light": colors.neutral[600],
                "gray-medium": colors.neutral[700],
                "gray-dark": colors.neutral[800],
                border: colors.neutral[700],
                "text-default": colors.neutral[400],
                "text-muted": colors.neutral[600],
            };
        },
    },
    plugins: [require("@tailwindcss/typography")],
};

// https://stackoverflow.com/a/72831219/4238485
function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`;
        }
        return `rgb(var(${variableName}))`;
    };
}
