package com.snippets;

import com.seed.examples.SeedExamplesClient;

public class Example12 {
    public static void run() {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getMovie("movie-c06a4ad7");
    }
}