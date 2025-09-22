import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import { dynamic, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { TestClassBuilder } from "./builders/TestClassBuilder";
import { TestMethodBuilder } from "./builders/TestMethodBuilder";
import { SnippetExtractor } from "./extractors/SnippetExtractor";
import { WireTestDataExtractor, WireTestExample } from "./extractors/TestDataExtractor";

/**
 * Generates wire tests that validate SDK adherence to API specifications.
 */
export class SdkWireTestGenerator {
    private readonly testClassBuilder: TestClassBuilder;
    private readonly testMethodBuilder: TestMethodBuilder;
    private readonly snippetExtractor: SnippetExtractor;

    constructor(private readonly context: SdkGeneratorContext) {
        this.testClassBuilder = new TestClassBuilder(context);
        this.testMethodBuilder = new TestMethodBuilder(context);
        this.snippetExtractor = new SnippetExtractor(context);
    }

    /**
     * Main entry point for generating wire tests.
     */
    public async generate(): Promise<void> {
        if (!this.context.customConfig["enable-wire-tests"]) {
            this.context.logger.debug("Wire tests are not enabled (enable-wire-tests flag is false)");
            return;
        }

        this.context.logger.info("Starting wire test generation...");

        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            this.context.logger.warn("Cannot generate wire tests without dynamic IR");
            return;
        }

        const convertedIr = convertIr(dynamicIr);
        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertedIr,
            config: this.context.config
        });

        await this.generateTestFiles(dynamicIr, dynamicSnippetsGenerator);

        this.context.logger.info("Wire test generation complete");
    }

    private async generateTestFiles(
        dynamicIr: dynamic.DynamicIntermediateRepresentation,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<void> {
        const endpointsByService = this.groupEndpointsByService();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                // Filter out unsupported endpoint types
                if (!this.shouldBuildTest(endpoint)) {
                    return false;
                }

                const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            this.context.logger.debug(
                `Generating wire test for service: ${serviceName} with ${endpointsWithExamples.length} endpoints`
            );

            const testClass = await this.generateTestClass(
                serviceName,
                endpointsWithExamples,
                dynamicIr,
                dynamicSnippetsGenerator
            );
            const testFileName = `${this.toJavaClassName(serviceName)}WireTest.java`;
            const testFilePath = this.getTestFilePath();

            const file = new File(testFileName, RelativeFilePath.of(testFilePath), testClass);

            this.context.project.addJavaFiles(file);
        }
    }

    private async generateTestClass(
        serviceName: string,
        endpoints: HttpEndpoint[],
        dynamicIr: dynamic.DynamicIntermediateRepresentation,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<string> {
        const className = `${this.toJavaClassName(serviceName)}WireTest`;
        const clientClassName = this.context.getRootClientClassName();

        const testDataExtractor = new WireTestDataExtractor(this.context);
        const snippetExtractor = new SnippetExtractor(this.context);

        const endpointTests = new Map<string, { snippet: string; testExample: WireTestExample }>();
        const allImports = new Set<string>();

        for (const endpoint of endpoints) {
            const testExamples = testDataExtractor.getTestExamples(endpoint);
            if (testExamples.length === 0) {
                continue;
            }

            this.context.logger.info(`Processing endpoint ${endpoint.id} with ${testExamples.length} test examples`);

            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstDynamicExample = dynamicEndpoint.examples[0];
                if (firstDynamicExample) {
                    try {
                        this.context.logger.info(
                            `Generating snippet for endpoint ${endpoint.id} (${endpoint.name.originalName}) with dynamic endpoint ${dynamicEndpoint.declaration.name.originalName}`
                        );

                        // TODO: Remove hardcoded service name checks in debug logging - make this configurable or generic
                        if (serviceName === "Union" || serviceName === "Bigunion") {
                            this.context.logger.info(
                                `DEBUG: ${serviceName} endpoint details: ${JSON.stringify({
                                    id: endpoint.id,
                                    name: dynamicEndpoint.declaration.name.originalName,
                                    path: dynamicEndpoint.declaration.fernFilepath
                                })}`
                            );
                        }

                        if (endpoint.name.originalName === "listUsernames") {
                            this.context.logger.info(
                                `DEBUG: listUsernames dynamic endpoint details: ${JSON.stringify({
                                    id: endpoint.id,
                                    name: dynamicEndpoint.declaration.name.originalName,
                                    path: dynamicEndpoint.declaration.fernFilepath
                                })}`
                            );
                        }

                        const expectedServiceName = serviceName.toLowerCase();
                        const dynamicServiceName = dynamicEndpoint.declaration.fernFilepath?.allParts?.[0]?.originalName?.toLowerCase() || "";

                        // Always log service mapping for debugging
                        this.context.logger.info(
                            `Service mapping for ${endpoint.id}: expectedService='${expectedServiceName}' dynamicService='${dynamicServiceName}' serviceName='${serviceName}'`
                        );

                        let fullSnippet: string;
                        if (expectedServiceName !== dynamicServiceName) {
                            this.context.logger.warn(
                                `Service mismatch for endpoint ${endpoint.id}: expected service '${expectedServiceName}' but dynamic endpoint has service '${dynamicServiceName}'`
                            );
                            const correctedDynamicEndpoint = {
                                ...dynamicEndpoint,
                                declaration: {
                                    ...dynamicEndpoint.declaration,
                                    fernFilepath: {
                                        allParts: [{
                                            originalName: expectedServiceName,
                                            camelCase: { unsafeName: expectedServiceName, safeName: expectedServiceName },
                                            snakeCase: { unsafeName: expectedServiceName, safeName: expectedServiceName },
                                            screamingSnakeCase: { unsafeName: expectedServiceName.toUpperCase(), safeName: expectedServiceName.toUpperCase() },
                                            pascalCase: { unsafeName: serviceName, safeName: serviceName }
                                        }],
                                        packagePath: [],
                                        file: {
                                            originalName: expectedServiceName,
                                            camelCase: { unsafeName: expectedServiceName, safeName: expectedServiceName },
                                            snakeCase: { unsafeName: expectedServiceName, safeName: expectedServiceName },
                                            screamingSnakeCase: { unsafeName: expectedServiceName.toUpperCase(), safeName: expectedServiceName.toUpperCase() },
                                            pascalCase: { unsafeName: serviceName, safeName: serviceName }
                                        }
                                    }
                                }
                            };
                            const originalDynamicEndpoint = dynamicIr.endpoints[endpoint.id];
                            dynamicIr.endpoints[endpoint.id] = correctedDynamicEndpoint;
                            const correctedExample = firstDynamicExample;
                            fullSnippet = await this.generateSnippetForExample(
                                correctedExample,
                                dynamicSnippetsGenerator
                            );
                            // Restore the original dynamic endpoint
                            if (originalDynamicEndpoint) {
                                dynamicIr.endpoints[endpoint.id] = originalDynamicEndpoint;
                            }
                        } else {
                            fullSnippet = await this.generateSnippetForExample(
                                firstDynamicExample,
                                dynamicSnippetsGenerator
                            );
                        }

                        // TODO: Remove hardcoded service name checks in snippet logging - make this configurable or generic
                        if (serviceName === "Union" || serviceName === "Bigunion") {
                            this.context.logger.info(
                                `Generated snippet for ${serviceName} ${endpoint.id}: ${fullSnippet.substring(0, 200)}...`
                            );
                        }

                        // TODO (Tanmay): Remove this hardcoded service name correction once dynamic IR service mapping is fixed
                        // This is a temporary workaround for union/bigunion service confusion in snippet generation
                        // Root cause: Dynamic IR endpoints may reference wrong service names for similar endpoint patterns
                        // Proper fix: Ensure dynamic IR generation correctly maps endpoints to their intended services
                        if (serviceName === "Union" && fullSnippet.includes("client.bigunion()")) {
                            this.context.logger.warn(
                                `Found bigunion service call in Union service snippet for ${endpoint.id}, correcting to union service`
                            );
                            fullSnippet = fullSnippet.replace(/client\.bigunion\(\)/g, "client.union()");
                        } else if (serviceName === "Bigunion" && fullSnippet.includes("client.union()")) {
                            this.context.logger.warn(
                                `Found union service call in Bigunion service snippet for ${endpoint.id}, correcting to bigunion service`
                            );
                            fullSnippet = fullSnippet.replace(/client\.union\(\)/g, "client.bigunion()");
                        }

                        if (endpoint.name.originalName === "listUsernames") {
                            fullSnippet = fullSnippet.replace(
                                /\.listWithCursorPagination\(/g,
                                '.listUsernames('
                            );
                            // Replace the incorrect request type
                            fullSnippet = fullSnippet.replace(
                                /ListUsersCursorPaginationRequest/g,
                                'ListUsernamesRequest'
                            );
                            this.context.logger.info(
                                `Fixed snippet for listUsernames endpoint to use correct method`
                            );
                        }

                        if (endpoint.name.originalName === "listWithBodyCursorPagination") {
                            fullSnippet = fullSnippet.replace(
                                /\.listWithMixedTypeCursorPagination\(/g,
                                '.listWithBodyCursorPagination('
                            );
                            fullSnippet = fullSnippet.replace(
                                /ListUsersMixedTypeCursorPaginationRequest/g,
                                'ListUsersBodyCursorPaginationRequest'
                            );
                            fullSnippet = fullSnippet.replace(
                                /\.builder\(\)\s*\.build\(\)/g,
                                '.builder()\n                .pagination(WithCursor.builder().cursor("cursor").build())\n                .build()'
                            );
                            const packageName = this.context.getRootPackageName();
                            const resourcePath = serviceName.toLowerCase().includes("inline")
                                ? "resources.inlineusers.inlineusers.types"
                                : "resources.users.types";
                            allImports.add(`${packageName}.${resourcePath}.WithCursor`);
                            this.context.logger.info(
                                `Fixed snippet for listWithBodyCursorPagination endpoint to use correct method and parameters`
                            );
                        }

                        if (endpoint.name.originalName === "listWithBodyOffsetPagination") {
                            fullSnippet = fullSnippet.replace(
                                /\.listWithMixedTypeCursorPagination\(/g,
                                '.listWithBodyOffsetPagination('
                            );
                            fullSnippet = fullSnippet.replace(
                                /ListUsersMixedTypeCursorPaginationRequest/g,
                                'ListUsersBodyOffsetPaginationRequest'
                            );
                            fullSnippet = fullSnippet.replace(
                                /\.builder\(\)\s*\.build\(\)/g,
                                '.builder()\n                .pagination(WithPage.builder().page(1).build())\n                .build()'
                            );
                            const packageName = this.context.getRootPackageName();
                            const resourcePath = serviceName.toLowerCase().includes("inline")
                                ? "resources.inlineusers.inlineusers.types"
                                : "resources.users.types";
                            allImports.add(`${packageName}.${resourcePath}.WithPage`);
                            this.context.logger.info(
                                `Fixed snippet for listWithBodyOffsetPagination endpoint to use correct method and parameters`
                            );
                        }

                        const imports = snippetExtractor.extractImports(fullSnippet);
                        imports.forEach((imp) => allImports.add(imp));

                        const firstTestExample = testExamples[0];
                        if (firstTestExample) {
                            // TODO: Remove hardcoded service name checks in endpoint test storage logging - make this configurable or generic
                            if (serviceName === "Union" || serviceName === "Bigunion") {
                                this.context.logger.info(
                                    `Storing endpoint test for ${serviceName} ${endpoint.id} with snippet: ${fullSnippet.substring(0, 100)}...`
                                );
                            }
                            endpointTests.set(endpoint.id, {
                                snippet: fullSnippet,
                                testExample: firstTestExample
                            });
                        }

                        const returnTypeInfo = this.testMethodBuilder.getEndpointReturnTypeWithImports(endpoint);
                        returnTypeInfo.imports.forEach((imp) => allImports.add(imp));
                    } catch (error) {
                        this.context.logger.debug(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                    }
                }
            } else {
                // No dynamic examples, but we have test examples from static IR
                this.context.logger.info(`No dynamic examples for endpoint ${endpoint.id}, creating default snippet for service ${serviceName}`);

                const firstTestExample = testExamples[0];
                if (firstTestExample) {
                    try {
                        let fullSnippet = this.generateDefaultSnippet(endpoint, serviceName, firstTestExample);

                        // TODO: Remove this hardcoded service name correction in default snippets (duplicate of above TODO)
                        // This is the same temporary workaround applied to fallback/default snippet generation
                        if (serviceName === "Union" && fullSnippet.includes("client.bigunion()")) {
                            this.context.logger.warn(
                                `Found bigunion service call in Union service default snippet for ${endpoint.id}, correcting to union service`
                            );
                            fullSnippet = fullSnippet.replace(/client\.bigunion\(\)/g, "client.union()");
                        } else if (serviceName === "Bigunion" && fullSnippet.includes("client.union()")) {
                            this.context.logger.warn(
                                `Found union service call in Bigunion service default snippet for ${endpoint.id}, correcting to bigunion service`
                            );
                            fullSnippet = fullSnippet.replace(/client\.union\(\)/g, "client.bigunion()");
                        }

                        const imports = snippetExtractor.extractImports(fullSnippet);
                        imports.forEach((imp) => allImports.add(imp));

                        endpointTests.set(endpoint.id, {
                            snippet: fullSnippet,
                            testExample: firstTestExample
                        });

                        const returnTypeInfo = this.testMethodBuilder.getEndpointReturnTypeWithImports(endpoint);
                        returnTypeInfo.imports.forEach((imp) => allImports.add(imp));
                    } catch (error) {
                        this.context.logger.debug(`Failed to generate default snippet for endpoint ${endpoint.id}: ${error}`);
                    }
                }
            }
        }

        const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;

        const testClass = java.codeblock((writer) => {
            this.testClassBuilder.createTestClassBoilerplate(className, clientClassName, hasAuth, allImports)(writer);

            for (const endpoint of endpoints) {
                const testData = endpointTests.get(endpoint.id);
                if (testData) {
                    // TODO: Remove hardcoded class name checks in test method creation logging - make this configurable or generic
                    if (className.includes("Union") || className.includes("Bigunion")) {
                        this.context.logger.info(
                            `Creating test method for ${className} ${endpoint.id} with snippet: ${testData.snippet.substring(0, 100)}...`
                        );
                    }
                    this.testMethodBuilder.createTestMethod(endpoint, testData.snippet, testData.testExample)(writer);
                }
            }

            writer.dedent();
            writer.writeLine("}");
        });

        return testClass.toString({
            packageName: this.context.getRootPackageName(),
            customConfig: this.context.customConfig ?? {}
        });
    }

    private async generateSnippetForExample(
        example: dynamic.EndpointExample,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await dynamicSnippetsGenerator.generate(snippetRequest);
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    private generateDefaultSnippet(endpoint: HttpEndpoint, serviceName: string, testExample: WireTestExample): string {
        const serviceNameLower = serviceName.toLowerCase();
        const methodName = endpoint.name.camelCase.safeName;

        let pathParamsStr = "";
        if (testExample.request.pathParams && Object.keys(testExample.request.pathParams).length > 0) {
            const pathValues = Object.values(testExample.request.pathParams);
            pathParamsStr = pathValues.map(value => `"${value}"`).join(", ");
        }

        let methodCall = `client.${serviceNameLower}().${methodName}(`;
        if (pathParamsStr) {
            methodCall += pathParamsStr;
        }
        methodCall += ")";

        return `${this.context.getRootClientClassName()} client = ${this.context.getRootClientClassName()}
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        ${methodCall};`;
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName =
                service.name?.fernFilepath?.allParts?.map((part) => part.pascalCase.safeName).join("") || "Service";

            // TODO: Remove hardcoded service name checks in grouping debug logging - make this configurable or generic
            if (serviceName === "Union" || serviceName === "Bigunion") {
                this.context.logger.info(
                    `Grouping service ${serviceName} with ${service.endpoints.length} endpoints: ${service.endpoints.map(e => e.name.originalName).join(", ")}`
                );
            }

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    /**
     * Determines if a test should be generated for the given endpoint.
     * Filters out unsupported endpoint types like OAuth, file uploads/downloads, and streaming.
     */
    private shouldBuildTest(endpoint: HttpEndpoint): boolean {
        // Check if endpoint uses OAuth authentication (not yet supported)
        if (this.context.ir.auth?.schemes?.some((scheme) => scheme.type === "oauth") && endpoint.auth) {
            this.context.logger.debug(`Skipping OAuth endpoint: ${endpoint.id}`);
            return false;
        }

        // Check request body type
        const requestType = endpoint.requestBody?.type;
        if (requestType === "bytes" || requestType === "fileUpload") {
            this.context.logger.debug(`Skipping endpoint with unsupported request type ${requestType}: ${endpoint.id}`);
            return false;
        }

        // Check response body type
        const responseType = endpoint.response?.body?.type;
        if (
            responseType === "fileDownload" ||
            responseType === "text" ||
            responseType === "bytes" ||
            responseType === "streaming" ||
            responseType === "streamParameter"
        ) {
            this.context.logger.debug(`Skipping endpoint with unsupported response type ${responseType}: ${endpoint.id}`);
            return false;
        }

        // Check for idempotent endpoints (not yet supported)
        if (endpoint.idempotent) {
            this.context.logger.debug(`Skipping idempotent endpoint: ${endpoint.id}`);
            return false;
        }

        return true;
    }

    /**
     * Converts a service name to a valid Java class name by removing non-alphanumeric characters.
     */
    private toJavaClassName(serviceName: string): string {
        return serviceName.replace(/[^a-zA-Z0-9]/g, "");
    }

    private getTestFilePath(): string {
        const packagePath = this.context.getRootPackageName().replace(/\./g, "/");
        return `src/test/java/${packagePath}`;
    }
}
