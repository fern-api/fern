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
    graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.latest.GraphQlOperation>;
}

export class GraphQLConverter {
    private schema: GraphQLSchema | undefined;
    private context: TaskContext;
    private filePath: AbsoluteFilePath;
    private visitedTypes: Set<string> = new Set();

    constructor({ context, filePath }: { context: TaskContext; filePath: AbsoluteFilePath }) {
        this.context = context;
        this.filePath = filePath;
    }

    public async convert(): Promise<GraphQLConverterResult> {
        const sdlContent = await readFile(this.filePath, "utf-8");
        this.schema = buildSchema(sdlContent);

        const graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.latest.GraphQlOperation> = {};

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

        return { graphqlOperations };
    }

    private convertOperations(
        type: GraphQLObjectType,
        operationType: FdrAPI.api.latest.GraphQlOperationType,
        operations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.latest.GraphQlOperation>
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
        operationType: FdrAPI.api.latest.GraphQlOperationType
    ): FdrAPI.api.latest.GraphQlOperation {
        const args = field.args.map((arg) => this.convertArgument(arg));

        return {
            id: FdrAPI.GraphQlOperationId(`${operationType.toLowerCase()}_${name}`),
            operationType,
            name,
            displayName: undefined,
            description: field.description ?? undefined,
            availability: undefined,
            namespace: undefined,
            arguments: args.length > 0 ? args : undefined,
            returnType: this.convertOutputType(field.type),
            examples: undefined,
            snippets: undefined
        };
    }

    private convertArgument(arg: GQLArgument): FdrAPI.api.latest.GraphQlArgument {
        return {
            name: arg.name,
            description: arg.description ?? undefined,
            availability: undefined,
            type: this.convertInputType(arg.type),
            defaultValue: arg.defaultValue
        };
    }

    private convertOutputType(type: GraphQLOutputType): FdrAPI.api.latest.TypeShape {
        if (type instanceof GraphQLNonNull) {
            const innerType = this.convertOutputType(type.ofType);
            return innerType;
        }

        if (type instanceof GraphQLList) {
            return {
                type: "alias",
                value: {
                    type: "list",
                    itemShape: this.convertOutputType(type.ofType),
                    minItems: undefined,
                    maxItems: undefined
                }
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
            type: "alias",
            value: {
                type: "unknown",
                displayName: undefined
            }
        };
    }

    private convertInputType(type: GraphQLInputType): FdrAPI.api.latest.TypeShape {
        if (type instanceof GraphQLNonNull) {
            const innerType = this.convertInputType(type.ofType);
            return innerType;
        }

        if (type instanceof GraphQLList) {
            return {
                type: "alias",
                value: {
                    type: "list",
                    itemShape: this.convertInputType(type.ofType),
                    minItems: undefined,
                    maxItems: undefined
                }
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
            type: "alias",
            value: {
                type: "unknown",
                displayName: undefined
            }
        };
    }

    private convertScalarType(type: GraphQLScalarType): FdrAPI.api.latest.TypeShape {
        const scalarName = type.name.toLowerCase();
        switch (scalarName) {
            case "string":
            case "id":
                return {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: {
                            type: "string",
                            format: undefined,
                            regex: undefined,
                            minLength: undefined,
                            maxLength: undefined,
                            default: undefined
                        }
                    }
                };
            case "int":
                return {
                    type: "alias",
                    value: {
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
                    }
                };
            case "float":
                return {
                    type: "alias",
                    value: {
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
                    }
                };
            case "boolean":
                return {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: {
                            type: "boolean",
                            default: undefined
                        }
                    }
                };
            default:
                return {
                    type: "alias",
                    value: {
                        type: "primitive",
                        value: {
                            type: "string",
                            format: undefined,
                            regex: undefined,
                            minLength: undefined,
                            maxLength: undefined,
                            default: undefined
                        }
                    }
                };
        }
    }

    private convertEnumType(type: GraphQLEnumType): FdrAPI.api.latest.TypeShape {
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

    private convertObjectType(type: GraphQLObjectType | GraphQLInterfaceType): FdrAPI.api.latest.TypeShape {
        const typeName = type.name;

        if (this.visitedTypes.has(typeName)) {
            return {
                type: "alias",
                value: {
                    type: "unknown",
                    displayName: typeName
                }
            };
        }

        this.visitedTypes.add(typeName);

        const fields = type.getFields();
        const properties: FdrAPI.api.latest.ObjectProperty[] = [];

        for (const [fieldName, field] of Object.entries(fields)) {
            properties.push({
                key: FdrAPI.PropertyKey(fieldName),
                valueShape: this.convertOutputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            });
        }

        this.visitedTypes.delete(typeName);

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertInputObjectType(type: GraphQLInputObjectType): FdrAPI.api.latest.TypeShape {
        const typeName = type.name;

        if (this.visitedTypes.has(typeName)) {
            return {
                type: "alias",
                value: {
                    type: "unknown",
                    displayName: typeName
                }
            };
        }

        this.visitedTypes.add(typeName);

        const fields = type.getFields();
        const properties: FdrAPI.api.latest.ObjectProperty[] = [];

        for (const [fieldName, field] of Object.entries(fields)) {
            properties.push({
                key: FdrAPI.PropertyKey(fieldName),
                valueShape: this.convertInputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            });
        }

        this.visitedTypes.delete(typeName);

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertUnionType(type: GraphQLUnionType): FdrAPI.api.latest.TypeShape {
        const types = type.getTypes();
        return {
            type: "undiscriminatedUnion",
            variants: types.map((t) => ({
                displayName: t.name,
                shape: this.convertObjectType(t),
                description: t.description ?? undefined,
                availability: undefined
            }))
        };
    }
}
