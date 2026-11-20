import { describe, expect, it } from "vitest";

import { cliCommandFor } from "../runInitWizard.js";

describe("cliCommandFor", () => {
    it("reruns a Node script through Node", () => {
        expect(cliCommandFor("/usr/bin/node", "/lib/node_modules/fern-api/cli.cjs")).toEqual({
            executable: "/usr/bin/node",
            args: ["/lib/node_modules/fern-api/cli.cjs"]
        });
    });

    it("reruns a packaged binary on its own", () => {
        expect(cliCommandFor("/usr/local/bin/fern", "/usr/local/bin/fern")).toEqual({
            executable: "/usr/local/bin/fern",
            args: []
        });
        expect(cliCommandFor("/usr/local/bin/fern", undefined)).toEqual({
            executable: "/usr/local/bin/fern",
            args: []
        });
    });
});
