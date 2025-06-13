import { SdkContext } from "@fern-typescript/contexts";
import { WriterFunction } from "ts-morph";

import { BaseGeneratedUtilsFileImpl } from "./GeneratedUtilsFileImpl";

// getAuthProtocols.ts
export class GeneratedGetAuthProtocolsImpl extends BaseGeneratedUtilsFileImpl {
    public writeToFile(context: SdkContext): void {
        // Generate the getAuthProtocols function using proper Fern patterns
        this.generateGetAuthProtocolsFunction(context);
    }

    private generateGetAuthProtocolsFunction(context: SdkContext): void {
        const functionBody: WriterFunction = (writer) => {
            writer.write("return [apiKey];");
        };

        context.sourceFile.addFunction({
            name: "getAuthProtocols",
            isExported: true,
            parameters: [this.createApiKeyParameter()],
            returnType: this.createStringArrayType(),
            statements: functionBody
        });
    }

    // Using shared utility methods from base class
}
