package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.types.types.Movie;
import java.util.HashMap;

public class Example15 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().createMovie(
            Movie
                .builder()
                .id("id")
                .title("title")
                .from("from")
                .rating(1.1)
                .type("movie")
                .tag("tag")
                .metadata(
                    new HashMap<String, Object>() {{
                        put("metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .revenue(1000000L)
                .prequel("prequel")
                .book("book")
                .build()
        );
    }
}