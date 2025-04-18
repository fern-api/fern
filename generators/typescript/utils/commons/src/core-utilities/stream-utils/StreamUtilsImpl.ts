import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { CoreUtility } from "../CoreUtility";
import { StreamUtils, StreamingFetcher } from "./StreamUtils";

export class StreamingUtilsImpl extends CoreUtility implements StreamUtils {
    public readonly MANIFEST = {
        name: "stream-utils",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/stream")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/stream"),
        pathInCoreUtilities: [{ nameOnDisk: "streaming-fetcher", exportDeclaration: { exportAll: true } }],
        addDependencies: (): void => {
            return;
        }
    };

    public Stream = {
        _construct: this.withExportedName(
            "Stream",
            (Stream) =>
                ({
                    stream,
                    parse,
                    eventShape,
                    signal
                }: {
                    stream: ts.Expression;
                    parse: ts.Expression;
                    eventShape: StreamingFetcher.SSEEventShape | StreamingFetcher.MessageEventShape;
                    signal: ts.Expression;
                }): ts.Expression => {
                    const eventShapeProperties: ts.ObjectLiteralElementLike[] = [];
                    if (eventShape.type === "sse") {
                        eventShapeProperties.push(
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("type"),
                                ts.factory.createStringLiteral("sse")
                            )
                        );
                        if (eventShape.streamTerminator != null) {
                            eventShapeProperties.push(
                                ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier("streamTerminator"),
                                    eventShape.streamTerminator ?? ts.factory.createStringLiteral("\n")
                                )
                            );
                        }
                    } else if (eventShape.type === "json") {
                        eventShapeProperties.push(
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("type"),
                                ts.factory.createStringLiteral("json")
                            )
                        );
                        eventShapeProperties.push(
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("messageTerminator"),
                                eventShape.messageTerminator ?? ts.factory.createStringLiteral("\n")
                            )
                        );
                    }
                    return ts.factory.createNewExpression(Stream.getExpression(), undefined, [
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("stream"), stream),
                                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("parse"), parse),
                                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("signal"), signal),
                                ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier("eventShape"),
                                    ts.factory.createObjectLiteralExpression(eventShapeProperties, true)
                                )
                            ],
                            true
                        )
                    ]);
                }
        ),

        _getReferenceToType: this.withExportedName(
            "Stream",
            (APIResponse) => (response: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [response])
        )
    };
}
