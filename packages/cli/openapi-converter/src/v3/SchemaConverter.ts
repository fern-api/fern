import { TaskContext } from "@fern-api/task-context";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { InlinedTypeNamer } from "./InlinedTypeNamer";
import { OpenApiV3Context } from "./OpenApiV3Context";
import { getFernReferenceForSchema, isReferenceObject } from "./utils";

export interface ConvertedSchema {
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    additionalTypeDeclarations?: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export class SchemaConverter {
    private schema: OpenAPIV3.SchemaObject;
    private taskContext: TaskContext;
    private inlinedTypeNamer: InlinedTypeNamer;
    private context: OpenApiV3Context;
    private rootBreadcrumbs: string[];

    constructor({
        schema,
        taskContext,
        inlinedTypeNamer,
        context,
        breadcrumbs,
    }: {
        schema: OpenAPIV3.SchemaObject;
        taskContext: TaskContext;
        inlinedTypeNamer: InlinedTypeNamer;
        context: OpenApiV3Context;
        breadcrumbs: string[];
    }) {
        this.schema = schema;
        this.taskContext = taskContext;
        this.inlinedTypeNamer = inlinedTypeNamer;
        this.context = context;
        this.rootBreadcrumbs = breadcrumbs;
    }

    public convert(): ConvertedSchema | undefined {
        return this.convertSchema(this.schema, this.rootBreadcrumbs);
    }

    private convertSchema(schema: OpenAPIV3.SchemaObject, breadcrumbs: string[]): ConvertedSchema | undefined {
        let primitiveSchema: string | undefined = undefined;
        if (schema === "boolean") {
            primitiveSchema = "boolean";
        } else if (schema === "number") {
            primitiveSchema = "double";
        } else if (schema === "integer") {
            primitiveSchema = "integer";
        } else if (schema === "string") {
            primitiveSchema = "string";
        }

        if (primitiveSchema != null) {
            return schema.description != null
                ? { typeDeclaration: primitiveSchema }
                : {
                      typeDeclaration: {
                          type: primitiveSchema,
                          docs: schema.description,
                      },
                  };
        }

        if (schema.enum != null) {
            return {
                typeDeclaration: {
                    docs: schema.description,
                    enum: schema.enum,
                },
            };
        }

        let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
        if (schema.properties != null) {
            // its an object
            const objectDefinition: Record<string, string> = {};
            for (const [property, propertyType] of Object.entries(schema.properties)) {
                let convertedPropertyType: RawSchemas.TypeDeclarationSchema;
                if (isReferenceObject(propertyType)) {
                    convertedPropertyType = getFernReferenceForSchema(propertyType, this.context);
                } else {
                    const schemaName = this.inlinedTypeNamer.getName();
                    const convertedSchema = this.convertSchema(propertyType, [...breadcrumbs, property]);

                    if (convertedSchema == null) {
                        this.taskContext.logger.warn(`${breadcrumbs.join(" -> ")}: Failed to convert ${property}`);
                        continue;
                    }

                    additionalTypeDeclarations = {
                        ...additionalTypeDeclarations,
                        ...convertedSchema.additionalTypeDeclarations,
                    };
                    additionalTypeDeclarations[schemaName] = convertedSchema.typeDeclaration;
                    convertedPropertyType = schemaName;
                }

                if (schema.required == null || !schema.required.includes(property)) {
                    convertedPropertyType = `optional<${convertedPropertyType}>`;
                }

                objectDefinition[property] = convertedPropertyType;
            }
            return { typeDeclaration: { properties: objectDefinition }, additionalTypeDeclarations };
        }

        return undefined;
    }
}
