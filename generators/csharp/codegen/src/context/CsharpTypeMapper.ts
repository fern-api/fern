import { assertNever } from "@fern-api/core-utils";
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
import { ast } from "../";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { is } from "../utils/type-guards";
import { WithGeneration } from "../with-generation";
import { CsharpGeneratorContext } from "./CsharpGeneratorContext";

export declare namespace CsharpTypeMapper {
    interface Args {
        reference: TypeReference;
        /* Defaults to false */
        unboxOptionals?: boolean;
        /* Defaults to false */
        fullyQualified?: boolean;
    }
}

export class CsharpTypeMapper extends WithGeneration {
    constructor(private readonly context: CsharpGeneratorContext<BaseCsharpCustomConfigSchema>) {
        super(context);
    }

    public convert({ reference, unboxOptionals = false, fullyQualified = false }: CsharpTypeMapper.Args): ast.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container,
                    unboxOptionals
                });
            case "named":
                return this.convertNamed({ named: reference, fullyQualified });
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return this.csharp.Type.object;
            default:
                assertNever(reference);
        }
    }

    public convertFromFileProperty({ property }: { property: FernIr.FileProperty }): ast.Type {
        switch (property.type) {
            case "file": {
                const csharpType = this.csharp.Type.fileParam(this.types.FileParameter);
                return property.isOptional ? this.csharp.Type.optional(csharpType) : csharpType;
            }
            case "fileArray": {
                const csharpType = this.csharp.Type.list(this.csharp.Type.fileParam(this.types.FileParameter));
                return property.isOptional ? this.csharp.Type.optional(csharpType) : csharpType;
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
        unboxOptionals
    }: {
        container: ContainerType;
        unboxOptionals: boolean;
    }): ast.Type {
        switch (container.type) {
            case "list":
                return this.csharp.Type.list(this.convert({ reference: container.list, unboxOptionals: true }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                if (is.Type.object(value)) {
                    // object map values should be nullable.
                    return this.csharp.Type.map(key, this.csharp.Type.optional(value));
                }
                return this.csharp.Type.map(key, value);
            }
            case "set":
                return this.csharp.Type.set(this.convert({ reference: container.set, unboxOptionals: true }));
            case "optional":
                return unboxOptionals
                    ? this.convert({ reference: container.optional, unboxOptionals })
                    : this.csharp.Type.optional(this.convert({ reference: container.optional }));
            case "nullable":
                return unboxOptionals
                    ? this.convert({ reference: container.nullable, unboxOptionals })
                    : this.csharp.Type.optional(this.convert({ reference: container.nullable }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): ast.Type {
        return PrimitiveTypeV1._visit<ast.Type>(primitive.v1, {
            integer: () => this.csharp.Type.integer,
            long: () => this.csharp.Type.long,
            uint: () => this.csharp.Type.uint,
            uint64: () => this.csharp.Type.ulong,
            float: () => this.csharp.Type.float,
            double: () => this.csharp.Type.double,
            boolean: () => this.csharp.Type.boolean,
            string: () => this.csharp.Type.string,
            date: () => this.csharp.Type.dateOnly,
            dateTime: () => this.csharp.Type.dateTime,
            uuid: () => this.csharp.Type.string,
            // https://learn.microsoft.com/en-us/dotnet/api/system.convert.tobase64string?view=net-8.0
            base64: () => this.csharp.Type.string,
            bigInteger: () => this.csharp.Type.string,
            _other: () => this.csharp.Type.object
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): ast.Type {
        switch (literal.type) {
            case "boolean":
                return this.csharp.Type.boolean;
            case "string":
                return this.csharp.Type.string;
        }
    }

    private convertNamed({ named, fullyQualified }: { named: DeclaredTypeName; fullyQualified?: boolean }): ast.Type {
        const objectClassReference = this.convertToClassReference(named, { fullyQualified });
        if (this.context.protobufResolver.isWellKnownProtobufType(named.typeId)) {
            if (this.context.protobufResolver.isWellKnownAnyProtobufType(named.typeId)) {
                return this.csharp.Type.object;
            }
            return this.csharp.Type.reference(objectClassReference);
        }

        const typeDeclaration = this.model.dereferenceType(named.typeId).typeDeclaration;
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "enum":
                return this.csharp.Type.reference(objectClassReference);
            case "object":
                return this.csharp.Type.reference(objectClassReference);
            case "union":
                if (this.settings.shouldGeneratedDiscriminatedUnions) {
                    return this.csharp.Type.reference(objectClassReference);
                }
                return this.csharp.Type.object;
            case "undiscriminatedUnion": {
                return this.csharp.Type.oneOf(
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
