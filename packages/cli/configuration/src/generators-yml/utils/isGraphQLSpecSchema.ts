import { GraphQlSpecSchema, SpecSchema } from "../schemas";

export function isGraphQLSpecSchema(spec: SpecSchema): spec is GraphQlSpecSchema {
    return (spec as GraphQlSpecSchema)?.graphql != null;
}
