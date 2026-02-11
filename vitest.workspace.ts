import { defineWorkspace } from "vitest/config";

const workspace: ReturnType<typeof defineWorkspace> = defineWorkspace([
    "./generators/**/vitest.config.ts",
    "./packages/**/vitest.config.ts"
]);
export default workspace;
