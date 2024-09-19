import { assertNever } from "@fern-api/core-utils";
import { ObjectProperty } from "@fern-fern/ir-sdk/api";
import { php } from "..";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { AbstractPhpGeneratorContext } from "./AbstractPhpGeneratorContext";

export declare namespace PhpAttributeMapper {
    interface Args {
        type: php.Type;

        // TODO: Remove the 'Pick' once 'availablity' is available on the InlinedRequestBodyProperty.
        property: Pick<ObjectProperty, "name">;
    }
}

export class PhpAttributeMapper {
    private context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>;

    constructor(context: AbstractPhpGeneratorContext<BasePhpCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ type, property }: PhpAttributeMapper.Args): php.Attribute[] {
        const attributes: php.Attribute[] = [];
        attributes.push(
            php.attribute({
                reference: this.context.getJsonPropertyAttributeClassReference(),
                arguments: [`"${property.name.wireValue}"`]
            })
        );
        const underlyingInternalType = type.underlyingType().internalType;
        if (underlyingInternalType.type === "date" || underlyingInternalType.type === "dateTime") {
            attributes.push(
                php.attribute({
                    reference: this.context.getDateTypeAttributeClassReference(),
                    arguments: [`DateType::TYPE_${underlyingInternalType.type.toUpperCase()}`]
                })
            );
        }
        if (underlyingInternalType.type === "array" || underlyingInternalType.type === "map") {
            attributes.push(
                php.attribute({
                    reference: this.context.getArrayTypeClassReference(),
                    arguments: [this.getArrayTypeAttributeArgument(type.underlyingType())]
                })
            );
        }
        return attributes;
    }

    private getArrayTypeAttributeArgument(type: php.Type): php.AstNode {
        switch (type.internalType.type) {
            case "int":
                return php.codeblock('"integer"');
            case "string":
                return php.codeblock('"string"');
            case "bool":
                return php.codeblock('"bool"');
            case "float":
                return php.codeblock('"float"');
            case "date":
                return php.codeblock('"date"');
            case "dateTime":
                return php.codeblock('"datetime"');
            case "mixed":
                return php.codeblock('"mixed"');
            case "object":
                // This is likely not handled by our serde, but we also never use it.
                return php.codeblock('"object"');
            case "array":
                return php.array({
                    entries: [this.getArrayTypeAttributeArgument(type.internalType.value)]
                });
            case "map": {
                return php.map({
                    entries: [
                        {
                            key: this.getArrayTypeAttributeArgument(type.internalType.keyType),
                            value: this.getArrayTypeAttributeArgument(type.internalType.valueType)
                        }
                    ]
                });
            }
            case "typeDict": {
                return php.map({
                    entries: [
                        {
                            key: php.codeblock('"string"'),
                            value: php.codeblock('"mixed"')
                        }
                    ]
                });
            }
            case "optional":
                return php.instantiateClass({
                    classReference: this.context.getUnionClassReference(),
                    arguments_: [this.getArrayTypeAttributeArgument(type.internalType.value), php.codeblock('"null"')]
                });
            case "reference": {
                const reference = type.internalType.value;
                return php.codeblock((writer) => {
                    writer.writeNode(reference);
                    writer.write("::class");
                });
            }
            default:
                assertNever(type.internalType);
        }
    }
}
