import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface Logger {
    LogLevel: {
        _getReferenceToType: () => ts.TypeNode;
    };

    Logger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    LoggingConfig: {
        _getReferenceToType: () => ts.TypeNode;
    };

    ConsoleLogger: {
        _getReferenceToType: () => ts.TypeNode;
    };

    resolveLogLevel: {
        _invoke: (args: ts.Expression[], options: { isOptional: boolean }) => ts.Expression;
    };

    shouldLog: {
        _invoke: (args: ts.Expression[], options: { isOptional: boolean }) => ts.Expression;
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

    public readonly LogLevel = {
        _getReferenceToType: this.withExportedName("LogLevel", (LogLevel) => () => LogLevel.getTypeNode())
    };

    public readonly Logger = {
        _getReferenceToType: this.withExportedName("Logger", (Logger) => () => Logger.getTypeNode())
    };

    public readonly LoggingConfig = {
        _getReferenceToType: this.withExportedName(
            "LoggingConfig",
            (LoggingConfig) => () => LoggingConfig.getTypeNode()
        )
    };

    public readonly ConsoleLogger = {
        _getReferenceToType: this.withExportedName(
            "ConsoleLogger",
            (ConsoleLogger) => () => ConsoleLogger.getTypeNode()
        )
    };

    public readonly resolveLogLevel = {
        _invoke: this.withExportedName(
            "resolveLogLevel",
            (resolveLogLevel) =>
                (args: ts.Expression[], _options: { isOptional: boolean }): ts.Expression => {
                    return ts.factory.createCallExpression(resolveLogLevel.getExpression(), undefined, args);
                }
        )
    };

    public readonly shouldLog = {
        _invoke: this.withExportedName(
            "shouldLog",
            (shouldLog) =>
                (args: ts.Expression[], _options: { isOptional: boolean }): ts.Expression => {
                    return ts.factory.createCallExpression(shouldLog.getExpression(), undefined, args);
                }
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
