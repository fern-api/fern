import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class GitHubConfigBuilder {
    public build({
        context,
        remote,
        branch
    }: {
        context: SdkGeneratorContext;
        remote: FernGeneratorCli.Remote.Github;
        branch?: string;
    }): FernGeneratorCli.GitHubConfig {
        return {
            // TODO: can we get the output directory from the sdk generator context?
            sourceDirectory: "fern/output",
            uri: remote.repoUrl,
            token: remote.installationToken,
            branch: branch || undefined
        };
    }
}
