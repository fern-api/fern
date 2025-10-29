import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";
import { MANIFEST as RuntimeManifest } from "./Runtime";

export interface Stream {
    readonly Stream: {
        _construct: (args: {
            stream: ts.Expression;
            parse: ts.Expression;
            eventShape: Stream.SSEEventShape | Stream.MessageEventShape;
            signal: ts.Expression;
        }) => ts.Expression;
        _getReferenceToType: (response: ts.TypeNode) => ts.TypeNode;
    };
}

export declare namespace Stream {
    export interface Args {
        url: ts.Expression;
        method: ts.Expression;
        headers: ts.ObjectLiteralElementLike[];
        queryParameters: ts.Expression | undefined;
        body: ts.Expression | undefined;
        timeoutInSeconds: ts.Expression;
        withCredentials: boolean;

        abortController: ts.Expression | undefined;
    }

    export interface SSEEventShape {
        type: "sse";
        streamTerminator?: ts.Expression;
    }

    export interface MessageEventShape {
        type: "json";
        messageTerminator?: ts.Expression;
    }
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "stream",
    pathInCoreUtilities: { nameOnDisk: "stream", exportDeclaration: { exportAll: true } },
    addDependencies: (): void => {
        return;
    },
    dependsOn: [RuntimeManifest],
    getFilesPatterns: () => {
        return { patterns: ["src/core/stream/**", "tests/unit/stream/**"] };
    }
};

export class StreamImpl extends CoreUtility implements Stream {
    public readonly MANIFEST = MANIFEST;

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
                    eventShape: Stream.SSEEventShape | Stream.MessageEventShape;
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
