import { ts } from "ts-morph";

import { DependencyManager, DependencyType } from "../dependency-manager/DependencyManager";
import { CoreUtility } from "./CoreUtility";
import { MANIFEST as RuntimeManifest } from "./Runtime";
import { MANIFEST as UrlManifest } from "./UrlUtils";

export interface Websocket {
    readonly ReconnectingWebSocket: {
        _getReferenceToType: () => ts.TypeNode;
        _connect: (args: {
            url: ts.Expression;
            protocols: ts.Expression;
            options: ts.ObjectLiteralExpression;
            headers: ts.Expression;
            queryParameters: ts.Expression;
        }) => ts.Expression;
    };
    readonly CloseEvent: {
        _getReferenceToType: () => ts.TypeNode;
    };
    readonly ErrorEvent: {
        _getReferenceToType: () => ts.TypeNode;
    };
}

export declare namespace Websocket {
    export interface Args {
        url: string;
        headers: Record<string, string>;
        queryParameters: Record<string, string>;
        body: string;
        maxRetries: number;
        timeoutInSeconds: number;
    }
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "websocket",
    pathInCoreUtilities: { nameOnDisk: "websocket", exportDeclaration: { exportAll: true } },
    addDependencies: (dependencyManager: DependencyManager): void => {
        dependencyManager.addDependency("ws", "^8.16.0");
        dependencyManager.addDependency("@types/ws", "^8.5.10", { type: DependencyType.DEV });
    },
    dependsOn: [RuntimeManifest, UrlManifest],
    getFilesPatterns: () => {
        return { patterns: "src/core/websocket/**" };
    }
};
export class WebsocketImpl extends CoreUtility implements Websocket {
    public readonly MANIFEST = MANIFEST;

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
                    queryParameters: ts.Expression;
                }) =>
                    ts.factory.createNewExpression(ReconnectingWebSocket.getExpression(), undefined, [
                        ts.factory.createObjectLiteralExpression([
                            ts.factory.createPropertyAssignment("url", args.url),
                            ts.factory.createPropertyAssignment("protocols", args.protocols),
                            ts.factory.createPropertyAssignment("queryParameters", args.queryParameters),
                            ts.factory.createPropertyAssignment("headers", args.headers),
                            ts.factory.createPropertyAssignment("options", args.options)
                        ])
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
