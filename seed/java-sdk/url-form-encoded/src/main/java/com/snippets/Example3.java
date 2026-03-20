package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TokenRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.getToken(TokenRequest.builder()
                .clientId("client_id")
                .clientSecret("client_secret")
                .build());
    }
}
