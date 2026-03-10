import { getTextOfTsNode } from "@fern-typescript/commons";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { EmptyGeneratedEnvironmentsImpl } from "../EmptyGeneratedEnvironmentsImpl.js";
import { GeneratedMultipleUrlsEnvironmentsImpl } from "../GeneratedMultipleUrlsEnvironmentsImpl.js";
import { GeneratedSingleUrlEnvironmentsImpl } from "../GeneratedSingleUrlEnvironmentsImpl.js";

function createName(name: string) {
    return {
        originalName: name,
        camelCase: {
            unsafeName: name.charAt(0).toLowerCase() + name.slice(1),
            safeName: name.charAt(0).toLowerCase() + name.slice(1)
        },
        pascalCase: {
            unsafeName: name.charAt(0).toUpperCase() + name.slice(1),
            safeName: name.charAt(0).toUpperCase() + name.slice(1)
        },
        snakeCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
        screamingSnakeCase: { unsafeName: name.toUpperCase(), safeName: name.toUpperCase() }
    };
}

function createMockEnvironmentsContext() {
    return {
        environments: {
            getReferenceToEnvironmentsEnum: () => ({
                getExpression: () => ts.factory.createIdentifier("MyEnvironment")
            })
        }
    };
}

describe("EmptyGeneratedEnvironmentsImpl", () => {
    it("hasDefaultEnvironment returns false", () => {
        const impl = new EmptyGeneratedEnvironmentsImpl();
        expect(impl.hasDefaultEnvironment()).toBe(false);
    });

    it("getReferenceToDefaultEnvironment returns undefined", () => {
        const impl = new EmptyGeneratedEnvironmentsImpl();
        expect(impl.getReferenceToDefaultEnvironment()).toBeUndefined();
    });

    it("getTypeForUserSuppliedEnvironment returns string type", () => {
        const impl = new EmptyGeneratedEnvironmentsImpl();
        const typeNode = impl.getTypeForUserSuppliedEnvironment();
        const text = getTextOfTsNode(typeNode);
        expect(text).toBe("string");
    });

    it("getReferenceToEnvironmentUrl returns the input expression", () => {
        const impl = new EmptyGeneratedEnvironmentsImpl();
        const inputExpr = ts.factory.createIdentifier("myEnvironment");
        const result = impl.getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue: inputExpr
        });
        expect(getTextOfTsNode(result)).toBe("myEnvironment");
    });
});

describe("GeneratedSingleUrlEnvironmentsImpl", () => {
    const singleUrlEnvironments = {
        environments: [
            {
                id: "env-prod",
                name: createName("Production"),
                url: "https://api.example.com",
                docs: undefined,
                audiences: undefined,
                defaultUrl: undefined,
                urlTemplate: undefined,
                urlVariables: undefined
            },
            {
                id: "env-staging",
                name: createName("Staging"),
                url: "https://staging.example.com",
                docs: "Staging environment",
                audiences: undefined,
                defaultUrl: undefined,
                urlTemplate: undefined,
                urlVariables: undefined
            }
        ]
    };

    it("hasDefaultEnvironment returns true when default is set", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: "env-prod",
            environments: singleUrlEnvironments
        });
        expect(impl.hasDefaultEnvironment()).toBe(true);
    });

    it("hasDefaultEnvironment returns false when no default", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: undefined,
            environments: singleUrlEnvironments
        });
        expect(impl.hasDefaultEnvironment()).toBe(false);
    });

    it("getReferenceToDefaultEnvironment returns undefined when no default", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: undefined,
            environments: singleUrlEnvironments
        });
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
        const mockContext = createMockEnvironmentsContext() as any;
        expect(impl.getReferenceToDefaultEnvironment(mockContext)).toBeUndefined();
    });

    it("getReferenceToDefaultEnvironment generates correct property access", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: "env-prod",
            environments: singleUrlEnvironments
        });
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
        const mockContext = createMockEnvironmentsContext() as any;
        const result = impl.getReferenceToDefaultEnvironment(mockContext);
        expect(result).toBeDefined();
        if (result != null) {
            expect(getTextOfTsNode(result)).toBe("MyEnvironment.Production");
        }
    });

    it("getReferenceToEnvironmentUrl returns the input expression for single URL", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: undefined,
            environments: singleUrlEnvironments
        });
        const inputExpr = ts.factory.createIdentifier("env");
        const result = impl.getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue: inputExpr,
            baseUrlId: undefined
        });
        expect(getTextOfTsNode(result)).toBe("env");
    });

    it("getReferenceToEnvironmentUrl throws when baseUrlId is provided", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: undefined,
            environments: singleUrlEnvironments
        });
        const inputExpr = ts.factory.createIdentifier("env");
        expect(() =>
            impl.getReferenceToEnvironmentUrl({
                referenceToEnvironmentValue: inputExpr,
                baseUrlId: "some-base-url"
            })
        ).toThrow();
    });

    it("writeToFile generates environment const and type alias", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: "env-prod",
            environments: singleUrlEnvironments
        });

        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("environments.ts");

        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
        const mockContext = { sourceFile } as any;

        impl.writeToFile(mockContext);

        const text = sourceFile.getFullText();
        expect(text).toMatchSnapshot();
    });
});

describe("GeneratedMultipleUrlsEnvironmentsImpl", () => {
    const multipleUrlsEnvironments = {
        baseUrls: [
            {
                id: "base-url-api",
                name: createName("api")
            },
            {
                id: "base-url-auth",
                name: createName("auth")
            }
        ],
        environments: [
            {
                id: "env-prod",
                name: createName("Production"),
                urls: {
                    "base-url-api": "https://api.example.com",
                    "base-url-auth": "https://auth.example.com"
                },
                docs: undefined,
                audiences: undefined,
                defaultUrls: undefined,
                urlTemplates: undefined,
                urlVariables: undefined
            },
            {
                id: "env-staging",
                name: createName("Staging"),
                urls: {
                    "base-url-api": "https://api-staging.example.com",
                    "base-url-auth": "https://auth-staging.example.com"
                },
                docs: "Staging environment",
                audiences: undefined,
                defaultUrls: undefined,
                urlTemplates: undefined,
                urlVariables: undefined
            }
        ]
    };

    it("hasDefaultEnvironment returns true when default is set", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: "env-prod",
            environments: multipleUrlsEnvironments
        });
        expect(impl.hasDefaultEnvironment()).toBe(true);
    });

    it("hasDefaultEnvironment returns false when no default", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: undefined,
            environments: multipleUrlsEnvironments
        });
        expect(impl.hasDefaultEnvironment()).toBe(false);
    });

    it("getReferenceToDefaultEnvironment generates correct property access", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: "env-prod",
            environments: multipleUrlsEnvironments
        });
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
        const mockContext = createMockEnvironmentsContext() as any;
        const result = impl.getReferenceToDefaultEnvironment(mockContext);
        expect(result).toBeDefined();
        if (result != null) {
            expect(getTextOfTsNode(result)).toBe("MyEnvironment.Production");
        }
    });

    it("getReferenceToEnvironmentUrl generates property access for baseUrl", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: undefined,
            environments: multipleUrlsEnvironments
        });
        const inputExpr = ts.factory.createIdentifier("env");
        const result = impl.getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue: inputExpr,
            baseUrlId: "base-url-api"
        });
        expect(getTextOfTsNode(result)).toBe("env.api");
    });

    it("getReferenceToEnvironmentUrl throws when baseUrlId is undefined", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: undefined,
            environments: multipleUrlsEnvironments
        });
        const inputExpr = ts.factory.createIdentifier("env");
        expect(() =>
            impl.getReferenceToEnvironmentUrl({
                referenceToEnvironmentValue: inputExpr,
                baseUrlId: undefined
            })
        ).toThrow();
    });

    it("getReferenceToEnvironmentUrl throws when baseUrlId is not found", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: undefined,
            environments: multipleUrlsEnvironments
        });
        const inputExpr = ts.factory.createIdentifier("env");
        expect(() =>
            impl.getReferenceToEnvironmentUrl({
                referenceToEnvironmentValue: inputExpr,
                baseUrlId: "nonexistent-base-url"
            })
        ).toThrow();
    });

    it("writeToFile generates interface, environment const, and type alias", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: "env-prod",
            environments: multipleUrlsEnvironments
        });

        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("environments.ts");

        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
        const mockContext = { sourceFile } as any;

        impl.writeToFile(mockContext);

        const text = sourceFile.getFullText();
        expect(text).toMatchSnapshot();
    });
});
