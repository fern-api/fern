// biome-ignore-all lint/suspicious/noConsole: Handoff writes report progress for interactive users.
import { access, appendFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Detection } from "../types";

const HANDOFF_BODY = `# Set up and use Fern

Read https://buildwithfern.com/learn/home/get-started.md and follow it.

Fern configuration lives under \`fern/\`, including \`fern.config.json\`, \`generators.yml\`, and \`docs.yml\`.

Run \`fern check\` before committing.

For reference, consult https://buildwithfern.com/learn/llms.txt. Append \`.md\` to any \`buildwithfern.com/learn\` page URL when you need Markdown.
`;

/** Files {@link writeAgentHandoff} writes or appends to, relative to the repository. */
export function agentHandoffFiles(detection: Detection): string[] {
    const files: string[] = [];
    if (detection.agents.includes("claude-code")) {
        files.push(".claude/skills/fern/SKILL.md");
    }
    if (detection.agents.includes("cursor")) {
        files.push(".cursor/rules/fern.mdc");
    }
    return files.length > 0 ? files : ["AGENTS.md"];
}

export async function writeAgentHandoff(dir: string, detection: Detection): Promise<void> {
    if (detection.agents.includes("claude-code")) {
        await writeIfMissing(
            dir,
            path.join(dir, ".claude", "skills", "fern", "SKILL.md"),
            `---
name: fern
description: Set up and use Fern docs and SDKs
---

${HANDOFF_BODY}`
        );
    }
    if (detection.agents.includes("cursor")) {
        await writeIfMissing(
            dir,
            path.join(dir, ".cursor", "rules", "fern.mdc"),
            `---
description: Fern docs and SDK setup
alwaysApply: false
---

${HANDOFF_BODY}`
        );
    }
    if (!detection.agents.includes("claude-code") && !detection.agents.includes("cursor")) {
        const agentsPath = path.join(dir, "AGENTS.md");
        if (await exists(agentsPath)) {
            const existing = await readFile(agentsPath, "utf8");
            if (existing.includes("## Fern")) {
                console.log("AGENTS.md already exists, skipping");
            } else {
                await appendFile(agentsPath, `\n## Fern\n\n${HANDOFF_BODY}`);
                console.log("Appended Fern handoff to AGENTS.md");
            }
        } else {
            await writeIfMissing(dir, agentsPath, `## Fern\n\n${HANDOFF_BODY}`);
        }
    }
}

async function writeIfMissing(dir: string, filePath: string, contents: string): Promise<void> {
    if (await exists(filePath)) {
        console.log(`${path.relative(dir, filePath)} already exists, skipping`);
        return;
    }
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
    console.log(`Wrote ${path.relative(dir, filePath)}`);
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
