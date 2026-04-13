package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.GetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .gettoken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
