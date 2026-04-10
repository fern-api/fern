package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.AuthGetTokenRequest;
import com.seed.api.resources.auth.types.AuthGetTokenRequestGrantType;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .gettoken(AuthGetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .grantType(AuthGetTokenRequestGrantType.CLIENT_CREDENTIALS)
                        .build());
    }
}
