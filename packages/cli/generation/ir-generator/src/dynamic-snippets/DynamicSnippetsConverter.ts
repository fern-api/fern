import urlJoin from "url-join";

import { assertNever } from "@fern-api/core-utils";
import {
    AliasTypeDeclaration,
    ApiAuth,
    ContainerType,
    DeclaredTypeName,
    dynamic as DynamicSnippets,
    EndpointId,
    EnumTypeDeclaration,
    FernFilepath,
    FileProperty,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpHeader,
    HttpRequestBody,
    IntermediateRepresentation,
    Literal,
    Name,
    NameAndWireValue,
    NamedType,
    ObjectProperty,
    ObjectTypeDeclaration,
    PathParameter,
    PrimitiveType,
    QueryParameter,
    SdkRequestBodyType,
    SdkRequestWrapper,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-api/ir-sdk";

import { Version } from "./version";

interface EndpointWithFilepath extends HttpEndpoint {
    serviceHeaders: HttpHeader[];
    fernFilepath: FernFilepath;
}

export declare namespace DynamicSnippetsConverter {
    interface Args {
        ir: IntermediateRepresentation;
    }
}

export class DynamicSnippetsConverter {
    private readonly auth: DynamicSnippets.Auth | undefined;

    constructor(private readonly ir: IntermediateRepresentation) {
        this.auth = this.convertAuth(ir.auth);
    }

    public convert(): DynamicSnippets.DynamicIntermediateRepresentation {
        return {
            version: Version,
            types: this.convertNamedTypes(),
            headers: this.convertHeaders(),
            endpoints: this.convertEndpoints(),
            environments: this.ir.environments
        };
    }

    private convertNamedTypes(): Record<TypeId, DynamicSnippets.NamedType> {
        return Object.fromEntries(
            Object.entries(this.ir.types).map(([typeId, typeDeclaration]) => [
                typeId,
                this.convertTypeDeclaration(typeDeclaration)
            ])
        );
    }

    private convertHeaders(): DynamicSnippets.NamedParameter[] {
        return this.convertWireValueParameters({ wireValueParameters: this.ir.headers });
    }

    private convertEndpoints(): Record<EndpointId, DynamicSnippets.Endpoint> {
        const endpoints = this.getAllHttpEndpoints();
        return Object.fromEntries(endpoints.map((endpoint) => [endpoint.id, this.convertEndpoint(endpoint)]));
    }

    private convertEndpoint(endpoint: EndpointWithFilepath): DynamicSnippets.Endpoint {
        return {
            auth: this.auth,
            declaration: this.convertDeclaration({ name: endpoint.name, fernFilepath: endpoint.fernFilepath }),
            location: this.convertEndpointLocation({ endpoint }),
            request: this.convertRequest({ endpoint }),
            response: DynamicSnippets.Response.json()
        };
    }

    private convertRequest({ endpoint }: { endpoint: EndpointWithFilepath }): DynamicSnippets.Request {
        const pathParameters = this.convertPathParameters({ pathParameters: endpoint.allPathParameters });
        if (endpoint.sdkRequest == null && endpoint.requestBody == null) {
            return DynamicSnippets.Request.body({ pathParameters, body: undefined });
        }
        if (endpoint.sdkRequest == null) {
            throw new Error(`Internal error; endpoint "${endpoint.id}" has a request body but no SDK request`);
        }
        switch (endpoint.sdkRequest.shape.type) {
            case "justRequestBody":
                return DynamicSnippets.Request.body({
                    pathParameters,
                    body: this.convertReferencedRequestBodyType({ body: endpoint.sdkRequest.shape.value })
                });
            case "wrapper":
                return this.convertInlinedRequest({
                    fernFilepath: endpoint.fernFilepath,
                    wrapper: endpoint.sdkRequest.shape,
                    pathParameters,
                    queryParameters: this.convertQueryParameters({ queryParameters: endpoint.queryParameters }),
                    headers: this.convertWireValueParameters({
                        wireValueParameters: [...endpoint.serviceHeaders, ...endpoint.headers]
                    }),
                    body: endpoint.requestBody
                });
            default:
                assertNever(endpoint.sdkRequest.shape);
        }
    }

    private convertReferencedRequestBodyType({
        body
    }: {
        body: SdkRequestBodyType;
    }): DynamicSnippets.ReferencedRequestBodyType {
        switch (body.type) {
            case "bytes":
                return DynamicSnippets.ReferencedRequestBodyType.bytes();
            case "typeReference":
                return DynamicSnippets.ReferencedRequestBodyType.typeReference(
                    this.convertTypeReference(body.requestBodyType)
                );
            default:
                assertNever(body);
        }
    }

    private convertInlinedRequest({
        fernFilepath,
        wrapper,
        pathParameters,
        queryParameters,
        headers,
        body
    }: {
        fernFilepath: FernFilepath;
        wrapper: SdkRequestWrapper;
        pathParameters: DynamicSnippets.NamedParameter[];
        queryParameters: DynamicSnippets.NamedParameter[];
        headers: DynamicSnippets.NamedParameter[];
        body: HttpRequestBody | undefined;
    }): DynamicSnippets.Request {
        return DynamicSnippets.Request.inlined({
            declaration: this.convertDeclaration({ name: wrapper.wrapperName, fernFilepath }),
            pathParameters,
            queryParameters,
            headers,
            body: body != null ? this.convertInlinedRequestBody({ wrapper, body }) : undefined,
            metadata: this.convertInlinedRequestMetadata({ wrapper })
        });
    }

    private convertInlinedRequestMetadata({
        wrapper
    }: {
        wrapper: SdkRequestWrapper;
    }): DynamicSnippets.InlinedRequestMetadata {
        return {
            includePathParameters: wrapper.includePathParameters ?? false,
            onlyPathParameters: wrapper.onlyPathParameters ?? false
        };
    }

    private convertInlinedRequestBody({
        wrapper,
        body
    }: {
        wrapper: SdkRequestWrapper;
        body: HttpRequestBody;
    }): DynamicSnippets.InlinedRequestBody {
        switch (body.type) {
            case "inlinedRequestBody": {
                const properties = [...(body.extendedProperties ?? []), ...body.properties];
                return DynamicSnippets.InlinedRequestBody.properties(
                    this.convertWireValueParameters({ wireValueParameters: properties })
                );
            }
            case "reference":
                return DynamicSnippets.InlinedRequestBody.referenced({
                    bodyKey: wrapper.bodyKey,
                    bodyType: DynamicSnippets.ReferencedRequestBodyType.typeReference(
                        this.convertTypeReference(body.requestBodyType)
                    )
                });
            case "bytes":
                return DynamicSnippets.InlinedRequestBody.referenced({
                    bodyKey: wrapper.bodyKey,
                    bodyType: DynamicSnippets.ReferencedRequestBodyType.bytes()
                });
            case "fileUpload":
                return this.convertFileUploadRequestBody({ properties: body.properties });
            default:
                assertNever(body);
        }
    }

    private convertFileUploadRequestBody({
        properties
    }: {
        properties: FileUploadRequestProperty[];
    }): DynamicSnippets.InlinedRequestBody {
        return DynamicSnippets.InlinedRequestBody.fileUpload({
            properties: this.convertFileUploadRequestBodyProperties({ properties })
        });
    }

    private convertFileUploadRequestBodyProperties({
        properties
    }: {
        properties: FileUploadRequestProperty[];
    }): DynamicSnippets.FileUploadRequestBodyProperty[] {
        return properties.map((property) => {
            switch (property.type) {
                case "file":
                    return this.convertFileUploadRequestBodyFileProperty({ fileProperty: property.value });
                case "bodyProperty":
                    return DynamicSnippets.FileUploadRequestBodyProperty.bodyProperty({
                        name: property.name,
                        typeReference: this.convertTypeReference(property.valueType)
                    });
                default:
                    assertNever(property);
            }
        });
    }

    private convertFileUploadRequestBodyFileProperty({
        fileProperty
    }: {
        fileProperty: FileProperty;
    }): DynamicSnippets.FileUploadRequestBodyProperty {
        switch (fileProperty.type) {
            case "file":
                return DynamicSnippets.FileUploadRequestBodyProperty.file(fileProperty.key);
            case "fileArray":
                return DynamicSnippets.FileUploadRequestBodyProperty.fileArray(fileProperty.key);
            default:
                assertNever(fileProperty);
        }
    }

    private convertPathParameters({
        pathParameters
    }: {
        pathParameters: PathParameter[];
    }): DynamicSnippets.NamedParameter[] {
        return pathParameters.map((pathParameter) => ({
            name: {
                name: pathParameter.name,
                wireValue: pathParameter.name.originalName
            },
            typeReference: this.convertTypeReference(pathParameter.valueType)
        }));
    }

    private convertWireValueParameters({
        wireValueParameters
    }: {
        wireValueParameters: { name: NameAndWireValue; valueType: TypeReference }[];
    }): DynamicSnippets.NamedParameter[] {
        return wireValueParameters.map((parameter) => ({
            name: {
                name: parameter.name.name,
                wireValue: parameter.name.wireValue
            },
            typeReference: this.convertTypeReference(parameter.valueType)
        }));
    }

    private convertQueryParameters({
        queryParameters
    }: {
        queryParameters: QueryParameter[];
    }): DynamicSnippets.NamedParameter[] {
        const parameters: DynamicSnippets.NamedParameter[] = [];
        for (const queryParameter of queryParameters) {
            let typeReference = this.convertTypeReference(queryParameter.valueType);
            if (queryParameter.allowMultiple) {
                typeReference = DynamicSnippets.TypeReference.list(typeReference);
            }
            parameters.push({
                name: {
                    name: queryParameter.name.name,
                    wireValue: queryParameter.name.wireValue
                },
                typeReference
            });
        }
        return parameters;
    }

    private convertTypeReference(typeReference: TypeReference): DynamicSnippets.TypeReference {
        switch (typeReference.type) {
            case "container":
                return this.convertContainerType(typeReference.container);
            case "named":
                return this.convertNamedType(typeReference);
            case "primitive":
                return this.convertPrimitiveType(typeReference.primitive);
            case "unknown":
                return this.convertUnknownType();
            default:
                assertNever(typeReference);
        }
    }

    private convertContainerType(container: ContainerType): DynamicSnippets.TypeReference {
        switch (container.type) {
            case "list":
                return DynamicSnippets.TypeReference.list(this.convertTypeReference(container.list));
            case "map":
                return DynamicSnippets.TypeReference.map({
                    key: this.convertTypeReference(container.keyType),
                    value: this.convertTypeReference(container.valueType)
                });
            case "optional":
                return DynamicSnippets.TypeReference.optional(this.convertTypeReference(container.optional));
            case "set":
                return DynamicSnippets.TypeReference.set(this.convertTypeReference(container.set));
            case "literal":
                return DynamicSnippets.TypeReference.literal(this.convertLiteral(container.literal));
            default:
                assertNever(container);
        }
    }

    private convertNamedType(named: NamedType): DynamicSnippets.TypeReference {
        return DynamicSnippets.TypeReference.named(named.typeId);
    }

    private convertTypeDeclaration(typeDeclaration: TypeDeclaration): DynamicSnippets.NamedType {
        const declaration = this.convertDeclaration(typeDeclaration.name);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convertAlias({ declaration, alias: typeDeclaration.shape });
            case "enum":
                return this.convertEnum({ declaration, enum_: typeDeclaration.shape });
            case "object":
                return this.convertObject({ declaration, object: typeDeclaration.shape });
            case "union":
                return this.convertDiscriminatedUnion({ declaration, union: typeDeclaration.shape });
            case "undiscriminatedUnion":
                return this.convertUndiscriminatedUnion({ declaration, union: typeDeclaration.shape });
            default:
                assertNever(typeDeclaration.shape);
        }
    }

    private convertAlias({
        declaration,
        alias
    }: {
        declaration: DynamicSnippets.Declaration;
        alias: AliasTypeDeclaration;
    }): DynamicSnippets.NamedType {
        return DynamicSnippets.NamedType.alias({
            declaration,
            typeReference: this.convertTypeReference(alias.aliasOf)
        });
    }

    private convertEnum({
        declaration,
        enum_
    }: {
        declaration: DynamicSnippets.Declaration;
        enum_: EnumTypeDeclaration;
    }): DynamicSnippets.NamedType {
        return DynamicSnippets.NamedType.enum({
            declaration,
            values: enum_.values.map((value) => value.name)
        });
    }

    private convertObject({
        declaration,
        object
    }: {
        declaration: DynamicSnippets.Declaration;
        object: ObjectTypeDeclaration;
    }): DynamicSnippets.NamedType {
        const properties = [...(object.extendedProperties ?? []), ...object.properties];
        return this.convertObjectProperties({
            declaration,
            properties
        });
    }

    private convertObjectProperties({
        declaration,
        properties
    }: {
        declaration: DynamicSnippets.Declaration;
        properties: ObjectProperty[];
    }): DynamicSnippets.NamedType {
        return DynamicSnippets.NamedType.object({
            declaration,
            properties: this.convertWireValueParameters({ wireValueParameters: properties })
        });
    }

    private convertDiscriminatedUnion({
        declaration,
        union
    }: {
        declaration: DynamicSnippets.Declaration;
        union: UnionTypeDeclaration;
    }): DynamicSnippets.NamedType {
        const inheritedProperties = [...this.resolveProperties(union.extends), ...union.baseProperties];
        return DynamicSnippets.NamedType.discriminatedUnion({
            declaration,
            discriminant: union.discriminant,
            types: Object.fromEntries(
                union.types.map((unionType) => [
                    unionType.discriminantValue.wireValue,
                    this.convertDiscriminatedUnionType({
                        inheritedProperties,
                        discriminantValue: unionType.discriminantValue,
                        singleUnionTypeProperties: unionType.shape
                    })
                ])
            )
        });
    }

    private convertDiscriminatedUnionType({
        inheritedProperties,
        discriminantValue,
        singleUnionTypeProperties
    }: {
        inheritedProperties: ObjectProperty[];
        discriminantValue: NameAndWireValue;
        singleUnionTypeProperties: SingleUnionTypeProperties;
    }): DynamicSnippets.SingleDiscriminatedUnionType {
        switch (singleUnionTypeProperties.propertiesType) {
            case "samePropertiesAsObject":
                return this.convertDiscriminatedUnionTypeObject({
                    inheritedProperties,
                    discriminantValue,
                    declaredTypeName: singleUnionTypeProperties
                });
            case "singleProperty":
                return this.convertDiscriminatedUnionTypeSingleProperty({
                    inheritedProperties,
                    discriminantValue,
                    singleUnionTypeProperty: singleUnionTypeProperties
                });
            case "noProperties":
                return this.convertDiscriminatedUnionTypeNoProperties({
                    inheritedProperties,
                    discriminantValue
                });
            default:
                assertNever(singleUnionTypeProperties);
        }
    }

    private convertDiscriminatedUnionTypeObject({
        inheritedProperties,
        discriminantValue,
        declaredTypeName
    }: {
        inheritedProperties: ObjectProperty[];
        discriminantValue: NameAndWireValue;
        declaredTypeName: DeclaredTypeName;
    }): DynamicSnippets.SingleDiscriminatedUnionType {
        return DynamicSnippets.SingleDiscriminatedUnionType.samePropertiesAsObject({
            typeId: declaredTypeName.typeId,
            discriminantValue,
            properties: this.convertWireValueParameters({ wireValueParameters: inheritedProperties })
        });
    }

    private convertDiscriminatedUnionTypeSingleProperty({
        inheritedProperties,
        discriminantValue,
        singleUnionTypeProperty
    }: {
        inheritedProperties: ObjectProperty[];
        discriminantValue: NameAndWireValue;
        singleUnionTypeProperty: SingleUnionTypeProperty;
    }): DynamicSnippets.SingleDiscriminatedUnionType {
        return DynamicSnippets.SingleDiscriminatedUnionType.singleProperty({
            typeReference: this.convertTypeReference(singleUnionTypeProperty.type),
            discriminantValue,
            properties:
                inheritedProperties.length > 0
                    ? this.convertWireValueParameters({ wireValueParameters: inheritedProperties })
                    : undefined
        });
    }

    private convertDiscriminatedUnionTypeNoProperties({
        inheritedProperties,
        discriminantValue
    }: {
        inheritedProperties: ObjectProperty[];
        discriminantValue: NameAndWireValue;
    }): DynamicSnippets.SingleDiscriminatedUnionType {
        return DynamicSnippets.SingleDiscriminatedUnionType.noProperties({
            discriminantValue,
            properties:
                inheritedProperties.length > 0
                    ? this.convertWireValueParameters({ wireValueParameters: inheritedProperties })
                    : undefined
        });
    }

    private convertUndiscriminatedUnion({
        declaration,
        union
    }: {
        declaration: DynamicSnippets.Declaration;
        union: UndiscriminatedUnionTypeDeclaration;
    }): DynamicSnippets.NamedType {
        return DynamicSnippets.NamedType.undiscriminatedUnion({
            declaration,
            types: union.members.map((member) => this.convertTypeReference(member.type))
        });
    }

    private convertLiteral(literal: Literal): DynamicSnippets.LiteralType {
        switch (literal.type) {
            case "boolean":
                return DynamicSnippets.LiteralType.boolean(literal.boolean);
            case "string":
                return DynamicSnippets.LiteralType.string(literal.string);
            default:
                assertNever(literal);
        }
    }

    private convertPrimitiveType(primitive: PrimitiveType): DynamicSnippets.TypeReference {
        return DynamicSnippets.TypeReference.primitive(primitive.v1);
    }

    private convertUnknownType(): DynamicSnippets.TypeReference {
        return DynamicSnippets.TypeReference.unknown();
    }

    private convertAuth(auth: ApiAuth): DynamicSnippets.Auth | undefined {
        if (auth.schemes[0] == null) {
            return undefined;
        }
        const scheme = auth.schemes[0];
        switch (scheme.type) {
            case "basic":
                return DynamicSnippets.Auth.basic(scheme);
            case "bearer":
                return DynamicSnippets.Auth.bearer(scheme);
            case "header":
                return DynamicSnippets.Auth.header({
                    header: {
                        name: scheme.name,
                        typeReference: this.convertTypeReference(scheme.valueType)
                    }
                });
            case "oauth":
                // TODO: Support OAuth.
                return undefined;
            default:
                assertNever(scheme);
        }
    }

    private convertDeclaration({
        name,
        fernFilepath
    }: {
        name: Name;
        fernFilepath: FernFilepath;
    }): DynamicSnippets.Declaration {
        return {
            name,
            fernFilepath
        };
    }

    private convertEndpointLocation({ endpoint }: { endpoint: HttpEndpoint }): DynamicSnippets.EndpointLocation {
        return {
            method: endpoint.method,
            path: this.getFullPathForEndpoint(endpoint)
        };
    }

    private getAllHttpEndpoints(): EndpointWithFilepath[] {
        return Object.values(this.ir.services).flatMap((service) =>
            service.endpoints.map((endpoint) => ({
                ...endpoint,
                serviceHeaders: service.headers,
                fernFilepath: service.name.fernFilepath
            }))
        );
    }

    private resolveProperties(declaredTypeNames: DeclaredTypeName[]): ObjectProperty[] {
        const properties: ObjectProperty[] = [];
        for (const declaredTypeName of declaredTypeNames) {
            const typeDeclaration = this.resolveObjectTypeOrThrow(declaredTypeName.typeId);
            properties.push(...this.resolveProperties(typeDeclaration.extends));
            properties.push(...typeDeclaration.properties);
        }
        return Object.values(properties);
    }

    private resolveObjectTypeOrThrow(typeId: TypeId): ObjectTypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Internal error; type "${typeId}" not found`);
        }
        if (typeDeclaration.shape.type !== "object") {
            throw new Error(`Internal error; type "${typeId}" is not an object`);
        }
        return typeDeclaration.shape;
    }

    private getFullPathForEndpoint(endpoint: HttpEndpoint): string {
        let url = "";
        if (endpoint.fullPath.head.length > 0) {
            url = urlJoin(url, endpoint.fullPath.head);
        }
        for (const part of endpoint.fullPath.parts) {
            url = urlJoin(url, "{" + part.pathParameter + "}");
            if (part.tail.length > 0) {
                url = urlJoin(url, part.tail);
            }
        }
        return url.startsWith("/") ? url : `/${url}`;
    }
}
