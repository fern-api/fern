import { FernRegistry } from "@fern-api/fdr-sdk";
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
    graphqlOperations: Record<FernRegistry.GraphQlOperationId, FernRegistry.api.latest.GraphQlOperation>;
}

export class GraphQLConverter {
    private schema: GraphQLSchema | undefined;
    private context: TaskContext;
    private filePath: AbsoluteFilePath;

    constructor({ context, filePath }: { context: TaskContext; filePath: AbsoluteFilePath }) {
        this.context = context;
        this.filePath = filePath;
    }

    public async convert(): Promise<GraphQLConverterResult> {
        const sdlContent = await readFile(this.filePath, "utf-8");
        this.schema = buildSchema(sdlContent);

        const graphqlOperations: Record<FernRegistry.GraphQlOperationId, FernRegistry.api.latest.GraphQlOperation> = {};

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
        operationType: FernRegistry.api.latest.GraphQlOperationType,
        operations: Record<FernRegistry.GraphQlOperationId, FernRegistry.api.latest.GraphQlOperation>
    ): void {
        const fields = type.getFields();
        for (const [fieldName, field] of Object.entries(fields)) {
            const operationId = FernRegistry.GraphQlOperationId(`${operationType.toLowerCase()}_${fieldName}`);
            operations[operationId] = this.convertField(field, fieldName, operationType);
        }
    }

    private convertField(
        field: GraphQLField<unknown, unknown>,
        name: string,
        operationType: FernRegistry.api.latest.GraphQlOperationType
    ): FernRegistry.api.latest.GraphQlOperation {
        const args = field.args.map((arg) => this.convertArgument(arg));

        return {
            id: FernRegistry.GraphQlOperationId(`${operationType.toLowerCase()}_${name}`),
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

    private convertArgument(arg: GQLArgument): FernRegistry.api.latest.GraphQlArgument {
        return {
            name: arg.name,
            description: arg.description ?? undefined,
            availability: undefined,
            type: this.convertInputType(arg.type),
            defaultValue: arg.defaultValue
        };
    }

    private convertOutputType(type: GraphQLOutputType): FernRegistry.api.latest.TypeShape {
        if (type instanceof GraphQLNonNull) {
            const innerType = this.convertOutputType(type.ofType);
            return innerType;
        }

        if (type instanceof GraphQLList) {
            return {
                type: "list",
                itemShape: this.convertOutputType(type.ofType)
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
            type: "unknown",
            displayName: undefined
        };
    }

    private convertInputType(type: GraphQLInputType): FernRegistry.api.latest.TypeShape {
        if (type instanceof GraphQLNonNull) {
            const innerType = this.convertInputType(type.ofType);
            return innerType;
        }

        if (type instanceof GraphQLList) {
            return {
                type: "list",
                itemShape: this.convertInputType(type.ofType)
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
            type: "unknown",
            displayName: undefined
        };
    }

    private convertScalarType(type: GraphQLScalarType): FernRegistry.api.latest.TypeShape {
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
                            regex: undefined,
                            minLength: undefined,
                            maxLength: undefined,
                            default: undefined
                        }
                    }
                };
        }
    }

    private convertEnumType(type: GraphQLEnumType): FernRegistry.api.latest.TypeShape {
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

    private convertObjectType(type: GraphQLObjectType | GraphQLInterfaceType): FernRegistry.api.latest.TypeShape {
        const fields = type.getFields();
        const properties: FernRegistry.api.latest.ObjectProperty[] = [];

        for (const [fieldName, field] of Object.entries(fields)) {
            properties.push({
                key: FernRegistry.PropertyKey(fieldName),
                valueShape: this.convertOutputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                hidden: undefined
            });
        }

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertInputObjectType(type: GraphQLInputObjectType): FernRegistry.api.latest.TypeShape {
        const fields = type.getFields();
        const properties: FernRegistry.api.latest.ObjectProperty[] = [];

        for (const [fieldName, field] of Object.entries(fields)) {
            properties.push({
                key: FernRegistry.PropertyKey(fieldName),
                valueShape: this.convertInputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                hidden: undefined
            });
        }

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertUnionType(type: GraphQLUnionType): FernRegistry.api.latest.TypeShape {
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
