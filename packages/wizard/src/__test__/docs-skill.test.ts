import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { ensureDocsSkillInSharedDirectory } from "../steps/docs-skill";

const tempDirs: string[] = [];

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("docs skill installation", () => {
    it("copies an agent-specific skill into the shared skills directory", async () => {
        const dir = await tempRepo();
        const claudeSkill = path.join(dir, ".claude", "skills", "fern-docs");
        await mkdir(claudeSkill, { recursive: true });
        await writeFile(path.join(claudeSkill, "SKILL.md"), "Claude docs skill");

        await ensureDocsSkillInSharedDirectory(dir, ["claude-code"]);

        await expect(readFile(path.join(dir, ".agents", "skills", "fern-docs", "SKILL.md"), "utf8")).resolves.toBe(
            "Claude docs skill"
        );
    });

    it("preserves an existing shared skill", async () => {
        const dir = await tempRepo();
        const claudeSkill = path.join(dir, ".claude", "skills", "fern-docs");
        const sharedSkill = path.join(dir, ".agents", "skills", "fern-docs");
        await mkdir(claudeSkill, { recursive: true });
        await mkdir(sharedSkill, { recursive: true });
        await writeFile(path.join(claudeSkill, "SKILL.md"), "Claude docs skill");
        await writeFile(path.join(sharedSkill, "SKILL.md"), "Existing shared skill");

        await ensureDocsSkillInSharedDirectory(dir, ["claude-code"]);

        await expect(readFile(path.join(sharedSkill, "SKILL.md"), "utf8")).resolves.toBe("Existing shared skill");
    });
});

async function tempRepo(): Promise<string> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-wizard-docs-skill-"));
    tempDirs.push(dir);
    return dir;
}
