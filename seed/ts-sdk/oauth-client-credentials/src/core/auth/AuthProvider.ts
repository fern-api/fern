import { SeedOauthClientCredentialsClient } from "Client";
import * as core from "..";
import { GetTokenRequest } from "api";
import { AbstractAuthProvider } from "./AbstractAuthProvider";

export class AuthProvider extends AbstractAuthProvider {
    private readonly client: SeedOauthClientCredentialsClient;
    private readonly options: SeedOauthClientCredentialsClient.Options;

    private headersPromise: Promise<Record<string, string>> | undefined;
    private expiresAt: Date | undefined;

    constructor(client: SeedOauthClientCredentialsClient, options: SeedOauthClientCredentialsClient.Options) {
        super();
        this.client = client;
        this.options = options;
    }

    private getPromiseHeaders(): Promise<Record<string, string>> {
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
        const headers = this.getPromiseHeaders();
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
            client_id: await core.Supplier.get(this.options.client_id),
            client_secret: await core.Supplier.get(this.options.client_secret),
            scope: await core.Supplier.get(this.options.scope),
        };
    }
}
