import { TaskContext } from "@fern-api/task-context";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { InlinedTypeNamer } from "./InlinedTypeNamer";
import { OpenApiV3Context } from "./OpenApiV3Context";
import { getFernReferenceForSchema, isReferenceObject, maybeGetAliasReference } from "./utils";

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
        let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
        let typeDeclaration: RawSchemas.TypeDeclarationSchema | undefined = undefined;
        const extendedObjects: string[] = [];

        if (schema === "boolean" || schema.type === "boolean") {
            typeDeclaration = "boolean";
        } else if (schema === "number" || schema.type === "number") {
            typeDeclaration = "double";
        } else if (schema === "integer" || schema.type === "integer") {
            typeDeclaration = "integer";
        } else if (schema === "string" || schema.type === "string") {
            typeDeclaration = "string";
        } else if (schema.type === "array") {
            if (isReferenceObject(schema.items)) {
                typeDeclaration = `list<${getFernReferenceForSchema(schema.items, this.context)}>`;
            } else {
                const convertedSchema = this.convertSchema(schema.items, [...breadcrumbs, "items"]);
                if (convertedSchema == null) {
                    typeDeclaration = "list<unknown>";
                } else {
                    const maybeAliasType = maybeGetAliasReference(convertedSchema.typeDeclaration);
                    additionalTypeDeclarations = {
                        ...additionalTypeDeclarations,
                        ...convertedSchema.additionalTypeDeclarations,
                    };
                    if (maybeAliasType != null) {
                        typeDeclaration = `list<${maybeAliasType}>`;
                    } else {
                        const schemaName = this.inlinedTypeNamer.getName();
                        additionalTypeDeclarations[schemaName] = convertedSchema.typeDeclaration;
                        typeDeclaration = `list<${schemaName}>`;
                    }
                }
            }
        } else if (schema.enum != null) {
            typeDeclaration = {
                enum: schema.enum,
            };
        } else if (schema.type === "object" || schema.properties != null || schema.allOf != null) {
            schema.allOf?.map((parent, index) => {
                const parentBreadcrumbs = [...breadcrumbs, "allOf", `${index}`];
                if (isReferenceObject(parent)) {
                    extendedObjects.push(getFernReferenceForSchema(parent, this.context));
                } else {
                    const schemaName = this.inlinedTypeNamer.getName();
                    const convertedSchema = this.convertSchema(parent, [...breadcrumbs, "allOf", `${index}`]);
                    if (convertedSchema == null) {
                        this.taskContext.logger.warn(`${parentBreadcrumbs.join(" -> ")}: Failed to convert schema`);
                    } else {
                        extendedObjects.push(schemaName);
                        additionalTypeDeclarations = {
                            ...additionalTypeDeclarations,
                            [schemaName]: convertedSchema.typeDeclaration,
                        };
                    }
                }
            });

            if (schema.properties != null) {
                // its an object
                const objectDefinition: Record<string, string | RawSchemas.AliasSchema> = {};
                for (const [property, propertyType] of Object.entries(schema.properties)) {
                    let convertedPropertyType: string | RawSchemas.AliasSchema;
                    if (isReferenceObject(propertyType)) {
                        convertedPropertyType = getFernReferenceForSchema(propertyType, this.context);
                    } else {
                        const convertedSchema = this.convertSchema(propertyType, [...breadcrumbs, property]);
                        if (convertedSchema == null) {
                            this.taskContext.logger.warn(`${breadcrumbs.join(" -> ")}: Failed to convert ${property}`);
                            continue;
                        }
                        const maybeAliasType = maybeGetAliasReference(convertedSchema.typeDeclaration);
                        additionalTypeDeclarations = {
                            ...additionalTypeDeclarations,
                            ...convertedSchema.additionalTypeDeclarations,
                        };
                        if (maybeAliasType != null) {
                            convertedPropertyType = maybeAliasType;
                        } else {
                            const schemaName = this.inlinedTypeNamer.getName();
                            additionalTypeDeclarations[schemaName] = convertedSchema.typeDeclaration;
                            convertedPropertyType = schemaName;
                        }
                    }

                    if (schema.required == null || !schema.required.includes(property)) {
                        convertedPropertyType = `optional<${convertedPropertyType}>`;
                    }

                    objectDefinition[property] = convertedPropertyType;
                }
                typeDeclaration = {
                    extends: extendedObjects.length > 0 ? extendedObjects : undefined,
                    properties: objectDefinition,
                };
            } else if (extendedObjects.length > 0) {
                typeDeclaration = { extends: extendedObjects };
            }
        }

        if (typeDeclaration != null && schema.description != null) {
            if (typeof typeDeclaration === "string") {
                typeDeclaration = {
                    docs: schema.description,
                    type: typeDeclaration,
                };
            } else {
                typeDeclaration = {
                    docs: schema.description,
                    ...typeDeclaration,
                };
            }
        }

        return typeDeclaration != null ? { typeDeclaration, additionalTypeDeclarations } : undefined;
    }
}
