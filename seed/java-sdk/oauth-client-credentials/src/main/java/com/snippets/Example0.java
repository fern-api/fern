package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;
import com.seed.oauthClientCredentials.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
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
                .audience("https://api.example.com")
                .grantType("client_credentials")
                .scope("scope")
                .build()
        );
    }
}