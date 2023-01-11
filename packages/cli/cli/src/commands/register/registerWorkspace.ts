import { createOrganizationIfDoesNotExist, FernToken } from "@fern-api/auth";
import { LogLevel } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";
import { createFiddleService } from "@fern-api/services";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { readFile } from "fs/promises";
import path from "path";
import tar from "tar";
import tmp from "tmp-promise";
import { CliContext } from "../../cli-context/CliContext";

export async function registerApiDefinitions({
    project,
    cliContext,
    token,
    version,
}: {
    project: Project;
    cliContext: CliContext;
    token: FernToken;
    version: string | undefined;
}): Promise<void> {
    await cliContext.runTask(async (context) => {
        await createOrganizationIfDoesNotExist({
            organization: project.config.organization,
            token,
            context,
        });
    });

    const fiddle = createFiddleService({ token: token.value });
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const registerApiResponse = await fiddle.definitionRegistry.registerUsingOrgToken({
                    apiId: FernFiddle.ApiId(workspace.rootApiFile.name),
                    version,
                    cliVersion: cliContext.environment.packageVersion,
                });
                if (!registerApiResponse.ok) {
                    registerApiResponse.error._visit({
                        versionAlreadyExists: () => {
                            context.failAndThrow(`Version ${version ?? ""} is already registered`);
                        },
                        _other: (value) => {
                            if (cliContext.getLogLevel() === LogLevel.Debug) {
                                context.failAndThrow("Failed to register", value);
                            } else {
                                context.failAndThrow("Failed to register");
                            }
                        },
                    });
                    return;
                }

                const tmpDir = await tmp.dir();
                const tarPath = path.join(tmpDir.path, "definition.tgz");

                context.logger.debug(`Compressing definition at ${tmpDir.path}`);
                await tar.create({ file: tarPath, cwd: workspace.absolutePathToWorkspace }, ["."]);

                context.logger.info("Uploading definition...");
                await axios.put(registerApiResponse.body.definitionS3UploadUrl, await readFile(tarPath));

                context.logger.info(
                    `Registered @${project.config.organization}/${workspace.rootApiFile.name}:${registerApiResponse.body.version}`
                );
            });
        })
    );
}
