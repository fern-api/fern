import type { docsYml } from "@fern-api/configuration-loader";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
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
        return {
            type: "docs",
            workspaceName: undefined,
            absoluteFilePath: absoluteFilePath,
            absoluteFilepathToDocsConfig: absoluteFilePath,
            config: docsConfig.raw as docsYml.RawSchemas.DocsConfiguration
        };
    }
}
