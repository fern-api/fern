import { assertNever } from "@fern-api/core-utils";
import { recursivelyVisitRawTypeReference } from "@fern-api/yaml-schema";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export function getFernTypeExtension({
    schema,
    description
}: {
    schema: OpenAPIV3.SchemaObject;
    description: string | undefined;
}): SchemaWithExample | undefined {
    const typeDefinition = getExtension<string>(schema, FernOpenAPIExtension.TYPE_DEFINITION);
    if (typeDefinition == null) {
        return;
    }
    return recursivelyVisitRawTypeReference<SchemaWithExample | undefined>(typeDefinition, {
        primitive: (primitive) => {
            switch (primitive) {
                case "BASE_64":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.base64({
                            example: undefined
                        })
                    });
                case "BOOLEAN":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.boolean({
                            example: undefined
                        })
                    });
                case "DATE":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.date({
                            example: undefined
                        })
                    });
                case "DATE_TIME":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.datetime({
                            example: undefined
                        })
                    });
                case "DOUBLE":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.double({
                            example: undefined
                        })
                    });
                case "INTEGER":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.int({
                            example: undefined
                        })
                    });
                case "LONG":
                    return SchemaWithExample.primitive({
                        description,
                        schema: PrimitiveSchemaValueWithExample.int64({
                            example: undefined
                        })
                    });
                case "STRING":
                case "UUID":
                    return SchemaWithExample.primitive({
                        description,
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
                example: undefined,
                description
            });
        },
        map: ({ keyType, valueType }) =>
            keyType?.type === "primitive" && valueType != null
                ? SchemaWithExample.map({
                      key: keyType,
                      value: valueType,
                      description
                  })
                : undefined,
        list: (itemType) =>
            itemType != null
                ? SchemaWithExample.array({
                      value: itemType,
                      description
                  })
                : undefined,
        optional: (itemType) =>
            itemType != null
                ? SchemaWithExample.optional({
                      value: itemType,
                      description
                  })
                : undefined,
        set: (itemType) =>
            itemType != null
                ? SchemaWithExample.array({
                      value: itemType,
                      description
                  })
                : undefined,
        literal: (literal) =>
            SchemaWithExample.literal({
                value: literal,
                description
            }),
        named: () => {
            return undefined;
        }
    });
}
