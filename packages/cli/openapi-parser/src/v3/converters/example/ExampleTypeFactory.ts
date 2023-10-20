import { assertNever } from "@fern-api/core-utils";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { FullExample, PrimitiveExample } from "@fern-fern/openapi-ir-model/example";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { isSchemaRequired } from "../../utils/isSchemaRequrired";

export class ExampleTypeFactory {
    private schemas: Record<SchemaId, SchemaWithExample>;

    constructor(schemas: Record<SchemaId, SchemaWithExample>) {
        this.schemas = schemas;
    }

    public buildExampleFromSchemaId(schemaId: SchemaId): FullExample | undefined {
        const schema = this.schemas[schemaId];
        if (schema != null) {
            return this.buildExampleFromSchema({ schema, isOptional: false });
        }
        return undefined;
    }

    public buildExample(schema: SchemaWithExample): FullExample | undefined {
        return this.buildExampleFromSchema({ schema, isOptional: false });
    }

    public buildExampleFromSchema({
        schema,
        isOptional,
    }: {
        schema: SchemaWithExample;
        isOptional: boolean;
    }): FullExample | undefined {
        switch (schema.type) {
            case "enum":
                return schema.values[0] != null ? FullExample.enum(schema.values[0]?.value) : undefined;
            case "literal":
                return FullExample.literal(schema.value);
            case "nullable":
                return this.buildExampleFromSchema({ schema: schema.value, isOptional: true });
            case "optional":
                return this.buildExampleFromSchema({ schema: schema.value, isOptional: true });
            case "primitive": {
                const primitiveExample = this.buildExampleFromPrimitive(schema.schema);
                return primitiveExample != null ? FullExample.primitive(primitiveExample) : undefined;
            }
            case "reference": {
                const referencedSchemaWithExample = this.schemas[schema.schema];
                return referencedSchemaWithExample != null
                    ? this.buildExampleFromSchema({ schema: referencedSchemaWithExample, isOptional })
                    : undefined;
            }
            case "oneOf":
                return undefined;
            case "unknown":
                return undefined;
            case "array": {
                const itemExample = this.buildExampleFromSchema({ schema: schema.value, isOptional: true });
                if (isOptional) {
                    return itemExample != null ? FullExample.array([itemExample]) : undefined;
                }
                return itemExample != null ? FullExample.array([itemExample]) : FullExample.array([]);
            }
            case "map": {
                const keyExample = this.buildExampleFromPrimitive(schema.key.schema);
                const valueExample = this.buildExampleFromSchema({ schema: schema.value, isOptional: true });
                if (keyExample != null && valueExample != null) {
                    return FullExample.map([
                        {
                            key: keyExample,
                            value: valueExample,
                        },
                    ]);
                }
                return isOptional ? undefined : FullExample.map([]);
            }
            case "object": {
                let properties: Record<PropertyKey, FullExample> = {};
                for (const referencedAllOf of schema.allOf) {
                    const allOfSchemaWithExample = this.schemas[referencedAllOf.schema];
                    if (allOfSchemaWithExample == null) {
                        return undefined;
                    }
                    const allOfExample = this.buildExampleFromSchema({
                        schema: allOfSchemaWithExample,
                        isOptional: false,
                    });
                    if (allOfExample?.type === "object") {
                        properties = {
                            ...properties,
                            ...allOfExample.properties,
                        };
                    }
                }
                for (const objPropertyWithExample of schema.properties) {
                    const propertyExample = this.buildExampleFromSchema({
                        schema: objPropertyWithExample.schema,
                        isOptional: false,
                    });
                    if (isSchemaRequired(objPropertyWithExample.schema) && propertyExample == null) {
                        return undefined;
                    } else if (propertyExample != null) {
                        properties[objPropertyWithExample.key] = propertyExample;
                    }
                }
                schema.properties.forEach((objPropertyWithExample) => {
                    const propertyExample = this.buildExampleFromSchema({
                        schema: objPropertyWithExample.schema,
                        isOptional: false,
                    });
                    if (propertyExample != null) {
                        properties[objPropertyWithExample.key] = propertyExample;
                    }
                });
                return FullExample.object({
                    properties,
                });
            }
            default:
                assertNever(schema);
        }
    }

    private buildExampleFromPrimitive(primitiveSchema: PrimitiveSchemaValueWithExample): PrimitiveExample | undefined {
        switch (primitiveSchema.type) {
            case "string":
                return primitiveSchema.example != null ? PrimitiveExample.string(primitiveSchema.example) : undefined;
            case "base64":
                return primitiveSchema.example != null ? PrimitiveExample.base64(primitiveSchema.example) : undefined;
            case "boolean":
                return primitiveSchema.example != null ? PrimitiveExample.boolean(primitiveSchema.example) : undefined;
            case "date":
                return primitiveSchema.example != null ? PrimitiveExample.date(primitiveSchema.example) : undefined;
            case "datetime":
                return primitiveSchema.example != null ? PrimitiveExample.datetime(primitiveSchema.example) : undefined;
            case "double":
                return primitiveSchema.example != null ? PrimitiveExample.double(primitiveSchema.example) : undefined;
            case "float":
                return primitiveSchema.example != null ? PrimitiveExample.float(primitiveSchema.example) : undefined;
            case "int":
                return primitiveSchema.example != null ? PrimitiveExample.int(primitiveSchema.example) : undefined;
            case "int64":
                return primitiveSchema.example != null ? PrimitiveExample.int64(primitiveSchema.example) : undefined;
            default:
                assertNever(primitiveSchema);
        }
    }
}
