import jwt from "jsonwebtoken";

import { FernUserToken } from "../FernToken.js";

export function getUserIdFromToken(token: FernUserToken): string | undefined {
    const decodedToken = jwt.decode(token.value, { complete: true });
    if (decodedToken == null) {
        return undefined;
    }
    const payload = decodedToken.payload;
    return typeof payload === "string" ? undefined : payload.sub;
}
