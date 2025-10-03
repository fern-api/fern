import { FernToken } from "@fern-api/auth";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import { fernConfigJson } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { createVenusService } from "@fern-api/core";

export async function getOrgSettingsForIrOverrides({
    token,
    projectConfig,
    interactiveTaskContext,
}: {
    token: FernToken | undefined;
    projectConfig: fernConfigJson.ProjectConfig;
    interactiveTaskContext: TaskContext;
}): Promise<{ selfHosted: boolean | undefined; whiteLabel: boolean | undefined }> {
    const venus = createVenusService({ token: token?.value });

    const organization = await venus.organization.get(
        FernVenusApi.OrganizationId(projectConfig.organization)
    );

    if (!organization.ok) {
        interactiveTaskContext.failWithoutThrowing(
            `Failed to load details for organization ${projectConfig.organization}.`
        );
        return { selfHosted: undefined, whiteLabel: undefined };
    }

    return { selfHosted: organization.body.selfHostedSdKs, whiteLabel: organization.body.isWhitelabled };
}