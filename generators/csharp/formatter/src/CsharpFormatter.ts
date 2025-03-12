import { execSync } from "child_process";

import { AbstractFormatter } from "@fern-api/base-generator";

export class CsharpFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return this.formatCode(content);
    }

    public formatSync(content: string): string {
        return this.formatCode(content);
    }

    private formatCode(content: string): string {
        if (!content.endsWith(";")) {
            content += ";";
        }
        try {
            return execSync("dotnet csharpier", { input: content, encoding: "utf-8" });
        } catch (e: unknown) {
            return content;
        }
    }
}
