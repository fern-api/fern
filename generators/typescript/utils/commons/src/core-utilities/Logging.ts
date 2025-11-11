import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface Logging {
    LogLevel: {
        _getReferenceToType: () => ts.TypeNode;
    };

    ILogger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    LogConfig: {
        _getReferenceToType: () => ts.TypeNode;
    };

    ConsoleLogger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    Logger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    createLogger: {
        _invoke: (arg: ts.Expression) => ts.Expression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "logging",
    pathInCoreUtilities: { nameOnDisk: "logging", exportDeclaration: { namespaceExport: "logging" } },
    dependsOn: [],
    getFilesPatterns: () => {
        return { patterns: ["src/core/logging/**", "tests/unit/logging/**", "tests/setup.template.ts"] };
    }
};

export class LoggingImpl extends CoreUtility implements Logging {
    public readonly MANIFEST = MANIFEST;

    public readonly LogLevel = {
        _getReferenceToType: this.withExportedName("LogLevel", (LogLevel) => () => LogLevel.getTypeNode())
    };

    public readonly ILogger = {
        _getReferenceToType: this.withExportedName("ILogger", (ILogger) => () => ILogger.getTypeNode())
    };

    public readonly LogConfig = {
        _getReferenceToType: this.withExportedName("LogConfig", (LogConfig) => () => LogConfig.getTypeNode())
    };

    public readonly ConsoleLogger = {
        _getReferenceToType: this.withExportedName(
            "ConsoleLogger",
            (ConsoleLogger) => () => ConsoleLogger.getTypeNode()
        )
    };

    public readonly Logger = {
        _getReferenceToType: this.withExportedName("Logger", (Logger) => () => Logger.getTypeNode())
    };

    public readonly createLogger = {
        _invoke: this.withExportedName("createLogger", (createLogger) => (arg: ts.Expression): ts.Expression => {
            return ts.factory.createCallExpression(createLogger.getExpression(), undefined, [arg]);
        })
    };
}
