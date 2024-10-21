import { assertNever } from "@fern-api/core-utils";
import {
    AliasTypeDeclaration,
    ContainerType,
    EnumTypeDeclaration,
    FernFilepath,
    HttpEndpoint,
    HttpRequestBody,
    IntermediateRepresentation,
    Literal,
    Name,
    NameAndWireValue,
    NamedType,
    ObjectTypeDeclaration,
    PathParameter,
    PrimitiveType,
    SdkRequestBodyType,
    SdkRequestWrapper,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-api/ir-sdk";
import { DynamicSnippets } from "./generated";

interface EndpointWithFilepath extends HttpEndpoint {
    fernFilepath: FernFilepath;
}

export declare namespace DynamicSnippetsConverter {
    interface Args {
        ir: IntermediateRepresentation;
    }
}

export class DynamicSnippetsConverter {
    constructor(private readonly ir: IntermediateRepresentation) {}

    public convert(): DynamicSnippets.DynamicIntermediateRepresentation {
        return {
            types: this.convertNamedTypes(),
            endpoints: this.convertEndpoints(),
            headers: [] // TOOD: Implement me!
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

    private convertEndpoints(): Record<DynamicSnippets.EndpointId, DynamicSnippets.Endpoint> {
        const endpoints = this.getAllHttpEndpoints();
        return Object.fromEntries(endpoints.map((endpoint) => [endpoint.id, this.convertEndpoint(endpoint)]));
    }

    private convertEndpoint(endpoint: EndpointWithFilepath): DynamicSnippets.Endpoint {
        return {
            declaration: this.convertDeclaration({ name: endpoint.name, fernFilepath: endpoint.fernFilepath }),
            request: this.convertRequest({ endpoint })
        };
    }

    private convertRequest({ endpoint }: { endpoint: EndpointWithFilepath }): DynamicSnippets.Request {
        const pathParameters = this.convertPathParameters({ pathParameters: endpoint.allPathParameters });
        if (endpoint.sdkRequest == null && endpoint.requestBody == null) {
            return {
                type: "body",
                pathParameters
            };
        }
        if (endpoint.sdkRequest == null) {
            throw new Error(`Internal error; endpoint "${endpoint.id}" has a request body but no SDK request`);
        }
        switch (endpoint.sdkRequest.shape.type) {
            case "justRequestBody":
                return {
                    type: "body",
                    pathParameters,
                    body: this.convertReferencedRequestBodyType({ body: endpoint.sdkRequest.shape.value })
                };
            case "wrapper":
                return this.convertInlinedRequest({
                    fernFilepath: endpoint.fernFilepath,
                    wrapper: endpoint.sdkRequest.shape,
                    pathParameters,
                    queryParameters: this.convertWireValueParameters({ wireValueParameters: endpoint.queryParameters }),
                    headers: this.convertWireValueParameters({ wireValueParameters: endpoint.headers }),
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
                return { type: "bytes" };
            case "typeReference":
                return { type: "typeReference", value: this.convertTypeReference(body.requestBodyType) };
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
        return {
            type: "inlined",
            declaration: this.convertDeclaration({ name: wrapper.wrapperName, fernFilepath }),
            pathParameters,
            queryParameters,
            headers,
            body: body != null ? this.convertInlinedRequestBody({ wrapper, body }) : undefined
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
                return {
                    type: "properties",
                    value: properties.map((property) => ({
                        name: property.name,
                        typeReference: this.convertTypeReference(property.valueType)
                    }))
                };
            }
            case "reference":
                return {
                    type: "referenced",
                    bodyKey: wrapper.bodyKey,
                    bodyType: { type: "typeReference", value: this.convertTypeReference(body.requestBodyType) }
                };
            case "bytes":
                return {
                    type: "referenced",
                    bodyKey: wrapper.bodyKey,
                    bodyType: { type: "bytes" }
                };
            case "fileUpload":
                return {
                    type: "fileUpload",
                    properties: [] // TODO: Implement me!
                };
            default:
                assertNever(body);
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
                return {
                    _type: "list",
                    value: this.convertTypeReference(container.list)
                };
            case "map":
                return {
                    _type: "map",
                    key: this.convertTypeReference(container.keyType),
                    value: this.convertTypeReference(container.valueType)
                };
            case "optional":
                return {
                    _type: "optional",
                    value: this.convertTypeReference(container.optional)
                };
            case "set":
                return {
                    _type: "set",
                    value: this.convertTypeReference(container.set)
                };
            case "literal":
                return {
                    _type: "literal",
                    value: this.convertLiteral(container.literal)
                };
            default:
                assertNever(container);
        }
    }

    private convertNamedType(named: NamedType): DynamicSnippets.TypeReference {
        return {
            _type: "named",
            value: named.typeId
        };
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
        return {
            type: "alias",
            declaration,
            typeReference: this.convertTypeReference(alias.aliasOf)
        };
    }

    private convertEnum({
        declaration,
        enum_
    }: {
        declaration: DynamicSnippets.Declaration;
        enum_: EnumTypeDeclaration;
    }): DynamicSnippets.NamedType {
        return {
            type: "enum",
            declaration,
            values: enum_.values.map((value) => value.name)
        };
    }

    private convertObject({
        declaration,
        object
    }: {
        declaration: DynamicSnippets.Declaration;
        object: ObjectTypeDeclaration;
    }): DynamicSnippets.NamedType {
        const properties = [...(object.extendedProperties ?? []), ...object.properties];
        return {
            type: "object",
            declaration,
            properties: properties.map((property) => ({
                name: property.name,
                typeReference: this.convertTypeReference(property.valueType)
            }))
        };
    }

    private convertDiscriminatedUnion({
        declaration,
        union
    }: {
        declaration: DynamicSnippets.Declaration;
        union: UnionTypeDeclaration;
    }): DynamicSnippets.NamedType {
        // TODO: Convert types and include base + extended properties.
        return {
            type: "discriminatedUnion",
            declaration,
            discriminant: union.discriminant,
            types: {}
        };
    }

    private convertUndiscriminatedUnion({
        declaration,
        union
    }: {
        declaration: DynamicSnippets.Declaration;
        union: UndiscriminatedUnionTypeDeclaration;
    }): DynamicSnippets.NamedType {
        return {
            type: "undiscriminatedUnion",
            declaration,
            types: union.members.map((member) => this.convertTypeReference(member.type))
        };
    }

    private convertLiteral(literal: Literal): DynamicSnippets.LiteralType {
        switch (literal.type) {
            case "boolean":
                return {
                    type: "boolean",
                    value: literal.boolean
                };
            case "string":
                return {
                    type: "string",
                    value: literal.string
                };
            default:
                assertNever(literal);
        }
    }

    private convertPrimitiveType(primitive: PrimitiveType): DynamicSnippets.TypeReference {
        return { _type: "primitive", value: primitive.v1 };
    }

    private convertUnknownType(): DynamicSnippets.TypeReference {
        return { _type: "unknown" };
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

    private getAllHttpEndpoints(): EndpointWithFilepath[] {
        return Object.values(this.ir.services).flatMap((service) =>
            service.endpoints.map((endpoint) => ({
                ...endpoint,
                fernFilepath: service.name.fernFilepath
            }))
        );
    }
}
