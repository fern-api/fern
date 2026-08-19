import { base64Decode, base64Encode } from "../base64.mjs";
const BASIC_AUTH_HEADER_PREFIX = /^Basic /i;
export const BasicAuth = {
    toAuthorizationHeader: (basicAuth) => {
        var _a, _b;
        if (basicAuth == null) {
            return undefined;
        }
        const username = (_a = basicAuth.username) !== null && _a !== void 0 ? _a : "";
        const password = (_b = basicAuth.password) !== null && _b !== void 0 ? _b : "";
        if (username === "" && password === "") {
            return undefined;
        }
        const token = base64Encode(`${username}:${password}`);
        return `Basic ${token}`;
    },
    fromAuthorizationHeader: (header) => {
        const credentials = header.replace(BASIC_AUTH_HEADER_PREFIX, "");
        const decoded = base64Decode(credentials);
        const [username, ...passwordParts] = decoded.split(":");
        const password = passwordParts.length > 0 ? passwordParts.join(":") : undefined;
        if (username == null || password == null) {
            throw new Error("Invalid basic auth");
        }
        return {
            username,
            password,
        };
    },
};
