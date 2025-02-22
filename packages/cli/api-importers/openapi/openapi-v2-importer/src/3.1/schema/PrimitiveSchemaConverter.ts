import { OpenAPIV3_1 } from "openapi-types";

import {
    ContainerType,
    IntegerValidationRules,
    Literal,
    PrimitiveTypeV2,
    StringValidationRules,
    TypeReference
} from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace PrimitiveSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
    }
}

export class PrimitiveSchemaConverter extends AbstractConverter<OpenAPIConverterContext3_1, TypeReference> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: PrimitiveSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): TypeReference | undefined {
        switch (this.schema.type) {
            case "string": {
                const stringConst = context.getAsString(this.schema.const);
                if (stringConst != null) {
                    return TypeReference.container(ContainerType.literal(Literal.string(stringConst)));
                }
                return TypeReference.primitive({
                    v1: "STRING",
                    v2: PrimitiveTypeV2.string({
                        default: context.getAsString(this.schema.default),
                        validation: this.getStringValidation(this.schema)
                    })
                });
            }
            case "number":
            case "integer":
                switch (this.schema.format) {
                    case "double":
                    case undefined:
                        return TypeReference.primitive({
                            v1: "DOUBLE",
                            v2: PrimitiveTypeV2.double({
                                default: context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "float":
                        return TypeReference.primitive({
                            v1: "FLOAT",
                            v2: PrimitiveTypeV2.float({
                                default: context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "int32":
                        return TypeReference.primitive({
                            v1: "INTEGER",
                            v2: PrimitiveTypeV2.integer({
                                default: context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "int64":
                        return TypeReference.primitive({
                            v1: "LONG",
                            v2: PrimitiveTypeV2.long({
                                default: context.getAsNumber(this.schema.default)
                                // TODO: add validation here
                            })
                        });
                    case "uint32":
                        return TypeReference.primitive({
                            v1: "UINT",
                            v2: PrimitiveTypeV2.uint({
                                default: context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "uint64":
                        return TypeReference.primitive({
                            v1: "UINT_64",
                            v2: PrimitiveTypeV2.uint64({
                                default: context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    default:
                        return TypeReference.primitive({
                            v1: "INTEGER",
                            v2: PrimitiveTypeV2.integer({
                                default: context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                }
            case "boolean": {
                const booleanConst = context.getAsBoolean(this.schema.const);
                if (booleanConst != null) {
                    return TypeReference.container(ContainerType.literal(Literal.boolean(booleanConst)));
                }
                return TypeReference.primitive({
                    v1: "BOOLEAN",
                    v2: PrimitiveTypeV2.boolean({
                        default: this.schema.default as boolean | undefined
                    })
                });
            }
            default:
                return undefined;
        }
    }

    private getNumberValidation(schema: OpenAPIV3_1.SchemaObject): IntegerValidationRules | undefined {
        return {
            max: schema.maximum,
            min: schema.minimum,
            exclusiveMax: typeof schema.exclusiveMaximum === "boolean" ? schema.exclusiveMaximum : undefined,
            exclusiveMin: typeof schema.exclusiveMinimum === "boolean" ? schema.exclusiveMinimum : undefined,
            multipleOf: schema.multipleOf
        };
    }

    private getStringValidation(schema: OpenAPIV3_1.SchemaObject): StringValidationRules | undefined {
        return {
            minLength: schema.minLength,
            maxLength: schema.maxLength,
            pattern: schema.pattern,
            format: schema.format
        };
    }
}
