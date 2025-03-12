package com.snippets;

import com.seed.exhaustive.Best;
import java.util.ArrayList;
import java.util.Arrays;

public class Example0 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnListOfPrimitives(
            new ArrayList<String>(
                Arrays.asList("string", "string")
            )
        );
    }
}