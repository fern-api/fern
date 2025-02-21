import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager, DependencyType } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { Websocket } from "./Websocket";

export class WebsocketImpl extends CoreUtility implements Websocket {
    
    public readonly MANIFEST = {
        name: "websocket",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/websocket/src/websocket")
        },

        // unitTests: {
        //     fromDirectory: RelativeFilePath.of("__test__"),
        //     findAndReplace: {
        //         "../createRequestUrl": "../../../src/core/fetcher/createRequestUrl",
        //         "../Fetcher": "../../../src/core/fetcher/Fetcher",
        //         "../../runtime": "../../../src/core/runtime",
        //         "../getFetchFn": "../../../src/core/fetcher/getFetchFn",
        //         "../getRequestBody": "../../../src/core/fetcher/getRequestBody",
        //         "../getResponseBody": "../../../src/core/fetcher/getResponseBody",
        //         "../makeRequest": "../../../src/core/fetcher/makeRequest",
        //         "../requestWithRetries": "../../../src/core/fetcher/requestWithRetries",
        //         "../signals": "../../../src/core/fetcher/signals",
        //         "../../stream-wrappers/Node18UniversalStreamWrapper":
        //             "../../../../src/core/fetcher/stream-wrappers/Node18UniversalStreamWrapper",
        //         "../../stream-wrappers/NodePre18StreamWrapper":
        //             "../../../../src/core/fetcher/stream-wrappers/NodePre18StreamWrapper",
        //         "../../stream-wrappers/UndiciStreamWrapper":
        //             "../../../../src/core/fetcher/stream-wrappers/UndiciStreamWrapper",
        //         "../../stream-wrappers/chooseStreamWrapper":
        //             "../../../../src/core/fetcher/stream-wrappers/chooseStreamWrapper",
        //         "../stream-wrappers/chooseStreamWrapper":
        //             "../../../src/core/fetcher/stream-wrappers/chooseStreamWrapper"
        //     }
        // },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/websocket"), // maybe need weboscket/websocket
        pathInCoreUtilities: [{ nameOnDisk: "websocket", exportDeclaration: { exportAll: true } }],
        // addDependencies: (dependencyManager: DependencyManager): void => {
        //     dependencyManager.addDependency("form-data", "^4.0.0");
        //     dependencyManager.addDependency("formdata-node", "^6.0.3");
        //     dependencyManager.addDependency("node-fetch", "^2.7.0");
        //     dependencyManager.addDependency("qs", "^6.13.1");
        //     dependencyManager.addDependency("readable-stream", "^4.5.2");
        //     dependencyManager.addDependency("@types/qs", "^6.9.17", {
        //         type: DependencyType.DEV
        //     });
        //     dependencyManager.addDependency("@types/node-fetch", "^2.6.12", {
        //         type: DependencyType.DEV
        //     });
        //     dependencyManager.addDependency("@types/readable-stream", "^4.0.18", {
        //         type: DependencyType.DEV
        //     });
        //     dependencyManager.addDependency("webpack", "^5.97.1", {
        //         type: DependencyType.DEV
        //     });
        //     dependencyManager.addDependency("ts-loader", "^9.5.1", {
        //         type: DependencyType.DEV
        //     });
        // }
    }; 
    
    public readonly ReconnectingWebsocket = { 
        _instantiate(args: Websocket.Args): ts.Expression {
            return ts.factory.createNewExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("core"),
                    "ReconnectingWebSocket"
                ),
                undefined,
                [ts.factory.createStringLiteral(args.url)]
            );
        } 
    };
}
