import {
    ErrorDiscriminationSchema,
    MultipleBaseUrlsEnvironmentSchema,
    SingleBaseUrlEnvironmentSchema,
} from "../schemas";
import { NodePath } from "./NodePath";

export type RootApiFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof RootApiFileAstNodeTypes]: RootApiFileAstNodeVisitor<K, R>;
};

export interface RootApiFileAstNodeTypes {
    defaultEnvironment: string | null | undefined;
    environment: {
        environmentId: string;
        environment: string | SingleBaseUrlEnvironmentSchema | MultipleBaseUrlsEnvironmentSchema;
    };
    errorDiscrimination: ErrorDiscriminationSchema | null | undefined;
    errorReference: string;
}

export type RootApiFileAstNodeVisitor<K extends keyof RootApiFileAstNodeTypes, R = void | Promise<void>> = (
    node: RootApiFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
