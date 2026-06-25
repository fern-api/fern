import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { buildSchema, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType, GraphQLSchema } from "graphql";

import { convertGraphQLTypes } from "./ir-conversion/convertGraphQLTypes.js";
import { convertRootFieldToEndpoint } from "./ir-conversion/convertRootFieldToEndpoint.js";
import { graphqlCasingsGenerator, ROOT_FERN_FILEPATH } from "./ir-conversion/shared.js";
import { QueryGenerationConfig } from "./query-generation/generateSelectionQuery.js";

type OperationType = "QUERY" | "MUTATION" | "SUBSCRIPTION";

const DEFAULT_QUERY_GENERATION_CONFIG: QueryGenerationConfig = { maxDepth: 4 };

/**
 * Converts a GraphQL schema into Fern's IntermediateRepresentation.
 *
 * Each root field on Query/Mutation/Subscription becomes a synthetic HttpEndpoint
 * with Transport.graphql, typed variables as the request body, and the fully-resolved
 * return type as the response.
 *
 * This is analogous to ProtobufIRGenerator but operates on GraphQL schemas instead
 * of protobuf files.
 */
export class GraphQLToIRConverter {
    private context: TaskContext;
    private filePath: AbsoluteFilePath;
    private namespace: string | undefined;
    private schema: GraphQLSchema | undefined;
    private queryGenerationConfig: QueryGenerationConfig;

    constructor({
        context,
        filePath,
        namespace,
        queryGenerationConfig
    }: {
        context: TaskContext;
        filePath: AbsoluteFilePath;
        namespace?: string;
        queryGenerationConfig?: QueryGenerationConfig;
    }) {
        this.context = context;
        this.filePath = filePath;
        this.namespace = namespace;
        this.queryGenerationConfig = queryGenerationConfig ?? DEFAULT_QUERY_GENERATION_CONFIG;
    }

    /**
     * Parses the GraphQL schema and produces a complete IntermediateRepresentation.
     *
     * @returns IntermediateRepresentation ready to be merged via mergeIntermediateRepresentation()
     */
    public async convert(): Promise<IntermediateRepresentation> {
        const sdlContent = await readFile(this.filePath, "utf-8");
        this.schema = buildSchema(sdlContent);

        const types = convertGraphQLTypes({
            schema: this.schema,
            namespace: this.namespace
        });

        const services = this.convertRootTypesToServices();

        return this.assembleIR({ types, services });
    }

    private isActualSubscriptionRootType(type: GraphQLObjectType): boolean {
        return type.getInterfaces().length === 0;
    }

    private isNamespaceType(type: GraphQLObjectType): boolean {
        const fields = Object.values(type.getFields());
        if (fields.length === 0) {
            return false;
        }
        return fields.every((field) => field.args.length > 0);
    }

    private unwrapNonNull(type: GraphQLOutputType): GraphQLOutputType {
        if (type instanceof GraphQLNonNull) {
            return type.ofType;
        }
        return type;
    }

    private namespacedServiceId(operationType: OperationType): string {
        const base = `service_${operationType.toLowerCase()}`;
        return this.namespace ? `${this.namespace}_${base}` : base;
    }

    private subpackageId(operationType: OperationType): string {
        const base = `subpackage_${operationType.toLowerCase()}`;
        return this.namespace ? `${this.namespace}_${base}` : base;
    }

    /**
     * Collects all endpoints for a single root operation type, recursing into namespace
     * types (arg-less fields returning a type whose fields are the real operations).
     */
    private collectEndpointsForRootType(
        rootType: GraphQLObjectType,
        operationType: OperationType,
        schema: GraphQLSchema
    ): FernIr.HttpEndpoint[] {
        const endpoints: FernIr.HttpEndpoint[] = [];
        for (const field of Object.values(rootType.getFields())) {
            const returnRawType = this.unwrapNonNull(field.type);
            if (
                returnRawType instanceof GraphQLObjectType &&
                field.args.length === 0 &&
                this.isNamespaceType(returnRawType)
            ) {
                for (const namespaceField of Object.values(returnRawType.getFields())) {
                    endpoints.push(
                        convertRootFieldToEndpoint({
                            field: namespaceField,
                            operationType,
                            schema,
                            namespace: this.namespace,
                            config: this.queryGenerationConfig
                        })
                    );
                }
            } else {
                endpoints.push(
                    convertRootFieldToEndpoint({
                        field,
                        operationType,
                        schema,
                        namespace: this.namespace,
                        config: this.queryGenerationConfig
                    })
                );
            }
        }
        return endpoints;
    }

    /**
     * Converts Query, Mutation, and Subscription root types into HttpServices.
     */
    private convertRootTypesToServices(): Record<string, FernIr.HttpService> {
        if (this.schema == null) {
            return {};
        }
        const schema = this.schema;
        const services: Record<string, FernIr.HttpService> = {};

        const rootTypes: Array<{ type: GraphQLObjectType | null | undefined; operationType: OperationType }> = [
            { type: schema.getQueryType(), operationType: "QUERY" },
            { type: schema.getMutationType(), operationType: "MUTATION" },
            { type: schema.getSubscriptionType(), operationType: "SUBSCRIPTION" }
        ];

        for (const { type, operationType } of rootTypes) {
            if (type == null) {
                continue;
            }
            if (operationType === "SUBSCRIPTION" && !this.isActualSubscriptionRootType(type)) {
                continue;
            }
            const endpoints = this.collectEndpointsForRootType(type, operationType, schema);
            if (endpoints.length === 0) {
                continue;
            }
            const groupName = operationType.toLowerCase();
            services[this.namespacedServiceId(operationType)] = {
                availability: undefined,
                name: {
                    fernFilepath: {
                        allParts: [groupName],
                        packagePath: [],
                        file: groupName
                    }
                },
                displayName: undefined,
                basePath: constructHttpPath(""),
                endpoints,
                headers: [],
                pathParameters: [],
                encoding: undefined,
                transport: undefined,
                audiences: undefined
            };
        }

        return services;
    }

    /**
     * Assembles a complete IntermediateRepresentation from converted types and services.
     */
    private assembleIR({
        types,
        services
    }: {
        types: Record<string, FernIr.TypeDeclaration>;
        services: Record<string, FernIr.HttpService>;
    }): IntermediateRepresentation {
        const operationTypes: OperationType[] = ["QUERY", "MUTATION", "SUBSCRIPTION"];
        const subpackages: Record<string, FernIr.Subpackage> = {};
        const subpackageIds: string[] = [];

        for (const operationType of operationTypes) {
            const serviceId = this.namespacedServiceId(operationType);
            if (services[serviceId] == null) {
                continue;
            }
            const groupName = operationType.toLowerCase();
            const subpackageId = this.subpackageId(operationType);
            subpackageIds.push(subpackageId);
            subpackages[subpackageId] = {
                name: graphqlCasingsGenerator.generateName(groupName),
                displayName: undefined,
                fernFilepath: {
                    allParts: [groupName],
                    packagePath: [],
                    file: groupName
                },
                service: serviceId,
                types: [],
                errors: [],
                webhooks: undefined,
                websocket: undefined,
                subpackages: [],
                hasEndpointsInTree: true,
                hasWebSocketInTree: undefined,
                navigationConfig: undefined,
                docs: undefined
            };
        }

        const rootPackage: FernIr.Package = {
            fernFilepath: ROOT_FERN_FILEPATH,
            service: undefined,
            types: Object.keys(types),
            errors: [],
            webhooks: undefined,
            websocket: undefined,
            subpackages: subpackageIds,
            hasEndpointsInTree: subpackageIds.length > 0,
            hasWebSocketInTree: undefined,
            navigationConfig: undefined,
            docs: undefined
        };

        return {
            apiName: graphqlCasingsGenerator.generateName(this.namespace ?? ""),
            apiDisplayName: undefined,
            apiDocs: undefined,
            auth: {
                docs: undefined,
                requirement: FernIr.AuthSchemesRequirement.All,
                schemes: []
            },
            selfHosted: false,
            apiVersion: undefined,
            headers: [],
            idempotencyHeaders: [],
            types,
            services,
            errors: {},
            webhookGroups: {},
            websocketChannels: undefined,
            constants: {
                errorInstanceIdKey: graphqlCasingsGenerator.generateNameAndWireValue({
                    name: "errorInstanceId",
                    wireValue: "errorInstanceId"
                })
            },
            environments: undefined,
            basePath: undefined,
            pathParameters: [],
            errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: {
                    language: "",
                    sdkName: "",
                    sdkVersion: "",
                    userAgent: undefined
                }
            },
            variables: [],
            serviceTypeReferenceInfo: {
                sharedTypes: [],
                typesReferencedOnlyByService: {}
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined,
            fdrApiDefinitionId: undefined,
            rootPackage,
            subpackages,
            audiences: undefined,
            generationMetadata: undefined,
            apiPlayground: undefined,
            casingsConfig: undefined,
            specVersion: undefined
        };
    }
}
