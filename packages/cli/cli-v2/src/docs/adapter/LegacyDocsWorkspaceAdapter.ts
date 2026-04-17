import type { docsYml } from "@fern-api/configuration-loader";
import { type AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import type { DocsConfig } from "../config/DocsConfig.js";

export class LegacyDocsWorkspaceAdapter {
    public adapt({
        docsConfig,
        absoluteFilePath
    }: {
        docsConfig: DocsConfig;
        absoluteFilePath: AbsoluteFilePath;
    }): DocsWorkspace {
        // absoluteFilePath is the path to the docs.yml file.
        // DocsWorkspace.absoluteFilePath must be the containing directory (the "fern folder").
        const docsFilePath = docsConfig.absoluteFilePath ?? absoluteFilePath;
        return {
            type: "docs",
            workspaceName: undefined,
            absoluteFilePath: dirname(docsFilePath),
            absoluteFilepathToDocsConfig: docsFilePath,
            config: docsConfig.raw as docsYml.RawSchemas.DocsConfiguration
        };
    }
}
