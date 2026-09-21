package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.imdb.requests.CreateMovieRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.imdb().createMovie(
            CreateMovieRequest
                .builder()
                .title("title")
                .rating(1.1)
                .build()
        );
    }
}