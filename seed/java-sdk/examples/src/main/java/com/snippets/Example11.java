package com.snippets;

import com.seed.examples.SeedExamplesClient;

public class Example11 {
    public static void run() {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.health().service().ping();
    }
}