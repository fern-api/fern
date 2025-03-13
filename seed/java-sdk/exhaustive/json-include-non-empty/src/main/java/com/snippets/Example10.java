package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

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