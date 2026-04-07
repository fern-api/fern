import { getNameFromWireValue, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext.js";

const IGNORE_TAG = "-";
const OMIT_EMPTY_TAG = "omitempty";

export declare namespace GoFieldMapper {
    /* The default set of tags included in every exported struct field. */
    type Tag = "json" | "url";

    interface Args {
        /* The name of the field. */
        name: FernIr.NameAndWireValueOrString;
        /* The type of the field. */
        reference: FernIr.TypeReference;
        /* The docs of the field, if any. */
        docs?: string;
        /* The set of tags to include in the field. */
        includeTags?: GoFieldMapper.Tag[];
    }
}

export class GoFieldMapper {
    private context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>;

    constructor(context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ name, reference, docs, includeTags = ["json", "url"] }: GoFieldMapper.Args): go.Field {
        const nameValue = getNameFromWireValue(name);
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container,
                    name,
                    reference,
                    docs,
                    includeTags
                });
            case "named":
            case "primitive":
            case "unknown":
                return go.field({
                    name: this.context.getFieldName(nameValue),
                    type: this.context.goTypeMapper.convert({ reference }),
                    tags: this.getTags({ name, reference, includeTags }),
                    docs
                });
            default:
                assertNever(reference);
        }
    }

    private convertContainer({
        container,
        name,
        reference,
        docs,
        includeTags
    }: {
        container: FernIr.ContainerType;
        name: FernIr.NameAndWireValueOrString;
        reference: FernIr.TypeReference;
        docs?: string;
        includeTags: GoFieldMapper.Tag[];
    }): go.Field {
        const nameValue = getNameFromWireValue(name);
        switch (container.type) {
            case "literal":
                return this.convertLiteral({ name, literal: container.literal });
            case "list":
            case "map":
            case "set":
            case "optional":
            case "nullable":
                return go.field({
                    name: this.context.getFieldName(nameValue),
                    type: this.context.goTypeMapper.convert({ reference }),
                    tags: this.getTags({ name, reference, includeTags }),
                    docs
                });
            default:
                assertNever(container);
        }
    }

    private convertLiteral({
        name,
        literal
    }: {
        name: FernIr.NameAndWireValueOrString;
        literal: FernIr.Literal;
    }): go.Field {
        const nameValue = getNameFromWireValue(name);
        switch (literal.type) {
            case "boolean":
                return go.field({
                    name: this.context.getLiteralFieldName(nameValue),
                    type: go.Type.bool()
                });
            case "string":
                return go.field({
                    name: this.context.getLiteralFieldName(nameValue),
                    type: go.Type.string()
                });
            default:
                assertNever(literal);
        }
    }

    private getTags({
        name,
        reference,
        includeTags
    }: {
        name: FernIr.NameAndWireValueOrString;
        reference: FernIr.TypeReference;
        includeTags: GoFieldMapper.Tag[];
    }): go.Field.Tag[] {
        const includedTags = new Set<GoFieldMapper.Tag>(includeTags);
        return [
            this.getTag({ name, reference, includedTags, tag: "json" }),
            this.getTag({ name, reference, includedTags, tag: "url" })
        ];
    }

    private getTag({
        name,
        reference,
        includedTags,
        tag
    }: {
        name: FernIr.NameAndWireValueOrString;
        reference: FernIr.TypeReference;
        includedTags: Set<GoFieldMapper.Tag>;
        tag: GoFieldMapper.Tag;
    }): go.Field.Tag {
        if (!includedTags.has(tag)) {
            return {
                name: tag,
                value: IGNORE_TAG
            };
        }
        const wireValue = getWireValue(name);
        const isOptional = this.context.isOptional(reference);
        if (isOptional) {
            return {
                name: tag,
                value: `${wireValue},${OMIT_EMPTY_TAG}`
            };
        }
        return {
            name: tag,
            value: wireValue
        };
    }
}
