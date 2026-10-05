import { GeneratorError } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { RustFile } from "@fern-api/rust-base";
import { Module, UseStatement } from "@fern-api/rust-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/rust-dynamic-snippets";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { convertDynamicEndpointSnippetRequest, convertIr } from "../utils/index.js";
import { ErrorGenerator } from "../error/ErrorGenerator.js";
import { BYTES_FALLBACK_NAME_SUFFIX, WireTestSetupGenerator } from "./WireTestSetupGenerator.js";

/**
 * Generates WireMock-based integration tests for Rust SDK.
 *
 * Architecture:
 * - Uses AST builders (Module, UseStatement) for file structure
 * - Uses CodeBlock with raw strings for helper functions (reset, verify)
 * - Parses FernIr.dynamic snippets (strings) for test content
 * - Generates test functions with structured approach
 *
 * This hybrid approach balances:
 * - Type safety and maintainability (AST for structure)
 * - Practicality (strings for complex Rust expressions)
 * - Compatibility (FernIr.dynamic snippets produce strings)
 */
interface WireTestCase {
    endpoint: FernIr.HttpEndpoint;
    /** The IR example this test covers; undefined when the endpoint only has dynamic examples. */
    example: FernIr.ExampleEndpointCall | undefined;
    dynamicExample: FernIr.dynamic.EndpointExample;
    testName: string;
    /** The `ApiError` variant expected for error examples. */
    expectedErrorVariant: string | undefined;
}

export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    private errorGenerator: ErrorGenerator;
    private wireTestSetupGenerator: WireTestSetupGenerator;
    private testCasesByService: Map<string, WireTestCase[]>;
    // Keyed by endpoint and example id, so lookups do not depend on object identity of the IR passed to mock-utils.
    private testIdsByExampleKey = new Map<string, string>();
    // Fallback for examples without an id.
    private testIdsByExample = new Map<FernIr.ExampleEndpointCall, string>();
    private wireMockMappingsByTestId: Record<string, WireMockMapping>;
    private wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext, ir: FernIr.IntermediateRepresentation) {
        this.context = context;
        const dynamicIr = ir.dynamic;
        if (!dynamicIr) {
            throw GeneratorError.internalError("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: this.context.config
        });
        this.errorGenerator = new ErrorGenerator(context);
        this.testCasesByService = this.planTestCases();
        // Each test sends its name as the X-Test-Id header, which selects the WireMock mapping
        // serving that test's example response.
        this.wireTestSetupGenerator = new WireTestSetupGenerator(context, ir, {
            getExampleTestId: ({ endpoint, example }) =>
                example.id != null
                    ? this.testIdsByExampleKey.get(this.getExampleKey(endpoint.id, example.id))
                    : this.testIdsByExample.get(example as unknown as FernIr.ExampleEndpointCall)
        });
        const { mappingsByTestId, defaultMappings } = this.indexWireMockMappings();
        this.wireMockMappingsByTestId = mappingsByTestId;
        this.wireMockConfigContent = defaultMappings;
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    public async generate(): Promise<void> {
        for (const [serviceName, testCases] of this.testCasesByService.entries()) {
            // Without a per-example mapping only the first example's test can run against the
            // endpoint's default mapping (e.g. bytes endpoints, which mock-utils skips).
            const testedEndpointIds = new Set<string>();
            const runnableTestCases = testCases.filter((testCase) => {
                const isFirstForEndpoint = !testedEndpointIds.has(testCase.endpoint.id);
                testedEndpointIds.add(testCase.endpoint.id);
                return isFirstForEndpoint || this.wireMockMappingsByTestId[testCase.testName] != null;
            });
            if (runnableTestCases.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(serviceName, runnableTestCases);
            this.context.project.addSourceFiles(serviceTestFile);
        }

        // Generate docker-compose.test.yml and wiremock-mappings.json for WireMock
        this.wireTestSetupGenerator.generate();
    }

    // =============================================================================
    // TEST CASE SELECTION
    // =============================================================================

    private planTestCases(): Map<string, WireTestCase[]> {
        const testCasesByService = new Map<string, WireTestCase[]>();
        const usedTestNames = new Set<string>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            const testCases = testCasesByService.get(serviceName) ?? [];
            for (const endpoint of service.endpoints) {
                testCases.push(...this.planEndpointTestCases(endpoint, serviceName, usedTestNames));
            }
            testCasesByService.set(serviceName, testCases);
        }

        return testCasesByService;
    }

    /**
     * Selects the examples to test for an endpoint: all user-specified examples (or the first
     * autogenerated success example when there are none), plus one autogenerated error example per
     * error when no user example covers an error. Error examples for errors the SDK's error parser
     * cannot produce (e.g. shadowed by another error with the same status code) are skipped.
     */
    private planEndpointTestCases(
        endpoint: FernIr.HttpEndpoint,
        serviceName: string,
        usedTestNames: Set<string>
    ): WireTestCase[] {
        const dynamicExamples = this.dynamicIr.endpoints[endpoint.id]?.examples ?? [];
        const firstDynamicExample = dynamicExamples[0];
        if (firstDynamicExample == null) {
            return [];
        }

        const toSelected = (examples: Array<{ example?: FernIr.ExampleEndpointCall }>, kind: "user" | "auto") =>
            examples.flatMap((wrapper, index) =>
                wrapper.example != null
                    ? [
                          {
                              example: wrapper.example,
                              dynamicExampleId: wrapper.example.id ?? `${endpoint.id}-${kind}-${index}`
                          }
                      ]
                    : []
            );
        const userExamples = toSelected(endpoint.userSpecifiedExamples, "user");
        const autogeneratedExamples = toSelected(endpoint.autogeneratedExamples, "auto");
        const isError = ({ example }: { example: FernIr.ExampleEndpointCall }) => example.response.type === "error";

        const selected = [...userExamples];
        if (userExamples.length === 0) {
            const firstSuccessExample = autogeneratedExamples.find((example) => !isError(example));
            if (firstSuccessExample != null) {
                selected.push(firstSuccessExample);
            }
        }
        const includeAutogeneratedErrors =
            this.context.customConfig.wireTestsFallbackToAutoGeneratedErrorExamples !== false;
        if (includeAutogeneratedErrors && !userExamples.some(isError)) {
            const seenErrorIds = new Set<string>();
            for (const autogeneratedExample of autogeneratedExamples) {
                const response = autogeneratedExample.example.response;
                if (response.type !== "error" || seenErrorIds.has(response.error.errorId)) {
                    continue;
                }
                seenErrorIds.add(response.error.errorId);
                selected.push(autogeneratedExample);
            }
        }

        // An endpoint whose auth the SDK cannot satisfy fails before sending a request, so only
        // its first example is tested.
        const isUnsatisfiable =
            this.context.isEndpointSecurity() && this.classifyEndpointAuth(endpoint).kind === "unsatisfiable";

        const baseTestName = this.getTestFunctionName(endpoint, serviceName);
        const testCases: WireTestCase[] = [];
        if (selected.length === 0) {
            // No IR examples to pair with: keep the single test for the first dynamic example.
            testCases.push({
                endpoint,
                example: undefined,
                dynamicExample: firstDynamicExample,
                testName: this.getUniqueTestName(baseTestName, "", usedTestNames),
                expectedErrorVariant: undefined
            });
            return testCases;
        }

        for (const [index, { example, dynamicExampleId }] of selected.entries()) {
            if (isUnsatisfiable && index > 0) {
                break;
            }
            // Same pairing as before multi-example support: first test example with first dynamic example.
            const dynamicExample =
                dynamicExamples.find((candidate) => candidate.id === dynamicExampleId) ??
                (index === 0 ? firstDynamicExample : undefined);
            if (dynamicExample == null) {
                this.context.logger.debug(
                    `Skipping example ${dynamicExampleId} of endpoint ${endpoint.id}: no matching dynamic example`
                );
                continue;
            }

            let expectedErrorVariant: string | undefined;
            if (example.response.type === "error") {
                expectedErrorVariant = this.getExpectedErrorVariant(example.response);
                if (expectedErrorVariant == null) {
                    this.context.logger.debug(
                        `Skipping error example ${dynamicExampleId} of endpoint ${endpoint.id}: the SDK does not parse it into its declared error`
                    );
                    continue;
                }
            }

            const suffix =
                expectedErrorVariant != null
                    ? `throws_${this.context.case.snakeSafe(expectedErrorVariant)}`
                    : testCases.length > 0 && example.name != null
                      ? this.context.case.snakeSafe(example.name)
                      : "";
            const testName = this.getUniqueTestName(baseTestName, suffix, usedTestNames);
            if (!isUnsatisfiable) {
                if (example.id != null) {
                    this.testIdsByExampleKey.set(this.getExampleKey(endpoint.id, example.id), testName);
                } else {
                    this.testIdsByExample.set(example, testName);
                }
            }
            testCases.push({
                endpoint,
                example,
                dynamicExample,
                testName,
                expectedErrorVariant
            });
        }

        return testCases;
    }

    /**
     * Mirrors `ApiError::from_response`: the error is dispatched on the IR-declared status code of
     * the example's error, and errors sharing that status code are told apart by the body's
     * discriminant (falling back to the first). Returns undefined when the parser produces a
     * different error than the example's, so the example is skipped.
     */
    private getExpectedErrorVariant(response: FernIr.ExampleEndpointErrorResponse): string | undefined {
        const errorDeclaration = this.context.ir.errors[response.error.errorId];
        if (errorDeclaration == null || errorDeclaration.statusCode < 400) {
            return undefined;
        }
        const variant = this.errorGenerator.getErrorVariantNameForResponse(
            errorDeclaration.statusCode,
            response.body?.jsonExample
        );
        if (variant !== this.context.case.pascalSafe(errorDeclaration.name.name)) {
            return undefined;
        }
        return variant;
    }

    private getExampleKey(endpointId: string, exampleId: string): string {
        return `${endpointId}:${exampleId}`;
    }

    private getUniqueTestName(baseTestName: string, suffix: string, usedTestNames: Set<string>): string {
        const sanitizedSuffix = suffix
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
        const stem = sanitizedSuffix.length > 0 ? `${baseTestName}_${sanitizedSuffix}` : baseTestName;
        let testName = `${stem}_with_wiremock`;
        let counter = 2;
        while (usedTestNames.has(testName)) {
            testName = `${stem}_${counter++}_with_wiremock`;
        }
        usedTestNames.add(testName);
        return testName;
    }

    // =============================================================================
    // FILE GENERATION
    // =============================================================================

    private async generateServiceTestFile(serviceName: string, testCases: WireTestCase[]): Promise<RustFile> {
        const testCasesWithSnippets: Array<{
            testCase: WireTestCase;
            snippet: string;
        }> = [];

        for (const testCase of testCases) {
            try {
                const snippet = await this.generateSnippetForExample(testCase.dynamicExample, testCase.endpoint.id);
                testCasesWithSnippets.push({ testCase, snippet });
            } catch (error) {
                this.context.logger.warn(
                    `Failed to generate snippet for endpoint ${testCase.endpoint.id} (${testCase.testName}): ${error}`
                );
            }
        }

        // Detect which imports are needed based on snippet content
        const allSnippets = testCasesWithSnippets.map((tc) => tc.snippet).join("\n");
        const needsBase64Import = allSnippets.includes("base64::engine::general_purpose::STANDARD");
        const needsBigIntImport = allSnippets.includes("BigInt::parse_bytes");

        const testModule = this.buildTestModule(testCasesWithSnippets, needsBase64Import, needsBigIntImport);

        return new RustFile({
            filename: `${serviceName}_test.rs`,
            directory: RelativeFilePath.of("tests"),
            fileContents: testModule.toString()
        });
    }

    // =============================================================================
    // MODULE CONSTRUCTION (AST-based)
    // =============================================================================

    private buildTestModule(
        testCases: Array<{ testCase: WireTestCase; snippet: string }>,
        needsBase64Import: boolean,
        needsBigIntImport: boolean
    ): Module {
        const rawDeclarations: string[] = [];

        // Add module declaration for centralized wire test utils
        rawDeclarations.push("mod wire_test_utils;");
        rawDeclarations.push("");

        for (const { testCase, snippet } of testCases) {
            const testFunction = this.generateEndpointTestFunction(testCase, snippet);
            if (testFunction) {
                rawDeclarations.push(testFunction);
                rawDeclarations.push("");
            }
        }

        return new Module({
            useStatements: this.generateUseStatements(needsBase64Import, needsBigIntImport),
            rawDeclarations
        });
    }

    private generateUseStatements(needsBase64Import: boolean, needsBigIntImport: boolean): UseStatement[] {
        // Note: reqwest::Client is not needed here - it's used in wire_test_utils.rs
        const statements: UseStatement[] = [
            new UseStatement({ path: `${this.context.getCrateName()}::prelude::*`, isPublic: false })
        ];

        // Only add base64 import if the test file actually uses base64 decoding
        if (needsBase64Import) {
            statements.push(new UseStatement({ path: "base64::Engine", isPublic: false }));
        }

        // Only add BigInt import if the test file actually uses BigInt parsing
        if (needsBigIntImport) {
            statements.push(new UseStatement({ path: "num_bigint::BigInt", isPublic: false }));
        }

        return statements;
    }

    // =============================================================================
    // TEST FUNCTION GENERATION (Structured Approach)
    // =============================================================================

    private generateEndpointTestFunction(testCase: WireTestCase, snippet: string): string | null {
        const { endpoint, testName } = testCase;
        try {
            const clientSetup = this.parseClientConstructor(snippet);
            const clientCall = this.parseClientCallFromSnippet(snippet);

            const wiremockMapping = this.getWireMockMapping(testCase);
            const basePath = this.buildBasePath(endpoint, wiremockMapping, testCase.dynamicExample);
            const queryParamsMap = this.buildQueryParamsMap(testCase.dynamicExample);

            // In endpoint-security mode each endpoint routes only its declared scheme(s).
            // Classify the endpoint so we can assert on the exact set of auth headers sent
            // (and handle endpoints the Rust SDK cannot satisfy, e.g. inferred-auth-only).
            const isEndpointSecurity = this.context.isEndpointSecurity();
            const authAssertion = isEndpointSecurity ? this.classifyEndpointAuth(endpoint) : undefined;

            // Build test function using structured approach
            const lines: string[] = [];

            // Function attribute and signature
            lines.push(`#[tokio::test]`);
            lines.push(`#[allow(unused_variables, unreachable_code)]`);
            lines.push(`async fn ${testName}() {`);

            // Test body - use centralized wire_test_utils module
            lines.push(`    wire_test_utils::reset_wiremock_requests().await.unwrap();`);
            lines.push(`    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();`);
            lines.push(``);

            // Client setup (parsed from snippet). In endpoint-security mode we replace the
            // snippet's single credential with credentials for every configured scheme so
            // that per-endpoint routing (not credential availability) determines which auth
            // header is sent.
            if (clientSetup) {
                const setupLines = this.processClientSetupLines(clientSetup, testName, isEndpointSecurity);
                lines.push(...setupLines);
                lines.push(``);
            }

            // Client method call (parsed from snippet)
            if (clientCall) {
                const callLines = this.processClientCallLines(clientCall);
                lines.push(...callLines);
                lines.push(``);
            }

            if (authAssertion != null && authAssertion.kind === "unsatisfiable") {
                // The Rust SDK has no inferred-auth mechanism: resolve_endpoint_auth_headers
                // (core/http_client.rs) cannot satisfy an InferredAuth requirement, so the call
                // fails with a missing-credentials error before any HTTP request is made. Assert
                // that honestly rather than faking a passing request.
                lines.push(
                    `    // The Rust SDK does not implement inferred auth, so this endpoint's security`
                );
                lines.push(
                    `    // requirement cannot be satisfied and the call errors before any request is sent.`
                );
                lines.push(
                    `    assert!(result.is_err(), "endpoint requires inferred auth, which the Rust SDK does not support");`
                );
                lines.push(``);
                lines.push(
                    `    wire_test_utils::verify_request_count("${endpoint.method}", "${basePath}", ${queryParamsMap}, 0).await.unwrap();`
                );
            } else {
                // Assertion
                if (testCase.expectedErrorVariant != null) {
                    lines.push(...this.buildErrorAssertionLines(testCase.expectedErrorVariant, wiremockMapping));
                } else {
                    lines.push(`    assert!(result.is_ok(), "Client method call should succeed");`);
                }
                lines.push(``);

                // Verify request count using centralized wire_test_utils module
                lines.push(
                    `    wire_test_utils::verify_request_count("${endpoint.method}", "${basePath}", ${queryParamsMap}, 1).await.unwrap();`
                );

                // In endpoint-security mode, assert exactly which auth headers were routed:
                // the declared scheme's header(s) present, every other scheme's header absent.
                if (authAssertion != null) {
                    lines.push(``);
                    lines.push(
                        `    wire_test_utils::verify_auth_headers("${endpoint.method}", "${basePath}", ${authAssertion.matchers}).await.unwrap();`
                    );
                }
            }

            lines.push(`}`);

            return lines.join("\n");
        } catch (error) {
            this.context.logger.warn(`Failed to generate test function for endpoint ${endpoint.id}: ${error}`);
            return null;
        }
    }

    /**
     * Asserts the call fails with the `ApiError` variant `from_response` builds for the mocked
     * error response, including the `message` it parses from the served body.
     */
    private buildErrorAssertionLines(variant: string, wiremockMapping: WireMockMapping): string[] {
        const expectedMessage = this.getExpectedErrorMessage(wiremockMapping.response.body);
        const lines: string[] = [];
        lines.push(`    assert!(result.is_err(), "Client method call should fail with ApiError::${variant}");`);
        lines.push(`    match result {`);
        if (expectedMessage != null) {
            lines.push(`        Err(ApiError::${variant} { message, .. }) => {`);
            lines.push(`            assert_eq!(message, ${this.toRustStringLiteral(expectedMessage)});`);
            lines.push(`        }`);
        } else {
            lines.push(`        Err(ApiError::${variant} { .. }) => {}`);
        }
        lines.push(`        Err(other) => panic!("Expected ApiError::${variant}, got {:?}", other),`);
        lines.push(`        Ok(_) => panic!("Expected ApiError::${variant}, got a successful response"),`);
        lines.push(`    }`);
        return lines;
    }

    /**
     * Mirrors how `from_response` fills `message`: the body's string `message` property when the
     * body is JSON ("Unknown error" when absent), otherwise the raw body.
     */
    private getExpectedErrorMessage(body: string | undefined): string | undefined {
        if (body == null) {
            return undefined;
        }
        let parsed: unknown;
        try {
            parsed = JSON.parse(body);
        } catch {
            return body;
        }
        if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
            const message = (parsed as Record<string, unknown>).message;
            if (typeof message === "string") {
                return message;
            }
        }
        return "Unknown error";
    }

    private toRustStringLiteral(value: string): string {
        return JSON.stringify(value).replace(/\\u([0-9a-fA-F]{4})/g, "\\u{$1}");
    }

    // =============================================================================
    // ENDPOINT-SECURITY AUTH ASSERTIONS
    // =============================================================================

    /**
     * Classifies an endpoint's auth for endpoint-security wire testing:
     * - `no-auth`: endpoint declares no security → assert every auth header is absent.
     * - `routed`: endpoint routes to its first satisfiable requirement → assert that
     *   requirement's header(s) present and all other schemes' headers absent.
     * - `unsatisfiable`: every requirement group needs an inferred-auth scheme, which the
     *   Rust SDK cannot provide → the call errors and no request is made.
     */
    private classifyEndpointAuth(
        endpoint: FernIr.HttpEndpoint
    ): { kind: "no-auth" | "routed"; matchers: string } | { kind: "unsatisfiable" } {
        const requirements = this.getEndpointSecurityRequirements(endpoint);
        if (requirements == null || requirements.length === 0) {
            return { kind: "no-auth", matchers: this.buildAuthHeaderMatchers([]) };
        }
        const { inferredSchemeKeys } = this.context.getEndpointAuthRoutingSchemes();
        const inferredSet = new Set(inferredSchemeKeys);
        // The SDK applies the first requirement group whose schemes are all satisfiable.
        // The test client supplies credentials for every non-inferred scheme, so a group is
        // satisfiable iff none of its schemes are inferred-auth schemes.
        const firstSatisfiable = requirements.find((group) => group.every((key) => !inferredSet.has(key)));
        if (firstSatisfiable == null) {
            return { kind: "unsatisfiable" };
        }
        return { kind: "routed", matchers: this.buildAuthHeaderMatchers(firstSatisfiable) };
    }

    /**
     * Returns the endpoint's auth requirements as an OR-list of AND-groups of auth scheme
     * keys, or undefined when the endpoint declares no security (→ no auth headers).
     */
    private getEndpointSecurityRequirements(endpoint: FernIr.HttpEndpoint): string[][] | undefined {
        if (endpoint.security == null) {
            return undefined;
        }
        return endpoint.security.map((requirement) => Object.keys(requirement));
    }

    /**
     * Builds a Rust `HashMap<String, Value>` literal of WireMock header matchers for the
     * given set of routed scheme keys: each header contributed by those schemes is asserted
     * present (pinned to the scheme's value prefix when unambiguous, e.g. `Bearer .*`), and
     * every other auth header configured on the API is asserted absent.
     */
    private buildAuthHeaderMatchers(presentSchemeKeys: string[]): string {
        const { tokenSchemeKeys, apiKeySchemes, basicSchemeKeys } = this.context.getEndpointAuthRoutingSchemes();

        // Map each scheme key to the wire header it produces and its value prefix (if any).
        const schemeInfoByKey = new Map<string, { headerName: string; prefix: string | undefined }>();
        for (const key of tokenSchemeKeys) {
            schemeInfoByKey.set(key, { headerName: "Authorization", prefix: "Bearer " });
        }
        for (const scheme of apiKeySchemes) {
            schemeInfoByKey.set(scheme.key, {
                headerName: scheme.headerName,
                prefix: scheme.prefix != null ? `${scheme.prefix} ` : undefined
            });
        }
        for (const key of basicSchemeKeys) {
            schemeInfoByKey.set(key, { headerName: "Authorization", prefix: "Basic " });
        }

        // Every auth header name configured across the API.
        const allHeaderNames = new Set<string>();
        for (const info of schemeInfoByKey.values()) {
            allHeaderNames.add(info.headerName);
        }

        // The distinct value prefixes contributing to each present header name.
        const presentPrefixesByHeader = new Map<string, Set<string | undefined>>();
        for (const key of presentSchemeKeys) {
            const info = schemeInfoByKey.get(key);
            if (info == null) {
                continue;
            }
            const prefixes = presentPrefixesByHeader.get(info.headerName) ?? new Set<string | undefined>();
            prefixes.add(info.prefix);
            presentPrefixesByHeader.set(info.headerName, prefixes);
        }

        const entries: string[] = [];
        for (const headerName of Array.from(allHeaderNames).sort()) {
            const prefixes = presentPrefixesByHeader.get(headerName);
            if (prefixes == null) {
                // Not routed for this endpoint: assert absent.
                entries.push(`("${headerName}".to_string(), json!({"absent": true}))`);
                continue;
            }
            // Routed: assert present, pinned to the value prefix when unambiguous.
            const onlyPrefix = prefixes.size === 1 ? Array.from(prefixes)[0] : undefined;
            const matcher =
                onlyPrefix != null && /^[A-Za-z0-9 ]+$/.test(onlyPrefix)
                    ? `json!({"matches": "${onlyPrefix}.*"})`
                    : `json!({"matches": ".*"})`;
            entries.push(`("${headerName}".to_string(), ${matcher})`);
        }

        return `HashMap::from([${entries.join(", ")}])`;
    }

    // =============================================================================
    // SNIPPET PROCESSING (String Parsing with Improvements)
    // =============================================================================

    /**
     * Processes client setup lines from snippet, handling config mutation and base_url override.
     *
     * This method:
     * 1. Makes the config mutable (for base_url override)
     * 2. Skips the original base_url field
     * 3. Adds base_url override after struct creation
     */
    private processClientSetupLines(clientSetup: string, testId: string, isEndpointSecurity = false): string[] {
        const lines: string[] = [];
        const setupLines = clientSetup.split("\n");
        let inConfigStruct = false;

        // In endpoint-security mode the credential fields written into the config struct are
        // replaced with credentials for every configured scheme (see buildEndpointSecurityCredentialFields).
        const endpointSecurityCredentialFields = isEndpointSecurity
            ? this.buildEndpointSecurityCredentialFields()
            : [];
        // Config credential field keys we drop from the snippet in endpoint-security mode so
        // they don't collide with the full credential set we inject.
        const credentialFieldKeys = ["token", "api_key", "username", "password", "client_id", "client_secret"];

        for (const line of setupLines) {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                continue;
            }

            // Make config mutable and handle struct initialization
            if (trimmedLine.includes("let config") && trimmedLine.includes("ClientConfig {")) {
                lines.push(`    let mut config = ClientConfig {`);
                inConfigStruct = true;
            } else if (trimmedLine.includes("let config") && !trimmedLine.includes("{")) {
                lines.push(`    let mut ${trimmedLine.replace("let ", "")}`);
            } else if (trimmedLine === "};") {
                if (inConfigStruct) {
                    // Inject credentials for every scheme so per-endpoint routing decides the header.
                    for (const field of endpointSecurityCredentialFields) {
                        lines.push(`        ${field}`);
                    }
                    lines.push(`        ..Default::default()`);
                    lines.push(`    };`);
                    // Override base_url and clear environment so requests go to WireMock
                    lines.push(`    config.base_url = wiremock_base_url.to_string();`);
                    if (this.context.hasMultipleBaseUrls()) {
                        lines.push(`    config.environment = None;`);
                    }
                    // Error examples (e.g. 429/5xx) must not be retried
                    lines.push(`    config.max_retries = 0;`);
                    // Selects the WireMock mapping serving this test's example
                    lines.push(
                        `    config.custom_headers.insert("X-Test-Id".to_string(), ${this.toRustStringLiteral(testId)}.to_string());`
                    );
                    inConfigStruct = false;
                } else {
                    lines.push(`    ${trimmedLine}`);
                }
            } else if (trimmedLine.includes("..Default::default()")) {
                // Skip - we'll add this before the closing brace
            } else if (trimmedLine.includes("base_url:")) {
                // Skip the base_url line in the struct - we'll set it after
            } else if (
                isEndpointSecurity &&
                inConfigStruct &&
                credentialFieldKeys.some((key) => trimmedLine.startsWith(`${key}:`))
            ) {
                // Skip the snippet's single credential — we inject the full set above.
            } else if (trimmedLine.includes("let client")) {
                lines.push(`    ${trimmedLine}`);
            } else if (inConfigStruct) {
                // Config field - add with proper indentation
                lines.push(`        ${trimmedLine}`);
            } else {
                lines.push(`    ${trimmedLine}`);
            }
        }

        return lines;
    }

    /**
     * Builds the ClientConfig credential field lines to inject in endpoint-security mode —
     * one credential per configured scheme kind so that per-endpoint routing (not credential
     * availability) determines which auth header is sent. Basic auth needs both username and
     * password; token schemes (bearer/oauth) share a single token; header schemes use api_key.
     *
     * OAuth client-id/secret are intentionally NOT set: doing so would make the SDK fetch a
     * token from the mocked /token endpoint, adding an extra request. Supplying `token`
     * directly satisfies both bearer and oauth routing without that round-trip.
     */
    private buildEndpointSecurityCredentialFields(): string[] {
        const { tokenSchemeKeys, apiKeySchemes, basicSchemeKeys } = this.context.getEndpointAuthRoutingSchemes();
        const fields: string[] = [];
        if (tokenSchemeKeys.length > 0) {
            fields.push(`token: Some("test-token".to_string()),`);
        }
        if (apiKeySchemes.length > 0) {
            fields.push(`api_key: Some("test-api-key".to_string()),`);
        }
        if (basicSchemeKeys.length > 0) {
            fields.push(`username: Some("test-username".to_string()),`);
            fields.push(`password: Some("test-password".to_string()),`);
        }
        return fields;
    }

    /**
     * Processes client call lines from snippet, handling single and multi-line calls.
     *
     * Key improvements:
     * - Properly handles single-line calls (adds semicolon)
     * - Handles multi-line calls (proper indentation)
     * - Ensures .await gets semicolon
     */
    private processClientCallLines(clientCall: string): string[] {
        const lines: string[] = [];
        const callLines = clientCall.split("\n");

        // Handle single-line case (when callLines.length === 1)
        if (callLines.length === 1) {
            const singleLine = callLines[0]?.trim();
            if (singleLine) {
                // Add semicolon if line ends with .await
                if (singleLine.endsWith(".await")) {
                    lines.push(`    let result = ${singleLine};`);
                } else {
                    lines.push(`    let result = ${singleLine}`);
                }
            }
        } else {
            // Handle multi-line case
            lines.push(`    let result = ${callLines[0]?.trim()}`);
            for (let i = 1; i < callLines.length; i++) {
                const line = callLines[i]?.trim();
                if (line) {
                    // Add semicolon to the last line if it ends with .await
                    if (i === callLines.length - 1 && line.endsWith(".await")) {
                        lines.push(`        ${line};`);
                    } else {
                        lines.push(`        ${line}`);
                    }
                }
            }
        }

        return lines;
    }

    /**
     * Parses client constructor from FernIr.dynamic snippet.
     *
     * Extracts the config and client instantiation code.
     */
    private parseClientConstructor(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line with client construction (looking for "let config" or "Client::new")
        let constructorStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            if (trimmedLine.includes("let config") || trimmedLine.includes("::new(")) {
                constructorStartIndex = i;
                break;
            }
        }

        if (constructorStartIndex === -1) {
            return "";
        }

        // Collect lines until we find the client variable
        const constructorLines: string[] = [];
        for (let i = constructorStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";
            constructorLines.push(line);

            // Stop after we see the client creation
            if (line.trim().includes("let client")) {
                break;
            }
        }

        return constructorLines.join("\n");
    }

    /**
     * Parses client method call from FernIr.dynamic snippet.
     *
     * Extracts the complete method call chain including .await.
     */
    private parseClientCallFromSnippet(snippet: string): string {
        const lines = snippet.split("\n");

        // Find the line that starts with client (may be just "client" or "client.")
        let clientCallStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i]?.trim() ?? "";
            // Look for lines that start with "client" (either "client" or "client.")
            if (trimmedLine === "client" || trimmedLine.startsWith("client.")) {
                clientCallStartIndex = i;
                break;
            }
        }

        if (clientCallStartIndex === -1) {
            return "";
        }

        // Collect lines until we find .await (include the line with .await)
        const clientCallLines: string[] = [];
        for (let i = clientCallStartIndex; i < lines.length; i++) {
            const line = lines[i] ?? "";
            clientCallLines.push(line.trim());

            // Stop after we find .await
            if (line.includes(".await")) {
                break;
            }
        }

        // Remove trailing semicolon if present
        const joined = clientCallLines.join("\n").trim();
        return joined.replace(/;$/, "");
    }

    // =============================================================================
    // PATH AND QUERY PARAMETER HANDLING
    // =============================================================================

    /**
     * Builds the base path for endpoint, substituting path parameters with actual values.
     *
     * Strategy:
     * 1. Try wiremock mapping pathParameters first (preferred)
     * 2. Fall back to FernIr.dynamic endpoint example pathParameters
     */
    private buildBasePath(
        endpoint: FernIr.HttpEndpoint,
        wiremockMapping: WireMockMapping,
        dynamicExample: FernIr.dynamic.EndpointExample
    ): string {
        let basePath = this.getEndpointPathTemplate(endpoint);

        // Try to get path parameters from wiremock mapping first
        if (wiremockMapping.request.pathParameters && Object.keys(wiremockMapping.request.pathParameters).length > 0) {
            Object.entries(wiremockMapping.request.pathParameters).forEach(([paramName, paramValue]) => {
                const pathParam = paramValue as { equalTo: string };
                basePath = basePath.replace(`{${paramName}}`, pathParam.equalTo);
            });
        } else if (dynamicExample.pathParameters) {
            // Fallback: Get path parameters from FernIr.dynamic endpoint example
            Object.entries(dynamicExample.pathParameters).forEach(([paramName, paramValue]) => {
                if (paramValue != null) {
                    basePath = basePath.replace(`{${paramName}}`, String(paramValue));
                }
            });
        }

        return basePath;
    }

    private getEndpointPathTemplate(endpoint: FernIr.HttpEndpoint): string {
        const basePath =
            endpoint.fullPath.head +
            endpoint.fullPath.parts.map((part) => `{${part.pathParameter}}${part.tail}`).join("");
        return basePath.startsWith("/") ? basePath : `/${basePath}`;
    }

    /**
     * The mapping serving this test's response: its per-example mapping, or else the endpoint's
     * default mapping.
     */
    private getWireMockMapping(testCase: WireTestCase): WireMockMapping {
        const perExampleMapping = this.wireMockMappingsByTestId[testCase.testName];
        if (perExampleMapping != null) {
            return perExampleMapping;
        }
        const mappingKey = this.wiremockMappingKey({
            requestMethod: testCase.endpoint.method,
            requestUrlPathTemplate: this.getEndpointPathTemplate(testCase.endpoint)
        });
        const wiremockMapping = this.wireMockConfigContent[mappingKey];
        if (!wiremockMapping) {
            throw GeneratorError.internalError(
                `No wiremock mapping found for endpoint ${testCase.endpoint.id} and mappingKey "${mappingKey}"`
            );
        }
        return wiremockMapping;
    }

    /**
     * Builds query parameters map for verify_request_count.
     *
     * Returns "None" if no query params, otherwise Some(HashMap::from([...]))
     */
    private buildQueryParamsMap(dynamicEndpointExample: FernIr.dynamic.EndpointExample): string {
        if (!dynamicEndpointExample.queryParameters) {
            return "None";
        }

        const queryParamEntries: string[] = [];
        for (const [paramName, paramValue] of Object.entries(dynamicEndpointExample.queryParameters)) {
            if (paramValue != null) {
                const key = JSON.stringify(paramName);
                if (Array.isArray(paramValue) && paramValue.length > 1) {
                    const items = paramValue.map((v: unknown) => JSON.stringify(String(v)));
                    queryParamEntries.push(`(${key}.to_string(), json!([${items.join(", ")}]))`);
                } else {
                    const value = JSON.stringify(String(paramValue));
                    queryParamEntries.push(`(${key}.to_string(), json!(${value}))`);
                }
            }
        }

        if (queryParamEntries.length === 0) {
            return "None";
        }

        return `Some(HashMap::from([${queryParamEntries.join(", ")}]))`;
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    private getTestFunctionName(endpoint: FernIr.HttpEndpoint, serviceName: string): string {
        const endpointName = this.context.case.snakeSafe(endpoint.name);
        // Normalize service name to avoid double underscores (e.g., endpoints_union_ -> endpoints_union)
        const normalizedServiceName = serviceName.replace(/_+$/, "");
        return `test_${normalizedServiceName}_${endpointName}`;
    }

    private async generateSnippetForExample(
        example: FernIr.dynamic.EndpointExample,
        endpointId: string
    ): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        // Disambiguate by endpointId only in endpoint-security mode. There every endpoint
        // shares the same HTTP method+path (e.g. `GET /users`) but declares a different auth
        // scheme; without the id, location-based resolution collapses them all onto the first
        // endpoint. Restricting this to endpoint-security keeps every other fixture's generated
        // wire tests byte-for-byte unchanged.
        const response = await this.dynamicSnippetsGenerator.generate(snippetRequest, {
            endpointId: this.context.isEndpointSecurity() ? endpointId : undefined
        });
        if (!response.snippet) {
            throw GeneratorError.internalError("No snippet generated for example");
        }
        return response.snippet;
    }

    private getFormattedServiceName(service: FernIr.HttpService): string {
        return service.name?.fernFilepath?.allParts?.map((part) => this.context.case.snakeSafe(part)).join("_") || "root";
    }

    private wiremockMappingKey({
        requestMethod,
        requestUrlPathTemplate
    }: {
        requestMethod: string;
        requestUrlPathTemplate: string;
    }): string {
        return `${requestMethod} - ${requestUrlPathTemplate}`;
    }

    private indexWireMockMappings(): {
        mappingsByTestId: Record<string, WireMockMapping>;
        defaultMappings: Record<string, WireMockMapping>;
    } {
        const mappingsByTestId: Record<string, WireMockMapping> = {};
        const defaultMappings: Record<string, WireMockMapping> = {};
        for (const mapping of this.wireTestSetupGenerator.getWireMockConfig().mappings) {
            const testId = mapping.request.headers?.["X-Test-Id"]?.equalTo;
            if (testId != null) {
                mappingsByTestId[testId] = mapping;
                continue;
            }
            const key = this.wiremockMappingKey({
                requestMethod: mapping.request.method,
                requestUrlPathTemplate: mapping.request.urlPathTemplate
            });
            if (mapping.name.endsWith(BYTES_FALLBACK_NAME_SUFFIX) && defaultMappings[key] != null) {
                continue;
            }
            defaultMappings[key] = mapping;
        }
        return { mappingsByTestId, defaultMappings };
    }
}
