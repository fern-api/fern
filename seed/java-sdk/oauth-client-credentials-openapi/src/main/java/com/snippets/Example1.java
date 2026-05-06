package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.identity.requests.IdentityGetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.identity()
                .gettoken(IdentityGetTokenRequest.builder()
                        .username("username")
                        .password("password")
                        .build());
    }
}
