import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { writeAgentHandoff } from "../steps/handoff";
import type { Detection } from "../types";

function detection(agents: Detection["agents"]): Detection {
    return {
        dir: "/tmp/project",
        fernProject: { exists: false },
        apiSpecs: [],
        frameworks: [],
        docsTools: [],
        agents,
        packageManager: "npm",
        hasPackageJson: false,
        pnpmWorkspaceRoot: false,
        fernCliVersion: null,
        docsSkillInstalled: false
    };
}

async function tempDir(): Promise<string> {
    return mkdtemp(path.join(os.tmpdir(), "fern-wizard-handoff-"));
}

describe("agent handoff", () => {
    it("writes the Fern skill next to the fern-docs skill for each agent", async () => {
        const claudeDir = await tempDir();
        const claude = await writeAgentHandoff(claudeDir, detection(["claude-code"]));
        expect(claude.written).toEqual([".claude/skills/fern/SKILL.md"]);
        await expect(readFile(path.join(claudeDir, ".claude/skills/fern/SKILL.md"), "utf8")).resolves.toContain(
            "name: fern"
        );

        const cursorDir = await tempDir();
        const cursor = await writeAgentHandoff(cursorDir, detection(["cursor", "codex"]));
        expect(cursor.written).toEqual([".agents/skills/fern/SKILL.md"]);

        // With no agents found, the common ones get it, the same as the fern-docs skill.
        const defaultDir = await tempDir();
        const defaults = await writeAgentHandoff(defaultDir, detection([]));
        expect(defaults.written).toEqual([".claude/skills/fern/SKILL.md", ".agents/skills/fern/SKILL.md"]);
        await expect(access(path.join(defaultDir, "AGENTS.md"))).rejects.toThrow();

        await Promise.all([claudeDir, cursorDir, defaultDir].map((dir) => rm(dir, { recursive: true, force: true })));
    });

    it("does not overwrite an existing skill", async () => {
        const dir = await tempDir();
        const target = path.join(dir, ".agents/skills/fern/SKILL.md");
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, "original");
        const result = await writeAgentHandoff(dir, detection(["cursor"]));
        expect(result.skipped).toEqual([".agents/skills/fern/SKILL.md"]);
        await expect(readFile(target, "utf8")).resolves.toBe("original");
        await rm(dir, { recursive: true, force: true });
    });
});
