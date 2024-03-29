import { assertNever } from "@fern-api/core-utils";
import { LiteralSchemaValue, PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-api/openapi-ir-sdk";
import { recursivelyVisitRawTypeReference } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernTypeExtension({
    nameOverride,
    generatedName,
    schema,
    description
}: {
    nameOverride: string | undefined;
    generatedName: string;
    schema: OpenAPIV3.SchemaObject;
    description: string | undefined;
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
        description,
        groupName: typeof groupName === "string" ? [groupName] : groupName
    });
}

export function getSchemaFromFernType({
    fernType,
    nameOverride,
    generatedName,
    description,
    groupName
}: {
    fernType: string;
    nameOverride: string | undefined;
    generatedName: string;
    description: string | undefined;
    groupName: string[] | undefined;
}): SchemaWithExample | undefined {
    return recursivelyVisitRawTypeReference<SchemaWithExample | undefined>(fernType, {
        primitive: (primitive) => {
            switch (primitive) {
                case "BASE_64":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.base64({
                            example: undefined
                        })
                    });
                case "BOOLEAN":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.boolean({
                            example: undefined
                        })
                    });
                case "DATE":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.date({
                            example: undefined
                        })
                    });
                case "DATE_TIME":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.datetime({
                            example: undefined
                        })
                    });
                case "DOUBLE":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.double({
                            example: undefined
                        })
                    });
                case "INTEGER":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.int({
                            example: undefined
                        })
                    });
                case "LONG":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.int64({
                            example: undefined
                        })
                    });
                case "STRING":
                case "UUID":
                    return SchemaWithExample.primitive({
                        nameOverride,
                        generatedName,
                        description,
                        groupName,
                        schema: PrimitiveSchemaValueWithExample.string({
                            maxLength: undefined,
                            minLength: undefined,
                            example: undefined
                        })
                    });
                default:
                    assertNever(primitive);
            }
        },
        unknown: () => {
            return SchemaWithExample.unknown({
                nameOverride,
                generatedName,
                example: undefined,
                description,
                groupName
            });
        },
        map: ({ keyType, valueType }) =>
            keyType?.type === "primitive" && valueType != null
                ? SchemaWithExample.map({
                      nameOverride,
                      generatedName,
                      key: keyType,
                      value: valueType,
                      description,
                      groupName
                  })
                : undefined,
        list: (itemType) =>
            itemType != null
                ? SchemaWithExample.array({
                      nameOverride,
                      generatedName,
                      value: itemType,
                      description,
                      groupName
                  })
                : undefined,
        optional: (itemType) =>
            itemType != null
                ? SchemaWithExample.optional({
                      nameOverride,
                      generatedName,
                      value: itemType,
                      description,
                      groupName
                  })
                : undefined,
        set: (itemType) =>
            itemType != null
                ? SchemaWithExample.array({
                      nameOverride,
                      generatedName,
                      value: itemType,
                      description,
                      groupName
                  })
                : undefined,
        literal: (literal) =>
            SchemaWithExample.literal({
                nameOverride,
                generatedName,
                value: literal._visit<LiteralSchemaValue>({
                    string: (value) => LiteralSchemaValue.string(value),
                    boolean: (value) => LiteralSchemaValue.boolean(value),
                    _other: () => {
                        throw new Error("Unexpected literal type");
                    }
                }),
                description,
                groupName
            }),
        file: () => undefined,
        bytes: () => undefined,
        named: () => {
            return undefined;
        }
    });
}
