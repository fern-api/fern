package com.snippets;

import com.seed.trace.SeedTraceClient;

public class Example33 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.v2().problem().getLatestProblem("problemId");
    }
}