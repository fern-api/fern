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

import { csharp } from "../";
import { ClassReference, Type } from "../ast";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { AbstractCsharpGeneratorContext } from "./AbstractCsharpGeneratorContext";

export declare namespace CsharpTypeMapper {
    interface Args {
        reference: TypeReference;
        /* Defaults to false */
        unboxOptionals?: boolean;
    }
}

export class CsharpTypeMapper {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;

    constructor(context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference, unboxOptionals }: CsharpTypeMapper.Args): Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container,
                    unboxOptionals: unboxOptionals ?? false
                });
            case "named":
                return this.convertNamed({ named: reference });
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return csharp.Type.object();
            default:
                assertNever(reference);
        }
    }

    public convertToClassReference(declaredTypeName: { typeId: TypeId; name: Name }): ClassReference {
        const objectNamespace = this.context.getNamespaceForTypeId(declaredTypeName.typeId);
        return new csharp.ClassReference({
            name: this.context.getPascalCaseSafeName(declaredTypeName.name),
            namespace: objectNamespace
        });
    }

    private convertContainer({
        container,
        unboxOptionals
    }: {
        container: ContainerType;
        unboxOptionals: boolean;
    }): Type {
        switch (container.type) {
            case "list":
                return Type.list(this.convert({ reference: container.list, unboxOptionals: true }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                if (value.internalType.type === "object") {
                    // object map values should be nullable.
                    return Type.map(key, csharp.Type.optional(value));
                }
                return Type.map(key, value);
            }
            case "set":
                return Type.set(this.convert({ reference: container.set, unboxOptionals: true }));
            case "optional":
                return unboxOptionals
                    ? this.convert({ reference: container.optional, unboxOptionals })
                    : Type.optional(this.convert({ reference: container.optional }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): Type {
        return PrimitiveTypeV1._visit<csharp.Type>(primitive.v1, {
            integer: () => csharp.Type.integer(),
            long: () => csharp.Type.long(),
            uint: () => csharp.Type.uint(),
            uint64: () => csharp.Type.ulong(),
            float: () => csharp.Type.float(),
            double: () => csharp.Type.double(),
            boolean: () => csharp.Type.boolean(),
            string: () => csharp.Type.string(),
            date: () => csharp.Type.date(),
            dateTime: () => csharp.Type.dateTime(),
            uuid: () => csharp.Type.string(),
            // https://learn.microsoft.com/en-us/dotnet/api/system.convert.tobase64string?view=net-8.0
            base64: () => csharp.Type.string(),
            bigInteger: () => csharp.Type.string(),
            _other: () => csharp.Type.object()
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): Type {
        switch (literal.type) {
            case "boolean":
                return csharp.Type.boolean();
            case "string":
                return csharp.Type.string();
        }
    }

    private convertNamed({ named }: { named: DeclaredTypeName }): Type {
        const objectClassReference = this.convertToClassReference(named);
        if (this.context.protobufResolver.isAnyWellKnownProtobufType(named.typeId)) {
            return csharp.Type.reference(objectClassReference);
        }
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "enum":
                return csharp.Type.reference(objectClassReference);
            case "object":
                return csharp.Type.reference(objectClassReference);
            case "union":
                return csharp.Type.object();
            case "undiscriminatedUnion": {
                return csharp.Type.oneOf(
                    typeDeclaration.shape.members.map((member) => {
                        return this.convert({ reference: member.type });
                    })
                );
            }
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
