import { describe, expect, it } from "vitest";
import type { Detection, WizardFlags } from "../types";
import { docsInitArgs, fernRunner, installCommand, pickDefaultSpec, planActions, validateFlags } from "../wizard";

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
    pnpmWorkspaceRoot: false,
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

    it("plans API init with the detected OpenAPI spec", () => {
        const actions = planActions(
            {
                ...baseDetection,
                fernCliVersion: "1.0.0",
                apiSpecs: [
                    { path: "proto/user.proto", format: "protobuf" },
                    { path: "openapi.yaml", format: "openapi" }
                ]
            },
            { ...flags, org: "acme" }
        );
        const initApi = actions.find((action) => action.id === "init-api");
        expect(initApi?.title).toBe("Create a Fern project from your API spec");
        expect(initApi?.description).toContain("openapi.yaml");
        expect(initApi?.commands).toEqual(["fern init --openapi openapi.yaml --org acme"]);
    });

    it("plans a bare init when nothing can be imported", () => {
        const actions = planActions(
            { ...baseDetection, fernCliVersion: "1.0.0", apiSpecs: [] },
            { ...flags, org: "acme" }
        );
        expect(actions.find((action) => action.id === "init-api")?.commands).toEqual(["fern init --org acme"]);
    });

    it("shows commands through the package runner until the CLI is on PATH", () => {
        const actions = planActions({ ...baseDetection, packageManager: "pnpm" }, flags);
        expect(actions.find((action) => action.id === "install-cli")?.commands).toEqual(["pnpm add -D fern-api"]);
        expect(actions.find((action) => action.id === "init-api")?.commands).toEqual([
            "pnpm exec fern init --openapi openapi.yaml --org <your-org>"
        ]);
        const global = planActions({ ...baseDetection, hasPackageJson: false }, flags);
        expect(global.find((action) => action.id === "init-docs")?.commands).toEqual([
            "fern init --docs --org <your-org>"
        ]);
    });

    it("explains coding-agent steps and lists the files they write", () => {
        const actions = planActions(
            { ...baseDetection, fernCliVersion: "1.0.0", agents: ["cursor", "claude-code"] },
            flags
        );
        expect(actions.find((action) => action.id === "agent-mcp")?.commands).toEqual([
            "fern login",
            "fern mcp install"
        ]);
        expect(actions.find((action) => action.id === "agent-handoff")?.files).toEqual([
            ".claude/skills/fern/SKILL.md",
            ".cursor/rules/fern.mdc"
        ]);
        expect(planActions(baseDetection, flags).find((action) => action.id === "agent-handoff")?.files).toEqual([
            "AGENTS.md"
        ]);
    });

    it("skips API init when only a framework or a non-OpenAPI spec is found", () => {
        const fastapi = planActions(
            {
                ...baseDetection,
                apiSpecs: [],
                frameworks: [{ name: "fastapi", language: "python", canGenerateOpenApi: true }]
            },
            flags
        );
        expect(fastapi.map((action) => action.id)).not.toContain("init-api");

        const asyncapi = planActions(
            { ...baseDetection, apiSpecs: [{ path: "asyncapi.yaml", format: "asyncapi" }] },
            flags
        );
        expect(asyncapi.map((action) => action.id)).not.toContain("init-api");
    });

    it("installs at the pnpm workspace root with -w", () => {
        expect(installCommand({ ...baseDetection, packageManager: "pnpm", pnpmWorkspaceRoot: true })).toEqual({
            executable: "pnpm",
            args: ["add", "-D", "-w", "fern-api"]
        });
        expect(installCommand({ ...baseDetection, packageManager: "pnpm" })).toEqual({
            executable: "pnpm",
            args: ["add", "-D", "fern-api"]
        });
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

    it("prefers OpenAPI specs for non-interactive initialization", () => {
        const specs = [
            { path: "events.yml", format: "asyncapi" as const },
            { path: "api.json", format: "openapi" as const }
        ];
        expect(pickDefaultSpec(specs)).toEqual(specs[1]);
        expect(pickDefaultSpec([])).toBeUndefined();
    });

    it("uses Mintlify initialization instead of combining docs flags", () => {
        expect(
            docsInitArgs({ ...baseDetection, docsTools: [{ name: "mintlify", path: "mint.json" }] }, "acme")
        ).toEqual(["init", "--mintlify", "mint.json", "--org", "acme"]);
        expect(docsInitArgs(baseDetection, "acme")).toEqual(["init", "--docs", "--org", "acme"]);
        expect(
            docsInitArgs({ ...baseDetection, docsTools: [{ name: "mintlify", path: "docs/docs.json" }] }, "acme")
        ).toEqual(["init", "--docs", "--org", "acme"]);
    });
});
