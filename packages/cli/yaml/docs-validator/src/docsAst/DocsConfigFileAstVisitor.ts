import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { NodePath } from "@fern-api/yaml-schema/src/NodePath";

export type DocsConfigFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof DocsConfigFileAstNodeTypes]: DocsConfigFileAstNodeVisitor<K, R>;
};

export interface DocsConfigFileAstNodeTypes {
    file: { config: docsYml.RawSchemas.DocsConfiguration };
    filepath: {
        absoluteFilepath: AbsoluteFilePath;
        value: string /* User defined value for filepath */;
        willBeUploaded?: boolean;
    };
    markdownPage: { title: string; content: string; absoluteFilepath: AbsoluteFilePath };
    versionFile: { path: string; content: unknown };
    apiSection: { config: docsYml.RawSchemas.ApiReferenceConfiguration; workspace: AbstractAPIWorkspace<unknown> };
}

export type DocsConfigFileAstNodeVisitor<K extends keyof DocsConfigFileAstNodeTypes, R = void | Promise<void>> = (
    node: DocsConfigFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
