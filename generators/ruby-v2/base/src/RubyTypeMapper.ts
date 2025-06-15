import { assertNever } from "@fern-api/core-utils";
import { AbstractRubyGeneratorContext, ruby } from "@fern-api/ruby-ast";

import { ContainerType, Literal, Name, PrimitiveType, PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

export declare namespace RubyTypeMapper {
    interface args {
        reference: TypeReference;
    }
}

export class RubyTypeMapper {
    public convert({ reference }: RubyTypeMapper.args): ruby.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer(reference);
            case "named":
                return this.convertNamed(reference);
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return ruby.Type.untyped();
            default:
                throw new Error(`Unsupported type reference: ${JSON.stringify(reference)}`);
        }
    }

    private convertContainer({ container }: { container: ContainerType }): ruby.Type {
        switch (container.type) {
            case "list":
                return ruby.Type.array(this.convert({ reference: container.list }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                return ruby.Type.hash(key, value);
            }
            case "nullable":
                return ruby.Type.nilable(this.convert({ reference: container.nullable }));
            case "literal":
                return this.convertLiteral(container);
            default:
                assertNever(container);
        }
    }

    private convertNamed({ named }: { named: DeclaredTypeName }): ruby.Type {
        const objectClassReference = this.convertToClassReference(named);
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "enum":
                return ruby.Type.reference(objectClassReference);
            case "object":
                return ruby.Type.reference(objectClassReference);
            case "union":
                return ruby.Type.reference(objectClassReference);
            case "undiscriminatedUnion": {
                return ruby.Type.reference(objectClassReference);
            }
            default:
                assertNever(typeDeclaration.shape);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): ruby.Type {
        return PrimitiveTypeV1._visit<ruby.Type>(primitive.v1, {
            integer: () => ruby.Type.integer(),
            long: () => ruby.Type.integer(),
            uint: () => ruby.Type.integer(),
            uint64: () => ruby.Type.integer(),
            float: () => ruby.Type.float(),
            double: () => ruby.Type.float(),
            boolean: () => ruby.Type.boolean(),
            string: () => ruby.Type.string(),
            date: () => ruby.Type.string(),
            dateTime: () => ruby.Type.string(),
            uuid: () => ruby.Type.string(),
            base64: () => ruby.Type.string(),
            bigInteger: () => ruby.Type.string(),
            _other: () => ruby.Type.untyped()
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): ruby.Type {
        switch (literal.type) {
            case "boolean":
                return ruby.Type.boolean();
            case "string":
                return ruby.Type.string();
        }
    }

    public convertToClassReference({ typeId, name }: { typeId: TypeId; name: Name }): ruby.Reference {
        return new ruby.Reference({
            name: this.context.getPascalCaseSafeName(name),
            modulePath: [...this.context.getModulePathForId(typeId), this.context.getSnakeCaseSafeName(name)]
        });
    }
}
