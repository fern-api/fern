import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DocsConfiguration } from "@fern-fern/docs-config/api";
import { NodePath } from "../NodePath";

export type DocsConfigFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof DocsConfigFileAstNodeTypes]: DocsConfigFileAstNodeVisitor<K, R>;
};

export interface DocsConfigFileAstNodeTypes {
    file: { config: DocsConfiguration };
    filepath: { absoluteFilepath: AbsoluteFilePath; value: string /* User defined value for filepath */ };
    markdownPage: { title: string; content: string };
    versionFile: { path: string; content: unknown };
}

export type DocsConfigFileAstNodeVisitor<K extends keyof DocsConfigFileAstNodeTypes, R = void | Promise<void>> = (
    node: DocsConfigFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
