package com.snippets;

import com.seed.trace.SeedTraceClient;
import java.util.ArrayList;
import java.util.Arrays;

public class Example10 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.homepage().setHomepageProblems(
            new ArrayList<String>(
                Arrays.asList("string", "string")
            )
        );
    }
}