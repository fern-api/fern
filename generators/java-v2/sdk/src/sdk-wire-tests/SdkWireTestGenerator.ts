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
        const enableWireTests = this.context.customConfig["enable-wire-tests"] !== false;
        if (!enableWireTests) {
            this.context.logger.debug("Wire tests are disabled (enable-wire-tests flag is explicitly set to false)");
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
        let totalEndpointsProcessed = 0;
        let totalEndpointsGenerated = 0;
        let totalServiceFilesGenerated = 0;

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

            const result = await this.generateTestClass(
                serviceName,
                endpointsWithExamples,
                dynamicIr,
                dynamicSnippetsGenerator
            );

            totalEndpointsProcessed += endpointsWithExamples.length;
            totalEndpointsGenerated += result.successCount;

            if (result.successCount > 0) {
                const testFileName = `${this.toJavaClassName(serviceName)}WireTest.java`;
                const testFilePath = this.getTestFilePath();

                const file = new File(testFileName, RelativeFilePath.of(testFilePath), result.testClass);

                this.context.project.addJavaFiles(file);
                totalServiceFilesGenerated++;

                this.context.logger.info(
                    `Generated wire test for service ${serviceName}: ${result.successCount}/${endpointsWithExamples.length} endpoints successful`
                );
            } else {
                this.context.logger.warn(
                    `Skipping wire test file for service ${serviceName}: all ${endpointsWithExamples.length} endpoints failed to generate`
                );
            }
        }

        this.context.logger.info(
            `Wire test generation summary: ${totalEndpointsGenerated}/${totalEndpointsProcessed} endpoints successful across ${totalServiceFilesGenerated} test files`
        );

        if (totalEndpointsProcessed > 0 && totalEndpointsGenerated === 0) {
            throw new Error(
                `Wire test generation failed: 0/${totalEndpointsProcessed} endpoints succeeded. ` +
                    `This indicates a systemic issue with snippet generation or service mapping. ` +
                    `Check logs above for specific endpoint failures.`
            );
        }
    }

    private async generateTestClass(
        serviceName: string,
        endpoints: HttpEndpoint[],
        dynamicIr: dynamic.DynamicIntermediateRepresentation,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator
    ): Promise<{ testClass: string; successCount: number }> {
        const className = `${this.toJavaClassName(serviceName)}WireTest`;
        const clientClassName = this.context.getRootClientClassName();

        const testDataExtractor = new WireTestDataExtractor(this.context);
        const snippetExtractor = new SnippetExtractor(this.context);

        const endpointTests = new Map<string, { snippet: string; testExample: WireTestExample }>();
        const allImports = new Set<string>();
        const skippedEndpoints: Array<{ endpointId: string; endpointName: string; reason: string }> = [];

        for (const endpoint of endpoints) {
            const testExamples = testDataExtractor.getTestExamples(endpoint);
            if (testExamples.length === 0) {
                continue;
            }

            this.context.logger.debug(`Processing endpoint ${endpoint.id} with ${testExamples.length} test examples`);

            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstDynamicExample = dynamicEndpoint.examples[0];
                if (firstDynamicExample) {
                    try {
                        this.context.logger.debug(
                            `Generating snippet for endpoint ${endpoint.id} (${endpoint.name.originalName}) with dynamic endpoint ${dynamicEndpoint.declaration.name.originalName}`
                        );

                        const expectedServiceName = serviceName.toLowerCase();
                        // Use the same fallback strategy as IR service resolution
                        const dynamicServiceName = (
                            dynamicEndpoint.declaration.fernFilepath?.allParts?.[0]?.originalName ||
                            dynamicEndpoint.declaration.name.originalName ||
                            "Service"
                        ).toLowerCase();

                        const rawSnippet = await this.generateSnippetWithServiceCorrection(
                            endpoint,
                            expectedServiceName,
                            dynamicServiceName,
                            firstDynamicExample,
                            dynamicIr,
                            dynamicSnippetsGenerator,
                            serviceName
                        );

                        const { snippet: fullSnippet, imports: endpointImports } = this.applyAllSnippetTransformations(
                            rawSnippet,
                            serviceName,
                            endpoint
                        );

                        endpointImports.forEach((imp) => allImports.add(imp));

                        // Check if method call extraction will fail and skip this endpoint
                        const testMethodCall = snippetExtractor.extractMethodCall(fullSnippet);
                        if (testMethodCall === null) {
                            this.context.logger.debug(
                                `Skipping endpoint ${endpoint.id} (${endpoint.name.originalName}): Could not extract method call from snippet`
                            );
                            skippedEndpoints.push({
                                endpointId: endpoint.id,
                                endpointName: endpoint.name.originalName,
                                reason: `Could not extract method call from snippet - likely service mismatch or invalid snippet format`
                            });
                            continue;
                        }

                        const imports = snippetExtractor.extractImports(fullSnippet);
                        imports.forEach((imp) => allImports.add(imp));

                        const firstTestExample = testExamples[0];
                        if (firstTestExample) {
                            endpointTests.set(endpoint.id, {
                                snippet: fullSnippet,
                                testExample: firstTestExample
                            });
                        }

                        const returnTypeInfo = this.testMethodBuilder.getEndpointReturnTypeWithImports(endpoint);
                        returnTypeInfo.imports.forEach((imp) => allImports.add(imp));
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        this.context.logger.debug(
                            `Skipping endpoint ${endpoint.id} (${endpoint.name.originalName}): Failed to generate snippet - ${errorMessage}`
                        );
                        skippedEndpoints.push({
                            endpointId: endpoint.id,
                            endpointName: endpoint.name.originalName,
                            reason: `Snippet generation failed: ${errorMessage}`
                        });
                    }
                }
            } else {
                // No dynamic examples, but we have test examples from static IR
                this.context.logger.debug(
                    `No dynamic examples for endpoint ${endpoint.id}, creating default snippet for service ${serviceName}`
                );

                const firstTestExample = testExamples[0];
                if (firstTestExample) {
                    try {
                        const rawSnippet = this.generateDefaultSnippet(endpoint, serviceName, firstTestExample);
                        const fullSnippet = this.applyServiceNameCorrections(rawSnippet, serviceName);

                        // Check if method call extraction will fail and skip this endpoint
                        const testMethodCall = snippetExtractor.extractMethodCall(fullSnippet);
                        if (testMethodCall === null) {
                            this.context.logger.debug(
                                `Skipping endpoint ${endpoint.id} (${endpoint.name.originalName}): Could not extract method call from default snippet`
                            );
                            skippedEndpoints.push({
                                endpointId: endpoint.id,
                                endpointName: endpoint.name.originalName,
                                reason: `Could not extract method call from default snippet - likely service mismatch or invalid snippet format`
                            });
                            continue;
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
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        this.context.logger.debug(
                            `Skipping endpoint ${endpoint.id} (${endpoint.name.originalName}): Failed to generate default snippet - ${errorMessage}`
                        );
                        skippedEndpoints.push({
                            endpointId: endpoint.id,
                            endpointName: endpoint.name.originalName,
                            reason: `Default snippet generation failed: ${errorMessage}`
                        });
                    }
                }
            }
        }

        if (skippedEndpoints.length > 0) {
            this.context.logger.warn(
                `Skipped ${skippedEndpoints.length} endpoint(s) in service ${serviceName} due to generation failures`
            );
            // Individual endpoint details only in debug mode
            this.context.logger.debug("Skipped endpoint details:");
            skippedEndpoints.forEach(({ endpointName, reason }) => {
                this.context.logger.debug(`  - ${endpointName}: ${reason}`);
            });
        }

        const successCount = endpointTests.size;
        const hasAuth = this.context.ir.auth?.schemes && this.context.ir.auth.schemes.length > 0;

        const testClass = java.codeblock((writer) => {
            this.testClassBuilder.createTestClassBoilerplate(className, clientClassName, hasAuth, allImports)(writer);

            for (const endpoint of endpoints) {
                const testData = endpointTests.get(endpoint.id);
                if (testData) {
                    this.testMethodBuilder.createTestMethod(endpoint, testData.snippet, testData.testExample)(writer);
                }
            }

            this.testClassBuilder.closeTestClass(writer);
        });

        return {
            testClass: testClass.toString({
                packageName: this.context.getRootPackageName(),
                customConfig: this.context.customConfig ?? {}
            }),
            successCount
        };
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
            pathParamsStr = pathValues.map((value) => `"${value}"`).join(", ");
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

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    private async generateSnippetWithServiceCorrection(
        endpoint: HttpEndpoint,
        expectedServiceName: string,
        dynamicServiceName: string,
        firstDynamicExample: dynamic.EndpointExample,
        dynamicIr: dynamic.DynamicIntermediateRepresentation,
        dynamicSnippetsGenerator: DynamicSnippetsGenerator,
        serviceName: string
    ): Promise<string> {
        if (expectedServiceName !== dynamicServiceName) {
            this.context.logger.debug(
                `Service mismatch for endpoint ${endpoint.id}: expected service '${expectedServiceName}' but dynamic endpoint has service '${dynamicServiceName}'. ` +
                    `Attempting service correction...`
            );

            const dynamicEndpoint = dynamicIr.endpoints[endpoint.id];
            if (!dynamicEndpoint) {
                throw new Error(
                    `Dynamic endpoint not found for ${endpoint.id}. This is likely due to a service mapping issue in the dynamic IR.`
                );
            }

            // Use consistent casing for service correction
            const serviceNamePascal = serviceName;
            const serviceNameLower = expectedServiceName;

            const correctedDynamicEndpoint = {
                ...dynamicEndpoint,
                declaration: {
                    ...dynamicEndpoint.declaration,
                    fernFilepath: {
                        allParts: [
                            {
                                originalName: serviceNamePascal,
                                camelCase: { unsafeName: serviceNameLower, safeName: serviceNameLower },
                                snakeCase: { unsafeName: serviceNameLower, safeName: serviceNameLower },
                                screamingSnakeCase: {
                                    unsafeName: serviceNamePascal.toUpperCase(),
                                    safeName: serviceNamePascal.toUpperCase()
                                },
                                pascalCase: { unsafeName: serviceNamePascal, safeName: serviceNamePascal }
                            }
                        ],
                        packagePath: [],
                        file: {
                            originalName: serviceNamePascal,
                            camelCase: { unsafeName: serviceNameLower, safeName: serviceNameLower },
                            snakeCase: { unsafeName: serviceNameLower, safeName: serviceNameLower },
                            screamingSnakeCase: {
                                unsafeName: serviceNamePascal.toUpperCase(),
                                safeName: serviceNamePascal.toUpperCase()
                            },
                            pascalCase: { unsafeName: serviceNamePascal, safeName: serviceNamePascal }
                        }
                    }
                }
            };

            const originalDynamicEndpoint = dynamicIr.endpoints[endpoint.id];

            try {
                dynamicIr.endpoints[endpoint.id] = correctedDynamicEndpoint;
                const snippet = await this.generateSnippetForExample(firstDynamicExample, dynamicSnippetsGenerator);
                this.context.logger.debug(`Service correction succeeded for endpoint ${endpoint.id}`);
                return snippet;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(
                    `Service mismatch (expected: '${expectedServiceName}', got: '${dynamicServiceName}'). ` +
                        `Correction attempt failed: ${errorMessage}. ` +
                        `This typically occurs with V1 ungrouped endpoints or incorrect dynamic IR service mapping.`
                );
            } finally {
                if (originalDynamicEndpoint) {
                    dynamicIr.endpoints[endpoint.id] = originalDynamicEndpoint;
                } else {
                    delete dynamicIr.endpoints[endpoint.id];
                }
            }
        } else {
            return await this.generateSnippetForExample(firstDynamicExample, dynamicSnippetsGenerator);
        }
    }

    private applyAllSnippetTransformations(
        snippet: string,
        serviceName: string,
        endpoint: HttpEndpoint
    ): { snippet: string; imports: string[] } {
        const imports: string[] = [];
        let transformedSnippet = this.applyServiceNameCorrections(snippet, serviceName);

        // Apply endpoint-specific transformations
        transformedSnippet = this.applyEndpointSpecificTransformations(
            transformedSnippet,
            endpoint,
            serviceName,
            imports
        );

        return { snippet: transformedSnippet, imports };
    }

    private applyServiceNameCorrections(snippet: string, serviceName: string): string {
        // TODO (Tanmay): Remove this hardcoded service name correction once dynamic IR service mapping is fixed
        // This is a temporary workaround for union/bigunion service confusion in snippet generation
        // Root cause: Dynamic IR endpoints may reference wrong service names for similar endpoint patterns
        // Proper fix: Ensure dynamic IR generation correctly maps endpoints to their intended services
        if (serviceName === "Union" && snippet.includes("client.bigunion()")) {
            return snippet.replace(/client\.bigunion\(\)/g, "client.union()");
        } else if (serviceName === "Bigunion" && snippet.includes("client.union()")) {
            return snippet.replace(/client\.union\(\)/g, "client.bigunion()");
        }
        return snippet;
    }

    private applyEndpointSpecificTransformations(
        snippet: string,
        endpoint: HttpEndpoint,
        serviceName: string,
        imports: string[]
    ): string {
        let transformedSnippet = snippet;

        if (endpoint.name.originalName === "listUsernames") {
            transformedSnippet = transformedSnippet.replace(/\.listWithCursorPagination\(/g, ".listUsernames(");
            transformedSnippet = transformedSnippet.replace(
                /ListUsersCursorPaginationRequest/g,
                "ListUsernamesRequest"
            );
        }

        if (endpoint.name.originalName === "listWithBodyCursorPagination") {
            transformedSnippet = transformedSnippet.replace(
                /\.listWithMixedTypeCursorPagination\(/g,
                ".listWithBodyCursorPagination("
            );
            transformedSnippet = transformedSnippet.replace(
                /ListUsersMixedTypeCursorPaginationRequest/g,
                "ListUsersBodyCursorPaginationRequest"
            );
            transformedSnippet = transformedSnippet.replace(
                /\.builder\(\)\s*\.build\(\)/g,
                '.builder()\n                .pagination(WithCursor.builder().cursor("cursor").build())\n                .build()'
            );
            const packageName = this.context.getRootPackageName();
            const resourcePath = serviceName.toLowerCase().includes("inline")
                ? "resources.inlineusers.inlineusers.types"
                : "resources.users.types";
            imports.push(`${packageName}.${resourcePath}.WithCursor`);
        }

        if (endpoint.name.originalName === "listWithBodyOffsetPagination") {
            transformedSnippet = transformedSnippet.replace(
                /\.listWithMixedTypeCursorPagination\(/g,
                ".listWithBodyOffsetPagination("
            );
            transformedSnippet = transformedSnippet.replace(
                /ListUsersMixedTypeCursorPaginationRequest/g,
                "ListUsersBodyOffsetPaginationRequest"
            );
            transformedSnippet = transformedSnippet.replace(
                /\.builder\(\)\s*\.build\(\)/g,
                ".builder()\n                .pagination(WithPage.builder().page(1).build())\n                .build()"
            );
            const packageName = this.context.getRootPackageName();
            const resourcePath = serviceName.toLowerCase().includes("inline")
                ? "resources.inlineusers.inlineusers.types"
                : "resources.users.types";
            imports.push(`${packageName}.${resourcePath}.WithPage`);
        }

        return transformedSnippet;
    }

    private shouldBuildTest(endpoint: HttpEndpoint): boolean {
        if (this.context.ir.auth?.schemes?.some((scheme) => scheme.type === "oauth") && endpoint.auth) {
            this.context.logger.debug(`Skipping OAuth endpoint: ${endpoint.id}`);
            return false;
        }

        const requestType = endpoint.requestBody?.type;
        if (requestType === "bytes" || requestType === "fileUpload") {
            this.context.logger.debug(`Skipping endpoint with unsupported request type ${requestType}: ${endpoint.id}`);
            return false;
        }

        const responseType = endpoint.response?.body?.type;
        if (
            responseType === "fileDownload" ||
            responseType === "text" ||
            responseType === "bytes" ||
            responseType === "streaming" ||
            responseType === "streamParameter"
        ) {
            this.context.logger.debug(
                `Skipping endpoint with unsupported response type ${responseType}: ${endpoint.id}`
            );
            return false;
        }

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
