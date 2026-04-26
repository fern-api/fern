import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";
import { describe, expect, it } from "vitest";

import { resolvePosthogCommandLabel } from "../resolvePosthogCommandLabel.js";

describe("resolvePosthogCommandLabel", () => {
    it("returns 'fern generate' when automation is undefined", () => {
        expect(resolvePosthogCommandLabel(undefined)).toBe("fern generate");
    });

    it("returns 'fern automations generate' when automation is set", () => {
        const automation: AutomationRunOptions = {
            recorder: {
                recordSuccess: () => undefined,
                recordFailure: () => undefined,
                recordSkipped: () => undefined
            }
        };
        expect(resolvePosthogCommandLabel(automation)).toBe("fern automations generate");
    });
});
