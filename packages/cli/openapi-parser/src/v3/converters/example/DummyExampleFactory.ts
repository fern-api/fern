import { assertNever } from "@fern-api/core-utils";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { FullExample, PrimitiveExample } from "@fern-fern/openapi-ir-model/example";
import { PrimitiveSchemaWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { kebabCase } from "lodash-es";

export class DummyExampleFactory {
    private schemas: Record<SchemaId, SchemaWithExample>;

    constructor(schemas: Record<SchemaId, SchemaWithExample>) {
        this.schemas = schemas;
    }

    public generateExample({
        schema,
        name,
    }: {
        schema: SchemaWithExample;
        name: string | undefined;
    }): FullExample | undefined {
        return this.generateExampleFromSchema({ schema, name, visitedSchemaIds: new Set() });
    }

    private generateExampleFromSchema({
        schema,
        name,
        visitedSchemaIds,
    }: {
        schema: SchemaWithExample;
        name: string | undefined;
        visitedSchemaIds: Set<SchemaId>;
    }): FullExample | undefined {
        switch (schema.type) {
            case "literal":
                return FullExample.literal(schema.value);
            case "nullable":
                return this.generateExample({ schema: schema.value, name });
            case "optional":
                return this.generateExample({ schema: schema.value, name });
            case "primitive": {
                return FullExample.primitive(this.generateExampleFromPrimitive({ primitiveSchema: schema, name }));
            }
            case "reference": {
                const referencedSchemaWithExample = this.schemas[schema.schema];
                if (referencedSchemaWithExample != null && !visitedSchemaIds.has(schema.schema)) {
                    visitedSchemaIds.add(schema.schema);
                    const example = this.generateExampleFromSchema({
                        schema: referencedSchemaWithExample,
                        visitedSchemaIds,
                        name,
                    });
                    visitedSchemaIds.delete(schema.schema);
                    return example;
                }
                return undefined;
            }
            case "oneOf":
                return undefined;
            case "unknown":
                return undefined;
            case "array": {
                const itemExample = this.generateExample({ schema: schema.value, name: undefined });
                return itemExample != null ? FullExample.array([itemExample]) : FullExample.array([]);
            }
            case "map": {
                const keyExample = this.generateExampleFromPrimitive({ primitiveSchema: schema.key, name: undefined });
                const valueExample = this.generateExample({ schema: schema.value, name: undefined });
                if (valueExample != null) {
                    return FullExample.map([
                        {
                            key: keyExample,
                            value: valueExample,
                        },
                    ]);
                }
                return FullExample.map([]);
            }
            case "object": {
                return undefined;
            }
            case "enum": {
                return schema.values[0] != null ? FullExample.enum(schema.values[0].value) : undefined;
            }
            default:
                assertNever(schema);
        }
    }

    private generateExampleFromPrimitive({
        primitiveSchema,
        name,
    }: {
        primitiveSchema: PrimitiveSchemaWithExample;
        name: string | undefined;
    }): PrimitiveExample {
        switch (primitiveSchema.schema.type) {
            case "string":
                return name != null ? PrimitiveExample.string(kebabCase(name)) : PrimitiveExample.string("value");
            case "int":
            case "int64":
                return PrimitiveExample.int(1);
            case "double":
            case "float":
                return PrimitiveExample.double(1.1);
            case "boolean":
                return PrimitiveExample.boolean(true);
            case "datetime":
                return PrimitiveExample.datetime("2023-01-01T00:00:00Z");
            case "base64":
                return PrimitiveExample.base64("SGVsbG8gV29ybGQ=");
            case "date":
                return PrimitiveExample.date("2023-01-01");
            default:
                assertNever(primitiveSchema.schema);
        }
    }
}
