import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

export interface ProtobufFileInfo {
    csharpNamespace: string | undefined;
    packageName: string | undefined;
    serviceName: string | undefined;
}

export class ProtobufParser {
    public async parse({ absoluteFilePath }: { absoluteFilePath: AbsoluteFilePath }): Promise<ProtobufFileInfo> {
        const content = await readFile(absoluteFilePath, "utf-8");

        const csharpNamespaceMatch = content.match(/option\s+csharp_namespace\s*=\s*"([^"]+)";/);
        const packageNameMatch = content.match(/package\s+([a-zA-Z_][\w\.]*);/);
        const serviceNameMatch = content.match(/service\s+([a-zA-Z_]\w*)\s*{/);

        return {
            csharpNamespace: csharpNamespaceMatch?.[1],
            packageName: packageNameMatch?.[1],
            serviceName: serviceNameMatch?.[1]
        };
    }
}
