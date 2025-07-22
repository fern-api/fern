import { assertNever } from "@fern-api/core-utils";

import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext";

export declare namespace GoValueFormatter {
    interface Args {
        reference: TypeReference;
        value: go.AstNode;
    }

    interface Result {
        formatted: go.AstNode;
        zeroValue: go.AstNode;
        isIterable: boolean;
        isOptional: boolean;
        isPrimitive: boolean;
    }
}

export class GoValueFormatter {
    private context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>;

    constructor(context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference, value }: GoValueFormatter.Args): GoValueFormatter.Result {
        const iterableType = this.context.maybeUnwrapIterable(reference);
        if (iterableType != null) {
            const format = this.convert({ reference: iterableType, value });
            return {
                ...format,
                isIterable: true
            };
        }

        let prefix: go.AstNode | undefined;
        let suffix: go.AstNode | undefined;
        let isOptional = false;
        let isPrimitive = false;

        const optionalOrNullableType = this.context.maybeUnwrapOptionalOrNullable(reference);
        if (optionalOrNullableType != null) {
            if (this.context.needsOptionalDereference(reference)) {
                prefix = go.codeblock("*");
            }
            isOptional = true;
        }

        const primitive = this.context.maybePrimitive(reference);
        if (primitive != null) {
            if (isOptional) {
                prefix = go.codeblock("*");
            }
            switch (primitive) {
                case PrimitiveTypeV1.DateTime:
                    prefix = undefined;
                    suffix = go.codeblock((writer) => {
                        writer.write(".Format(");
                        writer.writeNode(
                            go.typeReference({
                                name: "RFC3339",
                                importPath: "time"
                            })
                        );
                        writer.write(")");
                    });
                    break;
                case PrimitiveTypeV1.Date:
                    prefix = undefined;
                    suffix = go.codeblock('.Format("2006-01-02")');
                    break;
                case PrimitiveTypeV1.Base64:
                    prefix = go.codeblock((writer) => {
                        writer.writeNode(
                            go.typeReference({
                                name: "StdEncoding",
                                importPath: "encoding/base64"
                            })
                        );
                        writer.write(".EncodeToString(");
                    });
                    suffix = go.codeblock(")");
                    break;
                case PrimitiveTypeV1.Uuid:
                case PrimitiveTypeV1.BigInteger:
                case PrimitiveTypeV1.Integer:
                case PrimitiveTypeV1.Long:
                case PrimitiveTypeV1.Uint:
                case PrimitiveTypeV1.Uint64:
                case PrimitiveTypeV1.Float:
                case PrimitiveTypeV1.Double:
                case PrimitiveTypeV1.Boolean:
                    prefix = go.codeblock((writer) => {
                        writer.writeNode(
                            go.typeReference({
                                name: "Sprintf",
                                importPath: "fmt"
                            })
                        );
                        writer.write('("%v", ');
                    });
                    suffix = go.codeblock(")");
                    break;
                case PrimitiveTypeV1.String:
                    break;
                default:
                    assertNever(primitive);
            }
            isPrimitive = true;
        }

        const enumType = this.context.maybeEnum(reference);
        if (enumType != null) {
            prefix = go.codeblock("string(");
            suffix = go.codeblock(")");
        }
        
        return {
            formatted: this.format({ prefix, suffix, value }),
            zeroValue: this.context.goZeroValueMapper.convert({ reference }),
            isIterable: false,
            isOptional,
            isPrimitive
        };
    }

    private format({
        prefix,
        suffix,
        value
    }: {
        prefix: go.AstNode | undefined;
        suffix: go.AstNode | undefined;
        value: go.AstNode;
    }): go.AstNode {
        return go.codeblock((writer) => {
            if (prefix != null) {
                writer.writeNode(prefix);
            }
            writer.writeNode(value);
            if (suffix != null) {
                writer.writeNode(suffix);
            }
        });
    }
}
