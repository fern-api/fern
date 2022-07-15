import { parse } from "basic-auth";

export interface BasicAuth {
    username: string;
    password: string;
}

export const BasicAuth = {
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
