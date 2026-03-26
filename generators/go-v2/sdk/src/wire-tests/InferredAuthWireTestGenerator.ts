import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    getClientAccessPath,
    getEndpointPath,
    getInferredAuthCredentialParams,
    getInferredAuthScheme
} from "../authUtils.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Information about the inferred auth service structure extracted from the IR.
 */
interface InferredAuthServiceInfo {
    /** The client accessor path for the auth service (e.g., "Auth") */
    authAccessPath: string;
    /** The method name for the token endpoint (e.g., "GetTokenWithClientCredentials") */
    tokenMethodName: string;
    /** The URL path for the token endpoint (e.g., "/token") */
    tokenEndpointPath: string;
    /** Credential parameters that are passed as client options */
    credentialParams: Array<{
        fieldName: string;
        isOptional: boolean;
    }>;
    /** The auth service */
    authService: FernIr.HttpService;
    /** The auth service ID */
    authServiceId: string;
}

/**
 * Information about a non-auth endpoint to use in tests.
 */
interface TestEndpointInfo {
    /** The client accessor path (e.g., "Simple" or "Nested.Api") */
    accessPath: string;
    /** The method name (e.g., "GetSomething") */
    methodName: string;
    /** Whether the endpoint has a response body */
    hasResponseBody: boolean;
    /** Whether the endpoint requires a request parameter (body, query params, or headers) */
    hasRequestParam: boolean;
    /** The request type name, set when hasRequestParam is true */
    requestTypeName?: string;
    /** The import path for the request type package, set when hasRequestParam is true */
    requestTypeImportPath?: string;
}

/**
 * Generates inferred auth wire tests that validate:
 * 1. Automatic token fetching and Authorization header injection on API requests
 * 2. Token caching across multiple API calls
 * 3. Custom headers being passed through to authenticated API requests
 *
 * The generator dynamically extracts service structure from the IR to support
 * different inferred auth configurations.
 */
export class InferredAuthWireTestGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate(): GoFile | undefined {
        const inferredScheme = this.getInferredAuthScheme();
        if (inferredScheme == null) {
            return undefined;
        }

        const serviceInfo = this.extractInferredAuthServiceInfo(inferredScheme);
        if (serviceInfo == null) {
            return undefined;
        }

        const testEndpoint = this.findTestEndpoint(serviceInfo.authServiceId);
        if (testEndpoint == null) {
            return undefined;
        }

        const testFileContent = this.generateTestFile(serviceInfo, testEndpoint);

        const fileLocation = this.context.getClientFileLocation({
            fernFilepath: serviceInfo.authService.name.fernFilepath,
            subpackage: undefined
        });

        const testDirectory =
            fileLocation.directory.length > 0
                ? `${fileLocation.directory}/inferred_auth_wire_test`
                : "inferred_auth_wire_test";

        return new GoFile({
            node: testFileContent,
            directory: RelativeFilePath.of(testDirectory),
            filename: "inferred_auth_wire_test.go",
            packageName: "inferred_auth_wire_test",
            rootImportPath: this.context.getRootImportPath(),
            importPath: "",
            customConfig: this.context.customConfig ?? {},
            formatter: undefined
        });
    }

    private extractInferredAuthServiceInfo(
        inferredScheme: FernIr.InferredAuthScheme
    ): InferredAuthServiceInfo | undefined {
        const { endpointId, serviceId } = inferredScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            return undefined;
        }

        const endpoint = service.endpoints.find((e) => e.id === endpointId);
        if (endpoint == null) {
            return undefined;
        }

        const authAccessPath = getClientAccessPath(service);
        const tokenMethodName = this.context.getMethodName(endpoint.name);
        const tokenEndpointPath = getEndpointPath(endpoint);
        const credentialParams = this.getCredentialParameters(endpoint);

        return {
            authAccessPath,
            tokenMethodName,
            tokenEndpointPath,
            credentialParams,
            authService: service,
            authServiceId: serviceId
        };
    }

    /**
     * Finds a non-auth endpoint to use for testing. Prefers endpoints with no request parameter.
     */
    private findTestEndpoint(authServiceId: string): TestEndpointInfo | undefined {
        // First pass: find an endpoint with no request parameter at all (simplest to call)
        for (const [serviceId, service] of Object.entries(this.context.ir.services)) {
            if (serviceId === authServiceId) {
                continue;
            }
            for (const endpoint of service.endpoints) {
                if (endpoint.sdkRequest == null && endpoint.pathParameters.length === 0) {
                    return {
                        accessPath: getClientAccessPath(service),
                        methodName: this.context.getMethodName(endpoint.name),
                        hasResponseBody: endpoint.response?.body != null,
                        hasRequestParam: false
                    };
                }
            }
        }

        // Second pass: any non-auth endpoint without path parameters
        for (const [serviceId, service] of Object.entries(this.context.ir.services)) {
            if (serviceId === authServiceId) {
                continue;
            }
            for (const endpoint of service.endpoints) {
                if (endpoint.pathParameters.length === 0) {
                    const requestTypeInfo = this.getRequestTypeInfo(serviceId, endpoint);
                    return {
                        accessPath: getClientAccessPath(service),
                        methodName: this.context.getMethodName(endpoint.name),
                        hasResponseBody: endpoint.response?.body != null,
                        hasRequestParam: endpoint.sdkRequest != null,
                        ...requestTypeInfo
                    };
                }
            }
        }

        return undefined;
    }

    /**
     * Gets the request type name and import path for an endpoint that requires a request parameter.
     */
    private getRequestTypeInfo(
        serviceId: string,
        endpoint: FernIr.HttpEndpoint
    ): { requestTypeName?: string; requestTypeImportPath?: string } {
        if (endpoint.sdkRequest == null) {
            return {};
        }
        const requestName =
            endpoint.sdkRequest.shape.type === "wrapper"
                ? endpoint.sdkRequest.shape.wrapperName
                : endpoint.sdkRequest.requestParameterName;
        if (requestName == null) {
            return {};
        }
        const typeRef = this.context.getRequestWrapperTypeReference(serviceId, requestName);
        return {
            requestTypeName: typeRef.name,
            requestTypeImportPath: typeRef.importPath ?? this.context.getRootImportPath()
        };
    }

    /**
     * Gets credential parameters from the token endpoint (non-literal body/header params).
     */
    private getCredentialParameters(endpoint: FernIr.HttpEndpoint): Array<{ fieldName: string; isOptional: boolean }> {
        return getInferredAuthCredentialParams(endpoint, this.context.ir.types, this.context);
    }

    private generateTestFile(serviceInfo: InferredAuthServiceInfo, testEndpoint: TestEndpointInfo): go.CodeBlock {
        const rootImportPath = this.context.getRootImportPath();

        return go.codeblock((writer) => {
            writer.addImport("context");
            writer.addImport("io");
            writer.addImport("net/http");
            writer.addImport("strings");
            writer.addImport("sync");
            writer.addImport("testing");
            writer.addImport("github.com/stretchr/testify/assert");
            writer.addImport("github.com/stretchr/testify/require");
            writer.addImport(`${rootImportPath}/client`);
            writer.addImport(`${rootImportPath}/option`);
            if (testEndpoint.hasRequestParam && testEndpoint.requestTypeImportPath != null) {
                writer.addImport(testEndpoint.requestTypeImportPath);
            }

            writer.newLine();

            this.writeRequestTrackingTransport(writer, serviceInfo);
            writer.newLine();
            writer.newLine();

            this.writeTokenAutoFetchTest(writer, serviceInfo, testEndpoint);
            writer.newLine();
            writer.newLine();

            this.writeTokenCachingTest(writer, serviceInfo, testEndpoint);
            writer.newLine();
            writer.newLine();

            this.writeCustomHeadersTest(writer, serviceInfo, testEndpoint);
        });
    }

    /**
     * Writes a request-tracking transport that captures all HTTP requests and returns
     * appropriate mock responses based on the URL path.
     */
    private writeRequestTrackingTransport(writer: go.Writer, serviceInfo: InferredAuthServiceInfo): void {
        writer.writeLine("// capturedRequest stores information about an intercepted HTTP request.");
        writer.writeLine("type capturedRequest struct {");
        writer.writeLine("\turl     string");
        writer.writeLine("\tmethod  string");
        writer.writeLine("\theaders http.Header");
        writer.writeLine("\tbody    []byte");
        writer.writeLine("}");
        writer.newLine();
        writer.writeLine("// requestTrackingTransport captures all HTTP requests for inspection in tests.");
        writer.writeLine("// It returns mock responses: a token response for the token endpoint, and an");
        writer.writeLine("// empty 200 OK for all other requests.");
        writer.writeLine("type requestTrackingTransport struct {");
        writer.writeLine("\tmu       sync.Mutex");
        writer.writeLine("\trequests []capturedRequest");
        writer.writeLine("}");
        writer.newLine();
        writer.writeLine("func (t *requestTrackingTransport) RoundTrip(req *http.Request) (*http.Response, error) {");
        writer.writeLine("\tcaptured := capturedRequest{");
        writer.writeLine("\t\turl:     req.URL.String(),");
        writer.writeLine("\t\tmethod:  req.Method,");
        writer.writeLine("\t\theaders: req.Header.Clone(),");
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine("\tif req.Body != nil {");
        writer.writeLine("\t\tbody, err := io.ReadAll(req.Body)");
        writer.writeLine("\t\tif err != nil {");
        writer.writeLine("\t\t\treturn nil, err");
        writer.writeLine("\t\t}");
        writer.writeLine("\t\tcaptured.body = body");
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine("\tt.mu.Lock()");
        writer.writeLine("\tt.requests = append(t.requests, captured)");
        writer.writeLine("\tt.mu.Unlock()");
        writer.newLine();
        // Route response based on whether this is the token endpoint
        writer.writeLine(`\tif strings.HasSuffix(req.URL.Path, ${JSON.stringify(serviceInfo.tokenEndpointPath)}) {`);
        writer.writeLine("\t\tresponseBody := `{");
        writer.writeLine('\t\t\t"access_token": "test_access_token",');
        writer.writeLine('\t\t\t"expires_in": 3600');
        writer.writeLine("\t\t}`");
        writer.writeLine("\t\treturn &http.Response{");
        writer.writeLine("\t\t\tStatusCode: 200,");
        writer.writeLine("\t\t\tBody:       io.NopCloser(strings.NewReader(responseBody)),");
        writer.writeLine("\t\t\tHeader: http.Header{");
        writer.writeLine('\t\t\t\t"Content-Type": []string{"application/json"},');
        writer.writeLine("\t\t\t},");
        writer.writeLine("\t\t}, nil");
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine("\t// Default response for non-token endpoints");
        writer.writeLine("\treturn &http.Response{");
        writer.writeLine("\t\tStatusCode: 200,");
        writer.writeLine("\t\tBody:       io.NopCloser(strings.NewReader(`{}`)),");
        writer.writeLine("\t\tHeader: http.Header{");
        writer.writeLine('\t\t\t"Content-Type": []string{"application/json"},');
        writer.writeLine("\t\t},");
        writer.writeLine("\t}, nil");
        writer.writeLine("}");
    }

    /**
     * Writes a test that verifies the inferred auth mechanism automatically fetches a token
     * and injects the Authorization: Bearer header on API requests.
     */
    private writeTokenAutoFetchTest(
        writer: go.Writer,
        serviceInfo: InferredAuthServiceInfo,
        testEndpoint: TestEndpointInfo
    ): void {
        writer.writeLine("// TestInferredAuthTokenAutoFetch verifies that calling a non-auth endpoint automatically");
        writer.writeLine("// triggers a token fetch and injects the Authorization: Bearer header on the API request.");
        writer.writeLine("func TestInferredAuthTokenAutoFetch(t *testing.T) {");
        writer.writeLine("\ttransport := &requestTrackingTransport{}");
        writer.writeLine("\thttpClient := &http.Client{Transport: transport}");
        writer.newLine();

        this.writeClientConstructor(writer, serviceInfo);
        writer.newLine();

        this.writeTestEndpointCall(writer, testEndpoint);
        writer.newLine();

        writer.writeLine("\t// Should have captured exactly 2 requests: token fetch + API call");
        writer.writeLine("\trequire.Equal(t, 2, len(transport.requests),");
        writer.writeLine('\t\t"Expected 2 requests (token fetch + API call), got %d", len(transport.requests))');
        writer.newLine();

        writer.writeLine("\t// First request should be the token endpoint");
        writer.writeLine(
            `\tassert.True(t, strings.HasSuffix(transport.requests[0].url, ${JSON.stringify(serviceInfo.tokenEndpointPath)}),`
        );
        writer.writeLine(
            `\t\t"First request should be to token endpoint ${serviceInfo.tokenEndpointPath}, got %s", transport.requests[0].url)`
        );
        writer.newLine();

        writer.writeLine("\t// Second request should have the Authorization: Bearer header");
        writer.writeLine('\tauthHeader := transport.requests[1].headers.Get("Authorization")');
        writer.writeLine('\tassert.Equal(t, "Bearer test_access_token", authHeader,');
        writer.writeLine('\t\t"API request should have Authorization: Bearer header")');
        writer.writeLine("}");
    }

    /**
     * Writes a test that verifies tokens are cached and not re-fetched for subsequent API calls.
     */
    private writeTokenCachingTest(
        writer: go.Writer,
        serviceInfo: InferredAuthServiceInfo,
        testEndpoint: TestEndpointInfo
    ): void {
        writer.writeLine("// TestInferredAuthTokenCaching verifies that the token is cached and reused");
        writer.writeLine("// across multiple API calls without triggering additional token fetches.");
        writer.writeLine("func TestInferredAuthTokenCaching(t *testing.T) {");
        writer.writeLine("\ttransport := &requestTrackingTransport{}");
        writer.writeLine("\thttpClient := &http.Client{Transport: transport}");
        writer.newLine();

        this.writeClientConstructor(writer, serviceInfo);
        writer.newLine();

        writer.writeLine("\t// Make two API calls");
        this.writeTestEndpointCall(writer, testEndpoint, "err1");
        this.writeTestEndpointCall(writer, testEndpoint, "err2");
        writer.newLine();

        writer.writeLine("\t// Should have captured exactly 3 requests: 1 token fetch + 2 API calls");
        writer.writeLine("\trequire.Equal(t, 3, len(transport.requests),");
        writer.writeLine('\t\t"Expected 3 requests (1 token fetch + 2 API calls), got %d", len(transport.requests))');
        writer.newLine();

        writer.writeLine("\t// Only the first request should be to the token endpoint");
        writer.writeLine(
            `\tassert.True(t, strings.HasSuffix(transport.requests[0].url, ${JSON.stringify(serviceInfo.tokenEndpointPath)}),`
        );
        writer.writeLine('\t\t"First request should be to token endpoint")');
        writer.newLine();

        writer.writeLine("\t// Both API requests should have the Authorization header");
        writer.writeLine(
            '\tassert.Equal(t, "Bearer test_access_token", transport.requests[1].headers.Get("Authorization"),'
        );
        writer.writeLine('\t\t"First API request should have Authorization header")');
        writer.writeLine(
            '\tassert.Equal(t, "Bearer test_access_token", transport.requests[2].headers.Get("Authorization"),'
        );
        writer.writeLine('\t\t"Second API request should have Authorization header")');
        writer.writeLine("}");
    }

    /**
     * Writes a test that verifies custom headers are passed through to authenticated API requests.
     */
    private writeCustomHeadersTest(
        writer: go.Writer,
        serviceInfo: InferredAuthServiceInfo,
        testEndpoint: TestEndpointInfo
    ): void {
        writer.writeLine("// TestInferredAuthCustomHeaders verifies that custom headers set on the client");
        writer.writeLine("// are included in authenticated API requests.");
        writer.writeLine("func TestInferredAuthCustomHeaders(t *testing.T) {");
        writer.writeLine("\ttransport := &requestTrackingTransport{}");
        writer.writeLine("\thttpClient := &http.Client{Transport: transport}");
        writer.newLine();
        writer.writeLine("\tcustomHeaders := http.Header{}");
        writer.writeLine('\tcustomHeaders.Set("X-Custom-Header", "custom-value")');
        writer.writeLine('\tcustomHeaders.Set("X-Sandbox-Auth", "sandbox-token-123")');
        writer.newLine();

        this.writeClientConstructor(writer, serviceInfo, true);
        writer.newLine();

        this.writeTestEndpointCall(writer, testEndpoint);
        writer.newLine();

        writer.writeLine("\t// Should have captured at least 2 requests (token fetch + API call)");
        writer.writeLine("\trequire.GreaterOrEqual(t, len(transport.requests), 2,");
        writer.writeLine('\t\t"Expected at least 2 requests")');
        writer.newLine();

        writer.writeLine("\t// The API request (last captured) should include custom headers");
        writer.writeLine("\tapiRequest := transport.requests[len(transport.requests)-1]");
        writer.writeLine('\tassert.Equal(t, "custom-value", apiRequest.headers.Get("X-Custom-Header"),');
        writer.writeLine('\t\t"X-Custom-Header should be included in API request")');
        writer.writeLine('\tassert.Equal(t, "sandbox-token-123", apiRequest.headers.Get("X-Sandbox-Auth"),');
        writer.writeLine('\t\t"X-Sandbox-Auth should be included in API request")');
        writer.writeLine("}");
    }

    /**
     * Writes the client constructor call with credential options.
     */
    private writeClientConstructor(
        writer: go.Writer,
        serviceInfo: InferredAuthServiceInfo,
        includeCustomHeaders: boolean = false
    ): void {
        writer.writeLine(`\tc := client.${this.context.getClientConstructorName()}(`);
        writer.writeLine('\t\toption.WithBaseURL("http://localhost:8080"),');
        writer.writeLine("\t\toption.WithHTTPClient(httpClient),");
        for (const param of serviceInfo.credentialParams) {
            const testValue = `test_${param.fieldName.toLowerCase()}`;
            writer.writeLine(`\t\toption.With${param.fieldName}("${testValue}"),`);
        }
        if (includeCustomHeaders) {
            writer.writeLine("\t\toption.WithHTTPHeader(customHeaders),");
        }
        writer.writeLine("\t)");
    }

    /**
     * Writes a call to the test endpoint, ignoring errors.
     */
    private writeTestEndpointCall(writer: go.Writer, testEndpoint: TestEndpointInfo, errVar?: string): void {
        const varName = errVar ?? "err";
        const requestArg =
            testEndpoint.hasRequestParam && testEndpoint.requestTypeName != null
                ? this.buildRequestArg(testEndpoint)
                : "";
        const callArgs = requestArg ? `context.Background(), ${requestArg}` : "context.Background()";
        if (testEndpoint.hasResponseBody) {
            writer.writeLine(`\t_, ${varName} := c.${testEndpoint.accessPath}.${testEndpoint.methodName}(${callArgs})`);
        } else {
            writer.writeLine(`\t${varName} := c.${testEndpoint.accessPath}.${testEndpoint.methodName}(${callArgs})`);
        }
        writer.writeLine(`\tif ${varName} != nil {`);
        writer.writeLine(
            `\t\tt.Logf("${testEndpoint.methodName} returned error (may be expected in test): %v", ${varName})`
        );
        writer.writeLine("\t}");
    }

    /**
     * Builds the request argument string for an endpoint call.
     */
    private buildRequestArg(testEndpoint: TestEndpointInfo): string {
        if (testEndpoint.requestTypeImportPath == null || testEndpoint.requestTypeName == null) {
            return "";
        }
        // Extract the package alias from the import path (last segment)
        const segments = testEndpoint.requestTypeImportPath.split("/");
        const packageAlias = segments[segments.length - 1] ?? "";
        return `&${packageAlias}.${testEndpoint.requestTypeName}{}`;
    }

    private getInferredAuthScheme(): FernIr.InferredAuthScheme | undefined {
        return getInferredAuthScheme(this.context.ir);
    }
}
