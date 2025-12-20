import * as core from "../core/index.js";
declare const TOKEN_PARAM: "token";
export declare class BearerAuthProvider implements core.AuthProvider {
    private readonly options;
    constructor(options: BearerAuthProvider.Options);
    static canCreate(options: Partial<BearerAuthProvider.Options>): boolean;
    getAuthRequest({ endpointMetadata, }?: {
        endpointMetadata?: core.EndpointMetadata;
    }): Promise<core.AuthRequest>;
}
export declare namespace BearerAuthProvider {
    const AUTH_SCHEME: "bearer";
    const AUTH_CONFIG_ERROR_MESSAGE: string;
    type Options = Partial<AuthOptions>;
    type AuthOptions = {
        [TOKEN_PARAM]?: core.Supplier<core.BearerToken>;
    };
    function createInstance(options: Options): core.AuthProvider;
}
export {};
