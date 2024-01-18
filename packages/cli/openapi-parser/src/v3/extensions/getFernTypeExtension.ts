import { assertNever } from "@fern-api/core-utils";
import { recursivelyVisitRawTypeReference } from "@fern-api/yaml-schema";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

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
    const groupName = getExtension<string>(schema, FernOpenAPIExtension.SDK_GROUP_NAME);
    const typeDefinition = getExtension<string>(schema, FernOpenAPIExtension.TYPE_DEFINITION);
    if (typeDefinition == null) {
        return;
    }
    return recursivelyVisitRawTypeReference<SchemaWithExample | undefined>(typeDefinition, {
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
                value: literal,
                description,
                groupName
            }),
        named: () => {
            return undefined;
        }
    });
}
