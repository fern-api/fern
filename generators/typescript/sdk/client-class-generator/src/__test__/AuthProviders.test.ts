import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    createAuthScheme,
    createBasicAuthScheme,
    createBearerAuthScheme,
    createHeaderAuthScheme,
    createMinimalIR
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { AnyAuthProviderInstance } from "../auth-provider/AnyAuthProviderInstance.js";
import { BasicAuthProviderGenerator } from "../auth-provider/BasicAuthProviderGenerator.js";
import { BasicAuthProviderInstance } from "../auth-provider/BasicAuthProviderInstance.js";
import { BearerAuthProviderGenerator } from "../auth-provider/BearerAuthProviderGenerator.js";
import { BearerAuthProviderInstance } from "../auth-provider/BearerAuthProviderInstance.js";
import { HeaderAuthProviderGenerator } from "../auth-provider/HeaderAuthProviderGenerator.js";
import { HeaderAuthProviderInstance } from "../auth-provider/HeaderAuthProviderInstance.js";
import { InferredAuthProviderInstance } from "../auth-provider/InferredAuthProviderInstance.js";
import { OAuthAuthProviderInstance } from "../auth-provider/OAuthAuthProviderInstance.js";
import { RoutingAuthProviderInstance } from "../auth-provider/RoutingAuthProviderInstance.js";

// ─── Mock Context Helpers ────────────────────────────────────────────────────

/**
 * Creates a minimal mock FileContext for AuthProviderInstance tests.
 * Instance classes only need importsManager.addImportFromRoot and generateOAuthClients.
 */
function createMockInstanceContext(opts?: { generateOAuthClients?: boolean }) {
    return {
        importsManager: {
            addImportFromRoot: () => {
                /* noop */
            }
        },
        generateOAuthClients: opts?.generateOAuthClients ?? false,
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a mock FileContext for AuthProviderGenerator writeToFile() tests.
 * Uses a real ts-morph SourceFile and mocks the core utilities used by the generators.
 */
function createMockGeneratorContext(project: Project, fileName: string) {
    const sourceFile = project.createSourceFile(fileName, "", { overwrite: true });
    return {
        sourceFile,
        coreUtilities: {
            auth: {
                AuthProvider: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.AuthProvider")
                },
                AuthRequest: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.AuthRequest")
                },
                BearerToken: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.BearerToken")
                },
                BasicAuth: {
                    toAuthorizationHeader: (username: ts.Expression, password: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("core.BasicAuth.toAuthorizationHeader"),
                            undefined,
                            [username, password]
                        )
                }
            },
            fetcher: {
                SupplierOrEndpointSupplier: {
                    _getReferenceToType: (innerType: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("core.Supplier", [innerType]),
                    get: (expr: ts.Expression, metadata: ts.Expression) =>
                        ts.factory.createAwaitExpression(
                            ts.factory.createCallExpression(
                                ts.factory.createIdentifier("core.Supplier.get"),
                                undefined,
                                [expr, metadata]
                            )
                        )
                },
                EndpointMetadata: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.EndpointMetadata")
                }
            }
        },
        genericAPISdkError: {
            getReferenceToGenericAPISdkError: () => ({
                getExpression: () => ts.factory.createIdentifier("errors.SeedApiError")
            })
        },
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/** Serializes an AST expression to a string for snapshot comparison. */
function printExpression(expr: ts.Expression): string {
    return getTextOfTsNode(expr);
}

/** Serializes an array of ObjectLiteralElementLike to string for snapshot comparison. */
function printProperties(props: ts.ObjectLiteralElementLike[]): string {
    const obj = ts.factory.createObjectLiteralExpression(props, true);
    return getTextOfTsNode(obj);
}

// ─── AuthProviderInstance Tests ──────────────────────────────────────────────

describe("AuthProviderInstance", () => {
    describe("BasicAuthProviderInstance", () => {
        const scheme = createBasicAuthScheme();

        it("instantiate() produces BasicAuthProvider.createInstance call", () => {
            const instance = new BasicAuthProviderInstance(scheme);
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("options")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns username and password properties", () => {
            const instance = new BasicAuthProviderInstance(scheme);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(2);
            expect(printProperties(props)).toMatchSnapshot();
        });

        it("getSnippetProperties() uses custom field names from auth scheme", () => {
            const customScheme = createBasicAuthScheme({ username: "user", password: "pass" });
            const instance = new BasicAuthProviderInstance(customScheme);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(printProperties(props)).toMatchSnapshot();
        });
    });

    describe("BearerAuthProviderInstance", () => {
        const scheme = createBearerAuthScheme();

        it("instantiate() produces new BearerAuthProvider call", () => {
            const instance = new BearerAuthProviderInstance(scheme);
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("options")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns token property", () => {
            const instance = new BearerAuthProviderInstance(scheme);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(1);
            expect(printProperties(props)).toMatchSnapshot();
        });

        it("getSnippetProperties() uses custom token name", () => {
            const customScheme = createBearerAuthScheme({ tokenName: "accessToken" });
            const instance = new BearerAuthProviderInstance(customScheme);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(printProperties(props)).toMatchSnapshot();
        });
    });

    describe("HeaderAuthProviderInstance", () => {
        const scheme = createHeaderAuthScheme();

        it("instantiate() produces new HeaderAuthProvider call", () => {
            const instance = new HeaderAuthProviderInstance(scheme);
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("options")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns header name property", () => {
            const instance = new HeaderAuthProviderInstance(scheme);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(1);
            expect(printProperties(props)).toMatchSnapshot();
        });

        it("getSnippetProperties() uses custom header name", () => {
            const customScheme = createHeaderAuthScheme({ name: "authToken", wireValue: "X-Auth-Token" });
            const instance = new HeaderAuthProviderInstance(customScheme);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(printProperties(props)).toMatchSnapshot();
        });
    });

    describe("OAuthAuthProviderInstance", () => {
        it("instantiate() produces new OAuthAuthProvider call", () => {
            const instance = new OAuthAuthProviderInstance();
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("options")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns clientId and clientSecret when generateOAuthClients is true", () => {
            const instance = new OAuthAuthProviderInstance();
            const context = createMockInstanceContext({ generateOAuthClients: true });
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(2);
            expect(printProperties(props)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns empty array when generateOAuthClients is false", () => {
            const instance = new OAuthAuthProviderInstance();
            const context = createMockInstanceContext({ generateOAuthClients: false });
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(0);
        });
    });

    describe("InferredAuthProviderInstance", () => {
        it("instantiate() produces InferredAuthProvider.createInstance call", () => {
            const instance = new InferredAuthProviderInstance();
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("options")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns empty array", () => {
            const instance = new InferredAuthProviderInstance();
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(0);
        });
    });

    describe("AnyAuthProviderInstance", () => {
        it("instantiate() produces new AnyAuthProvider call", () => {
            const bearerInstance = new BearerAuthProviderInstance(createBearerAuthScheme());
            const instance = new AnyAuthProviderInstance([bearerInstance]);
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("providers")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() combines properties from all constituent providers", () => {
            const bearerInstance = new BearerAuthProviderInstance(createBearerAuthScheme());
            const basicInstance = new BasicAuthProviderInstance(createBasicAuthScheme());
            const instance = new AnyAuthProviderInstance([bearerInstance, basicInstance]);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            // bearer: token, basic: username + password = 3 total
            expect(props).toHaveLength(3);
            expect(printProperties(props)).toMatchSnapshot();
        });

        it("getSnippetProperties() returns empty for empty providers list", () => {
            const instance = new AnyAuthProviderInstance([]);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            expect(props).toHaveLength(0);
        });
    });

    describe("RoutingAuthProviderInstance", () => {
        it("instantiate() produces new RoutingAuthProvider call", () => {
            const providers = new Map<string, BasicAuthProviderInstance>();
            providers.set("basic", new BasicAuthProviderInstance(createBasicAuthScheme()));
            const instance = new RoutingAuthProviderInstance(providers);
            const context = createMockInstanceContext();
            const params = [ts.factory.createIdentifier("providers")];
            const result = instance.instantiate({ context, params });
            expect(printExpression(result)).toMatchSnapshot();
        });

        it("getSnippetProperties() combines properties from all routed providers", () => {
            const providers = new Map<string, BearerAuthProviderInstance | HeaderAuthProviderInstance>();
            providers.set("bearer", new BearerAuthProviderInstance(createBearerAuthScheme()));
            providers.set("header", new HeaderAuthProviderInstance(createHeaderAuthScheme()));
            const instance = new RoutingAuthProviderInstance(providers);
            const context = createMockInstanceContext();
            const props = instance.getSnippetProperties(context);
            // bearer: token, header: apiKey = 2 total
            expect(props).toHaveLength(2);
            expect(printProperties(props)).toMatchSnapshot();
        });
    });
});

// ─── AuthProviderGenerator Tests ─────────────────────────────────────────────
//
// In the real code (AuthProvidersGenerator.ts), the same AuthScheme union variant from
// ir.auth.schemes is passed directly as the constructor's `authScheme` parameter.
// Generators use identity comparison (scheme === this.authScheme) internally to find
// their scheme in the IR's auth.schemes array.
//
// We replicate this by passing the AuthScheme union variant (from createAuthScheme())
// as both the IR scheme entry and the constructor `authScheme`, cast to the inner type.

// biome-ignore lint/suspicious/noExplicitAny: AuthScheme union variant is structurally compatible with inner scheme types; cast matches real code pattern in AuthProvidersGenerator.ts
type AnyScheme = any;

describe("BearerAuthProviderGenerator", () => {
    describe("getFilePath()", () => {
        it("returns auth/BearerAuthProvider.ts path", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            expect(generator.getFilePath()).toMatchSnapshot();
        });
    });

    describe("getAuthProviderClassType()", () => {
        it("returns BearerAuthProvider type reference", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            expect(getTextOfTsNode(generator.getAuthProviderClassType())).toBe("BearerAuthProvider");
        });
    });

    describe("getAuthOptionsProperties()", () => {
        it("returns required token property when auth is mandatory and no env var", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });

        it("returns optional token property with union type when env var is present", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme({ tokenEnvVar: "MY_TOKEN_ENV" }));
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });

        it("returns optional token when auth is not mandatory", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: false,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });

        it("includes docs when present on auth scheme", () => {
            const authScheme = createAuthScheme(
                "bearer",
                createBearerAuthScheme({ docs: "The bearer token for authentication" })
            );
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });
    });

    describe("instantiate()", () => {
        it("produces BearerAuthProvider.createInstance call", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const result = generator.instantiate([ts.factory.createIdentifier("options")]);
            expect(printExpression(result)).toMatchSnapshot();
        });
    });

    describe("writeToFile()", () => {
        it("generates bearer auth provider without env var", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates bearer auth provider with env var", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme({ tokenEnvVar: "PLANT_API_TOKEN" }));
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates bearer auth provider with neverThrowErrors", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: true,
                isAuthMandatory: false,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates bearer auth provider with wrapper (multiple auth schemes)", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: true
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates bearer auth provider with env var + neverThrowErrors", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme({ tokenEnvVar: "PLANT_API_TOKEN" }));
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: true,
                isAuthMandatory: false,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });
});

describe("BasicAuthProviderGenerator", () => {
    describe("getAuthOptionsProperties()", () => {
        it("returns required username and password when auth is mandatory and no env vars", () => {
            const authScheme = createAuthScheme("basic", createBasicAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });

        it("returns optional properties with union type when env vars are present", () => {
            const authScheme = createAuthScheme(
                "basic",
                createBasicAuthScheme({
                    usernameEnvVar: "PLANT_API_USERNAME",
                    passwordEnvVar: "PLANT_API_PASSWORD"
                })
            );
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });
    });

    describe("writeToFile()", () => {
        it("generates basic auth provider without env vars", () => {
            const authScheme = createAuthScheme("basic", createBasicAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BasicAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates basic auth provider with env vars", () => {
            const authScheme = createAuthScheme(
                "basic",
                createBasicAuthScheme({
                    usernameEnvVar: "PLANT_API_USERNAME",
                    passwordEnvVar: "PLANT_API_PASSWORD"
                })
            );
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BasicAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates basic auth provider with neverThrowErrors", () => {
            const authScheme = createAuthScheme("basic", createBasicAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: true,
                isAuthMandatory: false,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BasicAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates basic auth provider with wrapper", () => {
            const authScheme = createAuthScheme("basic", createBasicAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: true
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BasicAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });
});

describe("HeaderAuthProviderGenerator", () => {
    describe("getAuthOptionsProperties()", () => {
        it("returns required header property when auth is mandatory and no env var", () => {
            const authScheme = createAuthScheme("header", createHeaderAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });

        it("returns optional header property with env var fallback", () => {
            const authScheme = createAuthScheme("header", createHeaderAuthScheme({ headerEnvVar: "PLANT_API_KEY" }));
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "test.ts");
            const props = generator.getAuthOptionsProperties(context);
            expect(props).toMatchSnapshot();
        });
    });

    describe("writeToFile()", () => {
        it("generates header auth provider without env var", () => {
            const authScheme = createAuthScheme("header", createHeaderAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "HeaderAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates header auth provider with env var", () => {
            const authScheme = createAuthScheme("header", createHeaderAuthScheme({ headerEnvVar: "PLANT_API_KEY" }));
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "HeaderAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates header auth provider with neverThrowErrors", () => {
            const authScheme = createAuthScheme("header", createHeaderAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: true,
                isAuthMandatory: false,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "HeaderAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates header auth provider with wrapper", () => {
            const authScheme = createAuthScheme("header", createHeaderAuthScheme());
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: true
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "HeaderAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates header auth provider with custom header name and prefix", () => {
            const authScheme = createAuthScheme(
                "header",
                createHeaderAuthScheme({
                    name: "authorization",
                    wireValue: "Authorization",
                    prefix: "Bearer "
                })
            );
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "HeaderAuthProvider.ts");
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });
});
