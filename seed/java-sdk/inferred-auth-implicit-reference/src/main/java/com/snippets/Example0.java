package com.snippets;

import com.seed.inferredAuthImplicit.SeedInferredAuthImplicitClient;
import com.seed.inferredAuthImplicit.resources.auth.types.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitClient client = SeedInferredAuthImplicitClient
            .builder()
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