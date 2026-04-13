package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.BigEntity;

public class Example15 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service().createbigentity(BigEntity.builder().build());
    }
}
