import { assertNever } from "@fern-api/core-utils";

import { getToken } from "../persistence/getToken";
import { verifyAccessToken } from "./verifyAccessToken";
import { verifyJwt } from "./verifyJwt";

export async function isLoggedIn(): Promise<boolean> {
    const token = await getToken();
    if (token == null) {
        return false;
    }
    switch (token.type) {
        case "organization":
            return verifyAccessToken(token);
        case "user":
            return verifyJwt(token);
        default:
            assertNever(token);
    }
}
