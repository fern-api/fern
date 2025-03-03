import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { generatorExec } from "@fern-api/ir-sdk";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

const IR_FILEPATH = "/fern/ir/ir.json";
const OUTPUT_SNIPPET_PATH = "/fern/snippet/snippet.json";
const OUTPUT_SNIPPET_TEMPLATE_PATH = "/fern/snippet/snippet-templates.json";
const OUTPUT_PATH = "/fern/output";

export function getGeneratorConfig({
    apiName,
    organization,
    generatorInvocation
}: {
    apiName: string;
    organization: string;
    generatorInvocation: generatorsYml.GeneratorInvocation;
}): generatorExec.GeneratorConfig {
    return {
        workspaceName: apiName,
        organization,
        output: getGeneratorOutputConfig(generatorInvocation),
        customConfig: generatorInvocation.config,
        irFilepath: IR_FILEPATH,
        environment: generatorExec.GeneratorEnvironment.remote({
            coordinatorUrl: "https://placeholder.org",
            coordinatorUrlV2: "https://placeholder.org",
            id: "placeholder",
        }),
        dryRun: false,
        publish: undefined,
        license: undefined,
        originalReadmeFilepath: undefined,
        whitelabel: false,
        writeUnitTests: false,
        generatePaginatedClients: false,
        generateOauthClients: false,
    }
}

function getGeneratorOutputConfig(generatorInvocation: generatorsYml.GeneratorInvocation): generatorExec.GeneratorOutputConfig {
    return {
        path: OUTPUT_PATH,
        snippetFilepath: OUTPUT_SNIPPET_PATH,
        snippetTemplateFilepath: OUTPUT_SNIPPET_TEMPLATE_PATH,
        mode: convertGeneratorOutputMode(generatorInvocation),
        publishingMetadata: generatorInvocation.publishMetadata != null ? convertPublishingMetadata(generatorInvocation.publishMetadata) : undefined,
    }
}

function convertGeneratorOutputMode(generatorInvocation: generatorsYml.GeneratorInvocation): generatorExec.OutputMode {
    switch (generatorInvocation.outputMode.type) {
        case "publish":
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {} as any;
        case "publishV2":
            return convertOutputModePublishV2({
                publishV2: generatorInvocation.outputMode.publishV2,
                version: generatorInvocation.version,
            });
        case "downloadFiles":
            return generatorExec.OutputMode.downloadFiles();
        case "github":
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {} as any;
        case "githubV2":
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {} as any;
        default:
            assertNever(generatorInvocation.outputMode);
    }
}

function convertOutputModePublishV2({ publishV2, version }: { publishV2: FernFiddle.remoteGen.PublishOutputModeV2, version: string }): generatorExec.OutputMode {
    return generatorExec.OutputMode.publish({ 
        registries: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        registriesV2: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        version,
        publishTarget: convertPublishTarget(publishV2),
    });
}

function convertPublishTarget(publishTarget: FernFiddle.remoteGen.PublishOutputModeV2): generatorExec.GeneratorPublishTarget {
    switch (publishTarget.type) {
        case "npmOverride":
            return generatorExec.GeneratorPublishTarget.npm({
                registryUrl: publishTarget.npmOverride?.registryUrl ?? "https://placeholder.org",
                packageName: publishTarget.npmOverride?.packageName ?? "placeholder",
                token: publishTarget.npmOverride?.token ?? "placeholder",
            });
        case "mavenOverride":
            return generatorExec.GeneratorPublishTarget.maven({
                registryUrl: publishTarget.mavenOverride?.registryUrl ?? "https://placeholder.org",
                username: publishTarget.mavenOverride?.username ?? "placeholder",
                password: publishTarget.mavenOverride?.password ?? "placeholder",
                coordinate: publishTarget.mavenOverride?.coordinate ?? "placeholder",
                signature: publishTarget.mavenOverride?.signature ?? undefined,
            });
        case "pypiOverride":
            return generatorExec.GeneratorPublishTarget.pypi({
                registryUrl: publishTarget.pypiOverride?.registryUrl ?? "https://placeholder.org",
                packageName: publishTarget.pypiOverride?.coordinate ?? "placeholder",
                username: publishTarget.pypiOverride?.username ?? "placeholder",
                password: publishTarget.pypiOverride?.password ?? "placeholder",
                pypiMetadata: publishTarget.pypiOverride?.pypiMetadata != null ? convertPypiMetadata(publishTarget.pypiOverride.pypiMetadata) : undefined,
            });
        case "rubyGemsOverride":
            return generatorExec.GeneratorPublishTarget.rubygems({
                registryUrl: publishTarget.rubyGemsOverride?.registryUrl ?? "https://placeholder.org",
                packageName: publishTarget.rubyGemsOverride?.packageName ?? "placeholder",
                apiKey: publishTarget.rubyGemsOverride?.apiKey ?? "placeholder",
            });
        case "nugetOverride":
            return generatorExec.GeneratorPublishTarget.nuget({
                registryUrl: publishTarget.nugetOverride?.registryUrl ?? "https://placeholder.org",
                packageName: publishTarget.nugetOverride?.packageName ?? "placeholder",
                apiKey: publishTarget.nugetOverride?.apiKey ?? "placeholder",
            });
        case "postman":
            return generatorExec.GeneratorPublishTarget.postman({
                apiKey: publishTarget.apiKey,
                workspaceId: publishTarget.workspaceId,
            }); 
        default:
            assertNever(publishTarget);
    }
}

function convertPypiMetadata(pypiMetadata: FernFiddle.remoteGen.PypiMetadata): generatorExec.PypiMetadata {
    return {
        description: pypiMetadata.description,
        keywords: pypiMetadata.keywords,
        homepageLink: pypiMetadata.homepageLink,
        documentationLink: pypiMetadata.documentationLink,
        authors: pypiMetadata.authors,
    }
}

function convertPublishingMetadata(publishMetadata: FernFiddle.remoteGen.PublishingMetadata): generatorExec.PublishingMetadata {
    return {
        packageDescription: publishMetadata.packageDescription,
        publisherEmail: publishMetadata.publisherEmail,
        referenceUrl: publishMetadata.referenceUrl,
        publisherName: publishMetadata.publisherName,
    }
}


