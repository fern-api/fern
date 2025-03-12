package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;
import com.seed.oauthClientCredentials.resources.auth.requests.RefreshTokenRequest;

public class Example1 {
    public static void run() {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.auth().refreshToken(
            RefreshTokenRequest
                .builder()
                .clientId("client_id")
                .clientSecret("client_secret")
                .refreshToken("refresh_token")
                .audience("https://api.example.com")
                .grantType("refresh_token")
                .scope("scope")
                .build()
        );
    }
}