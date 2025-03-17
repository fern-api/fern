package com.snippets;

import com.seed.api.SeedApiClient;

public class Example1 {
    public static void run() {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.imdb().getMovie("movieId");
    }
}