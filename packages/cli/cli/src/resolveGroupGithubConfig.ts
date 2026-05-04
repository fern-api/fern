import { isGithubSelfhosted } from "@fern-api/configuration-loader";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { CliError } from "@fern-api/task-context";
import { CliContext } from "./cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons.js";

export interface ResolvedGithubConfig {
    githubRepo: string;
    token: string | undefined;
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
        return cliContext.failAndThrow("No API workspace found.", undefined, { code: CliError.Code.ConfigError });
    }

    const generatorsConfig = workspace.generatorsConfiguration;
    if (generatorsConfig == null) {
        return cliContext.failAndThrow("No generators.yml found in workspace.", undefined, {
            code: CliError.Code.ConfigError
        });
    }

    const group = generatorsConfig.groups.find((g) => g.groupName === groupName);
    if (group == null) {
        const available = generatorsConfig.groups.map((g) => g.groupName).join(", ");
        return cliContext.failAndThrow(`Group "${groupName}" not found. Available groups: ${available}`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    const resolveEnv = <T>(value: T): T =>
        replaceEnvVariables(value, {
            onError: (message) => cliContext.failAndThrow(message, undefined, { code: CliError.Code.ConfigError })
        });

    // 1. Prefer self-hosted config (has uri + token)
    const generatorWithSelfhosted = group.generators.find(
        (g) => g.raw?.github != null && isGithubSelfhosted(g.raw.github)
    );

    if (generatorWithSelfhosted?.raw?.github != null && isGithubSelfhosted(generatorWithSelfhosted.raw.github)) {
        const githubConfig = resolveEnv(generatorWithSelfhosted.raw.github);
        cliContext.logger.info(
            `Using github config from group "${groupName}" generator "${generatorWithSelfhosted.name}" (mode: ${githubConfig.mode ?? "pull-request"})`
        );
        return {
            githubRepo: githubConfig.uri,
            token: githubConfig.token,
            mode: githubConfig.mode === "push" ? "push" : "pull-request",
            branch: githubConfig.branch
        };
    }

    // 2. Fallback to repository-based config (pull-request, push, commit-and-release)
    const generatorWithRepo = group.generators.find((g) => g.raw?.github != null && "repository" in g.raw.github);

    if (generatorWithRepo?.raw?.github != null && "repository" in generatorWithRepo.raw.github) {
        const githubConfig = resolveEnv(generatorWithRepo.raw.github);
        const token = process.env.GITHUB_TOKEN;

        cliContext.logger.info(
            `Using repository config from group "${groupName}" generator "${generatorWithRepo.name}"` +
                (token != null ? ". Using GITHUB_TOKEN from environment." : ".")
        );

        return {
            githubRepo: githubConfig.repository,
            token,
            mode: githubConfig.mode === "push" ? "push" : "pull-request",
            branch: "branch" in githubConfig ? githubConfig.branch : undefined
        };
    }

    return cliContext.failAndThrow(`No generator in group "${groupName}" has a github configuration.`, undefined, {
        code: CliError.Code.ConfigError
    });
}
