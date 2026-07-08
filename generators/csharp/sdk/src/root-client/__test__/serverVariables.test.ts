import { CaseConverter } from "@fern-api/base-generator";

import { FernIr } from "@fern-fern/ir-sdk";

import { getServerVariableOptions, urlTemplateToInterpolatedString } from "../serverVariables.js";

const caseConverter = new CaseConverter({
    generationLanguage: "csharp",
    keywords: undefined,
    smartCasing: true
});

function serverVariable(id: string, name: string, default_?: string, values?: string[]): FernIr.ServerVariable {
    return { id, name, default: default_, values };
}

function multipleBaseUrls(
    urlVariables: Record<string, FernIr.ServerVariable[]>,
    urlTemplates?: Record<string, string>
): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: "prod",
        environments: FernIr.Environments.multipleBaseUrls({
            baseUrls: [
                { id: "base", name: "base" },
                { id: "auth", name: "auth" }
            ],
            environments: [
                {
                    docs: undefined,
                    id: "prod",
                    name: "Production",
                    urls: { base: "https://api.example.com", auth: "https://auth.example.com" },
                    audiences: undefined,
                    defaultUrls: undefined,
                    urlTemplates,
                    urlVariables
                }
            ]
        })
    };
}

function singleBaseUrl(urlVariables: FernIr.ServerVariable[], urlTemplate?: string): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: "prod",
        environments: FernIr.Environments.singleBaseUrl({
            environments: [
                {
                    docs: undefined,
                    id: "prod",
                    name: "Production",
                    url: "https://api.example.com",
                    audiences: undefined,
                    defaultUrl: undefined,
                    urlTemplate,
                    urlVariables
                }
            ]
        })
    };
}

describe("getServerVariableOptions", () => {
    it("returns no options when there is no environments config", () => {
        expect(getServerVariableOptions(undefined, caseConverter)).toEqual([]);
    });

    it("exposes each variable under an idiomatic PascalCase option name", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter
        );
        expect(options).toHaveLength(1);
        expect(options[0]?.optionName).toBe("Region");
        expect(options[0]?.localName).toBe("_region");
    });

    it("de-collides a variable whose name matches a reserved client option", () => {
        // `environment` is already a ClientOptions property, so the variable must be
        // surfaced as `ServerUrlEnvironment`.
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("environment", "environment", "prod")]),
            caseConverter
        );
        expect(options[0]?.optionName).toBe("ServerUrlEnvironment");
        expect(options[0]?.localName).toBe("_serverUrlEnvironment");
    });

    it("dedups variables shared across multiple base URLs by id", () => {
        const options = getServerVariableOptions(
            multipleBaseUrls({
                base: [
                    serverVariable("region", "region", "us-east-1"),
                    serverVariable("environment", "environment", "prod")
                ],
                auth: [serverVariable("region", "region", "us-east-1")]
            }),
            caseConverter
        );
        expect(options.map((option) => option.optionName)).toEqual(["Region", "ServerUrlEnvironment"]);
    });

    it("only reads variables from the first environment that declares them", () => {
        const config = multipleBaseUrls({ base: [serverVariable("region", "region", "us-east-1")] });
        expect(getServerVariableOptions(config, caseConverter).map((option) => option.variable.id)).toEqual(["region"]);
    });
});

describe("urlTemplateToInterpolatedString", () => {
    it("substitutes each placeholder with its local variable name", () => {
        const options = getServerVariableOptions(
            multipleBaseUrls({
                base: [
                    serverVariable("region", "region", "us-east-1"),
                    serverVariable("environment", "environment", "prod")
                ]
            }),
            caseConverter
        );
        expect(urlTemplateToInterpolatedString("https://api.{region}.{environment}.example.com/v1", options)).toBe(
            '$"https://api.{_region}.{_serverUrlEnvironment}.example.com/v1"'
        );
    });

    it("leaves a template unchanged when it references only a subset of the variables", () => {
        const options = getServerVariableOptions(
            multipleBaseUrls({
                base: [
                    serverVariable("region", "region", "us-east-1"),
                    serverVariable("environment", "environment", "prod")
                ]
            }),
            caseConverter
        );
        expect(urlTemplateToInterpolatedString("https://auth.{region}.example.com", options)).toBe(
            '$"https://auth.{_region}.example.com"'
        );
    });
});
