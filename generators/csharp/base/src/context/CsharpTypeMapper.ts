import { assertNever } from "@fern-api/core-utils";
import { ast, is, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    NamedType,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { GeneratorContext } from "./GeneratorContext";

export declare namespace CsharpTypeMapper {
    interface Args {
        reference: TypeReference;
        /* Defaults to false. When true, unwraps optional<T> containers and returns T instead of T? */
        unboxOptionals?: boolean;
        /* Defaults to false. When true, unwraps nullable<T> containers (removes ? marker). When false, preserves nullable markers. */
        unboxNullable?: boolean;
        /* Defaults to false */
        fullyQualified?: boolean;
    }
}

export class CsharpTypeMapper extends WithGeneration {
    public constructor(private readonly context: GeneratorContext) {
        super(context.generation);
    }
    public convert({
        reference,
        unboxOptionals = false,
        unboxNullable = false,
        fullyQualified = false
    }: CsharpTypeMapper.Args): ast.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container,
                    unboxOptionals,
                    unboxNullable
                });
            case "named":
                return this.convertNamed({ named: reference, fullyQualified });
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return this.Primitive.object;
            default:
                assertNever(reference);
        }
    }

    public convertFromFileProperty({ property }: { property: FernIr.FileProperty }): ast.Type {
        switch (property.type) {
            case "file": {
                return property.isOptional ? this.Types.FileParameter.asOptional() : this.Types.FileParameter;
            }
            case "fileArray": {
                return property.isOptional ? this.Types.FileParameter.asOptional() : this.Types.FileParameter;
            }
            default:
                assertNever(property);
        }
    }

    public convertToClassReference(
        typeDeclarationOrNamedType: TypeDeclaration | NamedType | DeclaredTypeName,
        { fullyQualified }: { fullyQualified?: boolean } = {}
    ): ast.ClassReference {
        const { typeId, typeDeclaration } = this.model.dereferenceType(typeDeclarationOrNamedType);
        const objectNamespace = this.context.getNamespaceForTypeId(typeId);
        return this.csharp.classReference({
            namespace: objectNamespace,
            origin: typeDeclaration,
            fullyQualified
        });
    }

    private convertContainer({
        container,
        unboxOptionals,
        unboxNullable
    }: {
        container: ContainerType;
        unboxOptionals: boolean;
        unboxNullable: boolean;
    }): ast.Type {
        switch (container.type) {
            case "list":
                return this.Collection.list(
                    this.convert({ reference: container.list, unboxOptionals: true, unboxNullable: false })
                );
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({
                    reference: container.valueType,
                    unboxOptionals: true,
                    unboxNullable: false
                });
                if (is.Primitive.object(value)) {
                    // object map values should be nullable.
                    return this.Collection.map(key, value.asOptional());
                }
                return this.Collection.map(key, value);
            }
            case "set":
                return this.Collection.set(
                    this.convert({ reference: container.set, unboxOptionals: true, unboxNullable: false })
                );
            case "optional": {
                if (unboxOptionals) {
                    return this.convert({ reference: container.optional, unboxOptionals, unboxNullable });
                }

                // Use experimental explicit nullable/optional handling if enabled
                if (this.generation.settings.enableExplicitNullableOptional) {
                    // Check if the inner type is nullable
                    const innerType = container.optional;
                    const isInnerNullable = innerType.type === "container" && innerType.container.type === "nullable";

                    // If optional wraps nullable (optional<nullable<T>>), use Optional<T?> wrapper
                    // Otherwise, use T? to rely on JSON serialization's default omit-if-null behavior
                    if (isInnerNullable) {
                        return this.asOptionalWrapper(this.convert({ reference: innerType, unboxNullable }));
                    } else {
                        return this.convert({ reference: innerType, unboxNullable }).asOptional();
                    }
                } else {
                    // Legacy behavior: always use T? for optional
                    return this.convert({ reference: container.optional, unboxNullable }).asOptional();
                }
            }
            case "nullable":
                // When unboxNullable is false (the default), preserve the nullable marker
                // This ensures nullable<T> inside collections becomes T? not T
                if (!unboxNullable) {
                    // Preserve nullable: convert inner type and add ? marker
                    // Pass through unboxOptionals to handle cases like nullable<optional<T>>
                    return this.convert({
                        reference: container.nullable,
                        unboxOptionals,
                        unboxNullable: false
                    }).asNullable();
                }

                // If unboxNullable is true, unwrap the nullable without adding ?
                // (This case is not currently used but included for completeness)
                return this.convert({ reference: container.nullable, unboxOptionals, unboxNullable: false });
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    /**
     * Wraps a type in Optional<T> for explicit optional/undefined semantics.
     * If the type is already an OptionalWrapper, returns it unchanged to avoid double-wrapping.
     */
    private asOptionalWrapper(type: ast.Type): ast.Type {
        // Prevent double-wrapping Optional<Optional<T>>
        if (is.OptionalWrapper(type)) {
            return type;
        }
        return new ast.OptionalWrapper(type, this.generation);
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): ast.Type {
        return PrimitiveTypeV1._visit<ast.Type>(primitive.v1, {
            integer: () => this.Primitive.integer,
            long: () => this.Primitive.long,
            uint: () => this.Primitive.uint,
            uint64: () => this.Primitive.ulong,
            float: () => this.Primitive.float,
            double: () => this.Primitive.double,
            boolean: () => this.Primitive.boolean,
            string: () => this.Primitive.string,
            date: () => this.Value.dateOnly,
            dateTime: () => this.Value.dateTime,
            uuid: () => this.Primitive.string,
            // https://learn.microsoft.com/en-us/dotnet/api/system.convert.tobase64string?view=net-8.0
            base64: () => this.Primitive.string,
            bigInteger: () => this.Primitive.string,
            _other: () => this.Primitive.object
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): ast.Type {
        switch (literal.type) {
            case "boolean":
                return this.Primitive.boolean;
            case "string":
                return this.Primitive.string;
        }
    }

    private convertNamed({ named, fullyQualified }: { named: DeclaredTypeName; fullyQualified?: boolean }): ast.Type {
        const objectClassReference = this.convertToClassReference(named, { fullyQualified });
        if (this.context.protobufResolver.isWellKnownProtobufType(named.typeId)) {
            if (this.context.protobufResolver.isWellKnownAnyProtobufType(named.typeId)) {
                return this.Primitive.object;
            }
            return objectClassReference;
        }

        const typeDeclaration = this.model.dereferenceType(named.typeId).typeDeclaration;
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "enum":
                return objectClassReference;
            case "object":
                return objectClassReference;
            case "union":
                if (this.settings.shouldGeneratedDiscriminatedUnions) {
                    return objectClassReference;
                }
                return this.Primitive.object;
            case "undiscriminatedUnion": {
                if (this.settings.shouldGenerateUndiscriminatedUnions) {
                    return objectClassReference;
                }
                return this.OneOf.OneOf(
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
