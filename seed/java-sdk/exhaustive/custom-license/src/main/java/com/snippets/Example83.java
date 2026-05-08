package com.snippets;

import com.seed.api.SeedApiClient;

public class Example83 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().primitive().getAndReturnLong(1000000L);
    }
}
