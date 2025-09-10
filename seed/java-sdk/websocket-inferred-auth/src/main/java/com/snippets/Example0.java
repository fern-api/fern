package com.snippets;

import com.seed.websocketAuth.SeedWebsocketAuthClient;
import com.seed.websocketAuth.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedWebsocketAuthClient client = SeedWebsocketAuthClient
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