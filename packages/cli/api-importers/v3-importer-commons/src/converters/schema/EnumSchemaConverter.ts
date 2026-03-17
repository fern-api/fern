import { replaceSpecialCharsWithWords } from "@fern-api/core-utils";
import { Type } from "@fern-api/ir-sdk";
import { camelCase, upperFirst } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, FernEnumConfig } from "../../index.js";

const VALID_ENUM_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export declare namespace EnumSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.SchemaObject;
        maybeFernEnum: FernEnumConfig | undefined;
        forwardCompatible?: boolean;
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
    private readonly forwardCompatible: boolean;

    constructor({ context, breadcrumbs, schema, maybeFernEnum, forwardCompatible }: EnumSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
        this.maybeFernEnum = maybeFernEnum;
        this.forwardCompatible = forwardCompatible ?? false;
    }

    public convert(): EnumSchemaConverter.Output | undefined {
        if (!this.schema.enum) {
            return undefined;
        }

        const enumValues = this.schema.enum.filter((value) => typeof value === "string" || typeof value === "number");
        const values = enumValues.map((value) => {
            const stringValue = value.toString();
            const fernEnumValue = this.maybeFernEnum?.[stringValue];
            const rawName = fernEnumValue?.name ?? stringValue;
            const name = sanitizeEnumName(rawName);

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
                values,
                forwardCompatible: this.forwardCompatible || undefined
            })
        };
    }
}

function sanitizeEnumName(name: string): string {
    if (VALID_ENUM_NAME_REGEX.test(name)) {
        return name;
    }
    const withWords = replaceSpecialCharsWithWords(name);
    const converted = upperFirst(camelCase(withWords));
    if (converted.length > 0 && VALID_ENUM_NAME_REGEX.test(converted)) {
        return converted;
    }
    return name;
}
