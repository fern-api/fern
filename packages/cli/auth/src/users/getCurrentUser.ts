import { createVenusService } from "@fern-api/services";
import { FernVenusApi } from "@fern-fern/venus-api-sdk";
import { FernUserToken } from "../FernToken";

export async function getCurrentUser({ token }: { token: FernUserToken }): Promise<FernVenusApi.User> {
    const response = await createVenusService({ token: token.value }).user.getMyself();
    if (!response.ok) {
        throw new Error("Faield to fetch user info");
    }
    return response.body;
}
