package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.types.types.Movie;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Example15 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .createMovie(Movie.builder()
                        .id("movie-c06a4ad7")
                        .title("The Boy and the Heron")
                        .from("Hayao Miyazaki")
                        .rating(8.0)
                        .tag("tag-wf9as23d")
                        .revenue(1000000L)
                        .prequel("movie-cv9b914f")
                        .metadata(new HashMap<String, Object>() {
                            {
                                put(
                                        "actors",
                                        new ArrayList<Object>(
                                                Arrays.asList("Christian Bale", "Florence Pugh", "Willem Dafoe")));
                                put("releaseDate", "2023-12-08");
                                put("ratings", new HashMap<String, Object>() {
                                    {
                                        put("rottenTomatoes", 97);
                                        put("imdb", 7.6);
                                    }
                                });
                            }
                        })
                        .build());
    }
}
