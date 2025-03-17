package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

public class Example14 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().httpMethods().testDelete("id");
    }
}