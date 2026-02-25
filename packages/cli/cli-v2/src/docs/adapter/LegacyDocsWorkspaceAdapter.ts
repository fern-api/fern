import type { docsYml } from "@fern-api/configuration-loader";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import type { DocsConfig } from "../config/DocsConfig.js";

/**
 * Adapts the DocsConfig to the legacy DocsWorkspace interface.
 *
 * Now that the fern.yml docs schema matches the original docs.yml shape,
 * this adapter is essentially a passthrough — the raw schema retained on
 * DocsConfig._rawSchema already conforms to the legacy configuration format.
 *
 * The abstraction is retained so that future schema changes can be bridged
 * without modifying the rest of the pipeline.
 */
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
            config: docsConfig._rawSchema as unknown as docsYml.RawSchemas.DocsConfiguration
        };
    }
}
