import { assertNever } from "@fern-api/core-utils";

import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    Name,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext";

export declare namespace GoTypeMapper {
    interface Args {
        reference: TypeReference;
    }
}

export class GoTypeMapper {
    private context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>;

    constructor(context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference }: GoTypeMapper.Args): go.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container
                });
            case "named":
                return this.convertNamed({ named: reference });
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return go.Type.any();
            default:
                assertNever(reference);
        }
    }

    public convertToTypeReference(declaredTypeName: { typeId: TypeId; name: Name }): go.TypeReference {
        return go.typeReference({
            name: this.context.getClassName(declaredTypeName.name),
            importPath: this.context.getLocationForTypeId(declaredTypeName.typeId).importPath
        });
    }

    private convertContainer({ container }: { container: ContainerType }): go.Type {
        switch (container.type) {
            case "list":
                return go.Type.slice(this.convert({ reference: container.list }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                return go.Type.map(key, value);
            }
            case "set":
                return go.Type.slice(this.convert({ reference: container.set }));
            case "optional":
                return go.Type.optional(this.convert({ reference: container.optional }));
            case "nullable":
                return go.Type.optional(this.convert({ reference: container.nullable }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): go.Type {
        return PrimitiveTypeV1._visit<go.Type>(primitive.v1, {
            integer: () => go.Type.int(),
            long: () => go.Type.int64(),
            uint: () => go.Type.int(),
            uint64: () => go.Type.int64(),
            float: () => go.Type.float64(),
            double: () => go.Type.float64(),
            boolean: () => go.Type.bool(),
            string: () => go.Type.string(),
            date: () => go.Type.date(),
            dateTime: () => go.Type.dateTime(),
            uuid: () => go.Type.uuid(),
            base64: () => go.Type.bytes(),
            bigInteger: () => go.Type.string(),
            _other: () => go.Type.any()
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): go.Type {
        switch (literal.type) {
            case "boolean":
                return go.Type.bool();
            case "string":
                return go.Type.string();
            default:
                assertNever(literal);
        }
    }

    private convertNamed({ named }: { named: DeclaredTypeName }): go.Type {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return go.Type.reference(this.convertToTypeReference(named));
            case "object":
            case "enum":
            case "union":
            case "undiscriminatedUnion":
                return go.Type.pointer(go.Type.reference(this.convertToTypeReference(named)));
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
