package com.snippets;

import com.customprefix.SeedApiClient;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.imdb().getMovie("movieId");
    }
}