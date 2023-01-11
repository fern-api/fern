import { assertNever } from "@fern-api/core-utils";
import { getToken } from "../persistence/getToken";
import { verifyJwt } from "./verifyJwt";
import { verifyScopedToken } from "./verifyScopedToken";

export async function isLoggedIn(): Promise<boolean> {
    const token = await getToken();
    if (token == null) {
        return false;
    }
    switch (token.type) {
        case "organization":
            return verifyScopedToken(token);
        case "user":
            return verifyJwt(token);
        default:
            assertNever(token);
    }
}
