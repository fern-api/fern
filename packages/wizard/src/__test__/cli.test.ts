import { describe, expect, it } from "vitest";
import type { Detection, WizardFlags } from "../types";
import { planActions } from "../wizard";

const flags: WizardFlags = {
    dir: "/tmp/project",
    yes: true,
    dryRun: true,
    skipInstall: false
};

const baseDetection: Detection = {
    dir: "/tmp/project",
    fernProject: { exists: false },
    apiSpecs: [{ path: "openapi.yaml", format: "openapi" }],
    frameworks: [],
    docsTools: [],
    agents: [],
    packageManager: "npm",
    fernCliVersion: null
};

describe("action planning", () => {
    it("plans dry-run actions without writing files", () => {
        const actions = planActions(baseDetection, flags);
        expect(actions.map((action) => action.id)).toEqual([
            "install-cli",
            "init-api",
            "init-docs",
            "agent-handoff",
            "cli-interest"
        ]);
        expect(actions.find((action) => action.id === "cli-interest")?.selectedByDefault).toBe(false);
    });
});
