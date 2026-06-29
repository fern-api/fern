import { GraphqlError, type GraphqlResponseError } from "../../../src/core/graphql/index";

describe("GraphqlError", () => {
    const errors: GraphqlResponseError[] = [
        {
            message: "Field 'user' is not defined",
            path: ["user", 0, "name"],
            extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
            locations: [{ line: 2, column: 5 }]
        }
    ];

    it("is an instance of Error and GraphqlError", () => {
        const error = new GraphqlError({ errors });
        expect(error instanceof Error).toBe(true);
        expect(error instanceof GraphqlError).toBe(true);
        expect(error.name).toBe("GraphqlError");
    });

    it("exposes the typed errors array", () => {
        const error = new GraphqlError({ errors });
        expect(error.errors).toBe(errors);
        expect(error.errors[0]?.message).toBe("Field 'user' is not defined");
        expect(error.errors[0]?.path).toEqual(["user", 0, "name"]);
        expect(error.errors[0]?.extensions).toEqual({ code: "GRAPHQL_VALIDATION_FAILED" });
        expect(error.errors[0]?.locations).toEqual([{ line: 2, column: 5 }]);
    });

    it("summarizes the first error in the message", () => {
        const error = new GraphqlError({ errors });
        expect(error.message).toBe("Field 'user' is not defined");
    });

    it("summarizes multiple errors with a count", () => {
        const error = new GraphqlError({
            errors: [{ message: "first" }, { message: "second" }, { message: "third" }]
        });
        expect(error.message).toBe("first (and 2 more errors)");
    });

    it("carries partial data and the raw response", () => {
        const data = { user: null };
        const error = new GraphqlError({ errors, data });
        expect(error.data).toBe(data);
        expect(error.rawResponse).toBeUndefined();
    });
});
