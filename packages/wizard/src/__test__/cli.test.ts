import { describe, expect, it } from "vitest";
import type { Detection, WizardFlags } from "../types";
import { fernRunner, installCommand, planActions, validateFlags } from "../wizard";

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
    hasPackageJson: true,
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

    it("rejects --yes initialization without an organization", () => {
        const realRunFlags = { ...flags, dryRun: false };
        expect(validateFlags(planActions(baseDetection, realRunFlags), realRunFlags)).toBe(
            "--yes requires --org <name> when initializing a Fern project"
        );
        expect(
            validateFlags(planActions(baseDetection, { ...flags, dryRun: true }), { ...flags, dryRun: true })
        ).toBeUndefined();
    });

    it("uses global installation without package.json and package-manager runners otherwise", () => {
        expect(installCommand({ ...baseDetection, hasPackageJson: false })).toEqual({
            executable: "npm",
            args: ["install", "-g", "fern-api"]
        });
        expect(fernRunner({ ...baseDetection, packageManager: "pnpm" })).toEqual({
            executable: "pnpm",
            args: ["exec", "fern"]
        });
        expect(fernRunner({ ...baseDetection, packageManager: "yarn" })).toEqual({
            executable: "yarn",
            args: ["fern"]
        });
        expect(fernRunner({ ...baseDetection, packageManager: "bun" })).toEqual({
            executable: "bunx",
            args: ["fern-api"]
        });
    });
});
