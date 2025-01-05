import { OpenAPIV3 } from "openapi-types";

import { assertNever } from "@fern-api/core-utils";
import { recursivelyVisitRawTypeReference } from "@fern-api/fern-definition-schema";
import {
    Availability,
    LiteralSchemaValue,
    PrimitiveSchemaValueWithExample,
    SchemaWithExample
} from "@fern-api/openapi-ir";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernTypeExtension({
    nameOverride,
    generatedName,
    title,
    schema,
    description,
    availability
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    schema: OpenAPIV3.SchemaObject;
    description: string | undefined;
    availability: Availability | undefined;
}): SchemaWithExample | undefined {
    const groupName = getExtension(schema, FernOpenAPIExtension.SDK_GROUP_NAME);
    const fernType = getExtension<string>(schema, FernOpenAPIExtension.TYPE_DEFINITION);
    if (fernType == null) {
        return;
    }
    return getSchemaFromFernType({
        fernType,
        nameOverride,
        generatedName,
        title,
        description,
        availability,
        groupName: typeof groupName === "string" ? [groupName] : groupName
    });
}

export function getSchemaFromFernType({
    fernType,
    nameOverride,
    generatedName,
    title,
    description,
    availability,
    groupName
}: {
    fernType: string;
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    groupName: string[] | undefined;
}): SchemaWithExample | undefined {
    return recursivelyVisitRawTypeReference<SchemaWithExample | undefined>({
        type: fernType,
        _default: undefined,
        validation: undefined,
        visitor: {
            primitive: (primitive) => {
                switch (primitive.v1) {
                    case "BASE_64":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.base64({
                                example: undefined
                            })
                        });
                    case "BOOLEAN":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.boolean({
                                default: undefined,
                                example: undefined
                            })
                        });
                    case "DATE":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.date({
                                example: undefined
                            })
                        });
                    case "DATE_TIME":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.datetime({
                                example: undefined
                            })
                        });
                    case "FLOAT":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.float({
                                example: undefined
                            })
                        });
                    case "DOUBLE":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.double({
                                default: undefined,
                                minimum: undefined,
                                maximum: undefined,
                                exclusiveMinimum: undefined,
                                exclusiveMaximum: undefined,
                                multipleOf: undefined,
                                example: undefined
                            })
                        });
                    case "UINT":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.uint({
                                default: undefined,
                                example: undefined
                            })
                        });
                    case "INTEGER":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.int({
                                default: undefined,
                                minimum: undefined,
                                maximum: undefined,
                                exclusiveMinimum: undefined,
                                exclusiveMaximum: undefined,
                                multipleOf: undefined,
                                example: undefined
                            })
                        });
                    case "UINT_64":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.uint64({
                                default: undefined,
                                example: undefined
                            })
                        });
                    case "LONG":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.int64({
                                default: undefined,
                                example: undefined
                            })
                        });
                    case "STRING":
                    case "UUID":
                    case "BIG_INTEGER":
                        return SchemaWithExample.primitive({
                            nameOverride,
                            generatedName,
                            title,
                            description,
                            availability,
                            groupName,
                            schema: PrimitiveSchemaValueWithExample.string({
                                default: undefined,
                                pattern: undefined,
                                maxLength: undefined,
                                minLength: undefined,
                                example: undefined,
                                format: undefined
                            })
                        });
                    default:
                        assertNever(primitive.v1);
                }
            },
            unknown: () => {
                return SchemaWithExample.unknown({
                    nameOverride,
                    generatedName,
                    title,
                    example: undefined,
                    description,
                    availability,
                    groupName
                });
            },
            map: ({ keyType, valueType }) =>
                keyType?.type === "primitive" && valueType != null
                    ? SchemaWithExample.map({
                          nameOverride,
                          generatedName,
                          title,
                          key: keyType,
                          value: valueType,
                          description,
                          availability,
                          groupName,
                          encoding: undefined,
                          example: undefined,
                          inline: undefined
                      })
                    : undefined,
            list: (itemType) =>
                itemType != null
                    ? SchemaWithExample.array({
                          nameOverride,
                          generatedName,
                          title,
                          value: itemType,
                          description,
                          availability,
                          groupName,
                          example: undefined,
                          inline: undefined
                      })
                    : undefined,
            optional: (itemType) =>
                itemType != null
                    ? SchemaWithExample.optional({
                          nameOverride,
                          generatedName,
                          title,
                          value: itemType,
                          description,
                          availability,
                          groupName,
                          inline: undefined
                      })
                    : undefined,
            set: (itemType) =>
                itemType != null
                    ? SchemaWithExample.array({
                          nameOverride,
                          generatedName,
                          title,
                          value: itemType,
                          description,
                          availability,
                          groupName,
                          example: undefined,
                          inline: undefined
                      })
                    : undefined,
            literal: (literal) =>
                SchemaWithExample.literal({
                    nameOverride,
                    generatedName,
                    title,
                    value: literal._visit<LiteralSchemaValue>({
                        string: (value) => LiteralSchemaValue.string(value),
                        boolean: (value) => LiteralSchemaValue.boolean(value),
                        _other: () => {
                            throw new Error("Unexpected literal type");
                        }
                    }),
                    description,
                    availability,
                    groupName
                }),
            named: () => {
                return undefined;
            }
        }
    });
}
