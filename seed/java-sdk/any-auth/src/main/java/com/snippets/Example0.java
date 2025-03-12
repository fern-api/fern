package com.snippets;

import com.seed.any.auth.SeedAnyAuthClient;
import com.seed.any.auth.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void run() {
        SeedAnyAuthClient client = SeedAnyAuthClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.auth().getToken(
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