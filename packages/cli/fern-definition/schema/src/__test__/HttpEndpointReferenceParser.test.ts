import { HttpEndpointReferenceParser } from "../utils/HttpEndpointReferenceParser.js";

describe("HttpEndpointReferenceParser", () => {
    describe("validate", () => {
        it("should validate a valid endpoint reference", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.validate("GET /users");
            expect(result).toEqual({ type: "valid" });
        });

        it("should invalidate an endpoint reference with special characters in the method", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.validate("GET! /users");
            expect(result).toEqual({ type: "invalid" });
        });

        it("should validate an endpoint reference with a period in the path", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.validate("GET /api/v1.0/users");
            expect(result).toEqual({ type: "valid" });
        });

        it("should validate an endpoint reference with a namespace prefix", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.validate("oauth::POST /v2/token");
            expect(result).toEqual({ type: "valid" });
        });

        it("should invalidate an endpoint reference with invalid namespace syntax", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.validate("oauth:POST /v2/token");
            expect(result).toEqual({ type: "invalid" });
        });
    });

    describe("tryParse", () => {
        it("should parse a basic endpoint reference", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.tryParse("GET /users");
            expect(result).toEqual({
                namespace: undefined,
                method: "GET",
                path: "/users"
            });
        });

        it("should parse an endpoint reference with namespace prefix", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.tryParse("oauth::POST /v2/token");
            expect(result).toEqual({
                namespace: "oauth",
                method: "POST",
                path: "/v2/token"
            });
        });

        it("should parse an endpoint reference with underscore in namespace", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.tryParse("iam_organizations::GET /v1/orgs");
            expect(result).toEqual({
                namespace: "iam_organizations",
                method: "GET",
                path: "/v1/orgs"
            });
        });

        it("should return undefined for invalid references", () => {
            const parser = new HttpEndpointReferenceParser();
            const result = parser.tryParse("INVALID /users");
            expect(result).toBeUndefined();
        });
    });
});
