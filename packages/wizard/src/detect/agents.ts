import { access } from "fs/promises";
import path from "path";
import type { Agent } from "../types";

export async function detectAgents(dir: string, files: string[]): Promise<Agent[]> {
    const checks: Array<[Agent, string]> = [
        ["cursor", ".cursor"],
        ["claude-code", ".claude"],
        ["codex", ".codex"],
        ["vscode", ".vscode"],
        ["windsurf", ".windsurf"]
    ];
    const agents: Agent[] = [];
    for (const [agent, relativePath] of checks) {
        if (files.some((file) => file === relativePath || file.startsWith(`${relativePath}${path.sep}`))) {
            agents.push(agent);
        } else if (await exists(path.join(dir, relativePath))) {
            agents.push(agent);
        }
    }
    if ((await exists(path.join(dir, "CLAUDE.md"))) && !agents.includes("claude-code")) {
        agents.push("claude-code");
    }
    if ((await exists(path.join(dir, "AGENTS.md"))) && !agents.includes("codex")) {
        agents.push("codex");
    }
    return agents;
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
