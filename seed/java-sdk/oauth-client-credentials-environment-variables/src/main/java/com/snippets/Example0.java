package com.snippets;

import com.seed.oauth.client.credentials.environment.variables.SeedOauthClientCredentialsEnvironmentVariablesClient;
import com.seed.oauth.client.credentials.environment.variables.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void run() {
        SeedOauthClientCredentialsEnvironmentVariablesClient client = SeedOauthClientCredentialsEnvironmentVariablesClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.auth().getTokenWithClientCredentials(
            GetTokenRequest
                .builder()
                .clientId("client_id")
                .clientSecret("client_secret")
                .scope("scope")
                .build()
        );
    }
}