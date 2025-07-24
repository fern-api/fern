import { SeedOauthClientCredentialsClient } from "Client";
import * as core from "..";
import { GetTokenRequest } from "api";
import { AbstractAuthProvider } from "./AbstractAuthProvider";

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

    private headersPromise: Promise<Record<string, string>> | undefined;
    private expiresAt: Date | undefined;

    constructor(client: SeedOauthClientCredentialsClient, options: AuthProvider.Options) {
        super();
        this.client = client;
        this.options = options;
    }

    private getHeadersPromise(): Promise<Record<string, string>> {
        if (this.expiresAt && this.expiresAt <= new Date()) {
            // If the token has expired, reset the headers promise
            this.headersPromise = undefined;
        }

        if (!this.headersPromise) {
            this.headersPromise = this.getHeadersFromTokenEndpoint();
        }

        return this.headersPromise;
    }

    public getHeaders(): Record<string, core.Supplier<string>> {
        const headers = this.getHeadersPromise();
        return {
            Authorization: () => headers.then((h) => h.Authorization),
            "x-scope": "read-only",
        };
    }

    private async getHeadersFromTokenEndpoint(): Promise<{
        Authorization: string;
        // Add other headers from the response as needed
        // 'X-Custom-Header': string;
    }> {
        const response = await this.client.auth.getTokenWithClientCredentials(await this.getRequestParameters());
        this.expiresAt = new Date(Date.now() + response.expires_in * 1000);
        return {
            Authorization: `Bearer ${response.access_token}`,
            // Add other headers from the response as needed
            // 'X-Custom-Header': response.custom_header,
        };
    }

    private async getRequestParameters(): Promise<GetTokenRequest> {
        return {
            client_id: await core.Supplier.get(this.options.clientId),
            client_secret: await core.Supplier.get(this.options.clientSecret),
            scope: await core.Supplier.get(this.options.scope),
        };
    }
}
