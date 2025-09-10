package com.snippets;

import com.seed.inferredAuthExplicit.SeedInferredAuthExplicitClient;
import com.seed.inferredAuthExplicit.resources.auth.requests.RefreshTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedInferredAuthExplicitClient client = SeedInferredAuthExplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.auth().refreshToken(
            RefreshTokenRequest
                .builder()
                .xApiKey("X-Api-Key")
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