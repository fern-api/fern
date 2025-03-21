import { BaseJavaCustomConfigSchema, java } from "@fern-api/java-ast";

import { ContainerType, Literal, PrimitiveType, PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

import { assertNever } from "../../../../../packages/commons/core-utils/src";
import { AbstractJavaGeneratorContext } from "./AbstractJavaGeneratorContext";

export declare namespace JavaTypeMapper {
    interface Args {
        reference: TypeReference;
    }
}

export class JavaTypeMapper {
    private context: AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema>;
    private readonly wrappedAliases: boolean;

    constructor(context: AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema>) {
        this.context = context;
        this.wrappedAliases = this.context.customConfig["wrapped-aliases"] ?? false;
    }

    public convert({ reference }: JavaTypeMapper.Args): java.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({ container: reference.container });
            case "named":
                return this.convertNamed({ reference });
            case "primitive":
                return this.convertPrimitive({ primitive: reference.primitive });
            case "unknown":
                return java.Type.object();
            default:
                assertNever(reference);
        }
    }

    public convertNamed({ reference }: { reference: TypeReference & { type: "named" } }): java.Type {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(reference.typeId);

        if (!this.wrappedAliases && typeDeclaration.shape.type === "alias") {
            const resolved = typeDeclaration.shape.resolvedType;
            switch (resolved.type) {
                case "named":
                    return java.Type.reference(this.context.getJavaClassReferenceFromTypeId(resolved.name.typeId));
                case "primitive":
                    return this.convertPrimitive({ primitive: resolved.primitive });
                case "unknown":
                    return java.Type.object();
                case "container":
                    return this.convertContainer({ container: resolved.container });
                default:
                    assertNever(resolved);
            }
        }

        const typeId = reference.typeId;
        return java.Type.reference(this.context.getJavaClassReferenceFromTypeId(typeId));
    }

    public convertContainer({ container }: { container: ContainerType }): java.Type {
        switch (container.type) {
            case "list":
                return java.Type.list(this.convert({ reference: container.list }));
            case "map":
                return java.Type.map(
                    this.convert({ reference: container.keyType }),
                    this.convert({ reference: container.valueType })
                );
            case "set":
                return java.Type.set(this.convert({ reference: container.set }));
            case "optional":
                return java.Type.optional(this.convert({ reference: container.optional }));
            case "nullable":
                return java.Type.optional(this.convert({ reference: container.nullable }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    public convertLiteral({ literal }: { literal: Literal }): java.Type {
        switch (literal.type) {
            case "string":
                return java.Type.string();
            case "boolean":
                return java.Type.boolean();
            default:
                assertNever(literal);
        }
    }

    public convertPrimitive({ primitive }: { primitive: PrimitiveType }): java.Type {
        return PrimitiveTypeV1._visit<java.Type>(primitive.v1, {
            integer: () => java.Type.integer(),
            long: () => java.Type.integer(),
            uint: () => java.Type.integer(),
            uint64: () => java.Type.integer(),
            float: () => java.Type.float(),
            double: () => java.Type.float(),
            boolean: () => java.Type.boolean(),
            string: () => java.Type.string(),
            date: () => java.Type.date(),
            dateTime: () => java.Type.dateTime(),
            uuid: () => java.Type.string(),
            base64: () => java.Type.string(),
            bigInteger: () => java.Type.string(),
            _other: () => java.Type.object()
        });
    }
}
