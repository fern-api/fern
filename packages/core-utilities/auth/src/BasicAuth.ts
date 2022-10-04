import { parse } from "basic-auth";
import { Base64 } from "js-base64";

export interface BasicAuth {
    username: string;
    password: string;
}

export const BasicAuth = {
    toAuthorizationHeader: (basicAuth: BasicAuth | undefined): string | undefined => {
        if (basicAuth == null) {
            return undefined;
        }
        const token = Base64.encode(`${basicAuth.username}:${basicAuth.password}`);
        return `Basic ${token}`;
    },
    fromAuthorizationHeader: (header: string): BasicAuth => {
        const parsed = parse(header);
        if (parsed == null) {
            throw new Error("Invalid basic auth");
        }
        return {
            username: parsed.name,
            password: parsed.pass,
        };
    },
};
