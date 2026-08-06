import { caseConverter, createMinimalIR } from "@fern-typescript/test-utils";
import { StructureKind, ts } from "ts-morph";
import { beforeAll, describe, expect, it } from "vitest";

import { BaseClientTypeGenerator } from "../BaseClientTypeGenerator.js";

// ──────────────────────────────────────────────────────────────────────────────
// This suite exercises the *runtime behavior* of the self-contained
// `appendAppInfoToUserAgent` helper that BaseClientTypeGenerator emits into the
// generated base client (only when `allowUserAgentAppInfo` is enabled). Because the
// helper is emitted as source (not imported from the shared core-utilities), we
// extract exactly that emitted source, transpile it, and evaluate it — so the tests
// assert against the code SDK consumers actually receive.
// ──────────────────────────────────────────────────────────────────────────────

type AppInfo = { name: string; version?: string; comment?: string };
type AppendFn = (userAgent: string, appInfo: AppInfo | undefined) => string;

function extractEmittedHelperSource(): string {
    const statements: string[] = [];
    const gen = new BaseClientTypeGenerator({
        generateIdempotentRequestOptions: false,
        ir: createMinimalIR(),
        omitFernHeaders: false,
        includePlatformHeaders: false,
        allowUserAgentAppInfo: true,
        retainOriginalCasing: false,
        parameterNaming: "default",
        caseConverter
    });

    // Minimal mock FileContext sufficient for generateNormalizeClientOptionsFunction.
    // biome-ignore lint/suspicious/noExplicitAny: test mock satisfies the FileContext surface used here
    const context: any = {
        npmPackage: { packageName: "@test/sdk", version: "1.0.0" },
        generateOAuthClients: false,
        sourceFile: {
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addInterface: (_iface: any) => undefined,
            addStatements: (code: string) => {
                statements.push(code);
            },
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addImportDeclaration: (_decl: any) => undefined
        },
        importsManager: {
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addImportFromRoot: (_path: string, _opts: any) => undefined
        },
        baseClient: {
            generateBaseClientOptionsInterface: () => ({
                kind: StructureKind.Interface,
                name: "BaseClientOptions",
                isExported: true,
                properties: []
            }),
            generateBaseRequestOptionsInterface: () => ({
                kind: StructureKind.Interface,
                name: "BaseRequestOptions",
                isExported: true,
                properties: []
            }),
            generateBaseIdempotentRequestOptionsInterface: () => ({
                kind: StructureKind.Interface,
                name: "BaseIdempotentRequestOptions",
                isExported: true,
                properties: []
            })
        },
        environments: {
            getReferenceToEnvironmentsEnum: () => ({
                getExpression: () => ts.factory.createIdentifier("environments.TestEnvironment")
            }),
            getReferenceToEnvironmentUrls: () => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode("environments.TestEnvironmentUrls")
            })
        },
        coreUtilities: {
            runtime: {
                type: { _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.type") },
                version: { _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.version") },
                os: { _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.os") },
                arch: { _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.arch") },
                userAgent: {
                    _invoke: (sdkName: ts.Expression, sdkVersion: ts.Expression) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("core.getUserAgent"), undefined, [
                            sdkName,
                            sdkVersion
                        ])
                }
            },
            logging: {
                createLogger: {
                    _invoke: (arg: ts.Expression) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("core.createLogger"), undefined, [
                            arg
                        ])
                },
                Logger: { _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.Logger") }
            }
        },
        versionContext: { getGeneratedVersion: () => undefined },
        case: caseConverter
    };

    gen.writeToFile(context);

    const helper = statements.find((s) => s.includes("function appendAppInfoToUserAgent("));
    if (helper == null) {
        throw new Error("appendAppInfoToUserAgent helper was not emitted");
    }
    return helper;
}

function compileHelper(source: string): AppendFn {
    const transpiled = ts.transpileModule(`${source}\nreturn appendAppInfoToUserAgent;`, {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None }
    }).outputText;
    // eslint-disable-next-line no-new-func
    const factory = new Function(transpiled);
    const fn = factory();
    if (typeof fn !== "function") {
        throw new Error("compiled helper did not evaluate to a function");
    }
    return fn as AppendFn;
}

describe("emitted appendAppInfoToUserAgent (runtime behavior)", () => {
    let append: AppendFn;
    const BASE = "@test/sdk/1.0.0";

    beforeAll(() => {
        append = compileHelper(extractEmittedHelperSource());
    });

    it("returns the User-Agent unchanged when appInfo is undefined", () => {
        expect(append(BASE, undefined)).toBe(BASE);
    });

    // Control characters inside a regex literal are an error under common lint setups
    // (e.g. Biome's `noControlCharactersInRegex`), which SDK consumers run over the
    // generated output, so the emitted helper must not rely on lint suppressions.
    it("emits no control-character regex ranges and no lint suppressions", () => {
        const source = extractEmittedHelperSource();
        expect(source).not.toMatch(/\\u00[0-1][0-9a-fA-F]/);
        expect(source).not.toContain("\\u007f");
        expect(source).not.toContain("eslint-disable");
        expect(source).not.toContain("biome-ignore");
    });

    it("returns the User-Agent unchanged when name is empty", () => {
        expect(append(BASE, { name: "" })).toBe(BASE);
    });

    it("returns the User-Agent unchanged when name is whitespace-only", () => {
        expect(append(BASE, { name: "   " })).toBe(BASE);
        expect(append(BASE, { name: "\t\n " })).toBe(BASE);
    });

    it("appends name only when version and comment are absent", () => {
        expect(append(BASE, { name: "partner-app" })).toBe(`${BASE} partner-app`);
    });

    it("appends name/version when version is present", () => {
        expect(append(BASE, { name: "partner-app", version: "3.1.0" })).toBe(`${BASE} partner-app/3.1.0`);
    });

    it("appends name/version (comment) when all present", () => {
        expect(append(BASE, { name: "partner-app", version: "3.1.0", comment: "+https://partner.example" })).toBe(
            `${BASE} partner-app/3.1.0 (+https://partner.example)`
        );
    });

    it("omits the version segment when version is blank / whitespace-only", () => {
        expect(append(BASE, { name: "partner-app", version: "" })).toBe(`${BASE} partner-app`);
        expect(append(BASE, { name: "partner-app", version: "   " })).toBe(`${BASE} partner-app`);
    });

    it("trims surrounding whitespace rather than encoding it into the product token", () => {
        expect(append(BASE, { name: " partner-app ", version: " 3.1.0 ", comment: " a comment " })).toBe(
            `${BASE} partner-app/3.1.0 (a comment)`
        );
    });

    it("omits the comment group when comment is blank / whitespace-only", () => {
        expect(append(BASE, { name: "partner-app", comment: "   " })).toBe(`${BASE} partner-app`);
    });

    it("token-encodes spaces and control characters in the name (prevents injection)", () => {
        const result = append(BASE, { name: "evil app" });
        expect(result).toBe(`${BASE} evil%20app`);
        expect(result).not.toContain("evil app");
    });

    it("prevents CRLF injection via the name", () => {
        const result = append(BASE, { name: "x\r\nX-Injected: 1" });
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).toContain("%0D%0A");
    });

    it("prevents CRLF injection via the version", () => {
        const result = append(BASE, { name: "app", version: "1.0\r\nEvil: 1" });
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).toContain("%0D%0A");
    });

    it("prevents CRLF injection via the comment", () => {
        const result = append(BASE, { name: "app", comment: "ok\r\nEvil: 1" });
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).toContain("%0D%0A");
    });

    it("escapes parentheses and backslash in the comment so it cannot terminate the group", () => {
        const result = append(BASE, { name: "app", comment: "a)b(c\\d" });
        expect(result).toBe(`${BASE} app (a%29b%28c%5Cd)`);
        // No raw comment delimiters leak inside the emitted comment.
        expect(result.slice(`${BASE} app (`.length, -1)).not.toMatch(/[()\\]/);
    });

    it("keeps normal printable comment characters (e.g. a URL) human-readable", () => {
        expect(append(BASE, { name: "app", comment: "+https://partner.example/path?q=1" })).toBe(
            `${BASE} app (+https://partner.example/path?q=1)`
        );
    });
});
