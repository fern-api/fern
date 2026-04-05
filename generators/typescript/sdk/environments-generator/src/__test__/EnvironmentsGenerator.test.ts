import { getTextOfTsNode } from "@fern-typescript/commons";
import { caseConverter, casingsGenerator, createMockEnvironmentsContext } from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { EmptyGeneratedEnvironmentsImpl } from "../EmptyGeneratedEnvironmentsImpl.js";
import { GeneratedMultipleUrlsEnvironmentsImpl } from "../GeneratedMultipleUrlsEnvironmentsImpl.js";
import { GeneratedSingleUrlEnvironmentsImpl } from "../GeneratedSingleUrlEnvironmentsImpl.js";

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
                name: casingsGenerator.generateName("Production"),
                url: "https://api.example.com",
                docs: undefined,
                audiences: undefined,
                defaultUrl: undefined,
                urlTemplate: undefined,
                urlVariables: undefined
            },
            {
                id: "env-staging",
                name: casingsGenerator.generateName("Staging"),
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
        const mockContext = createMockEnvironmentsContext();
        expect(impl.getReferenceToDefaultEnvironment(mockContext)).toBeUndefined();
    });

    it("getReferenceToDefaultEnvironment generates correct property access", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: "env-prod",
            environments: singleUrlEnvironments
        });
        const mockContext = createMockEnvironmentsContext();
        const result = impl.getReferenceToDefaultEnvironment(mockContext);
        assert(result != null, "expected getReferenceToDefaultEnvironment to return an expression");
        expect(getTextOfTsNode(result)).toBe("MyEnvironment.Production");
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

    it("getReferenceToEnvironmentUrl ignores baseUrlId for single URL", () => {
        const impl = new GeneratedSingleUrlEnvironmentsImpl({
            environmentEnumName: "MyEnvironment",
            defaultEnvironmentId: undefined,
            environments: singleUrlEnvironments
        });
        const inputExpr = ts.factory.createIdentifier("env");
        const result = impl.getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue: inputExpr,
            baseUrlId: "some-base-url"
        });
        expect(getTextOfTsNode(result)).toBe("env");
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
        const mockContext = { sourceFile, case: caseConverter } as any;

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
                name: casingsGenerator.generateName("api")
            },
            {
                id: "base-url-auth",
                name: casingsGenerator.generateName("auth")
            }
        ],
        environments: [
            {
                id: "env-prod",
                name: casingsGenerator.generateName("Production"),
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
                name: casingsGenerator.generateName("Staging"),
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
            caseConverter,
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: "env-prod",
            environments: multipleUrlsEnvironments
        });
        expect(impl.hasDefaultEnvironment()).toBe(true);
    });

    it("hasDefaultEnvironment returns false when no default", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            caseConverter,
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: undefined,
            environments: multipleUrlsEnvironments
        });
        expect(impl.hasDefaultEnvironment()).toBe(false);
    });

    it("getReferenceToDefaultEnvironment generates correct property access", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            caseConverter,
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: "env-prod",
            environments: multipleUrlsEnvironments
        });
        const mockContext = createMockEnvironmentsContext();
        const result = impl.getReferenceToDefaultEnvironment(mockContext);
        assert(result != null, "expected getReferenceToDefaultEnvironment to return an expression for multiple URLs");
        expect(getTextOfTsNode(result)).toBe("MyEnvironment.Production");
    });

    it("getReferenceToEnvironmentUrl generates property access for baseUrl", () => {
        const impl = new GeneratedMultipleUrlsEnvironmentsImpl({
            caseConverter,
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
            caseConverter,
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
            caseConverter,
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
            caseConverter,
            environmentEnumName: "MyEnvironment",
            environmentUrlsTypeName: "MyEnvironmentUrls",
            defaultEnvironmentId: "env-prod",
            environments: multipleUrlsEnvironments
        });

        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("environments.ts");

        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
        const mockContext = { sourceFile, case: caseConverter } as any;

        impl.writeToFile(mockContext);

        const text = sourceFile.getFullText();
        expect(text).toMatchSnapshot();
    });
});
