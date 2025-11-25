import { Type } from "@fern-api/ir-sdk";
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

        // Check if enum contains only null values
        const hasOnlyNulls = this.schema.enum.length > 0 && this.schema.enum.every((value) => value === null);
        if (hasOnlyNulls) {
            // An enum with only null values cannot be represented as a Fern enum.
            // Return undefined to let the caller fall back to an appropriate type (e.g., unknown).
            return undefined;
        }

        const enumValues = this.schema.enum.filter((value) => typeof value === "string" || typeof value === "number");
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

        if (values.length === 0) {
            this.context.errorCollector.collect({
                message: `Received enum schema with no valid values: ${JSON.stringify(this.schema)}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        const default_ = this.context.getAsString(this.schema.default);
        return {
            type: Type.enum({
                default: default_ != null ? values.find((v) => v.name.wireValue === default_) : undefined,
                values
            })
        };
    }
}
