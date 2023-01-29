import {
    ErrorDeclarationSchema,
    ExampleEndpointCallSchema,
    ExampleResponseSchema,
    ExampleTypeReferenceSchema,
    ExampleTypeSchema,
    HttpEndpointSchema,
    HttpHeaderSchema,
    HttpPathParameterSchema,
    HttpQueryParameterSchema,
    HttpServiceSchema,
    TypeDeclarationSchema,
} from "../schemas";
import { NodePath } from "./NodePath";

export type FernServiceFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof FernServiceFileAstNodeTypes]: FernServiceFileAstNodeVisitor<K, R>;
};

export interface FernServiceFileAstNodeTypes {
    docs: string;
    import: { importPath: string; importedAs: string };
    typeDeclaration: { typeName: string; declaration: TypeDeclarationSchema };
    exampleType: { typeName: string; typeDeclaration: TypeDeclarationSchema; example: ExampleTypeSchema };
    exampleTypeReference: string;
    typeReference: string;
    typeName: string;
    httpService: HttpServiceSchema;
    httpEndpoint: { endpointId: string; endpoint: HttpEndpointSchema; service: HttpServiceSchema };
    exampleHttpEndpointCall: {
        example: ExampleEndpointCallSchema;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    exampleHeaders: {
        examples: Record<string, ExampleTypeReferenceSchema> | undefined;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    examplePathParameters: {
        examples: Record<string, ExampleTypeReferenceSchema> | undefined;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    exampleQueryParameters: {
        examples: Record<string, ExampleTypeReferenceSchema> | undefined;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    exampleRequest: {
        example: ExampleTypeReferenceSchema | undefined;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    exampleResponse: {
        example: ExampleResponseSchema | undefined;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    pathParameter: { pathParameterKey: string; pathParameter: HttpPathParameterSchema };
    queryParameter: { queryParameterKey: string; queryParameter: HttpQueryParameterSchema };
    header: { headerKey: string; header: HttpHeaderSchema };
    errorDeclaration: { errorName: string; declaration: ErrorDeclarationSchema };
    errorReference: string;
}

export type FernServiceFileAstNodeVisitor<K extends keyof FernServiceFileAstNodeTypes, R = void | Promise<void>> = (
    node: FernServiceFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
