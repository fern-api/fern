import { assertNever } from "@fern-api/core-utils";

import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

import { go } from "../";
import { BaseGoCustomConfigSchema } from "../custom-config/BaseGoCustomConfigSchema";
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

        let prefix = "";
        let suffix = "";
        let isOptional = false;
        let isPrimitive = false;

        const optionalOrNullableType = this.context.maybeUnwrapOptionalOrNullable(reference);
        if (optionalOrNullableType != null) {
            if (this.context.needsOptionalDereference(optionalOrNullableType)) {
                prefix = "*";
            }
            isOptional = true;
        }

        const primitive = this.context.maybePrimitive(reference);
        if (primitive != null) {
            if (isOptional) {
                prefix = "*";
            }
            switch (primitive) {
                case PrimitiveTypeV1.DateTime:
                    prefix = "";
                    suffix = ".Format(time.RFC3339)";
                    break;
                case PrimitiveTypeV1.Date:
                    prefix = "";
                    suffix = '.Format("2006-01-02")';
                    break;
                case PrimitiveTypeV1.Base64:
                    prefix = "base64.StdEncoding.EncodeToString(" + prefix + ")";
                    suffix = ")";
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
                case PrimitiveTypeV1.String:
                    break;
                default:
                    assertNever(primitive);
            }
            isPrimitive = true;
        }

        return {
            formatted: this.format({ prefix, suffix, value }),
            zeroValue: this.context.goZeroValueMapper.convert({ reference }),
            isIterable: false,
            isOptional,
            isPrimitive
        };
    }

    private format({ prefix, suffix, value }: { prefix: string; suffix: string; value: go.AstNode }): go.AstNode {
        return go.codeblock((writer) => {
            writer.write(prefix);
            writer.writeNode(value);
            writer.write(suffix);
        });
    }
}
