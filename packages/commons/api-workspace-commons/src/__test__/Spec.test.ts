import { AbsoluteFilePath } from "@fern-api/path-utils";
import { describe, expect, it } from "vitest";

import { type GraphQLSpec, groupGraphQLSpecsByNamespace } from "../Spec.js";

function graphqlSpec(fileName: string, namespace?: string): GraphQLSpec {
    return {
        type: "graphql",
        absoluteFilepath: AbsoluteFilePath.of(`/tmp/${fileName}`),
        absoluteFilepathToOverrides: undefined,
        absoluteFilepathToExamples: undefined,
        namespace
    };
}

describe("groupGraphQLSpecsByNamespace", () => {
    it("groups specs that share a namespace and keeps unnamespaced specs separate", () => {
        const grouped = groupGraphQLSpecsByNamespace([
            graphqlSpec("core.graphql", "user-profile"),
            graphqlSpec("legacy.graphql"),
            graphqlSpec("images.graphql", "user-profile"),
            graphqlSpec("billing.graphql", "billing")
        ]);

        expect(
            [...grouped].map(([namespace, specs]) => [
                namespace,
                specs.map((spec) => spec.absoluteFilepath.split("/").pop())
            ])
        ).toEqual([
            ["user-profile", ["core.graphql", "images.graphql"]],
            ["", ["legacy.graphql"]],
            ["billing", ["billing.graphql"]]
        ]);
    });
});
