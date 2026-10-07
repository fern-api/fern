import { describe, expect, it, vi } from "vitest";
import { defaultDocsSiteChoices, layoutFromFlag } from "../docs-site/options";
import type { Detection, WizardFlags } from "../types";
import {
    docsInitArgs,
    fernRunner,
    installCommand,
    pickDefaultSpec,
    planActions,
    shouldOfferDocsSkill,
    shouldSelectDocsSkill,
    validateFlags
} from "../wizard";

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
    fernCliVersion: null,
    docsSkillInstalled: false
};

describe("action planning", () => {
    it("plans dry-run actions without writing files", () => {
        const actions = planActions(baseDetection, flags).actions;
        expect(actions.map((action) => action.id)).toEqual([
            "install-cli",
            "init-api",
            "init-docs",
            "docs-skills",
            "agent-handoff",
            "cli-interest"
        ]);
        expect(actions.find((action) => action.id === "cli-interest")?.selectedByDefault).toBe(false);
    });

    it("plans a template docs site by default and keeps Mintlify imports on fern init", () => {
        const template = planActions(baseDetection, flags).actions.find((action) => action.id === "init-docs");
        expect(template?.title).toBe("Create a docs site from a template");
        expect(template?.description).toBe(
            "Copies Fern's docs starter into fern/ with the layout, branding, and features you pick next (same options as the dashboard onboarding)."
        );
        expect(template?.commands).toEqual([]);
        expect(template?.files).toEqual(["fern/docs.yml", "fern/docs/", "fern/styles.css"]);

        const mintlify = planActions(
            { ...baseDetection, docsTools: [{ name: "mintlify", path: "mint.json" }] },
            { ...flags, org: "acme" }
        ).actions.find((action) => action.id === "init-docs");
        expect(mintlify?.title).toBe("Import your Mintlify docs");
        expect(mintlify?.commands).toEqual(["npx -y fern-api init --mintlify mint.json --org acme"]);
    });

    it("plans the docs-writing skill only when docs are involved and it is not installed", () => {
        expect(shouldOfferDocsSkill(true, false, false)).toBe(true);
        expect(shouldOfferDocsSkill(false, true, false)).toBe(true);
        expect(shouldOfferDocsSkill(false, false, false)).toBe(false);
        expect(shouldOfferDocsSkill(true, false, true)).toBe(false);
        expect(
            planActions({ ...baseDetection, docsSkillInstalled: true }, flags).actions.map((action) => action.id)
        ).not.toContain("docs-skills");
    });

    it("reports skills installer output paths for each docs-writing skill target", () => {
        const defaultSkill = planActions(baseDetection, flags).actions.find((action) => action.id === "docs-skills");
        expect(defaultSkill?.commands).toEqual([
            "npx -y skills@1.6.0 add fern-api/skills --skill fern-docs -a claude-code cursor codex -y"
        ]);
        expect(defaultSkill?.files).toEqual([
            ".claude/skills/fern-docs/",
            ".agents/skills/fern-docs/",
            "skills-lock.json"
        ]);

        const targets: Array<{
            agent: Detection["agents"][number];
            commandTarget: string;
            files: string[];
        }> = [
            { agent: "claude-code", commandTarget: "claude-code", files: [".claude/skills/fern-docs/"] },
            { agent: "cursor", commandTarget: "cursor", files: [".agents/skills/fern-docs/"] },
            { agent: "codex", commandTarget: "codex", files: [".agents/skills/fern-docs/"] },
            { agent: "vscode", commandTarget: "github-copilot", files: [".agents/skills/fern-docs/"] },
            { agent: "windsurf", commandTarget: "windsurf", files: [".windsurf/skills/fern-docs/"] }
        ];
        for (const target of targets) {
            const skill = planActions({ ...baseDetection, agents: [target.agent] }, flags).actions.find(
                (action) => action.id === "docs-skills"
            );
            expect(skill?.commands).toEqual([
                `npx -y skills@1.6.0 add fern-api/skills --skill fern-docs -a ${target.commandTarget} -y`
            ]);
            expect(skill?.files).toEqual([...target.files, "skills-lock.json"]);
        }
    });

    it("selects the docs-writing skill only when docs setup is selected or already exists", () => {
        const actions = planActions(baseDetection, flags).actions;
        const skill = actions.filter((action) => action.id === "docs-skills");
        const initDocs = actions.filter((action) => action.id === "init-docs");

        expect(shouldSelectDocsSkill(skill, baseDetection)).toBe(false);
        expect(shouldSelectDocsSkill([...skill, ...initDocs], baseDetection)).toBe(true);
        expect(
            shouldSelectDocsSkill(skill, {
                ...baseDetection,
                fernProject: { exists: true, docsConfigExists: true }
            })
        ).toBe(true);
    });

    it("does not print notes while planning actions", () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
        const result = planActions(
            { ...baseDetection, fernProject: { exists: true }, apiSpecs: [{ path: "event.yml", format: "asyncapi" }] },
            flags
        );
        expect(result.notes).toEqual(["Existing Fern project detected at fern/ — skipping init"]);
        expect(log).not.toHaveBeenCalled();
        log.mockRestore();
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
        ).actions;
        const initApi = actions.find((action) => action.id === "init-api");
        expect(initApi?.title).toBe("Create a Fern project from your API spec");
        expect(initApi?.description).toContain("openapi.yaml");
        expect(initApi?.commands).toEqual(["fern init --openapi openapi.yaml --org acme"]);
    });

    it("plans a bare init when nothing can be imported", () => {
        const actions = planActions(
            { ...baseDetection, fernCliVersion: "1.0.0", apiSpecs: [] },
            { ...flags, org: "acme" }
        ).actions;
        expect(actions.find((action) => action.id === "init-api")?.commands).toEqual(["fern init --org acme"]);
    });

    it("shows commands through the package runner until the CLI is on PATH", () => {
        const actions = planActions({ ...baseDetection, packageManager: "pnpm" }, flags).actions;
        expect(actions.find((action) => action.id === "install-cli")?.commands).toEqual(["pnpm add -D fern-api"]);
        expect(actions.find((action) => action.id === "init-api")?.commands).toEqual([
            "pnpm exec fern init --openapi openapi.yaml --org <your-org>"
        ]);
        const global = planActions({ ...baseDetection, hasPackageJson: false }, flags).actions;
        expect(global.find((action) => action.id === "init-docs")?.commands).toEqual([]);
        expect(global.find((action) => action.id === "init-docs")?.files).toEqual([
            "fern/docs.yml",
            "fern/docs/",
            "fern/styles.css"
        ]);
    });

    it("explains coding-agent steps and lists the files they write", () => {
        const actions = planActions(
            { ...baseDetection, fernCliVersion: "1.0.0", agents: ["cursor", "claude-code"] },
            flags
        ).actions;
        expect(actions.find((action) => action.id === "agent-mcp")?.commands).toEqual([
            "fern login",
            "fern mcp install"
        ]);
        expect(actions.find((action) => action.id === "agent-handoff")?.files).toEqual([
            ".claude/skills/fern/SKILL.md",
            ".cursor/rules/fern.mdc"
        ]);
        expect(
            planActions(baseDetection, flags).actions.find((action) => action.id === "agent-handoff")?.files
        ).toEqual(["AGENTS.md"]);
    });

    it("skips API init when only a framework or a non-OpenAPI spec is found", () => {
        const fastapi = planActions(
            {
                ...baseDetection,
                apiSpecs: [],
                frameworks: [{ name: "fastapi", language: "python", canGenerateOpenApi: true }]
            },
            flags
        ).actions;
        expect(fastapi.map((action) => action.id)).not.toContain("init-api");

        const asyncapi = planActions(
            { ...baseDetection, apiSpecs: [{ path: "asyncapi.yaml", format: "asyncapi" }] },
            flags
        ).actions;
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
        expect(validateFlags(planActions(baseDetection, realRunFlags).actions, realRunFlags)).toBe(
            "--yes requires --org <name> when initializing a Fern project"
        );
        expect(
            validateFlags(planActions(baseDetection, { ...flags, dryRun: true }).actions, { ...flags, dryRun: true })
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
        expect(docsInitArgs("mint.json", "acme")).toEqual(["init", "--mintlify", "mint.json", "--org", "acme"]);
        expect(docsInitArgs("mint.json", undefined)).toEqual(["init", "--mintlify", "mint.json"]);
    });

    it("maps --template choices to layout ids", () => {
        expect(layoutFromFlag("stacked")).toBe("layout-1");
        expect(layoutFromFlag("side-by-side")).toBe("layout-2");
        expect(layoutFromFlag("minimal")).toBe("layout-3");
        expect(layoutFromFlag(undefined)).toBeUndefined();
    });

    it("uses dashboard defaults for docs site choices", () => {
        expect(defaultDocsSiteChoices("acme_team-api", "layout-3")).toEqual({
            siteTitle: "Acme Team Api",
            subdomain: "acme_team-api",
            layout: "layout-3",
            features: ["api-reference", "ask-fern", "changelog"]
        });
    });
});
