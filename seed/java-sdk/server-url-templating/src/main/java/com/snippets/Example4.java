package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.GetTokenRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.getToken(GetTokenRequest.builder()
                .clientId("client_id")
                .clientSecret("client_secret")
                .build());
    }
}
