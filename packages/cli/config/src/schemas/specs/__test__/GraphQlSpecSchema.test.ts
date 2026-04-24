import { describe, expect, it } from "vitest";

import { GraphQlSpecSchema } from "../GraphQlSpecSchema.js";

describe("GraphQlSpecSchema", () => {
    it("should accept a minimal spec with only graphql", () => {
        const input = { graphql: "./schema.graphql" };
        const result = GraphQlSpecSchema.safeParse(input);
        expect(result.success).toBe(true);
    });

    it("should accept name, origin, and overrides", () => {
        const input = {
            graphql: "./plants.graphql",
            name: "Plants",
            origin: "https://api.example.com/plants/graphql",
            overrides: "./overrides.yml"
        };
        const result = GraphQlSpecSchema.safeParse(input);
        expect(result.success).toBe(true);
    });

    it("should accept an array of overrides", () => {
        const input = {
            graphql: "./schema.graphql",
            overrides: ["./overrides1.yml", "./overrides2.yml"]
        };
        const result = GraphQlSpecSchema.safeParse(input);
        expect(result.success).toBe(true);
    });

    it("should reject missing graphql field", () => {
        const input = { name: "Plants" };
        const result = GraphQlSpecSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
});
