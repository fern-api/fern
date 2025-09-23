import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/cli.ts"],
    format: "cjs",
    sourcemap: true
});
