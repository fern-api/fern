import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpPath, PathParameter } from "@fern-fern/ir-sdk/api";
import { format } from "util";

export function getSdkVersion(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    return config.output.mode._visit<string | undefined>({
        publish: (gpc: FernGeneratorExec.GeneratorPublishConfig) => gpc.version,
        downloadFiles: () => undefined,
        github: (gom: FernGeneratorExec.GithubOutputMode) => gom.version,
        _other: () => {
            throw new Error("Unrecognized output mode.");
        }
    });
}
export function generatePathTemplate(
    templateString: string,
    pathParameters: PathParameter[],
    basePath?: HttpPath
): string {
    if (basePath === undefined) {
        return "";
    }
    let pathParametersTemplate = basePath.head;
    for (let i = 0; i < basePath.parts.length; i++) {
        const pathPart = pathParameters[i];
        if (pathPart === undefined) {
            continue;
        }
        pathParametersTemplate = pathParametersTemplate.concat(
            `${format(templateString, pathPart.name.snakeCase.safeName)}${basePath.parts[i]?.tail ?? ""}`
        );
    }
    // Strip leading and trailing slashes
    return pathParametersTemplate.replaceAll(/^\/+|\/+$/g, "");
}
