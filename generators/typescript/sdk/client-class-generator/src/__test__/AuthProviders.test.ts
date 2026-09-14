import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    createAuthScheme,
    createBasicAuthScheme,
    createBearerAuthScheme,
    createHeaderAuthScheme,
    createHttpEndpoint,
    createHttpService,
    createMinimalIR,
    createOAuthScheme
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { AuthProvidersGenerator } from "../AuthProvidersGenerator.js";
import { AnyAuthProviderInstance } from "../auth-provider/AnyAuthProviderInstance.js";
import { BasicAuthProviderGenerator } from "../auth-provider/BasicAuthProviderGenerator.js";
import { BasicAuthProviderInstance } from "../auth-provider/BasicAuthProviderInstance.js";
import { BearerAuthProviderGenerator } from "../auth-provider/BearerAuthProviderGenerator.js";
import { BearerAuthProviderInstance } from "../auth-provider/BearerAuthProviderInstance.js";
import { HeaderAuthProviderGenerator } from "../auth-provider/HeaderAuthProviderGenerator.js";
import { HeaderAuthProviderInstance } from "../auth-provider/HeaderAuthProviderInstance.js";
import { InferredAuthProviderInstance } from "../auth-provider/InferredAuthProviderInstance.js";
import { OAuthAuthProviderGenerator } from "../auth-provider/OAuthAuthProviderGenerator.js";
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
                getExpression: () => ts.factory.createIdentifier("errors.SeedApiError"),
                getEntityName: () => ts.factory.createIdentifier("errors.SeedApiError")
            })
        },
        type: {
            getReferenceToType: () => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            }),
            resolveTypeReference: (typeReference: unknown) => typeReference,
            isOptional: () => false,
            generateGetterForResponsePropertyAsString: ({ variable }: { variable: string }) => `${variable}.accessToken`
        },
        sdkClientClass: {
            getReferenceToClientClass: () => ({
                getExpression: () => ts.factory.createIdentifier("SeedClient")
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

        it("generates bearer auth provider that skips the auth header when optionalAuth is enabled", () => {
            const authScheme = createAuthScheme("bearer", createBearerAuthScheme({ tokenEnvVar: "PLANT_API_TOKEN" }));
            const ir = createMinimalIR({ authSchemes: [authScheme] });
            const generator = new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: false,
                shouldUseWrapper: false,
                optionalAuth: true
            });
            const project = new Project({ useInMemoryFileSystem: true });
            const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).not.toContain("AUTH_CONFIG_ERROR_MESSAGE,");
            expect(text).toMatchSnapshot();
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
                    prefix: "Bearer"
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

    // ──────────────────────────────────────────────────────────────────────────
    // Regression: FER-11540
    //
    // Under multi-scheme `auth: any` (e.g. OAuth client-credentials + ApiKey), the
    // generated `BaseClientOptions` nests each scheme's credentials under a wrapper
    // key (e.g. `apiKeyAuth: { apiKey }`). Passing the OLD flat single-scheme shape
    // (`{ apiKey: "..." }`) must NOT silently type-check: previously it compiled,
    // sent no auth header, and produced a live 401 at runtime.
    //
    // These tests pin the exact-object typing of the emitted `AnyAuthProvider.AuthOptions`
    // type so a regression that re-opens the silent no-op is caught at build time.
    // We reconstruct the type as emitted by `AnyAuthProviderGenerator.writeOptions()`
    // (the `AtLeastOneOf` / `UnionToIntersection` utilities) plus representative
    // per-scheme `AuthOptions`, then type-check real usages.
    // ──────────────────────────────────────────────────────────────────────────
    describe("multi-scheme (any) auth options typing [FER-11540]", () => {
        // Mirrors AnyAuthProviderGenerator.writeOptions() + BaseClientTypeGenerator output
        // for `auth: any: [OAuth (client-credentials), ApiKey]` with wrapper keys
        // `bearerAuth` (oauth) and `apiKeyAuth` (api key).
        const AUTH_OPTIONS_SOURCE = `
type Supplier<T> = T | Promise<T> | (() => T | Promise<T>);

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
type AtLeastOneOf<T extends readonly any[]> = {
    [K in keyof T]: T[K] & Partial<UnionToIntersection<Exclude<T[number], T[K]>>>;
}[number];

type OAuthClientCredentials = {
    bearerAuth?: { clientId?: Supplier<string> | undefined; clientSecret?: Supplier<string> | undefined };
};
type OAuthTokenOverride = { bearerAuth?: { token?: Supplier<string> } };
type OAuthAuthOptions = OAuthClientCredentials | OAuthTokenOverride;
type HeaderAuthOptions = { apiKeyAuth?: { apiKey?: Supplier<string> } };

type AnyAuthOptions = AtLeastOneOf<[OAuthAuthOptions, HeaderAuthOptions]>;

export type BaseClientOptions = {
    environment?: Supplier<string>;
    timeoutInSeconds?: number;
    headers?: Record<string, string | undefined>;
} & AnyAuthOptions;
`;

        function diagnosticsForUsage(usage: string): string[] {
            const project = new Project({
                useInMemoryFileSystem: true,
                compilerOptions: {
                    strict: true,
                    noEmit: true,
                    skipLibCheck: true,
                    target: ts.ScriptTarget.ES2020,
                    lib: ["lib.es2020.d.ts"]
                }
            });
            project.createSourceFile("options.ts", AUTH_OPTIONS_SOURCE);
            project.createSourceFile("usage.ts", `import type { BaseClientOptions } from "./options";\n${usage}\n`);
            return project.getPreEmitDiagnostics().map((d) => {
                const message = d.getMessageText();
                return typeof message === "string" ? message : message.getMessageText();
            });
        }

        it("accepts the nested per-scheme wrapper shape", () => {
            const diagnostics = diagnosticsForUsage(
                `const ok: BaseClientOptions = { environment: "x", apiKeyAuth: { apiKey: "k" } };`
            );
            expect(diagnostics).toEqual([]);
        });

        it("accepts the nested oauth client-credentials shape", () => {
            const diagnostics = diagnosticsForUsage(
                `const ok: BaseClientOptions = { bearerAuth: { clientId: "id", clientSecret: "secret" } };`
            );
            expect(diagnostics).toEqual([]);
        });

        it("rejects the flat single-scheme apiKey shape as an inline literal", () => {
            const diagnostics = diagnosticsForUsage(
                `const bad: BaseClientOptions = { environment: "x", apiKey: "k" };`
            );
            // Must be a type error rather than a silent no-op.
            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics.some((d) => d.includes("apiKey"))).toBe(true);
        });

        it("rejects the flat bearer token shape", () => {
            const diagnostics = diagnosticsForUsage(`const bad: BaseClientOptions = { environment: "x", token: "k" };`);
            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics.some((d) => d.includes("token"))).toBe(true);
        });

        it("rejects an entirely unknown option key", () => {
            const diagnostics = diagnosticsForUsage(
                `const bad: BaseClientOptions = { environment: "x", nonsense: 123 };`
            );
            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics.some((d) => d.includes("nonsense"))).toBe(true);
        });
    });
});

// ─── optional-auth custom config ─────────────────────────────────────────────
//
// When `optional-auth` is enabled, AuthProvidersGenerator treats auth as
// non-mandatory even if the IR reports isAuthMandatory=true, so the generated
// client can be constructed without credentials (matching the behavior of a
// spec where auth is not mandatory).

describe("AuthProvidersGenerator optionalAuth", () => {
    function renderBearer({
        isAuthMandatory,
        optionalAuth
    }: {
        isAuthMandatory: boolean;
        optionalAuth?: boolean;
    }): string {
        const authScheme = createAuthScheme("bearer", createBearerAuthScheme());
        const ir = createMinimalIR({ authSchemes: [authScheme], isAuthMandatory });
        const generator = new AuthProvidersGenerator({
            ir,
            authScheme: authScheme as AnyScheme,
            neverThrowErrors: false,
            includeSerdeLayer: true,
            shouldUseWrapper: false,
            optionalAuth
        });
        const project = new Project({ useInMemoryFileSystem: true });
        const context = createMockGeneratorContext(project, "BearerAuthProvider.ts");
        generator.writeToFile(context);
        return context.sourceFile.getFullText();
    }

    it("keeps the token required when auth is mandatory and optionalAuth is off", () => {
        const output = renderBearer({ isAuthMandatory: true, optionalAuth: false });
        expect(output).not.toContain("[TOKEN_PARAM]?:");
        expect(output).toContain("[TOKEN_PARAM]:");
    });

    it("makes the token optional when optionalAuth is on despite mandatory auth", () => {
        const output = renderBearer({ isAuthMandatory: true, optionalAuth: true });
        expect(output).toContain("[TOKEN_PARAM]?:");
    });

    it("sends the request unauthenticated instead of throwing when optionalAuth is on", () => {
        const output = renderBearer({ isAuthMandatory: true, optionalAuth: true });
        expect(output).toContain("return { headers: {} };");
        expect(output).not.toContain("AUTH_CONFIG_ERROR_MESSAGE,");
    });

    it("still throws on a missing token when auth is non-mandatory but optionalAuth is off", () => {
        const output = renderBearer({ isAuthMandatory: false, optionalAuth: false });
        expect(output).toContain("AUTH_CONFIG_ERROR_MESSAGE,");
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// With `guardProcessEnvAccess` enabled, env var reads must never touch a bare
// `process` global: optional chaining (`process.env?.[KEY]`) still throws a
// ReferenceError when `process` itself is undeclared, which is the case in
// browsers/Vite, Cloudflare Workers and Deno. With the flag off (the default),
// the reads stay unguarded so existing generated SDKs do not change.
// ──────────────────────────────────────────────────────────────────────────────
describe.each([true, false])("environment variable fallbacks (guardProcessEnvAccess: %s)", (guarded) => {
    function render(
        generator: {
            writeToFile: (context: ReturnType<typeof createMockGeneratorContext>) => void;
        },
        fileName: string
    ): string {
        const project = new Project({ useInMemoryFileSystem: true });
        const context = createMockGeneratorContext(project, fileName);
        generator.writeToFile(context);
        return context.sourceFile.getFullText();
    }

    function renderOAuth(): string {
        const authScheme = createOAuthScheme({
            clientIdEnvVar: "PLANT_CLIENT_ID",
            clientSecretEnvVar: "PLANT_CLIENT_SECRET"
        });
        const service = createHttpService();
        const ir = createMinimalIR({
            authSchemes: [createAuthScheme("oauth", authScheme)],
            services: { service_test: { ...service, endpoints: [createHttpEndpoint()] } }
        });
        return render(
            new OAuthAuthProviderGenerator({
                ir,
                authScheme,
                neverThrowErrors: false,
                includeSerdeLayer: true,
                shouldUseWrapper: false,
                guardProcessEnvAccess: guarded
            }),
            "OAuthAuthProvider.ts"
        );
    }

    const GUARD = 'typeof process !== "undefined"';

    function countOccurrences(haystack: string, needle: string): number {
        return haystack.split(needle).length - 1;
    }

    /**
     * Counts `process.env` reads in the generated output, and how many of them sit behind the
     * `typeof process` guard. Whitespace is collapsed first so the counts survive line wrapping
     * introduced by formatting (the guard and the read do not stay on one line once formatted).
     */
    function countProcessEnvReads(output: string): { total: number; guarded: number } {
        const normalized = output.replace(/\s+/g, " ");
        return {
            total: countOccurrences(normalized, "process.env"),
            guarded:
                countOccurrences(normalized, `${GUARD} && process.env`) +
                countOccurrences(normalized, `${GUARD} ? process.env`)
        };
    }

    /** Every read is guarded when the flag is on, and none of them when it is off. */
    function expectedReads(total: number): { total: number; guarded: number } {
        return { total, guarded: guarded ? total : 0 };
    }

    it("handles the bearer token env var", () => {
        const authScheme = createAuthScheme("bearer", createBearerAuthScheme({ tokenEnvVar: "PLANT_API_TOKEN" }));
        const ir = createMinimalIR({ authSchemes: [authScheme] });
        const output = render(
            new BearerAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false,
                guardProcessEnvAccess: guarded
            }),
            "BearerAuthProvider.ts"
        );
        // one read in canCreate, one in the getAuthRequest fallback
        expect(countProcessEnvReads(output)).toEqual(expectedReads(2));
    });

    it("handles the header auth env var", () => {
        const authScheme = createAuthScheme("header", createHeaderAuthScheme({ headerEnvVar: "PLANT_API_KEY" }));
        const ir = createMinimalIR({ authSchemes: [authScheme] });
        const output = render(
            new HeaderAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false,
                guardProcessEnvAccess: guarded
            }),
            "HeaderAuthProvider.ts"
        );
        // one read in canCreate, one in the getAuthRequest fallback
        expect(countProcessEnvReads(output)).toEqual(expectedReads(2));
    });

    it("handles the basic auth username and password env vars", () => {
        const authScheme = createAuthScheme(
            "basic",
            createBasicAuthScheme({ usernameEnvVar: "PLANT_USERNAME", passwordEnvVar: "PLANT_PASSWORD" })
        );
        const ir = createMinimalIR({ authSchemes: [authScheme] });
        const output = render(
            new BasicAuthProviderGenerator({
                ir,
                authScheme: authScheme as AnyScheme,
                neverThrowErrors: false,
                isAuthMandatory: true,
                shouldUseWrapper: false,
                guardProcessEnvAccess: guarded
            }),
            "BasicAuthProvider.ts"
        );
        // username and password, each read in canCreate and again in the getAuthRequest fallback
        expect(countProcessEnvReads(output)).toEqual(expectedReads(4));
    });

    it("handles the oauth client id and client secret env vars", () => {
        // client id and client secret, each read in canCreate and again in its supplier fallback
        expect(countProcessEnvReads(renderOAuth())).toEqual(expectedReads(4));
    });

    it("handles the oauth canCreate env var checks", () => {
        const normalized = renderOAuth().replace(/\s+/g, " ");
        const clientId = guarded
            ? `|| (${GUARD} && process.env?.[ENV_CLIENT_ID] != null)`
            : "|| process.env?.[ENV_CLIENT_ID] != null";
        const clientSecret = guarded
            ? `|| (${GUARD} && process.env?.[ENV_CLIENT_SECRET] != null)`
            : "|| process.env?.[ENV_CLIENT_SECRET] != null";
        expect(normalized).toContain(clientId);
        expect(normalized).toContain(clientSecret);
    });

    it("handles the oauth client id and client secret supplier fallbacks", () => {
        const normalized = renderOAuth().replace(/\s+/g, " ");
        // the supplier fallbacks are only reached when no credential was supplied: each read is
        // preceded by an early return on the supplier, so the guard protects the fallback path
        const clientId = guarded
            ? `const envClientId = (${GUARD} ? process.env?.[ENV_CLIENT_ID] : undefined)`
            : "const envClientId = process.env?.[ENV_CLIENT_ID]";
        const clientSecret = guarded
            ? `const envClientSecret = (${GUARD} ? process.env?.[ENV_CLIENT_SECRET] : undefined)`
            : "const envClientSecret = process.env?.[ENV_CLIENT_SECRET]";
        expect(countOccurrences(normalized, clientId)).toBe(1);
        expect(countOccurrences(normalized, clientSecret)).toBe(1);
    });
});
