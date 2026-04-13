package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.ImdbGetMovieRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.imdb().getmovie("movieId", ImdbGetMovieRequest.builder().build());
    }
}
