import { FernWriters } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { VariableDeclarationKind, WriterFunction } from "ts-morph";

import { BaseGeneratedUtilsFileImpl } from "./GeneratedUtilsFileImpl";

// getHeaders.ts
export class GeneratedGetHeadersImpl extends BaseGeneratedUtilsFileImpl {
    private static readonly CORS_SENSITIVE_RUNTIMES = [
        "browser",
        "web-worker",
        "workerd",
        "edge-runtime",
        "react-native"
    ];

    // hardcoding these because i think they've already been moved to core
    private static readonly SDK_HEADERS = {
        "User-Agent": "deepgram/1.0.4",
        "X-Fern-Language": "JavaScript",
        "X-Fern-SDK-Name": "deepgram",
        "X-Fern-SDK-Version": "1.0.4",
        "X-Fern-Runtime": "RUNTIME.type",
        "X-Fern-Runtime-Version": 'RUNTIME.version ?? "unknown"'
    };

    public writeToFile(context: SdkContext): void {
        this.addRuntimeImport();
        this.generateRuntimeIsCorsSensitiveFunction(context);
        this.generateGetHeadersFunction(context);
    }

    private addRuntimeImport(): void {
        this.importsManager.addImport("../../../../core/runtime", {
            namedImports: ["RUNTIME"]
        });
    }

    private generateRuntimeIsCorsSensitiveFunction(context: SdkContext): void {
        const functionBody: WriterFunction = (writer) => {
            const runtimeList = GeneratedGetHeadersImpl.CORS_SENSITIVE_RUNTIMES.map((runtime) => `"${runtime}"`).join(
                ", "
            );
            writer.writeLine(`return [${runtimeList}].includes(RUNTIME.type);`);
        };

        const arrowFunction: WriterFunction = (writer) => {
            writer.write("(): boolean => ");
            writer.block(() => {
                functionBody(writer);
            });
        };

        context.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "_runtimeIsCorsSensitive",
                    initializer: arrowFunction
                }
            ]
        });
    }

    private generateGetHeadersFunction(context: SdkContext): void {
        const headersObjectWriter = this.createHeadersObject();

        const functionBody: WriterFunction = (writer) => {
            writer.write("return (_runtimeIsCorsSensitive() ? {} : ");
            headersObjectWriter.toFunction()(writer);
            writer.write(");");
        };

        context.sourceFile.addFunction({
            name: "getHeaders",
            isExported: true,
            returnType: this.createStringRecordType(),
            statements: functionBody
        });
    }

    private createHeadersObject() {
        const headersObjectWriter = FernWriters.object.writer({ asConst: false });

        Object.entries(GeneratedGetHeadersImpl.SDK_HEADERS).forEach(([key, value]) => {
            const quotedKey = key.startsWith('"') ? key : `"${key}"`;
            const quotedValue = value.startsWith('"') || value.includes("RUNTIME") ? value : `"${value}"`;

            headersObjectWriter.addProperty({
                key: quotedKey,
                value: quotedValue
            });
        });

        return headersObjectWriter;
    }

    // Using shared utility methods from base class
}
