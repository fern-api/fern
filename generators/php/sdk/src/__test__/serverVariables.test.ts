import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getServerVariableOptions, urlTemplateToPhpString } from "../root-client/serverVariables.js";

const caseConverter = new CaseConverter({
    generationLanguage: "php",
    keywords: undefined,
    smartCasing: true
});

const REGION: FernIr.ServerVariable = {
    id: "region",
    name: "region",
    default: "us-east-1",
    values: ["us-east-1", "us-west-2", "eu-west-1"]
};

const ENVIRONMENT: FernIr.ServerVariable = {
    id: "environment",
    name: "environment",
    default: "prod",
    values: ["prod", "staging", "dev"]
};

function multipleBaseUrlsConfig(): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: "RegionalApiServer",
        environments: FernIr.Environments.multipleBaseUrls({
            baseUrls: [
                { id: "base", name: "base" },
                { id: "auth", name: "auth" }
            ],
            environments: [
                {
                    id: "RegionalApiServer",
                    name: "RegionalApiServer",
                    docs: undefined,
                    audiences: undefined,
                    defaultUrls: undefined,
                    urls: {
                        base: "https://api.example.com/v1",
                        auth: "https://auth.example.com"
                    },
                    urlTemplates: {
                        base: "https://api.{region}.{environment}.example.com/v1",
                        auth: "https://auth.{region}.example.com"
                    },
                    urlVariables: {
                        base: [REGION, ENVIRONMENT],
                        auth: [REGION]
                    }
                }
            ]
        })
    };
}

describe("getServerVariableOptions", () => {
    it("returns nothing when there is no environments config", () => {
        expect(getServerVariableOptions(undefined, caseConverter)).toEqual([]);
    });

    it("dedupes variables by id and de-collides reserved names", () => {
        const options = getServerVariableOptions(multipleBaseUrlsConfig(), caseConverter);
        expect(options.map((option) => option.optionName)).toEqual(["region", "serverUrlEnvironment"]);
    });

    it("reads variables from single base URL environments", () => {
        const config: FernIr.EnvironmentsConfig = {
            defaultEnvironment: undefined,
            environments: FernIr.Environments.singleBaseUrl({
                environments: [
                    {
                        id: "prod",
                        name: "prod",
                        docs: undefined,
                        audiences: undefined,
                        defaultUrl: undefined,
                        url: "https://api.example.com",
                        urlTemplate: "https://api.{region}.example.com",
                        urlVariables: [REGION]
                    }
                ]
            })
        };
        const options = getServerVariableOptions(config, caseConverter);
        expect(options.map((option) => option.optionName)).toEqual(["region"]);
    });
});

describe("urlTemplateToPhpString", () => {
    it("substitutes placeholders with the option name and wraps in a double-quoted string", () => {
        const options = getServerVariableOptions(multipleBaseUrlsConfig(), caseConverter);
        expect(urlTemplateToPhpString("https://api.{region}.{environment}.example.com/v1", options)).toBe(
            '"https://api.{$region}.{$serverUrlEnvironment}.example.com/v1"'
        );
        expect(urlTemplateToPhpString("https://auth.{region}.example.com", options)).toBe(
            '"https://auth.{$region}.example.com"'
        );
    });
});
