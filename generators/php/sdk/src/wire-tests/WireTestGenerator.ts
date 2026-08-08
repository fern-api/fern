import { CaseConverter, File, GeneratorError, getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { php } from "@fern-api/php-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/php-dynamic-snippets";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest.js";
import { convertIr } from "../utils/convertIr.js";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator.js";

/**
 * Generates WireMock-based integration tests for PHP SDK.
 *
 * This generator creates PHPUnit test files that:
 * 1. Start a WireMock container via docker-compose
 * 2. Make API calls against the mock server
 * 3. Verify the correct requests were made
 */
export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly case: CaseConverter;
    private dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;
    private wireMockConfigContent: Record<string, WireMockMapping>;
    private readonly dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor({ context, ir }: { context: SdkGeneratorContext; ir: FernIr.IntermediateRepresentation }) {
        this.context = context;
        this.case = context.case;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw GeneratorError.internalError("Cannot generate wire tests without FernIr.dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.wireMockConfigContent = this.getWireMockConfigContent();
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: context.config
        });
    }

    public async generate(): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                // Bytes request bodies cannot be exercised against WireMock, so mock-utils omits
                // their stub mappings. Skip them here too, otherwise the generated test would call
                // an endpoint with no matching stub and fail.
                if (endpoint.requestBody?.type === "bytes") {
                    return false;
                }
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(serviceName, endpointsWithExamples);
            if (serviceTestFile) {
                this.context.project.addRawFiles(
                    new File(serviceTestFile.filename, serviceTestFile.directory, serviceTestFile.contents)
                );
            }
        }

        // Generate docker-compose.test.yml, wiremock-mappings.json, and WireMockTestCase.php
        new WireTestSetupGenerator(this.context, this.context.ir).generate();
    }

    private async generateServiceTestFile(
        serviceName: string,
        endpoints: FernIr.HttpEndpoint[]
    ): Promise<{ filename: string; directory: RelativeFilePath; contents: string } | undefined> {
        const endpointTestCases: Array<{
            endpoint: FernIr.HttpEndpoint;
            example: FernIr.dynamic.EndpointExample;
            service: FernIr.HttpService;
            exampleIndex: number;
        }> = [];

        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    const service = Object.values(this.context.ir.services).find((s) =>
                        s.endpoints.some((e) => e.id === endpoint.id)
                    );
                    if (service) {
                        endpointTestCases.push({ endpoint, example: firstExample, service, exampleIndex: 0 });
                    }
                }
            }
        }

        if (endpointTestCases.length === 0) {
            return undefined;
        }

        this.context.logger.info(
            `Generating test file for service ${serviceName} with ${endpointTestCases.length} test cases`
        );

        const testClassName = this.getTestClassName(serviceName);
        const phpContent = await this.buildTestFileContent(testClassName, endpointTestCases);

        return {
            filename: `${testClassName}.php`,
            directory: RelativeFilePath.of("tests/Wire"),
            contents:
                "<?php\n\n" +
                phpContent.toString({
                    namespace: this.context.getTestsNamespace(),
                    rootNamespace: this.context.getRootNamespace(),
                    customConfig: this.context.customConfig
                })
        };
    }

    private getTestClassName(serviceName: string): string {
        // Convert service name to PascalCase and append WireTest
        const pascalCase = serviceName
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");
        return `${pascalCase}WireTest`;
    }

    private generateSetUpMethod(): php.Method {
        return php.method({
            name: "setUp",
            access: "protected",
            parameters: [],
            body: php.codeblock((writer) => {
                writer.writeTextStatement("parent::setUp()");
                writer.writeTextStatement("$wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080'");

                // Build auth parameters
                const authParams = this.buildAuthParamsForTest();

                // Instantiate the client with auth and environment
                writer.write("$this->client = new ");
                writer.writeNode(
                    php.classReference({
                        namespace: this.context.getRootNamespace(),
                        name: this.context.getRootClientClassName()
                    })
                );
                writer.write("(");

                if (authParams.length > 0) {
                    writer.write("\n");
                    writer.indent();
                    writer.write(authParams.trimEnd());
                    if (!authParams.trimEnd().endsWith(",")) {
                        writer.write(",");
                    }
                    writer.write("\n");
                    writer.dedent();
                }

                // Add options parameter
                if (this.isMultiUrlEnvironment()) {
                    const environment = this.getMultiUrlEnvironmentForTest();
                    if (environment) {
                        // Create environment parameter using Environments::custom()
                        const envValues = Object.values(environment);
                        if (envValues.length > 0) {
                            if (authParams.length === 0) {
                                writer.write("\n");
                                writer.indent();
                            } else {
                                // When auth params exist, we need to add the proper indentation
                                writer.write("    ");
                            }
                            writer.write("environment: ");
                            writer.writeNode(
                                php.classReference({
                                    namespace: this.context.getRootNamespace(),
                                    name: "Environments"
                                })
                            );
                            writer.write(`::custom(${envValues.map(() => "$wiremockUrl").join(", ")}),`);
                            if (authParams.length === 0) {
                                writer.write("\n");
                                writer.dedent();
                            } else {
                                writer.write("\n");
                            }
                        }
                    }
                } else {
                    if (authParams.length === 0) {
                        writer.write("\n");
                        writer.indent();
                    }
                    writer.writeLine("options: [");
                    writer.indent();
                    writer.writeLine("'baseUrl' => $wiremockUrl,");
                    writer.dedent();
                    writer.write("]");
                    if (authParams.length === 0) {
                        writer.write("\n");
                        writer.dedent();
                    } else {
                        writer.write(",\n");
                    }
                }

                writer.writeTextStatement(")");
            })
        });
    }

    private async buildTestFileContent(
        testClassName: string,
        testCases: Array<{
            endpoint: FernIr.HttpEndpoint;
            example: FernIr.dynamic.EndpointExample;
            service: FernIr.HttpService;
            exampleIndex: number;
        }>
    ): Promise<php.Class> {
        const class_ = php.class_({
            name: testClassName,
            namespace: this.context.getTestsNamespace(),
            parentClassReference: php.classReference({
                namespace: `${this.context.getTestsNamespace()}\\Wire`,
                name: "WireMockTestCase"
            })
        });

        // Add client field
        class_.addField(
            php.field({
                name: "$client",
                access: "private",
                type: php.Type.reference(
                    php.classReference({
                        namespace: this.context.getRootNamespace(),
                        name: this.context.getRootClientClassName()
                    })
                )
            })
        );

        // Add setUp method that instantiates the client once
        class_.addMethod(this.generateSetUpMethod());

        for (const { endpoint, example, service, exampleIndex } of testCases) {
            const testMethod = await this.generateEndpointTestMethod({
                endpoint,
                example,
                service,
                exampleIndex
            });
            if (testMethod) {
                class_.addMethod(testMethod);
            }
        }
        return class_;
    }

    private async generateEndpointTestMethod({
        endpoint,
        example,
        service,
        exampleIndex
    }: {
        endpoint: FernIr.HttpEndpoint;
        example: FernIr.dynamic.EndpointExample;
        service: FernIr.HttpService;
        exampleIndex: number;
    }): Promise<php.Method | undefined> {
        try {
            const testName = this.getTestMethodName(endpoint);
            const basePath = this.buildBasePath(endpoint);
            const queryParamsCode = this.buildQueryParamsCode(endpoint);
            const testId = this.buildDeterministicTestId(service, endpoint, exampleIndex);

            // Generate the API call using FernIr.dynamic snippets generator
            // Skip client instantiation since we instantiate it once in setUp()
            const snippetRequest = convertDynamicEndpointSnippetRequest({
                ...example,
                baseUrl: this.isMultiUrlEnvironment() ? undefined : "http://localhost:8080",
                environment: this.isMultiUrlEnvironment() ? this.getMultiUrlEnvironmentForTest() : undefined,
                headers: {
                    ...example.headers,
                    "X-Test-Id": testId
                }
            });
            const snippetAst = await this.dynamicSnippetsGenerator.generateSnippetAst(snippetRequest, {
                skipClientInstantiation: true,
                // Only disambiguate by endpointId under endpoint-security. There every endpoint
                // shares the same method+path (e.g. `GET /users`) but declares a different auth
                // scheme, so location-based resolution would otherwise collapse them all onto the
                // first endpoint. Restricting this to endpoint-security keeps every other fixture's
                // generated wire tests byte-for-byte unchanged.
                endpointId: this.context.isEndpointSecurity() ? endpoint.id : undefined
            });

            const isPaginated = endpoint.pagination != null && this.context.config.generatePaginatedClients === true;

            return php.method({
                name: testName,
                access: "public",
                parameters: [],
                body: php.codeblock((writer) => {
                    // $testId = '...';
                    writer.writeStatement(`$testId = '${testId}'`);

                    if (isPaginated) {
                        writer.write("$response = ");
                        writer.writeNode(snippetAst);
                        writer.writeLine("foreach ($response as $item) {");
                        writer.indent();
                        writer.writeLine("break;");
                        writer.dedent();
                        writer.writeLine("}");
                    } else {
                        writer.writeNode(snippetAst);
                    }

                    // $this->verifyRequestCount(...);
                    writer.writeStatement(`$this->verifyRequestCount(
    $testId,
    "${endpoint.method}",
    "${basePath}",
    ${queryParamsCode},
    1
)`);

                    // Under endpoint-security, assert that only the auth header(s) for this
                    // endpoint's declared scheme(s) were sent and every other scheme's header
                    // is absent.
                    if (this.context.isEndpointSecurity()) {
                        const authHeaderMatchers = this.buildAuthHeaderMatchers(endpoint);
                        if (authHeaderMatchers != null) {
                            writer.writeStatement(`$this->verifyAuthHeaders(
    $testId,
    "${endpoint.method}",
    "${basePath}",
    ${authHeaderMatchers}
)`);
                        }
                    }
                })
            });
        } catch (error) {
            this.context.logger.warn(`Failed to generate test method for endpoint ${endpoint.id}: ${error}`);
            return undefined;
        }
    }

    private getTestMethodName(endpoint: FernIr.HttpEndpoint): string {
        // Convert endpoint name to camelCase test method name
        const endpointName = this.case.camelSafe(endpoint.name);
        return `test${endpointName.charAt(0).toUpperCase()}${endpointName.slice(1)}`;
    }

    private buildDeterministicTestId(
        service: FernIr.HttpService,
        endpoint: FernIr.HttpEndpoint,
        exampleIndex: number
    ): string {
        const servicePathParts = service.name.fernFilepath.allParts.map((part) => this.case.snakeSafe(part));
        const endpointName = this.case.snakeSafe(endpoint.name);

        const segments: string[] = [];
        if (servicePathParts.length > 0) {
            segments.push(servicePathParts.join("."));
        }
        segments.push(endpointName);
        segments.push(String(exampleIndex));

        return segments.join(".");
    }

    private escapeStringForPhp(value: string): string {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/'/g, "\\'");
    }

    private jsonToPhp(value: unknown): string {
        if (value === null || value === undefined) {
            return "null";
        }
        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }
        if (typeof value === "string") {
            return `'${this.escapeStringForPhp(value)}'`;
        }
        if (typeof value === "number") {
            return String(value);
        }
        if (Array.isArray(value)) {
            const items = value.map((item) => this.jsonToPhp(item));
            return `[${items.join(", ")}]`;
        }
        if (typeof value === "object") {
            const entries = Object.entries(value).map(
                ([key, val]) => `'${this.escapeStringForPhp(key)}' => ${this.jsonToPhp(val)}`
            );
            return `[${entries.join(", ")}]`;
        }
        return JSON.stringify(value);
    }

    private buildQueryParamsCode(endpoint: FernIr.HttpEndpoint): string {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        if (!dynamicEndpoint?.examples?.[0]?.queryParameters) {
            return "null";
        }

        const queryParams = dynamicEndpoint.examples[0].queryParameters;
        const entries: string[] = [];

        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value) && value.length > 1) {
                    const items = value.map((v: unknown) => `'${this.escapeStringForPhp(String(v))}'`);
                    entries.push(`'${this.escapeStringForPhp(key)}' => [${items.join(", ")}]`);
                } else {
                    entries.push(`'${this.escapeStringForPhp(key)}' => '${this.escapeStringForPhp(String(value))}'`);
                }
            }
        }

        if (entries.length === 0) {
            return "null";
        }

        return `[${entries.join(", ")}]`;
    }

    private wiremockMappingKey(requestMethod: string, requestUrlPathTemplate: string): string {
        return `${requestMethod} - ${requestUrlPathTemplate}`;
    }

    private getWireMockConfigContent(): Record<string, WireMockMapping> {
        const out: Record<string, WireMockMapping> = {};
        const wiremockStubMapping = WireTestSetupGenerator.getWiremockConfigContent(this.context.ir);
        for (const mapping of wiremockStubMapping.mappings) {
            const key = this.wiremockMappingKey(mapping.request.method, mapping.request.urlPathTemplate);
            out[key] = mapping;
        }
        return out;
    }

    private buildBasePath(endpoint: FernIr.HttpEndpoint): string {
        let basePath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            basePath += `{${part.pathParameter}}${part.tail}`;
        }
        if (!basePath.startsWith("/")) {
            basePath = "/" + basePath;
        }

        const mappingKey = this.wiremockMappingKey(endpoint.method, basePath);

        const wiremockMapping = this.wireMockConfigContent[mappingKey];
        if (wiremockMapping && wiremockMapping.request.pathParameters) {
            Object.entries(wiremockMapping.request.pathParameters).forEach(([paramName, paramValue]) => {
                const pathParam = paramValue as { equalTo: string };
                basePath = basePath.replace(`{${paramName}}`, pathParam.equalTo);
            });
        }

        return basePath;
    }

    private groupEndpointsByService(): Map<string, FernIr.HttpEndpoint[]> {
        const endpointsByService = new Map<string, FernIr.HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            const endpoints = service.endpoints;

            if (endpoints.length > 0) {
                endpointsByService.set(serviceName, endpoints);
            }
        }

        return endpointsByService;
    }

    private getFormattedServiceName(service: FernIr.HttpService): string {
        return service.name.fernFilepath.allParts.map((part) => this.case.camelUnsafe(part)).join("_");
    }

    private isMultiUrlEnvironment(): boolean {
        return this.context.ir.environments?.environments.type === "multipleBaseUrls";
    }

    private getMultiUrlEnvironmentForTest(): Record<string, string> | undefined {
        const environments = this.context.ir.environments?.environments;
        if (environments?.type !== "multipleBaseUrls") {
            return undefined;
        }

        const result: Record<string, string> = {};
        for (const baseUrl of environments.baseUrls) {
            result[baseUrl.id] = "http://localhost:8080";
        }
        return result;
    }

    private buildAuthParamsForTest(): string {
        const authParams: string[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            scheme._visit({
                bearer: () => {
                    authParams.push("token: 'test-token'");
                },
                basic: (basicScheme) => {
                    // Use the scheme's actual parameter names (e.g. `accountSid`/`authToken`
                    // for custom-named basic auth), not hardcoded `username`/`password`.
                    if (!basicScheme.usernameOmit) {
                        authParams.push(`${this.context.getParameterName(basicScheme.username)}: 'test-username'`);
                    }
                    if (!basicScheme.passwordOmit) {
                        authParams.push(`${this.context.getParameterName(basicScheme.password)}: 'test-password'`);
                    }
                },
                header: (header) => {
                    const paramName = this.case.camelSafe(header.name);
                    authParams.push(`${paramName}: 'test-${paramName}'`);
                },
                oauth: () => {
                    authParams.push("clientId: 'test-client-id'");
                    authParams.push("clientSecret: 'test-client-secret'");
                },
                inferred: () => {
                    // Inferred auth is handled separately below using getInferredAuth()
                },
                _other: () => {
                    // Skip unknown auth schemes
                }
            });
        }

        // Handle inferred auth explicitly using the same method as RootClientGenerator
        const inferredAuth = this.context.getInferredAuth();
        if (inferredAuth != null) {
            this.addInferredAuthParams(inferredAuth, authParams);
        }

        // Under endpoint-security multiple schemes can derive the same named argument (e.g.
        // an OAuth scheme and an inferred-auth scheme sharing a token endpoint both surface
        // `clientId`/`clientSecret`). Collapse duplicates by the argument name (the text before
        // the first `:`) so the generated `new Client(...)` call stays valid PHP. Non
        // endpoint-security fixtures never produce duplicates, so this is a no-op for them.
        const dedupedParams = authParams.filter((param, index) => {
            const name = param.split(":")[0];
            return authParams.findIndex((other) => other.split(":")[0] === name) === index;
        });

        if (dedupedParams.length === 0) {
            return "";
        }

        return dedupedParams.map((param) => `${param},\n    `).join("");
    }

    /**
     * Builds a PHP array-literal of WireMock header matchers describing the auth headers that
     * must (and must not) be present for the given endpoint under endpoint-security routing.
     * Returns null when the API has no auth headers in play.
     *
     * The endpoint routes to the first satisfiable security requirement; since the wire-test
     * client is constructed with credentials for every scheme, that is always the first
     * requirement (`endpoint.security[0]`). The headers contributed by that requirement's
     * schemes are expected present; every other scheme's header is expected absent. Endpoints
     * with no declared security (e.g. the token endpoint) expect all auth headers absent.
     */
    private buildAuthHeaderMatchers(endpoint: FernIr.HttpEndpoint): string | null {
        const schemeHeaderInfoByKey = this.getSchemeHeaderInfoByKey();
        if (schemeHeaderInfoByKey.size === 0) {
            return null;
        }

        // All auth header names across every scheme in the API.
        const allHeaderNames = new Set<string>();
        for (const info of schemeHeaderInfoByKey.values()) {
            allHeaderNames.add(info.headerName);
        }

        // The scheme keys satisfied for this endpoint (first requirement, or none).
        const firstRequirement = endpoint.security?.[0];
        const presentSchemeKeys = firstRequirement != null ? Object.keys(firstRequirement) : [];

        // Collect the distinct value prefixes contributing to each present header name so that
        // a single-scheme header can be pinned to its prefix (e.g. "Bearer "/"Basic ").
        const presentPrefixesByHeader = new Map<string, Set<string | undefined>>();
        for (const schemeKey of presentSchemeKeys) {
            const info = schemeHeaderInfoByKey.get(schemeKey);
            if (info == null) {
                continue;
            }
            const prefixes = presentPrefixesByHeader.get(info.headerName) ?? new Set<string | undefined>();
            prefixes.add(info.valuePrefix);
            presentPrefixesByHeader.set(info.headerName, prefixes);
        }

        const entries: string[] = [];
        for (const headerName of Array.from(allHeaderNames).sort()) {
            const prefixes = presentPrefixesByHeader.get(headerName);
            if (prefixes == null) {
                // Header not routed for this endpoint: assert it is absent.
                entries.push(`        '${headerName}' => ['absent' => true]`);
                continue;
            }
            // Header routed: assert present, pinned to the value prefix when unambiguous.
            const onlyPrefix = prefixes.size === 1 ? Array.from(prefixes)[0] : undefined;
            const matcher =
                onlyPrefix != null && /^[A-Za-z0-9 ]+$/.test(onlyPrefix)
                    ? `['matches' => '${onlyPrefix}.*']`
                    : `['matches' => '.*']`;
            entries.push(`        '${headerName}' => ${matcher}`);
        }

        if (entries.length === 0) {
            return null;
        }

        return `[\n${entries.join(",\n")},\n    ]`;
    }

    /**
     * Maps each auth scheme's routing key to the wire header it produces and (when known) the
     * value prefix the SDK writes. Mirrors the header construction in RoutingAuthProvider:
     * bearer/basic/oauth/inferred all write `Authorization`, header schemes write their own
     * header. Literal-valued header schemes are baked into requests, not routed as auth.
     */
    private getSchemeHeaderInfoByKey(): Map<string, { headerName: string; valuePrefix: string | undefined }> {
        const result = new Map<string, { headerName: string; valuePrefix: string | undefined }>();
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer":
                    result.set(scheme.key, { headerName: "Authorization", valuePrefix: "Bearer " });
                    break;
                case "basic":
                    result.set(scheme.key, { headerName: "Authorization", valuePrefix: "Basic " });
                    break;
                case "header": {
                    if (this.context.maybeLiteral(scheme.valueType) != null) {
                        break;
                    }
                    result.set(scheme.key, {
                        headerName: getWireValue(scheme.name),
                        valuePrefix: scheme.prefix != null ? `${scheme.prefix} ` : undefined
                    });
                    break;
                }
                case "oauth": {
                    const credentials = scheme.configuration;
                    result.set(scheme.key, {
                        headerName: credentials.tokenHeader ?? "Authorization",
                        valuePrefix: credentials.tokenPrefix ?? "Bearer "
                    });
                    break;
                }
                case "inferred": {
                    const header = scheme.tokenEndpoint.authenticatedRequestHeaders[0];
                    const headerName = header?.headerName ?? "Authorization";
                    const valuePrefix = header?.valuePrefix ?? (headerName === "Authorization" ? "Bearer " : undefined);
                    result.set(scheme.key, { headerName, valuePrefix });
                    break;
                }
                default:
                    break;
            }
        }
        return result;
    }

    private addInferredAuthParams(scheme: FernIr.InferredAuthScheme, authParams: string[]): void {
        // Extract parameters from the token endpoint's request body and headers
        // This mirrors the logic in RootClientGenerator.getParametersForInferredAuth()
        const tokenEndpointRef = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointRef.serviceId];
        if (service == null) {
            return;
        }
        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointRef.endpointId);
        if (endpoint == null) {
            return;
        }

        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest != null && sdkRequest.shape.type === "wrapper") {
            // Extract parameters from request body properties
            const requestBody = endpoint.requestBody;
            if (requestBody != null && requestBody.type === "inlinedRequestBody") {
                for (const property of requestBody.properties) {
                    const literal = this.context.maybeLiteral(property.valueType);
                    if (literal == null) {
                        const paramName = this.context.getParameterName(property.name);
                        authParams.push(`${paramName}: 'test-${paramName}'`);
                    }
                }
            }

            // Extract parameters from endpoint headers
            for (const header of endpoint.headers) {
                const literal = this.context.maybeLiteral(header.valueType);
                if (literal == null) {
                    const paramName = this.context.getParameterName(header.name);
                    authParams.push(`${paramName}: 'test-${paramName}'`);
                }
            }
        }
    }
}
