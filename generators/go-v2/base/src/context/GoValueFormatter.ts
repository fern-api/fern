import { assertNever } from "@fern-api/core-utils";
import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext.js";

export declare namespace GoValueFormatter {
    interface Args {
        reference: FernIr.TypeReference;
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
        let unwrapPrefix: go.AstNode | undefined;
        let unwrapSuffix: go.AstNode | undefined;
        let isOptional = false;
        let isPrimitive = false;

        const optionalOrNullableType = this.context.maybeUnwrapOptionalOrNullable(reference);
        const enumType = this.context.maybeEnum(reference);

        // define unwrapPrefix (either "*", "string(*", or "string(")
        if (optionalOrNullableType != null) {
            if (this.context.needsOptionalDereference(reference)) {
                if (enumType != null) {
                    unwrapPrefix = go.codeblock("string(*");
                    unwrapSuffix = go.codeblock(")");
                } else {
                    unwrapPrefix = go.codeblock("*");
                }
            }
            isOptional = true;
        } else if (enumType != null) {
            unwrapPrefix = go.codeblock("string(");
            unwrapSuffix = go.codeblock(")");
        }

        // define prefix
        const primitive = this.context.maybePrimitive(reference);
        if (primitive != null) {
            switch (primitive) {
                case FernIr.PrimitiveTypeV1.DateTime:
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
                case FernIr.PrimitiveTypeV1.Date:
                    prefix = undefined;
                    suffix = go.codeblock('.Format("2006-01-02")');
                    break;
                case FernIr.PrimitiveTypeV1.Base64:
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
                case FernIr.PrimitiveTypeV1.Uuid:
                case FernIr.PrimitiveTypeV1.BigInteger:
                case FernIr.PrimitiveTypeV1.Integer:
                case FernIr.PrimitiveTypeV1.Long:
                case FernIr.PrimitiveTypeV1.Uint:
                case FernIr.PrimitiveTypeV1.Uint64:
                case FernIr.PrimitiveTypeV1.Float:
                case FernIr.PrimitiveTypeV1.Double:
                case FernIr.PrimitiveTypeV1.Boolean:
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
                case FernIr.PrimitiveTypeV1.String:
                    break;
                case FernIr.PrimitiveTypeV1.DateTimeRfc2822:
                    prefix = undefined;
                    suffix = go.codeblock((writer) => {
                        writer.write(".Format(");
                        writer.writeNode(
                            go.typeReference({
                                name: "RFC1123Z",
                                importPath: "time"
                            })
                        );
                        writer.write(")");
                    });
                    break;
                default:
                    assertNever(primitive);
            }
            isPrimitive = true;
        }

        // merge prefix and suffix with unwrap logic
        const mergedPrefix =
            unwrapPrefix != undefined
                ? prefix != undefined
                    ? go.codeblock((writer) => {
                          writer.writeNode(prefix);
                          writer.writeNode(unwrapPrefix);
                      })
                    : unwrapPrefix
                : prefix;
        const mergedSuffix =
            unwrapSuffix != undefined
                ? suffix != undefined
                    ? go.codeblock((writer) => {
                          writer.writeNode(unwrapSuffix);
                          writer.writeNode(suffix);
                      })
                    : unwrapSuffix
                : suffix;

        return {
            formatted: this.format({ prefix: mergedPrefix, suffix: mergedSuffix, value }),
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
