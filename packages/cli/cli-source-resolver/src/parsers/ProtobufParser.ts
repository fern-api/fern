import { readFileSync } from "fs";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

export interface ProtobufFileInfo {
    csharpNamespace: string | undefined;
    packageName: string | undefined;
    serviceName: string | undefined;
}

export class ProtobufParser {
    public parse({ absoluteFilePath }: { absoluteFilePath: AbsoluteFilePath }): ProtobufFileInfo {
        const content = readFileSync(absoluteFilePath, "utf-8");

        const csharpNamespaceMatch = content.match(/option\s+csharp_namespace\s*=\s*"([^"]+)";/);
        const packageNameMatch = content.match(/package\s+([a-zA-Z_][\w.]*);/);
        const serviceNameMatch = content.match(/service\s+([a-zA-Z_]\w*)\s*{/);

        return {
            csharpNamespace: csharpNamespaceMatch?.[1],
            packageName: packageNameMatch?.[1],
            serviceName: serviceNameMatch?.[1]
        };
    }
}
