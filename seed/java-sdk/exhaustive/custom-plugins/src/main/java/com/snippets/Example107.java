package com.snippets;

import com.seed.api.SeedApiClient;

public class Example107 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().urls().withUnderscores();
    }
}
