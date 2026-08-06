import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { DefaultValueExtractor } from "../DefaultValueExtractor.js";
import { RawClient } from "../endpoint/http/RawClient.js";
import { OAuthProviderGenerator } from "../oauth/OAuthProviderGenerator.js";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments.js";
import { Comments } from "../utils/comments.js";

const TOKEN_PARAMETER_NAME = "token";

/** Client keyword exposed when `allowUserAgentAppInfo` is enabled. */
const APP_INFO_PARAMETER_NAME = "app_info";

/** Instance member the single flat auth provider is assigned to (ALL/ANY auth). */
const AUTH_PROVIDER_MEMBER = "@auth_provider";
/** Instance members the OAuth / inferred providers are assigned to under endpoint-security. */
const OAUTH_PROVIDER_MEMBER = "@oauth_provider";
const INFERRED_AUTH_PROVIDER_MEMBER = "@inferred_auth_provider";

/**
 * Initializer keyword names already used by the client. A server URL variable whose
 * name collides with one of these is exposed under a `server_url_`-prefixed name so it
 * does not shadow an existing option.
 */
const RESERVED_OPTION_NAMES = new Set<string>([
    "base_url",
    "environment",
    "max_retries",
    "token",
    "client",
    "request_options",
    APP_INFO_PARAMETER_NAME
]);

interface InferredAuthParameter {
    snakeName: string;
    isOptional: boolean;
    literal?: FernIr.Literal;
}

interface ServerVariableOption {
    variable: FernIr.ServerVariable;
    /** The initializer keyword exposed to the user (idiomatic snake_case). */
    optionName: string;
    /** The local variable name used when interpolating the URL template. */
    localName: string;
}

export class RootClientGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({ name: this.context.getRootClientClassName() });

        class_.addMethod(this.getInitializeMethod());

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (!this.context.subPackageHasEndpoints(subpackage)) {
                continue;
            }
            class_.addMethod(this.getSubpackageClientGetter(subpackage, rootModule));
        }

        // Add root service endpoint methods directly on the root client
        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const rootService = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of rootService.endpoints) {
                const generatedMethods = this.context.endpointGenerator.generate({
                    endpoint,
                    serviceId: rootServiceId,
                    rawClientReference: "",
                    rawClient: new RawClient(this.context)
                });
                class_.addStatements(generatedMethods);
            }
        }

        rootModule.addStatement(class_);
        return new RubyFile({
            node: astNodeToCodeBlockWithComments(rootModule, [Comments.FrozenStringLiteral]),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getRootFolderPath();
    }

    public getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getFilename(): string {
        return "client.rb";
    }

    private getInitializeMethod(): ruby.Method {
        const parameters: ruby.KeywordParameter[] = [];
        const isMultiUrl = this.context.isMultipleBaseUrlsEnvironment();
        const defaultMaxRetries = this.context.customConfig.maxRetries ?? 2;

        const baseUrlParameter = ruby.parameters.keyword({
            name: "base_url",
            type: ruby.Type.nilable(ruby.Type.string()),
            initializer: ruby.nilValue(),
            docs: "Override the default base URL for the API, e.g., `https://api.example.com`"
        });
        parameters.push(baseUrlParameter);

        if (isMultiUrl) {
            const defaultEnvironmentReference = this.context.getDefaultEnvironmentClassReference();
            const environmentParameter = ruby.parameters.keyword({
                name: "environment",
                type: ruby.Type.nilable(ruby.Type.hash(ruby.Type.class_({ name: "Symbol" }), ruby.Type.string())),
                initializer: defaultEnvironmentReference != null ? defaultEnvironmentReference : ruby.nilValue(),
                docs: "The environment URLs to use for requests"
            });
            parameters.push(environmentParameter);
        }

        const authenticationParameters = this.getAuthenticationParameters();
        parameters.push(...authenticationParameters);

        const globalHeaderParameters = this.getGlobalHeaderParameters();
        parameters.push(...globalHeaderParameters);

        const serverVariableOptions = this.getServerVariableOptions();
        for (const { variable, optionName } of serverVariableOptions) {
            const docLines: string[] = [];
            if (variable.values != null && variable.values.length > 0) {
                docLines.push(`Allowed values (not enforced): ${variable.values.join(", ")}.`);
            }
            if (variable.default != null) {
                docLines.push(`Defaults to "${variable.default}".`);
            }
            parameters.push(
                ruby.parameters.keyword({
                    name: optionName,
                    type: ruby.Type.nilable(ruby.Type.string()),
                    initializer: ruby.nilValue(),
                    docs: docLines.length > 0 ? docLines.join(" ") : undefined
                })
            );
        }

        const maxRetriesParameter = ruby.parameters.keyword({
            name: "max_retries",
            type: ruby.Type.integer(),
            initializer: ruby.TypeLiteral.integer(defaultMaxRetries),
            docs: "The default maximum number of retries for failed requests."
        });
        parameters.push(maxRetriesParameter);

        // When the opt-in `allowUserAgentAppInfo` config is enabled, expose an optional
        // `app_info` keyword whose product token is appended to the User-Agent header.
        // Gated so flag-off client.rb keeps byte-identical output.
        if (this.emitAppInfoOption()) {
            parameters.push(
                ruby.parameters.keyword({
                    name: APP_INFO_PARAMETER_NAME,
                    type: ruby.Type.nilable(ruby.Type.hash(ruby.Type.class_({ name: "Symbol" }), ruby.Type.string())),
                    initializer: ruby.nilValue(),
                    docs: "Optional application info ({ name:, version:, comment: }) appended to the User-Agent header."
                })
            );
        }

        // Sort parameters: required (no initializer) before optional (with initializer)
        const sortedParameters = [...parameters].sort((a, b) => {
            const aOptional = a.initializer != null ? 1 : 0;
            const bOptional = b.initializer != null ? 1 : 0;
            return aOptional - bOptional;
        });

        const method = ruby.method({
            name: "initialize",
            kind: ruby.MethodKind.Instance,
            parameters: {
                keyword: sortedParameters
            },
            returnType: ruby.Type.void()
        });

        const serverVariableInterpolation = this.getServerVariableInterpolationStatement(serverVariableOptions);
        if (serverVariableInterpolation != null) {
            method.addStatement(serverVariableInterpolation);
        }

        // Both inferred-auth and OAuth attach their Authorization header through a
        // single `@auth_provider`. When BOTH schemes are present (e.g. `auth: any`
        // with an OAuth and an InferredAuth scheme), emitting both init blocks makes
        // the second `@auth_provider = ...` clobber the first, silently dropping a
        // scheme. Until the ruby-v2 request architecture supports a composite/routing
        // provider, pick exactly ONE provider deterministically: the provider-based
        // scheme that appears first in `ir.auth.schemes` (which mirrors the declared
        // `any` order and how the TS/Rust `AnyAuthProvider` tries schemes in order).
        const inferredAuth = this.context.getInferredAuth();
        const oauthAuth = this.context.getOAuthAuth();
        const isEndpointSecurity = this.context.isEndpointSecurity();
        const useOAuthProvider = this.shouldUseOAuthProvider(inferredAuth, oauthAuth);

        // Under `any`-composed auth with more than one scheme, each scheme's
        // credentials are independently optional: the caller supplies exactly one
        // scheme's creds (e.g. just an API key). In that case OAuth/inferred auth is
        // a FALLBACK, not mandatory — so we must NOT eagerly instantiate the auth
        // provider (which fires a synchronous token request at construction) unless
        // that scheme's credentials were actually provided. For a single mandatory
        // provider scheme we keep the existing eager behavior.
        const anyAuthMultiScheme = this.isAnyAuthWithMultipleSchemes();

        if (isEndpointSecurity) {
            // Under endpoint-security every provider-based scheme may be routed to by
            // some endpoint, so instantiate each one (rather than picking a single
            // deterministic provider). Each is gated on its own credentials so it stays
            // nil when the caller did not supply them, and the routing provider treats a
            // nil sub-provider as "credentials unavailable". Providers resolve tokens
            // lazily on first use, so instantiating both is cheap.
            if (oauthAuth != null) {
                method.addStatement(
                    this.getOAuthInitializationStatement(oauthAuth, /* gateOnCredentials */ true, OAUTH_PROVIDER_MEMBER)
                );
            }
            if (inferredAuth != null) {
                method.addStatement(
                    this.getInferredAuthInitializationStatement(
                        inferredAuth,
                        /* gateOnCredentials */ true,
                        INFERRED_AUTH_PROVIDER_MEMBER
                    )
                );
            }
        } else if (oauthAuth != null && useOAuthProvider) {
            method.addStatement(this.getOAuthInitializationStatement(oauthAuth, anyAuthMultiScheme));
        } else if (inferredAuth != null) {
            method.addStatement(this.getInferredAuthInitializationStatement(inferredAuth, anyAuthMultiScheme));
        }

        const hasAuthProvider = inferredAuth != null || oauthAuth != null;

        if (isMultiUrl) {
            method.addStatement(
                ruby.codeblock((writer) => {
                    writer.writeLine(`@base_url = base_url`);
                    writer.writeLine(`@environment = environment`);
                })
            );
        }

        const defaultEnvironmentReference = this.context.getDefaultEnvironmentClassReference();

        // Check if basic auth is configured so we can conditionally add the Authorization header
        const basicAuthSchemes = this.context.ir.auth.schemes.filter(
            (s): s is typeof s & { type: "basic" } => s.type === "basic"
        );
        const hasBasicAuth = basicAuthSchemes.length > 0;
        const isAuthOptional = !this.context.ir.sdkConfig.isAuthMandatory;
        const conditionalHeaderStatements = this.getConditionalGlobalHeaderStatements();
        // Under endpoint-security, auth headers (bearer, header, basic) are NOT baked
        // into the RawClient's default headers; they are routed per-endpoint via the
        // routing auth provider. So the flat basic-auth header block is suppressed.
        const emitFlatAuth = !isEndpointSecurity;
        const basicAuthSchemesToEmit = emitFlatAuth ? basicAuthSchemes : [];
        const buildHeadersVariable = basicAuthSchemesToEmit.length > 0 || conditionalHeaderStatements.length > 0;

        method.addStatement(
            ruby.codeblock((writer) => {
                if (buildHeadersVariable) {
                    // Build headers in a variable so we can conditionally add
                    // basic auth and nilable global headers
                    writer.write(`headers = `);
                    writer.writeNode(this.getRawClientHeaders({ includeAuth: emitFlatAuth }));
                    writer.newLine();
                    let isFirstBlock = true;
                    let emittedAnyBlock = false;
                    for (let i = 0; i < basicAuthSchemesToEmit.length; i++) {
                        const basicAuthScheme = basicAuthSchemesToEmit[i];
                        if (basicAuthScheme == null) {
                            continue;
                        }
                        const usernameName = this.case.snakeSafe(basicAuthScheme.username);
                        const passwordName = this.case.snakeSafe(basicAuthScheme.password);
                        const usernameOmitted = !!basicAuthScheme.usernameOmit;
                        const passwordOmitted = !!basicAuthScheme.passwordOmit;
                        // Build the credential string for Base64 encoding.
                        // Omitted fields become empty (e.g., password omitted → "#{username}:").
                        let credentialStr: string;
                        if (usernameOmitted && !passwordOmitted) {
                            credentialStr = `":#{${passwordName}}"`;
                        } else if (!usernameOmitted && passwordOmitted) {
                            credentialStr = `"#{${usernameName}}:"`;
                        } else {
                            credentialStr = `"#{${usernameName}}:#{${passwordName}}"`;
                        }
                        // Condition: only require non-omitted fields to be present
                        let condition: string;
                        if (!usernameOmitted && !passwordOmitted) {
                            condition = `!${usernameName}.nil? && !${passwordName}.nil?`;
                        } else if (usernameOmitted && !passwordOmitted) {
                            condition = `!${passwordName}.nil?`;
                        } else if (!usernameOmitted && passwordOmitted) {
                            condition = `!${usernameName}.nil?`;
                        } else {
                            // Both fields omitted — skip auth header entirely when auth is non-mandatory
                            continue;
                        }
                        const authHeaderStmt = `headers["Authorization"] = "Basic #{Base64.strict_encode64(${credentialStr})}"`;
                        if (basicAuthSchemesToEmit.length > 1) {
                            // Multiple basic-auth schemes: emit as an if/elsif chain so
                            // only one scheme is applied at runtime. Modifier form isn't
                            // applicable when there are alternative branches.
                            if (isFirstBlock) {
                                writer.writeLine(`if ${condition}`);
                            } else {
                                writer.writeLine(`elsif ${condition}`);
                            }
                            isFirstBlock = false;
                            emittedAnyBlock = true;
                            writer.writeLine(`  ${authHeaderStmt}`);
                        } else if (isAuthOptional) {
                            // Single optional basic-auth scheme: emit in modifier form so
                            // rubocop's Style/IfUnlessModifier is satisfied without needing
                            // a post-emit autocorrect pass.
                            writer.writeLine(`${authHeaderStmt} if ${condition}`);
                        } else {
                            // Mandatory auth: credentials are always present, so emit the
                            // header unconditionally.
                            writer.writeLine(authHeaderStmt);
                        }
                    }
                    if (emittedAnyBlock && basicAuthSchemesToEmit.length > 1) {
                        writer.writeLine(`end`);
                    }
                }
                for (const statement of conditionalHeaderStatements) {
                    writer.writeLine(statement);
                }
                writer.write(`@raw_client = `);
                writer.writeNode(this.context.getRawClientClassReference());
                writer.writeLine(`.new(`);
                writer.indent();
                if (isMultiUrl) {
                    const multiUrlEnvs = this.context.getMultipleBaseUrlsEnvironments();
                    const defaultBaseUrlId = multiUrlEnvs?.baseUrls[0]?.id;
                    const defaultBaseUrlName =
                        defaultBaseUrlId != null ? this.context.getBaseUrlName(defaultBaseUrlId) : undefined;
                    if (defaultBaseUrlName != null) {
                        writer.writeLine(`base_url: base_url || environment&.dig(:${defaultBaseUrlName}),`);
                    } else {
                        writer.writeLine(`base_url: base_url,`);
                    }
                } else {
                    writer.write(`base_url: base_url`);
                    if (defaultEnvironmentReference != null) {
                        writer.write(" || ");
                        writer.writeNode(defaultEnvironmentReference);
                    }
                    writer.writeLine(`,`);
                }
                if (buildHeadersVariable) {
                    writer.writeLine(`headers: headers,`);
                } else {
                    writer.write(`headers: `);
                    writer.writeNode(this.getRawClientHeaders({ includeAuth: emitFlatAuth }));
                    writer.writeLine(`,`);
                }
                // Global headers are the only client-level headers a request may replace via
                // `additional_headers`; SDK metadata and auth headers stay protected.
                const overridableHeaderNames = this.getOverridableHeaderNames();
                if (overridableHeaderNames.length > 0) {
                    writer.writeLine(`overridable_headers: %w[${overridableHeaderNames.join(" ")}],`);
                }
                if (isEndpointSecurity) {
                    // Under endpoint-security, the RawClient is given a routing auth
                    // provider that holds every scheme's credentials. It contributes no
                    // flat auth headers on each request; instead each endpoint calls
                    // `auth_headers_for_endpoint` with its declared security to get only
                    // the headers it needs.
                    writer.write(`auth_provider: `);
                    writer.writeNode(this.getRoutingAuthProviderInstantiation());
                    writer.writeLine(`,`);
                } else if (hasAuthProvider) {
                    // Pass the auth provider into the RawClient so its `auth_headers`
                    // are resolved on EVERY request rather than baked once here. This
                    // lets token-based providers (OAuth client-credentials, inferred
                    // auth) refresh an expired token mid-session. When the provider's
                    // credentials were not supplied (e.g. an `any`-composed scheme
                    // where another scheme's creds were given) `@auth_provider` is nil,
                    // and the RawClient simply resolves no auth headers.
                    writer.writeLine(`auth_provider: @auth_provider,`);
                }
                writer.writeLine(`max_retries: max_retries`);
                writer.dedent();
                writer.writeLine(`)`);
            })
        );

        return method;
    }

    /**
     * Builds the `Internal::RoutingAuthProvider.new(...)` expression, forwarding each
     * auth scheme's credentials: the bearer token, each header-auth value, the basic
     * username/password (respecting omit), and the OAuth / inferred token providers
     * (nil when their credentials were not supplied).
     */
    private getRoutingAuthProviderInstantiation(): ruby.AstNode {
        const keywordArguments: string[] = [];

        const bearerAuth = this.context.getBearerAuth();
        if (bearerAuth != null) {
            keywordArguments.push(`${TOKEN_PARAMETER_NAME}: ${TOKEN_PARAMETER_NAME}`);
        }
        for (const headerScheme of this.context.getHeaderAuthSchemes()) {
            const paramName = this.case.snakeSafe(headerScheme.name);
            keywordArguments.push(`${paramName}: ${paramName}`);
        }
        const basicAuth = this.context.getBasicAuth();
        if (basicAuth != null) {
            if (basicAuth.usernameOmit !== true) {
                const usernameName = this.case.snakeSafe(basicAuth.username);
                keywordArguments.push(`${usernameName}: ${usernameName}`);
            }
            if (basicAuth.passwordOmit !== true) {
                const passwordName = this.case.snakeSafe(basicAuth.password);
                keywordArguments.push(`${passwordName}: ${passwordName}`);
            }
        }
        if (this.context.getOAuthAuth() != null) {
            keywordArguments.push(`oauth_provider: ${OAUTH_PROVIDER_MEMBER}`);
        }
        if (this.context.getInferredAuth() != null) {
            keywordArguments.push(`inferred_auth_provider: ${INFERRED_AUTH_PROVIDER_MEMBER}`);
        }

        return ruby.codeblock((writer) => {
            writer.writeNode(this.getRoutingAuthProviderClassReference());
            if (keywordArguments.length === 0) {
                writer.write(`.new`);
                return;
            }
            writer.writeLine(`.new(`);
            writer.indent();
            keywordArguments.forEach((argument, index) => {
                writer.writeLine(`${argument}${index < keywordArguments.length - 1 ? "," : ""}`);
            });
            writer.dedent();
            writer.write(`)`);
        });
    }

    private getRoutingAuthProviderClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: "RoutingAuthProvider",
            modules: [this.context.getRootModule().name, "Internal"],
            fullyQualified: true
        });
    }

    /**
     * Decides which single provider to instantiate when both an inferred-auth and
     * an OAuth scheme are present. Only one `@auth_provider` can be materialized in
     * the current architecture, so we choose the scheme that appears first in
     * `ir.auth.schemes` (the declared `any` order). When only one of the two is
     * present, the choice is trivial. Returns `true` when the OAuth provider should
     * win.
     */
    private shouldUseOAuthProvider(
        inferredAuth: FernIr.InferredAuthScheme | undefined,
        oauthAuth: FernIr.OAuthScheme | undefined
    ): boolean {
        if (oauthAuth == null) {
            return false;
        }
        if (inferredAuth == null) {
            return true;
        }
        // Both present: first provider-based scheme in the declared order wins.
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth") {
                return true;
            }
            if (scheme.type === "inferred") {
                return false;
            }
        }
        return true;
    }

    private getInferredAuthInitializationStatement(
        scheme: FernIr.InferredAuthScheme,
        gateOnCredentials: boolean,
        targetMember: string = AUTH_PROVIDER_MEMBER
    ): ruby.AstNode {
        const inferredParams = this.getParametersForInferredAuth(scheme);

        // Get the auth service/endpoint info to determine the auth client class
        const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        const firstPart = service?.name?.fernFilepath?.packagePath[0];
        const subpackageId = firstPart != null ? this.case.pascalSafe(firstPart) : "Auth";

        // Get the token endpoint to check its baseUrl
        const tokenEndpoint = service?.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        const tokenEndpointBaseUrlId = tokenEndpoint?.baseUrl;

        const isMultiUrl = this.context.isMultipleBaseUrlsEnvironment();
        const defaultEnvironmentReference = this.context.getDefaultEnvironmentClassReference();

        // Under `any`-composed multi-scheme auth, gate the inferred-auth provider on
        // its (non-optional) credential params being present, so the provider (and
        // its token request) is only created when the caller actually supplied them.
        // A set-but-empty string is treated the same as absent (`.to_s.empty?`).
        const gatedParams = gateOnCredentials
            ? inferredParams.filter((param) => param != null && !param.isOptional)
            : [];
        const inferredGuard =
            gatedParams.length > 0
                ? gatedParams.map((param) => `!${param.snakeName}.to_s.empty?`).join(" && ")
                : undefined;

        return ruby.codeblock((writer) => {
            if (inferredGuard != null) {
                writer.writeLine(`if ${inferredGuard}`);
                writer.indent();
            }
            // Create an unauthenticated raw client for the auth endpoint
            writer.writeLine(`# Create an unauthenticated client for the auth endpoint`);
            writer.write(`auth_raw_client = `);
            writer.writeNode(this.context.getRawClientClassReference());
            writer.writeLine(`.new(`);
            writer.indent();

            // Resolve base URL with proper fallback to default environment
            // For multi-URL environments, use the token endpoint's baseUrl if specified,
            // otherwise fall back to the first base URL
            if (isMultiUrl) {
                const multiUrlEnvs = this.context.getMultipleBaseUrlsEnvironments();
                // Prefer the token endpoint's baseUrl if specified, otherwise use the first base URL
                const authBaseUrlId = tokenEndpointBaseUrlId ?? multiUrlEnvs?.baseUrls[0]?.id;
                const authBaseUrlName = authBaseUrlId != null ? this.context.getBaseUrlName(authBaseUrlId) : undefined;
                if (authBaseUrlName != null) {
                    writer.writeLine(`base_url: base_url || environment&.dig(:${authBaseUrlName}),`);
                } else {
                    writer.writeLine(`base_url: base_url,`);
                }
            } else {
                writer.write(`base_url: base_url`);
                if (defaultEnvironmentReference != null) {
                    writer.write(" || ");
                    writer.writeNode(defaultEnvironmentReference);
                }
                writer.writeLine(`,`);
            }
            writer.writeLine(`headers: {`);
            writer.indent();

            // Add X-Fern-Language header
            const hasParams = inferredParams.length > 0;
            writer.writeLine(`"X-Fern-Language" => "Ruby"${hasParams ? "," : ""}`);

            // Add any header-based auth params to the auth client headers
            for (let i = 0; i < inferredParams.length; i++) {
                const param = inferredParams[i];
                if (param == null) {
                    continue;
                }
                const headerName = this.snakeToHeaderCase(param.snakeName);
                const isLast = i === inferredParams.length - 1;
                writer.writeLine(`"${headerName}" => ${param.snakeName}${isLast ? "" : ","}`);
            }

            writer.dedent();
            writer.writeLine(`}`);
            writer.dedent();
            writer.writeLine(`)`);
            writer.newLine();

            // Create the auth client
            writer.writeLine(`# Create the auth client for token retrieval`);
            writer.write(`auth_client = `);
            writer.writeNode(
                ruby.classReference({
                    name: "Client",
                    modules: [this.context.getRootModule().name, subpackageId],
                    fullyQualified: true
                })
            );
            writer.writeLine(`.new(client: auth_raw_client)`);
            writer.newLine();

            // Create the auth provider with auth_client and options
            writer.writeLine(`# Create the auth provider with the auth client and credentials`);
            writer.write(`${targetMember} = `);
            writer.writeNode(this.getInferredAuthProviderClassReference());
            writer.writeLine(`.new(`);
            writer.indent();
            writer.writeLine(`auth_client: auth_client,`);
            writer.write(`options: { base_url: base_url`);
            for (const param of inferredParams) {
                if (param == null) {
                    continue;
                }
                writer.write(`, ${param.snakeName}: ${param.snakeName}`);
            }
            writer.writeLine(` }`);
            writer.dedent();
            writer.writeLine(`)`);
            if (inferredGuard != null) {
                writer.dedent();
                writer.writeLine(`end`);
            }
        });
    }

    private snakeToHeaderCase(snakeName: string): string {
        // Convert snake_case to X-Header-Case (e.g., api_key -> X-Api-Key)
        // If the name already starts with x_, don't add another X- prefix
        const parts = snakeName.split("_");
        const startsWithX = parts[0]?.toLowerCase() === "x";

        if (startsWithX) {
            // x_api_key -> X-Api-Key (use existing x as the X- prefix)
            return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("-");
        } else {
            // api_key -> X-Api-Key (add X- prefix)
            return "X-" + parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("-");
        }
    }

    private getInferredAuthProviderClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: "InferredAuthProvider",
            modules: [this.context.getRootModule().name, "Internal"],
            fullyQualified: true
        });
    }

    private getOAuthProviderClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: OAuthProviderGenerator.CLASS_NAME,
            modules: [this.context.getRootModule().name, "Internal"],
            fullyQualified: true
        });
    }

    private getOAuthAdditionalParameterNames(scheme: FernIr.OAuthScheme): string[] {
        return new OAuthProviderGenerator({ context: this.context, scheme }).getAdditionalRequestPropertyNames();
    }

    /**
     * Builds the fully-qualified module path (e.g. `["Seed", "Identity"]`) of the
     * generated subpackage client that owns the OAuth token endpoint, so the root
     * client instantiates the correct `<Root>::<Subpackage...>::Client`. Falls back
     * to the root `Auth` subpackage when the service filepath is unavailable.
     */
    private getAuthClientModules(service: FernIr.HttpService | undefined): string[] {
        const rootModuleName = this.context.getRootModule().name;
        const allParts = service?.name?.fernFilepath?.allParts;
        if (allParts != null && allParts.length > 0) {
            return [rootModuleName, ...allParts.map((part) => this.case.pascalSafe(part))];
        }
        return [rootModuleName, "Auth"];
    }

    private getOAuthInitializationStatement(
        scheme: FernIr.OAuthScheme,
        gateOnCredentials: boolean,
        targetMember: string = AUTH_PROVIDER_MEMBER
    ): ruby.AstNode {
        if (scheme.configuration.type !== "clientCredentials") {
            return ruby.codeblock("");
        }
        const additionalParams = this.getOAuthAdditionalParameterNames(scheme);

        // Determine the auth subpackage/client that owns the token endpoint.
        const tokenEndpointReference = scheme.configuration.tokenEndpoint.endpointReference;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        const authClientModules = this.getAuthClientModules(service);

        const tokenEndpoint = service?.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        const tokenEndpointBaseUrlId = tokenEndpoint?.baseUrl;

        const isMultiUrl = this.context.isMultipleBaseUrlsEnvironment();
        const defaultEnvironmentReference = this.context.getDefaultEnvironmentClassReference();

        return ruby.codeblock((writer) => {
            if (gateOnCredentials) {
                // Under `any`-composed multi-scheme auth OAuth is a fallback. Only
                // instantiate the provider (which fires a synchronous token request)
                // when both credentials were supplied (treating a set-but-empty
                // string the same as absent); otherwise the caller is
                // authenticating with another scheme (e.g. an API key) and we must
                // not touch the token endpoint.
                writer.writeLine(`if !client_id.to_s.empty? && !client_secret.to_s.empty?`);
                writer.indent();
            }
            // Create an unauthenticated raw client for the auth endpoint.
            // OAuth client-credentials sends the credentials in the token request body,
            // so the auth client itself needs no auth headers.
            writer.writeLine(`# Create an unauthenticated client for the auth endpoint`);
            writer.write(`auth_raw_client = `);
            writer.writeNode(this.context.getRawClientClassReference());
            writer.writeLine(`.new(`);
            writer.indent();

            if (isMultiUrl) {
                const multiUrlEnvs = this.context.getMultipleBaseUrlsEnvironments();
                const authBaseUrlId = tokenEndpointBaseUrlId ?? multiUrlEnvs?.baseUrls[0]?.id;
                const authBaseUrlName = authBaseUrlId != null ? this.context.getBaseUrlName(authBaseUrlId) : undefined;
                if (authBaseUrlName != null) {
                    writer.writeLine(`base_url: base_url || environment&.dig(:${authBaseUrlName}),`);
                } else {
                    writer.writeLine(`base_url: base_url,`);
                }
            } else {
                writer.write(`base_url: base_url`);
                if (defaultEnvironmentReference != null) {
                    writer.write(" || ");
                    writer.writeNode(defaultEnvironmentReference);
                }
                writer.writeLine(`,`);
            }
            writer.writeLine(`headers: {`);
            writer.indent();
            writer.writeLine(`"X-Fern-Language" => "Ruby"`);
            writer.dedent();
            writer.writeLine(`}`);
            writer.dedent();
            writer.writeLine(`)`);
            writer.newLine();

            // Create the auth client
            writer.writeLine(`# Create the auth client for token retrieval`);
            writer.write(`auth_client = `);
            writer.writeNode(
                ruby.classReference({
                    name: "Client",
                    modules: authClientModules,
                    fullyQualified: true
                })
            );
            writer.writeLine(`.new(client: auth_raw_client)`);
            writer.newLine();

            // Create the OAuth provider with the auth client and credentials
            writer.writeLine(`# Create the OAuth provider with the auth client and credentials`);
            writer.write(`${targetMember} = `);
            writer.writeNode(this.getOAuthProviderClassReference());
            writer.writeLine(`.new(`);
            writer.indent();
            writer.writeLine(`auth_client: auth_client,`);
            writer.write(`options: { base_url: base_url, client_id: client_id, client_secret: client_secret`);
            for (const param of additionalParams) {
                writer.write(`, ${param}: ${param}`);
            }
            writer.writeLine(` }`);
            writer.dedent();
            writer.writeLine(`)`);
            if (gateOnCredentials) {
                writer.dedent();
                writer.writeLine(`end`);
            }
        });
    }

    private getAuthenticationParameters(): ruby.KeywordParameter[] {
        const parameters: ruby.KeywordParameter[] = [];

        // Under endpoint-security, auth is resolved per-endpoint, so a caller may use only one
        // scheme (e.g. pure OAuth) and must be able to omit the others. A credential without an
        // env-var default therefore defaults to nil instead of being a required keyword argument;
        // otherwise a pure-OAuth user cannot construct the client without also passing an API key.
        const isEndpointSecurity = this.context.isEndpointSecurity();
        const credentialInitializer = (envVar: string | undefined) => {
            if (envVar != null) {
                return ruby.codeblock((writer) => {
                    writer.write(`ENV.fetch("${envVar}", nil)`);
                });
            }
            return isEndpointSecurity ? ruby.nilValue() : undefined;
        };

        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer": {
                    const param = ruby.parameters.keyword({
                        name: TOKEN_PARAMETER_NAME,
                        type: ruby.Type.string(),
                        initializer: credentialInitializer(scheme.tokenEnvVar),
                        docs: undefined
                    });
                    parameters.push(param);
                    break;
                }
                case "header": {
                    const param = ruby.parameters.keyword({
                        name: this.case.snakeSafe(scheme.name),
                        type: ruby.Type.string(),
                        initializer: credentialInitializer(scheme.headerEnvVar),
                        docs: undefined
                    });
                    parameters.push(param);
                    break;
                }
                case "basic": {
                    // When omit is true, the field is completely removed from the end-user API.
                    const usernameOmitted = !!scheme.usernameOmit;
                    const passwordOmitted = !!scheme.passwordOmit;
                    if (!usernameOmitted) {
                        const usernameParam = ruby.parameters.keyword({
                            name: this.case.snakeSafe(scheme.username),
                            type: ruby.Type.string(),
                            initializer: credentialInitializer(scheme.usernameEnvVar),
                            docs: undefined
                        });
                        parameters.push(usernameParam);
                    }
                    if (!passwordOmitted) {
                        const passwordParam = ruby.parameters.keyword({
                            name: this.case.snakeSafe(scheme.password),
                            type: ruby.Type.string(),
                            initializer: credentialInitializer(scheme.passwordEnvVar),
                            docs: undefined
                        });
                        parameters.push(passwordParam);
                    }
                    break;
                }
                case "inferred": {
                    const inferredParams = this.getParametersForInferredAuth(scheme);
                    for (const inferredParam of inferredParams) {
                        const param = ruby.parameters.keyword({
                            name: inferredParam.snakeName,
                            type: inferredParam.isOptional ? ruby.Type.nilable(ruby.Type.string()) : ruby.Type.string(),
                            initializer: inferredParam.isOptional ? ruby.nilValue() : undefined,
                            docs: undefined
                        });
                        parameters.push(param);
                    }
                    break;
                }
                case "oauth": {
                    if (scheme.configuration.type !== "clientCredentials") {
                        break;
                    }
                    const clientIdEnvVar = scheme.configuration.clientIdEnvVar;
                    const clientSecretEnvVar = scheme.configuration.clientSecretEnvVar;

                    parameters.push(
                        ruby.parameters.keyword({
                            name: "client_id",
                            type:
                                clientIdEnvVar != null || isEndpointSecurity
                                    ? ruby.Type.nilable(ruby.Type.string())
                                    : ruby.Type.string(),
                            initializer: credentialInitializer(clientIdEnvVar),
                            docs: undefined
                        })
                    );
                    parameters.push(
                        ruby.parameters.keyword({
                            name: "client_secret",
                            type:
                                clientSecretEnvVar != null || isEndpointSecurity
                                    ? ruby.Type.nilable(ruby.Type.string())
                                    : ruby.Type.string(),
                            initializer: credentialInitializer(clientSecretEnvVar),
                            docs: undefined
                        })
                    );

                    for (const additionalName of this.getOAuthAdditionalParameterNames(scheme)) {
                        parameters.push(
                            ruby.parameters.keyword({
                                name: additionalName,
                                type: isEndpointSecurity ? ruby.Type.nilable(ruby.Type.string()) : ruby.Type.string(),
                                initializer: isEndpointSecurity ? ruby.nilValue() : undefined,
                                docs: undefined
                            })
                        );
                    }
                    break;
                }
                default:
                    break;
            }
        }

        return this.dedupeAuthenticationParameters(this.relaxAuthParametersForAnyAuth(parameters));
    }

    /**
     * Under `any`-composed multi-scheme auth every scheme's credentials are
     * independently optional (the caller supplies exactly one scheme's creds), so
     * no auth parameter may be required. Any parameter that would otherwise be
     * mandatory (no initializer) is relaxed to a nilable string defaulting to `nil`.
     * For a single mandatory scheme this is a no-op, preserving existing behavior.
     */
    private relaxAuthParametersForAnyAuth(parameters: ruby.KeywordParameter[]): ruby.KeywordParameter[] {
        if (!this.isAnyAuthWithMultipleSchemes()) {
            return parameters;
        }
        return parameters.map((parameter) => {
            if (parameter.initializer != null) {
                return parameter;
            }
            return ruby.parameters.keyword({
                name: parameter.name,
                type: ruby.Type.nilable(ruby.Type.string()),
                initializer: ruby.nilValue(),
                docs: parameter.docs
            });
        });
    }

    /**
     * Deduplicates authentication keyword parameters by name. When multiple auth
     * schemes contribute a parameter with the same name (e.g. an inferred-auth
     * scheme and an OAuth scheme both exposing `client_id`/`client_secret`), the
     * constructor must only declare it once. When duplicates differ, the parameter
     * that has an initializer (an optional, env-var-backed parameter) is preferred
     * over a required one so a single credential can satisfy either scheme.
     */
    private dedupeAuthenticationParameters(parameters: ruby.KeywordParameter[]): ruby.KeywordParameter[] {
        const result: ruby.KeywordParameter[] = [];
        const indexByName = new Map<string, number>();
        for (const parameter of parameters) {
            const existingIndex = indexByName.get(parameter.name);
            if (existingIndex == null) {
                indexByName.set(parameter.name, result.length);
                result.push(parameter);
                continue;
            }
            const existing = result[existingIndex];
            if (existing != null && existing.initializer == null && parameter.initializer != null) {
                result[existingIndex] = parameter;
            }
        }
        return result;
    }

    /**
     * Returns constructor keyword parameters for non-literal global headers.
     * For headers with env AND clientDefault, precedence is: caller > env var > clientDefault.
     * Headers without a clientDefault fall back to their env var (when declared) or nil.
     */
    private getGlobalHeaderParameters(): ruby.KeywordParameter[] {
        const parameters: ruby.KeywordParameter[] = [];
        const defaultExtractor = new DefaultValueExtractor(this.context);

        for (const header of this.getNonLiteralGlobalHeaders()) {
            const clientDefault = defaultExtractor.extractClientDefault(header.clientDefault);

            const paramName = this.case.snakeSafe(header.name);
            let initializer: ruby.CodeBlock;
            if (header.env != null && clientDefault != null) {
                // Precedence: caller > env var > clientDefault
                initializer = ruby.codeblock(`ENV.fetch("${header.env}", ${clientDefault})`);
            } else if (header.env != null) {
                initializer = ruby.codeblock(`ENV.fetch("${header.env}", nil)`);
            } else if (clientDefault != null) {
                initializer = ruby.codeblock(clientDefault);
            } else {
                initializer = ruby.codeblock("nil");
            }

            parameters.push(
                ruby.parameters.keyword({
                    name: paramName,
                    type: ruby.Type.nilable(ruby.Type.string()),
                    initializer,
                    docs: undefined
                })
            );
        }

        return parameters;
    }

    private getNonLiteralGlobalHeaders(): FernIr.HttpHeader[] {
        return this.context.ir.headers.filter((header) => this.maybeLiteral(header.valueType) == null);
    }

    /**
     * The wire names of the global headers a request may replace via `additional_headers`.
     * Literal global headers are excluded: their value is fixed by the API definition.
     */
    private getOverridableHeaderNames(): string[] {
        return this.getNonLiteralGlobalHeaders().map((header) => getWireValue(header.name));
    }

    /**
     * Statements that conditionally add global headers whose value may be nil at
     * construction time (no clientDefault), e.g.
     * `headers["X-Api-Version"] = api_version.to_s unless api_version.nil?`.
     */
    private getConditionalGlobalHeaderStatements(): string[] {
        const statements: string[] = [];
        const defaultExtractor = new DefaultValueExtractor(this.context);
        for (const header of this.getNonLiteralGlobalHeaders()) {
            if (defaultExtractor.extractClientDefault(header.clientDefault) != null) {
                continue;
            }
            const paramName = this.case.snakeSafe(header.name);
            const wireValue = getWireValue(header.name);
            statements.push(`headers["${wireValue}"] = ${paramName}.to_s unless ${paramName}.nil?`);
        }
        return statements;
    }

    private getParametersForInferredAuth(scheme: FernIr.InferredAuthScheme): InferredAuthParameter[] {
        const parameters: InferredAuthParameter[] = [];

        // Get the token endpoint to extract request properties
        const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        if (service == null) {
            this.context.logger.warn(`Service with id ${tokenEndpointReference.serviceId} not found for inferred auth`);
            return [];
        }

        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        if (endpoint == null) {
            this.context.logger.warn(
                `Endpoint with id ${tokenEndpointReference.endpointId} not found for inferred auth`
            );
            return [];
        }

        // Extract parameters from the token endpoint request
        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest != null && sdkRequest.shape.type === "wrapper") {
            // Get the request body properties
            const requestBody = endpoint.requestBody;
            if (requestBody != null && requestBody.type === "inlinedRequestBody") {
                for (const property of requestBody.properties) {
                    const literal = this.maybeLiteral(property.valueType);
                    if (literal == null) {
                        // Only add non-literal properties as constructor parameters
                        parameters.push({
                            snakeName: this.case.snakeUnsafe(property.name),
                            isOptional: this.isOptional(property.valueType)
                        });
                    }
                }
            }

            // Also add header parameters from the endpoint
            for (const header of endpoint.headers) {
                const literal = this.maybeLiteral(header.valueType);
                if (literal == null) {
                    parameters.push({
                        snakeName: this.case.snakeUnsafe(header.name),
                        isOptional: this.isOptional(header.valueType)
                    });
                }
            }
        }

        return parameters;
    }

    private isOptional(typeReference: { type: string }): boolean {
        return typeReference.type === "container" || typeReference.type === "unknown";
    }

    private maybeLiteral(typeReference: {
        type: string;
        container?: { type: string; literal?: FernIr.Literal };
    }): FernIr.Literal | undefined {
        if (typeReference.type === "container") {
            const container = typeReference as { type: string; container: { type: string; literal?: FernIr.Literal } };
            if (container.container?.type === "literal") {
                return container.container.literal;
            }
        }
        return undefined;
    }

    private getRawClientHeaders({ includeAuth = true }: { includeAuth?: boolean } = {}): ruby.TypeLiteral {
        const headers: ruby.HashEntry[] = [];

        if (!this.context.customConfig.omitFernHeaders) {
            const userAgent = this.context.ir.sdkConfig.platformHeaders.userAgent;
            // When includePlatformHeaders is enabled we emit a single structured
            // User-Agent ("{sdkName}/{version} ({os}; {arch}) Ruby/{version}") that
            // consolidates the platform + runtime information, resolved at runtime.
            // This supersedes the default "{package}/{version}" User-Agent value.
            if (this.context.customConfig.includePlatformHeaders && userAgent != null) {
                const rootModuleName = this.context.getRootModule().name;
                headers.push({
                    key: ruby.TypeLiteral.string("User-Agent"),
                    value: ruby.codeblock(
                        this.wrapUserAgentWithAppInfo(
                            `${rootModuleName}::Internal::Http::RawClient.user_agent(${JSON.stringify(userAgent.value).replace(/#(?=[{$@])/g, "\\#")})`
                        )
                    )
                });
            } else if (userAgent != null) {
                // Covers both the configured `user-agent` template value and the default
                // `{package}/{version}` (both surface via userAgent.value). When
                // appInfo is enabled the base value is wrapped so the app product token
                // is appended; otherwise it stays a plain string literal (byte-identical).
                if (this.emitAppInfoOption()) {
                    headers.push({
                        key: ruby.TypeLiteral.string("User-Agent"),
                        value: ruby.codeblock(
                            this.wrapUserAgentWithAppInfo(JSON.stringify(userAgent.value).replace(/#(?=[{$@])/g, "\\#"))
                        )
                    });
                } else {
                    headers.push({
                        key: ruby.TypeLiteral.string("User-Agent"),
                        value: ruby.TypeLiteral.string(userAgent.value)
                    });
                }
            }

            headers.push({
                key: ruby.TypeLiteral.string(this.context.ir.sdkConfig.platformHeaders.language),
                value: ruby.TypeLiteral.string("Ruby")
            });
        }

        // In endpoint-security mode, auth headers are NOT baked into the RawClient's
        // default headers; each endpoint routes its own schemes via the routing auth
        // provider. So the flat per-scheme header emission is skipped here.
        for (const header of includeAuth ? this.context.ir.auth.schemes : []) {
            switch (header.type) {
                case "bearer":
                    headers.push({
                        key: ruby.TypeLiteral.string("Authorization"),
                        value: ruby.TypeLiteral.interpolatedString(`Bearer #{${TOKEN_PARAMETER_NAME}}`)
                    });
                    break;
                case "header": {
                    const headerParamName = this.case.snakeSafe(header.name);
                    const headerName = getWireValue(header.name);
                    let headerValueNode: ruby.AstNode;
                    if (header.prefix != null) {
                        // Escape any interpolation markers in the spec-supplied prefix so it
                        // cannot inject arbitrary Ruby code at SDK init time.
                        const safePrefix = header.prefix.replace(/#(?=[{$@])/g, "\\#");
                        headerValueNode = ruby.TypeLiteral.interpolatedString(`${safePrefix} #{${headerParamName}}`);
                    } else {
                        // No prefix means the value is a single interpolation. Emit the
                        // parameter with `.to_s` directly instead of wrapping it in a
                        // redundant interpolated string.
                        headerValueNode = ruby.codeblock(`${headerParamName}.to_s`);
                    }
                    headers.push({
                        key: ruby.TypeLiteral.string(headerName),
                        value: headerValueNode
                    });
                    break;
                }
                case "basic":
                    // Basic auth header is added conditionally in the constructor body
                    // to guard against nil credentials when auth is optional.
                    break;
                case "oauth":
                case "inferred":
                    // OAuth and inferred auth schemes attach their Authorization
                    // headers via their own providers (OAuthProviderGenerator,
                    // InferredAuthProviderGenerator) rather than the raw client's
                    // default header hash, so there's nothing to add here.
                    break;
                default:
                    assertNever(header);
            }
        }

        // Add global headers that have clientDefault values (always non-nil).
        // Headers without a clientDefault may be nil and are added conditionally
        // in the constructor body (see getConditionalGlobalHeaderStatements).
        const defaultExtractor = new DefaultValueExtractor(this.context);
        for (const header of this.getNonLiteralGlobalHeaders()) {
            const clientDefault = defaultExtractor.extractClientDefault(header.clientDefault);
            if (clientDefault == null) {
                continue;
            }
            const paramName = this.case.snakeSafe(header.name);
            const wireValue = getWireValue(header.name);
            headers.push({
                key: ruby.TypeLiteral.string(wireValue),
                value: ruby.codeblock(`${paramName}.to_s`)
            });
        }

        // Add global headers whose type is a literal (e.g. `Accept-Encoding: literal<"gzip">`).
        // These have no constructor parameter, so their value is emitted directly.
        for (const header of this.context.ir.headers) {
            const literal = this.maybeLiteral(header.valueType);
            if (literal == null) {
                continue;
            }
            const literalValue = literal.type === "string" ? literal.string : String(literal.boolean);
            headers.push({
                key: ruby.TypeLiteral.string(getWireValue(header.name)),
                value: ruby.TypeLiteral.string(literalValue)
            });
        }

        return ruby.TypeLiteral.hash(headers);
    }

    /**
     * Whether to expose the opt-in `app_info` client keyword and emit the User-Agent
     * appendix. Gated on the `allowUserAgentAppInfo` config, and suppressed entirely
     * when `omitFernHeaders` is set (no User-Agent is sent in that case), so flag-off
     * output stays byte-identical.
     */
    private emitAppInfoOption(): boolean {
        return (
            this.context.customConfig.allowUserAgentAppInfo === true &&
            !this.context.customConfig.omitFernHeaders &&
            this.context.ir.sdkConfig.platformHeaders.userAgent != null
        );
    }

    /**
     * Wraps a base User-Agent expression so the caller-supplied `app_info` product
     * token is appended (via RawClient.append_app_info). Returns the base expression
     * unchanged when appInfo is not enabled, so non-opted-in output is byte-identical.
     * @param baseExpression The Ruby expression producing the base User-Agent value.
     */
    private wrapUserAgentWithAppInfo(baseExpression: string): string {
        if (!this.emitAppInfoOption()) {
            return baseExpression;
        }
        const rootModuleName = this.context.getRootModule().name;
        return `${rootModuleName}::Internal::Http::RawClient.append_app_info(${baseExpression}, ${APP_INFO_PARAMETER_NAME})`;
    }

    private getSubpackageClientGetter(subpackage: FernIr.Subpackage, rootModule: ruby.Module_): ruby.Method {
        const isMultiUrl = this.context.isMultipleBaseUrlsEnvironment();
        return new ruby.Method({
            name: this.case.snakeSafe(subpackage.name),
            kind: ruby.MethodKind.Instance,
            returnType: ruby.Type.class_(
                ruby.classReference({
                    name: "Client",
                    modules: [rootModule.name, this.case.pascalSafe(subpackage.name)],
                    fullyQualified: true
                })
            ),
            statements: [
                ruby.codeblock((writer) => {
                    if (isMultiUrl) {
                        writer.writeLine(
                            `@${this.case.snakeSafe(subpackage.name)} ||= ` +
                                `${rootModule.name}::` +
                                `${this.case.pascalSafe(subpackage.name)}::` +
                                `Client.new(client: @raw_client, base_url: @base_url, environment: @environment)`
                        );
                    } else {
                        writer.writeLine(
                            `@${this.case.snakeSafe(subpackage.name)} ||= ` +
                                `${rootModule.name}::` +
                                `${this.case.pascalSafe(subpackage.name)}::` +
                                `Client.new(client: @raw_client)`
                        );
                    }
                })
            ]
        });
    }

    private getSubpackages(): FernIr.Subpackage[] {
        return this.context.ir.rootPackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }

    /**
     * Returns the server URL variables (e.g. region) declared on the API's environments,
     * each paired with the initializer keyword it is exposed under. Variables are
     * de-duplicated by id and de-collided against existing initializer keyword names.
     */
    private getServerVariableOptions(): ServerVariableOption[] {
        return this.collectServerVariables().map((variable) => {
            const snake = this.case.snakeSafe(variable.name);
            const optionName = RESERVED_OPTION_NAMES.has(snake) ? `server_url_${snake}` : snake;
            return { variable, optionName, localName: `${optionName}_value` };
        });
    }

    private collectServerVariables(): FernIr.ServerVariable[] {
        const config = this.context.ir.environments;
        if (config == null) {
            return [];
        }
        const seen = new Set<string>();
        const result: FernIr.ServerVariable[] = [];
        const add = (variables: FernIr.ServerVariable[]): void => {
            for (const variable of variables) {
                if (!seen.has(variable.id)) {
                    seen.add(variable.id);
                    result.push(variable);
                }
            }
        };

        const environments = config.environments;
        switch (environments.type) {
            case "singleBaseUrl":
                for (const environment of environments.environments) {
                    if (environment.urlVariables != null) {
                        add(environment.urlVariables);
                        break;
                    }
                }
                break;
            case "multipleBaseUrls":
                for (const environment of environments.environments) {
                    if (environment.urlVariables != null) {
                        for (const variables of Object.values(environment.urlVariables)) {
                            add(variables);
                        }
                        break;
                    }
                }
                break;
            default:
                assertNever(environments);
        }

        return result;
    }

    /**
     * Emits the interpolation of server URL variables (e.g. region/edge) into the base URL.
     * When any server variable is provided at construction time, the base URL(s) are rebuilt
     * from the SELECTED environment's URL template(s), falling back to each variable's default
     * (or its first allowed value). A base_url/environment that is not a known environment
     * constant (a custom URL) is never overridden; when none is given, the first templated
     * environment's template(s) are used.
     * Returns undefined when the API declares no server variables (behavior unchanged).
     */
    private getServerVariableInterpolationStatement(options: ServerVariableOption[]): ruby.AstNode | undefined {
        if (options.length === 0) {
            return undefined;
        }
        const config = this.context.ir.environments;
        if (config == null) {
            return undefined;
        }
        const environments = config.environments;
        // A single negated condition must use `unless` to satisfy rubocop's Style/NegatedIf.
        const firstOptionName = options[0]?.optionName;
        const guard =
            options.length === 1 && firstOptionName != null
                ? `unless ${firstOptionName}.nil?`
                : `if ${options.map(({ optionName }) => `!${optionName}.nil?`).join(" || ")}`;

        const writeLocalDeclarations = (writer: ruby.Writer): void => {
            for (const { optionName, localName, variable } of options) {
                // Server variables always declare a default (OpenAPI requires one); fall back to
                // the first allowed value when a Fern-native environment omits it. Failing at
                // generation time is preferable to silently interpolating an empty URL segment.
                const fallbackValue = variable.default ?? variable.values?.[0];
                if (fallbackValue == null) {
                    throw new Error(
                        `Server URL variable "${variable.id}" has no default or allowed values; ` +
                            "cannot generate a fallback for the base URL."
                    );
                }
                writer.writeLine(
                    `${localName} = ${optionName}.nil? ? ${JSON.stringify(fallbackValue)} : ${optionName}`
                );
            }
        };

        const environmentConstantReference = (name: FernIr.NameOrString): string => {
            return `${this.context.getRootModuleName()}::${this.context.getEnvironmentsClassReference().name}::${this.case.screamingSnakeSafe(name)}`;
        };

        switch (environments.type) {
            case "singleBaseUrl": {
                const templatedEnvironments = environments.environments.filter((env) => env.urlTemplate != null);
                const firstTemplate = templatedEnvironments[0]?.urlTemplate;
                if (firstTemplate == null) {
                    return undefined;
                }
                return ruby.codeblock((writer) => {
                    writer.writeLine(guard);
                    writer.indent();
                    writeLocalDeclarations(writer);
                    // Map each environment constant to its URL template so the SELECTED
                    // environment's template is rendered. A base_url that is not an
                    // environment constant (a custom URL) is left untouched; when no
                    // base_url is given, the first templated environment is used.
                    writer.writeLine(`environment_url_templates = {`);
                    writer.indent();
                    templatedEnvironments.forEach((env, index) => {
                        if (env.urlTemplate == null) {
                            return;
                        }
                        const entry = `${environmentConstantReference(env.name)} => ${this.urlTemplateToRubyString(env.urlTemplate, options)}`;
                        writer.writeLine(`${entry}${index < templatedEnvironments.length - 1 ? "," : ""}`);
                    });
                    writer.dedent();
                    writer.writeLine(`}`);
                    writer.writeLine(
                        `base_url = base_url.nil? ? ${this.urlTemplateToRubyString(firstTemplate, options)} : environment_url_templates.fetch(base_url, base_url)`
                    );
                    writer.dedent();
                    writer.writeLine(`end`);
                });
            }
            case "multipleBaseUrls": {
                const templatedEnvironments = environments.environments.filter((env) => env.urlTemplates != null);
                if (templatedEnvironments.length === 0) {
                    return undefined;
                }
                const entriesForEnvironment = (environment: FernIr.MultipleBaseUrlsEnvironment): string[] => {
                    return environments.baseUrls.map((baseUrl) => {
                        const key = this.case.snakeSafe(baseUrl.name);
                        const template = environment.urlTemplates?.[baseUrl.id];
                        if (template != null) {
                            return `${key}: ${this.urlTemplateToRubyString(template, options)}`;
                        }
                        const staticUrl = environment.urls[baseUrl.id];
                        if (staticUrl == null) {
                            throw new Error(
                                `Base URL "${baseUrl.id}" has neither a URL template nor a static URL; ` +
                                    "cannot generate server URL variable interpolation."
                            );
                        }
                        return `${key}: ${JSON.stringify(staticUrl)}`;
                    });
                };
                const writeEntries = (writer: ruby.Writer, entries: string[], suffix: string): void => {
                    writer.writeLine(`{`);
                    writer.indent();
                    entries.forEach((entry, index) => {
                        writer.writeLine(`${entry}${index < entries.length - 1 ? "," : ""}`);
                    });
                    writer.dedent();
                    writer.writeLine(`}${suffix}`);
                };
                const firstTemplatedEnvironment = templatedEnvironments[0];
                if (firstTemplatedEnvironment == null) {
                    return undefined;
                }
                return ruby.codeblock((writer) => {
                    writer.writeLine(guard);
                    writer.indent();
                    writeLocalDeclarations(writer);
                    // Map each environment constant to its formatted URLs so EVERY host of
                    // the SELECTED environment is rendered from that environment's
                    // templates. A custom environment hash is left untouched; when no
                    // environment is given, the first templated environment is used.
                    writer.writeLine(`environment_url_templates = {`);
                    writer.indent();
                    templatedEnvironments.forEach((env, index) => {
                        writer.write(`${environmentConstantReference(env.name)} => `);
                        writeEntries(
                            writer,
                            entriesForEnvironment(env),
                            index < templatedEnvironments.length - 1 ? "," : ""
                        );
                    });
                    writer.dedent();
                    writer.writeLine(`}`);
                    writer.writeLine(`environment = environment_url_templates.fetch(environment, environment)`);
                    writer.write(`environment ||= `);
                    writeEntries(writer, entriesForEnvironment(firstTemplatedEnvironment), "");
                    writer.dedent();
                    writer.writeLine(`end`);
                });
            }
            default:
                assertNever(environments);
        }
    }

    /**
     * Substitutes `{id}` placeholders in a URL template with `#{localName}` and returns
     * the result as a double-quoted (interpolated) Ruby string literal.
     *
     * The template text is author-controlled (it comes from the API spec's `server.url`),
     * so it is escaped for the Ruby double-quoted string context before our own
     * interpolations are inserted. This prevents a malicious template from breaking out of
     * the string literal or injecting arbitrary Ruby via `#{...}`. Placeholder substitution
     * uses NUL-delimited sentinels so the intentional interpolations survive escaping.
     */
    private urlTemplateToRubyString(template: string, options: ServerVariableOption[]): string {
        const sentinels: { sentinel: string; interpolation: string }[] = [];
        let result = template;
        options.forEach(({ variable, localName }, index) => {
            const sentinel = `\u0000${index}\u0000`;
            sentinels.push({ sentinel, interpolation: `#{${localName}}` });
            result = result.split(`{${variable.id}}`).join(sentinel);
        });
        result = result
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/#(?=[{@$])/g, "\\#");
        for (const { sentinel, interpolation } of sentinels) {
            result = result.split(sentinel).join(interpolation);
        }
        return `"${result}"`;
    }

    /**
     * True when auth is `any`-composed across more than one scheme. In that case
     * each scheme's credentials are independently optional (the caller supplies
     * exactly one scheme's creds), so provider-based schemes (OAuth / inferred) are
     * fallbacks: their credentials must be optional and their token providers may
     * only be instantiated when the corresponding credentials are present. Mirrors
     * the C#/PHP `isAnyAuthWithMultipleSchemes` gate (FER-11539, PR #16968).
     */
    private isAnyAuthWithMultipleSchemes(): boolean {
        return this.context.ir.auth.requirement === "ANY" && this.context.ir.auth.schemes.length > 1;
    }
}
