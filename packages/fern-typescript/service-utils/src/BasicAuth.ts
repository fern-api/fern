import { parse } from "basic-auth";
import { Buffer } from "buffer";

export interface BasicAuth {
    username: string;
    password: string;
}

export const BasicAuth = {
    toAuthorizationHeader: (basicAuth: BasicAuth): string => {
        const token = Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64");
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
