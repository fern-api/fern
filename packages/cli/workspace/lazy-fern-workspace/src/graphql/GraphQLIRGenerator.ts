import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GraphQLToIRConverter } from "@fern-api/graphql-to-fdr";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

/**
 * Generates IntermediateRepresentation from GraphQL schemas.
 *
 * Analogous to ProtobufIRGenerator — called from OSSWorkspace.getIntermediateRepresentation()
 * and produces IR that gets merged via mergeIntermediateRepresentation().
 *
 * Integration point: OSSWorkspace.getIntermediateRepresentation() (line ~314)
 * Pattern: Same as protobuf — starts in parallel, results merged after OpenAPI processing.
 *
 * ```typescript
 * // In OSSWorkspace.getIntermediateRepresentation():
 * // Start GraphQL IR generation in parallel with OpenAPI processing
 * const graphqlIRResultsPromise = this.generateAllGraphQLIRs({ context });
 *
 * // ... existing OpenAPI + protobuf processing ...
 *
 * // Await and merge GraphQL IR results
 * const graphqlIRResults = await graphqlIRResultsPromise;
 * const graphqlCasingsGenerator = constructCasingsGenerator({
 *     generationLanguage: "typescript",
 *     keywords: undefined,
 *     smartCasing: false
 * });
 * for (const ir of graphqlIRResults) {
 *     mergedIr = mergedIr === undefined
 *         ? ir
 *         : mergeIntermediateRepresentation(mergedIr, ir, graphqlCasingsGenerator);
 * }
 * ```
 */
export class GraphQLIRGenerator {
    private context: TaskContext;

    constructor({ context }: { context: TaskContext }) {
        this.context = context;
    }

    /**
     * Generates an IntermediateRepresentation from a single GraphQL schema file.
     *
     * @param absoluteFilepath - Path to the .graphql schema file
     * @param namespace - Optional namespace prefix for grouping operations
     * @returns IntermediateRepresentation ready for merging
     */
    public async generate({
        absoluteFilepath,
        namespace
    }: {
        absoluteFilepath: AbsoluteFilePath;
        namespace: string | undefined;
    }): Promise<IntermediateRepresentation> {
        // TODO: Implement
        // 1. Create GraphQLToIRConverter instance
        const converter = new GraphQLToIRConverter({
            context: this.context,
            filePath: absoluteFilepath,
            namespace
        });

        // 2. Run conversion
        const ir = await converter.convert();

        // 3. Return IR for merging
        return ir;
    }
}
