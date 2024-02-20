import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        checker({
            typescript: {
                buildMode: true
            }
        })
    ],
    server: {
        open: true
    },
    resolve: {
        alias: [
            {
                // this is required for the SCSS modules
                find: /^~(.*)$/,
                replacement: "$1"
            }
        ]
    },
    css: {
        modules: {
            generateScopedName: "[name]__[local]___[hash:base64:5]"
        }
    }
});
