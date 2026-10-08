import { describe, expect, it } from "vitest";
import { buildCatalogIndex, parseCliCatalog } from "../catalog.js";
import { CliCatalog } from "../types.js";

describe("parseCliCatalog", () => {
    it("parses a well-formed catalog", () => {
        const catalog = parseCliCatalog({
            version: 1,
            source: { runtimeVersion: "fern-cli-sdk 0.18.1" },
            commands: [
                {
                    command: ["twilio", "x", "get"],
                    httpMethod: "GET",
                    path: "/x/{Sid}",
                    inputs: [{ wireName: "Sid", location: "path", flag: "--sid" }]
                }
            ]
        });
        expect(catalog.commands).toHaveLength(1);
        expect(catalog.source?.runtimeVersion).toBe("fern-cli-sdk 0.18.1");
    });

    it("rejects an unsupported version", () => {
        expect(() => parseCliCatalog({ version: 2, commands: [] })).toThrow(/version/i);
    });

    it("rejects a missing commands array", () => {
        expect(() => parseCliCatalog({ version: 1 })).toThrow(/commands/i);
    });

    it("accepts an input with no flag (params-only)", () => {
        const catalog = parseCliCatalog({
            version: 1,
            commands: [
                {
                    command: ["twilio", "x", "create"],
                    httpMethod: "POST",
                    path: "/x",
                    inputs: [{ wireName: "Rules", location: "body" }]
                }
            ]
        });
        expect(catalog.commands[0]?.inputs[0]?.flag).toBeUndefined();
    });

    it("rejects an input with an invalid location", () => {
        expect(() =>
            parseCliCatalog({
                version: 1,
                commands: [
                    {
                        command: ["twilio", "x"],
                        httpMethod: "GET",
                        path: "/x",
                        inputs: [{ wireName: "Sid", location: "cookie", flag: "--sid" }]
                    }
                ]
            })
        ).toThrow(/location/i);
    });
});

describe("buildCatalogIndex", () => {
    const catalog: CliCatalog = {
        version: 1,
        commands: [
            { command: ["twilio", "a"], namespace: "core", httpMethod: "GET", path: "/a", inputs: [] },
            { command: ["twilio", "b"], namespace: "core", httpMethod: "POST", path: "/a", inputs: [] }
        ]
    };

    it("looks up by method + path (method disambiguates same path)", () => {
        const index = buildCatalogIndex(catalog);
        expect(index.lookup("GET", "/a")?.command).toEqual(["twilio", "a"]);
        expect(index.lookup("POST", "/a")?.command).toEqual(["twilio", "b"]);
    });

    it("is case-insensitive on the method", () => {
        const index = buildCatalogIndex(catalog);
        expect(index.lookup("get", "/a")?.command).toEqual(["twilio", "a"]);
    });

    it("returns undefined for an unknown key", () => {
        const index = buildCatalogIndex(catalog);
        expect(index.lookup("DELETE", "/a")).toBeUndefined();
    });
});
