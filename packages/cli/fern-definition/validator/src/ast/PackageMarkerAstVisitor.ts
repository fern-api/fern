import { NodePath } from "@fern-api/fern-definition-schema";

export type PackageMarkerAstVisitor<R = void | void> = {
    [K in keyof PackageMarkerAstNodeTypes]: PackageMarkerAstNodeVisitor<K, R>;
};

export interface PackageMarkerAstNodeTypes {
    export: string | undefined;
    navigation: string | string[] | undefined;
}

export type PackageMarkerAstNodeVisitor<K extends keyof PackageMarkerAstNodeTypes, R = void | void> = (
    node: PackageMarkerAstNodeTypes[K],
    nodePath: NodePath
) => R;
