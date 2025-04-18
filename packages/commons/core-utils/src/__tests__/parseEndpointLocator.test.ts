import { parseEndpointLocator } from "../parseEndpointLocator";

describe("parseEndpointLocator", () => {
    it("simple", () => {
        const result = parseEndpointLocator("POST /users/{userId}");
        expect(result.type).toEqual("success");

        if (result.type !== "success") {
            throw new Error("Failed to parse");
        }

        expect(result.method).toEqual("POST");
        expect(result.path).toEqual("/users/{userId}");
        expect(result.pathParameters).toContain("userId");
    });
});
