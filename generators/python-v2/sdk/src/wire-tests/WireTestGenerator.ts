import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping, WireTestSetup } from "@fern-api/mock-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import { dynamic, HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

export class WireTestGenerator {
    // Configuration constants - can be made into constructor parameters later if needed
    private static readonly DEFAULT_OUTPUT_DIRECTORY = "tests/wire";
    private static readonly DEFAULT_TEST_CLASS_PREFIX = "Test";

    private readonly context: SdkGeneratorContext;
    private readonly ir: IntermediateRepresentation;
    private readonly dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private readonly wireMockConfigContent: Record<string, WireMockMapping>;

    // Configuration properties (can be made into constructor parameters later)
    private readonly wiremockPort: number;
    private readonly outputDirectory: string;
    private readonly testClassPrefix: string;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.ir = context.ir;

        // Initialize configuration properties with default values
        this.wiremockPort = WireTestSetup.getDefaultWiremockPort();
        this.outputDirectory = WireTestGenerator.DEFAULT_OUTPUT_DIRECTORY;
        this.testClassPrefix = WireTestGenerator.DEFAULT_TEST_CLASS_PREFIX;

        const dynamicIr = this.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.wireMockConfigContent = this.getWireMockConfigContent();
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

    private getWireMockConfigContent(): Record<string, WireMockMapping> {
        const out: Record<string, WireMockMapping> = {};
        const wiremockStubMapping = WireTestSetupGenerator.getWiremockConfigContent(this.ir);

        for (const mapping of wiremockStubMapping.mappings) {
            const key = this.wiremockMappingKey({
                requestMethod: mapping.request.method,
                requestUrlPathTemplate: mapping.request.urlPathTemplate
            });
            out[key] = mapping;
        }

        return out;
    }

    public generate(): WriteablePythonFile[] {
        const endpointsByService = this.groupEndpointsByService();
        const testFiles: WriteablePythonFile[] = [];

        // Generate shared utilities file
        const utilitiesFile = this.generateSharedUtilitiesFile();
        testFiles.push(utilitiesFile);

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = this.generateServiceTestFile(serviceName, endpointsWithExamples);

            testFiles.push(serviceTestFile);
        }

        return testFiles;
    }

    private generateSharedUtilitiesFile(): WriteablePythonFile {
        // Create the utilities file
        const file = python.file({
            path: ["tests", "wire", "utils"]
        });

        // Add imports
        file.addReference(python.reference({ name: "pytest", modulePath: ["pytest"] }));
        file.addReference(python.reference({ name: "requests", modulePath: ["requests"] }));
        file.addReference(python.reference({ name: "Any", modulePath: ["typing"] }));

        // Create wiremock_base_url fixture
        const baseUrlFixture = python.method({
            name: "wiremock_base_url",
            decorators: [
                python.decorator({
                    callable: python.reference({ name: "pytest.fixture" })
                })
            ],
            return_: python.Type.str()
        });
        baseUrlFixture.addStatement(python.codeBlock(`return "http://localhost:${this.wiremockPort}"`));

        // Create client fixture
        const clientFixture = python.method({
            name: "client",
            decorators: [
                python.decorator({
                    callable: python.reference({ name: "pytest.fixture" })
                })
            ],
            parameters: [
                python.parameter({
                    name: "wiremock_base_url",
                    type: python.Type.str()
                })
            ],
            return_: python.Type.any()
        });
        clientFixture.addStatement(
            python.codeBlock(`# TODO: Generate actual client instantiation based on SDK
# This is a placeholder - will be updated when client construction is available
import importlib
# Dynamic client creation would go here
return None  # Placeholder`)
        );

        // Create reset function
        const resetFunction = python.method({
            name: "reset_wiremock_requests"
        });
        resetFunction.addStatement(
            python.codeBlock(`wiremock_admin_url = "http://localhost:${this.wiremockPort}/__admin"
response = requests.post(f"{wiremock_admin_url}/requests/reset")
assert response.status_code == 200`)
        );

        // Create verify function
        const verifyFunction = python.method({
            name: "verify_request_count",
            parameters: [
                python.parameter({ name: "method", type: python.Type.str() }),
                python.parameter({ name: "url_path", type: python.Type.str() }),
                python.parameter({ name: "expected", type: python.Type.int() })
            ]
        });
        verifyFunction.addStatement(
            python.codeBlock(`wiremock_admin_url = "http://localhost:${this.wiremockPort}/__admin"
req_body = {"method": method, "urlPath": url_path}
response = requests.post(f"{wiremock_admin_url}/requests/find", json=req_body)
assert response.status_code == 200
result = response.json()
actual_count = len(result.get("requests", []))
assert actual_count == expected, f"Expected {expected} requests, got {actual_count}"`)
        );

        // Add all functions to the file
        file.addStatement(baseUrlFixture);
        file.addStatement(clientFixture);
        file.addStatement(resetFunction);
        file.addStatement(verifyFunction);

        return new WriteablePythonFile({
            contents: file,
            filename: "utils",
            directory: RelativeFilePath.of(this.outputDirectory)
        });
    }

    private generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): WriteablePythonFile {
        const testClassName = `${this.testClassPrefix}${this.getCapitalizedServiceName(serviceName)}`;

        // Create the test class using simplified approach
        const testClass = python.class_({
            name: testClassName,
            docs: `Wire tests for ${serviceName} service`
        });

        // Add test methods for each endpoint (fixtures come from shared utils)
        endpoints.forEach((endpoint) => {
            const testMethod = this.generateSimpleEndpointTestMethod(endpoint, serviceName);
            testClass.add(testMethod);
        });

        // Create the Python file
        const file = python.file({
            path: ["tests", "wire", `test_${serviceName}_wire`]
        });

        // Add imports (including shared utilities)
        file.addReference(python.reference({ name: "Any", modulePath: ["typing"] }));
        file.addReference(
            python.reference({
                name: "client, wiremock_base_url, reset_wiremock_requests, verify_request_count",
                modulePath: ["tests", "wire", "utils"]
            })
        );

        // Add the test class to the file
        file.addStatement(testClass);

        return new WriteablePythonFile({
            contents: file,
            filename: `test_${serviceName}_wire`,
            directory: RelativeFilePath.of(this.outputDirectory)
        });
    }

    private generateSimpleEndpointTestMethod(endpoint: HttpEndpoint, serviceName: string): python.Method {
        const methodName = `test_${this.getSnakeCaseEndpointName(endpoint)}`;

        const testMethod = python.method({
            name: methodName,
            parameters: [
                python.parameter({ name: "self", type: python.Type.any() }),
                python.parameter({
                    name: "client",
                    type: python.Type.any()
                    // TODO: Add proper type reference when available
                })
            ]
        });

        // Simple test method implementation
        testMethod.addStatement(
            python.codeBlock(`# Reset WireMock requests
reset_wiremock_requests()

# TODO: Parse and generate client call from dynamic snippet
# This would be populated with actual client method calls

# TODO: Generate actual client method invocation here
# Example: response = client.${serviceName}.${endpoint.name?.originalName}(request)

# Verify request was made to correct endpoint
verify_request_count(
    method="${endpoint.method}",
    url_path="${this.buildSimplePath(endpoint)}",
    expected=1
)`)
        );

        return testMethod;
    }

    private buildSimplePath(endpoint: HttpEndpoint): string {
        let path =
            endpoint.fullPath.head +
            endpoint.fullPath.parts.map((part) => `{${part.pathParameter}}${part.tail}`).join("");

        if (!path.startsWith("/")) {
            path = `/${path}`;
        }

        return path;
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.ir.services)) {
            const serviceName = this.getFormattedServiceName(service);
            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }

    private getFormattedServiceName(service: HttpService): string {
        return service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";
    }

    private getCapitalizedServiceName(serviceName: string): string {
        return serviceName
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");
    }

    private getSnakeCaseEndpointName(endpoint: HttpEndpoint): string {
        // Use snake_case version if available, otherwise convert originalName to snake_case
        const snakeCaseName = endpoint.name?.snakeCase?.safeName;
        if (snakeCaseName) {
            return snakeCaseName;
        }

        // Fallback: convert originalName or id to snake_case
        const originalName = endpoint.name?.originalName ?? endpoint.id;
        return this.toSnakeCase(originalName);
    }

    private toSnakeCase(str: string): string {
        return (
            str
                // Insert underscores before capital letters (but not at the start)
                .replace(/([a-z])([A-Z])/g, "$1_$2")
                // Convert to lowercase
                .toLowerCase()
                // Replace any non-alphanumeric characters with underscores
                .replace(/[^a-z0-9]/g, "_")
                // Remove duplicate underscores
                .replace(/_+/g, "_")
                // Remove leading/trailing underscores
                .replace(/^_+|_+$/g, "")
        );
    }
}
