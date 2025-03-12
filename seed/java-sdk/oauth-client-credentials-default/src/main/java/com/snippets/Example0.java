package com.snippets;

import com.seed.oauth.client.credentials.default.SeedOauthClientCredentialsDefaultClient;
import com.seed.oauth.client.credentials.default.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void run() {
        SeedOauthClientCredentialsDefaultClient client = SeedOauthClientCredentialsDefaultClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.auth().getToken(
            GetTokenRequest
                .builder()
                .clientId("client_id")
                .clientSecret("client_secret")
                .grantType("client_credentials")
                .build()
        );
    }
}