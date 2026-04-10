package com.snippets;

import com.fern.sdk.SeedApiClient;

public class Example83 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsPrimitive().endpointsPrimitiveGetAndReturnDouble(1.1);
    }
}