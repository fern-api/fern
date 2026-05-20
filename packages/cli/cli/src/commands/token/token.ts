import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

export async function generateToken({
    orgId,
    taskContext
}: {
    orgId: string;
    taskContext: TaskContext;
}): Promise<void> {
    const token = await askToLogin(taskContext);
    if (token.type === "user") {
        await createOrganizationIfDoesNotExist({ organization: orgId, token, context: taskContext });
    }
    const venus = createVenusService({ token: token.value });
    const response = await venus.registry.generateRegistryTokens({
        organizationId: orgId
    });
    if (response.ok) {
        taskContext.logger.info(chalk.green(`Generated a FERN_TOKEN for ${orgId}: ${response.body.npm.token}`));
        return;
    }
    response.error._visit({
        unprocessableEntityError: () =>
            taskContext.failAndThrow(
                `Failed to create token because the organization ${orgId} was not found. Please reach out to support@buildwithfern.com`,
                undefined,
                { code: CliError.Code.AuthError }
            ),
        _other: () =>
            taskContext.failAndThrow(
                "Failed to create token. Please reach out to support@buildwithfern.com",
                undefined,
                { code: CliError.Code.AuthError }
            )
    });
}
