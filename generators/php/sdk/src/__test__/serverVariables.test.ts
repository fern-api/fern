import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import {
    getMultipleBaseUrlsTemplatedEnvironment,
    getServerVariableOptions,
    getSingleBaseUrlTemplatedEnvironment,
    urlTemplateToPhpConcatenation
} from "../root-client/serverVariables.js";

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

    it("de-collides server variables from existing options and each other", () => {
        const config = multipleBaseUrlsConfig();
        const environments = config.environments;
        if (environments.type !== "multipleBaseUrls") {
            throw new Error("Expected multiple base URLs");
        }
        const environment = environments.environments[0];
        if (environment == null) {
            throw new Error("Expected an environment");
        }
        environment.urlVariables = {
            base: [
                REGION,
                {
                    id: "server-region",
                    name: "region",
                    default: "us-east-1",
                    values: []
                }
            ]
        };

        const options = getServerVariableOptions(config, caseConverter, ["region", "serverUrlRegion"]);
        expect(options.map((option) => option.optionName)).toEqual(["serverUrlRegion2", "serverUrlRegion3"]);
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

    it("uses the configured default environment before an earlier templated environment", () => {
        const firstVariable: FernIr.ServerVariable = {
            id: "first",
            name: "first",
            default: "first",
            values: []
        };
        const defaultVariable: FernIr.ServerVariable = {
            id: "selected",
            name: "selected",
            default: "selected",
            values: []
        };
        const config: FernIr.EnvironmentsConfig = {
            defaultEnvironment: "default",
            environments: FernIr.Environments.singleBaseUrl({
                environments: [
                    {
                        id: "first",
                        name: "first",
                        docs: undefined,
                        audiences: undefined,
                        defaultUrl: undefined,
                        url: "https://first.example.com",
                        urlTemplate: "https://{first}.example.com",
                        urlVariables: [firstVariable]
                    },
                    {
                        id: "default",
                        name: "default",
                        docs: undefined,
                        audiences: undefined,
                        defaultUrl: undefined,
                        url: "https://default.example.com",
                        urlTemplate: "https://{selected}.example.com",
                        urlVariables: [defaultVariable]
                    }
                ]
            })
        };

        expect(getSingleBaseUrlTemplatedEnvironment(config)?.id).toBe("default");
        expect(getServerVariableOptions(config, caseConverter).map((option) => option.optionName)).toEqual([
            "selected"
        ]);
    });

    it("uses the configured default multiple-base-URL environment", () => {
        const config = multipleBaseUrlsConfig();
        const environments = config.environments;
        if (environments.type !== "multipleBaseUrls") {
            throw new Error("Expected multiple base URLs");
        }
        const defaultEnvironment = environments.environments[0];
        if (defaultEnvironment == null) {
            throw new Error("Expected an environment");
        }
        environments.environments.unshift({
            ...defaultEnvironment,
            id: "EarlierEnvironment",
            name: "EarlierEnvironment"
        });

        expect(getMultipleBaseUrlsTemplatedEnvironment(config)?.id).toBe("RegionalApiServer");
    });
});

describe("urlTemplateToPhpConcatenation", () => {
    it("concatenates single-quoted literals with interpolated option variables", () => {
        const options = getServerVariableOptions(multipleBaseUrlsConfig(), caseConverter);
        expect(urlTemplateToPhpConcatenation("https://api.{region}.{environment}.example.com/v1", options)).toBe(
            "'https://api.' . $region . '.' . $serverUrlEnvironment . '.example.com/v1'"
        );
        expect(urlTemplateToPhpConcatenation("https://auth.{region}.example.com", options)).toBe(
            "'https://auth.' . $region . '.example.com'"
        );
    });

    it("escapes single quotes in literal segments so a template cannot break out of the string", () => {
        const options = getServerVariableOptions(multipleBaseUrlsConfig(), caseConverter);
        expect(urlTemplateToPhpConcatenation("https://api.{region}.example.com/'; phpinfo();", options)).toBe(
            "'https://api.' . $region . '.example.com/\\'; phpinfo();'"
        );
    });
});
