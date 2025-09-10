import { assertNever } from "@fern-api/core-utils";
import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { ContainerType, Literal, NameAndWireValue, TypeReference } from "@fern-fern/ir-sdk/api";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext";

const IGNORE_TAG = "-";
const OMIT_EMPTY_TAG = "omitempty";

export declare namespace GoFieldMapper {
    /* The default set of tags included in every exported struct field. */
    type Tag = "json" | "url";

    interface Args {
        /* The name of the field. */
        name: NameAndWireValue;
        /* The type of the field. */
        reference: TypeReference;
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
                    name: this.context.getFieldName(name.name),
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
        container: ContainerType;
        name: NameAndWireValue;
        reference: TypeReference;
        docs?: string;
        includeTags: GoFieldMapper.Tag[];
    }): go.Field {
        switch (container.type) {
            case "literal":
                return this.convertLiteral({ name, literal: container.literal });
            case "list":
            case "map":
            case "set":
            case "optional":
            case "nullable":
                return go.field({
                    name: this.context.getFieldName(name.name),
                    type: this.context.goTypeMapper.convert({ reference }),
                    tags: this.getTags({ name, reference, includeTags }),
                    docs
                });
            default:
                assertNever(container);
        }
    }

    private convertLiteral({ name, literal }: { name: NameAndWireValue; literal: Literal }): go.Field {
        switch (literal.type) {
            case "boolean":
                return go.field({
                    name: this.context.getLiteralFieldName(name.name),
                    type: go.Type.bool()
                });
            case "string":
                return go.field({
                    name: this.context.getLiteralFieldName(name.name),
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
        name: NameAndWireValue;
        reference: TypeReference;
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
        name: NameAndWireValue;
        reference: TypeReference;
        includedTags: Set<GoFieldMapper.Tag>;
        tag: GoFieldMapper.Tag;
    }): go.Field.Tag {
        if (!includedTags.has(tag)) {
            return {
                name: tag,
                value: IGNORE_TAG
            };
        }
        const isOptional = this.context.isOptional(reference);
        if (isOptional) {
            return {
                name: tag,
                value: `${name.wireValue},${OMIT_EMPTY_TAG}`
            };
        }
        return {
            name: tag,
            value: name.wireValue
        };
    }
}
