import { validEndpoint } from "../rules/valid-docs-endpoints/valid-docs-endpoints";

describe("validEndpoints", () => {
    it("only origin is invalid", () => {
        expect(validEndpoint("api.origin.com")).toBeFalsy();
    });

    it("is valid with protocol", () => {
        expect(validEndpoint("https://us.i.posthog.com")).toBeTruthy();
    });

    it("only protocol is invalid", () => {
        expect(validEndpoint("https://")).toBeFalsy();
    });

    it("empty string is invalid", () => {
        expect(validEndpoint("")).toBeFalsy();
    });
});
