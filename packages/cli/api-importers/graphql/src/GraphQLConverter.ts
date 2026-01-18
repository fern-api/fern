import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import {
    buildSchema,
    GraphQLArgument as GQLArgument,
    GraphQLEnumType,
    GraphQLField,
    GraphQLInputObjectType,
    GraphQLInputType,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLUnionType
} from "graphql";

export interface GraphQLConverterResult {
    graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation>;
    types: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition>;
}

export class GraphQLConverter {
    private schema: GraphQLSchema | undefined;
    private context: TaskContext;
    private filePath: AbsoluteFilePath;
    private visitedTypes: Set<string> = new Set();
    private types: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition> = {};

    constructor({ context, filePath }: { context: TaskContext; filePath: AbsoluteFilePath }) {
        this.context = context;
        this.filePath = filePath;
    }

    public async convert(): Promise<GraphQLConverterResult> {
        const sdlContent = await readFile(this.filePath, "utf-8");
        this.schema = buildSchema(sdlContent);

        // First pass: collect all type definitions
        this.collectTypeDefinitions();

        const graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation> = {};

        const queryType = this.schema.getQueryType();
        if (queryType) {
            this.convertOperations(queryType, "QUERY", graphqlOperations);
        }

        const mutationType = this.schema.getMutationType();
        if (mutationType) {
            this.convertOperations(mutationType, "MUTATION", graphqlOperations);
        }

        const subscriptionType = this.schema.getSubscriptionType();
        if (subscriptionType) {
            this.convertOperations(subscriptionType, "SUBSCRIPTION", graphqlOperations);
        }

        return { graphqlOperations, types: this.types };
    }

    private collectTypeDefinitions(): void {
        if (!this.schema) {
            return;
        }

        const typeMap = this.schema.getTypeMap();
        for (const [typeName, type] of Object.entries(typeMap)) {
            // Skip built-in types
            if (typeName.startsWith("__")) {
                continue;
            }

            // Skip Query, Mutation, Subscription root types
            if (
                type === this.schema.getQueryType() ||
                type === this.schema.getMutationType() ||
                type === this.schema.getSubscriptionType()
            ) {
                continue;
            }

            // Skip scalar types (they don't need to be in the types map)
            if (type instanceof GraphQLScalarType) {
                continue;
            }

            const typeId = FdrAPI.TypeId(typeName);

            if (type instanceof GraphQLEnumType) {
                this.types[typeId] = {
                    name: typeName,
                    shape: this.convertEnumTypeDefinition(type),
                    displayName: undefined,
                    description: type.description ?? undefined,
                    availability: undefined
                };
            } else if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
                this.types[typeId] = {
                    name: typeName,
                    shape: this.convertObjectTypeDefinition(type),
                    displayName: undefined,
                    description: type.description ?? undefined,
                    availability: undefined
                };
            } else if (type instanceof GraphQLInputObjectType) {
                this.types[typeId] = {
                    name: typeName,
                    shape: this.convertInputObjectTypeDefinition(type),
                    displayName: undefined,
                    description: type.description ?? undefined,
                    availability: undefined
                };
            } else if (type instanceof GraphQLUnionType) {
                this.types[typeId] = {
                    name: typeName,
                    shape: this.convertUnionTypeDefinition(type),
                    displayName: undefined,
                    description: type.description ?? undefined,
                    availability: undefined
                };
            }
        }
    }

    private convertOperations(
        type: GraphQLObjectType,
        operationType: FdrAPI.api.v1.register.GraphQlOperationType,
        operations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation>
    ): void {
        const fields = type.getFields();
        for (const [fieldName, field] of Object.entries(fields)) {
            const operationId = FdrAPI.GraphQlOperationId(`${operationType.toLowerCase()}_${fieldName}`);
            operations[operationId] = this.convertField(field, fieldName, operationType);
        }
    }

    private convertField(
        field: GraphQLField<unknown, unknown>,
        name: string,
        operationType: FdrAPI.api.v1.register.GraphQlOperationType
    ): FdrAPI.api.v1.register.GraphQlOperation {
        const args = field.args.map((arg) => this.convertArgument(arg));

        return {
            id: FdrAPI.GraphQlOperationId(`${operationType.toLowerCase()}_${name}`),
            operationType,
            name,
            displayName: undefined,
            description: field.description ?? undefined,
            availability: undefined,
            arguments: args.length > 0 ? args : undefined,
            returnType: this.convertOutputType(field.type),
            examples: undefined,
            snippets: undefined
        };
    }

    private convertArgument(arg: GQLArgument): FdrAPI.api.v1.register.GraphQlArgument {
        return {
            name: arg.name,
            description: arg.description ?? undefined,
            availability: undefined,
            type: this.convertInputType(arg.type),
            defaultValue: arg.defaultValue
        };
    }

    private convertOutputType(type: GraphQLOutputType): FdrAPI.api.v1.register.TypeReference {
        if (type instanceof GraphQLNonNull) {
            const innerType = this.convertOutputType(type.ofType);
            return innerType;
        }

        if (type instanceof GraphQLList) {
            return {
                type: "list",
                itemType: this.convertOutputType(type.ofType),
                minItems: undefined,
                maxItems: undefined
            };
        }

        if (type instanceof GraphQLScalarType) {
            return this.convertScalarType(type);
        }

        if (type instanceof GraphQLEnumType) {
            return this.convertEnumType(type);
        }

        if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
            return this.convertObjectType(type);
        }

        if (type instanceof GraphQLUnionType) {
            return this.convertUnionType(type);
        }

        return {
            type: "unknown"
        };
    }

    private convertInputType(type: GraphQLInputType): FdrAPI.api.v1.register.TypeReference {
        if (type instanceof GraphQLNonNull) {
            const innerType = this.convertInputType(type.ofType);
            return innerType;
        }

        if (type instanceof GraphQLList) {
            return {
                type: "list",
                itemType: this.convertInputType(type.ofType),
                minItems: undefined,
                maxItems: undefined
            };
        }

        if (type instanceof GraphQLScalarType) {
            return this.convertScalarType(type);
        }

        if (type instanceof GraphQLEnumType) {
            return this.convertEnumType(type);
        }

        if (type instanceof GraphQLInputObjectType) {
            return this.convertInputObjectType(type);
        }

        return {
            type: "unknown"
        };
    }

    private convertScalarType(type: GraphQLScalarType): FdrAPI.api.v1.register.TypeReference {
        const scalarName = type.name.toLowerCase();
        switch (scalarName) {
            case "string":
            case "id":
                return {
                    type: "primitive",
                    value: {
                        type: "string",
                        format: undefined,
                        regex: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                        default: undefined
                    }
                };
            case "int":
                return {
                    type: "primitive",
                    value: {
                        type: "integer",
                        minimum: undefined,
                        maximum: undefined,
                        exclusiveMinimum: undefined,
                        exclusiveMaximum: undefined,
                        multipleOf: undefined,
                        default: undefined
                    }
                };
            case "float":
                return {
                    type: "primitive",
                    value: {
                        type: "double",
                        minimum: undefined,
                        maximum: undefined,
                        exclusiveMinimum: undefined,
                        exclusiveMaximum: undefined,
                        multipleOf: undefined,
                        default: undefined
                    }
                };
            case "boolean":
                return {
                    type: "primitive",
                    value: {
                        type: "boolean",
                        default: undefined
                    }
                };
            default:
                return {
                    type: "primitive",
                    value: {
                        type: "string",
                        format: undefined,
                        regex: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                        default: undefined
                    }
                };
        }
    }

    // Methods for returning type references (used when referencing types in operations)
    private convertEnumType(type: GraphQLEnumType): FdrAPI.api.v1.register.TypeReference {
        // Return a reference to the type in the types map
        return {
            type: "id",
            value: FdrAPI.TypeId(type.name),
            default: undefined
        };
    }

    private convertObjectType(type: GraphQLObjectType | GraphQLInterfaceType): FdrAPI.api.v1.register.TypeReference {
        // Return a reference to the type in the types map
        return {
            type: "id",
            value: FdrAPI.TypeId(type.name),
            default: undefined
        };
    }

    private convertInputObjectType(type: GraphQLInputObjectType): FdrAPI.api.v1.register.TypeReference {
        // Return a reference to the type in the types map
        return {
            type: "id",
            value: FdrAPI.TypeId(type.name),
            default: undefined
        };
    }

    private convertUnionType(type: GraphQLUnionType): FdrAPI.api.v1.register.TypeReference {
        // Return a reference to the type in the types map
        return {
            type: "id",
            value: FdrAPI.TypeId(type.name),
            default: undefined
        };
    }

    // Methods for creating type definitions (used when building the types map)
    private convertEnumTypeDefinition(type: GraphQLEnumType): FdrAPI.api.v1.register.TypeShape {
        const values = type.getValues();
        return {
            type: "enum",
            values: values.map((value) => ({
                value: value.name,
                description: value.description ?? undefined,
                availability: undefined
            })),
            default: undefined
        };
    }

    private convertObjectTypeDefinition(
        type: GraphQLObjectType | GraphQLInterfaceType
    ): FdrAPI.api.v1.register.TypeShape {
        const fields = type.getFields();
        const properties: FdrAPI.api.v1.register.ObjectProperty[] = [];

        for (const [fieldName, field] of Object.entries(fields)) {
            properties.push({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertOutputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            });
        }

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertInputObjectTypeDefinition(type: GraphQLInputObjectType): FdrAPI.api.v1.register.TypeShape {
        const fields = type.getFields();
        const properties: FdrAPI.api.v1.register.ObjectProperty[] = [];

        for (const [fieldName, field] of Object.entries(fields)) {
            properties.push({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertInputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            });
        }

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertUnionTypeDefinition(type: GraphQLUnionType): FdrAPI.api.v1.register.TypeShape {
        const types = type.getTypes();
        return {
            type: "undiscriminatedUnion",
            variants: types.map((t) => ({
                typeName: t.name,
                displayName: t.name,
                type: {
                    type: "id",
                    value: FdrAPI.TypeId(t.name),
                    default: undefined
                },
                description: t.description ?? undefined,
                availability: undefined
            }))
        };
    }
}
