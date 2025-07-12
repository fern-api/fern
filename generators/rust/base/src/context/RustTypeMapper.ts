import { isEqual, uniqWith } from "lodash-es";

import { assertNever } from "@fern-api/core-utils";
import { rust } from "@fern-api/rust-codegen";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";

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

import { AbstractRustGeneratorContext } from "./AbstractRustGeneratorContext";

export declare namespace RustTypeMapper {
    interface Args {
        reference: TypeReference;
        /*
         * By default, we represent enums as strings, with a phpstan phpdoc referencing the generated enum. If this flag is
         * is true, then we reference the enum type directly.
         */
        preserveEnums?: boolean;
    }
}

export class RustTypeMapper {
    private context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>;

    constructor(context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference, preserveEnums = false }: RustTypeMapper.Args): rust.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container,
                    preserveEnums
                });
            case "named":
                return this.convertNamed({ named: reference, preserveEnums });
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return rust.Type.mixed();
            default:
                assertNever(reference);
        }
    }

    public convertLiteral({ literal }: { literal: Literal }): rust.Type {
        switch (literal.type) {
            case "boolean":
                return rust.Type.literalBoolean(literal.boolean);
            case "string":
                return rust.Type.literalString(literal.string);
        }
    }

    public convertToClassReference(declaredTypeName: { typeId: TypeId; name: Name }): rust.ClassReference {
        return new rust.ClassReference({
            name: this.context.getClassName(declaredTypeName.name),
            namespace: this.context.getLocationForTypeId(declaredTypeName.typeId).namespace
        });
    }

    public convertToTraitClassReference(declaredTypeName: { typeId: TypeId; name: Name }): rust.ClassReference {
        return new rust.ClassReference({
            name: this.context.getClassName(declaredTypeName.name),
            namespace: this.context.getTraitLocationForTypeId(declaredTypeName.typeId).namespace
        });
    }

    private convertContainer({
        container,
        preserveEnums
    }: {
        container: ContainerType;
        preserveEnums: boolean;
    }): rust.Type {
        switch (container.type) {
            case "list":
                return rust.Type.array(this.convert({ reference: container.list, preserveEnums }));
            case "map": {
                const key = this.convert({ reference: container.keyType, preserveEnums });
                const value = this.convert({ reference: container.valueType, preserveEnums });
                return rust.Type.map(key, value);
            }
            case "set":
                return rust.Type.array(this.convert({ reference: container.set, preserveEnums }));
            case "optional":
                return rust.Type.optional(this.convert({ reference: container.optional, preserveEnums }));
            case "nullable":
                return rust.Type.optional(this.convert({ reference: container.nullable, preserveEnums }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): rust.Type {
        return PrimitiveTypeV1._visit<rust.Type>(primitive.v1, {
            integer: () => rust.Type.int(),
            long: () => rust.Type.int(),
            uint: () => rust.Type.int(),
            uint64: () => rust.Type.int(),
            float: () => rust.Type.float(),
            double: () => rust.Type.float(),
            boolean: () => rust.Type.bool(),
            string: () => rust.Type.string(),
            date: () => rust.Type.date(),
            dateTime: () => rust.Type.dateTime(),
            uuid: () => rust.Type.string(),
            base64: () => rust.Type.string(),
            bigInteger: () => rust.Type.string(),
            _other: () => rust.Type.mixed()
        });
    }

    private convertNamed({ named, preserveEnums }: { named: DeclaredTypeName; preserveEnums: boolean }): rust.Type {
        const classReference = this.convertToClassReference(named);
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf, preserveEnums });
            case "enum":
                return preserveEnums ? rust.Type.reference(classReference) : rust.Type.enumString(classReference);
            case "object":
            case "union":
                return rust.Type.reference(classReference);
            case "undiscriminatedUnion": {
                return rust.Type.union(
                    // Need to dedupe because lists and sets are both represented as array.
                    uniqWith(
                        typeDeclaration.shape.members.map((member) =>
                            this.convert({ reference: member.type, preserveEnums })
                        ),
                        isEqual
                    )
                );
            }
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
