import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint, Name } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { IntermediateRepresentation, TypeDeclaration, Type, TypeId, TypeReference, SingleUnionType, SingleUnionTypeProperties } from "@fern-fern/ir-sdk/api";
import { union } from "@fern-fern/generator-cli-sdk/core/schemas";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

type DiscriminatedUnionTypeSnippetInfo = {
    unionType: java.ClassReference;
    subType1KeyCamelCase: string;
    subType1KeyPascalCase: string;
    subType1: java.ClassReference | string;
    subType2KeyCamelCase: string;
    subType2KeyPascalCase: string;
    subType2: java.ClassReference | string;
}

type UndiscriminatedUnionTypeSnippetInfo = {
    unionType: java.ClassReference;
    subType1: java.ClassReference | string;
    subType2: java.ClassReference | string;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";
    private static ENVIRONMENTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ENVIRONMENTS";
    private static EXCEPTION_HANDLING_FEATURE_ID: FernGeneratorCli.FeatureId = "EXCEPTION_HANDLING";
    private static BASE_URL_FEATURE_ID: FernGeneratorCli.FeatureId = "BASE_URL";
    private static SNIPPET_PACKAGE_NAME = "com.example.usage";
    private static ELLIPSES = java.codeblock("...");
    private static DISCRIMINATED_UNION_TYPES_FEATURE_ID: string = "DISCRIMINATED_UNION_TYPES";
    private static UNDISCRIMINATED_UNION_TYPES_FEATURE_ID: string = "UNDISCRIMINATED_UNION_TYPES";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly prerenderedSnippetsByEndpointId: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly rootPackageClientName: string;
    private readonly isPaginationEnabled: boolean;
    private readonly sampleDiscriminatedUnionType: DiscriminatedUnionTypeSnippetInfo | undefined;
    private readonly sampleUndiscriminatedUnionType: UndiscriminatedUnionTypeSnippetInfo | undefined;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;

        this.context.getJavaClassReferenceFromTypeId

        this.isPaginationEnabled = context.config.generatePaginatedClients ?? false;
        // this.sampleDiscriminatedUnionType = this.context.findSampleDiscriminatedUnionTypeInIr(this.context.ir);
        // this.sampleUndiscriminatedUnionType = this.context.findSampleUndiscriminatedUnionTypeInIr(this.context.ir);
        this.endpointsById = this.buildEndpointsById();
        this.prerenderedSnippetsByEndpointId = this.buildPrerenderedSnippetsByEndpointId(endpointSnippets);
        this.defaultEndpointId = this.getDefaultEndpointIdWithMaybeEmptySnippets(endpointSnippets);
        this.rootPackageClientName = this.getRootPackageClientName();
    }

    public buildReadmeSnippetsByFeatureId(): Record<FernGeneratorCli.FeatureId, string[]> {
        const prerenderedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                backupRenderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [FernGeneratorCli.StructuredFeatureId.Usage]: {
                backupRenderer: this.renderUsageSnippet.bind(this)
            }
        };

        const templatedSnippetsConfig: Record<
            FernGeneratorCli.FeatureId,
            {
                renderer: (endpoint: EndpointWithFilepath) => string;
                predicate?: (endpoint: EndpointWithFilepath) => boolean;
            }
        > = {
            [ReadmeSnippetBuilder.ENVIRONMENTS_FEATURE_ID]: {
                renderer: this.renderEnvironmentsSnippet.bind(this),
                predicate: (_endpoint: EndpointWithFilepath) => this.getDefaultEnvironmentId() != null
            },
            [ReadmeSnippetBuilder.BASE_URL_FEATURE_ID]: {
                renderer: this.renderBaseUrlSnippet.bind(this)
            },
            [ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID]: {
                renderer: this.renderExceptionHandlingSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.CustomClient]: {
                renderer: this.renderCustomClientSnippet.bind(this)
            },
            [FernGeneratorCli.StructuredFeatureId.Retries]: { renderer: this.renderRetriesSnippet.bind(this) },
            [FernGeneratorCli.StructuredFeatureId.Timeouts]: { renderer: this.renderTimeoutsSnippet.bind(this) },
            // [ReadmeSnippetBuilder.UNION_TYPES_FEATURE_ID]: { renderer: this.renderUnionTypesSnippet.bind(this) },
            // ...(this.sampleDiscriminatedUnionType !== undefined
            //     ? {
            //         [ReadmeSnippetBuilder.DISCRIMINATED_UNION_TYPES_FEATURE_ID]: {
            //             renderer: this.renderDiscriminatedUnionTypesSnippet.bind(this),
            //         }
            //     }
            //     : undefined),
            // ...(this.sampleUndiscriminatedUnionType !== undefined
            //     ? {
            //         [ReadmeSnippetBuilder.UNDISCRIMINATED_UNION_TYPES_FEATURE_ID]: {
            //             renderer: this.renderUndiscriminatedUnionTypesSnippetProvider(this.sampleUndiscriminatedUnionType).bind(this),
            //         }
            //     }
            //     : undefined),
            ...(this.isPaginationEnabled
                ? {
                      [FernGeneratorCli.StructuredFeatureId.Pagination]: {
                          renderer: this.renderPaginationSnippet.bind(this),
                          predicate: (endpoint: EndpointWithFilepath) => endpoint.endpoint.pagination != null
                      }
                  }
                : undefined)
        };

        const snippetsByFeatureId: Record<FernGeneratorCli.FeatureId, string[]> = {};

        for (const [featureId, { predicate, backupRenderer }] of Object.entries(prerenderedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.getPrerenderedSnippetsForFeature(
                featureId,
                predicate,
                backupRenderer
            );
        }

        for (const [featureId, { renderer, predicate }] of Object.entries(templatedSnippetsConfig)) {
            snippetsByFeatureId[featureId] = this.renderSnippetsTemplateForFeature(featureId, renderer, predicate);
        }
        this.context.logger.debug("snippetsByFeatureId: ", JSON.stringify(snippetsByFeatureId, null, 2));
        return snippetsByFeatureId;
    }

    private getPrerenderedSnippetsForFeature(
        featureId: FernGeneratorCli.FeatureId,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true,
        backupRenderer: (endpoint: EndpointWithFilepath) => string
    ): string[] {
        return this.getEndpointsForFeature(featureId)
            .filter(predicate)
            .map((endpoint) => {
                const prerendered = this.prerenderedSnippetsByEndpointId[endpoint.endpoint.id];
                return prerendered ?? backupRenderer(endpoint);
            });
    }

    private renderSnippetsTemplateForFeature(
        featureId: FernGeneratorCli.FeatureId,
        templateRenderer: (endpoint: EndpointWithFilepath) => string,
        predicate: (endpoint: EndpointWithFilepath) => boolean = () => true
    ): string[] {
        return this.getEndpointsForFeature(featureId).filter(predicate).map(templateRenderer);
    }

    private renderUsageSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();
        const endpointMethodInvocation = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

        const clientBuilder = java.TypeLiteral.builder({ classReference: clientClassReference, parameters: [] });

        const snippet = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(" client = ");
            writer.writeNodeStatement(clientBuilder);
            writer.newLine();
            writer.writeNodeStatement(endpointMethodInvocation);
        });

        return snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
    }

    private renderEnvironmentsSnippet(_endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();
        const defaultEnvironmentId = this.getDefaultEnvironmentId();
        // This should never happen because the precondition prevents this code from running
        // if we don't have a default environment ID, but we need this check for the linter.
        if (defaultEnvironmentId == null) {
            throw new Error("Could not get default environment ID for README snippet");
        }

        const productionEnvironment = java.codeblock((writer) => {
            writer.writeNode(this.context.getEnvironmentClassReference());
            writer.write(".");
            writer.write(defaultEnvironmentId);
        });

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "environment",
                    value: java.TypeLiteral.raw(productionEnvironment)
                }
            ]
        });

        const withEnvironment = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(withEnvironment);
        });

        return this.renderSnippet(snippet);
    }

    private renderBaseUrlSnippet(_endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const baseUrl = java.codeblock('"https://example.com"');
        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "url",
                    value: java.TypeLiteral.raw(baseUrl)
                }
            ]
        });

        const withCustomUrl = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(withCustomUrl);
        });

        return this.renderSnippet(snippet);
    }

    private renderExceptionHandlingSnippet(endpoint: EndpointWithFilepath): string {
        const endpointMethodInvocation = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

        const apiExceptionClassReference = this.context.getApiExceptionClassReference();
        const exceptionDeclarationBlock = java.codeblock((writer) => {
            writer.writeNode(apiExceptionClassReference);
            writer.write(" e");
        });

        const snippet = java.codeblock((writer) => {
            writer.controlFlowWithoutStatement("try");
            writer.writeNodeStatement(endpointMethodInvocation);
            writer.contiguousControlFlow("catch", exceptionDeclarationBlock);
            writer.writeLine("// Do something with the API exception...");
            writer.endControlFlow();
        });

        return this.renderSnippet(snippet);
    }

    private renderDiscriminatedUnionTypesSnippetProvider(unionType: java.ClassReference): (_endpoint: EndpointWithFilepath) => string {
        return (endpoint: EndpointWithFilepath) => {
            return this.renderDiscriminatedUnionTypesSnippet(unionType);
        }
    }

    private renderDiscriminatedUnionTypesSnippet(unionType: java.ClassReference): string {
        return this.renderUndiscriminatedUnionTypesSnippet(unionType);
    }

    private renderUndiscriminatedUnionTypesSnippetProvider(unionType: java.ClassReference): (_endpoint: EndpointWithFilepath) => string {
        return (endpoint: EndpointWithFilepath) => {
            return this.renderUndiscriminatedUnionTypesSnippet(unionType);
        }
    }

    private renderUndiscriminatedUnionTypesSnippet(unionType: java.ClassReference): string {
        const unionTypeClassReference = this.context.getUnionTypeClassReference();
        const unionSubType1ClassReference = this.context.getUnionSubType1ClassReference();
        const unionSubType2ClassReference = this.context.getUnionSubType2ClassReference();

        const unionTypeNameLower = ReadmeSnippetBuilder.firstLower(unionTypeClassReference.name);
        const unionSubType1NameLower = ReadmeSnippetBuilder.firstLower(unionSubType1ClassReference.name);
        const unionSubType2NameLower = ReadmeSnippetBuilder.firstLower(unionSubType2ClassReference.name);

        // Method: UnionType unionTypeFromUnionSubType1(UnionSubType1 unionSubType1) { return UnionType.of(unionSubType1); }
        const methodFromSubType1 = this.unionTypeFromSubTypeMethod(
            unionTypeClassReference,
            unionSubType1ClassReference
        );
        const methodFromSubType2 = this.unionTypeFromSubTypeMethod(
            unionTypeClassReference,
            unionSubType2ClassReference
        );

        // Method: String doSomethingWithUnionType(UnionType unionType) { ... visitor ... }
        const methodDoSomething = java.method({
            name: "doSomethingWithUnionType",
            access: java.Access.Public,
            parameters: [
                java.parameter({
                    name: "unionType",
                    type: java.Type.reference(unionTypeClassReference)
                })
            ],
            return_: java.Type.string(),
            body: java.codeblock((writer) => {
                writer.write("String result = ");
                writer.write("unionType.visit(new ");
                writer.writeNode(unionTypeClassReference);
                writer.write(".Visitor<String>() {");
                writer.newLine();
                writer.indent();
                // visit(UnionSubType1 value)
                writer.writeLine("@Override");
                writer.write("public String visit(");
                writer.writeNode(unionSubType1ClassReference);
                writer.write(" value) {");
                writer.newLine();
                writer.indent();
                writer.write("// do something with instance of UnionSubType1");
                writer.newLine();
                writer.write('return "Did something with UnionSubType1";');
                writer.newLine();
                writer.dedent();
                writer.write("}");
                writer.newLine();
                // visit(UnionSubType2 value)
                writer.writeLine("@Override");
                writer.write("public String visit(");
                writer.writeNode(unionSubType2ClassReference);
                writer.write(" value) {");
                writer.newLine();
                writer.indent();
                writer.write("// do something with instance of UnionSubType2");
                writer.newLine();
                writer.write('return "Did something with UnionSubType2";');
                // writer.writeNode(this.visitSubTypeMethod(unionSubType2ClassReference))
                writer.newLine();
                writer.dedent();
                writer.write("}");
                writer.newLine();
                writer.dedent();
                writer.write("});");
                writer.newLine();
                writer.write("return result;");
            })
        });

        // Compose all methods in a codeblock
        const snippet = java.codeblock((writer) => {
            writer.writeLine("// Instantiate instance of UnionSubType1");
            writer.writeNode(methodFromSubType1);
            writer.newLine();
            writer.writeLine("// Instantiate instance of UnionSubType2");
            writer.writeNode(methodFromSubType2);
            writer.newLine();
            writer.writeLine("// Operate on instance of UnionType");
            writer.writeNode(methodDoSomething);
            writer.newLine();
        });

        return this.renderSnippet(snippet);
    }

    private visitSubTypeMethod(subType: java.ClassReference): java.Method {
        return java.method({
            name: "visit",
            access: java.Access.Public,
            parameters: [
                java.parameter({
                    name: "value",
                    type: java.Type.reference(subType)
                })
            ],
            return_: java.Type.string(),
            body: java.codeblock((writer) => {
                writer.writeLine("// do something with instance of " + subType.name);
                writer.write('return "Did something with ' + subType.name + '";');
            })
        });
    }

    private unionTypeFromSubTypeMethod(unionType: java.ClassReference, subType: java.ClassReference): java.Method {
        const unionTypeNameLower = ReadmeSnippetBuilder.firstLower(unionType.name);
        const subTypeNameLower = ReadmeSnippetBuilder.firstLower(subType.name);

        return java.method({
            name: unionTypeNameLower + "From" + subType.name,
            access: java.Access.Public,
            parameters: [
                java.parameter({
                    name: subTypeNameLower,
                    type: java.Type.reference(subType)
                })
            ],
            return_: java.Type.reference(unionType),
            body: java.codeblock((writer) => {
                writer.write("return ");
                writer.writeNode(unionType);
                writer.write(".of(");
                writer.write(subTypeNameLower);
                writer.write(");");
            })
        });
    }

    private renderCustomClientSnippet(_endpoint: EndpointWithFilepath): string {
        const okHttpClientClassReference = this.context.getOkHttpClientClassReference();
        const okHttpClientAssignment = java.codeblock((writer) => {
            writer.writeNode(okHttpClientClassReference);
            writer.write(" customClient = ...");
        });

        const clientClassReference = this.context.getRootClientClassReference();

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "httpClient",
                    value: java.TypeLiteral.raw(java.codeblock("customClient"))
                }
            ]
        });

        const clientWithCustomClient = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNodeStatement(okHttpClientAssignment);
            writer.newLine();
            writer.writeNodeStatement(clientWithCustomClient);
        });

        return this.renderSnippet(snippet);
    }

    private renderRetriesSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();

        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "maxRetries",
                    value: java.TypeLiteral.raw(java.codeblock("1"))
                }
            ]
        });

        const clientWithRetries = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNodeStatement(clientInitialization);
        });

        return this.renderSnippet(clientWithRetries);
    }

    private renderTimeoutsSnippet(endpoint: EndpointWithFilepath): string {
        const requestOptionsClassReference = this.context.getRequestOptionsClassReference();
        const requestOptionsInitialization = java.TypeLiteral.builder({
            classReference: requestOptionsClassReference,
            parameters: [
                {
                    name: "timeout",
                    value: java.TypeLiteral.raw(java.codeblock("10"))
                }
            ]
        });

        const endpointMethodInvocation = this.getMethodCall(endpoint, [
            ReadmeSnippetBuilder.ELLIPSES,
            requestOptionsInitialization
        ]);

        const clientClassReference = this.context.getRootClientClassReference();
        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: [
                {
                    name: "timeout",
                    value: java.TypeLiteral.raw(java.codeblock("10"))
                }
            ]
        });

        const clientWithTimeout = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.rootPackageClientName} = `);
            writer.writeNode(clientInitialization);
        });

        const snippet = java.codeblock((writer) => {
            writer.writeLine("// Client level");
            writer.writeNodeStatement(clientWithTimeout);
            writer.newLine();
            writer.writeLine("// Request level");
            writer.writeNodeStatement(endpointMethodInvocation);
        });

        return this.renderSnippet(snippet);
    }

    private renderPaginationSnippet(endpoint: EndpointWithFilepath): string {
        const clientClassReference = this.context.getRootClientClassReference();
        const clientInitialization = java.TypeLiteral.builder({
            classReference: clientClassReference,
            parameters: []
        });

        const returnTypeClassReference = this.context.getReturnTypeForEndpoint(endpoint.endpoint);
        const paginationClassReference = java.Type.generic(this.context.getPaginationClassReference(), [
            returnTypeClassReference
        ]);

        const endpointMethodCall = this.getMethodCall(endpoint, [ReadmeSnippetBuilder.ELLIPSES]);

        const streamItemsMethodCall = java.invokeMethod({
            on: java.codeblock("response"),
            method: "streamItems",
            arguments_: []
        });

        const mapMethodCall = java.invokeMethod({
            on: streamItemsMethodCall,
            method: "map",
            arguments_: [java.codeblock("item -> ...")]
        });

        const manualPaginationSnippet = java.codeblock((writer) => {
            writer.writeLine("for (");
            writer.indent();
            writer.indent();
            writer.writeNode(java.Type.list(returnTypeClassReference));
            writer.writeTextStatement(" items = response.getItems");
            writer.writeTextStatement("response.hasNext()");
            writer.write("items = items.nextPage().getItems()");
            writer.writeLine(") {");
            writer.dedent();
            writer.writeLine("// Do something with items");
            writer.dedent();
            writer.writeLine("}");
        });

        const snippet = java.codeblock((writer) => {
            writer.writeNode(clientClassReference);
            writer.write(` ${this.getRootPackageClientName()} = `);
            writer.writeNodeStatement(clientInitialization);
            writer.newLine();
            writer.writeNode(paginationClassReference);
            writer.write(" response = ");
            writer.writeNodeStatement(endpointMethodCall);
            writer.newLine();
            writer.writeLine("// Iterator");
            writer.controlFlow("for", java.codeblock("item : response"));
            writer.writeLine("// Do something with item");
            writer.endControlFlow();
            writer.newLine();
            writer.writeLine("// Streaming");
            writer.writeNodeStatement(mapMethodCall);
            writer.newLine();
            writer.writeLine("// Manual pagination");
            writer.writeNode(manualPaginationSnippet);
        });

        return this.renderSnippet(snippet);
    }

    private buildEndpointsById(): Record<EndpointId, EndpointWithFilepath> {
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

    private buildPrerenderedSnippetsByEndpointId(
        endpointSnippets: FernGeneratorExec.Endpoint[]
    ): Record<EndpointId, string> {
        const snippets: Record<EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            if (endpointSnippet.snippet.type !== "java") {
                throw new Error(`Internal error; expected java snippet but got: ${endpointSnippet.snippet.type}`);
            }
            snippets[endpointSnippet.id.identifierOverride] = endpointSnippet.snippet.syncClient;
        }
        return snippets;
    }

    private getEndpointsForFeature(featureId: FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getConfiguredEndpointIdsForFeature(featureId) ?? [this.defaultEndpointId];
        return endpointIds.map(this.lookupEndpointById.bind(this));
    }

    private getConfiguredEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private lookupEndpointById(endpointId: EndpointId): EndpointWithFilepath {
        const endpoint = this.endpointsById[endpointId];
        if (endpoint == null) {
            throw new Error(`Internal error; missing endpoint ${endpointId}`);
        }
        return endpoint;
    }

    private getMethodCall(endpoint: EndpointWithFilepath, arguments_: java.AstNode[]): java.MethodInvocation {
        return java.invokeMethod({
            on: this.getAccessFromRootClient(endpoint.fernFilepath),
            method: this.getEndpointMethodName(endpoint.endpoint),
            arguments_
        });
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): java.AstNode {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.camelCase.safeName + "()");
        return clientAccessParts.length > 0
            ? java.codeblock(`${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`)
            : java.codeblock(ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME);
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.camelCase.unsafeName;
    }

    private getDefaultEnvironmentId(): FernIr.EnvironmentId | undefined {
        if (this.context.ir.environments == null) {
            return undefined;
        }

        return (
            this.context.ir.environments?.defaultEnvironment ??
            this.context.ir.environments.environments.environments[0]?.id
        );
    }

    private getRootPackageClientName(): string {
        return "client";
    }

    private getDefaultEndpointIdWithMaybeEmptySnippets(endpointSnippets: FernGeneratorExec.Endpoint[]): EndpointId {
        if (endpointSnippets.length > 0) {
            return this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        }

        const dynamicIr = this.context.ir.dynamic;

        if (dynamicIr == null) {
            throw new Error("Cannot generate README without dynamic IR");
        }

        const endpoints = Object.entries(dynamicIr.endpoints);

        if (endpoints.length == 0) {
            throw new Error("Cannot generate README without endpoints.");
        }

        // Prefer endpoints with a request body.
        const endpointsWithReferencedRequestBody = endpoints.filter((entry) => {
            const [_id, endpoint] = entry;

            if (endpoint.request.body == null) {
                return false;
            }

            return endpoint.request.body.type === "referenced";
        });

        if (endpointsWithReferencedRequestBody.length > 0 && endpointsWithReferencedRequestBody[0] != null) {
            // Return the EndpointId of the first Endpoint
            return endpointsWithReferencedRequestBody[0][0];
        }

        // Need this check for the linter
        if (endpoints[0] == null) {
            throw new Error("Cannot generate README with null endpoint.");
        }

        return endpoints[0][0];
    }

    /**
     * renders a snippet, skipping the package statement
     */
    private renderSnippet(snippet: java.AstNode): string {
        const asString = snippet.toString({
            packageName: ReadmeSnippetBuilder.SNIPPET_PACKAGE_NAME,
            customConfig: this.context.customConfig
        });
        if (asString.split("\n").length < 3) {
            return asString;
        } else {
            return asString.split("\n").slice(2).join("\n");
        }
    }

    private static firstLower(name: string): string {
        if (!name) {
            return name;
        }
        return name.charAt(0).toLowerCase() + name.slice(1);
    }

    // private static foo(classReference: java.ClassReference, typeDeclaration: TypeDeclaration): void {
    //     const bar = typeDeclaration.shape._visit(typeDeclaration.shape, {
    //         union: () => {
    //             return typeDeclaration.shape.union.subTypes[0].name;
    //         },
    //         _other: () => {
    //             return undefined;
    //         }
    //     })

    // }

    private typeFromTypeReference(typeReference: TypeReference): java.ClassReference | string | undefined {
        return TypeReference._visit(typeReference, {
            container: (value) => undefined,
            named: (value) => undefined,
            primitive: (value) => undefined,
            unknown: () => undefined,
            _other: () => undefined,
        })
    }

    private typeFromSingleUnionType(singleUnionType: SingleUnionType | undefined): java.ClassReference | string | undefined {
        if (singleUnionType == null) {
            return undefined;
        }
        const typeId = SingleUnionTypeProperties._visit(singleUnionType.shape, {
            singleProperty: (singleProperty) => undefined,
            samePropertiesAsObject: (val) => val.name.pascalCase.safeName,
            noProperties: () => undefined,
            _other: () => undefined,
        })
        return typeId;
    }

    private findDiscriminatedUnionTypeSnippetInfo(): DiscriminatedUnionTypeSnippetInfo | undefined {
        for (const typeDeclaration of Object.values(this.context.ir.types)) {
            const unionTypeInfo = Type._visit(typeDeclaration.shape, {
                object: () => undefined,
                enum: () => undefined,
                union: (unionTypeDeclaration) => {
                    if (unionTypeDeclaration.types.length >= 2 || unionTypeDeclaration.types[0] === undefined || unionTypeDeclaration.types[1] === undefined) {
                        return undefined;
                    }
                    const subType1 = this.typeFromSingleUnionType(unionTypeDeclaration.types[0]);
                    const subType2 = this.typeFromSingleUnionType(unionTypeDeclaration.types[1]);
                    if (subType1 === undefined || subType2 === undefined) {
                        return undefined;
                    }
                    return {
                        unionType: this.context.getJavaClassReferenceFromDeclaration({ typeDeclaration }),
                        subType1,
                        subType1KeyCamelCase: unionTypeDeclaration.types[0].discriminantValue.name.camelCase.safeName,
                        subType1KeyPascalCase: unionTypeDeclaration.types[0].discriminantValue.name.pascalCase.safeName,
                        subType2,
                        subType2KeyCamelCase: unionTypeDeclaration.types[1].discriminantValue.name.camelCase.safeName,
                        subType2KeyPascalCase: unionTypeDeclaration.types[1].discriminantValue.name.pascalCase.safeName,
                    }
                },
                alias: () => undefined,
                undiscriminatedUnion: () => undefined,
                _other: () => undefined

            });
            if (unionTypeInfo !== undefined) {
                return unionTypeInfo;
            }
        }
        return undefined;
    }


    private findUndiscriminatedUnionTypeSnippetInfo(): UndiscriminatedUnionTypeSnippetInfo | undefined {
        for (const typeDeclaration of Object.values(this.context.ir.types)) {
            const unionTypeInfo = Type._visit(typeDeclaration.shape, {
                object: () => undefined,
                enum: () => undefined,
                union: () => undefined,
                alias: () => undefined,
                undiscriminatedUnion: ({members}) => {
                    if (members.length < 2 || members[0] === undefined || members[1] === undefined) {
                        return undefined;
                    }
                    const subType1 = this.typeFromTypeReference(members[0].type);
                    const subType2 = this.typeFromTypeReference(members[1].type);
                    if (subType1 === undefined || subType2 === undefined) {
                        return undefined;
                    }
                    return {
                        unionType: this.context.getJavaClassReferenceFromDeclaration({ typeDeclaration }),
                        subType1,
                        subType2,
                    }
                },
                _other: () => undefined
            });
            if (unionTypeInfo !== undefined) {
                return unionTypeInfo;
            }
        }
        return undefined;
    }

}
