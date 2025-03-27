package com.snippets;

import com.seed.examples.SeedExamplesClient;

public class Example8 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.health().service().check("id-3tey93i");
    }
}