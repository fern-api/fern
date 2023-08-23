import { createOrganizationIfDoesNotExist, FernToken } from "@fern-api/auth";
import { Project } from "@fern-api/project-loader";
import { createFiddleService } from "@fern-api/services";
import { YAML_SCHEMA_VERSION } from "@fern-api/yaml-schema";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { readFile } from "fs/promises";
import path from "path";
import tar from "tar";
import tmp from "tmp-promise";
import { CliContext } from "../../cli-context/CliContext";

export async function registerWorkspacesV1({
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
    if (token.type === "user") {
        await cliContext.runTask(async (context) => {
            await createOrganizationIfDoesNotExist({
                organization: project.config.organization,
                token,
                context,
            });
        });
    }

    const fiddle = createFiddleService({ token: token.value });
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "openapi") {
                    context.failWithoutThrowing("Registering from OpenAPI not currently supported.");
                    return;
                }
                const registerApiResponse = await fiddle.definitionRegistry.registerUsingOrgToken({
                    apiId: FernFiddle.ApiId(workspace.definition.rootApiFile.contents.name),
                    version,
                    cliVersion: cliContext.environment.packageVersion,
                    yamlSchemaVersion: `${YAML_SCHEMA_VERSION}`,
                });
                if (!registerApiResponse.ok) {
                    registerApiResponse.error._visit({
                        versionAlreadyExists: () => {
                            context.failAndThrow(`Version ${version ?? ""} is already registered`);
                        },
                        _other: (value) => {
                            context.failAndThrow("Failed to register", value);
                        },
                    });
                    return;
                }

                const tmpDir = await tmp.dir();
                const tarPath = path.join(tmpDir.path, "definition.tgz");

                context.logger.debug(`Compressing definition at ${tmpDir.path}`);
                await tar.create({ file: tarPath, cwd: workspace.absoluteFilepath }, ["."]);

                context.logger.info("Uploading definition...");
                await axios.put(registerApiResponse.body.definitionS3UploadUrl, await readFile(tarPath));

                context.logger.info(
                    `Registered @${project.config.organization}/${workspace.definition.rootApiFile.contents.name}:${registerApiResponse.body.version}`
                );
            });
        })
    );
}
