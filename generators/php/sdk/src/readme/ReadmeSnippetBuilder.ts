import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { php } from "@fern-api/php-codegen";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static EXCEPTION_HANDLING_FEATURE_ID: FernGeneratorCli.FeatureId = "EXCEPTION_HANDLING";
    private static PAGINATION_FEATURE_ID: FernGeneratorCli.FeatureId = "PAGINATION";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";

    private readonly context: SdkGeneratorContext;
    private readonly endpoints: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly snippets: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly isPaginationEnabled: boolean;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;
        this.isPaginationEnabled = context.config.generatePaginatedClients ?? false;
        this.endpoints = this.buildEndpoints();
        this.snippets = this.buildSnippets(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.CustomClient] = this.buildCustomClientSnippets();
        snippets[ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID] = this.buildExceptionHandlingSnippets();
        if (this.context.ir.environments != null) {
            snippets[ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID] = this.buildEnvironmentsSnippets();
        }
        if (this.isPaginationEnabled) {
            snippets[FernGeneratorCli.StructuredFeatureId.Pagination] = this.buildPaginationSnippets();
        }
        return snippets;
    }

    public buildReadmeAddendums(): Record<FernGeneratorCli.FeatureId, string> {
        const addendums: Record<FernGeneratorCli.FeatureId, string | undefined> = {};

        if (this.isPaginationEnabled) {
            addendums[FernGeneratorCli.StructuredFeatureId.Pagination] = this.buildPaginationAddendum();
        }

        return Object.fromEntries(
            Object.entries(addendums).filter(([_, value]) => value != null) as [FernGeneratorCli.FeatureId, string][]
        );
    }

    private buildUsageSnippets(): string[] {
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (usageEndpointIds != null) {
            return usageEndpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId));
        }
        return [this.getSnippetForEndpointId(this.defaultEndpointId)];
    }

    private buildExceptionHandlingSnippets(): string[] {
        const exceptionHandlingEndpoints = this.getEndpointsForFeature(
            ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID
        );
        return exceptionHandlingEndpoints.map((exceptionHandlingEndpoint) =>
            this.writeCode(`
use ${this.context.getRootNamespace()}\\Exceptions\\${this.context.getBaseApiExceptionClassReference().name};
use ${this.context.getRootNamespace()}\\Exceptions\\${this.context.getBaseExceptionClassReference().name};

try {
    $response = ${this.getMethodCall(exceptionHandlingEndpoint)}(...);
} catch (${this.context.getBaseApiExceptionClassReference().name} $e) {
    echo 'API Exception occurred: ' . $e->getMessage() . "\\n";
    echo 'Status Code: ' . $e->getCode() . "\\n";
    echo 'Response Body: ' . $e->getBody() . "\\n";
    // Optionally, rethrow the exception or handle accordingly.
}
`)
        );
    }

    private buildRetrySnippets(): string[] {
        const retryEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Retries);
        return retryEndpoints.map((retryEndpoint) =>
            this.writeCode(`
$response = ${this.getMethodCall(retryEndpoint)}(
    ...,
    options: [
        'maxRetries' => 0 // Override maxRetries at the request level
    ]
);
`)
        );
    }

    private buildTimeoutSnippets(): string[] {
        const timeoutEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts);
        return timeoutEndpoints.map((timeoutEndpoint) =>
            this.writeCode(`
$response = ${this.getMethodCall(timeoutEndpoint)}(
    ...,
    options: [
        'timeout' => 3.0 // Override timeout to 3 seconds
    ]
);
`)
        );
    }

    private buildCustomClientSnippets(): string[] {
        const snippet = this.writeCode(`
use ${this.context.getRootNamespace()}\\${this.context.getRootClientClassName()};

// Create a custom Guzzle client with specific configuration.
$customClient = new \\GuzzleHttp\\Client([
    'timeout' => 5.0,
]);

// Pass the custom client when creating an instance of the class.
${this.context.getClientVariableName()} = new ${this.context.getRootClientClassName()}(options: [
    '${this.context.getGuzzleClientOptionName()}' => $customClient
]);

// You can also utilize the same technique to leverage advanced customizations to the client such as adding middleware
$handlerStack = \\GuzzleHttp\\HandlerStack::create();
$handlerStack->push(MyCustomMiddleware::create());
$customClient = new \\GuzzleHttp\\Client(['handler' => $handlerStack]);

// Pass the custom client when creating an instance of the class.
${this.context.getClientVariableName()} = new ${this.context.getRootClientClassName()}(options: [
    '${this.context.getGuzzleClientOptionName()}' => $customClient
]);
`);
        return [snippet];
    }

    private buildPaginationSnippets(): string[] {
        const explicitlyConfigured = this.getExplicitlyConfiguredSnippets(
            FernGeneratorCli.StructuredFeatureId.Pagination
        );
        if (explicitlyConfigured != null) {
            return explicitlyConfigured;
        }

        const paginationEndpoint = this.getEndpointWithPagination();

        if (paginationEndpoint === undefined) {
            return [];
        }

        const codeBlock = php.codeblock((writer) => {
            // Import statement
            writer.write(`use ${this.context.getRootNamespace()}\\${this.context.getRootClientClassName()};\n\n`);

            // Here we'll build up the client instantiation
            const optionsArray = php.array({
                entries: [php.codeblock((w) => w.write("'baseUrl' => 'https://api.example.com'"))]
            });

            const clientClassReference = php.classReference({
                name: this.context.getRootClientClassName(),
                namespace: this.context.getRootNamespace()
            });

            const clientInstantiation = php.instantiateClass({
                classReference: clientClassReference,
                arguments_: [php.codeblock((w) => w.write("'<token>'")), optionsArray],
                multiline: true
            });

            // Write variable assignment with the client instantiation
            writer.write(
                "$client = " +
                    clientInstantiation.toString({
                        namespace: this.context.getRootNamespace(),
                        rootNamespace: this.context.getRootNamespace(),
                        customConfig: this.context.customConfig,
                        skipImports: true
                    }) +
                    ";\n\n"
            );

            // Create variable for pagination result
            writer.write("$items = ");

            // Method invocation using the paginationEndpoint
            const methodName = this.context.getEndpointMethodName(paginationEndpoint.endpoint);
            const clientAccess = this.context.getAccessFromRootClient(paginationEndpoint.fernFilepath);

            // Create a simple request argument with a limit parameter
            const requestArg = php.array({
                entries: [
                    php.codeblock((w) => {
                        w.write("'limit' => 10");
                    })
                ]
            });

            // Create the method invocation using the pagination endpoint
            const listMethodCall = php.invokeMethod({
                method: methodName,
                arguments_: [requestArg],
                on: php.codeblock((w) => {
                    w.write(clientAccess);
                })
            });

            listMethodCall.write(writer);
            writer.write(";\n\n");

            // Foreach loop
            writer.write("foreach ($items as $item) {\n");
            writer.indent();

            // Echo statement with sprintf
            writer.write("var_dump($item);\n");

            writer.dedent();
            writer.write("}");
        });

        const codeString = codeBlock.toString({
            namespace: this.context.getRootNamespace(),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig,
            skipImports: true
        });

        return [this.writeCode(codeString)];
    }

    private buildPaginationAddendum(): string | undefined {
        const paginationEndpoint = this.getEndpointWithPagination();
        if (paginationEndpoint == null) {
            return undefined;
        }

        // This part can be generic across generations so we don't need to generate it using the AST.
        return this.writeCode(`You can also iterate page-by-page:

\`\`\`php
foreach ($items->getPages() as $page) {
    foreach ($page->getItems() as $pageItem) {
        var_dump($pageItem);
    }
}
\`\`\`
`);
    }

    private getEndpointWithPagination(): EndpointWithFilepath | undefined {
        return this.filterEndpoint((endpointWithFilepath) => {
            if (endpointWithFilepath.endpoint.pagination != null) {
                return endpointWithFilepath;
            }
            return undefined;
        });
    }

    private filterEndpoint<T>(transform: (endpoint: EndpointWithFilepath) => T | undefined): T | undefined {
        for (const endpointWithFilepath of Object.values(this.endpoints)) {
            const result = transform(endpointWithFilepath);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    private getExplicitlyConfiguredSnippets(featureId: FeatureId): string[] | undefined {
        const endpointIds = this.getEndpointIdsForFeature(featureId);
        if (endpointIds != null) {
            return endpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId)).filter((e) => e != null);
        }
        return undefined;
    }

    private buildEndpoints(): Record<EndpointId, EndpointWithFilepath> {
        const endpoints: Record<EndpointId, EndpointWithFilepath> = {};
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

    private buildSnippets(endpointSnippets: FernGeneratorExec.Endpoint[]): Record<EndpointId, string> {
        const snippets: Record<EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            if (snippets[endpointSnippet.id.identifierOverride] != null) {
                continue;
            }
            snippets[endpointSnippet.id.identifierOverride] = this.getEndpointSnippetString(endpointSnippet);
        }
        return snippets;
    }

    private getSnippetForEndpointId(endpointId: EndpointId): string {
        const snippet = this.snippets[endpointId];
        if (snippet == null) {
            throw new Error(`Internal error; missing snippet for endpoint ${endpointId}`);
        }
        return snippet;
    }

    private getEndpointsForFeature(featureId: FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getEndpointIdsForFeature(featureId);
        return endpointIds != null ? this.getEndpoints(endpointIds) : this.getEndpoints([this.defaultEndpointId]);
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private getEndpoints(endpointIds: EndpointId[]): EndpointWithFilepath[] {
        return endpointIds.map((endpointId) => {
            const endpoint = this.endpoints[endpointId];
            if (endpoint == null) {
                throw new Error(`Internal error; missing endpoint ${endpointId}`);
            }
            return endpoint;
        });
    }

    private getEndpointSnippetString(endpoint: FernGeneratorExec.Endpoint): string {
        // Note: this is a shim since php snippets are not supported yet in FernGeneratorExec
        if (endpoint.snippet.type !== "java") {
            throw new Error(`Internal error; expected csharp snippet but got: ${endpoint.snippet.type}`);
        }
        return endpoint.snippet.syncClient;
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        return `${this.context.getAccessFromRootClient(endpoint.fernFilepath)}->${this.context.getEndpointMethodName(
            endpoint.endpoint
        )}`;
    }

    private buildEnvironmentsSnippets(): string[] {
        const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";

        if (isMultiUrl) {
            return [this.buildMultiUrlEnvironmentsSnippet()];
        } else {
            return [this.buildSingleUrlEnvironmentsSnippet()];
        }
    }

    private buildSingleUrlEnvironmentsSnippet(): string {
        const environments =
            this.context.ir.environments?.environments._visit({
                singleBaseUrl: (value) => value.environments,
                multipleBaseUrls: () => [],
                _other: () => []
            }) ?? [];

        if (environments.length === 0) {
            return "";
        }

        const environmentsList = environments
            .map((env) => {
                const envName = this.context.getEnvironmentName(env.name);
                return `- \`${this.context.getEnvironmentsClassReference().name}::${envName}\``;
            })
            .join("\n");

        const firstEnv = environments[0];
        const firstEnvName = firstEnv ? this.context.getEnvironmentName(firstEnv.name) : "Production";

        return this.writeCode(`
The SDK defaults to the \`${firstEnvName}\` environment. To use a different environment, pass it to the client constructor:

\`\`\`php
use ${this.context.getRootNamespace()}\\${this.context.getRootClientClassName()};
use ${this.context.getRootNamespace()}\\${this.context.getEnvironmentsClassReference().name};

${this.context.getClientVariableName()} = new ${this.context.getRootClientClassName()}(
    token: '<YOUR_TOKEN>',
    options: [
        'baseUrl' => ${this.context.getEnvironmentsClassReference().name}::Staging->value
    ]
);
\`\`\`

Available environments:
${environmentsList}
`);
    }

    private buildMultiUrlEnvironmentsSnippet(): string {
        const environments =
            this.context.ir.environments?.environments._visit({
                multipleBaseUrls: (value) => value.environments,
                singleBaseUrl: () => [],
                _other: () => []
            }) ?? [];

        const baseUrls =
            this.context.ir.environments?.environments._visit({
                multipleBaseUrls: (value) => value.baseUrls,
                singleBaseUrl: () => [],
                _other: () => []
            }) ?? [];

        if (environments.length === 0) {
            return "";
        }

        const environmentsList = environments
            .map((env) => {
                const envName = this.context.getEnvironmentName(env.name);
                return `- \`${this.context.getEnvironmentsClassReference().name}::${envName}()\``;
            })
            .join("\n");

        const firstEnv = environments[0];
        const firstEnvName = firstEnv ? this.context.getEnvironmentName(firstEnv.name) : "Production";

        const baseUrlsList = baseUrls
            .map((baseUrl) => {
                const propertyName = baseUrl.name.camelCase.safeName;
                return `  - \`${propertyName}\`: The ${propertyName} base URL`;
            })
            .join("\n");

        const customEnvParams = baseUrls
            .map((baseUrl, index) => {
                const propertyName = baseUrl.name.camelCase.safeName;
                const indent = index === 0 ? "" : "    ";
                return `${indent}${propertyName}: 'https://your-${propertyName}-url.com'`;
            })
            .join(",\n");

        return this.writeCode(`
This API uses multiple base URLs for different services. The SDK defaults to the \`${firstEnvName}\` environment.

Available environments:
${environmentsList}

Each environment provides multiple base URLs:
${baseUrlsList}

To use a different environment, pass it to the client constructor:

\`\`\`php
use ${this.context.getRootNamespace()}\\${this.context.getRootClientClassName()};
use ${this.context.getRootNamespace()}\\${this.context.getEnvironmentsClassReference().name};

${this.context.getClientVariableName()} = new ${this.context.getRootClientClassName()}(
    token: '<YOUR_TOKEN>',
    environment: ${this.context.getEnvironmentsClassReference().name}::Staging()
);
\`\`\`

You can also create a custom environment with your own URLs:

\`\`\`php
${this.context.getClientVariableName()} = new ${this.context.getRootClientClassName()}(
    token: '<YOUR_TOKEN>',
    environment: ${this.context.getEnvironmentsClassReference().name}::custom(
        ${customEnvParams}
    )
);
\`\`\`
`);
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
