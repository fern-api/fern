import { isEqual, uniqWith } from "lodash-es";

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

import { php } from "../";
import { ClassReference, Type } from "../ast";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { AbstractPhpGeneratorContext } from "./AbstractPhpGeneratorContext";

export declare namespace PhpTypeMapper {
    interface Args {
        reference: TypeReference;
        /*
         * By default, we represent enums as strings, with a phpstan phpdoc referencing the generated enum. If this flag is
         * is true, then we reference the enum type directly.
         */
        preserveEnums?: boolean;
    }
}

export class PhpTypeMapper {
    private context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>;

    constructor(context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference, preserveEnums = false }: PhpTypeMapper.Args): Type {
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
                return php.Type.mixed();
            default:
                assertNever(reference);
        }
    }

    public convertToClassReference(declaredTypeName: { typeId: TypeId; name: Name }): ClassReference {
        return new php.ClassReference({
            name: this.context.getClassName(declaredTypeName.name),
            namespace: this.context.getLocationForTypeId(declaredTypeName.typeId).namespace
        });
    }

    public convertToTraitClassReference(declaredTypeName: { typeId: TypeId; name: Name }): ClassReference {
        return new php.ClassReference({
            name: this.context.getClassName(declaredTypeName.name),
            namespace: this.context.getTraitLocationForTypeId(declaredTypeName.typeId).namespace
        });
    }

    private convertContainer({ container, preserveEnums }: { container: ContainerType; preserveEnums: boolean }): Type {
        switch (container.type) {
            case "list":
                return Type.array(this.convert({ reference: container.list, preserveEnums }));
            case "map": {
                const key = this.convert({ reference: container.keyType, preserveEnums });
                const value = this.convert({ reference: container.valueType, preserveEnums });
                return Type.map(key, value);
            }
            case "set":
                return Type.array(this.convert({ reference: container.set, preserveEnums }));
            case "optional":
                return Type.optional(this.convert({ reference: container.optional, preserveEnums }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): Type {
        return PrimitiveTypeV1._visit<php.Type>(primitive.v1, {
            integer: () => php.Type.int(),
            long: () => php.Type.int(),
            uint: () => php.Type.int(),
            uint64: () => php.Type.int(),
            float: () => php.Type.float(),
            double: () => php.Type.float(),
            boolean: () => php.Type.bool(),
            string: () => php.Type.string(),
            date: () => php.Type.date(),
            dateTime: () => php.Type.dateTime(),
            uuid: () => php.Type.string(),
            base64: () => php.Type.string(),
            bigInteger: () => php.Type.string(),
            _other: () => php.Type.mixed()
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): Type {
        switch (literal.type) {
            case "boolean":
                return php.Type.bool();
            case "string":
                return php.Type.string();
        }
    }

    private convertNamed({ named, preserveEnums }: { named: DeclaredTypeName; preserveEnums: boolean }): Type {
        const classReference = this.convertToClassReference(named);
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf, preserveEnums });
            case "enum":
                return preserveEnums ? php.Type.reference(classReference) : php.Type.enumString(classReference);
            case "object":
                return php.Type.reference(classReference);
            case "union":
                return php.Type.mixed();
            case "undiscriminatedUnion": {
                return php.Type.union(
                    // need to dedupe because lists and sets are both represented as array
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
