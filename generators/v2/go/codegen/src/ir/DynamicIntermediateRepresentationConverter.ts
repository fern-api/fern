import { assertNever } from "@fern-api/core-utils";
import {
    ContainerType,
    EnumTypeDeclaration,
    FernFilepath,
    HttpEndpoint,
    IntermediateRepresentation,
    Literal,
    Name,
    NamedType,
    ObjectTypeDeclaration,
    PathParameter,
    PrimitiveType,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import {
    Declaration,
    Endpoint,
    EndpointId,
    InlinedRequest,
    IntermediateRepresentation as Dynamic,
    LiteralType,
    NamedParameter,
    ReferencedRequest,
    Request,
    Type
} from "../snippets/generated/api";

interface EndpointWithFilepath extends HttpEndpoint {
    fernFilepath: FernFilepath;
}

export declare namespace DynamicIntermediateRepresentationConverter {
    interface Args {
        ir: IntermediateRepresentation;
    }
}

export class DynamicIntermediateRepresentationConverter {
    constructor(private readonly ir: IntermediateRepresentation) {}

    public convert(): Dynamic {
        return {
            endpoints: this.convertEndpoints()
        };
    }

    private convertEndpoints(): Record<EndpointId, Endpoint> {
        const endpoints = this.getAllHttpEndpoints();
        return Object.fromEntries(endpoints.map((endpoint) => [endpoint.id, this.convertEndpoint(endpoint)]));
    }

    private convertEndpoint(endpoint: EndpointWithFilepath): Endpoint {
        return {
            declaration: this.convertDeclaration({ name: endpoint.name, fernFilepath: endpoint.fernFilepath }),
            request: this.convertRequest({ endpoint })
        };
    }

    private convertRequest({ endpoint }: { endpoint: EndpointWithFilepath }): Request {
        const pathParameters = this.convertPathParameters({ pathParameters: endpoint.allPathParameters });
        throw new Error("Not implemented");
    }

    private convertInlinedRequest({ endpoint }: { endpoint: EndpointWithFilepath }): InlinedRequest {
        throw new Error("Not implemented");
    }

    private convertReferencedRequest({ endpoint }: { endpoint: EndpointWithFilepath }): ReferencedRequest {
        throw new Error("Not implemented");
    }

    private convertPathParameters({ pathParameters }: { pathParameters: PathParameter[] }): NamedParameter[] {
        return pathParameters.map((pathParameter) => ({
            name: {
                name: pathParameter.name,
                wireValue: pathParameter.name.originalName
            },
            type: this.convertTypeReference(pathParameter.valueType)
        }));
    }

    private convertDeclaration({ name, fernFilepath }: { name: Name; fernFilepath: FernFilepath }): Declaration {
        return {
            name,
            fernFilepath
        };
    }

    private convertTypeReference(typeReference: TypeReference): Type {
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

    private convertContainerType(container: ContainerType): Type {
        switch (container.type) {
            case "list":
                return {
                    type: "list",
                    value: this.convertTypeReference(container.list)
                };
            case "map":
                return {
                    type: "map",
                    key: this.convertTypeReference(container.keyType),
                    value: this.convertTypeReference(container.valueType)
                };
            case "optional":
                return {
                    type: "optional",
                    value: this.convertTypeReference(container.optional)
                };
            case "set":
                return {
                    type: "set",
                    value: this.convertTypeReference(container.set)
                };
            case "literal":
                return {
                    type: "literal",
                    value: this.convertLiteral(container.literal)
                };
            default:
                assertNever(container);
        }
    }

    private convertNamedType(named: NamedType): Type {
        const typeDeclaration = this.resolveTypeDeclarationOrThrow(named.typeId);
        return this.convertTypeDeclaration(typeDeclaration);
    }

    private convertTypeDeclaration(typeDeclaration: TypeDeclaration): Type {
        const declaration = this.convertDeclaration(typeDeclaration.name);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convertTypeReference(typeDeclaration.shape.aliasOf);
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

    private convertEnum({ declaration, enum_ }: { declaration: Declaration; enum_: EnumTypeDeclaration }): Type {
        return {
            type: "enum",
            declaration,
            values: enum_.values.map((value) => value.name)
        };
    }

    private convertObject({ declaration, object }: { declaration: Declaration; object: ObjectTypeDeclaration }): Type {
        const properties = [...(object.extendedProperties ?? []), ...object.properties];
        return {
            type: "object",
            declaration,
            properties: properties.map((property) => ({
                name: property.name,
                type: this.convertTypeReference(property.valueType)
            }))
        };
    }

    private convertDiscriminatedUnion({
        declaration,
        union
    }: {
        declaration: Declaration;
        union: UnionTypeDeclaration;
    }): Type {
        // TODO: Handle extended properties.
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
        declaration: Declaration;
        union: UndiscriminatedUnionTypeDeclaration;
    }): Type {
        return {
            type: "undiscriminatedUnion",
            declaration,
            types: union.members.map((member) => this.convertTypeReference(member.type))
        };
    }

    private convertLiteral(literal: Literal): LiteralType {
        switch (literal.type) {
            case "boolean":
                return LiteralType.Boolean;
            case "string":
                return LiteralType.String;
            default:
                assertNever(literal);
        }
    }

    private convertPrimitiveType(primitive: PrimitiveType): Type {
        return { type: "primitive", value: primitive.v1 };
    }

    private convertUnknownType(): Type {
        return { type: "unknown" };
    }

    private resolveTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Type declaration not found for type id "${typeId}"`);
        }
        return typeDeclaration;
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
