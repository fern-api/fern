import * as core from "../core/index.mjs";
export declare namespace BearerAuthProvider {
    interface Options {
        token?: core.Supplier<core.BearerToken | undefined>;
    }
}
export declare class BearerAuthProvider implements core.AuthProvider {
    private readonly token;
    constructor(options: BearerAuthProvider.Options);
    static canCreate(options: BearerAuthProvider.Options): boolean;
    getAuthRequest(): Promise<core.AuthRequest>;
}
