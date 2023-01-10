import { createVenusService } from "@fern-api/services";
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
        cliContext.failAndThrow("Failed to login. Token is invalid.", response.error);
    }
}
