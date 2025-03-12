package com.snippets;

import com.seed.trace.SeedTraceClient;

public class Example34 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.v2().problem().getProblemVersion("problemId", 1);
    }
}