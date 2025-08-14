import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { AbstractRubyGeneratorContext } from "./AbstractRubyGeneratorContext";

export declare namespace RubyTypeMapper {
    interface Args {
        reference: TypeReference;
        /* Defaults to false */
        unboxOptionals?: boolean;
        /* Defaults to false */
        fullyQualified?: boolean;
    }
}

export class RubyTypeMapper {
    private context: AbstractRubyGeneratorContext<object>;

    constructor(context: AbstractRubyGeneratorContext<object>) {
        this.context = context;
    }

    public convert({ reference, unboxOptionals = false, fullyQualified = false }: RubyTypeMapper.Args): ruby.Type {
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
                return ruby.Type.hash(ruby.Type.string(), ruby.Type.untyped());
            default:
                assertNever(reference);
        }
    }

    public convertFromFileProperty({ property }: { property: FernIr.FileProperty }): ruby.Type {
        switch (property.type) {
            case "file": {
                const rubyType = ruby.Type.string();
                return property.isOptional ? ruby.Type.nilable(rubyType) : rubyType;
            }
            case "fileArray": {
                const rubyType = ruby.Type.array(ruby.Type.string());
                return property.isOptional ? ruby.Type.nilable(rubyType) : rubyType;
            }
            default:
                assertNever(property);
        }
    }

    public convertToClassReference(
        declaredTypeName: DeclaredTypeName,
        { fullyQualified }: { fullyQualified?: boolean } = {}
    ): ruby.ClassReference {
        // In Ruby, modules are used for namespaces.
        const modules = [
            this.context.getRootModule().name,
            ...declaredTypeName.fernFilepath.allParts.map((part) => part.pascalCase.safeName)
        ];

        return ruby.classReference({
            name: declaredTypeName.name.pascalCase.safeName,
            modules,
            fullyQualified: !!fullyQualified
        });
    }

    private convertContainer({
        container,
        unboxOptionals
    }: {
        container: ContainerType;
        unboxOptionals: boolean;
    }): ruby.Type {
        switch (container.type) {
            case "list":
                return ruby.Type.array(this.convert({ reference: container.list, unboxOptionals: true }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                return ruby.Type.hash(key, value);
            }
            case "set":
                return ruby.Type.array(this.convert({ reference: container.set, unboxOptionals: true }));
            case "optional":
                return unboxOptionals
                    ? this.convert({ reference: container.optional, unboxOptionals })
                    : ruby.Type.nilable(this.convert({ reference: container.optional }));
            case "nullable":
                return unboxOptionals
                    ? this.convert({ reference: container.nullable, unboxOptionals })
                    : ruby.Type.nilable(this.convert({ reference: container.nullable }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): ruby.Type {
        return PrimitiveTypeV1._visit<ruby.Type>(primitive.v1, {
            integer: () => ruby.Type.integer(),
            long: () => ruby.Type.integer(),
            uint: () => ruby.Type.integer(),
            uint64: () => ruby.Type.integer(),
            float: () => ruby.Type.integer(),
            double: () => ruby.Type.integer(),
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
            default:
                assertNever(literal);
        }
    }

    private convertNamed({ named, fullyQualified }: { named: DeclaredTypeName; fullyQualified?: boolean }): ruby.Type {
        const classReference = this.convertToClassReference(named, { fullyQualified });
        // Ruby doesn't have protobuf, but if you want to support special types, add here.
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "enum":
                return ruby.Type.class_(classReference);
            case "object":
                return ruby.Type.class_(classReference);
            case "union":
                return ruby.Type.class_(classReference);
            case "undiscriminatedUnion": {
                return ruby.Type.class_(classReference);
            }
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
