package com.snippets;

import com.seed.trace.SeedTraceClient;

public class Example9 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.homepage().getHomepageProblems();
    }
}