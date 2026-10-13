import { describe, expect, it } from "vitest";
import { convertServer } from "../openapi/v3/converters/convertServer.js";

describe("convertServer", () => {
    it("substitutes server variable defaults into the url", () => {
        const server = convertServer({
            url: "https://api.{region}.example.com",
            variables: { region: { default: "us1" } }
        });
        expect(server.url).toBe("https://api.us1.example.com");
        expect(server.urlTemplate).toBe("https://api.{region}.example.com");
        expect(server.variables).toEqual([{ id: "region", default: "us1", values: undefined }]);
    });

    it("drops an empty-default (optional) variable together with its separator", () => {
        expect(
            convertServer({
                url: "https://api.{edge}.{region}.example.com",
                variables: { edge: { default: "" }, region: { default: "us1" } }
            }).url
        ).toBe("https://api.us1.example.com");
        expect(
            convertServer({
                url: "https://api-{edge}.example.com",
                variables: { edge: { default: "" } }
            }).url
        ).toBe("https://api.example.com");
        expect(
            convertServer({
                url: "https://{edge}.api.example.com",
                variables: { edge: { default: "" } }
            }).url
        ).toBe("https://api.example.com");
    });
});
