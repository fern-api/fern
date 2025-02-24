import { OpenAPIV3_1 } from "openapi-types";

import { Type } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace EnumSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
    }

    export interface Output {
        enum: Type;
    }
}

export class EnumSchemaConverter extends AbstractConverter<OpenAPIConverterContext3_1, EnumSchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: EnumSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
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

        const values = stringEnumValues.map((value) => ({
            name: context.casingsGenerator.generateNameAndWireValue({
                name: value.toString(),
                wireValue: value.toString()
            }),
            docs: undefined,
            availability: undefined
        }));

        if (values.length === 0) {
            return undefined;
        }

        const default_ = context.getAsString(this.schema.default);
        return {
            enum: Type.enum({
                // TODO: add an error check if the schema.default is a valid enum value
                default:
                    default_ != null
                        ? {
                              name: context.casingsGenerator.generateNameAndWireValue({
                                  name: default_,
                                  wireValue: default_
                              }),
                              docs: undefined,
                              availability: undefined
                          }
                        : undefined,
                values
            })
        };
    }
}
