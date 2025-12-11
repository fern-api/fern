import { ContainerType, Literal, Type, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, FernEnumConfig } from "../..";

export declare namespace EnumSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.SchemaObject;
        maybeFernEnum: FernEnumConfig | undefined;
    }

    export interface Output {
        type: Type;
    }
}

export class EnumSchemaConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    EnumSchemaConverter.Output
> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly maybeFernEnum: FernEnumConfig | undefined;

    constructor({ context, breadcrumbs, schema, maybeFernEnum }: EnumSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
        this.maybeFernEnum = maybeFernEnum;
    }

    public convert(): EnumSchemaConverter.Output | undefined {
        if (!this.schema.enum) {
            return undefined;
        }

        const enumValues = this.schema.enum.filter((value) => typeof value === "string" || typeof value === "number");

        if (enumValues.length === 0) {
            this.context.errorCollector.collect({
                message: `Received enum schema with no valid values: ${JSON.stringify(this.schema)}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        // If coerceEnumsToLiterals is enabled, single-value enums without fern enum config
        // should be converted to literals instead of enums
        if (
            this.context.settings.coerceEnumsToLiterals &&
            enumValues.length === 1 &&
            enumValues[0] != null &&
            this.maybeFernEnum == null
        ) {
            const value = enumValues[0];
            const literalValue = typeof value === "string" ? Literal.string(value) : Literal.string(value.toString());
            const literalTypeReference = TypeReference.container(ContainerType.literal(literalValue));
            return {
                type: Type.alias({
                    aliasOf: literalTypeReference,
                    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                    resolvedType: literalTypeReference as any
                })
            };
        }

        const values = enumValues.map((value) => {
            const stringValue = value.toString();
            const fernEnumValue = this.maybeFernEnum?.[stringValue];
            const name = fernEnumValue?.name ?? stringValue;

            return {
                name: this.context.casingsGenerator.generateNameAndWireValue({
                    name,
                    wireValue: stringValue
                }),
                docs: fernEnumValue?.description,
                availability: undefined,
                casing: fernEnumValue?.casing
            };
        });

        const default_ = this.context.getAsString(this.schema.default);
        return {
            type: Type.enum({
                default: default_ != null ? values.find((v) => v.name.wireValue === default_) : undefined,
                values
            })
        };
    }
}
