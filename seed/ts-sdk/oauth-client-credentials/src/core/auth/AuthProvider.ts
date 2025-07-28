import { SeedOauthClientCredentialsClient } from "Client";
import * as core from "..";
import { GetTokenRequest } from "api";
import { AbstractAuthProvider } from "./AbstractAuthProvider";
import { AuthRequest } from "./AuthRequest";

export namespace AuthProvider {
    export interface Options {
        clientId: core.Supplier<string>;
        clientSecret: core.Supplier<string>;
        scope?: core.Supplier<string>;
    }
}

export class AuthProvider extends AbstractAuthProvider {
    private readonly client: SeedOauthClientCredentialsClient;
    private readonly options: AuthProvider.Options;

    private authRequestPromise: Promise<AuthRequest> | undefined;
    private expiresAt: Date | undefined;

    constructor(client: SeedOauthClientCredentialsClient, options: AuthProvider.Options) {
        super();
        this.client = client;
        this.options = options;
    }

    private getCachedAuthRequest(): Promise<AuthRequest> {
        if (this.expiresAt && this.expiresAt <= new Date()) {
            // If the token has expired, reset the auth request promise
            this.authRequestPromise = undefined;
        }

        if (!this.authRequestPromise) {
            this.authRequestPromise = this.getAuthRequestFromTokenEndpoint();
        }

        return this.authRequestPromise;
    }

    public async getAuthRequest(): Promise<AuthRequest> {
        const authRequest = await this.getCachedAuthRequest();
        return authRequest;
    }

    private async getAuthRequestFromTokenEndpoint(): Promise<AuthRequest> {
        const response = await this.client.auth.getTokenWithClientCredentials(await this.getTokenRequestParameters());
        this.expiresAt = new Date(Date.now() + response.expires_in * 1000);
        return {
            headers: {
                Authorization: `Bearer ${response.access_token}`,
                // Add other headers from the response as needed
            },
        };
    }

    private async getTokenRequestParameters(): Promise<GetTokenRequest> {
        return {
            client_id: await core.Supplier.get(this.options.clientId),
            client_secret: await core.Supplier.get(this.options.clientSecret),
            scope: await core.Supplier.get(this.options.scope),
        };
    }
}
