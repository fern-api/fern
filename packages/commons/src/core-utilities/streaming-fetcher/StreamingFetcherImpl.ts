import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { StreamingFetcher } from "./StreamingFetcher";

export class StreamingFetcherImpl extends CoreUtility implements StreamingFetcher {
    public readonly MANIFEST = {
        name: "streaming-fetcher",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/streaming-fetcher/src"),
        },
        originalPathOnDocker: "/assets/streaming-fetcher" as const,
        pathInCoreUtilities: [{ nameOnDisk: "streaming-fetcher", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("axios", "0.27.2");
            dependencyManager.addDependency("qs", "6.11.2");
            dependencyManager.addDependency("@types/qs", "6.9.8");
        },
    };

    public readonly StreamingFetcher: StreamingFetcher["StreamingFetcher"] = {
        Args: {
            properties: {
                url: "url",
                method: "method",
                headers: "headers",
                queryParameters: "queryParameters",
                body: "body",
                timeoutMs: "timeoutMs",
                withCredentials: "withCredentials",
                onUploadProgress: "onUploadProgress",
                onDownloadProgress: "onDownloadProgress",
                abortController: "abortController",
                adapter: "adapter",
            },
            _getReferenceToType: this.getReferenceToTypeInStreamingFetcherModule("Args"),
        },

        Response: {
            properties: {
                data: "data",
                headers: "headers",
            },
            _getReferenceToType: this.getReferenceToTypeInStreamingFetcherModule("Response"),
        },
    };

    public readonly StreamingFetchFunction = {
        _getReferenceToType: this.withExportedName(
            "StreamingFetchFunction",
            (StreamingFetcher) => () => StreamingFetcher.getTypeNode()
        ),
    };

    public readonly streamingFetcher = {
        _getReferenceTo: this.withExportedName(
            "streamingFetcher",
            (streamingFetcher) => () => streamingFetcher.getExpression()
        ),
        _invoke: (
            args: StreamingFetcher.Args,
            { referenceToFetcher }: { referenceToFetcher: ts.Expression }
        ): ts.Expression => {
            const properties: ts.PropertyAssignment[] = [
                ts.factory.createPropertyAssignment(this.StreamingFetcher.Args.properties.url, args.url),
                ts.factory.createPropertyAssignment(this.StreamingFetcher.Args.properties.method, args.method),
            ];
            if (args.headers.length > 0) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.StreamingFetcher.Args.properties.headers,
                        ts.factory.createObjectLiteralExpression(args.headers, true)
                    )
                );
            }
            if (args.queryParameters != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.StreamingFetcher.Args.properties.queryParameters,
                        args.queryParameters
                    )
                );
            }
            if (args.body != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(this.StreamingFetcher.Args.properties.body, args.body)
                );
            }
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.StreamingFetcher.Args.properties.timeoutMs,
                    args.timeoutInSeconds
                )
            );
            if (args.withCredentials) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.StreamingFetcher.Args.properties.withCredentials,
                        ts.factory.createTrue()
                    )
                );
            }
            if (args.onUploadProgress != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.StreamingFetcher.Args.properties.onUploadProgress,
                        args.onUploadProgress
                    )
                );
            }
            if (args.abortController != null) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.StreamingFetcher.Args.properties.abortController,
                        args.abortController
                    )
                );
            }

            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(referenceToFetcher, undefined, [
                    ts.factory.createObjectLiteralExpression(properties, true),
                ])
            );
        },
    };

    public getHeader = {
        _invoke: this.withExportedName(
            "getHeader",
            (getHeader) =>
                ({ referenceToRequest, header }: { referenceToRequest: ts.Expression; header: string }) =>
                    ts.factory.createCallExpression(getHeader.getExpression(), undefined, [
                        referenceToRequest,
                        ts.factory.createStringLiteral(header),
                    ])
        ),
    };

    public Stream = {
        _construct: this.withExportedName(
            "Stream",
            (Stream) =>
                ({
                    stream,
                    parse,
                    terminator,
                }: {
                    stream: ts.Expression;
                    parse: ts.Expression;
                    terminator: string;
                }): ts.Expression => {
                    return ts.factory.createNewExpression(Stream.getExpression(), undefined, [
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("stream"), stream),
                                ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier("terminator"),
                                    ts.factory.createStringLiteral(terminator)
                                ),
                                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("parse"), parse),
                            ],
                            true
                        ),
                    ]);
                }
        ),

        _getReferenceToType: this.withExportedName(
            "Stream",
            (APIResponse) => (response: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [response])
        ),
    };

    private getReferenceToTypeInStreamingFetcherModule(typeName: string) {
        return this.withExportedName(
            "StreamingFetcher",
            (Fetcher) => () =>
                ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(Fetcher.getEntityName(), typeName))
        );
    }
}
