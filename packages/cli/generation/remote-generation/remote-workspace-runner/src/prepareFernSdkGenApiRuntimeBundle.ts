import { stripCliConfigKeys } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { GeneratorConfig } from "@fern-fern/generator-exec-sdk/serialization";
import { promisify } from "util";
import { gzip } from "zlib";
import { getGeneratorConfig } from "./getGeneratorConfig.js";
import { migrateIntermediateRepresentationForInvocation } from "./migrateIntermediateRepresentationForInvocation.js";

const gzipAsync = promisify(gzip);
const RUNTIME_IR_PATH = AbsoluteFilePath.of("/tmp/fern-runtime/ir.json");
const RUNTIME_OUTPUT_PATH = AbsoluteFilePath.of("/fern/output");

export async function prepareFernSdkGenApiRuntimeBundle({
    apiName,
    organization,
    generatorInvocation,
    sdkVersion,
    intermediateRepresentation,
    irVersionOverride,
    writeUnitTests = false,
    generateOauthClients = false,
    generatePaginatedClients = false,
    context
}: {
    apiName: string;
    organization: string;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkVersion: string;
    intermediateRepresentation: IntermediateRepresentation;
    irVersionOverride: string | undefined;
    writeUnitTests?: boolean;
    generateOauthClients?: boolean;
    generatePaginatedClients?: boolean;
    context: InteractiveTaskContext;
}): Promise<Buffer> {
    const migratedIntermediateRepresentation = await migrateIntermediateRepresentationForInvocation({
        intermediateRepresentation,
        generatorInvocation,
        context,
        irVersionOverride
    });
    const config = getGeneratorConfig({
        workspaceName: apiName,
        organization,
        outputVersion: sdkVersion,
        customConfig: stripCliConfigKeys(generatorInvocation.config),
        generatorInvocation,
        absolutePathToSnippet: undefined,
        absolutePathToSnippetTemplates: undefined,
        absolutePathToFernConfig: undefined,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients,
        publishToRegistry: false,
        omitPublishCredentials: true,
        paths: {
            snippetPath: undefined,
            snippetTemplatePath: undefined,
            irPath: RUNTIME_IR_PATH,
            outputDirectory: RUNTIME_OUTPUT_PATH
        }
    });
    const serializedConfig = await GeneratorConfig.jsonOrThrow(config);
    return gzipAsync(
        Buffer.from(
            JSON.stringify({
                config: serializedConfig,
                ir: migratedIntermediateRepresentation
            })
        )
    );
}
