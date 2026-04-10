package com.snippets;

import com.seed.api.SeedApiClient;

public class Example79 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsPrimitive().endpointsPrimitiveGetAndReturnInt(1);
    }
}
