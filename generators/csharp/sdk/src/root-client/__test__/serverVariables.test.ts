import { CaseConverter } from "@fern-api/base-generator";

import { FernIr } from "@fern-fern/ir-sdk";

import {
    getServerVariableOptions,
    getServerVariableValueExpression,
    urlTemplateToInterpolatedString
} from "../serverVariables.js";

const caseConverter = new CaseConverter({
    generationLanguage: "csharp",
    keywords: undefined,
    smartCasing: true
});

function serverVariable(
    id: string,
    name: FernIr.NameOrString,
    default_?: string,
    values?: string[]
): FernIr.ServerVariable {
    return { id, name, default: default_, values };
}

function name(originalName: string): FernIr.Name {
    return {
        originalName,
        camelCase: { safeName: "wrongCamel", unsafeName: "wrongCamel" },
        pascalCase: { safeName: "WrongPascal", unsafeName: "WrongPascal" },
        snakeCase: { safeName: "wrong_snake", unsafeName: "wrong_snake" },
        screamingSnakeCase: { safeName: "WRONG_SNAKE", unsafeName: "WRONG_SNAKE" }
    };
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

    it("uses the original name when the IR stores precomputed casing metadata", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", name("custom region"), "us-east-1")]),
            caseConverter
        );
        expect(options[0]?.optionName).toBe("CustomRegion");
        expect(options[0]?.localName).toBe("_customRegion");
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

    it("de-collides variables from internal server-variable tracking members", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("explicit", "is base url explicitly set")]),
            caseConverter
        );
        expect(options[0]?.optionName).toBe("ServerUrlIsBaseUrlExplicitlySet");
    });

    it("de-collides generated option names from each other", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([
                serverVariable("environment", "environment"),
                serverVariable("server-url-environment", "server url environment")
            ]),
            caseConverter
        );
        expect(options.map((option) => option.optionName)).toEqual([
            "ServerUrlEnvironment",
            "ServerUrlServerUrlEnvironment"
        ]);
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

    it("exposes options by default when the enabled flag is omitted", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter
        );
        expect(options).toHaveLength(1);
    });

    it("exposes options when explicitly enabled", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter,
            true
        );
        expect(options).toHaveLength(1);
        expect(options[0]?.optionName).toBe("Region");
    });

    it("suppresses all options when disabled, falling back to base-URL behavior", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter,
            false
        );
        expect(options).toEqual([]);
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

    it("escapes braces that are not declared placeholders so they are emitted as literals", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter
        );
        // A brace group that does not match a declared variable must be doubled rather
        // than become a live C# interpolation expression.
        expect(
            urlTemplateToInterpolatedString("https://api.{region}.example.com{System.Environment.Exit(0)}", options)
        ).toBe('$"https://api.{_region}.example.com{{System.Environment.Exit(0)}}"');
    });

    it("escapes C# string metacharacters before reopening declared placeholders", () => {
        const options = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter
        );
        expect(
            urlTemplateToInterpolatedString(
                'https://api.{region}.example.com/"quoted"\\{System.Environment.Exit(0)}',
                options
            )
        ).toBe('$"https://api.{_region}.example.com/\\"quoted\\"\\\\{{System.Environment.Exit(0)}}"');
    });
});

describe("getServerVariableValueExpression", () => {
    it("falls back to the IR default when one is declared", () => {
        const [option] = getServerVariableOptions(
            singleBaseUrl([serverVariable("region", "region", "us-east-1")]),
            caseConverter
        );
        if (option == null) {
            throw new Error("Expected a server variable option");
        }
        expect(getServerVariableValueExpression(option)).toBe('clientOptions.Region ?? "us-east-1"');
    });

    it("throws when neither the client option nor an IR default is available", () => {
        const [option] = getServerVariableOptions(singleBaseUrl([serverVariable("region", "region")]), caseConverter);
        if (option == null) {
            throw new Error("Expected a server variable option");
        }
        expect(getServerVariableValueExpression(option)).toBe(
            "clientOptions.Region ?? throw new global::System.ArgumentException(\"The 'Region' server URL variable has no default value and must be set.\", nameof(clientOptions.Region))"
        );
    });
});
