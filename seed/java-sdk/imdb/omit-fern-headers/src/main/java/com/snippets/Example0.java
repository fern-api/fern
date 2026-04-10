package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.imdb.requests.CreateMovieRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.imdb()
                .createmovie(
                        CreateMovieRequest.builder().title("title").rating(1.1).build());
    }
}
