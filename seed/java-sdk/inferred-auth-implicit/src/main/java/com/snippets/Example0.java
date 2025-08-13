package com.snippets;

import com.seed.inferredAuthImplicit.SeedInferredAuthImplicitClient;
import com.seed.inferredAuthImplicit.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitClient client = SeedInferredAuthImplicitClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.auth().getTokenWithClientCredentials(
            GetTokenRequest
                .builder()
                .xApiKey("X-Api-Key")
                .clientId("client_id")
                .clientSecret("client_secret")
                .audience("https://api.example.com")
                .grantType("client_credentials")
                .scope("scope")
                .build()
        );
    }
}