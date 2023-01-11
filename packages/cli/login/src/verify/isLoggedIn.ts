import { getToken } from "../persistence/getToken";
import { verifyJwt } from "./verifyJwt";
import { verifyScopedToken } from "./verifyScopedToken";

export async function isLoggedIn(): Promise<boolean> {
    const token = await getToken();
    if (token == null) {
        return false;
    }
    if (await verifyJwt(token)) {
        return true;
    }
    if (await verifyScopedToken(token)) {
        return true;
    }
    return false;
}
