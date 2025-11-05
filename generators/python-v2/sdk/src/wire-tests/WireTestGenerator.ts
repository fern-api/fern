import { RelativeFilePath } from "@fern-api/fs-utils";
import { WireMockMapping } from "@fern-api/mock-utils";
import { python } from "@fern-api/python-ast";
import { WriteablePythonFile } from "@fern-api/python-base";
import { dynamic, HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly ir: IntermediateRepresentation;
    private readonly dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private readonly wireMockConfigContent: Record<string, WireMockMapping>;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.ir = context.ir;

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

    private generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): WriteablePythonFile {
        const testClassName = `Test${this.getCapitalizedServiceName(serviceName)}`;

        // Create the test class using simplified approach
        const testClass = python.class_({
            name: testClassName,
            docs: `Wire tests for ${serviceName} service`
        });

        // Add fixture methods using simplified code blocks
        this.addSimpleFixtures(testClass);

        // Add test methods for each endpoint
        endpoints.forEach((endpoint) => {
            const testMethod = this.generateSimpleEndpointTestMethod(endpoint, serviceName);
            testClass.add(testMethod);
        });

        // Create the Python file
        const file = python.file({
            path: ["tests", `test_${serviceName}_wire`]
        });

        // Add imports
        file.addReference(python.reference({ name: "pytest", modulePath: ["pytest"] }));
        file.addReference(python.reference({ name: "requests", modulePath: ["requests"] }));
        file.addReference(python.reference({ name: "json", modulePath: ["json"] }));

        // Add the test class to the file
        file.addStatement(testClass);

        return new WriteablePythonFile({
            contents: file,
            filename: `test_${serviceName}_wire`,
            directory: RelativeFilePath.of("tests")
        });
    }

    private addSimpleFixtures(testClass: python.Class): void {
        // Add wiremock_base_url fixture
        const baseUrlFixture = python.method({
            name: "wiremock_base_url",
            decorators: [
                python.decorator({
                    callable: python.reference({ name: "pytest.fixture" })
                })
            ],
            return_: python.Type.str()
        });
        baseUrlFixture.addStatement(python.codeBlock('return "http://localhost:8080"'));
        testClass.add(baseUrlFixture);

        // Add client fixture
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
            ]
        });
        clientFixture.addStatement(
            python.codeBlock(`# TODO: Generate actual client instantiation based on SDK
# This is a placeholder - will be updated when client construction is available
import importlib
# Dynamic client creation would go here
return None  # Placeholder`)
        );
        testClass.add(clientFixture);

        // Add utility methods
        const resetMethod = python.method({
            name: "reset_wiremock_requests"
        });
        resetMethod.addStatement(
            python.codeBlock(`wiremock_admin_url = "http://localhost:8080/__admin"
response = requests.post(f"{wiremock_admin_url}/requests/reset")
assert response.status_code == 200`)
        );
        testClass.add(resetMethod);

        const verifyMethod = python.method({
            name: "verify_request_count",
            parameters: [
                python.parameter({ name: "method", type: python.Type.str() }),
                python.parameter({ name: "url_path", type: python.Type.str() }),
                python.parameter({ name: "expected", type: python.Type.int() })
            ]
        });
        verifyMethod.addStatement(
            python.codeBlock(`wiremock_admin_url = "http://localhost:8080/__admin"
req_body = {"method": method, "urlPath": url_path}
response = requests.post(f"{wiremock_admin_url}/requests/find", json=req_body)
assert response.status_code == 200
result = response.json()
actual_count = len(result.get("requests", []))
assert actual_count == expected, f"Expected {expected} requests, got {actual_count}"`)
        );
        testClass.add(verifyMethod);
    }

    private generateSimpleEndpointTestMethod(endpoint: HttpEndpoint, serviceName: string): python.Method {
        const methodName = `test_${this.getSnakeCaseEndpointName(endpoint)}`;

        const testMethod = python.method({
            name: methodName,
            parameters: [
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
self.reset_wiremock_requests()

# TODO: Parse and generate client call from dynamic snippet
# This would be populated with actual client method calls

# TODO: Generate actual client method invocation here
# Example: response = client.${serviceName}.${endpoint.name?.originalName}(request)

# Verify request was made to correct endpoint
self.verify_request_count(
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
        return endpoint.name?.originalName ?? endpoint.id;
    }
}
