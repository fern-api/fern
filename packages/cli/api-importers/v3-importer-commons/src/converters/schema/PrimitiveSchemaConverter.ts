import {
    ContainerType,
    IntegerValidationRules,
    Literal,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    StringValidationRules,
    TypeReference
} from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";

export declare namespace PrimitiveSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.SchemaObject;
    }
}

export class PrimitiveSchemaConverter extends AbstractConverter<AbstractConverterContext<object>, TypeReference> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ context, breadcrumbs, schema }: PrimitiveSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
    }

    public convert(): TypeReference | undefined {
        switch (this.schema.type) {
            case "string": {
                const stringConst = this.context.getAsString(this.schema.const);
                if (stringConst != null) {
                    return TypeReference.container(ContainerType.literal(Literal.string(stringConst)));
                }

                if (this.context.settings.typeDatesAsStrings === false) {
                    if (this.schema.format === "date") {
                        return TypeReference.primitive({
                            v1: PrimitiveTypeV1.Date,
                            v2: PrimitiveTypeV2.date({})
                        });
                    } else if (this.schema.format === "date-time") {
                        return TypeReference.primitive({
                            v1: PrimitiveTypeV1.DateTime,
                            v2: PrimitiveTypeV2.dateTime({})
                        });
                    }
                }

                return TypeReference.primitive({
                    v1: "STRING",
                    v2: PrimitiveTypeV2.string({
                        default: this.context.getAsString(this.schema.default),
                        validation: this.getStringValidation(this.schema)
                    })
                });
            }
            case "number": {
                switch (this.schema.format) {
                    case "double": {
                        return TypeReference.primitive({
                            v1: "DOUBLE",
                            v2: PrimitiveTypeV2.double({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    }
                    case "float": {
                        return TypeReference.primitive({
                            v1: "FLOAT",
                            v2: PrimitiveTypeV2.float({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    }
                    case "int32":
                        return TypeReference.primitive({
                            v1: "INTEGER",
                            v2: PrimitiveTypeV2.integer({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "int64":
                        return TypeReference.primitive({
                            v1: "LONG",
                            v2: PrimitiveTypeV2.long({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "uint32":
                        return TypeReference.primitive({
                            v1: "UINT",
                            v2: PrimitiveTypeV2.uint({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "uint64":
                        return TypeReference.primitive({
                            v1: "UINT_64",
                            v2: PrimitiveTypeV2.uint64({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    default:
                        return TypeReference.primitive({
                            v1: "DOUBLE",
                            v2: PrimitiveTypeV2.double({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                }
            }
            case "integer":
                switch (this.schema.format) {
                    case "double":
                        return TypeReference.primitive({
                            v1: "DOUBLE",
                            v2: PrimitiveTypeV2.double({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "float":
                        return TypeReference.primitive({
                            v1: "FLOAT",
                            v2: PrimitiveTypeV2.float({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "int32":
                        return TypeReference.primitive({
                            v1: "INTEGER",
                            v2: PrimitiveTypeV2.integer({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "int64":
                        return TypeReference.primitive({
                            v1: "LONG",
                            v2: PrimitiveTypeV2.long({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "uint32":
                        return TypeReference.primitive({
                            v1: "UINT",
                            v2: PrimitiveTypeV2.uint({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    case "uint64":
                        return TypeReference.primitive({
                            v1: "UINT_64",
                            v2: PrimitiveTypeV2.uint64({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                    default:
                        return TypeReference.primitive({
                            v1: "INTEGER",
                            v2: PrimitiveTypeV2.integer({
                                default: this.context.getAsNumber(this.schema.default),
                                validation: this.getNumberValidation(this.schema)
                            })
                        });
                }
            case "boolean": {
                const booleanConst = this.context.getAsBoolean(this.schema.const);
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
        // Handle both OpenAPI 3.0 (boolean) and OpenAPI 3.1 (number) formats for exclusive bounds
        // OpenAPI 3.0: exclusiveMinimum/exclusiveMaximum are booleans that modify minimum/maximum
        // OpenAPI 3.1: exclusiveMinimum/exclusiveMaximum are numbers representing the actual bounds
        let min = schema.minimum;
        let max = schema.maximum;
        let exclusiveMin: boolean | undefined;
        let exclusiveMax: boolean | undefined;

        if (typeof schema.exclusiveMinimum === "boolean") {
            // OpenAPI 3.0 format: boolean flag
            exclusiveMin = schema.exclusiveMinimum;
        } else if (typeof schema.exclusiveMinimum === "number") {
            // OpenAPI 3.1 format: numeric value
            min = schema.exclusiveMinimum;
            exclusiveMin = true;
        }

        if (typeof schema.exclusiveMaximum === "boolean") {
            // OpenAPI 3.0 format: boolean flag
            exclusiveMax = schema.exclusiveMaximum;
        } else if (typeof schema.exclusiveMaximum === "number") {
            // OpenAPI 3.1 format: numeric value
            max = schema.exclusiveMaximum;
            exclusiveMax = true;
        }

        return {
            max,
            min,
            exclusiveMax,
            exclusiveMin,
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
