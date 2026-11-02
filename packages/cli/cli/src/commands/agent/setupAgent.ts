import { detectRepository, docsSkillCommand, runCommandQuietly, writeAgentHandoff } from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";
import { installMcpServer } from "../mcp/installMcpServer.js";

/**
 * `fern agent setup`: teaches the repository's coding agents about Fern. Writes Fern instructions for
 * Claude Code, Cursor, or AGENTS.md (leaving existing ones alone), adds the fern-docs skill when there's a
 * docs site, and with `mcp`, connects Fern's MCP server.
 */
export async function setupAgent({
    cliContext,
    organization,
    mcp,
    skipSkill
}: {
    cliContext: CliContext;
    organization: string | undefined;
    mcp: boolean;
    skipSkill: boolean;
}): Promise<void> {
    const dir = process.cwd();
    const detection = await detectRepository(dir, { fernCliVersion: cliContext.environment.packageVersion });

    const handoff = await writeAgentHandoff(dir, detection);
    for (const file of handoff.written) {
        cliContext.logger.info(`Wrote Fern instructions to ${file}.`);
    }
    for (const file of handoff.skipped) {
        cliContext.logger.info(`${file} already has Fern instructions.`);
    }

    if (!skipSkill) {
        if (detection.docsSkillInstalled) {
            cliContext.logger.info("The fern-docs skill is already installed.");
        } else if (detection.fernProject.docsConfigExists !== true) {
            cliContext.logger.info("Skipped the fern-docs skill: there's no docs site here yet (fern/docs.yml).");
        } else {
            cliContext.logger.info("Adding the fern-docs skill...");
            await runCommandQuietly(docsSkillCommand(detection), dir);
            cliContext.logger.info("Added the fern-docs skill, so your agent follows Fern's docs conventions.");
        }
    }

    if (mcp) {
        await cliContext.runTask((context) => installMcpServer({ clients: undefined, organization, context }));
    }
}
