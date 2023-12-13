import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { CoreUtility } from "../CoreUtility";
import { StreamUtils } from "./StreamUtils";

export class StreamingUtilsImpl extends CoreUtility implements StreamUtils {
    public readonly MANIFEST = {
        name: "stream-utils",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/stream-utils/src"),
        },
        originalPathOnDocker: "/assets/stream-utils" as const,
        pathInCoreUtilities: [{ nameOnDisk: "streaming-fetcher", exportDeclaration: { exportAll: true } }],
        addDependencies: (): void => {
            return;
        },
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
}
