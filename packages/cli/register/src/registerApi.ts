import { FernToken } from "@fern-api/auth";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createFdrService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry } from "@fern-fern/registry";
import chalk from "chalk";
import { convertIrToFdrApi } from "./ir-to-fdr-converter/convertIrToFdrApi";

export async function registerApi({
    organization,
    environment,
    workspace,
    context,
    token,
}: {
    organization: string;
    environment: string | undefined;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
}): Promise<void> {
    const ir = await generateIntermediateRepresentation({
        workspace,
        audiences: {
            type: "all",
        },
        generationLanguage: undefined,
    });

    const fdrService = createFdrService({
        token: token.value,
    });
    const response = await fdrService.registry.registerApi(
        FernRegistry.OrgId(organization),
        FernRegistry.ApiId(ir.apiName.originalName),
        {
            apiName: ir.apiDisplayName ?? ir.apiName.originalName,
            environmentId: environment != null ? FernRegistry.EnvironmentId(environment) : undefined,
            apiDefinition: convertIrToFdrApi(ir),
        }
    );

    if (response.ok) {
        context.logger.info(chalk.green(`Registered ${ir.apiName.originalName}`));
    } else {
        response.error._visit({
            apiDoesNotExistError: () => {
                context.failAndThrow("API does not exist");
            },
            environmentDoesNotExistError: () => {
                context.failAndThrow("Environment does not exist: " + environment);
            },
            _other: (error) => {
                context.failAndThrow("Failed to register API", error);
            },
        });
    }
}
