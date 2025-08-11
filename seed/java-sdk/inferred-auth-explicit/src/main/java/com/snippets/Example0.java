package com.snippets;

import com.seed.inferredAuthExplicit.SeedInferredAuthExplicitClient;
import com.seed.inferredAuthExplicit.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedInferredAuthExplicitClient client = SeedInferredAuthExplicitClient
            .builder()
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