import { describe, expect, it } from "vitest";

import { packageManagerCommands } from "../packageManagerCommands";

describe("packageManagerCommands", () => {
    it("returns pnpm-prefixed install/build/test commands when packageManager is pnpm", () => {
        expect(packageManagerCommands("pnpm")).toEqual({
            install: "pnpm install",
            frozenInstall: "pnpm install --frozen-lockfile",
            build: "pnpm build",
            test: "pnpm test"
        });
    });

    it("returns yarn-prefixed install/build/test commands when packageManager is yarn", () => {
        expect(packageManagerCommands("yarn")).toEqual({
            install: "yarn install",
            frozenInstall: "yarn install --frozen-lockfile",
            build: "yarn build",
            test: "yarn test"
        });
    });
});
