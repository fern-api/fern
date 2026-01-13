package com.snippets;

import com.seed.deepCursorPath.SeedDeepCursorPathClient;
import com.seed.deepCursorPath.resources.deepcursorpath.types.IndirectionRequired;
import com.seed.deepCursorPath.resources.deepcursorpath.types.MainRequired;
import java.util.Arrays;

public class Example1 {
    public static void main(String[] args) {
        SeedDeepCursorPathClient client = SeedDeepCursorPathClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.deepCursorPath().doThingRequired(
            MainRequired
                .builder()
                .indirection(
                    IndirectionRequired
                        .builder()
                        .results(
                            Arrays.asList("results", "results")
                        )
                        .startingAfter("starting_after")
                        .build()
                )
                .build()
        );
    }
}