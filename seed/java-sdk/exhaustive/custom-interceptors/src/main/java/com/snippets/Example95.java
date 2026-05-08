package com.snippets;

import com.seed.api.SeedApiClient;

public class Example95 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().primitive().getAndReturnBase64("string");
    }
}
