import type { TaskContext } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { logFdrWarnings } from "../fdrWarnings.js";

function createContext() {
    const warn = vi.fn();
    return { context: { logger: { warn } } as unknown as TaskContext, warn };
}

describe("logFdrWarnings", () => {
    it("prints every warning FDR returns", () => {
        const { context, warn } = createContext();
        logFdrWarnings({ deploymentHash: "abc", warnings: ["docs.acme.com points to Vercel", "second"] }, context);
        expect(warn.mock.calls).toEqual([["docs.acme.com points to Vercel"], ["second"]]);
    });

    it("ignores responses from an FDR that does not send warnings", () => {
        const { context, warn } = createContext();
        logFdrWarnings({ deploymentHash: "abc", missingContent: [] }, context);
        logFdrWarnings(undefined, context);
        expect(warn).not.toHaveBeenCalled();
    });

    it("skips malformed entries", () => {
        const { context, warn } = createContext();
        logFdrWarnings({ warnings: "not an array" }, context);
        logFdrWarnings({ warnings: [42, "", "  ", "kept"] }, context);
        expect(warn.mock.calls).toEqual([["kept"]]);
    });
});
