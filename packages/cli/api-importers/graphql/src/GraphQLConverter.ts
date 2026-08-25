import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import {
    buildASTSchema,
    DEFAULT_DEPRECATION_REASON,
    DocumentNode,
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
    GraphQLUnionType,
    validateSchema
} from "graphql";
import { mergeGraphQlDocuments } from "./mergeGraphQlDocuments.js";

export interface GraphQLConverterResult {
    graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation>;
    types: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition>;
}

export interface GraphQlExampleInput {
    name?: string;
    description?: string;
    query: string;
    variables?: Record<string, unknown>;
    response?: unknown;
}

export interface GraphQlOperationExamplesInput {
    operation: string;
    operationType?: "query" | "mutation" | "subscription";
    examples: GraphQlExampleInput[];
}

interface PendingOperation {
    flatId: string;
    namespacedId: string;
    operation: FdrAPI.api.v1.register.GraphQlOperation;
}

export class GraphQLConverter {
    private schema: GraphQLSchema | undefined;
    private context: TaskContext;
    private filePaths: AbsoluteFilePath[];
    private namespace: string | undefined;
    private processingTypes: Set<string> = new Set();
    private types: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition> = {};
    private examplesByOperation: Map<string, FdrAPI.api.v1.register.GraphQlExample[]> = new Map();

    constructor({
        context,
        filePath,
        namespace,
        examples
    }: {
        context: TaskContext;
        /**
         * One or more SDL files that make up a single schema. Multiple files are merged, which is
         * how federated subgraphs owned by different teams are documented as one API.
         */
        filePath: AbsoluteFilePath | AbsoluteFilePath[];
        namespace?: string;
        examples?: GraphQlOperationExamplesInput[];
    }) {
        this.context = context;
        this.filePaths = Array.isArray(filePath) ? filePath : [filePath];
        this.namespace = namespace;
        if (examples != null) {
            for (const entry of examples) {
                const mapped = entry.examples.map((ex) => ({
                    name: ex.name ?? undefined,
                    description: ex.description ?? undefined,
                    query: ex.query,
                    variables: ex.variables ?? undefined,
                    response: ex.response ?? undefined
                }));
                const key =
                    entry.operationType != null
                        ? `${entry.operationType.toLowerCase()}:${entry.operation}`
                        : entry.operation;
                if (this.examplesByOperation.has(key)) {
                    // Examples from every spec in a namespace group are loaded together, so two
                    // subgraphs can each ship examples for the same operation. First-wins, as when
                    // merging the SDL itself, but silently discarding the rest would be surprising.
                    this.context.logger.warn(
                        `Multiple GraphQL examples provided for "${key}". Keeping the first and ignoring the rest.`
                    );
                    continue;
                }
                this.examplesByOperation.set(key, mapped);
            }
        }
    }

    // `@deprecated` is a standard, consumer-facing directive (unlike the federation directives
    // dropped during merging), so it is carried through as availability metadata.
    private availabilityOf(node: { deprecationReason?: string | null }): "Deprecated" | undefined {
        return node.deprecationReason != null ? "Deprecated" : undefined;
    }

    // The deprecation reason has nowhere to live in the FDR shape other than the description,
    // and it is the part consumers act on ("use X instead").
    private describeWithDeprecation(node: {
        description?: string | null;
        deprecationReason?: string | null;
    }): string | undefined {
        const description = node.description ?? undefined;
        // graphql-js fills in `DEFAULT_DEPRECATION_REASON` for a bare `@deprecated`, which says
        // nothing that `availability` does not already say.
        if (node.deprecationReason == null || node.deprecationReason === DEFAULT_DEPRECATION_REASON) {
            return description;
        }
        const deprecation = `**Deprecated:** ${node.deprecationReason}`;
        return description != null ? `${description}\n\n${deprecation}` : deprecation;
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

    // NOTE: This heuristic treats a type as a namespace (operation-grouping type) when ALL
    // of its fields accept arguments. This can produce a false positive for regular data
    // types where every field happens to be parameterized. If that becomes a problem,
    // introduce an explicit config option (e.g. namespacedRootTypes: [...]) rather than
    // relying on field-arg counts alone.
    private isNamespaceType(type: GraphQLObjectType): boolean {
        const fields = Object.values(type.getFields());
        if (fields.length === 0) {
            return false;
        }
        return fields.every((f) => f.args.length > 0);
    }

    /**
     * Builds the merged document, reporting SDL problems instead of silently accepting them.
     *
     * `assumeValidSDL` is the fallback rather than the default: merged subgraphs can still carry
     * constructs that only compose at runtime (e.g. a directive whose definition lives in the
     * supergraph), and failing the docs build on those would make federation unusable.
     */
    private buildSchema(document: DocumentNode): GraphQLSchema {
        try {
            const schema = buildASTSchema(document);
            for (const error of validateSchema(schema)) {
                this.context.logger.warn(`Invalid GraphQL schema: ${error.message}`);
            }
            return schema;
        } catch (validationError) {
            let schema: GraphQLSchema;
            try {
                schema = buildASTSchema(document, { assumeValidSDL: true });
            } catch {
                // The schema cannot be built at all, so the original message is the useful one.
                throw validationError;
            }
            this.context.logger.warn(
                `Invalid GraphQL schema: ${validationError instanceof Error ? validationError.message : String(validationError)} ` +
                    "Continuing without SDL validation."
            );
            return schema;
        }
    }

    public async convert(): Promise<GraphQLConverterResult> {
        const sources = await Promise.all(
            this.filePaths.map(async (filePath) => ({
                filePath,
                sdl: await readFile(filePath, "utf-8")
            }))
        );

        const { document, conflicts } = mergeGraphQlDocuments(sources);
        for (const conflict of conflicts) {
            const member = `${conflict.typeName}.${conflict.memberName}`;
            this.context.logger.warn(
                conflict.kept === conflict.dropped
                    ? `GraphQL schema conflict: ${member} is declared more than once in ${conflict.kept} with ` +
                          "differing shapes. Keeping the first declaration."
                    : `GraphQL schema conflict: ${member} is defined in both ${conflict.kept} and ` +
                          `${conflict.dropped}. Keeping the definition from ${conflict.kept}.`
            );
        }

        this.schema = this.buildSchema(document);

        this.collectTypeDefinitions();

        const pendingOperations: PendingOperation[] = [];

        const queryType = this.schema.getQueryType();
        if (queryType) {
            this.convertOperations(queryType, "QUERY", pendingOperations);
        }

        const mutationType = this.schema.getMutationType();
        if (mutationType) {
            this.convertOperations(mutationType, "MUTATION", pendingOperations);
        }

        const subscriptionType = this.schema.getSubscriptionType();
        if (subscriptionType && this.isActualSubscriptionRootType(subscriptionType)) {
            this.convertOperations(subscriptionType, "SUBSCRIPTION", pendingOperations);
        }

        const graphqlOperations = this.resolveOperationIds(pendingOperations);

        return { graphqlOperations, types: this.types };
    }

    private resolveOperationIds(
        pending: PendingOperation[]
    ): Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation> {
        // Count how many operations share each flat ID to detect collisions
        const flatIdCounts = new Map<string, number>();
        for (const op of pending) {
            flatIdCounts.set(op.flatId, (flatIdCounts.get(op.flatId) ?? 0) + 1);
        }

        const result: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation> = {};
        for (const op of pending) {
            const hasCollision = (flatIdCounts.get(op.flatId) ?? 0) > 1;
            const finalId = hasCollision ? op.namespacedId : op.flatId;
            const operationId = this.getNamespacedOperationId(finalId);
            result[operationId] = {
                ...op.operation,
                id: operationId
            };
        }
        return result;
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
            } else if (type instanceof GraphQLScalarType) {
                // Custom (non-built-in) scalars are emitted as named alias types so they land
                // in the `types` map with a stable id usable as an href anchor by the frontend.
                this.processingTypes.add(typeName);
                try {
                    this.types[typeId] = {
                        name: this.getNamespacedTypeName(typeName),
                        shape: this.convertScalarTypeDefinition(type),
                        displayName: undefined,
                        description: type.description ?? undefined,
                        availability: undefined
                    };
                } finally {
                    this.processingTypes.delete(typeName);
                }
            }
        }
    }

    // Builds an operation id of the form `<operationType>_<segments joined by ".">`.
    // Flat (top-level) ids use a single segment; namespaced ids include the full field
    // path so that fields sharing a leaf name across namespaces resolve to distinct ids.
    // resolveOperationIds falls back from the flat id to the namespaced id on collision,
    // so both must be produced with this same format for that fallback to line up.
    private buildOperationId(operationType: FdrAPI.api.v1.register.GraphQlOperationType, segments: string[]): string {
        return `${operationType.toLowerCase()}_${segments.join(".")}`;
    }

    private convertOperations(
        type: GraphQLObjectType,
        operationType: FdrAPI.api.v1.register.GraphQlOperationType,
        pending: PendingOperation[]
    ): void {
        const fields = type.getFields();
        for (const [fieldName, field] of Object.entries(fields)) {
            const returnRawType = this.unwrapNonNull(field.type);
            if (
                returnRawType instanceof GraphQLObjectType &&
                field.args.length === 0 &&
                this.isNamespaceType(returnRawType)
            ) {
                // Queries: create a parent operation whose returnType points at the
                // namespace type so the sidebar entry's page can render all nested
                // fields. Mutations skip this — they're listed individually in the
                // sidebar and each mutation's example request wraps itself in the
                // parent field (e.g. mutation { account { create(...) } }).
                if (operationType === "QUERY") {
                    const parentFlatId = this.buildOperationId(operationType, [fieldName]);
                    pending.push({
                        flatId: parentFlatId,
                        namespacedId: parentFlatId,
                        operation: this.convertField(field, fieldName, operationType)
                    });
                }
                this.convertNamespaceOperations(returnRawType, operationType, pending, [fieldName]);
            } else {
                const flatId = this.buildOperationId(operationType, [fieldName]);
                pending.push({
                    flatId,
                    namespacedId: flatId,
                    operation: this.convertField(field, fieldName, operationType)
                });
            }
        }
    }

    private convertNamespaceOperations(
        namespaceType: GraphQLObjectType,
        operationType: FdrAPI.api.v1.register.GraphQlOperationType,
        pending: PendingOperation[],
        fieldPath: string[]
    ): void {
        const fields = namespaceType.getFields();
        for (const [fieldName, field] of Object.entries(fields)) {
            const flatId = this.buildOperationId(operationType, [fieldName]);
            const namespacedId = this.buildOperationId(operationType, [...fieldPath, fieldName]);
            pending.push({
                flatId,
                namespacedId,
                operation: this.convertField(field, fieldName, operationType, fieldPath)
            });
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
        operationType: FdrAPI.api.v1.register.GraphQlOperationType,
        fieldPath?: string[]
    ): FdrAPI.api.v1.register.GraphQlOperation {
        const args = field.args.map((arg) => this.convertArgument(arg));
        const examples =
            this.examplesByOperation.get(`${operationType.toLowerCase()}:${name}`) ??
            this.examplesByOperation.get(name);

        // fieldPath is not yet declared on GraphQlOperation in the current pinned
        // @fern-api/fdr-sdk. The `as` cast is required until the platform PR
        // (fern-platform#11183) ships a new SDK version that includes the field.
        // Once bumped, remove the cast and the field will pass Zod validation.
        return {
            id: FdrAPI.GraphQlOperationId(""), // placeholder, resolved in resolveOperationIds
            operationType,
            name,
            displayName: undefined,
            description: this.describeWithDeprecation(field),
            availability: this.availabilityOf(field),
            fieldPath: fieldPath != null && fieldPath.length > 0 ? fieldPath : undefined,
            arguments: args.length > 0 ? args : undefined,
            returnType: this.convertOutputType(field.type),
            examples: examples != null && examples.length > 0 ? examples : undefined,
            snippets: undefined
        } as FdrAPI.api.v1.register.GraphQlOperation;
    }

    private convertArgument(arg: GQLArgument): FdrAPI.api.v1.register.GraphQlArgument {
        return {
            name: arg.name,
            description: this.describeWithDeprecation(arg),
            availability: this.availabilityOf(arg),
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
            // Custom scalars are emitted as named alias types in the `types` map, so reference
            // them by their stable id. This lets the frontend link to the type's href anchor.
            return {
                type: "id",
                value: this.getNamespacedTypeId(type.name),
                default: undefined
            };
        }
    }

    private convertEnumTypeDefinition(type: GraphQLEnumType): FdrAPI.api.v1.register.TypeShape {
        const values = type.getValues();
        return {
            type: "enum",
            values: values.map((value) => ({
                value: value.name,
                description: this.describeWithDeprecation(value),
                availability: this.availabilityOf(value)
            })),
            default: undefined
        };
    }

    private convertObjectTypeDefinition(type: GraphQLObjectType): FdrAPI.api.v1.register.TypeShape {
        const fields = type.getFields();
        const properties: FdrAPI.api.v1.register.ObjectProperty[] = Object.entries(fields).map(
            ([fieldName, field]) => ({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertOutputType(field.type),
                description: this.describeWithDeprecation(field),
                availability: this.availabilityOf(field),
                propertyAccess: undefined,
                arguments: field.args.length > 0 ? field.args.map((arg) => this.convertArgument(arg)) : undefined
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
        const properties: FdrAPI.api.v1.register.ObjectProperty[] = Object.entries(fields).map(
            ([fieldName, field]) => ({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertOutputType(field.type),
                description: this.describeWithDeprecation(field),
                availability: this.availabilityOf(field),
                propertyAccess: undefined,
                arguments: field.args.length > 0 ? field.args.map((arg) => this.convertArgument(arg)) : undefined
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
        const properties: FdrAPI.api.v1.register.ObjectProperty[] = Object.entries(fields).map(
            ([fieldName, field]) => ({
                key: FdrAPI.PropertyKey(fieldName),
                valueType: this.convertInputType(field.type),
                description: this.describeWithDeprecation(field),
                availability: this.availabilityOf(field),
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
