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
            dependencyManager.addDependency("@types/ws", "^8.5.10", { type: DependencyType.DEV});
        }
    }; 
    
    public readonly ReconnectingWebsocket = { 
        _instantiate: this.withExportedName(
            "ReconnectingWebSocket",
            (ReconnectingWebSocket) =>
                (args: Websocket.Args): ts.Expression => {
                    return ts.factory.createNewExpression(
                        ReconnectingWebSocket.getExpression(),
                        undefined,
                        [ts.factory.createStringLiteral(args.url)]
                    );
                }
        ),
    };
}
