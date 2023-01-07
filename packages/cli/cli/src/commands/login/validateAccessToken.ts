import { createVenusService } from "@fern-api/services";
import { FernCliError } from "@fern-api/task-context";
import { CliContext } from "../../cli-context/CliContext";

export async function validateAccessToken({
    token,
    cliContext,
}: {
    token: string;
    cliContext: CliContext;
}): Promise<void> {
    const venus = createVenusService({ token });
    const response = await venus.organization.getMyOrganizationFromScopedToken();
    if (!response.ok) {
        cliContext.fail("Failed to login. Token is invalid.");
        cliContext.logger.debug(JSON.stringify(response.error));
        throw new FernCliError();
    } else {
        cliContext.logger.info("Logged in successfully.");
    }
}
