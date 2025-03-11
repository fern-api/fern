package com.snippets;

import com.seed.examples.SeedExamplesClient;

public class Example3 {
    public static void run() {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.file().notification().service().getException("notification-hsy129x");
    }
}