import { RawSchemas } from "@fern-api/yaml-schema";

export type FernAstVisitor<R = void> = {
    [K in keyof FernAstNodeTypes]: FernAstNodeVisitor<K, R>;
};

export interface FernAstNodeTypes {
    docs: string;
    import: string;
    id: RawSchemas.IdSchema;
    typeDeclaration: { typeName: string; declaration: RawSchemas.TypeDeclarationSchema };
    typeReference: RawSchemas.TypeReferenceSchema;
    typeName: string;
    httpService: { serviceName: string; service: RawSchemas.HttpServiceSchema };
    httpEndpoint: { endpointId: string; endpoint: RawSchemas.HttpEndpointSchema };
    errorDeclaration: { errorName: string; declaration: RawSchemas.ErrorDeclarationSchema };
    errorReference: string;
}

export type FernAstNodeVisitor<K extends keyof FernAstNodeTypes, R = void> = (node: FernAstNodeTypes[K]) => R;
