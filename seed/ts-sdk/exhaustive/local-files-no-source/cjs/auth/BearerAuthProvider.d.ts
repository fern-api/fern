import * as core from "../core/index.js";
export declare namespace BearerAuthProvider {
    interface Options {
        token?: core.Supplier<core.BearerToken | undefined>;
    }
}
export declare class BearerAuthProvider implements core.AuthProvider {
    private readonly token;
    constructor(options: BearerAuthProvider.Options);
    getAuthRequest(): Promise<core.AuthRequest>;
}
