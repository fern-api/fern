import type { generatorsYml } from "@fern-api/configuration-loader";
import { isNpmGenerator } from "../sdk-preview/overrideOutputForPreview.js";

export interface PreviewGroup {
    groupName: string;
    apiName: string | null;
    generator: string;
}

/**
 * Input representing a single API workspace's generators configuration.
 * Decoupled from the full workspace type so this function is easily testable.
 */
export interface WorkspaceGeneratorsInfo {
    workspaceName: string | undefined;
    generatorsConfiguration:
        | {
              groups: generatorsYml.GeneratorGroup[];
          }
        | undefined;
}

/**
 * Discovers all previewable generator groups across workspaces.
 *
 * A generator is considered previewable when:
 * - `automation.preview` is not false in generators.yml
 * - It is a supported TypeScript/npm generator
 *
 * Returns one entry per matching generator (not per group), to support
 * groups with mixed generator types.
 */
export function listPreviewGroups({
    workspaces,
    groupFilter
}: {
    workspaces: WorkspaceGeneratorsInfo[];
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
            for (const generator of group.generators) {
                if (!generator.automation.preview) {
                    continue;
                }
                if (!isNpmGenerator(generator.name)) {
                    continue;
                }
                results.push({
                    groupName: group.groupName,
                    apiName: workspace.workspaceName ?? null,
                    generator: generator.name
                });
            }
        }
    }

    return results;
}
