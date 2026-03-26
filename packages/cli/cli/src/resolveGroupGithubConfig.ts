import { FernToken } from "@fern-api/auth";
import { isGithubSelfhosted } from "@fern-api/configuration-loader";
import { getFiddleOrigin } from "@fern-api/core";
import { replaceEnvVariables } from "@fern-api/core-utils";
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
    apiWorkspace: string | undefined,
    fernToken?: FernToken
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

    const resolveEnv = <T>(value: T): T =>
        replaceEnvVariables(value, {
            onError: (message) => cliContext.failAndThrow(message)
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
        let token: string | undefined = process.env.GITHUB_TOKEN;

        if (token != null) {
            cliContext.logger.info(
                `Using repository config from group "${groupName}" generator "${generatorWithRepo.name}". Using GITHUB_TOKEN from environment.`
            );
        } else if (fernToken != null) {
            token = await fetchInstallationToken(cliContext, githubConfig.repository, fernToken);
        } else {
            cliContext.logger.info(
                `Using repository config from group "${groupName}" generator "${generatorWithRepo.name}".`
            );
        }

        return {
            githubRepo: githubConfig.repository,
            token,
            mode: githubConfig.mode === "push" ? "push" : "pull-request",
            branch: "branch" in githubConfig ? githubConfig.branch : undefined
        };
    }

    return cliContext.failAndThrow(`No generator in group "${groupName}" has a github configuration.`);
}

async function fetchInstallationToken(
    cliContext: CliContext,
    repository: string,
    fernToken: FernToken
): Promise<string | undefined> {
    // Parse "owner/repo" from the repository string (may include github.com prefix)
    const parts = repository
        .replace(/^https?:\/\//, "")
        .replace(/\.git$/, "")
        .split("/");
    const owner = parts.length >= 2 ? parts[parts.length - 2] : undefined;
    const repo = parts.length >= 2 ? parts[parts.length - 1] : undefined;

    if (owner == null || repo == null) {
        cliContext.logger.debug(`Could not parse owner/repo from repository: ${repository}`);
        return undefined;
    }

    try {
        const fiddleOrigin = getFiddleOrigin();
        const response = await fetch(`${fiddleOrigin}/api/remote-gen/github/installation-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${fernToken.value}`
            },
            body: JSON.stringify({ owner, repo })
        });

        if (!response.ok) {
            const body = await response.text();
            cliContext.logger.debug(`Failed to get installation token from Fiddle (${response.status}): ${body}`);
            return undefined;
        }

        const data = (await response.json()) as { token: string };
        cliContext.logger.info("Using Fern GitHub App installation token.");
        return data.token;
    } catch (error) {
        cliContext.logger.debug(`Failed to fetch installation token from Fiddle: ${error}`);
        return undefined;
    }
}
