import { FernToken } from "@fern-api/auth";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createFiddleService, getFiddleOrigin, getIrVersionForGenerator } from "@fern-api/core";
import { AbsoluteFilePath, dirname, join, RelativeFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import {
    migrateIntermediateRepresentationForGenerator,
    migrateIntermediateRepresentationToVersionForGenerator
} from "@fern-api/ir-migrations";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { CliError, TaskContext } from "@fern-api/task-context";
import { FernDefinition, FernWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { mkdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import urlJoin from "url-join";
import { promisify } from "util";
import { gzip } from "zlib";
import { retryWithRateLimit, TooManyRequestsError } from "./retryWithRateLimit.js";

const gzipAsync = promisify(gzip);

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
    absolutePathToPreview,
    fiddlePreview,
    pushPreviewBranch,
    fernignorePath,
    skipFernignore,
    retryRateLimited,
    automationMode,
    autoMerge
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
    /** When provided, overrides the `preview` flag sent to Fiddle. When omitted, falls back to absolutePathToPreview != null. */
    fiddlePreview?: boolean;
    /** When true, tells Fiddle to push a preview branch to the SDK repo. Requires fiddle-sdk with pushPreviewBranch support. */
    pushPreviewBranch?: boolean;
    fernignorePath: string | undefined;
    skipFernignore?: boolean;
    retryRateLimited: boolean;
    automationMode?: boolean;
    autoMerge?: boolean;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    // Determine fernignore contents:
    // - If --skip-fernignore is set, upload an empty .fernignore so nothing is ignored
    // - If a fernignore path is provided, read it
    // - Otherwise, no fernignore contents
    let fernignoreContents: string | undefined;
    if (skipFernignore) {
        fernignoreContents = "";
    } else if (fernignorePath != null) {
        try {
            fernignoreContents = await readFile(fernignorePath, "utf-8");
        } catch (error) {
            context.failAndThrow(`Failed to read fernignore file at ${fernignorePath}: ${error}`, undefined, {
                code: CliError.Code.ConfigError
            });
        }
    }

    const job = await retryWithRateLimit({
        fn: () =>
            createJob({
                projectConfig,
                workspace,
                organization,
                generatorInvocation,
                version,
                context,
                shouldLogS3Url,
                token,
                whitelabel,
                absolutePathToPreview,
                fiddlePreview,
                pushPreviewBranch,
                fernignoreContents,
                automationMode,
                autoMerge
            }),
        retryRateLimited,
        logger: context.logger,
        onRateLimitedWithoutRetry: () =>
            context.failAndThrow(
                "Received 429 Too Many Requests. Re-run with --retry-rate-limited to automatically retry.",
                undefined,
                { code: CliError.Code.NetworkError }
            )
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
    absolutePathToPreview,
    fiddlePreview,
    pushPreviewBranch,
    fernignoreContents
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
    /** When provided, overrides the `preview` flag sent to Fiddle. When omitted, falls back to absolutePathToPreview != null. */
    fiddlePreview?: boolean;
    /** When true, tells Fiddle to push a preview branch to the SDK repo. Requires fiddle-sdk with pushPreviewBranch support. */
    pushPreviewBranch?: boolean;
    fernignoreContents: string | undefined;
    automationMode?: boolean;
    autoMerge?: boolean;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const remoteGenerationService = createFiddleService({ token: token.value });

    const generatorConfig: FernFiddle.GeneratorConfigV2 = {
        id: generatorInvocation.name,
        version: generatorInvocation.version,
        outputMode: generatorInvocation.outputMode,
        customConfig: generatorInvocation.config,
        publishMetadata: generatorInvocation.publishMetadata
    };

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
        // fiddlePreview overrides what we send to Fiddle as `preview`.
        // For sdk preview: fiddlePreview=false so Fiddle doesn't set dryRun=true
        //   (Fiddle uses `dryRun = generatePreview`, so preview=false → actual publish).
        // For fern generate --preview: fiddlePreview is undefined, falls back to
        //   absolutePathToPreview != null (true) → Fiddle sets dryRun=true → npm publish --dry-run.
        // This is the only mechanism preventing dryRun for sdk preview jobs;
        // Fiddle's dryRun logic is intentionally unchanged.
        preview: fiddlePreview ?? absolutePathToPreview != null,
        pushPreviewBranch,
        fernignoreContents
        // TODO(FER-9671): Pass automation flags to Fiddle once its API is updated:
        //   automationMode,
        //   autoMerge,
        //   runId: process.env.FERN_RUN_ID
        // Fiddle will use these for server-side no-diff detection, separate PRs,
        // automerge, run_id correlation, and breaking change handling.
    });

    if (!createResponse.ok) {
        // Check for 429 Too Many Requests before processing the error through the visitor.
        // This allows the retry wrapper to catch and retry on rate limiting.
        // Note: The fiddle SDK wraps the error inside a `.content` property (see convertCreateJobError below).
        // biome-ignore lint/suspicious/noExplicitAny: the error shape from the SDK is not well-typed
        const rawError = createResponse.error as any;
        if (rawError?.content?.reason === "status-code" && rawError.content.statusCode === 429) {
            throw new TooManyRequestsError();
        }
        return convertCreateJobError(rawError)._visit({
            illegalApiNameError: () => {
                return context.failAndThrow(
                    "API name is invalid: " + workspace.definition.rootApiFile.contents.name,
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            },
            illegalApiVersionError: () => {
                return context.failAndThrow("API version is invalid: " + version, undefined, {
                    code: CliError.Code.ConfigError
                });
            },
            cannotPublishToNpmScope: ({ validScope, invalidScope }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidScope} (expected ${validScope})`,
                    undefined,
                    { code: CliError.Code.AuthError }
                );
            },
            cannotPublishToMavenGroup: ({ validGroup, invalidGroup }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidGroup} (expected ${validGroup})`,
                    undefined,
                    { code: CliError.Code.AuthError }
                );
            },
            cannotPublishPypiPackage: ({ validPrefix, invalidPackageName }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidPackageName} (expected ${validPrefix})`,
                    undefined,
                    { code: CliError.Code.AuthError }
                );
            },
            generatorsDoNotExistError: (value) => {
                return context.failAndThrow(
                    "Generators do not exist: " +
                        value.nonExistentGenerators
                            .map((generator) => `${generator.id}@${generator.version}`)
                            .join(", "),
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            },
            insufficientPermissions: () => {
                return context.failAndThrow(
                    `You do not have permission to run this generator for organization '${organization}'. Please run 'fern login' to ensure you are logged in with the correct account.\n\n` +
                        "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not.",
                    undefined,
                    { code: CliError.Code.AuthError }
                );
            },
            orgNotConfiguredForWhitelabel: () => {
                return context.failAndThrow(
                    "Your org is not configured for white-labeling. Please reach out to support@buildwithfern.com.",
                    undefined,
                    { code: CliError.Code.AuthError }
                );
            },
            branchDoesNotExist: (value) => {
                return context.failAndThrow(
                    `Branch ${value.branch} does not exist in repository ${value.repositoryOwner}/${value.repositoryName}`,
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            },
            rateLimitExceeded: () => {
                // Rate limits are normally caught by the raw 429 status code check above (line 191).
                // This handler satisfies the exhaustive visitor type and acts as a fallback.
                throw new TooManyRequestsError();
            },
            _other: (content) => {
                context.logger.debug(`Failed to create job: ${JSON.stringify(content)}`);
                // Try to extract a descriptive error message from the response body
                const errorMessage = extractErrorMessage(content);
                if (errorMessage != null) {
                    return context.failAndThrow(errorMessage, undefined, { code: CliError.Code.NetworkError });
                }
                return context.failAndThrow(
                    "Failed to create job. Please try again or contact support@buildwithfern.com for assistance.",
                    undefined,
                    { code: CliError.Code.NetworkError }
                );
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
    const irVersionFromFdr = await getIrVersionForGenerator(generatorInvocation).then((version) =>
        version == null ? undefined : "v" + version.toString()
    );
    const resolvedIrVersionOverride = irVersionOverride ?? irVersionFromFdr;
    const migratedIntermediateRepresentation =
        resolvedIrVersionOverride == null
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
                  irVersion: resolvedIrVersionOverride,
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
    const irBytes = new TextEncoder().encode(irAsString);
    const compressed = await gzipAsync(irBytes);
    context.logger.debug(
        `Compressed IR from ${irBytes.byteLength} bytes to ${compressed.length} bytes ` +
            `(${((1 - compressed.length / irBytes.byteLength) * 100).toFixed(1)}% reduction)`
    );
    formData.append("file", compressed, { filename: "ir.json", contentType: "application/octet-stream" });

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
        context.failAndThrow("Failed to start job", errorBody, { code: CliError.Code.NetworkError });
    }
}

/**
 * Attempts to extract a human-readable error message from the raw error response body.
 * Fiddle's ErrorBody serializes as { error: "...", content: { message: "..." } }.
 * The SDK wraps this as { content: { reason: "status-code", body: <ErrorBody> } }.
 * Returns undefined if no message could be extracted.
 */
// biome-ignore lint/suspicious/noExplicitAny: the error shape from the SDK is not well-typed
function extractErrorMessage(error: any): string | undefined {
    const body = error?.content?.reason === "status-code" ? error.content.body : undefined;
    if (typeof body?.content?.message === "string") {
        return body.content.message;
    }
    // Direct message field on the body (fallback)
    if (typeof body?.message === "string") {
        return body.message;
    }
    return undefined;
}

// Fiddle's ErrorBody serializes as { error: "<ErrorType>", content: <TypedBody> }.
// The SDK wraps this in { content: { reason: "status-code", body: <ErrorBody> } }.
// We manually convert to typed errors so the _visit handlers can provide specific messages.
// biome-ignore lint/suspicious/noExplicitAny: allow explicit any
function convertCreateJobError(error: any): FernFiddle.remoteGen.createJobV3.Error {
    if (error?.content?.reason === "status-code") {
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        const body = error.content.body as any;
        switch (body?.error) {
            case "IllegalApiNameError":
                return FernFiddle.remoteGen.createJobV3.Error.illegalApiNameError();
            case "IllegalApiVersionError":
                return FernFiddle.remoteGen.createJobV3.Error.illegalApiVersionError(body.content);
            case "GeneratorsDoNotExistError":
                return FernFiddle.remoteGen.createJobV3.Error.generatorsDoNotExistError(body.content);
            case "CannotPublishToNpmScope":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishToNpmScope(body.content);
            case "CannotPublishToMavenScope":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishToMavenGroup(body.content);
            case "CannotPublishPypiPackage":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishPypiPackage(body.content);
            case "InsufficientPermissions":
                return FernFiddle.remoteGen.createJobV3.Error.insufficientPermissions(body.content);
            case "OrgNotConfiguredForWhitelabel":
                return FernFiddle.remoteGen.createJobV3.Error.orgNotConfiguredForWhitelabel(body.content);
            case "BranchDoesNotExist":
                return FernFiddle.remoteGen.createJobV3.Error.branchDoesNotExist(body.content);
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
