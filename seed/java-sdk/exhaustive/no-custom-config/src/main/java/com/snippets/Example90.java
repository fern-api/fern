package com.snippets;

import com.seed.api.SeedApiClient;

public class Example90 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().primitive().getAndReturnDate("2023-01-15");
    }
}
