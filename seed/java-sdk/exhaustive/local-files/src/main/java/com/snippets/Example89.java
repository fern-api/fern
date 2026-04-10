package com.snippets;

import com.fern.sdk.SeedApiClient;

public class Example89 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsPrimitive().endpointsPrimitiveGetAndReturnDate("2023-01-15");
    }
}