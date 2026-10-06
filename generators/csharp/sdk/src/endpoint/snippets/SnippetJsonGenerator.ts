import { NamedArgument } from "@fern-api/base-generator";
import { WithGeneration } from "@fern-api/csharp-codegen";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;

import urlJoin from "url-join";
import { RootClientGenerator } from "../../root-client/RootClientGenerator.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { HttpEndpointGenerator } from "../http/HttpEndpointGenerator.js";
import { isPagerPagination } from "../utils/isPagerPagination.js";
import { SingleEndpointSnippet } from "./EndpointSnippetsGenerator.js";

interface FormattedClientSnippet {
    imports: string | undefined;
    body: string;
}

export class SnippetJsonGenerator extends WithGeneration {
    private readonly context: SdkGeneratorContext;
    private readonly rootClientGenerator: RootClientGenerator;
    private readonly httpEndpointGenerator: HttpEndpointGenerator;
    constructor({ context }: { context: SdkGeneratorContext }) {
        super(context.generation);
        this.context = context;
        this.rootClientGenerator = new RootClientGenerator(context);
        this.httpEndpointGenerator = new HttpEndpointGenerator({ context });
    }

    private async formatClientInstantiation(clientOptions: NamedArgument[]): Promise<FormattedClientSnippet> {
        const clientOptionsArgument =
            clientOptions.length > 0
                ? this.csharp.instantiateClass({
                      classReference: this.Types.ClientOptions,
                      arguments_: clientOptions,
                      multiline: true
                  })
                : undefined;
        return await this.rootClientGenerator
            .generateExampleClientInstantiationSnippet({
                asSnippet: true,
                includeEnvVarArguments: true,
                clientOptionsArgument
            })
            .toFormattedSnippetAsync({
                allNamespaceSegments: this.context.getAllNamespaceSegments(),
                allTypeClassReferences: this.context.getAllTypeClassReferences(),
                generation: this.generation,
                formatter: this.context.formatter
            });
    }

    public async generate(): Promise<FernGeneratorExec.Snippets> {
        const rootClientSnippet = await this.formatClientInstantiation([]);

        function getCsharpSnippet(
            endpointSnippet: SingleEndpointSnippet,
            clientSnippet: FormattedClientSnippet,
            isPager: boolean
        ): string {
            let snippet = "";
            const clientImportList = clientSnippet.imports?.split("\n") ?? [];
            const snippetImportList = endpointSnippet.imports?.split("\n") ?? [];
            const uniqueOrderedImports = Array.from(new Set([...clientImportList, ...snippetImportList]))
                .filter((importString) => importString !== "")
                .sort();
            snippet = `${snippet}${uniqueOrderedImports.join("\n")}\n\nvar client = ${clientSnippet.body}`;

            if (isPager) {
                snippet = `${snippet}var items = `;
            }

            snippet = `${snippet}${endpointSnippet.endpointCall}`;

            if (isPager) {
                snippet = `${snippet}\nawait foreach (var item in items)
{
    // do something with item
}\n`;
            }
            return snippet;
        }

        const isPaginationEnabled = this.context.config.generatePaginatedClients ?? false;
        const endpoints: FernGeneratorExec.Endpoint[] = await Promise.all(
            Object.values(this.context.ir.services).flatMap((service) =>
                service.endpoints.map(async (httpEndpoint) => {
                    const isPager =
                        isPaginationEnabled &&
                        httpEndpoint.pagination != null &&
                        isPagerPagination(httpEndpoint.pagination);
                    const isStreaming =
                        httpEndpoint.response?.body?._visit({
                            streaming: () => true,
                            json: () => false,
                            fileDownload: () => false,
                            text: () => false,
                            bytes: () => false,
                            streamParameter: () => true,
                            _other: () => false
                        }) ?? false;
                    const snippets = this.getSnippetsForEndpoint(httpEndpoint.id);
                    return Promise.all(
                        snippets.map(async (endpointSnippet) => {
                            // SDK variables bound to the endpoint's path parameters are configured on the
                            // client, so the client instantiation carries the example values.
                            const sdkVariableClientOptions =
                                this.httpEndpointGenerator.getSdkVariableClientOptionArguments({
                                    endpoint: httpEndpoint,
                                    example: endpointSnippet.example,
                                    parseDatetimes: false
                                });
                            const clientSnippet =
                                sdkVariableClientOptions.length > 0
                                    ? await this.formatClientInstantiation(sdkVariableClientOptions)
                                    : rootClientSnippet;
                            const csharpSnippet = getCsharpSnippet(
                                endpointSnippet,
                                clientSnippet,
                                isPager || isStreaming
                            );
                            return {
                                exampleIdentifier: endpointSnippet?.exampleIdentifier,
                                id: {
                                    path: FernGeneratorExec.EndpointPath(this.getFullPathForEndpoint(httpEndpoint)),
                                    method: httpEndpoint.method,
                                    identifierOverride: httpEndpoint.id
                                },
                                snippet: FernGeneratorExec.EndpointSnippet.csharp({
                                    client: csharpSnippet
                                })
                            };
                        })
                    );
                })
            )
        ).then((endpoints) => endpoints.flat());

        return {
            types: {},
            endpoints
        };
    }

    private getSnippetsForEndpoint(endpointId: string): SingleEndpointSnippet[] {
        const snippetsForEndpoint = this.context.snippetGenerator.getSnippetsForEndpoint(endpointId);
        if (snippetsForEndpoint == null) {
            return [];
        }
        const { autogenerated, userSpecified } = snippetsForEndpoint;
        return userSpecified.length > 0 ? [...userSpecified] : autogenerated[0] != null ? [autogenerated[0]] : [];
    }

    // copied from ts generator:
    // TODO(dsinghvi): HACKHACK Move this to IR
    private getFullPathForEndpoint(endpoint: HttpEndpoint): string {
        let url = "";
        if (endpoint.fullPath.head.length > 0) {
            url = urlJoin(url, endpoint.fullPath.head);
        }
        for (const part of endpoint.fullPath.parts) {
            url = urlJoin(url, `{${part.pathParameter}}`);
            if (part.tail.length > 0) {
                url = urlJoin(url, part.tail);
            }
        }
        return url.startsWith("/") ? url : `/${url}`;
    }
}
