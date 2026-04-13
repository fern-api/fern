package com.snippets;

import com.customprefix.SeedApiClient;
import com.customprefix.resources.imdb.requests.ImdbGetMovieRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.imdb().getmovie("movieId", ImdbGetMovieRequest.builder().build());
    }
}
