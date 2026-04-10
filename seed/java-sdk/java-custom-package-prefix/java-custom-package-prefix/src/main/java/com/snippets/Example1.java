package com.snippets;

import com.customprefix.SeedApiClient;
import com.customprefix.resources.imdb.requests.CreateMovieRequest;

public class Example1 {
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
