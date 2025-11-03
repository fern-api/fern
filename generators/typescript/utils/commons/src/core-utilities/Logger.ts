import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface Logger {
    Logger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    ConsoleLogger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    createLogger: {
        _invoke: (args: ts.Expression[], options: { isOptional: boolean }) => ts.Expression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "logger",
    pathInCoreUtilities: { nameOnDisk: "logger", exportDeclaration: { exportAll: true } },
    dependsOn: [],
    getFilesPatterns: () => {
        return { patterns: ["src/core/logger/**"] };
    }
};

export class LoggerImpl extends CoreUtility implements Logger {
    public readonly MANIFEST = MANIFEST;

    public readonly Logger = {
        _getReferenceToType: this.withExportedName("Logger", (Logger) => () => Logger.getTypeNode())
    };

    public readonly ConsoleLogger = {
        _getReferenceToType: this.withExportedName(
            "ConsoleLogger",
            (ConsoleLogger) => () => ConsoleLogger.getTypeNode()
        )
    };

    public readonly createLogger = {
        _invoke: this.withExportedName(
            "createLogger",
            (createLogger) =>
                (args: ts.Expression[], _options: { isOptional: boolean }): ts.Expression => {
                    return ts.factory.createCallExpression(createLogger.getExpression(), undefined, args);
                }
        )
    };
}
