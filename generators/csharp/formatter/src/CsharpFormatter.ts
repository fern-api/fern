import { AbstractFormatter } from "@fern-api/base-generator";
import { execSync } from "child_process";

export class CsharpFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return execSync("dotnet csharpier", { input: content, encoding: "utf-8" });
    }

    public formatSync(content: string): string {
        return execSync("dotnet csharpier", { input: content, encoding: "utf-8" });
    }
}
