import {
    checkVersionDoesNotAlreadyExist,
    computeSemanticVersion,
    detectCiProvider,
    detectInvocationSource,
    getOriginGitCommit,
    getOriginGitCommitIsDirty
} from "@fern-api/api-workspace-commons";
import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createFdrService, createVenusService } from "@fern-api/core";
import { extractErrorMessage, replaceEnvVariables } from "@fern-api/core-utils";
import { FdrAPI, FdrClient } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { dynamic, FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { getOriginalName } from "@fern-api/ir-utils";
import { detectAirGappedMode } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { CliError, InteractiveTaskContext } from "@fern-api/task-context";
import { FernWorkspace, IdentifiableSource } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { createAndStartJob } from "./createAndStartJob.js";
import { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig.js";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus.js";
import { RemoteTaskHandler } from "./RemoteTaskHandler.js";
import { SourceUploader } from "./SourceUploader.js";

export async function runRemoteGenerationForGenerator({
    projectConfig,
    organization,
    workspace,
    interactiveTaskContext,
    generatorInvocation,
    version,
    audiences,
    shouldLogS3Url,
    token,
    whitelabel,
    irVersionOverride,
    absolutePathToPreview,
    isPreview: isPreviewOverride,
    fiddlePreview,
    pushPreviewBranch,
    readme,
    fernignorePath,
    skipFernignore,
    dynamicIrOnly,
    retryRateLimited,
    requireEnvVars,
    automationMode,
    autoMerge,
    skipIfNoDiff,
    loginCommand
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspace: FernWorkspace;
    interactiveTaskContext: InteractiveTaskContext;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    audiences: Audiences;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    irVersionOverride: string | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    /** Controls CLI-side behavior (lenient env vars, skip version check). Falls back to absolutePathToPreview != null. */
    isPreview?: boolean;
    /** When provided, overrides the `preview` flag sent to Fiddle. When omitted, falls back to isPreview. */
    fiddlePreview?: boolean;
    /** When true, tells Fiddle to push a preview branch to the SDK repo. */
    pushPreviewBranch?: boolean;
    readme: generatorsYml.ReadmeSchema | undefined;
    fernignorePath: string | undefined;
    skipFernignore?: boolean;
    dynamicIrOnly: boolean;
    retryRateLimited: boolean;
    requireEnvVars: boolean;
    automationMode?: boolean;
    autoMerge?: boolean;
    skipIfNoDiff?: boolean;
    /**
     * CLI command to reference in auth-failure hints (e.g. 'fern login' for v1,
     * 'fern auth login' for CLI v2). Defaults to 'fern login'.
     */
    loginCommand?: string;
}): Promise<RemoteTaskHandler.Response | undefined> {
    const fdr = createFdrService({ token: token.value });

    const fdrOrigin = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
    const isAirGapped = await detectAirGappedMode(`${fdrOrigin}/health`, interactiveTaskContext.logger);

    const packageName = generatorsYml.getPackageName({ generatorInvocation });

    /** Sugar to substitute templated env vars in a standard way */
    const isPreview = isPreviewOverride ?? absolutePathToPreview != null;

    const substituteEnvVars = <T>(stringOrObject: T) =>
        replaceEnvVariables(
            stringOrObject,
            {
                onError: (e) => {
                    if (!isPreview && requireEnvVars) {
                        interactiveTaskContext.failAndThrow(undefined, e, {
                            code: CliError.Code.EnvironmentError
                        });
                    }
                }
            },
            { substituteAsEmpty: isPreview }
        );

    const generatorInvocationWithEnvVarSubstitutions = substituteEnvVars(generatorInvocation);

    const dynamicGeneratorConfig = getDynamicGeneratorConfig({
        apiName: workspace.definition.rootApiFile.contents.name,
        organization,
        generatorInvocation: generatorInvocationWithEnvVarSubstitutions
    });

    const resolvedVersion = version ?? (await computeSemanticVersion({ packageName, generatorInvocation }));

    // Fail fast if the target version already exists on the package registry.
    // Only check when the user explicitly provided a version (not auto-computed).
    if (version != null) {
        if (isPreview) {
            interactiveTaskContext.logger.warn(
                "Skipping version availability check in preview mode. " +
                    `Version ${version} may already exist on the package registry.`
            );
        } else {
            await checkVersionDoesNotAlreadyExist({
                version,
                packageName,
                generatorInvocation,
                context: interactiveTaskContext
            });
        }
    }

    const ir = generateIntermediateRepresentation({
        workspace,
        generationLanguage: generatorInvocation.language,
        keywords: generatorInvocation.keywords,
        smartCasing: generatorInvocation.smartCasing,
        exampleGeneration: {
            disabled: generatorInvocation.disableExamples,
            skipAutogenerationIfManualExamplesExist: true,
            skipErrorAutogenerationIfManualErrorExamplesExist: false
        },
        audiences,
        readme,
        packageName,
        version: resolvedVersion,
        context: interactiveTaskContext,
        sourceResolver: new SourceResolverImpl(interactiveTaskContext, workspace),
        dynamicGeneratorConfig,
        generationMetadata: {
            cliVersion: workspace.cliVersion,
            generatorName: generatorInvocation.name,
            generatorVersion: generatorInvocation.version,
            generatorConfig: generatorInvocation.config,
            originGitCommit: getOriginGitCommit(),
            originGitCommitIsDirty: getOriginGitCommitIsDirty(),
            invokedBy: detectInvocationSource(),
            requestedVersion: version,
            ciProvider: detectCiProvider()
        }
    });

    const venus = createVenusService({ token: token.value });
    if (!isAirGapped) {
        const orgResponse = await venus.organization.get(projectConfig.organization);

        if (orgResponse.ok) {
            if (orgResponse.body.isWhitelabled) {
                if (ir.readmeConfig == null) {
                    ir.readmeConfig = emptyReadmeConfig;
                }
                ir.readmeConfig.whiteLabel = true;
            }
            ir.selfHosted = orgResponse.body.selfHostedSdKs;
        }
    }

    const sources = workspace.getSources();
    let fdrApiDefinitionId: FdrAPI.ApiDefinitionId | undefined;
    let sourceUploads: Record<FdrAPI.api.v1.register.SourceId, FdrAPI.api.v1.register.SourceUpload> | undefined;

    const apiDefinition = convertIrToFdrApi({
        ir,
        snippetsConfig: {
            typescriptSdk: undefined,
            pythonSdk: undefined,
            javaSdk: undefined,
            rubySdk: undefined,
            goSdk: undefined,
            csharpSdk: undefined,
            phpSdk: undefined,
            swiftSdk: undefined,
            rustSdk: undefined
        },
        context: interactiveTaskContext
    });
    try {
        const response = await fdr.api.register.registerApiDefinition({
            orgId: FdrAPI.OrgId(organization),
            apiId: FdrAPI.ApiId(getOriginalName(ir.apiName)),
            definition: apiDefinition,
            sources: sources.length > 0 ? convertToFdrApiDefinitionSources(sources) : undefined
        });
        fdrApiDefinitionId = response.apiDefinitionId;
        sourceUploads = response.sources ?? undefined;
    } catch (error) {
        const sourceUploader = new SourceUploader(interactiveTaskContext, sources);
        if (sourceUploader.sourceTypes.has("protobuf")) {
            interactiveTaskContext.failAndThrow(`Failed to register API definition: ${JSON.stringify(error)}`);
        }
    }

    const sourceUploader = new SourceUploader(interactiveTaskContext, sources);
    if (sourceUploads == null && sourceUploader.sourceTypes.has("protobuf")) {
        interactiveTaskContext.failAndThrow("Did not successfully upload Protobuf source files.", undefined, {
            code: CliError.Code.NetworkError
        });
    }

    if (sourceUploads != null) {
        interactiveTaskContext.logger.debug("Uploading source files ...");
        const sourceConfig = await sourceUploader.uploadSources(sourceUploads);

        interactiveTaskContext.logger.debug("Setting IR source configuration ...");
        ir.sourceConfig = sourceConfig;
    }

    // handle dynamic-ir-only mode: skip SDK generation and only upload dynamic IR
    if (dynamicIrOnly) {
        interactiveTaskContext.logger.info(
            "Dynamic IR only mode: skipping SDK generation and uploading dynamic IR only"
        );

        if (version == null) {
            interactiveTaskContext.failAndThrow("Version is required for dynamic IR only mode", undefined, {
                code: CliError.Code.ConfigError
            });
            return undefined;
        }

        if (generatorInvocation.language == null) {
            interactiveTaskContext.failAndThrow("Language is required for dynamic IR only mode", undefined, {
                code: CliError.Code.ConfigError
            });
            return undefined;
        }

        if (packageName == null) {
            interactiveTaskContext.failAndThrow("Package name is required for dynamic IR only mode", undefined, {
                code: CliError.Code.ConfigError
            });
            return undefined;
        }

        try {
            await uploadDynamicIRForSdkGeneration({
                fdr,
                organization,
                version,
                language: generatorInvocation.language,
                packageName,
                ir,
                smartCasing: generatorInvocation.smartCasing,
                dynamicGeneratorConfig,
                context: interactiveTaskContext
            });
        } catch (error) {
            interactiveTaskContext.failAndThrow(
                `Failed to upload dynamic IR: ${extractErrorMessage(error)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
        }

        // Return a minimal response since no SDK generation occurred
        return {
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: version,
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        };
    }

    const job = await createAndStartJob({
        projectConfig,
        workspace,
        organization,
        generatorInvocation: generatorInvocationWithEnvVarSubstitutions,
        context: interactiveTaskContext,
        version: resolvedVersion,
        intermediateRepresentation: {
            ...ir,
            fdrApiDefinitionId,
            publishConfig: getPublishConfig({ generatorInvocation: generatorInvocationWithEnvVarSubstitutions })
        },
        shouldLogS3Url,
        token,
        whitelabel: whitelabel != null ? substituteEnvVars(whitelabel) : undefined,
        irVersionOverride,
        absolutePathToPreview,
        fiddlePreview,
        pushPreviewBranch,
        fernignorePath,
        skipFernignore,
        retryRateLimited,
        automationMode,
        autoMerge,
        skipIfNoDiff,
        loginCommand
    });
    interactiveTaskContext.logger.debug(`Job ID: ${job.jobId}`);

    const taskId = job.taskIds[0];
    if (taskId == null) {
        interactiveTaskContext.failAndThrow("Did not receive a task ID.", undefined, {
            code: CliError.Code.NetworkError
        });
        return undefined;
    }
    interactiveTaskContext.logger.debug(`Task ID: ${taskId}`);

    const taskHandler = new RemoteTaskHandler({
        job,
        taskId,
        generatorInvocation,
        interactiveTaskContext,
        absolutePathToPreview
    });

    let result = await pollJobAndReportStatus({
        job,
        taskHandler,
        taskId,
        context: interactiveTaskContext
    });

    // Fall back to the locally-resolved version when Fiddle doesn't echo it back
    // (e.g. GitHub push modes where no registry publish or release tag occurs).
    // Skip the fallback when the version is AUTO — Fiddle determines the real version
    // via AI-based semantic analysis, and resolvedVersion would be the literal "AUTO" string.
    if (result != null && result.actualVersion == null) {
        const fallback = resolveVersionFallback(resolvedVersion);
        if (fallback != null) {
            result = { ...result, actualVersion: fallback };
        }
    }

    // use the actual version from the generation result, fallback to pre-computed version
    const actualVersionForUpload = result?.actualVersion ?? resolvedVersion;

    if (
        result != null &&
        actualVersionForUpload != null &&
        generatorInvocation.language != null &&
        packageName != null &&
        !isPreview
    ) {
        try {
            await uploadDynamicIRForSdkGeneration({
                fdr,
                organization,
                version: actualVersionForUpload,
                language: generatorInvocation.language,
                packageName,
                ir,
                smartCasing: generatorInvocation.smartCasing,
                dynamicGeneratorConfig,
                context: interactiveTaskContext
            });
        } catch (error) {
            interactiveTaskContext.logger.warn(
                `Failed to upload dynamic IR for SDK generation: ${extractErrorMessage(error)}`
            );
        }
    }

    return result;
}

function getPublishConfig({
    generatorInvocation
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
}): FernIr.PublishingConfig | undefined {
    return generatorInvocation.outputMode._visit({
        downloadFiles: () => undefined,
        github: () => undefined,
        githubV2: () => undefined,
        publish: () => undefined,
        publishV2: (value) =>
            value._visit({
                mavenOverride: () => undefined,
                pypiOverride: () => undefined,
                nugetOverride: () => undefined,
                npmOverride: () => undefined,
                rubyGemsOverride: () => undefined,
                cratesOverride: () => undefined,
                postman: (value) => {
                    let collectionId = undefined;
                    if (generatorInvocation.raw?.output?.location === "postman") {
                        collectionId = generatorInvocation.raw.output?.["collection-id"];
                    }
                    return FernIr.PublishingConfig.direct({
                        target: FernIr.PublishTarget.postman({
                            apiKey: value.apiKey,
                            workspaceId: value.workspaceId,
                            collectionId
                        })
                    });
                },
                _other: () => undefined
            }),
        _other: () => undefined
    });
}

function convertToFdrApiDefinitionSources(
    sources: IdentifiableSource[]
): Record<FdrAPI.api.v1.register.SourceId, FdrAPI.api.v1.register.Source> {
    return Object.fromEntries(
        Object.values(sources).map((source) => [
            source.id,
            {
                type: source.type === "protobuf" ? "proto" : source.type
            }
        ])
    );
}

const emptyReadmeConfig: FernIr.ReadmeConfig = {
    defaultEndpoint: undefined,
    bannerLink: undefined,
    introduction: undefined,
    apiReferenceLink: undefined,
    apiName: undefined,
    disabledFeatures: undefined,
    whiteLabel: undefined,
    customSections: undefined,
    features: undefined,
    exampleStyle: undefined
};

async function uploadDynamicIRForSdkGeneration({
    fdr,
    organization,
    version,
    language,
    packageName,
    ir,
    smartCasing,
    dynamicGeneratorConfig,
    context
}: {
    fdr: FdrClient;
    organization: string;
    version: string;
    language: generatorsYml.GenerationLanguage;
    packageName: string;
    ir: IntermediateRepresentation;
    smartCasing: boolean | undefined;
    dynamicGeneratorConfig: dynamic.GeneratorConfig | undefined;
    context: InteractiveTaskContext;
}): Promise<void> {
    context.logger.debug(`Uploading dynamic IR for ${language} SDK...`);

    // Get presigned upload URLs from FDR
    let uploadUrlsResponse;
    try {
        uploadUrlsResponse = await fdr.api.register.getSdkDynamicIrUploadUrls({
            orgId: FdrAPI.OrgId(organization),
            apiId: "",
            irVersions: []
        });
    } catch (error) {
        // Log warning but don't fail the generation - dynamic IR upload is optional
        context.logger.warn(`Failed to get dynamic IR upload URLs: ${error}`);
        return;
    }

    const uploadUrl = uploadUrlsResponse.uploadUrls[language]?.uploadUrl;
    if (uploadUrl == null) {
        context.logger.warn(`No upload URL returned for ${language}`);
        return;
    }

    // Generate the dynamic IR
    const dynamicIR = convertIrToDynamicSnippetsIr({
        ir,
        disableExamples: true,
        smartCasing,
        generationLanguage: language,
        generatorConfig: dynamicGeneratorConfig
    });

    // Upload the dynamic IR to S3
    const dynamicIRJson = JSON.stringify(dynamicIR);
    const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: dynamicIRJson,
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": dynamicIRJson.length.toString()
        }
    });

    if (uploadResponse.ok) {
        context.logger.debug(`Uploaded dynamic IR for ${language}:${packageName} (${version})`);
    } else {
        context.logger.warn(`Failed to upload dynamic IR for ${language}: ${uploadResponse.status}`);
    }
}

/**
 * Returns `resolvedVersion` when it is a concrete version string that should be
 * used as fallback. Returns `undefined` when the version is AUTO (Fiddle owns
 * the final version) or when no version was provided at all.
 */
export function resolveVersionFallback(resolvedVersion: string | undefined): string | undefined {
    if (resolvedVersion == null) {
        return undefined;
    }
    if (resolvedVersion.toUpperCase() === "AUTO") {
        return undefined;
    }
    return resolvedVersion;
}
