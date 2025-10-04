package com.snippets;

import com.seed.trace.SeedTraceClient;

public class Example36 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.v2().problem().getLatestProblem("problemId");
    }
}
