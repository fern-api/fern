import { isEqual, uniq, uniqWith } from "lodash-es";

import { Arguments, UnnamedArgument } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";

import { ObjectProperty } from "@fern-fern/ir-sdk/api";

import { php } from "..";
import { ClassInstantiation } from "../ast";
import { BasePhpCustomConfigSchema } from "../custom-config/BasePhpCustomConfigSchema";
import { parameter } from "../php";
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
                arguments: [`'${property.name.wireValue}'`]
            })
        );
        const underlyingInternalType = type.underlyingType().internalType;
        if (underlyingInternalType.type === "date" || underlyingInternalType.type === "dateTime") {
            attributes.push(
                php.attribute({
                    reference: this.context.getDateAttributeClassReference(),
                    arguments: [`Date::TYPE_${underlyingInternalType.type.toUpperCase()}`]
                })
            );
        }
        if (underlyingInternalType.type === "array" || underlyingInternalType.type === "map") {
            attributes.push(
                php.attribute({
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
                    php.attribute({
                        reference: this.context.getUnionClassReference(),
                        arguments: unionTypeParameters
                    })
                );
            }
        }
        return attributes;
    }

    public getUnionTypeClassRepresentation(arguments_: php.AstNode[]): ClassInstantiation {
        return php.instantiateClass({
            classReference: this.context.getUnionClassReference(),
            arguments_
        });
    }

    public getUnionTypeParameters({ types, isOptional }: { types: php.Type[]; isOptional?: boolean }): php.AstNode[] {
        const typeAttributeArguments = types.map((type) => this.getTypeAttributeArgument(type));
        // remove duplicates, such as "string" and "string" if enums and strings are both in the union
        return uniqWith([...typeAttributeArguments, ...(isOptional ? [php.codeblock("'null'")] : [])], isEqual);
    }

    public getTypeAttributeArgument(type: php.Type): php.AstNode {
        switch (type.internalType.type) {
            case "int":
                return php.codeblock("'integer'");
            case "string":
                return php.codeblock("'string'");
            case "bool":
                return php.codeblock("'bool'");
            case "float":
                return php.codeblock("'float'");
            case "date":
                return php.codeblock("'date'");
            case "dateTime":
                return php.codeblock("'datetime'");
            case "mixed":
                return php.codeblock("'mixed'");
            case "object":
                // This is likely not handled by our serde, but we also never use it.
                return php.codeblock("'object'");
            case "array":
                return php.array({
                    entries: [this.getTypeAttributeArgument(type.internalType.value)]
                });
            case "map": {
                return php.map({
                    entries: [
                        {
                            key: this.getTypeAttributeArgument(type.internalType.keyType),
                            value: this.getTypeAttributeArgument(type.internalType.valueType)
                        }
                    ]
                });
            }
            case "typeDict": {
                return php.map({
                    entries: [
                        {
                            key: php.codeblock("'string'"),
                            value: php.codeblock("'mixed'")
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
                return php.instantiateClass({
                    classReference: this.context.getUnionClassReference(),
                    arguments_: [this.getTypeAttributeArgument(type.internalType.value), php.codeblock("'null'")]
                });
            case "reference": {
                const reference = type.internalType.value;
                return php.codeblock((writer) => {
                    writer.writeNode(reference);
                    writer.write("::class");
                });
            }
            case "enumString":
                return php.codeblock("'string'");
            default:
                assertNever(type.internalType);
        }
    }
}
