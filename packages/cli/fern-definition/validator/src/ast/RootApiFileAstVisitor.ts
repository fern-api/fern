import { NodePath, RawSchemas, RootApiFileSchema } from "@fern-api/fern-definition-schema";

export type RootApiFileAstVisitor<R = void | void> = {
    [K in keyof RootApiFileAstNodeTypes]: RootApiFileAstNodeVisitor<K, R>;
};

export interface RootApiFileAstNodeTypes {
    file: RootApiFileSchema;
    oauth: {
        name: string;
        oauth: RawSchemas.OAuthSchemeSchema;
    };
    defaultEnvironment: string | null | undefined;
    environment: {
        environmentId: string;
        environment: string | RawSchemas.SingleBaseUrlEnvironmentSchema | RawSchemas.MultipleBaseUrlsEnvironmentSchema;
    };
    errorDiscrimination: RawSchemas.ErrorDiscriminationSchema | null | undefined;
    errorReference: string;
    variableDeclaration: {
        variableId: string;
        variable: RawSchemas.VariableDeclarationSchema;
    };
    pathParameter: { pathParameterKey: string; pathParameter: RawSchemas.HttpPathParameterSchema };
    variableReference: string;
}

export type RootApiFileAstNodeVisitor<K extends keyof RootApiFileAstNodeTypes, R = void | void> = (
    node: RootApiFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
