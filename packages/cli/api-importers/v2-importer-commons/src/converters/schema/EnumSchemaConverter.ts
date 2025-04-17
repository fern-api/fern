import { OpenAPIV3_1 } from "openapi-types";

import { Type } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector, FernEnumConfig } from "../..";

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

    public convert({ errorCollector }: { errorCollector: ErrorCollector }): EnumSchemaConverter.Output | undefined {
        if (!this.schema.enum) {
            return undefined;
        }

        const stringEnumValues = this.schema.enum.filter((value) => typeof value === "string");
        const values = stringEnumValues.map((value) => {
            const fernEnumValue = this.maybeFernEnum?.[value];
            const name = fernEnumValue?.name ?? value.toString();

            return {
                name: this.context.casingsGenerator.generateNameAndWireValue({
                    name,
                    wireValue: value.toString()
                }),
                docs: fernEnumValue?.description,
                availability: undefined,
                casing: fernEnumValue?.casing
            };
        });

        if (values.length === 0) {
            errorCollector.collect({
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
