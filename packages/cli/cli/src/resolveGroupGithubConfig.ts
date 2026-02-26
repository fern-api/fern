import { isGithubSelfhosted } from "@fern-api/configuration-loader";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { CliContext } from "./cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons.js";

export interface ResolvedGithubConfig {
    githubRepo: string;
    token: string;
    mode: "push" | "pull-request";
    branch: string | undefined;
}

export async function resolveGroupGithubConfig(
    cliContext: CliContext,
    groupName: string,
    apiWorkspace: string | undefined
): Promise<ResolvedGithubConfig> {
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: apiWorkspace,
        defaultToAllApiWorkspaces: false
    });

    const workspace = project.apiWorkspaces[0];
    if (workspace == null) {
        return cliContext.failAndThrow("No API workspace found.");
    }

    const generatorsConfig = workspace.generatorsConfiguration;
    if (generatorsConfig == null) {
        return cliContext.failAndThrow("No generators.yml found in workspace.");
    }

    const group = generatorsConfig.groups.find((g) => g.groupName === groupName);
    if (group == null) {
        const available = generatorsConfig.groups.map((g) => g.groupName).join(", ");
        return cliContext.failAndThrow(`Group "${groupName}" not found. Available groups: ${available}`);
    }

    const generatorWithGithub = group.generators.find((g) => g.raw?.github != null && isGithubSelfhosted(g.raw.github));

    if (generatorWithGithub?.raw?.github == null || !isGithubSelfhosted(generatorWithGithub.raw.github)) {
        return cliContext.failAndThrow(
            `No generator in group "${groupName}" has a self-hosted github configuration (uri + token).`
        );
    }

    const resolveEnv = <T>(value: T): T =>
        replaceEnvVariables(value, {
            onError: (message) => cliContext.failAndThrow(message)
        });
    const githubConfig = resolveEnv(generatorWithGithub.raw.github);

    cliContext.logger.info(
        `Using github config from group "${groupName}" generator "${generatorWithGithub.name}" (mode: ${githubConfig.mode ?? "pull-request"})`
    );

    return {
        githubRepo: githubConfig.uri,
        token: githubConfig.token,
        mode: githubConfig.mode === "push" ? "push" : "pull-request",
        branch: githubConfig.branch
    };
}
