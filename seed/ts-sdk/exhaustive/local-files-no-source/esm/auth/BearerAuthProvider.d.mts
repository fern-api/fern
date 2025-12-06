import * as core from "../core/index.mjs";
export declare namespace BearerAuthProvider {
    interface AuthOptions {
        token?: core.Supplier<core.BearerToken>;
    }
    interface Options extends AuthOptions {
    }
}
export declare class BearerAuthProvider implements core.AuthProvider {
    private readonly token;
    constructor(options: BearerAuthProvider.Options);
    static canCreate(options: BearerAuthProvider.Options): boolean;
    getAuthRequest(_arg?: {
        endpointMetadata?: core.EndpointMetadata;
    }): Promise<core.AuthRequest>;
}
