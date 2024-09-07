import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

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
