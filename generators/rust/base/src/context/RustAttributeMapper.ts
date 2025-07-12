import { isEqual, uniqWith } from "lodash-es";

import { assertNever } from "@fern-api/core-utils";
import { BaseRustCustomConfigSchema, rust } from "@fern-api/rust-codegen";

import { ObjectProperty } from "@fern-fern/ir-sdk/api";

import { AbstractRustGeneratorContext } from "./AbstractRustGeneratorContext";

export declare namespace RustAttributeMapper {
    interface Args {
        type: rust.Type;

        // TODO: Remove the 'Pick' once 'availability' is available on the InlinedRequestBodyProperty.
        property: Pick<ObjectProperty, "name">;
    }
}

export class RustAttributeMapper {
    private context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>;

    constructor(context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ type, property }: RustAttributeMapper.Args): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];
        attributes.push(
            rust.attribute({
                reference: this.context.getJsonPropertyAttributeClassReference(),
                arguments: [`'${property.name.wireValue}'`]
            })
        );
        const underlyingInternalType = type.underlyingType().internalType;
        if (underlyingInternalType.type === "date" || underlyingInternalType.type === "dateTime") {
            attributes.push(
                rust.attribute({
                    reference: this.context.getDateAttributeClassReference(),
                    arguments: [`Date::TYPE_${underlyingInternalType.type.toUpperCase()}`]
                })
            );
        }
        if (underlyingInternalType.type === "array" || underlyingInternalType.type === "map") {
            attributes.push(
                rust.attribute({
                    reference: this.context.getArrayTypeClassReference(),
                    arguments: [this.getTypeAttributeArgument(type.underlyingType())]
                })
            );
        }
        if (underlyingInternalType.type === "union") {
            const unionTypeParameters = this.getUnionTypeParameters({
                types: underlyingInternalType.types,
                isOptional: type.isOptional()
            });
            // only add the attribute if deduping in getUnionTypeParameters resulted in more than one type
            if (unionTypeParameters.length > 1) {
                attributes.push(
                    rust.attribute({
                        reference: this.context.getUnionClassReference(),
                        arguments: unionTypeParameters
                    })
                );
            }
        }
        return attributes;
    }

    public getUnionTypeClassRepresentation(arguments_: rust.AstNode[]): rust.StructInstantiation {
        return rust.instantiateStruct({
            structReference: this.context.getUnionClassReference(),
            arguments_
        });
    }

    public getUnionTypeParameters({ types, isOptional }: { types: rust.Type[]; isOptional?: boolean }): rust.AstNode[] {
        const typeAttributeArguments = types.map((type) => this.getTypeAttributeArgument(type));
        // remove duplicates, such as "string" and "string" if enums and strings are both in the union
        return uniqWith([...typeAttributeArguments, ...(isOptional ? [rust.codeblock("'null'")] : [])], isEqual);
    }

    public getTypeAttributeArgument(type: rust.Type): rust.AstNode {
        switch (type.internalType.type) {
            case "int":
                return rust.codeblock("'integer'");
            case "string":
                return rust.codeblock("'string'");
            case "bool":
                return rust.codeblock("'bool'");
            case "float":
                return rust.codeblock("'float'");
            case "date":
                return rust.codeblock("'date'");
            case "dateTime":
                return rust.codeblock("'datetime'");
            case "mixed":
                return rust.codeblock("'mixed'");
            case "object":
                // This is likely not handled by our serde, but we also never use it.
                return rust.codeblock("'object'");
            case "array":
                return rust.array({
                    entries: [this.getTypeAttributeArgument(type.internalType.value)]
                });
            case "map": {
                return rust.map({
                    entries: [
                        {
                            key: this.getTypeAttributeArgument(type.internalType.keyType),
                            value: this.getTypeAttributeArgument(type.internalType.valueType)
                        }
                    ]
                });
            }
            case "typeDict": {
                return rust.map({
                    entries: [
                        {
                            key: rust.codeblock("'string'"),
                            value: rust.codeblock("'mixed'")
                        }
                    ]
                });
            }
            case "union": {
                const unionTypeParameters = this.getUnionTypeParameters({ types: type.internalType.types });
                if (unionTypeParameters.length === 1) {
                    if (unionTypeParameters[0] == null) {
                        throw new Error("Unexpected empty union type parameters");
                    }
                    return unionTypeParameters[0];
                }
                return this.getUnionTypeClassRepresentation(unionTypeParameters);
            }
            case "optional":
                return rust.instantiateStruct({
                    structReference: this.context.getUnionClassReference(),
                    arguments_: [this.getTypeAttributeArgument(type.internalType.value), rust.codeblock("'null'")]
                });
            case "null":
                return rust.codeblock("'null'");
            case "reference": {
                const reference = type.internalType.value;
                return rust.codeblock((writer) => {
                    writer.writeNode(reference);
                    writer.write("::class");
                });
            }
            case "enumString":
                return rust.codeblock("'string'");
            case "literal":
                {
                    switch (type.internalType.value.internalType.type) {
                        case "string":
                            return rust.codeblock("'string'");
                        case "boolean":
                            return rust.codeblock("'bool'");
                        default:
                            assertNever(type.internalType.value.internalType);
                    }
                }
                // NOTE: The linter complains if we don't have this here
                break;
            default:
                assertNever(type.internalType);
        }
    }
}
