import { defineWorkspace } from "vitest/config";

export default defineWorkspace(["./generators/**/vitest.config.ts", "./packages/**/vitest.config.ts"]);
