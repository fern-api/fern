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
        extend: {
            fontSize: {
                base: ["0.9575rem", { lineHeight: "1.3rem" }],
            },
            listStyleImage: {
                dash: 'url("/dash.svg")',
            },
            minWidth: {
                sm: "24rem",
                md: "28rem",
                lg: "32rem",
                xl: "36rem",
            },
        },
        colors: ({ colors }) => {
            return {
                ...colors,
                accentPrimary: withOpacity("--accent-primary"),
                accentHighlight: "rgba(var(--accent-primary), 10%)",
                background: "#111418",
                "gray-light": colors.neutral[600],
                "gray-medium": colors.neutral[700],
                "gray-dark": colors.neutral[800],
                border: colors.neutral[700],
                "border-concealed": colors.neutral[800],
                "text-stark": colors.neutral[200],
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
