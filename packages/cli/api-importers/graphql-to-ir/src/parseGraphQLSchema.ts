import { TaskContext } from "@fern-api/task-context";
import { buildSchema, GraphQLSchema } from "graphql";

export function parseGraphQLSchema(schemaContent: string, context: TaskContext): GraphQLSchema {
    try {
        const schema = buildSchema(schemaContent);
        return schema;
    } catch (error) {
        return context.failAndThrow(
            `Failed to parse GraphQL schema: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
