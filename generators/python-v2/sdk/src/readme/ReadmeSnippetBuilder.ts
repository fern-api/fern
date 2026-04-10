import { AbstractReadmeSnippetBuilder, getNameFromWireValue } from "@fern-api/base-generator";
import { PYTHON_CASE_CONVERTER as caseConverter } from "@fern-api/python-base";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";

import { resolveDefaultEnvironmentName } from "../reference/buildReference.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

interface EndpointWithFilepath {
    endpoint: FernIr.HttpEndpoint;
    fernFilepath: FernIr.FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static ASYNC_CLIENT_FEATURE_ID: FernGeneratorCli.FeatureId = "ASYNC_CLIENT";
    private static STREAMING_FEATURE_ID: FernGeneratorCli.FeatureId = "STREAMING";
    private static PAGINATION_FEATURE_ID: FernGeneratorCli.FeatureId = "PAGINATION";
    private static ACCESS_RAW_RESPONSE_DATA_FEATURE_ID: FernGeneratorCli.FeatureId = "ACCESS_RAW_RESPONSE_DATA";
    private static WEBSOCKETS_FEATURE_ID: FernGeneratorCli.FeatureId = "WEBSOCKETS";
    private static OAUTH_TOKEN_OVERRIDE_FEATURE_ID: FernGeneratorCli.FeatureId = "OAUTH_TOKEN_OVERRIDE";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<FernIr.EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<FernIr.EndpointId, string> = {};
    private readonly defaultEndpointId: FernIr.EndpointId;
    private readonly packageName: string;
    private readonly clientClassName: string;
    private readonly asyncClientClassName: string;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;

        this.endpointsById = this.buildEndpointsById();
        this.prerenderedSnippetsByEndpointId = this.buildPrerenderedSnippetsByEndpointId(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        this.packageName = this.getPackageName();
        this.clientClassName = this.getClientClassName();
        this.asyncClientClassName = `Async${this.clientClassName}`;
    }

    public buildReadmeSnippetsByFeatureId(): Record<FernGeneratorCli.FeatureId, string[]> {
        const prerenderedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [FernGeneratorCli.StructuredFeatureId.Usage]: {}
        };

        const templatedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                renderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [ReadmeSnippetBuilder.ASYNC_CLIENT_FEATURE_ID]: {
                renderer: this.renderAsyncClientSnippet.bind(this)
            },
            ["EXCEPTION_HANDLING"]: {
                renderer: this.renderExceptionHandlingSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Retries]: {
                renderer: this.renderRetriesSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Timeouts]: {
                renderer: this.renderTimeoutsSnippet.bind(this)
            },
            [ReadmeSnippetBuilder.ACCESS_RAW_RESPONSE_DATA_FEATURE_ID]: {
                renderer: this.renderAccessRawResponseDataSnippet.bind(this)
            },
            ...(this.hasStreamingEndpoints()
                ? {
                      [ReadmeSnippetBuilder.STREAMING_FEATURE_ID]: {
                          renderer: this.renderStreamingSnippet.bind(this),
                          predicate: (endpoint: EndpointWithFilepath) => this.isStreamingEndpoint(endpoint.endpoint)
                      }
                  }
                : undefined),
            // Pagination is handled separately below to produce two code blocks
            ...(this.hasWebsocketChannels()
                ? {
                      [ReadmeSnippetBuilder.WEBSOCKETS_FEATURE_ID]: {
                          renderer: this.renderWebsocketSnippet.bind(this)
                      }
                  }
                : undefined),
            ...(this.hasOAuthScheme()
                ? {
                      [ReadmeSnippetBuilder.OAUTH_TOKEN_OVERRIDE_FEATURE_ID]: {
                          renderer: this.renderOAuthTokenOverrideSnippet.bind(this)
                      }
                  }
                : undefined)
        };

        const snippetsByFeatureId: Record<FernGeneratorCli.FeatureId, string[]> = {};

        for (const [featureId, { predicate }] of Object.entries(prerenderedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.getPrerenderedSnippetsForFeature(featureId, predicate);
        }

        for (const [featureId, { renderer, predicate }] of Object.entries(templatedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.renderSnippetsTemplateForFeature(featureId, renderer, predicate);
        }

        // Pagination snippets are handled separately to produce two code blocks (like v1)
        if (this.hasPaginatedEndpoints()) {
            snippetsByFeatureId[ReadmeSnippetBuilder.PAGINATION_FEATURE_ID] = this.buildPaginationSnippets();
        }

        // Always add custom client snippet (not endpoint-specific)
        snippetsByFeatureId[FernGeneratorCli.StructuredFeatureId.CustomClient] = [this.renderCustomClientSnippet()];

        // Environments snippet (not endpoint-specific)
        if (this.context.ir.environments != null) {
            const envSnippet = this.buildEnvironmentsSnippet();
            if (envSnippet != null) {
                snippetsByFeatureId[ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID] = [envSnippet];
            }
        }

        return snippetsByFeatureId;
    }

    private getPrerenderedSnippetsForFeature(
        featureId: FernGeneratorCli.FeatureId,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true
    ): string[] {
        return this.getEndpointsForFeature(featureId)
            .filter(predicate)
            .map((endpoint) => {
                const endpointId = endpoint.endpoint.id;
                const snippet = this.prerenderedSnippetsByEndpointId[endpoint.endpoint.id];
                if (snippet == null) {
                    throw new Error(`Internal error; missing snippet for endpoint ${endpointId}`);
                }
                return snippet;
            });
    }

    private renderSnippetsTemplateForFeature(
        featureId: FernGeneratorCli.FeatureId,
        templateRenderer: (endpoint: EndpointWithFilepath) => string,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true
    ): string[] {
        let endpoints = this.getEndpointsForFeature(featureId).filter(predicate);
        if (endpoints.length === 0) {
            // No configured/default endpoints match the predicate; find the first matching endpoint
            const matchingEndpoint = Object.values(this.endpointsById).find(predicate);
            if (matchingEndpoint != null) {
                endpoints = [matchingEndpoint];
            }
        }
        return endpoints.map(templateRenderer);
    }

    private renderAsyncClientSnippet(endpoint: EndpointWithFilepath): string {
        const syncSnippet = this.prerenderedSnippetsByEndpointId[endpoint.endpoint.id];

        // Extract parts from sync snippet for consistency, with template fallbacks
        const constructorArgs =
            syncSnippet != null
                ? (this.extractConstructorArgsFromSyncSnippet(syncSnippet) ?? this.getClientConstructorArgs())
                : this.getClientConstructorArgs();

        const extraImports =
            syncSnippet != null
                ? this.extractExtraImportsFromSyncSnippet(syncSnippet)
                : this.getClientConstructorExtraImports();

        const methodCallBlock = syncSnippet != null ? this.extractMethodCallFromSyncSnippet(syncSnippet) : undefined;

        let asyncBody: string;
        if (methodCallBlock != null) {
            const indentedMethodCall = methodCallBlock
                .split("\n")
                .map((line, idx) => {
                    if (idx === 0) {
                        return `    await ${line}`;
                    }
                    if (line.trim() === "") {
                        return "";
                    }
                    return `    ${line}`;
                })
                .join("\n");
            asyncBody = indentedMethodCall;
        } else {
            const methodCall = this.getMethodCall(endpoint);
            const hasParams = this.endpointHasParameters(endpoint.endpoint);
            asyncBody = `    await ${methodCall}(${hasParams ? "..." : ""})`;
        }

        // Build imports block
        const imports = ["import asyncio"];
        for (const imp of extraImports) {
            imports.push(imp);
        }
        imports.push("");
        imports.push(`from ${this.packageName} import ${this.asyncClientClassName}`);
        const importsBlock = imports.join("\n");

        // Build constructor block
        const constructorBlock =
            constructorArgs !== ""
                ? `client = ${this.asyncClientClassName}(\n${constructorArgs}\n)`
                : `client = ${this.asyncClientClassName}()`;

        return this.writeCode(
            `${importsBlock}

${constructorBlock}


async def main() -> None:
${asyncBody}


asyncio.run(main())`
        );
    }

    private extractMethodCallFromSyncSnippet(syncSnippet: string): string | undefined {
        const match = syncSnippet.match(/\)\n\s*(client\..*)/s);
        if (match?.[1] == null) {
            return undefined;
        }
        return match[1].trimEnd();
    }

    private extractConstructorArgsFromSyncSnippet(syncSnippet: string): string | undefined {
        const lines = syncSnippet.split("\n");
        const clientLineIdx = lines.findIndex((line) => line.startsWith("client = "));
        if (clientLineIdx === -1) {
            return undefined;
        }
        const clientLine = lines[clientLineIdx] ?? "";
        // No-args case: client = SeedFoo()
        if (clientLine.endsWith("()")) {
            return "";
        }

        // Multi-line constructor: collect args until closing paren
        const argLines: string[] = [];
        for (let i = clientLineIdx + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line === ")") {
                break;
            }
            if (line != null) {
                argLines.push(line);
            }
        }
        return argLines.join("\n");
    }

    private extractExtraImportsFromSyncSnippet(syncSnippet: string): string[] {
        const lines = syncSnippet.split("\n");
        const clientLineIdx = lines.findIndex((line) => line.startsWith("client = "));
        if (clientLineIdx === -1) {
            return [];
        }
        const packageImportPrefix = `from ${this.packageName} import`;
        return lines
            .slice(0, clientLineIdx)
            .filter(
                (line) =>
                    line.trim() !== "" &&
                    !line.startsWith(packageImportPrefix) &&
                    (line.startsWith("from ") || line.startsWith("import "))
            );
    }

    private getClientConstructorArgs(): string {
        const args: string[] = [];

        // Add auth args from IR
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer":
                    args.push(
                        `    ${caseConverter.snakeUnsafe(scheme.token)}="YOUR_${caseConverter.screamingSnakeUnsafe(scheme.token)}",`
                    );
                    break;
                case "basic":
                    args.push(
                        `    ${caseConverter.snakeUnsafe(scheme.username)}="YOUR_${caseConverter.screamingSnakeUnsafe(scheme.username)}",`
                    );
                    args.push(
                        `    ${caseConverter.snakeUnsafe(scheme.password)}="YOUR_${caseConverter.screamingSnakeUnsafe(scheme.password)}",`
                    );
                    break;
                case "header": {
                    const schemeName = getNameFromWireValue(scheme.name);
                    const headerName = caseConverter.snakeUnsafe(schemeName);
                    const headerScreaming = caseConverter.screamingSnakeUnsafe(schemeName);
                    args.push(`    ${headerName}="YOUR_${headerScreaming}",`);
                    break;
                }
                case "oauth":
                    args.push(`    client_id="YOUR_CLIENT_ID",`);
                    args.push(`    client_secret="YOUR_CLIENT_SECRET",`);
                    break;
            }
        }

        // Add environment or base_url
        const environmentInfo = this.getEnvironmentInfo();
        if (environmentInfo != null) {
            args.push(environmentInfo.constructorArg);
        } else {
            args.push(`    base_url="https://yourhost.com/path/to/api",`);
        }

        return args.join("\n");
    }

    /**
     * Gets extra imports needed for the client constructor (e.g., environment import).
     */
    private getClientConstructorExtraImports(): string[] {
        const environmentInfo = this.getEnvironmentInfo();
        if (environmentInfo != null) {
            return [environmentInfo.importLine];
        }
        return [];
    }

    private renderExceptionHandlingSnippet(endpoint: EndpointWithFilepath): string {
        const methodCall = this.getMethodCall(endpoint);
        const hasParams = this.endpointHasParameters(endpoint.endpoint);
        return this.writeCode(
            `from ${this.packageName}.core.api_error import ApiError

try:
    ${methodCall}(${hasParams ? "..." : ""})
except ApiError as e:
    print(e.status_code)
    print(e.body)`
        );
    }

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        const methodCall = this.getMethodCall(endpoint);
        const hasParams = this.endpointHasParameters(endpoint.endpoint);
        return this.writeCode(
            `${methodCall}(${hasParams ? "..., " : ""}request_options={
    "max_retries": 1
})`
        );
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        const methodCall = this.getMethodCall(endpoint);
        const hasParams = this.endpointHasParameters(endpoint.endpoint);
        return this.writeCode(
            `from ${this.packageName} import ${this.clientClassName}

client = ${this.clientClassName}(..., timeout=20.0)

# Override timeout for a specific method
${methodCall}(${hasParams ? "..., " : ""}request_options={
    "timeout_in_seconds": 1
})`
        );
    }

    private renderCustomClientSnippet(): string {
        return this.writeCode(
            `import httpx
from ${this.packageName} import ${this.clientClassName}

client = ${this.clientClassName}(
    ...,
    httpx_client=httpx.Client(
        proxy="http://my.test.proxy.example.com",
        transport=httpx.HTTPTransport(local_address="0.0.0.0"),
    ),
)`
        );
    }

    private renderStreamingSnippet(endpoint: EndpointWithFilepath): string {
        const snippet = this.prerenderedSnippetsByEndpointId[endpoint.endpoint.id];
        if (snippet != null) {
            return snippet;
        }
        const methodCall = this.getMethodCall(endpoint);
        const hasParams = this.endpointHasParameters(endpoint.endpoint);
        return this.writeCode(
            `response = ${methodCall}(${hasParams ? "..." : ""})
for chunk in response:
    print(chunk)`
        );
    }

    private buildPaginationSnippets(): string[] {
        const paginationEndpoint = this.findPaginationEndpoint();
        if (paginationEndpoint == null) {
            return [];
        }

        const snippets: string[] = [];

        // First snippet: pre-rendered full snippet (same as usage)
        const prerenderedSnippet = this.prerenderedSnippetsByEndpointId[paginationEndpoint.endpoint.id];
        if (prerenderedSnippet != null) {
            snippets.push(prerenderedSnippet);
        }

        // Second snippet: abbreviated page iteration pattern
        const methodCall = this.getMethodCall(paginationEndpoint);
        const hasParams = this.endpointHasParameters(paginationEndpoint.endpoint);
        snippets.push(
            this.writeCode(
                `# You can also iterate through pages and access the typed response per page
pager = ${methodCall}(${hasParams ? "..." : ""})
for page in pager.iter_pages():
    print(page.response)  # access the typed response for each page
    for item in page:
        print(item)`
            )
        );

        return snippets;
    }

    private findPaginationEndpoint(): EndpointWithFilepath | undefined {
        const configuredEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.PAGINATION_FEATURE_ID).filter(
            (ep) => ep.endpoint.pagination != null
        );
        if (configuredEndpoints.length > 0) {
            return configuredEndpoints[0];
        }
        return Object.values(this.endpointsById).find((ep) => ep.endpoint.pagination != null);
    }

    private renderAccessRawResponseDataSnippet(endpoint: EndpointWithFilepath): string {
        // For paginated endpoints, show pager response pattern instead of .with_raw_response
        if (endpoint.endpoint.pagination != null) {
            const methodCall = this.getMethodCall(endpoint);
            const hasParams = this.endpointHasParameters(endpoint.endpoint);
            return this.writeCode(
                `from ${this.packageName} import ${this.clientClassName}

client = ${this.clientClassName}(
    ...,
)
pager = ${methodCall}(${hasParams ? "..." : ""})
print(pager.response)  # access the typed response for the first page
for item in pager:
    print(item)  # access the underlying object(s)
for page in pager.iter_pages():
    print(page.response)  # access the typed response for each page
    for item in page:
        print(item)  # access the underlying object(s)`
            );
        }

        const methodCall = this.getMethodCall(endpoint);
        const hasParams = this.endpointHasParameters(endpoint.endpoint);
        return this.writeCode(
            `from ${this.packageName} import ${this.clientClassName}

client = ${this.clientClassName}(...)
response = ${this.getRawResponseMethodCall(endpoint)}(${hasParams ? "..." : ""})
print(response.headers)  # access the response headers
print(response.status_code)  # access the response status code
print(response.data)  # access the underlying object`
        );
    }

    private renderWebsocketSnippet(_endpoint: EndpointWithFilepath): string {
        const websocketInfo = this.getFirstWebsocketChannel();
        if (websocketInfo == null) {
            return "";
        }

        const { subpackage, channel } = websocketInfo;
        const subpackageName = caseConverter.snakeSafe(subpackage.name);
        // connectMethodName may not exist on older IR SDK versions
        const connectMethodName = (channel as unknown as { connectMethodName?: string }).connectMethodName;
        const connectMethodNameSnakeCase = this.toSnakeCase(connectMethodName ?? "connect");
        const hasQueryParams = (channel.queryParameters?.length ?? 0) > 0;

        const syncSnippet = `from ${this.packageName} import ${this.clientClassName}

client = ${this.clientClassName}(...)

# Connect to the websocket (Sync)
with client.${subpackageName}.${connectMethodNameSnakeCase}(${hasQueryParams ? "..." : ""}) as socket:
    # Iterate over the messages as they arrive
    for message in socket:
        print(message)

    # Or, attach handlers to specific events
    socket.on(EventType.MESSAGE, lambda message: print("received message", message))`;

        const asyncSnippet = `import asyncio
from ${this.packageName} import ${this.asyncClientClassName}

client = ${this.asyncClientClassName}(...)

# Connect to the websocket (Async)
async with client.${subpackageName}.${connectMethodNameSnakeCase}(${hasQueryParams ? "..." : ""}) as socket:
    async for message in socket:
        print(message)`;

        return this.writeCode(`${syncSnippet}\n\n${asyncSnippet}`);
    }

    private renderOAuthTokenOverrideSnippet(_endpoint: EndpointWithFilepath): string {
        return this.writeCode(
            `from ${this.packageName} import ${this.clientClassName}

# Option 1: Direct bearer token (bypass OAuth flow)
client = ${this.clientClassName}(
    ...,
    token="my-pre-generated-bearer-token",
)

# Option 2: OAuth client credentials flow (automatic token management)
client = ${this.clientClassName}(
    ...,
    client_id="your-client-id",
    client_secret="your-client-secret",
)`
        );
    }

    private buildEnvironmentsSnippet(): string | undefined {
        const environmentInfo = this.getEnvironmentInfo();
        if (environmentInfo == null) {
            return undefined;
        }

        const { importLine, constructorArg } = environmentInfo;

        return this.writeCode(
            `from ${this.packageName} import ${this.clientClassName}
${importLine}

client = ${this.clientClassName}(
${constructorArg}
)
`
        );
    }

    private buildEndpointsById(): Record<FernIr.EndpointId, EndpointWithFilepath> {
        const endpoints: Record<FernIr.EndpointId, EndpointWithFilepath> = {};
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                endpoints[endpoint.id] = {
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                };
            }
        }
        return endpoints;
    }

    private buildPrerenderedSnippetsByEndpointId(
        endpointSnippets: FernGeneratorExec.Endpoint[]
    ): Record<FernIr.EndpointId, string> {
        const snippets: Record<FernIr.EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            if (endpointSnippet.snippet.type !== "python") {
                throw new Error(`Internal error; expected python snippet but got: ${endpointSnippet.snippet.type}`);
            }
            if (snippets[endpointSnippet.id.identifierOverride] != null) {
                continue;
            }
            snippets[endpointSnippet.id.identifierOverride] = this.injectClientSetupIntoSnippet(
                endpointSnippet.snippet.syncClient
            );
        }
        return snippets;
    }

    /**
     * Post-processes a prerendered snippet to inject base_url or environment setup
     * into the client constructor, matching v1 output.
     */
    private injectClientSetupIntoSnippet(snippet: string): string {
        const lines = snippet.split("\n");
        const clientLineIdx = lines.findIndex((line) => line.startsWith("client = "));
        if (clientLineIdx === -1) {
            return snippet;
        }

        const clientLine = lines[clientLineIdx] ?? "";

        // Find the closing paren of the constructor
        let closingParenIdx = -1;
        if (clientLine.endsWith("()")) {
            closingParenIdx = clientLineIdx;
        } else if (clientLine.endsWith("(")) {
            for (let i = clientLineIdx + 1; i < lines.length; i++) {
                if (lines[i] === ")") {
                    closingParenIdx = i;
                    break;
                }
            }
        }

        if (closingParenIdx === -1) {
            return snippet;
        }

        const environmentInfo = this.getEnvironmentInfo();
        if (environmentInfo != null) {
            const { importLine, constructorArg } = environmentInfo;

            const packageImportIdx = lines.findIndex((line) => line.startsWith(`from ${this.packageName} import`));
            if (packageImportIdx !== -1) {
                lines.splice(packageImportIdx + 1, 0, importLine);
                const adjustedClientLineIdx = clientLineIdx + 1;
                const adjustedClosingParenIdx = closingParenIdx + 1;
                this.injectConstructorArg(lines, adjustedClientLineIdx, adjustedClosingParenIdx, constructorArg);
            }
        } else {
            const baseUrlArg = `    base_url="https://yourhost.com/path/to/api",`;
            this.injectConstructorArg(lines, clientLineIdx, closingParenIdx, baseUrlArg);
        }

        return lines.join("\n");
    }

    /**
     * Injects a constructor argument into the client constructor.
     */
    private injectConstructorArg(lines: string[], clientLineIdx: number, closingParenIdx: number, arg: string): void {
        const clientLine = lines[clientLineIdx] ?? "";

        if (clientLine.endsWith("()")) {
            const className = clientLine.slice("client = ".length, -2);
            lines[clientLineIdx] = `client = ${className}(`;
            lines.splice(clientLineIdx + 1, 0, arg, ")");
        } else {
            lines.splice(closingParenIdx, 0, arg);
        }
    }

    /**
     * Gets environment info for snippet injection, or undefined if no environments.
     */
    private getEnvironmentInfo(): { importLine: string; constructorArg: string } | undefined {
        const envConfig = this.context.ir.environments;
        if (envConfig == null) {
            return undefined;
        }

        const envClassName = `${this.clientClassName}Environment`;
        const importLine = `from ${this.packageName}.environment import ${envClassName}`;

        const firstEnvName = resolveDefaultEnvironmentName(envConfig);

        if (firstEnvName == null) {
            return undefined;
        }

        const constructorArg = `    environment=${envClassName}.${firstEnvName},`;
        return { importLine, constructorArg };
    }

    private getEndpointsForFeature(featureId: FernIr.FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(featureId) ?? [this.defaultEndpointId];
        return endpointIds.map(this.lookupEndpointById.bind(this));
    }

    private getConfiguredEndpointIdsForFeature(featureId: FernIr.FeatureId): FernIr.EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: FernIr.EndpointId): EndpointWithFilepath {
        const endpoint = this.endpointsById[endpointId];
        if (endpoint == null) {
            throw new Error(`Internal error; missing endpoint ${endpointId}`);
        }
        return endpoint;
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        const accessPath = this.getEndpointAccessPath(endpoint);
        return `client.${accessPath}`;
    }

    private getEndpointAccessPath(endpoint: EndpointWithFilepath): string {
        const clientAccessParts = endpoint.fernFilepath.allParts.map((part) => caseConverter.snakeSafe(part));
        const methodName = caseConverter.snakeUnsafe(endpoint.endpoint.name);
        return clientAccessParts.length > 0 ? `${clientAccessParts.join(".")}.${methodName}` : methodName;
    }

    private getRawResponseMethodCall(endpoint: EndpointWithFilepath): string {
        const clientAccessParts = endpoint.fernFilepath.allParts.map((part) => caseConverter.snakeSafe(part));
        const methodName = caseConverter.snakeUnsafe(endpoint.endpoint.name);
        if (clientAccessParts.length > 0) {
            return `client.${clientAccessParts.join(".")}.with_raw_response.${methodName}`;
        }
        return `client.with_raw_response.${methodName}`;
    }

    private endpointHasParameters(endpoint: FernIr.HttpEndpoint): boolean {
        return (
            endpoint.allPathParameters.length > 0 || endpoint.queryParameters.length > 0 || endpoint.requestBody != null
        );
    }

    private isStreamingEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        const responseBody = endpoint.response?.body;
        if (responseBody == null) {
            return false;
        }
        return responseBody.type === "streaming" || responseBody.type === "streamParameter";
    }

    private hasStreamingEndpoints(): boolean {
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (this.isStreamingEndpoint(endpoint)) {
                    return true;
                }
            }
        }
        return false;
    }

    private hasPaginatedEndpoints(): boolean {
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.pagination != null) {
                    return true;
                }
            }
        }
        return false;
    }

    private hasWebsocketChannels(): boolean {
        return this.context.ir.websocketChannels != null && Object.keys(this.context.ir.websocketChannels).length > 0;
    }

    private hasOAuthScheme(): boolean {
        if (this.context.ir.auth == null) {
            return false;
        }
        return this.context.ir.auth.schemes.some((scheme) => scheme.type === "oauth");
    }

    private getFirstWebsocketChannel():
        | { subpackage: FernIr.Subpackage; channel: FernIr.WebSocketChannel }
        | undefined {
        if (this.context.ir.websocketChannels == null) {
            return undefined;
        }
        for (const subpackageId of Object.keys(this.context.ir.subpackages)) {
            const subpackage = this.context.ir.subpackages[subpackageId];
            if (
                subpackage != null &&
                subpackage.websocket != null &&
                this.context.ir.websocketChannels[subpackage.websocket] != null
            ) {
                const channel = this.context.ir.websocketChannels[subpackage.websocket];
                if (channel != null) {
                    return { subpackage, channel };
                }
            }
        }
        return undefined;
    }

    private getPackageName(): string {
        return this.context.getModulePath();
    }

    private getClientClassName(): string {
        if (this.context.customConfig.client?.exported_class_name != null) {
            return this.context.customConfig.client.exported_class_name;
        }
        if (this.context.customConfig.client_class_name != null) {
            return this.context.customConfig.client_class_name;
        }
        if (this.context.customConfig.client?.class_name != null) {
            return this.context.customConfig.client.class_name;
        }
        return (
            this.toPascalCase(this.context.config.organization) + this.toPascalCase(this.context.config.workspaceName)
        );
    }

    private toPascalCase(s: string): string {
        return s
            .split(/[-_\s]+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");
    }

    private toSnakeCase(s: string): string {
        return s
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "");
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
