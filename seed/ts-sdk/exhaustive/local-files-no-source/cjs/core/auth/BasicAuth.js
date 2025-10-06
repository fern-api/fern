"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAuth = void 0;
const base64_js_1 = require("../base64.js");
const BASIC_AUTH_HEADER_PREFIX = /^Basic /i;
exports.BasicAuth = {
    toAuthorizationHeader: (basicAuth) => {
        if (basicAuth == null) {
            return undefined;
        }
        const token = (0, base64_js_1.base64Encode)(`${basicAuth.username}:${basicAuth.password}`);
        return `Basic ${token}`;
    },
    fromAuthorizationHeader: (header) => {
        const credentials = header.replace(BASIC_AUTH_HEADER_PREFIX, "");
        const decoded = (0, base64_js_1.base64Decode)(credentials);
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
