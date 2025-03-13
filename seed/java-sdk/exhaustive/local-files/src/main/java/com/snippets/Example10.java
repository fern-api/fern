package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;

public class Example10 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testGet("id");
    }
}