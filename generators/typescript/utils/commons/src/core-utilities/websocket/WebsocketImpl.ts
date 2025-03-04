import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager, DependencyType } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
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
        }
    };

    public ReconnectingWebSocket = {
        _getReferenceToType: this.withExportedName(
            "ReconnectingWebSocket",
            (APIResponse) => (response: ts.TypeNode) =>
                ts.factory.createTypeReferenceNode(APIResponse.getEntityName(), [response])
        ),
        _connect: this.withExportedName(
            "ReconnectingWebSocket",
            (ReconnectingWebSocket) =>
                (args: { url: ts.Expression; protocols: ts.Expression; options: ts.ObjectLiteralExpression }) =>
                    ts.factory.createNewExpression(ReconnectingWebSocket.getExpression(), undefined, [
                        ts.factory.createObjectLiteralExpression([
                            ts.factory.createPropertyAssignment("url", args.url),
                            ts.factory.createPropertyAssignment("protocols", args.protocols),
                            ts.factory.createPropertyAssignment("options", args.options)
                        ])
                    ])
        )
    };
}
