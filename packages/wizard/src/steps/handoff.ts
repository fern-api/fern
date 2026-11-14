import { access, mkdir, writeFile } from "fs/promises";
import path from "path";
import type { Agent, Detection } from "../types";

/** Who a skill is installed for, named the way the `skills` installer names them. */
export type SkillTarget = Exclude<Agent, "vscode"> | "github-copilot";

/**
 * Where each coding agent reads project skills, relative to the repository. The Fern skill goes here
 * too, next to the fern-docs skill, so all of Fern's agent instructions live in one place.
 */
export const SKILL_DIRECTORIES: Record<SkillTarget, string> = {
    "claude-code": ".claude/skills",
    cursor: ".agents/skills",
    codex: ".agents/skills",
    "github-copilot": ".agents/skills",
    windsurf: ".windsurf/skills"
};

export const SKILL_TARGET_NAMES: Record<SkillTarget, string> = {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    codex: "Codex",
    "github-copilot": "GitHub Copilot",
    windsurf: "Windsurf"
};

/** The agents to install skills for: the ones found in the repository, or the common ones when none are. */
export function skillTargets(detection: Detection): SkillTarget[] {
    const targets: SkillTarget[] =
        detection.agents.length === 0
            ? ["claude-code", "cursor", "codex"]
            : detection.agents.map((agent) => (agent === "vscode" ? "github-copilot" : agent));
    return [...new Set(targets)];
}

const FERN_SKILL = `---
name: fern
description: Set up and use Fern for API docs and SDKs. Use when working with the fern/ folder, fern.config.json, sdk-config.yml, generators.yml, docs.yml, or the fern CLI.
---

# Set up and use Fern

Read https://buildwithfern.com/learn/home/get-started.md and follow it.

Fern configuration lives under \`fern/\`, including \`fern.config.json\`, \`sdk-config.yml\` (or \`generators.yml\`), and \`docs.yml\`.

Run \`fern check\` before committing.

For reference, consult https://buildwithfern.com/learn/llms.txt. Append \`.md\` to any \`buildwithfern.com/learn\` page URL when you need Markdown.
`;

/** Files {@link writeAgentHandoff} writes, relative to the repository. */
export function agentHandoffFiles(detection: Detection): string[] {
    return [...new Set(skillTargets(detection).map((target) => `${SKILL_DIRECTORIES[target]}/fern/SKILL.md`))];
}

export interface HandoffResult {
    /** Files created, relative to the repository. */
    written: string[];
    /** Files left alone because they already exist. */
    skipped: string[];
}

/** Adds the Fern skill for the repository's coding agents, leaving any existing copy alone. */
export async function writeAgentHandoff(dir: string, detection: Detection): Promise<HandoffResult> {
    const result: HandoffResult = { written: [], skipped: [] };
    for (const file of agentHandoffFiles(detection)) {
        await writeIfMissing(dir, path.join(dir, file), FERN_SKILL, result);
    }
    return result;
}

async function writeIfMissing(dir: string, filePath: string, contents: string, result: HandoffResult): Promise<void> {
    const relativePath = path.relative(dir, filePath);
    if (await exists(filePath)) {
        result.skipped.push(relativePath);
        return;
    }
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
    result.written.push(relativePath);
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
