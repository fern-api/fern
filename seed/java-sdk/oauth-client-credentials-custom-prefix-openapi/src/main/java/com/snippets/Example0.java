package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.identity.requests.GetTokenIdentityRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.identity()
                .getToken(GetTokenIdentityRequest.builder()
                        .username("username")
                        .password("password")
                        .build());
    }
}
