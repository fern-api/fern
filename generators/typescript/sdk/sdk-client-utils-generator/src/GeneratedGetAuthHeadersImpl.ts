import { FernWriters } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { WriterFunction } from "ts-morph";

import { BaseGeneratedUtilsFileImpl } from "./GeneratedUtilsFileImpl";

// getAuthHeaders.ts
export class GeneratedGetAuthHeadersImpl extends BaseGeneratedUtilsFileImpl {
    public writeToFile(context: SdkContext): void {
        // Create the getAuthHeaders function using proper Fern patterns
        this.generateGetAuthHeadersFunction(context);
    }

    private generateGetAuthHeadersFunction(context: SdkContext): void {
        const authHeadersObjectWriter = this.createAuthHeadersObject();

        const functionBody: WriterFunction = (writer) => {
            writer.write("return ");
            authHeadersObjectWriter.toFunction()(writer);
            writer.write(";");
        };

        context.sourceFile.addFunction({
            name: "getAuthHeaders",
            isExported: true,
            parameters: [this.createApiKeyParameter()],
            returnType: this.createStringRecordType(),
            statements: functionBody
        });
    }

    private createAuthHeadersObject() {
        const authHeadersObjectWriter = FernWriters.object.writer({ asConst: false });
        authHeadersObjectWriter.addProperty({
            key: "Authorization",
            value: "`token ${apiKey}`"
        });
        return authHeadersObjectWriter;
    }

    // Using shared utility methods from base class
}
