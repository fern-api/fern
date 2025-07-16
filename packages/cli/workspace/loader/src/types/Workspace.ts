import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export type Workspace = DocsWorkspace | AbstractAPIWorkspace<unknown>;

export interface DocsWorkspace {
    type: "docs";
    workspaceName: string | undefined;
    absoluteFilePath: AbsoluteFilePath; // path to the fern folder (dirname(absoluteFilepathToDocsConfig))
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    config: docsYml.RawSchemas.DocsConfiguration;
}
