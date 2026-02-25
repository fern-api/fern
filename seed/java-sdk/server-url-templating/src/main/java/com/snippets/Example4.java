package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.TokenRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder().build();

        client.getToken(TokenRequest.builder()
                .clientId("client_id")
                .clientSecret("client_secret")
                .build());
    }
}
