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

export function getPackageName(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    return config.output.mode._visit<string | undefined>({
        publish: (gpc: FernGeneratorExec.GeneratorPublishConfig) =>
            gpc.publishTarget?._visit({
                maven: (mrc: FernGeneratorExec.MavenRegistryConfigV2) => mrc.coordinate,
                npm: (nrc: FernGeneratorExec.NpmRegistryConfigV2) => nrc.packageName,
                pypi: (prc: FernGeneratorExec.PypiRegistryConfig) => prc.packageName,
                rubygems: (rgrc: FernGeneratorExec.RubyGemsRegistryConfig) => rgrc.packageName,
                nuget: (nrc: FernGeneratorExec.NugetRegistryConfig) => nrc.packageName,
                postman: () => undefined,
                _other: () => undefined
            }),
        downloadFiles: () => undefined,
        github: (gom: FernGeneratorExec.GithubOutputMode) =>
            gom.publishInfo?._visit({
                maven: (mrc: FernGeneratorExec.MavenGithubPublishInfo) => mrc.coordinate,
                npm: (nrc: FernGeneratorExec.NpmGithubPublishInfo) => nrc.packageName,
                pypi: (prc: FernGeneratorExec.PypiGithubPublishInfo) => prc.packageName,
                rubygems: (rgrc: FernGeneratorExec.RubyGemsGithubPublishInfo) => rgrc.packageName,
                nuget: (nrc: FernGeneratorExec.NugetGithubPublishInfo) => nrc.packageName,
                postman: () => undefined,
                _other: () => undefined
            }),
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
