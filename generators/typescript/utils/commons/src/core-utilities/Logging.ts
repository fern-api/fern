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
    public readonly MANIFEST: CoreUtility.Manifest = MANIFEST;

    public readonly LogLevel: Logging["LogLevel"] = {
        _getReferenceToType: this.withExportedName("LogLevel", (LogLevel) => (): ts.TypeNode => LogLevel.getTypeNode())
    };

    public readonly ILogger: Logging["ILogger"] = {
        _getReferenceToType: this.withExportedName("ILogger", (ILogger) => (): ts.TypeNode => ILogger.getTypeNode())
    };

    public readonly LogConfig: Logging["LogConfig"] = {
        _getReferenceToType: this.withExportedName(
            "LogConfig",
            (LogConfig) => (): ts.TypeNode => LogConfig.getTypeNode()
        )
    };

    public readonly ConsoleLogger: Logging["ConsoleLogger"] = {
        _getReferenceToType: this.withExportedName(
            "ConsoleLogger",
            (ConsoleLogger) => (): ts.TypeNode => ConsoleLogger.getTypeNode()
        )
    };

    public readonly Logger: Logging["Logger"] = {
        _getReferenceToType: this.withExportedName("Logger", (Logger) => (): ts.TypeNode => Logger.getTypeNode())
    };

    public readonly createLogger: Logging["createLogger"] = {
        _invoke: this.withExportedName("createLogger", (createLogger) => (arg: ts.Expression): ts.Expression => {
            return ts.factory.createCallExpression(createLogger.getExpression(), undefined, [arg]);
        })
    };
}
