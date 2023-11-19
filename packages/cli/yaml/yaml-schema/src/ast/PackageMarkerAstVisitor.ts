import { NodePath } from "../NodePath";

export type PackageMarkerAstVisitor<R = void | Promise<void>> = {
    [K in keyof PackageMarkerAstNodeTypes]: PackageMarkerAstNodeVisitor<K, R>;
};

export interface PackageMarkerAstNodeTypes {
    export: string | undefined;
    navigation: string | string[] | undefined;
}

export type PackageMarkerAstNodeVisitor<K extends keyof PackageMarkerAstNodeTypes, R = void | Promise<void>> = (
    node: PackageMarkerAstNodeTypes[K],
    nodePath: NodePath
) => R;
