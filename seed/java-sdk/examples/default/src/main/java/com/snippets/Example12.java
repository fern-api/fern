package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.Movie;
import com.seed.api.types.MovieType;
import java.util.HashMap;

public class Example12 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .createmovie(Movie.builder()
                        .id("id")
                        .title("title")
                        .from("from")
                        .rating(1.1)
                        .type(MovieType.MOVIE)
                        .tag("tag")
                        .revenue(1000000L)
                        .prequel("prequel")
                        .book("book")
                        .metadata(new HashMap<String, Object>() {
                            {
                                put("metadata", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
                            }
                        })
                        .build());
    }
}
