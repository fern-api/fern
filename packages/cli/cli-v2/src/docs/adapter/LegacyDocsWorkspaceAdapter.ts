import { type docsYml, resolveProfiles, resolveRedirects } from "@fern-api/configuration-loader";
import { type AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import type { DocsConfig } from "../config/DocsConfig.js";

export class LegacyDocsWorkspaceAdapter {
    public async adapt({
        docsConfig,
        absoluteFilePath
    }: {
        docsConfig: DocsConfig;
        absoluteFilePath: AbsoluteFilePath;
    }): Promise<DocsWorkspace> {
        // absoluteFilePath is the path to the docs.yml file.
        // DocsWorkspace.absoluteFilePath must be the containing directory (the "fern folder").
        const docsFilePath = docsConfig.absoluteFilePath ?? absoluteFilePath;
        const raw = docsConfig.raw as docsYml.RawSchemas.DocsConfiguration;
        return {
            type: "docs",
            workspaceName: undefined,
            absoluteFilePath: dirname(docsFilePath),
            absoluteFilepathToDocsConfig: docsFilePath,
            config: {
                ...raw,
                profiles: await resolveProfiles({
                    profiles: raw.profiles,
                    absoluteFilepathToDocsConfig: docsFilePath
                }),
                redirects: await resolveRedirects({
                    redirects: raw.redirects,
                    absoluteFilepathToDocsConfig: docsFilePath
                })
            }
        };
    }
}
