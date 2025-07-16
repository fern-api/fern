import { Values } from '@fern-api/core-utils'
import { NodePath, RawSchemas } from '@fern-api/fern-definition-schema'

export type DefinitionFileAstVisitor<R = void | void> = {
    [K in keyof DefinitionFileAstNodeTypes]: DefinitionFileAstNodeVisitor<K, R>
}

export interface DefinitionFileAstNodeTypes {
    docs: string
    import: { importPath: string; importedAs: string }
    typeDeclaration: {
        typeName: TypeDeclarationName
        declaration: RawSchemas.TypeDeclarationSchema
        nodePath?: NodePath
    }
    exampleType: {
        typeName: string
        typeDeclaration: RawSchemas.TypeDeclarationSchema
        example: RawSchemas.ExampleTypeSchema
    }
    exampleTypeReference: string
    typeReference: {
        typeReference: string
        _default?: unknown
        validation?: RawSchemas.ValidationSchema
        location?: TypeReferenceLocation
        nodePath?: NodePath
    }
    typeName: string
    httpService: RawSchemas.HttpServiceSchema
    httpEndpoint: {
        endpointId: string
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    serviceBaseUrl: string | undefined
    endpointBaseUrl: { baseUrl: string | undefined; service: RawSchemas.HttpServiceSchema }
    streamCondition: { streamCondition: string | undefined; endpoint: RawSchemas.HttpEndpointSchema }
    exampleHttpEndpointCall: {
        example: RawSchemas.ExampleEndpointCallSchema
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    exampleCodeSample: {
        sample: RawSchemas.ExampleCodeSampleSchema
        example: RawSchemas.ExampleEndpointCallSchema
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    exampleHeaders: {
        examples: Record<string, RawSchemas.ExampleTypeReferenceSchema> | undefined
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    examplePathParameters: {
        examples: Record<string, RawSchemas.ExampleTypeReferenceSchema> | undefined
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    exampleQueryParameters: {
        examples: Record<string, RawSchemas.ExampleTypeReferenceSchema> | undefined
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    exampleRequest: {
        example: RawSchemas.ExampleTypeReferenceSchema | undefined
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    exampleResponse: {
        example: RawSchemas.ExampleResponseSchema | undefined
        endpoint: RawSchemas.HttpEndpointSchema
        service: RawSchemas.HttpServiceSchema
    }
    exampleError: {
        example: RawSchemas.ExampleTypeSchema
        declaration: RawSchemas.ErrorDeclarationSchema
        errorName: string
    }
    pathParameter: { pathParameterKey: string; pathParameter: RawSchemas.HttpPathParameterSchema }
    queryParameter: { queryParameterKey: string; queryParameter: RawSchemas.HttpQueryParameterSchema }
    header: { headerKey: string; header: RawSchemas.HttpHeaderSchema }
    errorDeclaration: { errorName: string; declaration: RawSchemas.ErrorDeclarationSchema }
    errorReference: string
    variableReference: string
    extension: string
}

export type TypeDeclarationName = { isInlined: false; name: string } | { isInlined: true; location: 'inlinedRequest' }

export const TypeReferenceLocation = {
    RequestReference: 'requestReference',
    InlinedRequestProperty: 'inlinedRequestProperty',
    Response: 'response',
    StreamingResponse: 'streamingResponse'
} as const
export type TypeReferenceLocation = Values<typeof TypeReferenceLocation>

export type DefinitionFileAstNodeVisitor<K extends keyof DefinitionFileAstNodeTypes, R = void | void> = (
    node: DefinitionFileAstNodeTypes[K],
    nodePath: NodePath
) => R
