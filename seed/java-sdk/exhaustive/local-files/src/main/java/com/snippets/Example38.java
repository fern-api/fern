package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.put.requests.PutRequest;

public class Example38 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().put().add(
            PutRequest
                .builder()
                .id("id")
                .build()
        );
    }
}