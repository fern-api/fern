import { FernToken } from "@fern-api/auth";
import { generatorsYml } from "@fern-api/configuration-loader";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { normalizeRepoUrlToHttps } from "@fern-api/remote-workspace-runner";
import { CliError, TaskContext, TaskResult } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

import { detectCISource, detectDeployerAuthor } from "../../utils/environment.js";
import { deployHostedMcpServer, type GitProvenance } from "../mcp/deployMcpServer.js";

export interface FernHostedOutputAssignment {
    group: generatorsYml.GeneratorGroup;
    /** Temp dirs created by this call (never user-supplied local-file-system paths). */
    temporaryDirectories: AbsoluteFilePath[];
}

/**
 * fern-hosted invocations have no user-facing output path: generation lands in a
 * managed temp directory, and the generated bundle is deployed from there once
 * the group finishes.
 */
export async function assignFernHostedOutputDirectories(
    group: generatorsYml.GeneratorGroup
): Promise<FernHostedOutputAssignment> {
    const temporaryDirectories: AbsoluteFilePath[] = [];
    const generators = await Promise.all(
        group.generators.map(async (generator) => {
            if (generator.fernHostedOutput == null || generator.absolutePathToLocalOutput != null) {
                return generator;
            }
            const outputDirectory = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-hosted-mcp-")));
            temporaryDirectories.push(outputDirectory);
            return { ...generator, absolutePathToLocalOutput: outputDirectory };
        })
    );
    return {
        group: { ...group, generators },
        temporaryDirectories
    };
}

export async function removeFernHostedOutputDirectories(
    directories: AbsoluteFilePath[],
    logger: Logger
): Promise<void> {
    await Promise.all(
        directories.map(async (directory) => {
            try {
                await rm(directory, { recursive: true, force: true });
            } catch (error) {
                logger.debug(`Failed to remove temporary fern-hosted output directory ${directory}: ${String(error)}`);
            }
        })
    );
}

export async function deployFernHostedOutputs({
    group,
    workspace,
    organization,
    cliVersion,
    token,
    absolutePathToPreview,
    requireEnvVars,
    context
}: {
    group: generatorsYml.GeneratorGroup;
    workspace: AbstractAPIWorkspace<unknown>;
    organization: string;
    cliVersion: string;
    token: FernToken | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    requireEnvVars: boolean;
    context: TaskContext;
}): Promise<void> {
    const fernHostedGenerators = group.generators.filter((generator) => generator.fernHostedOutput != null);
    if (fernHostedGenerators.length === 0) {
        return;
    }
    if (absolutePathToPreview != null) {
        context.logger.debug("Skipping hosted MCP server deploy in preview mode.");
        return;
    }
    if (context.getResult() === TaskResult.Failure) {
        context.logger.warn("Skipping hosted MCP server deploy because generation failed.");
        return;
    }
    if (token == null) {
        return context.failAndThrow(
            "Deploying to Fern's hosted MCP platform requires authentication. Run `fern login` or set FERN_TOKEN.",
            undefined,
            { code: CliError.Code.AuthError }
        );
    }
    const ciSource = detectCISource();
    const deployerAuthor = detectDeployerAuthor();
    const git: GitProvenance | undefined =
        ciSource?.repo != null && ciSource?.branch != null
            ? {
                  repoUrl: normalizeRepoUrlToHttps(ciSource.repo, ciSource.type),
                  branch: ciSource.branch,
                  commitSha: ciSource.commitSha
              }
            : undefined;
    for (const generator of fernHostedGenerators) {
        const bundleDir = generator.absolutePathToLocalOutput;
        if (bundleDir == null) {
            continue;
        }
        const slug =
            generator.fernHostedOutput?.slug == null
                ? undefined
                : replaceEnvVariables(generator.fernHostedOutput.slug, {
                      onError: (message) => {
                          if (requireEnvVars) {
                              context.failAndThrow(message, undefined, { code: CliError.Code.ConfigError });
                          }
                      }
                  });
        await context.runInteractiveTask({ name: `deploy ${generator.name}` }, async (deployContext) => {
            await deployHostedMcpServer({
                bundleDir,
                organization,
                slug,
                token: token.value,
                generatorName: generator.name,
                generatorVersion: generator.version,
                cliVersion,
                config: generator.config,
                git,
                ciSource,
                deployerAuthor,
                context: deployContext
            });
        });
    }
}
