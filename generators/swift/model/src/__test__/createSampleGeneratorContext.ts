import { resolve } from "node:path";

import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../_ModelCustomConfig";
import { ModelGeneratorContext } from "../_ModelGeneratorContext";

export async function createSampleGeneratorContext(fixtureName: string) {
    const ir = await createSampleIr(fixtureName);
    const generatorConfig = createSampleGeneratorConfig();
    const customConfig: ModelCustomConfigSchema = {};
    const notificationService = new GeneratorNotificationService({
        type: "local",
        _visit: (visitor) => visitor.local()
    });
    return new ModelGeneratorContext(ir, generatorConfig, customConfig, notificationService);
}

async function createSampleIr(fixtureName: string): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const absolutePathToWorkspace = AbsoluteFilePath.of(resolve(__dirname, "test-definitions", fixtureName));
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load workspace '${absolutePathToWorkspace}'`);
    }
    const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences: { type: "all" },
        keywords: undefined,
        smartCasing: true,
        exampleGeneration: { disabled: true },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
}

function createSampleGeneratorConfig(): FernGeneratorExec.config.GeneratorConfig {
    return {
        dryRun: false,
        irFilepath: "ir.json",
        output: {
            path: AbsoluteFilePath.of(__dirname) + "/output",
            mode: {
                type: "downloadFiles",
                _visit: (visitor) => visitor.downloadFiles()
            }
        },
        workspaceName: "test",
        organization: "test",
        environment: {
            type: "local",
            _visit: (visitor) => visitor.local()
        },
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false
    };
}
