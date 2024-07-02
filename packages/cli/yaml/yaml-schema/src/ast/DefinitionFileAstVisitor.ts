import { Values } from "@fern-api/core-utils";
import { NodePath } from "../NodePath";
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
    ValidationSchema
} from "../schemas";
import { ExampleCodeSampleSchema } from "../schemas/ExampleCodeSampleSchema";

export type DefinitionFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof DefinitionFileAstNodeTypes]: DefinitionFileAstNodeVisitor<K, R>;
};

export interface DefinitionFileAstNodeTypes {
    docs: string;
    import: { importPath: string; importedAs: string };
    typeDeclaration: {
        typeName: TypeDeclarationName;
        declaration: TypeDeclarationSchema;
    };
    exampleType: { typeName: string; typeDeclaration: TypeDeclarationSchema; example: ExampleTypeSchema };
    exampleTypeReference: string;
    typeReference: {
        typeReference: string;
        _default?: unknown;
        validation?: ValidationSchema;
        location?: TypeReferenceLocation;
    };
    typeName: string;
    httpService: HttpServiceSchema;
    httpEndpoint: { endpointId: string; endpoint: HttpEndpointSchema; service: HttpServiceSchema };
    serviceBaseUrl: string | undefined;
    endpointBaseUrl: { baseUrl: string | undefined; service: HttpServiceSchema };
    streamCondition: { streamCondition: string | undefined; endpoint: HttpEndpointSchema };
    exampleHttpEndpointCall: {
        example: ExampleEndpointCallSchema;
        endpoint: HttpEndpointSchema;
        service: HttpServiceSchema;
    };
    exampleCodeSample: {
        sample: ExampleCodeSampleSchema;
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
    exampleError: {
        example: ExampleTypeSchema;
        declaration: ErrorDeclarationSchema;
        errorName: string;
    };
    pathParameter: { pathParameterKey: string; pathParameter: HttpPathParameterSchema };
    queryParameter: { queryParameterKey: string; queryParameter: HttpQueryParameterSchema };
    header: { headerKey: string; header: HttpHeaderSchema };
    errorDeclaration: { errorName: string; declaration: ErrorDeclarationSchema };
    errorReference: string;
    variableReference: string;
    extension: string;
}

export type TypeDeclarationName = { isInlined: false; name: string } | { isInlined: true; location: "inlinedRequest" };

export const TypeReferenceLocation = {
    RequestReference: "requestReference",
    InlinedRequestProperty: "inlinedRequestProperty",
    Response: "response",
    StreamingResponse: "streamingResponse"
} as const;
export type TypeReferenceLocation = Values<typeof TypeReferenceLocation>;

export type DefinitionFileAstNodeVisitor<K extends keyof DefinitionFileAstNodeTypes, R = void | Promise<void>> = (
    node: DefinitionFileAstNodeTypes[K],
    nodePath: NodePath
) => R;
