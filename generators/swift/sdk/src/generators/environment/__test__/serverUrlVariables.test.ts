import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { getServerUrlVariables, urlTemplateToStringLiteral } from "../serverUrlVariables.js";

const caseConverter = new CaseConverter({ generationLanguage: "swift", keywords: undefined, smartCasing: true });

function makeName(originalName: string): FernIr.Name {
    return caseConverter.resolve(originalName);
}

function makeVariable(id: string, defaultValue?: string): FernIr.ServerVariable {
    return { id, name: makeName(id), default: defaultValue, values: undefined };
}

function makeEnvironments(
    environments: { name: string; url: string; urlTemplate?: string; urlVariables?: FernIr.ServerVariable[] }[]
): FernIr.SingleBaseUrlEnvironments {
    return {
        environments: environments.map(({ name, url, urlTemplate, urlVariables }) => ({
            id: name,
            name: makeName(name),
            url,
            urlTemplate,
            urlVariables,
            defaultUrl: undefined,
            audiences: [],
            docs: undefined
        }))
    };
}

describe("getServerUrlVariables", () => {
    it("returns no variables when no environment is templated", () => {
        const variables = getServerUrlVariables({
            environments: makeEnvironments([{ name: "Production", url: "https://api.example.com" }]),
            caseConverter,
            reservedParameterNames: new Set()
        });
        expect(variables).toEqual([]);
    });

    it("deduplicates variables across environments and camel cases their names", () => {
        const variables = getServerUrlVariables({
            environments: makeEnvironments([
                {
                    name: "Production",
                    url: "https://api.us-east-1.example.com",
                    urlTemplate: "https://api.{data_center}.example.com",
                    urlVariables: [makeVariable("data_center", "us-east-1")]
                },
                {
                    name: "Staging",
                    url: "https://staging.us-east-1.example.com",
                    urlTemplate: "https://staging.{data_center}.example.com",
                    urlVariables: [makeVariable("data_center", "us-east-1")]
                }
            ]),
            caseConverter,
            reservedParameterNames: new Set()
        });
        expect(variables.map(({ name }) => name)).toEqual(["dataCenter"]);
    });

    it("skips variables that no template references", () => {
        const variables = getServerUrlVariables({
            environments: makeEnvironments([
                {
                    name: "Production",
                    url: "https://api.us-east-1.example.com",
                    urlTemplate: "https://api.{region}.example.com",
                    urlVariables: [makeVariable("region", "us-east-1"), makeVariable("unused", "nope")]
                }
            ]),
            caseConverter,
            reservedParameterNames: new Set()
        });
        expect(variables.map(({ name }) => name)).toEqual(["region"]);
    });

    it("prefixes names that collide with root client parameters", () => {
        const variables = getServerUrlVariables({
            environments: makeEnvironments([
                {
                    name: "Production",
                    url: "https://api.example.com",
                    urlTemplate: "https://api.{timeout}.example.com",
                    urlVariables: [makeVariable("timeout", "fast")]
                }
            ]),
            caseConverter,
            reservedParameterNames: new Set(["timeout"])
        });
        expect(variables.map(({ name }) => name)).toEqual(["serverUrlTimeout"]);
    });
});

describe("urlTemplateToStringLiteral", () => {
    const variables = getServerUrlVariables({
        environments: makeEnvironments([
            {
                name: "Production",
                url: "https://api.us-east-1.example.com/v1",
                urlTemplate: "https://api.{region}.example.com/v1",
                urlVariables: [makeVariable("region", "us-east-1")]
            }
        ]),
        caseConverter,
        reservedParameterNames: new Set()
    });

    it("interpolates variables, falling back to their defaults", () => {
        expect(urlTemplateToStringLiteral("https://api.{region}.example.com/v1", variables)).toBe(
            '"https://api.\\(region ?? "us-east-1").example.com/v1"'
        );
    });

    it("escapes variable names that are Swift keywords", () => {
        const keywordVariables = getServerUrlVariables({
            environments: makeEnvironments([
                {
                    name: "Production",
                    url: "https://https.example.com",
                    urlTemplate: "https://{protocol}.example.com",
                    urlVariables: [makeVariable("protocol", "https")]
                }
            ]),
            caseConverter,
            reservedParameterNames: new Set()
        });
        expect(urlTemplateToStringLiteral("https://{protocol}.example.com", keywordVariables)).toBe(
            '"https://\\(`protocol` ?? "https").example.com"'
        );
    });

    it("leaves unrecognized placeholders literal", () => {
        expect(urlTemplateToStringLiteral("https://{tenant}.example.com", variables)).toBe(
            '"https://{tenant}.example.com"'
        );
    });

    it("leaves unterminated placeholders literal", () => {
        expect(urlTemplateToStringLiteral("https://api.{region.example.com", variables)).toBe(
            '"https://api.{region.example.com"'
        );
    });
});
