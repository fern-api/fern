import chalk from "chalk";

import { createVenusService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";

export async function generateToken({
    orgId,
    taskContext
}: {
    orgId: string;
    taskContext: TaskContext;
}): Promise<void> {
    const token = await askToLogin(taskContext);
    const venus = createVenusService({ token: token.value });
    const response = await venus.registry.generateRegistryTokens({
        organizationId: FernVenusApi.OrganizationId(orgId)
    });
    if (response.ok) {
        taskContext.logger.info(chalk.green(`Generated a FERN_TOKEN for ${orgId}: ${response.body.npm.token}`));
        return;
    }
    response.error._visit({
        organizationNotFoundError: () =>
            taskContext.failAndThrow(
                `Failed to create token because the organization ${orgId} was not found. Please reach out to support@buildwithfern.com`
            ),
        unauthorizedError: () =>
            taskContext.failAndThrow(
                `Failed to create token because you are not in the ${orgId} organization. Please reach out to support@buildwithfern.com`
            ),
        _other: () => taskContext.failAndThrow("Failed to create token. Please reach out to support@buildwithfern.com")
    });
}
