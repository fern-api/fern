import { assertNever } from "@fern-api/core-utils";

import { getToken } from "../persistence/getToken.js";
import { verifyAccessToken } from "./verifyAccessToken.js";
import { verifyJwt } from "./verifyJwt.js";

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
