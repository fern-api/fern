import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager, DependencyType } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { MANIFEST as RuntimeManifest } from "../runtime/RuntimeImpl";
import { Websocket } from "./Websocket";

export class WebsocketImpl extends CoreUtility implements Websocket {
    public readonly MANIFEST = {
        name: "websocket",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/websocket")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/websocket"),
        pathInCoreUtilities: [{ nameOnDisk: "websocket", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("ws", "^8.16.0");
            dependencyManager.addDependency("@types/ws", "^8.5.10", { type: DependencyType.DEV });
        },
        dependsOn: [RuntimeManifest]
    };

    public ReconnectingWebSocket = {
        _getReferenceToType: this.withExportedName(
            "ReconnectingWebSocket",
            (ReconnectingWebSocket) => () => ReconnectingWebSocket.getTypeNode()
        ),
        _connect: this.withExportedName(
            "ReconnectingWebSocket",
            (ReconnectingWebSocket) =>
                (args: {
                    url: ts.Expression;
                    protocols: ts.Expression;
                    options: ts.ObjectLiteralExpression;
                    headers: ts.Expression;
                }) =>
                    ts.factory.createNewExpression(ReconnectingWebSocket.getExpression(), undefined, [
                        args.url,
                        args.protocols,
                        args.options,
                        args.headers
                    ])
        )
    };

    public CloseEvent = {
        _getReferenceToType: this.withExportedName("CloseEvent", (CloseEvent) => () => CloseEvent.getTypeNode())
    };

    public ErrorEvent = {
        _getReferenceToType: this.withExportedName("ErrorEvent", (ErrorEvent) => () => ErrorEvent.getTypeNode())
    };
}
