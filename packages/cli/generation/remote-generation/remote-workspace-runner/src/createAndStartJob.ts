import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { relative } from "path";
import { create as createTar } from "tar";
import tmp from "tmp-promise";
import urlJoin from "url-join";

import { FernToken } from "@fern-api/auth";
import {
    DEFINITION_DIRECTORY,
    FERN_DIRECTORY,
    PROJECT_CONFIG_FILENAME,
    ROOT_API_FILENAME,
    fernConfigJson,
    generatorsYml
} from "@fern-api/configuration";
import { createFiddleService, getFiddleOrigin } from "@fern-api/core";
import { AbsoluteFilePath, RelativeFilePath, dirname, join, stringifyLargeObject } from "@fern-api/fs-utils";
import {
    migrateIntermediateRepresentationForGenerator,
    migrateIntermediateRepresentationToVersionForGenerator
} from "@fern-api/ir-migrations";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernDefinition, FernWorkspace } from "@fern-api/workspace-loader";

import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { Fetcher } from "@fern-fern/fiddle-sdk/core";

export async function createAndStartJob({
    projectConfig,
    workspace,
    organization,
    intermediateRepresentation,
    generatorInvocation,
    version,
    context,
    shouldLogS3Url,
    token,
    whitelabel,
    irVersionOverride,
    absolutePathToPreview
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: FernWorkspace;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    irVersionOverride: string | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const job = await createJob({
        projectConfig,
        workspace,
        organization,
        generatorInvocation,
        version,
        context,
        shouldLogS3Url,
        token,
        whitelabel,
        absolutePathToPreview
    });
    await startJob({ intermediateRepresentation, job, context, generatorInvocation, irVersionOverride });
    return job;
}

async function createJob({
    projectConfig,
    workspace,
    organization,
    generatorInvocation,
    version,
    context,
    shouldLogS3Url,
    token,
    whitelabel,
    absolutePathToPreview
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: FernWorkspace;
    organization: string;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const remoteGenerationService = createFiddleService({ token: token.value });

    const generatorConfig: FernFiddle.GeneratorConfigV2 = {
        id: generatorInvocation.name,
        version: generatorInvocation.version,
        outputMode: generatorInvocation.outputMode,
        customConfig: generatorInvocation.config,
        publishMetadata: generatorInvocation.publishMetadata
    };

    let fernDefinitionMetadata: FernFiddle.remoteGen.FernDefinitionMetadata | undefined;
    // Only write definition if output mode is github
    if (generatorInvocation.outputMode.type.startsWith("github")) {
        try {
            const tmpDir = await tmp.dir();

            const absolutePathToTmpDir = AbsoluteFilePath.of(tmpDir.path);
            context.logger.debug(`Writing mock fern definition to ${absolutePathToTmpDir}`);

            const absolutePathToTmpFernDirectory = join(absolutePathToTmpDir, RelativeFilePath.of(FERN_DIRECTORY));
            const absolutePathToTmpDefinitionDirectory = join(
                absolutePathToTmpFernDirectory,
                RelativeFilePath.of(DEFINITION_DIRECTORY)
            );
            await mkdir(absolutePathToTmpDefinitionDirectory, { recursive: true });

            // write api.yml
            const absolutePathToApiYml = join(
                absolutePathToTmpDefinitionDirectory,
                RelativeFilePath.of(ROOT_API_FILENAME)
            );
            await writeFile(absolutePathToApiYml, yaml.dump(workspace.definition.rootApiFile.contents));
            // write definition
            await writeFernDefinition({
                absolutePathToDefinitionDirectory: absolutePathToTmpDefinitionDirectory,
                definition: workspace.definition
            });
            // write fern.config.json
            const absolutePathToFernConfigJson = join(
                absolutePathToTmpFernDirectory,
                RelativeFilePath.of(PROJECT_CONFIG_FILENAME)
            );
            await writeFile(absolutePathToFernConfigJson, JSON.stringify(projectConfig.rawConfig, undefined, 2));
            // write sources
            // TODO: We need handle what happens with source files outside of the fern directory
            try {
                const sources = workspace.getSources();
                for (const source of sources) {
                    const sourceContents = await readFile(source.absoluteFilePath);
                    const relativeLocation = relative(workspace.absoluteFilePath, source.absoluteFilePath);
                    const absolutePathToSourceFile = join(
                        absolutePathToTmpFernDirectory,
                        RelativeFilePath.of(relativeLocation)
                    );
                    // Make sure the directory exists
                    await mkdir(dirname(absolutePathToSourceFile), { recursive: true });

                    await writeFile(absolutePathToSourceFile, new Uint8Array(sourceContents));
                }
            } catch (error) {
                context.logger.debug(`Failed to write source files to disk, continuing: ${error}`);
            }

            const tarPath = join(absolutePathToTmpDir, RelativeFilePath.of("definition.tgz"));
            await createTar({ file: tarPath, cwd: absolutePathToTmpFernDirectory }, ["."]);

            // Upload definition to S3
            context.logger.debug("Getting upload URL for Fern definition.");
            const definitionUploadUrlRequest = await remoteGenerationService.remoteGen.getDefinitionUploadUrl({
                apiName: workspace.definition.rootApiFile.contents.name,
                organizationName: organization,
                version
            });

            if (!definitionUploadUrlRequest.ok) {
                if (definitionUploadUrlRequest.error.content.reason === "status-code") {
                    context.logger.debug(
                        `Failed with status-code to get upload URL with status code ${definitionUploadUrlRequest.error.content.statusCode}, continuing: ${definitionUploadUrlRequest.error.content.body}`
                    );
                } else if (definitionUploadUrlRequest.error.content.reason === "non-json") {
                    context.logger.debug(
                        `Failed with non-json to get upload URL with status code ${definitionUploadUrlRequest.error.content.statusCode}, continuing: ${definitionUploadUrlRequest.error.content.rawBody}`
                    );
                } else if (definitionUploadUrlRequest.error.content.reason === "unknown") {
                    context.logger.debug(
                        `Failed to get upload URL as unknown error occurred continuing: ${definitionUploadUrlRequest.error.content.errorMessage}`
                    );
                }
            } else {
                context.logger.debug("Uploading definition...");
                await axios.put(definitionUploadUrlRequest.body.s3Url, await readFile(tarPath));

                // Create definition metadata
                fernDefinitionMetadata = {
                    definitionS3DownloadUrl: definitionUploadUrlRequest.body.s3Url,
                    outputPath: ".mock",
                    cliVersion: projectConfig.version
                };
            }
        } catch (error) {
            context.logger.debug(`Failed to upload definition to S3, continuing: ${error}`);
        }
    }

    const createResponse = await remoteGenerationService.remoteGen.createJobV3({
        apiName: workspace.definition.rootApiFile.contents.name,
        version,
        organizationName: organization,
        generators: [generatorConfig],
        uploadToS3: shouldUploadToS3({
            outputMode: generatorInvocation.outputMode,
            generatorInvocation,
            absolutePathToPreview,
            shouldLogS3Url
        }),
        whitelabel,
        fernDefinitionMetadata,
        preview: absolutePathToPreview != null
    });

    if (!createResponse.ok) {
        return convertCreateJobError(createResponse.error as unknown as Fetcher.Error)._visit({
            illegalApiNameError: () => {
                return context.failAndThrow("API name is invalid: " + workspace.definition.rootApiFile.contents.name);
            },
            illegalApiVersionError: () => {
                return context.failAndThrow("API version is invalid: " + version);
            },
            cannotPublishToNpmScope: ({ validScope, invalidScope }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidScope} (expected ${validScope})`
                );
            },
            cannotPublishToMavenGroup: ({ validGroup, invalidGroup }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidGroup} (expected ${validGroup})`
                );
            },
            cannotPublishPypiPackage: ({ validPrefix, invalidPackageName }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidPackageName} (expected ${validPrefix})`
                );
            },
            generatorsDoNotExistError: (value) => {
                return context.failAndThrow(
                    "Generators do not exist: " +
                        value.nonExistentGenerators
                            .map((generator) => `${generator.id}@${generator.version}`)
                            .join(", ")
                );
            },
            insufficientPermissions: () => {
                return context.failAndThrow("Insufficient permissions.");
            },
            orgNotConfiguredForWhitelabel: () => {
                return context.failAndThrow(
                    "Your org is not configured for white-labeling. Please reach out to support@buildwithfern.com."
                );
            },
            _other: (content) => {
                return context.failAndThrow("Failed to create job", content);
            }
        });
    }

    return createResponse.body;
}

async function writeFernDefinition({
    absolutePathToDefinitionDirectory,
    definition
}: {
    absolutePathToDefinitionDirectory: AbsoluteFilePath;
    definition: FernDefinition;
}): Promise<void> {
    // write *.yml
    for (const [relativePath, definitionFile] of Object.entries(definition.namedDefinitionFiles)) {
        const absolutePathToDefinitionFile = join(absolutePathToDefinitionDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absolutePathToDefinitionFile), { recursive: true });
        await writeFile(absolutePathToDefinitionFile, yaml.dump(definitionFile.contents));
    }
    // write __package__.yml
    for (const [relativePath, packageMarker] of Object.entries(definition.packageMarkers)) {
        if (packageMarker.contents.export == null) {
            const absolutePathToPackageMarker = join(
                absolutePathToDefinitionDirectory,
                RelativeFilePath.of(relativePath)
            );
            await mkdir(dirname(absolutePathToPackageMarker), { recursive: true });
            await writeFile(absolutePathToPackageMarker, yaml.dump(packageMarker.contents));
        }
    }
    // write imported definitions
    for (const [relativePath, importedDefinition] of Object.entries(definition.importedDefinitions)) {
        await writeFernDefinition({
            absolutePathToDefinitionDirectory: join(
                absolutePathToDefinitionDirectory,
                RelativeFilePath.of(relativePath)
            ),
            // TODO write with the defaulted url
            definition: importedDefinition.definition
        });
    }
}

async function startJob({
    intermediateRepresentation,
    generatorInvocation,
    job,
    context,
    irVersionOverride
}: {
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    job: FernFiddle.remoteGen.CreateJobResponse;
    context: TaskContext;
    irVersionOverride: string | undefined;
}): Promise<void> {
    const migratedIntermediateRepresentation =
        irVersionOverride == null
            ? await migrateIntermediateRepresentationForGenerator({
                  intermediateRepresentation,
                  context,
                  targetGenerator: {
                      name: generatorInvocation.name,
                      version: generatorInvocation.version
                  }
              })
            : await migrateIntermediateRepresentationToVersionForGenerator({
                  intermediateRepresentation,
                  context,
                  irVersion: irVersionOverride,
                  targetGenerator: {
                      name: generatorInvocation.name,
                      version: generatorInvocation.version
                  }
              });

    const formData = new FormData();

    const irAsString = await stringifyLargeObject(migratedIntermediateRepresentation, {
        onWrite: (irFilepath) => {
            context.logger.debug("Wrote IR to disk: " + irFilepath);
        }
    });
    formData.append("file", irAsString);

    const url = urlJoin(getFiddleOrigin(), `/api/remote-gen/jobs/${job.jobId}/start`);
    try {
        await axios.post(url, formData, {
            headers: formData.getHeaders(),
            // HACK: the IR should be more compact and scale linearly with API size
            maxBodyLength: Infinity
        });
    } catch (error) {
        const errorBody = error instanceof AxiosError ? error.response?.data : error;
        context.logger.debug(`POST ${url} failed with ${JSON.stringify(error)}`);
        context.failAndThrow("Failed to start job", errorBody);
    }
}

// Fiddle is on the old version of error serialization. Until we upgrade the
// java generator to support the new implementation, we manually migrate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertCreateJobError(error: any): FernFiddle.remoteGen.createJobV3.Error {
    if (error?.reason === "status-code") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = error.body as any;
        switch (body?._error) {
            case "IllegalApiNameError":
                return FernFiddle.remoteGen.createJobV3.Error.illegalApiNameError();
            case "GeneratorsDoNotExistError":
                return FernFiddle.remoteGen.createJobV3.Error.generatorsDoNotExistError(body.body);
            case "CannotPublishToNpmScope":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishToNpmScope(body.body);
            case "CannotPublishToMavenScope":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishToMavenGroup(body.body);
            case "InsufficientPermissions":
                return FernFiddle.remoteGen.createJobV3.Error.insufficientPermissions(body.body);
        }
    }
    return error;
}

function shouldUploadToS3({
    outputMode,
    generatorInvocation,
    absolutePathToPreview,
    shouldLogS3Url
}: {
    outputMode: FernFiddle.OutputMode;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    shouldLogS3Url: boolean;
}): boolean {
    return (
        outputMode.type === "downloadFiles" ||
        generatorInvocation.absolutePathToLocalSnippets != null ||
        absolutePathToPreview != null ||
        shouldLogS3Url
    );
}
