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
        fernCliVersion: null
    };
}

async function tempDir(): Promise<string> {
    return mkdtemp(path.join(os.tmpdir(), "fern-wizard-handoff-"));
}

describe("agent handoff", () => {
    it("writes Claude, Cursor, or AGENTS handoffs", async () => {
        const claudeDir = await tempDir();
        await mkdir(path.join(claudeDir, ".claude"), { recursive: true });
        await writeAgentHandoff(claudeDir, detection(["claude-code"]));
        await expect(readFile(path.join(claudeDir, ".claude/skills/fern/SKILL.md"), "utf8")).resolves.toContain(
            "name: fern"
        );

        const cursorDir = await tempDir();
        await mkdir(path.join(cursorDir, ".cursor"), { recursive: true });
        await writeAgentHandoff(cursorDir, detection(["cursor"]));
        await expect(readFile(path.join(cursorDir, ".cursor/rules/fern.mdc"), "utf8")).resolves.toContain(
            "alwaysApply: false"
        );

        const agentsDir = await tempDir();
        await writeAgentHandoff(agentsDir, detection([]));
        await expect(readFile(path.join(agentsDir, "AGENTS.md"), "utf8")).resolves.toContain("## Fern");

        await Promise.all([
            rm(claudeDir, { recursive: true, force: true }),
            rm(cursorDir, { recursive: true, force: true }),
            rm(agentsDir, { recursive: true, force: true })
        ]);
    });

    it("does not overwrite an existing handoff", async () => {
        const dir = await tempDir();
        await mkdir(path.join(dir, ".cursor"), { recursive: true });
        const target = path.join(dir, ".cursor/rules/fern.mdc");
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, "original");
        await writeAgentHandoff(dir, detection(["cursor"]));
        await expect(readFile(target, "utf8")).resolves.toBe("original");
        await expect(access(target)).resolves.toBeUndefined();
        await rm(dir, { recursive: true, force: true });
    });
});
