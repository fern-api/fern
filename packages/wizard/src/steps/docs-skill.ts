import { access, cp, mkdir } from "fs/promises";
import path from "path";

const AGENT_SKILL_DIRECTORIES = new Map<string, string>([
    ["claude-code", ".claude/skills"],
    ["windsurf", ".windsurf/skills"]
]);

export async function ensureDocsSkillInSharedDirectory(dir: string, agents: string[]): Promise<void> {
    const sharedSkillDirectory = path.join(dir, ".agents", "skills", "fern-docs");
    if (await fileExists(path.join(sharedSkillDirectory, "SKILL.md"))) {
        return;
    }

    for (const agent of agents) {
        const agentSkillDirectory = AGENT_SKILL_DIRECTORIES.get(agent);
        if (agentSkillDirectory === undefined) {
            continue;
        }
        const installedSkillDirectory = path.join(dir, agentSkillDirectory, "fern-docs");
        if (!(await fileExists(path.join(installedSkillDirectory, "SKILL.md")))) {
            continue;
        }
        await mkdir(path.dirname(sharedSkillDirectory), { recursive: true });
        await cp(installedSkillDirectory, sharedSkillDirectory, { recursive: true, force: false });
        return;
    }

    throw new Error("Fern docs skill was not installed in the repository.");
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
