import { NodePath } from "./NodePath";

export type FernRootApiFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof FernRootApiFileAstNodeTypes]: FernRootApiFileAstNodeVisitor<K, R>;
};

export interface FernRootApiFileAstNodeTypes {
    defaultEnvironment: string | null | undefined;
    errorDiscriminant: string | null | undefined;
}

export type FernRootApiFileAstNodeVisitor<K extends keyof FernRootApiFileAstNodeTypes, R = void | Promise<void>> = (
    node: FernRootApiFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
