package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.imdb.requests.GetMovieImdbRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.imdb().getMovie("movieId", GetMovieImdbRequest.builder().build());
    }
}
