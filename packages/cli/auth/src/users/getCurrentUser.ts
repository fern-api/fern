import { createVenusService } from "@fern-api/core";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";

import { FernUserToken } from "../FernToken";

export async function getCurrentUser({
    token,
    context
}: {
    token: FernUserToken;
    context: TaskContext;
}): Promise<FernVenusApi.User> {
    const response = await createVenusService({ token: token.value }).user.getMyself();
    if (!response.ok) {
        return context.failAndThrow("Failed to fetch user info");
    }
    return response.body;
}
