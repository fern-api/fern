import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { buildSchema, GraphQLField, GraphQLObjectType, GraphQLSchema } from "graphql";
import { readFile } from "fs/promises";

import { generateSelectionQuery } from "./query-generation/generateSelectionQuery.js";
import { convertGraphQLTypes } from "./ir-conversion/convertGraphQLTypes.js";
import { convertRootFieldToEndpoint } from "./ir-conversion/convertRootFieldToEndpoint.js";

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

    constructor({ context, filePath, namespace }: { context: TaskContext; filePath: AbsoluteFilePath; namespace?: string }) {
        this.context = context;
        this.filePath = filePath;
        this.namespace = namespace;
    }

    /**
     * Parses the GraphQL schema and produces a complete IntermediateRepresentation
     * containing:
     * - Types: all schema object/enum/union/input types converted to IR TypeDeclarations
     * - Services: one HttpService per operation group (Query, Mutation, Subscription),
     *   each containing HttpEndpoints for root fields
     * - Each endpoint has Transport.graphql with a pre-built query string
     *
     * @returns IntermediateRepresentation ready to be merged via mergeIntermediateRepresentation()
     */
    public async convert(): Promise<IntermediateRepresentation> {
        const sdlContent = await readFile(this.filePath, "utf-8");
        this.schema = buildSchema(sdlContent);

        // TODO: Step 1 - Convert all schema types to IR TypeDeclarations
        // Uses convertGraphQLTypes() to produce Record<TypeId, TypeDeclaration>
        // Handles: objects, enums, unions, interfaces, input objects, scalars
        const types = convertGraphQLTypes({
            schema: this.schema,
            namespace: this.namespace
        });

        // TODO: Step 2 - Convert root fields to HttpServices with HttpEndpoints
        // Each Query/Mutation/Subscription root type becomes an HttpService
        // Each field on those root types becomes an HttpEndpoint with:
        //   - method: POST, path: /graphql
        //   - requestBody: typed variables from field arguments
        //   - response: the field's return type (fully resolved)
        //   - transport: Transport.graphql({ query, operationType, operationName })
        const services = this.convertRootTypesToServices();

        // TODO: Step 3 - Assemble the IntermediateRepresentation
        // Fill in all required fields (many with sensible defaults for a GraphQL source)
        return this.assembleIR({ types, services });
    }

    /**
     * Converts Query, Mutation, and Subscription root types into HttpServices.
     * Handles namespace detection (arg-less fields returning "namespace types"
     * whose fields are the real operations).
     */
    private convertRootTypesToServices(): Record<string, unknown> {
        if (!this.schema) {
            return {};
        }

        // TODO: Implement root type → service conversion
        // 1. Get Query/Mutation/Subscription root types
        // 2. For each root type, detect namespace types (reuse isNamespaceType logic from GraphQLConverter)
        // 3. For each root field (or namespace sub-field), call convertRootFieldToEndpoint()
        // 4. Group endpoints into HttpService objects
        // 5. Return Record<ServiceId, HttpService>

        const queryType = this.schema.getQueryType();
        const mutationType = this.schema.getMutationType();
        const subscriptionType = this.schema.getSubscriptionType();

        // TODO: Process each root type
        void queryType;
        void mutationType;
        void subscriptionType;

        return {};
    }

    /**
     * Assembles a minimal IntermediateRepresentation from converted types and services.
     * Sets sensible defaults for fields not applicable to GraphQL sources.
     */
    private assembleIR(_args: { types: Record<string, unknown>; services: Record<string, unknown> }): IntermediateRepresentation {
        // TODO: Construct a valid IntermediateRepresentation with:
        // - types: converted GraphQL types
        // - services: converted root field services
        // - auth: ApiAuth.none (GraphQL auth is typically header-based, handled separately)
        // - rootPackage: a Package with service references
        // - subpackages: one per service group
        // - All other fields: sensible defaults (empty arrays, undefined, etc.)
        throw new Error("GraphQLToIRConverter.assembleIR() not yet implemented");
    }
}
