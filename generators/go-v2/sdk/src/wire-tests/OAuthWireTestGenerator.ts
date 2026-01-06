import { RelativeFilePath } from "@fern-api/fs-utils";
import { go, goExportedFieldName } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { HttpService, Name, OAuthScheme, RequestProperty } from "@fern-fern/ir-sdk/api";
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

        // Place the OAuth wire tests in the appropriate directory based on the service package
        return new GoFile({
            node: testFileContent,
            directory: RelativeFilePath.of(`./${serviceInfo.packageDir}/oauth_wire_test`),
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

        // Extract method name from endpoint
        const methodName = endpoint.name.pascalCase.unsafeName;

        // Extract field information
        const requestProperties = tokenEndpoint.requestProperties;
        if (requestProperties.clientId == null || requestProperties.clientSecret == null) {
            return undefined;
        }

        const clientIdInfo = this.extractFieldInfo(requestProperties.clientId);
        const clientSecretInfo = this.extractFieldInfo(requestProperties.clientSecret);

        if (clientIdInfo == null || clientSecretInfo == null) {
            return undefined;
        }

        // Get package directory (lowercase version of the service path)
        const packageDir = this.getPackageDir(service);

        return {
            clientAccessPath,
            methodName,
            clientIdFieldName: clientIdInfo.fieldName,
            clientSecretFieldName: clientSecretInfo.fieldName,
            clientIdIsOptional: clientIdInfo.isOptional,
            clientSecretIsOptional: clientSecretInfo.isOptional,
            packageDir
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
     * Gets the package directory for a service (e.g., "oauth2" from fernFilepath).
     */
    private getPackageDir(service: HttpService): string {
        const parts = service.name.fernFilepath.allParts.map((part) => part.pascalCase.unsafeName.toLowerCase());
        return parts.join("/");
    }

    /**
     * Extracts field name and optionality from a request property.
     */
    private extractFieldInfo(requestProperty: RequestProperty): { fieldName: string; isOptional: boolean } | undefined {
        // We need to get the property name from the request property
        // The property is accessed via the property field
        const property = requestProperty.property;
        if (property == null) {
            return undefined;
        }

        const fieldName = this.getGoFieldName(property.name.name);

        // Check if the type is optional by looking at the type reference
        const typeReference = property.valueType;
        const isOptional = typeReference.type === "container" && typeReference.container.type === "optional";

        return { fieldName, isOptional };
    }

    /**
     * Converts an IR Name to a Go exported field name.
     */
    private getGoFieldName(name: Name): string {
        return goExportedFieldName(name.pascalCase.unsafeName);
    }

    private generateOAuthTestFile(serviceInfo: OAuthServiceInfo): go.CodeBlock {
        const rootImportPath = this.context.getRootImportPath();

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
            // Get the alias for the root package - this handles import paths with hyphens
            const rootPackageAlias = writer.addImport(rootImportPath);

            writer.newLine();

            // Write the request capturing transport
            this.writeRequestCapturingTransport(writer);
            writer.newLine();
            writer.newLine();

            // Write the form URL encoded body test
            this.writeFormEncodedBodyTest(writer, rootPackageAlias, serviceInfo);
            writer.newLine();
            writer.newLine();

            // Write the custom headers test
            this.writeCustomHeadersTest(writer, rootPackageAlias, serviceInfo);
        });
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

    private writeFormEncodedBodyTest(writer: go.Writer, rootPackageAlias: string, serviceInfo: OAuthServiceInfo): void {
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

        // Generate request struct initialization based on field optionality
        writer.writeLine(`\trequest := &${rootPackageAlias}.GetTokenRequest{`);
        if (serviceInfo.clientIdIsOptional) {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: ${rootPackageAlias}.String("test_client_id"),`);
        } else {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: "test_client_id",`);
        }
        if (serviceInfo.clientSecretIsOptional) {
            writer.writeLine(
                `\t\t${serviceInfo.clientSecretFieldName}: ${rootPackageAlias}.String("test_client_secret"),`
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

    private writeCustomHeadersTest(writer: go.Writer, rootPackageAlias: string, serviceInfo: OAuthServiceInfo): void {
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

        // Generate request struct initialization based on field optionality
        writer.writeLine(`\trequest := &${rootPackageAlias}.GetTokenRequest{`);
        if (serviceInfo.clientIdIsOptional) {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: ${rootPackageAlias}.String("test_client_id"),`);
        } else {
            writer.writeLine(`\t\t${serviceInfo.clientIdFieldName}: "test_client_id",`);
        }
        if (serviceInfo.clientSecretIsOptional) {
            writer.writeLine(
                `\t\t${serviceInfo.clientSecretFieldName}: ${rootPackageAlias}.String("test_client_secret"),`
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
