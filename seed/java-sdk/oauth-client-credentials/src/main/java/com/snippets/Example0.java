package com.snippets;

import com.seed.oauth.client.credentials.SeedOauthClientCredentialsClient;
import com.seed.oauth.client.credentials.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void run() {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient
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