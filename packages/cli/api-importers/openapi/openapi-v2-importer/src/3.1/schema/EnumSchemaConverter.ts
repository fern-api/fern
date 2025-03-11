import { OpenAPIV3_1 } from "openapi-types";

import { Type } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector, FernEnumConfig } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace EnumSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
        maybeFernEnum: FernEnumConfig | undefined;
    }

    export interface Output {
        enum: Type;
    }
}

export class EnumSchemaConverter extends AbstractConverter<OpenAPIConverterContext3_1, EnumSchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly maybeFernEnum: FernEnumConfig | undefined;

    constructor({ breadcrumbs, schema, maybeFernEnum }: EnumSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
        this.maybeFernEnum = maybeFernEnum;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): EnumSchemaConverter.Output | undefined {
        if (!this.schema.enum) {
            return undefined;
        }

        // Only keep string enum values
        const stringEnumValues = this.schema.enum.filter((value) => typeof value === "string");

        const values = stringEnumValues.map((value) => {
            const fernEnumValue = this.maybeFernEnum?.[value];
            const name = fernEnumValue?.name ?? value.toString();

            return {
                name: context.casingsGenerator.generateNameAndWireValue({
                    name,
                    wireValue: value.toString()
                }),
                docs: fernEnumValue?.description,
                availability: undefined,
                casing: fernEnumValue?.casing
            };
        });

        if (values.length === 0) {
            return undefined;
        }

        const default_ = context.getAsString(this.schema.default);
        return {
            enum: Type.enum({
                default: default_ != null ? values.find((v) => v.name.wireValue === default_) : undefined,
                values
            })
        };
    }
}
