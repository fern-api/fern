package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.RefreshTokenRequest;

public class Example18 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service().refreshtoken(RefreshTokenRequest.builder().ttl(1).build());
    }
}
