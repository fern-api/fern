import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createFdrService, createVenusService } from "@fern-api/core";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { FdrAPI, FdrClient } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr } from "@fern-api/ir-sdk";
import { convertIrToFdrApi } from "@fern-api/register";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import { FernWorkspace, IdentifiableSource } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { createAndStartJob } from "./createAndStartJob";
import { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";
import { RemoteTaskHandler } from "./RemoteTaskHandler";
import { SourceUploader } from "./SourceUploader";

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
    readme
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
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<RemoteTaskHandler.Response | undefined> {
    const fdr = createFdrService({ token: token.value });

    const packageName = generatorsYml.getPackageName({ generatorInvocation });

    /** Sugar to substitute templated env vars in a standard way */
    const isPreview = absolutePathToPreview != null;

    const substituteEnvVars = <T>(stringOrObject: T) =>
        replaceEnvVariables(
            stringOrObject,
            { onError: (e) => interactiveTaskContext.failAndThrow(e) },
            { substituteAsEmpty: isPreview }
        );

    const generatorInvocationWithEnvVarSubstitutions = substituteEnvVars(generatorInvocation);

    const dynamicGeneratorConfig = getDynamicGeneratorConfig({
        apiName: workspace.definition.rootApiFile.contents.name,
        organization,
        generatorInvocation: generatorInvocationWithEnvVarSubstitutions
    });

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
        version: version ?? (await computeSemanticVersion({ fdr, packageName, generatorInvocation })),
        context: interactiveTaskContext,
        sourceResolver: new SourceResolverImpl(interactiveTaskContext, workspace),
        dynamicGeneratorConfig,
        generationMetadata: {
            cliVersion: workspace.cliVersion,
            generatorName: generatorInvocation.name,
            generatorVersion: generatorInvocation.version,
            generatorConfig: generatorInvocation.config
        }
    });

    const venus = createVenusService({ token: token.value });
    const orgResponse = await venus.organization.get(FernVenusApi.OrganizationId(projectConfig.organization));

    if (orgResponse.ok) {
        if (orgResponse.body.isWhitelabled) {
            if (ir.readmeConfig == null) {
                ir.readmeConfig = emptyReadmeConfig;
            }
            ir.readmeConfig.whiteLabel = true;
        }
        ir.selfHosted = orgResponse.body.selfHostedSdKs;
    }

    const sources = workspace.getSources();
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
    const response = await fdr.api.v1.register.registerApiDefinition({
        orgId: FdrAPI.OrgId(organization),
        apiId: FdrAPI.ApiId(ir.apiName.originalName),
        definition: apiDefinition,
        sources: sources.length > 0 ? convertToFdrApiDefinitionSources(sources) : undefined
    });

    let fdrApiDefinitionId;
    let sourceUploads;
    if (response.ok) {
        fdrApiDefinitionId = response.body.apiDefinitionId;
        sourceUploads = response.body.sources;
    }

    const sourceUploader = new SourceUploader(interactiveTaskContext, sources);
    if (sourceUploads == null && sourceUploader.sourceTypes.has("protobuf")) {
        if (!response.ok) {
            interactiveTaskContext.failAndThrow(
                `Failed to register API definition: ${JSON.stringify(response.error.content)}`
            );
        }
        // We only fail hard if we need to upload Protobuf source files. Unlike OpenAPI, these
        // files are required for successful code generation.
        interactiveTaskContext.failAndThrow("Did not successfully upload Protobuf source files.");
    }

    if (sourceUploads != null) {
        interactiveTaskContext.logger.debug("Uploading source files ...");
        const sourceConfig = await sourceUploader.uploadSources(sourceUploads);

        interactiveTaskContext.logger.debug("Setting IR source configuration ...");
        ir.sourceConfig = sourceConfig;
    }

    const job = await createAndStartJob({
        projectConfig,
        workspace,
        organization,
        generatorInvocation: generatorInvocationWithEnvVarSubstitutions,
        context: interactiveTaskContext,
        version,
        intermediateRepresentation: {
            ...ir,
            fdrApiDefinitionId,
            publishConfig: getPublishConfig({ generatorInvocation: generatorInvocationWithEnvVarSubstitutions })
        },
        shouldLogS3Url,
        token,
        whitelabel: whitelabel != null ? substituteEnvVars(whitelabel) : undefined,
        irVersionOverride,
        absolutePathToPreview
    });
    interactiveTaskContext.logger.debug(`Job ID: ${job.jobId}`);

    const taskId = job.taskIds[0];
    if (taskId == null) {
        interactiveTaskContext.failAndThrow("Did not receive a task ID.");
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

    return await pollJobAndReportStatus({
        job,
        taskHandler,
        taskId,
        context: interactiveTaskContext
    });
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

async function computeSemanticVersion({
    fdr,
    packageName,
    generatorInvocation
}: {
    fdr: FdrClient;
    packageName: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
}): Promise<string | undefined> {
    if (generatorInvocation.language == null) {
        return undefined;
    }
    let language: FdrAPI.sdks.Language;
    switch (generatorInvocation.language) {
        case "csharp":
            language = "Csharp";
            break;
        case "go":
            language = "Go";
            break;
        case "java":
            language = "Java";
            break;
        case "python":
            language = "Python";
            break;
        case "ruby":
            language = "Ruby";
            break;
        case "typescript":
            language = "TypeScript";
            break;
        case "php":
            language = "Php";
            break;
        case "swift":
            language = "Swift";
            break;
        default:
            return undefined;
    }
    if (packageName == null) {
        return undefined;
    }
    const response = await fdr.sdks.versions.computeSemanticVersion({
        githubRepository:
            generatorInvocation.outputMode.type === "githubV2"
                ? `${generatorInvocation.outputMode.githubV2.owner}/${generatorInvocation.outputMode.githubV2.repo}`
                : undefined,
        language,
        package: packageName
    });
    if (!response.ok) {
        return undefined;
    }
    return response.body.version;
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

/**
 * Type guard to check if a GitHub configuration is a self-hosted configuration
 */
function isGithubSelfhosted(
    github: generatorsYml.GithubConfigurationSchema | undefined
): github is generatorsYml.GithubSelfhostedSchema {
    if (github == null) {
        return false;
    }
    return "uri" in github && "token" in github;
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
