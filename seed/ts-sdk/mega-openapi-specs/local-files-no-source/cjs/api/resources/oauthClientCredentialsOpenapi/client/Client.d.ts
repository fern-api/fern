import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { IdentityClient } from "../resources/identity/client/Client.js";
import { PlantsClient } from "../resources/plants/client/Client.js";
export declare namespace OauthClientCredentialsOpenapiClient {
    type Options = BaseClientOptions;
}
export declare class OauthClientCredentialsOpenapiClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<OauthClientCredentialsOpenapiClient.Options>;
    protected _identity: IdentityClient | undefined;
    protected _plants: PlantsClient | undefined;
    constructor(options: OauthClientCredentialsOpenapiClient.Options);
    get identity(): IdentityClient;
    get plants(): PlantsClient;
}
