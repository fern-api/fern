package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.resources.imdb.requests.GetMovieImdbRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.imdb().getMovie(
            "movieId",
            GetMovieImdbRequest
                .builder()
                .build()
        );
    }
}