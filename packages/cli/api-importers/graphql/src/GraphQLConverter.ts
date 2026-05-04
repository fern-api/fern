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
    private namespace: string | undefined;
    private processingTypes: Set<string> = new Set();
    private types: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition> = {};

    constructor({
        context,
        filePath,
        namespace
    }: { context: TaskContext; filePath: AbsoluteFilePath; namespace?: string }) {
        this.context = context;
        this.filePath = filePath;
        this.namespace = namespace;
    }

    private isBuiltInScalar(typeName: string): boolean {
        return ["String", "Int", "Float", "Boolean", "ID"].includes(typeName);
    }

    private getNamespacedTypeId(originalName: string): FdrAPI.TypeId {
        const namespacedName = this.namespace ? `${this.namespace}_${originalName}` : originalName;
        return FdrAPI.TypeId(namespacedName);
    }

    private getNamespacedOperationId(originalName: string): FdrAPI.GraphQlOperationId {
        const namespacedName = this.namespace ? `${this.namespace}_${originalName}` : originalName;
        return FdrAPI.GraphQlOperationId(namespacedName);
    }

    private getNamespacedTypeName(originalName: string): string {
        return this.namespace ? `${this.namespace}_${originalName}` : originalName;
    }

    private isActualSubscriptionRootType(type: GraphQLObjectType): boolean {
        if (type.getInterfaces().length > 0) {
            return false;
        }
        return true;
    }

    private isNamespaceType(type: GraphQLObjectType): boolean {
        const fields = Object.values(type.getFields());
        if (fields.length === 0) {
            return false;
        }
        return fields.every((f) => f.args.length > 0);
    }

    public async convert(): Promise<GraphQLConverterResult> {
        const sdlContent = await readFile(this.filePath, "utf-8");
        this.schema = buildSchema(sdlContent);

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
        if (subscriptionType && this.isActualSubscriptionRootType(subscriptionType)) {
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

            if (type === this.schema.getQueryType() || type === this.schema.getMutationType()) {
                continue;
            }

            if (
                type === this.schema.getSubscriptionType() &&
                type instanceof GraphQLObjectType &&
                this.isActualSubscriptionRootType(type)
            ) {
                continue;
            }

            if (type instanceof GraphQLScalarType && this.isBuiltInScalar(typeName)) {
                continue;
            }

            const typeId = this.getNamespacedTypeId(typeName);

            if (type instanceof GraphQLEnumType) {
                this.processingTypes.add(typeName);
                try {
                    this.types[typeId] = {
                        name: this.getNamespacedTypeName(typeName),
                        shape: this.convertEnumTypeDefinition(type),
                        displayName: undefined,
                        description: type.description ?? undefined,
                        availability: undefined
                    };
                } finally {
                    this.processingTypes.delete(typeName);
                }
            } else if (type instanceof GraphQLInterfaceType) {
                this.processingTypes.add(typeName);
                try {
                    this.types[typeId] = {
                        name: this.getNamespacedTypeName(typeName),
                        shape: this.convertInterfaceTypeDefinition(type),
                        displayName: undefined,
                        description: type.description ?? undefined,
                        availability: undefined
                    };
                } finally {
                    this.processingTypes.delete(typeName);
                }
            } else if (type instanceof GraphQLObjectType) {
                this.processingTypes.add(typeName);
                try {
                    this.types[typeId] = {
                        name: this.getNamespacedTypeName(typeName),
                        shape: this.convertObjectTypeDefinition(type),
                        displayName: undefined,
                        description: type.description ?? undefined,
                        availability: undefined
                    };
                } finally {
                    this.processingTypes.delete(typeName);
                }
            } else if (type instanceof GraphQLInputObjectType) {
                this.processingTypes.add(typeName);
                try {
                    this.types[typeId] = {
                        name: this.getNamespacedTypeName(typeName),
                        shape: this.convertInputObjectTypeDefinition(type),
                        displayName: undefined,
                        description: type.description ?? undefined,
                        availability: undefined
                    };
                } finally {
                    this.processingTypes.delete(typeName);
                }
            } else if (type instanceof GraphQLUnionType) {
                this.processingTypes.add(typeName);
                try {
                    this.types[typeId] = {
                        name: this.getNamespacedTypeName(typeName),
                        shape: this.convertUnionTypeDefinition(type),
                        displayName: undefined,
                        description: type.description ?? undefined,
                        availability: undefined
                    };
                } finally {
                    this.processingTypes.delete(typeName);
                }
            } else if (type instanceof GraphQLScalarType && !this.isBuiltInScalar(typeName)) {
                continue;
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
            const returnRawType = this.unwrapNonNull(field.type);
            if (
                returnRawType instanceof GraphQLObjectType &&
                field.args.length === 0 &&
                this.isNamespaceType(returnRawType)
            ) {
                this.convertNamespaceOperations(returnRawType, fieldName, operationType, operations);
            } else {
                const operationId = this.getNamespacedOperationId(`${operationType.toLowerCase()}_${fieldName}`);
                operations[operationId] = this.convertField(field, fieldName, operationType);
            }
        }
    }

    private convertNamespaceOperations(
        namespaceType: GraphQLObjectType,
        _parentName: string,
        operationType: FdrAPI.api.v1.register.GraphQlOperationType,
        operations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation>
    ): void {
        const fields = namespaceType.getFields();
        for (const [fieldName, field] of Object.entries(fields)) {
            const operationId = this.getNamespacedOperationId(`${operationType.toLowerCase()}_${fieldName}`);
            operations[operationId] = this.convertField(field, fieldName, operationType);
        }
    }

    private unwrapNonNull(type: GraphQLOutputType): GraphQLOutputType {
        if (type instanceof GraphQLNonNull) {
            return type.ofType;
        }
        return type;
    }

    private convertField(
        field: GraphQLField<unknown, unknown>,
        name: string,
        operationType: FdrAPI.api.v1.register.GraphQlOperationType
    ): FdrAPI.api.v1.register.GraphQlOperation {
        const args = field.args.map((arg) => this.convertArgument(arg));

        return {
            id: this.getNamespacedOperationId(`${operationType.toLowerCase()}_${name}`),
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
            return this.convertNonNullOutputType(type.ofType);
        }
        return {
            type: "optional",
            itemType: this.convertNonNullOutputType(type),
            defaultValue: undefined
        };
    }

    private convertNonNullOutputType(type: GraphQLOutputType): FdrAPI.api.v1.register.TypeReference {
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
            return {
                type: "id",
                value: this.getNamespacedTypeId(type.name),
                default: undefined
            };
        }

        if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
            return {
                type: "id",
                value: this.getNamespacedTypeId(type.name),
                default: undefined
            };
        }

        if (type instanceof GraphQLUnionType) {
            return {
                type: "id",
                value: this.getNamespacedTypeId(type.name),
                default: undefined
            };
        }

        return {
            type: "unknown"
        };
    }

    private convertInputType(type: GraphQLInputType): FdrAPI.api.v1.register.TypeReference {
        if (type instanceof GraphQLNonNull) {
            return this.convertNonNullInputType(type.ofType);
        }
        return {
            type: "optional",
            itemType: this.convertNonNullInputType(type),
            defaultValue: undefined
        };
    }

    private convertNonNullInputType(type: GraphQLInputType): FdrAPI.api.v1.register.TypeReference {
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
            return {
                type: "id",
                value: this.getNamespacedTypeId(type.name),
                default: undefined
            };
        }

        if (type instanceof GraphQLInputObjectType) {
            return {
                type: "id",
                value: this.getNamespacedTypeId(type.name),
                default: undefined
            };
        }

        return {
            type: "unknown"
        };
    }

    private convertScalarType(type: GraphQLScalarType): FdrAPI.api.v1.register.TypeReference {
        if (this.isBuiltInScalar(type.name)) {
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
                    // This shouldn't happen for built-in scalars, but fallback to string
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
        } else {
            return {
                type: "primitive",
                value: {
                    type: "scalar",
                    name: type.name,
                    description: type.description ?? undefined,
                    default: undefined
                }
            };
        }
    }

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

    private convertObjectTypeDefinition(type: GraphQLObjectType): FdrAPI.api.v1.register.TypeShape {
        const fields = type.getFields();
        const properties = Object.entries(fields).map(
            ([fieldName, field]): FdrAPI.api.v1.register.ObjectProperty => ({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertOutputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            })
        );

        // Only extend interfaces that are converted to plain objects (no implementations).
        // Interfaces with implementations are converted to undiscriminatedUnion, and the
        // frontend's unwrapObjectType only supports extending object types.
        // GraphQL implementing types already include all interface fields, so extends is
        // only needed for documentation purposes when the interface is a plain object.
        const interfaces = type.getInterfaces();
        const extendsIds = interfaces
            .filter((iface) => {
                if (!this.schema) {
                    return true;
                }
                const implementations = this.schema.getPossibleTypes(iface);
                return implementations.length === 0;
            })
            .map((iface) => this.getNamespacedTypeId(iface.name));

        return {
            type: "object",
            extends: extendsIds,
            properties,
            extraProperties: undefined
        };
    }

    private convertInterfaceTypeDefinition(type: GraphQLInterfaceType): FdrAPI.api.v1.register.TypeShape {
        if (!this.schema) {
            return this.convertInterfaceAsObject(type);
        }

        const implementations = this.schema.getPossibleTypes(type);
        if (implementations.length === 0) {
            return this.convertInterfaceAsObject(type);
        }

        return {
            type: "undiscriminatedUnion",
            variants: implementations.map((impl) => ({
                typeName: impl.name,
                displayName: impl.name,
                type: {
                    type: "id",
                    value: this.getNamespacedTypeId(impl.name),
                    default: undefined
                },
                description: impl.description ?? undefined,
                availability: undefined
            }))
        };
    }

    private convertInterfaceAsObject(type: GraphQLInterfaceType): FdrAPI.api.v1.register.TypeShape {
        const fields = type.getFields();
        const properties = Object.entries(fields).map(
            ([fieldName, field]): FdrAPI.api.v1.register.ObjectProperty => ({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertOutputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            })
        );

        return {
            type: "object",
            extends: [],
            properties,
            extraProperties: undefined
        };
    }

    private convertInputObjectTypeDefinition(type: GraphQLInputObjectType): FdrAPI.api.v1.register.TypeShape {
        const fields = type.getFields();
        const properties = Object.entries(fields).map(
            ([fieldName, field]): FdrAPI.api.v1.register.ObjectProperty => ({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertInputType(field.type),
                description: field.description ?? undefined,
                availability: undefined,
                propertyAccess: undefined
            })
        );

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
                    value: this.getNamespacedTypeId(t.name),
                    default: undefined
                },
                description: t.description ?? undefined,
                availability: undefined
            }))
        };
    }

    private convertScalarTypeDefinition(type: GraphQLScalarType): FdrAPI.api.v1.register.TypeShape {
        const scalarName = type.name.toLowerCase();
        const baseType = this.getBaseTypeForCustomScalar(scalarName);

        return {
            type: "alias",
            value: baseType
        };
    }

    private getBaseTypeForCustomScalar(scalarName: string): FdrAPI.api.v1.register.TypeReference {
        switch (scalarName) {
            case "datetime":
            case "timestamp":
            case "zoneddatetime":
            case "offsetdatetime":
                return {
                    type: "primitive",
                    value: {
                        type: "datetime",
                        default: undefined
                    }
                };

            case "date":
            case "localdate":
                return {
                    type: "primitive",
                    value: {
                        type: "date",
                        default: undefined
                    }
                };

            case "email":
            case "emailaddress":
                return {
                    type: "primitive",
                    value: {
                        type: "string",
                        format: "email",
                        regex: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                        default: undefined
                    }
                };

            case "url":
            case "uri":
            case "urlstring":
                return {
                    type: "primitive",
                    value: {
                        type: "string",
                        format: "uri",
                        regex: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                        default: undefined
                    }
                };

            case "uuid":
            case "guid":
                return {
                    type: "primitive",
                    value: {
                        type: "string",
                        format: "uuid",
                        regex: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                        default: undefined
                    }
                };

            case "json":
            case "jsonobject":
                return {
                    type: "unknown"
                };

            case "upload":
            case "file":
                return {
                    type: "primitive",
                    value: {
                        type: "string",
                        format: "binary",
                        regex: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                        default: undefined
                    }
                };

            case "bigint":
            case "long":
                return {
                    type: "primitive",
                    value: {
                        type: "long",
                        minimum: undefined,
                        maximum: undefined,
                        exclusiveMinimum: undefined,
                        exclusiveMaximum: undefined,
                        multipleOf: undefined,
                        default: undefined
                    }
                };

            case "decimal":
            case "currency":
            case "money":
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
}
