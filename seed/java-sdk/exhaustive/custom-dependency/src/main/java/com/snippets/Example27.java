package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

public class Example27 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().modifyWithPath("param", "string");
    }
}