package com.snippets;

import com.seed.oauth.client.credentials.SeedOauthClientCredentialsClient;
import com.seed.oauth.client.credentials.resources.auth.requests.RefreshTokenRequest;

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
                .scope("scope")
                .build()
        );
    }
}