import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { shouldSkipGenerator } from "../generate/shouldSkipGenerator.js";

/**
 * Builds CLI command strings for each generator eligible for automated generation.
 *
 * A generator is eligible when `shouldSkipGenerator` returns false (i.e., it has
 * `automation.generate` enabled, non-local output, and autorelease not disabled).
 *
 * Each returned string is a ready-to-run `fern automations generate` command that
 * the `fern-generate` GitHub Action fans out as a matrix job.
 */
export function listGenerateCommands({
    workspaces,
    groupFilter,
    version,
    autoMerge
}: {
    workspaces: Pick<AbstractAPIWorkspace<unknown>, "workspaceName" | "generatorsConfiguration">[];
    groupFilter: string | undefined;
    version: string | undefined;
    autoMerge: boolean;
}): string[] {
    const commands: string[] = [];

    for (const workspace of workspaces) {
        const generatorsConfiguration = workspace.generatorsConfiguration;
        const groups = generatorsConfiguration?.groups ?? [];
        const rootAutorelease = generatorsConfiguration?.rawConfiguration.autorelease;
        for (const group of groups) {
            if (groupFilter != null && group.groupName !== groupFilter) {
                continue;
            }
            for (let i = 0; i < group.generators.length; i++) {
                const generator = group.generators[i];
                if (generator == null || shouldSkipGenerator({ generator, rootAutorelease })) {
                    continue;
                }

                const parts = ["fern", "automations", "generate"];
                if (workspace.workspaceName != null) {
                    parts.push("--api", workspace.workspaceName);
                }
                parts.push("--group", group.groupName);
                parts.push("--generator", String(i));
                if (version != null) {
                    parts.push("--version", version);
                }
                if (autoMerge) {
                    parts.push("--auto-merge");
                }
                commands.push(parts.join(" "));
            }
        }
    }

    return commands;
}
