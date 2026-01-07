import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { HttpEndpoint, HttpService, OAuthScheme, RequestProperty, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Information about the OAuth service structure extracted from the IR.
 */
interface OAuthServiceInfo {
    /** The client accessor path (e.g., "OAuth2" or "Auth") */
    clientAccessPath: string;
    /** The method name on the service client (e.g., "GetToken" or "GetTokenWithClientCredentials") */
    methodName: string;
    /** The Go field name for client_id (e.g., "ClientID" or "ClientId") */
    clientIdFieldName: string;
    /** The Go field name for client_secret (e.g., "ClientSecret") */
    clientSecretFieldName: string;
    /** Whether client_id is optional (pointer type) */
    clientIdIsOptional: boolean;
    /** Whether client_secret is optional (pointer type) */
    clientSecretIsOptional: boolean;
    /** The package directory for the OAuth service (e.g., "oauth2" or "auth") */
    packageDir: string;
    /** The service ID for the OAuth token endpoint */
    serviceId: string;
    /** The token endpoint */
    endpoint: HttpEndpoint;
    /** The service containing the token endpoint */
    service: HttpService;
}

/**
 * Generates custom OAuth wire tests that validate:
 * 1. Form URL encoded body format for OAuth token requests
 * 2. Custom headers being passed through to GetToken requests
 *
 * The generator dynamically extracts service structure from the IR to support
 * different OAuth configurations (different service names, field names, etc.).
 */
export class OAuthWireTestGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate(): GoFile | undefined {
        const oauthScheme = this.getOAuthClientCredentialsScheme();
        if (oauthScheme == null) {
            return undefined;
        }

        // Extract service info from the IR
        const serviceInfo = this.extractOAuthServiceInfo(oauthScheme);
        if (serviceInfo == null) {
            return undefined;
        }

        const testFileContent = this.generateOAuthTestFile(serviceInfo);

        // Use the canonical file location helper to determine the package directory
        const fileLocation = this.context.getClientFileLocation({
            fernFilepath: serviceInfo.service.name.fernFilepath,
            subpackage: undefined
        });

        // Place the OAuth wire tests in the appropriate directory based on the service package
        const testDirectory =
            fileLocation.directory.length > 0 ? `${fileLocation.directory}/oauth_wire_test` : "oauth_wire_test";
        return new GoFile({
            node: testFileContent,
            directory: RelativeFilePath.of(testDirectory),
            filename: "oauth_wire_test.go",
            packageName: "oauth_wire_test",
            rootImportPath: this.context.getRootImportPath(),
            importPath: "",
            customConfig: this.context.customConfig ?? {},
            formatter: undefined
        });
    }

    /**
     * Extracts OAuth service information from the IR scheme.
     */
    private extractOAuthServiceInfo(oauthScheme: OAuthScheme): OAuthServiceInfo | undefined {
        if (oauthScheme.configuration?.type !== "clientCredentials") {
            return undefined;
        }

        const tokenEndpoint = oauthScheme.configuration.tokenEndpoint;
        const serviceId = tokenEndpoint.endpointReference.serviceId;
        const service = this.context.ir.services[serviceId];

        if (service == null) {
            return undefined;
        }

        // Get the endpoint
        const endpointId = tokenEndpoint.endpointReference.endpointId;
        const endpoint = service.endpoints.find((e) => e.id === endpointId);
        if (endpoint == null) {
            return undefined;
        }

        // Extract client accessor path from fernFilepath (e.g., "OAuth2" or "Auth")
        const clientAccessPath = this.getClientAccessPath(service);

        // Use context.getMethodName for consistent method naming
        const methodName = this.context.getMethodName(endpoint.name);

        // Extract field information using context helpers
        const requestProperties = tokenEndpoint.requestProperties;
        if (requestProperties.clientId == null || requestProperties.clientSecret == null) {
            return undefined;
        }

        const clientIdFieldName = this.getRequestPropertyFieldName(requestProperties.clientId);
        const clientSecretFieldName = this.getRequestPropertyFieldName(requestProperties.clientSecret);
        const clientIdIsOptional = this.isRequestPropertyOptional(requestProperties.clientId);
        const clientSecretIsOptional = this.isRequestPropertyOptional(requestProperties.clientSecret);

        // Get package directory using canonical file location helper
        const fileLocation = this.context.getClientFileLocation({
            fernFilepath: service.name.fernFilepath,
            subpackage: undefined
        });
        const packageDir = fileLocation.directory;

        return {
            clientAccessPath,
            methodName,
            clientIdFieldName,
            clientSecretFieldName,
            clientIdIsOptional,
            clientSecretIsOptional,
            packageDir,
            serviceId,
            endpoint,
            service
        };
    }

    /**
     * Gets the client accessor path for a service (e.g., "OAuth2" from fernFilepath).
     */
    private getClientAccessPath(service: HttpService): string {
        const parts = service.name.fernFilepath.allParts.map((part) => part.pascalCase.unsafeName);
        return parts.join(".");
    }

    /**
     * Gets the field name for a request property using the context helper.
     * This matches the pattern used in ClientGenerator.getRequestPropertyFieldName.
     */
    private getRequestPropertyFieldName(requestProperty: RequestProperty): string {
        // The property can be either "query" or "body" type
        // Both have a name field that contains the Name object
        if (requestProperty.property.type === "body" && requestProperty.property.name != null) {
            return this.context.getFieldName(requestProperty.property.name.name);
        }
        if (requestProperty.property.type === "query" && requestProperty.property.name != null) {
            return this.context.getFieldName(requestProperty.property.name.name);
        }
        // Fallback to default names if we can't extract from IR
        return "ClientId";
    }

    /**
     * Checks if a request property is optional (pointer type).
     * This matches the pattern used in ClientGenerator.isRequestPropertyOptional.
     */
    private isRequestPropertyOptional(requestProperty: RequestProperty): boolean {
        return this.isTypeReferenceOptional(this.getRequestPropertyValueType(requestProperty));
    }

    /**
     * Gets the value type from a request property.
     */
    private getRequestPropertyValueType(requestProperty: RequestProperty): TypeReference | undefined {
        if (requestProperty.property.type === "body") {
            return requestProperty.property.valueType;
        }
        if (requestProperty.property.type === "query") {
            return requestProperty.property.valueType;
        }
        return undefined;
    }

    /**
     * Checks if a type reference is optional.
     */
    private isTypeReferenceOptional(typeRef: TypeReference | undefined): boolean {
        if (typeRef == null) {
            return false;
        }
        if (typeRef.type === "container") {
            return typeRef.container.type === "optional";
        }
        return false;
    }

    private generateOAuthTestFile(serviceInfo: OAuthServiceInfo): go.CodeBlock {
        const rootImportPath = this.context.getRootImportPath();

        // Derive the request type reference dynamically, similar to ClientGenerator
        const requestTypeRef = this.getRequestTypeReference(serviceInfo);

        return go.codeblock((writer) => {
            // Add imports
            writer.addImport("bytes");
            writer.addImport("context");
            writer.addImport("io");
            writer.addImport("net/http");
            writer.addImport("net/url");
            writer.addImport("strings");
            writer.addImport("testing");
            writer.addImport("github.com/stretchr/testify/assert");
            writer.addImport("github.com/stretchr/testify/require");
            writer.addImport(`${rootImportPath}/client`);
            writer.addImport(`${rootImportPath}/option`);
            // Add import for the request type's package
            const requestTypeAlias = writer.addImport(requestTypeRef.importPath);

            writer.newLine();

            // Write the request capturing transport
            this.writeRequestCapturingTransport(writer);
            writer.newLine();
            writer.newLine();

            // Write the form URL encoded body test
            this.writeFormEncodedBodyTest(writer, requestTypeAlias, requestTypeRef.name, serviceInfo);
            writer.newLine();
            writer.newLine();

            // Write the custom headers test
            this.writeCustomHeadersTest(writer, requestTypeAlias, requestTypeRef.name, serviceInfo);
        });
    }

    /**
     * Gets the request type reference for the OAuth token endpoint.
     * This matches the pattern used in ClientGenerator.writeOAuthTokenFetching.
     */
    private getRequestTypeReference(serviceInfo: OAuthServiceInfo): { name: string; importPath: string } {
        const endpoint = serviceInfo.endpoint;
        const requestWrapperName =
            endpoint.sdkRequest?.shape.type === "wrapper"
                ? endpoint.sdkRequest.shape.wrapperName
                : endpoint.sdkRequest?.requestParameterName;

        if (requestWrapperName != null) {
            // Use the context helper to get the proper type reference for wrapped requests
            const typeRef = this.context.getRequestWrapperTypeReference(serviceInfo.serviceId, requestWrapperName);
            return {
                name: typeRef.name,
                // importPath should always be defined for wrapped requests, but fall back to root if not
                importPath: typeRef.importPath ?? this.context.getRootImportPath()
            };
        }

        // Fallback to GetTokenRequest at the root package
        return {
            name: "GetTokenRequest",
            importPath: this.context.getRootImportPath()
        };
    }

    private writeRequestCapturingTransport(writer: go.Writer): void {
        writer.writeLine("// requestCapturingTransport captures HTTP requests for inspection in tests.");
        writer.writeLine("type requestCapturingTransport struct {");
        writer.writeLine("\tcapturedBody    []byte");
        writer.writeLine("\tcapturedHeaders http.Header");
        writer.writeLine("\tcapturedURL     string");
        writer.writeLine("\tcapturedMethod  string");
        writer.writeLine("}");
        writer.newLine();
        writer.writeLine("func (t *requestCapturingTransport) RoundTrip(req *http.Request) (*http.Response, error) {");
        writer.writeLine("\tt.capturedURL = req.URL.String()");
        writer.writeLine("\tt.capturedHeaders = req.Header.Clone()");
        writer.writeLine("\tt.capturedMethod = req.Method");
        writer.newLine();
        writer.writeLine("\tif req.Body != nil {");
        writer.writeLine("\t\tbody, err := io.ReadAll(req.Body)");
        writer.writeLine("\t\tif err != nil {");
        writer.writeLine("\t\t\treturn nil, err");
        writer.writeLine("\t\t}");
        writer.writeLine("\t\tt.capturedBody = body");
        writer.writeLine("\t\treq.Body = io.NopCloser(bytes.NewReader(body))");
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine("\tresponseBody := `{");
        writer.writeLine('\t\t"access_token": "test_access_token",');
        writer.writeLine('\t\t"token_type": "Bearer",');
        writer.writeLine('\t\t"expires_in": 3600');
        writer.writeLine("\t}`");
        writer.newLine();
        writer.writeLine("\treturn &http.Response{");
        writer.writeLine("\t\tStatusCode: 200,");
        writer.writeLine("\t\tBody:       io.NopCloser(strings.NewReader(responseBody)),");
        writer.writeLine("\t\tHeader: http.Header{");
        writer.writeLine('\t\t\t"Content-Type": []string{"application/json"},');
        writer.writeLine("\t\t},");
        writer.writeLine("\t}, nil");
        writer.writeLine("}");
    }

    private writeFormEncodedBodyTest(
        writer: go.Writer,
        requestTypeAlias: string,
        requestTypeName: string,
        serviceInfo: OAuthServiceInfo
    ): void {
        writer.writeLine("// TestOAuthGetTokenFormEncodedBody verifies that the OAuth token request body");
        writer.writeLine(
            "// is form URL encoded (not JSON) when the Content-Type is application/x-www-form-urlencoded."
        );
        writer.writeLine("func TestOAuthGetTokenFormEncodedBody(t *testing.T) {");
        writer.writeLine("\ttransport := &requestCapturingTransport{}");
        writer.writeLine("\thttpClient := &http.Client{Transport: transport}");
        writer.newLine();
        writer.writeLine("\tc := client.NewClient(");
        writer.writeLine('\t\toption.WithBaseURL("http://localhost:8080"),');
        writer.writeLine("\t\toption.WithHTTPClient(httpClient),");
        writer.writeLine('\t\toption.WithClientCredentials("test_client_id", "test_client_secret"),');
        writer.writeLine("\t)");
        writer.newLine();

        // Generate request struct initialization based on field optionality using dynamic request type
        writer.writeLine(`\trequest := &${requestTypeAlias}.${requestTypeName}{`);
        if (serviceInfo.clientIdIsOptional) {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: ${requestTypeAlias}.String("test_client_id"),`);
        } else {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: "test_client_id",`);
        }
        if (serviceInfo.clientSecretIsOptional) {
            writer.writeLine(
                `\t\t${serviceInfo.clientSecretFieldName}: ${requestTypeAlias}.String("test_client_secret"),`
            );
        } else {
            writer.writeLine(`\t\t${serviceInfo.clientSecretFieldName}: "test_client_secret",`);
        }
        writer.writeLine("\t}");
        writer.newLine();

        // Use dynamic service accessor and method name
        writer.writeLine(
            `\t_, err := c.${serviceInfo.clientAccessPath}.${serviceInfo.methodName}(context.Background(), request)`
        );
        writer.writeLine("\tif err != nil {");
        writer.writeLine('\t\tt.Logf("GetToken returned error (may be expected in test): %v", err)');
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine("\t// Verify Content-Type header is form-urlencoded");
        writer.writeLine('\tcontentType := transport.capturedHeaders.Get("Content-Type")');
        writer.writeLine('\tassert.Equal(t, "application/x-www-form-urlencoded", contentType,');
        writer.writeLine('\t\t"Content-Type should be application/x-www-form-urlencoded")');
        writer.newLine();
        writer.writeLine("\t// Verify body is form-encoded (not JSON)");
        writer.writeLine("\tbodyStr := string(transport.capturedBody)");
        writer.newLine();
        writer.writeLine("\t// Body should NOT start with { (JSON)");
        writer.writeLine('\tassert.False(t, strings.HasPrefix(strings.TrimSpace(bodyStr), "{"),');
        writer.writeLine('\t\t"Request body should not be JSON, got: %s", bodyStr)');
        writer.newLine();
        writer.writeLine("\t// Body should be parseable as form-urlencoded");
        writer.writeLine("\tvalues, err := url.ParseQuery(bodyStr)");
        writer.writeLine('\trequire.NoError(t, err, "Body should be valid form-urlencoded")');
        writer.newLine();
        writer.writeLine("\t// Verify required OAuth parameters are present");
        writer.writeLine('\tassert.NotEmpty(t, values.Get("client_id"), "client_id should be present")');
        writer.writeLine('\tassert.NotEmpty(t, values.Get("client_secret"), "client_secret should be present")');
        writer.writeLine("}");
    }

    private writeCustomHeadersTest(
        writer: go.Writer,
        requestTypeAlias: string,
        requestTypeName: string,
        serviceInfo: OAuthServiceInfo
    ): void {
        writer.writeLine("// TestOAuthGetTokenCustomHeaders verifies that custom headers set on the client");
        writer.writeLine("// are included in the OAuth GetToken request.");
        writer.writeLine("func TestOAuthGetTokenCustomHeaders(t *testing.T) {");
        writer.writeLine("\ttransport := &requestCapturingTransport{}");
        writer.writeLine("\thttpClient := &http.Client{Transport: transport}");
        writer.newLine();
        writer.writeLine("\t// Create custom headers");
        writer.writeLine("\tcustomHeaders := http.Header{}");
        writer.writeLine('\tcustomHeaders.Set("X-Custom-Header", "custom-value")');
        writer.writeLine('\tcustomHeaders.Set("X-Sandbox-Auth", "sandbox-token-123")');
        writer.newLine();
        writer.writeLine("\tc := client.NewClient(");
        writer.writeLine('\t\toption.WithBaseURL("http://localhost:8080"),');
        writer.writeLine("\t\toption.WithHTTPClient(httpClient),");
        writer.writeLine('\t\toption.WithClientCredentials("test_client_id", "test_client_secret"),');
        writer.writeLine("\t\toption.WithHTTPHeader(customHeaders),");
        writer.writeLine("\t)");
        writer.newLine();

        // Generate request struct initialization based on field optionality using dynamic request type
        writer.writeLine(`\trequest := &${requestTypeAlias}.${requestTypeName}{`);
        if (serviceInfo.clientIdIsOptional) {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: ${requestTypeAlias}.String("test_client_id"),`);
        } else {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: "test_client_id",`);
        }
        if (serviceInfo.clientSecretIsOptional) {
            writer.writeLine(
                `\t\t${serviceInfo.clientSecretFieldName}: ${requestTypeAlias}.String("test_client_secret"),`
            );
        } else {
            writer.writeLine(`\t\t${serviceInfo.clientSecretFieldName}: "test_client_secret",`);
        }
        writer.writeLine("\t}");
        writer.newLine();

        // Use dynamic service accessor and method name
        writer.writeLine(
            `\t_, err := c.${serviceInfo.clientAccessPath}.${serviceInfo.methodName}(context.Background(), request)`
        );
        writer.writeLine("\tif err != nil {");
        writer.writeLine('\t\tt.Logf("GetToken returned error (may be expected in test): %v", err)');
        writer.writeLine("\t}");
        writer.newLine();
        writer.writeLine("\t// Verify custom headers are present in the captured request");
        writer.writeLine('\tcustomHeader := transport.capturedHeaders.Get("X-Custom-Header")');
        writer.writeLine('\tassert.Equal(t, "custom-value", customHeader,');
        writer.writeLine('\t\t"X-Custom-Header should be included in GetToken request")');
        writer.newLine();
        writer.writeLine('\tsandboxHeader := transport.capturedHeaders.Get("X-Sandbox-Auth")');
        writer.writeLine('\tassert.Equal(t, "sandbox-token-123", sandboxHeader,');
        writer.writeLine('\t\t"X-Sandbox-Auth should be included in GetToken request")');
        writer.writeLine("}");
    }

    private getOAuthClientCredentialsScheme(): OAuthScheme | undefined {
        if (this.context.ir.auth == null) {
            return undefined;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth" && scheme.configuration?.type === "clientCredentials") {
                return scheme;
            }
        }
        return undefined;
    }
}
