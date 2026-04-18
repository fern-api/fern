import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { isNpmGenerator } from "../sdk-preview/overrideOutputForPreview.js";

export interface PreviewGroup {
    groupName: string;
    apiName: string | null;
    generator: string;
}

/**
 * Discovers all previewable generator groups across workspaces.
 *
 * A generator is considered previewable when:
 * - `automation.preview` is not false in generators.yml
 * - It is a supported TypeScript/npm generator (fern-typescript-sdk, node-sdk, browser-sdk)
 *
 * Returns one entry per unique (groupName, apiName) pair. When a group
 * contains multiple matching generators, the first match is used for the
 * `generator` field. This avoids duplicate `fern sdk preview --group` calls
 * when the consuming action fans out by group.
 */
export function listPreviewGroups({
    workspaces,
    groupFilter
}: {
    workspaces: Pick<AbstractAPIWorkspace<unknown>, "workspaceName" | "generatorsConfiguration">[];
    groupFilter: string | undefined;
}): PreviewGroup[] {
    const results: PreviewGroup[] = [];

    for (const workspace of workspaces) {
        const generatorsConfiguration = workspace.generatorsConfiguration;
        if (generatorsConfiguration == null) {
            continue;
        }
        for (const group of generatorsConfiguration.groups) {
            if (groupFilter != null && group.groupName !== groupFilter) {
                continue;
            }
            // Find the first previewable generator in the group.
            // One entry per (groupName, apiName) — the action calls
            // `fern sdk preview --group <name>` which processes all
            // generators in the group, so we only need to know *that*
            // the group is previewable, not list every generator.
            const firstPreviewable = group.generators.find(
                (generator) => generator.automation.preview && isNpmGenerator(generator.name)
            );
            if (firstPreviewable != null) {
                results.push({
                    groupName: group.groupName,
                    apiName: workspace.workspaceName ?? null,
                    generator: firstPreviewable.name
                });
            }
        }
    }

    return results;
}
