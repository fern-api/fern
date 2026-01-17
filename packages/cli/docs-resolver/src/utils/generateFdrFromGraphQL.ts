import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GraphQLConverter } from "@fern-api/graphql-to-fdr";
import { TaskContext } from "@fern-api/task-context";

export interface GraphQLFdrResult {
    graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.latest.GraphQlOperation>;
    types: Record<FdrAPI.TypeId, FdrAPI.api.latest.TypeDefinition>;
}

export async function generateFdrFromGraphQL(
    graphqlPath: AbsoluteFilePath,
    context: TaskContext
): Promise<GraphQLFdrResult> {
    const converter = new GraphQLConverter({
        context,
        filePath: graphqlPath
    });

    return converter.convert();
}
