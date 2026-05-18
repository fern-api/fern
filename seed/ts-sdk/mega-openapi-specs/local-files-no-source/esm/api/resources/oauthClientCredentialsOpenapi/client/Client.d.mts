import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { IdentityClient } from "../resources/identity/client/Client.mjs";
import { PlantsClient } from "../resources/plants/client/Client.mjs";
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
